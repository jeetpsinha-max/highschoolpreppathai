import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin, AuthError } from "../_shared/adminAuth.ts";

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

  // Strip trailing slash from path. Use a local var — assigning u.pathname = ""
  // makes the URL object normalize it back to "/".
  const path = u.pathname.replace(/\/+$/, "");

  const domainKey = host.replace(/^www\./, "");

  // Rebuild without an empty "?".
  let out = `${u.protocol}//${u.hostname}${path}`;
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

// ---------- Location normalization ----------

// Canonical US state -> 2-letter code (covers full names + common variants).
const STATE_MAP: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", "district of columbia": "DC",
  "washington dc": "DC", "washington d.c.": "DC", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI",
  wyoming: "WY", "puerto rico": "PR", guam: "GU", "virgin islands": "VI",
};

const VALID_CODES = new Set(Object.values(STATE_MAP));

/** Normalize a state value to a canonical 2-letter uppercase code, or null if unknown. */
function normalizeState(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).trim().replace(/\s+/g, " ");
  if (!s) return null;
  const upper = s.toUpperCase();
  if (upper.length === 2 && VALID_CODES.has(upper)) return upper;
  const mapped = STATE_MAP[s.toLowerCase().replace(/\./g, "")];
  return mapped ?? null;
}

// Small connector words kept lowercase when not the first token.
const SMALL_WORDS = new Set(["of", "the", "and", "on", "by", "del", "de", "la", "le"]);

function capPart(p: string): string {
  if (!p) return p;
  const lower = p.toLowerCase();
  // Mc / Mac names: McLean, MacArthur
  if (/^mc[a-z]/.test(lower)) return "Mc" + lower.charAt(2).toUpperCase() + lower.slice(3);
  if (/^o'[a-z]/.test(lower)) return "O'" + lower.charAt(2).toUpperCase() + lower.slice(3);
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Trim, collapse whitespace, and title-case a city while preserving St./Mc/hyphens/apostrophes. */
function normalizeCity(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = String(raw).trim().replace(/\s+/g, " ");
  if (!s) return null;
  // Drop a trailing ", ST" or ", State" that sometimes leaks into the city field.
  s = s.replace(/,\s*[A-Za-z. ]+$/, "").trim();
  if (!s) return null;

  const words = s.split(" ");
  return words
    .map((word, idx) => {
      const lower = word.toLowerCase().replace(/\./g, "");
      if (idx > 0 && SMALL_WORDS.has(lower)) return lower;
      // Preserve "St." / "Mt." / "Ft." with the period.
      if (["st", "mt", "ft"].includes(lower)) {
        return lower.charAt(0).toUpperCase() + lower.slice(1) + ".";
      }
      return word.split("-").map(capPart).join("-");
    })
    .join(" ");
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
    const normalizeLocation: boolean = body.normalizeLocation ?? true;
    if (!schoolId) throw new Error("schoolId is required");

    const { data: school, error: schoolErr } = await supabase
      .from("schools")
      .select("id,name,city,state,website,field_sources")
      .eq("id", schoolId)
      .single();
    if (schoolErr || !school) throw new Error("School not found");

    // Shared accumulators applied in a single DB write at the end.
    const update: Record<string, unknown> = {};
    const fieldSources = (school.field_sources as Record<string, unknown>) ?? {};
    const auditRows: Record<string, unknown>[] = [];
    const locationChanges: { field: string; from: string | null; to: string | null }[] = [];

    // ----- Location normalization (independent of website outcome) -----
    if (normalizeLocation) {
      const normCity = normalizeCity(school.city);
      const normState = normalizeState(school.state);

      if (normCity !== null && normCity !== school.city) {
        update.city = normCity;
        fieldSources.city = {
          value: normCity,
          source: "Location normalization",
          source_url: null,
          confidence: 90,
          verified_at: new Date().toISOString(),
        };
        auditRows.push({
          school_id: school.id, field: "city",
          old_value: school.city, new_value: normCity,
          source: "Location normalization", source_url: null, confidence: 90, changed: true,
        });
        locationChanges.push({ field: "city", from: school.city, to: normCity });
      }

      // Only overwrite state if we mapped to a confident, different canonical code.
      if (normState !== null && normState !== school.state) {
        update.state = normState;
        fieldSources.state = {
          value: normState,
          source: "Location normalization",
          source_url: null,
          confidence: 95,
          verified_at: new Date().toISOString(),
        };
        auditRows.push({
          school_id: school.id, field: "state",
          old_value: school.state, new_value: normState,
          source: "Location normalization", source_url: null, confidence: 95, changed: true,
        });
        locationChanges.push({ field: "state", from: school.state, to: normState });
      }
    }

    const original = school.website;
    const canon = canonicalize(original);

    let outcome: string;
    let finalCanonical: string | null = null;
    let reachable = false;
    let statusCode: number | null = null;

    if (!canon) {
      // Junk / unparseable website.
      if (original && clearInvalid) {
        update.website = null;
        auditRows.push({
          school_id: school.id, field: "website",
          old_value: original, new_value: null,
          source: "URL cleaning", source_url: null, confidence: 100, changed: true,
        });
        outcome = "cleared_invalid";
      } else {
        outcome = original ? "invalid" : "empty";
      }
    } else {
      finalCanonical = canon.canonical;
      if (resolve) {
        const r = await resolveRedirects(canon.canonical);
        reachable = r.reachable;
        statusCode = r.status;
        if (r.finalUrl) {
          const reCanon = canonicalize(r.finalUrl);
          if (reCanon) finalCanonical = reCanon.canonical;
        }
      }

      if ((original ?? "") !== finalCanonical) {
        const src = reachable
          ? "URL cleaning (redirect-resolved)"
          : "URL cleaning (canonicalized)";
        const conf = reachable ? 95 : 80;
        update.website = finalCanonical;
        fieldSources.website = {
          value: finalCanonical, source: src, source_url: finalCanonical,
          confidence: conf, verified_at: new Date().toISOString(),
        };
        auditRows.push({
          school_id: school.id, field: "website",
          old_value: original, new_value: finalCanonical,
          source: src, source_url: finalCanonical, confidence: conf, changed: true,
        });
        outcome = "cleaned";
      } else {
        outcome = "already_clean";
      }
    }

    const websiteChanged = "website" in update;
    // Persist field_sources whenever any provenance entry was added.
    if (websiteChanged || locationChanges.length > 0) update.field_sources = fieldSources;

    const changed = Object.keys(update).length > 0;
    if (changed) {
      const { error: updErr } = await supabase.from("schools").update(update).eq("id", school.id);
      if (updErr) throw new Error(`Failed to update school: ${updErr.message}`);
    }
    if (auditRows.length) {
      const { error: auditErr } = await supabase.from("school_data_audit").insert(auditRows);
      if (auditErr) console.error("Audit insert failed", auditErr.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        name: school.name,
        outcome,
        original,
        canonical: finalCanonical,
        reachable,
        statusCode,
        locationChanges,
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
