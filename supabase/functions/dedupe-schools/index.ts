import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin, AuthError } from "../_shared/adminAuth.ts";
import {
  buildGroups,
  completeness,
  isEmpty,
  rankGroup,
  CHILD_TABLES,
  MERGEABLE_COLUMNS,
  type SchoolRow,
} from "./matching.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Supa = ReturnType<typeof createClient>;

const describe = (r: SchoolRow) => ({
  id: r.id,
  name: r.name,
  location: [r.city, r.state].filter(Boolean).join(", "),
  completeness: completeness(r),
});

function summarize(group: { key: string; reason: string; rows: SchoolRow[] }) {
  const [winner, ...losers] = rankGroup(group.rows);
  return {
    key: group.key,
    reason: group.reason,
    winner: describe(winner),
    losers: losers.map(describe),
    fieldsGained: MERGEABLE_COLUMNS.filter(
      (col) => isEmpty(winner[col]) && losers.some((l) => !isEmpty(l[col])),
    ),
  };
}

/** Fold every loser into the winner, repoint references, delete the leftovers. */
async function mergeGroup(supabase: Supa, winner: SchoolRow, losers: SchoolRow[]) {
  const loserIds = losers.map((l) => l.id);
  const donors = [...losers].sort((a, b) => completeness(b) - completeness(a));

  // 1. Absorb any field the winner is missing, richest donor first.
  const update: Record<string, unknown> = {};
  for (const col of MERGEABLE_COLUMNS) {
    if (!isEmpty(winner[col])) continue;
    const donor = donors.find((l) => !isEmpty(l[col]));
    if (donor) update[col] = donor[col];
  }

  // 2. Merge provenance, keeping the winner's own entries authoritative.
  const mergedSources: Record<string, unknown> = {};
  for (const l of [...donors].reverse()) {
    if (l.field_sources && typeof l.field_sources === "object") {
      Object.assign(mergedSources, l.field_sources);
    }
  }
  if (winner.field_sources && typeof winner.field_sources === "object") {
    Object.assign(mergedSources, winner.field_sources);
  }
  if (Object.keys(mergedSources).length > 0) update.field_sources = mergedSources;

  // Keep the strongest verification state in the surviving row.
  const rank = (s?: string | null) => (s === "verified" ? 3 : s === "partial" ? 2 : 1);
  const all = [winner, ...losers];
  const bestStatus = all.reduce((a, b) =>
    rank(b.verification_status) > rank(a.verification_status) ? b : a
  );
  if (rank(bestStatus.verification_status) > rank(winner.verification_status)) {
    update.verification_status = bestStatus.verification_status;
  }
  const maxConf = Math.max(...all.map((r) => Number(r.data_confidence) || 0));
  if (maxConf > (Number(winner.data_confidence) || 0)) update.data_confidence = maxConf;

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from("schools").update(update).eq("id", winner.id);
    if (error) throw new Error(`update winner: ${error.message}`);
  }

  // 3. Repoint every loose child reference at the surviving school.
  let relinked = 0;
  for (const table of CHILD_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .update({ school_id: winner.id })
      .in("school_id", loserIds)
      .select("id");
    if (error) {
      console.error(`relink ${table} failed:`, error.message);
      continue;
    }
    relinked += data?.length ?? 0;
  }

  // 4. Drop the now-redundant rows.
  const { error: dErr } = await supabase.from("schools").delete().in("id", loserIds);
  if (dErr) throw new Error(`delete losers: ${dErr.message}`);

  return { relinked, deleted: loserIds.length };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const apply: boolean = body.apply === true;
    const suggestThreshold: number =
      typeof body.suggestThreshold === "number" ? body.suggestThreshold : 0.5;
    // Admin-approved borderline merges: [{ winnerId, loserIds: [...] }]
    const approve: { winnerId: string; loserIds: string[] }[] = Array.isArray(body.approve)
      ? body.approve
      : [];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Page through every school (the table exceeds one PostgREST page).
    const rows: SchoolRow[] = [];
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .order("created_at", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) throw new Error(error.message);
      rows.push(...((data ?? []) as SchoolRow[]));
      if (!data || data.length < pageSize) break;
    }

    const { groups, suggestions, review } = buildGroups(rows, suggestThreshold);

    // ---------- preview ----------
    if (!apply) {
      return new Response(
        JSON.stringify({
          success: true,
          mode: "preview",
          totalSchools: rows.length,
          autoGroupCount: groups.length,
          autoDeleteCount: groups.reduce((s, g) => s + g.rows.length - 1, 0),
          plan: groups.map(summarize),
          suggestions: suggestions.map(summarize),
          needsReview: review,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---------- apply ----------
    const byId = new Map(rows.map((r) => [r.id, r]));
    const jobs: { key: string; winner: SchoolRow; losers: SchoolRow[] }[] = [];

    for (const g of groups) {
      const [winner, ...losers] = rankGroup(g.rows);
      if (losers.length) jobs.push({ key: g.key, winner, losers });
    }
    for (const a of approve) {
      const winner = byId.get(a.winnerId);
      const losers = (a.loserIds ?? []).map((id) => byId.get(id)).filter(Boolean) as SchoolRow[];
      if (winner && losers.length) jobs.push({ key: `approved:${winner.name}`, winner, losers });
    }

    let merged = 0;
    let deleted = 0;
    let relinked = 0;
    const errors: { key: string; error: string }[] = [];

    for (const job of jobs) {
      try {
        const res = await mergeGroup(supabase, job.winner, job.losers);
        merged++;
        deleted += res.deleted;
        relinked += res.relinked;
      } catch (e) {
        errors.push({ key: job.key, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode: "apply",
        groupsMerged: merged,
        schoolsDeleted: deleted,
        referencesRelinked: relinked,
        remainingSuggestions: suggestions.length - approve.length,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("dedupe-schools error:", message);
    const status = error instanceof AuthError ? error.status : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
