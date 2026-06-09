import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tracking / session params that never belong in a canonical URL.
const TRACKING_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "fbclid", "gclid", "gbraid", "wbraid", "msclkid", "mc_cid", "mc_eid",
  "ref", "ref_src", "source", "_ga", "_gl", "yclid", "igshid",
];

// Obvious junk placeholders that should never be stored as a website.
const JUNK_VALUES = new Set([
  "invalid_url", "n/a", "na", "none", "null", "unknown", "tbd", "-", "#",
  "http://", "https://", "http://invalid_url", "https://invalid_url",
]);

interface CanonResult {
  /** Fully canonical URL for storage/display, e.g. https://www.school.org/path */
  canonical: string;
  /** Bare host used for duplicate detection, www-stripped + lowercased, e.g. school.org */
  domainKey: string;
}

/**
 * Canonicalize a raw website value:
 * - force https
 * - lowercase host, drop default ports
 * - strip tracking params + hash
 * - remove trailing slash
 */
function canonicalize(raw: string | null | undefined): CanonResult | null {
  if (!raw) return null;
  let s = String(raw).trim();
  if (!s) return null;
  if (JUNK_VALUES.has(s.toLowerCase())) return null;

  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;

  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }

  // Host must look like a real domain (contains a dot, no spaces).
  const host = u.hostname.toLowerCase();
  if (!host.includes(".") || /\s/.test(host)) return null;

  u.protocol = "https:";
  u.hostname = host;
  u.port = "";
  u.hash = "";

  for (const p of TRACKING_PARAMS) u.searchParams.delete(p);

  // Strip trailing slash from path (but keep root as "/").
  u.pathname = u.pathname.replace(/\/+$/, "");

  const domainKey = host.replace(/^www\./, "");

  // Rebuild without an empty "?".
  let out = `${u.protocol}//${u.hostname}${u.pathname}`;
  const qs = u.searchParams.toString();
  if (qs) out += `?${qs}`;

  return { canonical: out, domainKey };
}

/** Follow redirects to discover the real, final URL the site resolves to. */
async function resolveRedirects(
  url: string,
): Promise<{ finalUrl: string | null; status: number | null; reachable: boolean }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SchoolDirectoryBot/1.0; +https://highschoolpreppathai.lovable.app)",
      },
    });
    clearTimeout(timeout);
    return { finalUrl: res.url || url, status: res.status, reachable: res.ok };
  } catch (_e) {
    clearTimeout(timeout);
    // Retry once with HTTP HEAD for sites that reject GET bots.
    try {
      const controller2 = new AbortController();
      const t2 = setTimeout(() => controller2.abort(), 6000);
      const res2 = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller2.signal,
      });
      clearTimeout(t2);
      return { finalUrl: res2.url || url, status: res2.status, reachable: res2.ok };
    } catch {
      return { finalUrl: null, status: null, reachable: false };
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const action: string = body.action ?? "clean";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ---------- ACTION: scan duplicates across the whole directory ----------
    if (action === "scan-duplicates") {
      const { data: rows, error } = await supabase
        .from("schools")
        .select("id,name,city,state,website,verification_status")
        .not("website", "is", null);
      if (error) throw new Error(error.message);

      const groups = new Map<string, typeof rows>();
      for (const r of rows ?? []) {
        const c = canonicalize(r.website);
        if (!c) continue;
        const arr = groups.get(c.domainKey) ?? [];
        arr.push(r);
        groups.set(c.domainKey, arr);
      }

      const duplicates = [...groups.entries()]
        .filter(([, arr]) => arr.length > 1)
        .map(([domainKey, schools]) => ({
          domainKey,
          count: schools.length,
          schools: schools.map((s) => ({
            id: s.id,
            name: s.name,
            location: [s.city, s.state].filter(Boolean).join(", "),
            verification_status: s.verification_status,
          })),
        }))
        .sort((a, b) => b.count - a.count);

      return new Response(
        JSON.stringify({ success: true, groupCount: duplicates.length, duplicates }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ---------- ACTION: clean a single school's URL ----------
    const schoolId: string | undefined = body.schoolId;
    const resolve: boolean = body.resolveRedirects ?? true;
    const clearInvalid: boolean = body.clearInvalid ?? true;
    if (!schoolId) throw new Error("schoolId is required");

    const { data: school, error: schoolErr } = await supabase
      .from("schools")
      .select("id,name,website,field_sources")
      .eq("id", schoolId)
      .single();
    if (schoolErr || !school) throw new Error("School not found");

    const original = school.website;
    const canon = canonicalize(original);

    // Junk / unparseable website.
    if (!canon) {
      if (original && clearInvalid) {
        await supabase.from("schools").update({ website: null }).eq("id", school.id);
        await supabase.from("school_data_audit").insert({
          school_id: school.id,
          field: "website",
          old_value: original,
          new_value: null,
          source: "URL cleaning",
          source_url: null,
          confidence: 100,
          changed: true,
        });
        return new Response(
          JSON.stringify({
            success: true,
            name: school.name,
            outcome: "cleared_invalid",
            original,
            canonical: null,
            changed: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          name: school.name,
          outcome: original ? "invalid" : "empty",
          original,
          canonical: null,
          changed: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let finalCanonical = canon.canonical;
    let reachable = false;
    let statusCode: number | null = null;

    if (resolve) {
      const r = await resolveRedirects(canon.canonical);
      reachable = r.reachable;
      statusCode = r.status;
      if (r.finalUrl) {
        const reCanon = canonicalize(r.finalUrl);
        // Only adopt the redirect target if it canonicalizes cleanly and stays on a real domain.
        if (reCanon) finalCanonical = reCanon.canonical;
      }
    }

    const changed = (original ?? "") !== finalCanonical;

    if (changed) {
      const fieldSources = (school.field_sources as Record<string, unknown>) ?? {};
      fieldSources.website = {
        value: finalCanonical,
        source: reachable ? "URL cleaning (redirect-resolved)" : "URL cleaning (canonicalized)",
        source_url: finalCanonical,
        confidence: reachable ? 95 : 80,
        verified_at: new Date().toISOString(),
      };

      await supabase
        .from("schools")
        .update({ website: finalCanonical, field_sources: fieldSources })
        .eq("id", school.id);

      await supabase.from("school_data_audit").insert({
        school_id: school.id,
        field: "website",
        old_value: original,
        new_value: finalCanonical,
        source: reachable ? "URL cleaning (redirect-resolved)" : "URL cleaning (canonicalized)",
        source_url: finalCanonical,
        confidence: reachable ? 95 : 80,
        changed: true,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        name: school.name,
        outcome: changed ? "cleaned" : "already_clean",
        original,
        canonical: finalCanonical,
        reachable,
        statusCode,
        changed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("clean-school-urls error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
