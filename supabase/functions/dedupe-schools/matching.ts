/**
 * Pure duplicate-matching logic for `dedupe-schools`.
 *
 * Kept free of Deno/Supabase imports so it can be exercised directly against a
 * snapshot of production data before any destructive merge is run.
 */

/** Child tables holding a loose `school_id` reference (no FK constraints exist). */
export const CHILD_TABLES = [
  "saved_schools",
  "application_checklists",
  "documents",
  "essays",
  "interview_sessions",
  "enhanced_school_grades",
  "school_data_audit",
] as const;

/** Columns copied from a loser into the winner when the winner's value is empty. */
export const MERGEABLE_COLUMNS = [
  "type", "city", "state", "website", "admission_type", "boarding",
  "competitiveness", "size", "notes", "image_url", "tuition",
  "acceptance_rate", "enrollment", "founded_year", "verification_notes",
  "sports_grade", "academics_grade", "campus_grade", "dorms_grade", "arts_grade",
  "clubs_grade", "diversity_grade", "college_prep_grade", "facilities_grade", "faculty_grade",
] as const;

export interface SchoolRow {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  website?: string | null;
  verification_status?: string | null;
  data_confidence?: number | null;
  field_sources?: Record<string, unknown> | null;
  created_at?: string;
  [key: string]: unknown;
}

// ---------- normalization ----------

export function domainKey(website: string | null | undefined): string | null {
  if (!website) return null;
  let s = String(website).trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const host = new URL(s).hostname.toLowerCase().replace(/^www\./, "");
    // Reject junk placeholders like "invalid_url" that carry no real host.
    return host.includes(".") ? host : null;
  } catch {
    return null;
  }
}

/**
 * Lowercase, drop parenthetical disambiguators, punctuation and a leading
 * "the", then collapse whitespace. Imports often append "(NYC)" or
 * "(Los Angeles)" to an otherwise identical name, so those are noise.
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/^\s*the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Generic words that carry no disambiguating power in a school name. */
const STOPWORDS = new Set([
  "school", "schools", "academy", "the", "of", "and", "saint", "st",
  "high", "prep", "preparatory", "college", "institute", "center", "campus",
]);

/**
 * Spelling variants that refer to the same thing. Only genuine
 * abbreviation/spelling pairs belong here — never words that distinguish one
 * campus from another.
 */
const SYNONYMS: Record<string, string> = {
  mathematics: "math", maths: "math",
  sciences: "science",
  laboratory: "lab", laboratories: "lab",
  technology: "tech",
  international: "intl",
  junior: "jr", senior: "sr",
  incorporated: "inc",
  university: "univ",
};

export function tokens(name: string): Set<string> {
  return new Set(
    normalizeName(name)
      .split(" ")
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
      .map((w) => SYNONYMS[w] ?? w),
  );
}

/** Jaccard overlap of significant tokens (0..1). 1 means the sets are equal. */
export function nameSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) {
    return normalizeName(a) === normalizeName(b) ? 1 : 0;
  }
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / new Set([...ta, ...tb]).size;
}


export function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

/** How much real data a row carries — used to pick the record we keep. */
export function completeness(r: SchoolRow): number {
  let score = 0;
  for (const c of MERGEABLE_COLUMNS) if (!isEmpty(r[c])) score++;
  if (r.verification_status === "verified") score += 6;
  else if (r.verification_status === "partial") score += 3;
  score += Math.round((Number(r.data_confidence) || 0) / 25);
  const fs = r.field_sources;
  if (fs && typeof fs === "object") score += Math.min(Object.keys(fs).length, 8);
  return score;
}

/** Richest row wins; ties break to the oldest so existing links stay stable. */
export function rankGroup(rows: SchoolRow[]): SchoolRow[] {
  return [...rows].sort((a, b) => {
    const diff = completeness(b) - completeness(a);
    if (diff !== 0) return diff;
    return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
  });
}

export interface Group {
  key: string;
  reason: "domain" | "name";
  rows: SchoolRow[];
}

export interface ReviewItem {
  key: string;
  reason: string;
  schools: { id: string; name: string; location: string }[];
}

/**
 * Build merge groups.
 *
 * Pass 1 matches on normalized name + state, which is unambiguous.
 *
 * Pass 2 matches on a shared web domain. A shared host is never enough on its
 * own — district domains such as `asdk12.org` or `ankenyschools.org`
 * legitimately host many distinct schools. So a domain pair is only merged
 * automatically when the states agree AND the significant name tokens are
 * *identical* after synonym folding ("Mathematics" = "Math"). Pairs that merely
 * look similar ("Ankeny High" vs "Ankeny Centennial High") become suggestions
 * for a human to approve, and pairs with no name agreement at all are reported
 * as review items only.
 */
export function buildGroups(
  rows: SchoolRow[],
  suggestThreshold = 0.5,
): { groups: Group[]; suggestions: Group[]; review: ReviewItem[] } {
  const groups: Group[] = [];
  const suggestions: Group[] = [];
  const review: ReviewItem[] = [];
  const claimed = new Set<string>();

  // 1. Exact normalized name + state.
  const byName = new Map<string, SchoolRow[]>();
  for (const r of rows) {
    const n = normalizeName(r.name);
    if (!n) continue;
    const key = `${n}|${(r.state ?? "").trim().toUpperCase()}`;
    byName.set(key, [...(byName.get(key) ?? []), r]);
  }
  for (const [key, arr] of byName) {
    if (arr.length < 2) continue;
    groups.push({ key, reason: "name", rows: arr });
    for (const r of arr) claimed.add(r.id);
  }

  // 2. Shared domain, guarded by name equality + state agreement.
  const byDomain = new Map<string, SchoolRow[]>();
  for (const r of rows) {
    const d = domainKey(r.website);
    if (!d) continue;
    byDomain.set(d, [...(byDomain.get(d) ?? []), r]);
  }

  const stateCompatible = (a: SchoolRow, b: SchoolRow) => {
    const sa = (a.state ?? "").trim().toUpperCase();
    const sb = (b.state ?? "").trim().toUpperCase();
    return !sa || !sb || sa === sb;
  };

  for (const [d, arr] of byDomain) {
    if (arr.length < 2) continue;
    const fresh = arr.filter((r) => !claimed.has(r.id));
    if (fresh.length < 2) continue;

    // 2a. Confident clusters: identical significant tokens.
    const used = new Set<string>();
    for (const seed of fresh) {
      if (used.has(seed.id)) continue;
      const cluster = [seed];
      used.add(seed.id);
      for (const other of fresh) {
        if (used.has(other.id)) continue;
        if (stateCompatible(seed, other) && nameSimilarity(seed.name, other.name) >= 1) {
          cluster.push(other);
          used.add(other.id);
        }
      }
      if (cluster.length > 1) {
        groups.push({ key: d, reason: "domain", rows: cluster });
        for (const r of cluster) claimed.add(r.id);
      }
    }

    // 2b. Near matches on the same domain: propose, never auto-merge.
    const rest = fresh.filter((r) => !claimed.has(r.id));
    const usedS = new Set<string>();
    for (const seed of rest) {
      if (usedS.has(seed.id)) continue;
      const cluster = [seed];
      usedS.add(seed.id);
      for (const other of rest) {
        if (usedS.has(other.id)) continue;
        if (
          stateCompatible(seed, other) &&
          nameSimilarity(seed.name, other.name) >= suggestThreshold
        ) {
          cluster.push(other);
          usedS.add(other.id);
        }
      }
      if (cluster.length > 1) suggestions.push({ key: d, reason: "domain", rows: cluster });
    }

    // 2c. Same domain, names don't agree at all → informational only.
    const leftover = rest.filter((r) => !usedS.has(r.id));
    if (leftover.length > 1) {
      review.push({
        key: d,
        reason: "Shared domain, unrelated school names",
        schools: leftover.map((r) => ({
          id: r.id,
          name: r.name,
          location: [r.city, r.state].filter(Boolean).join(", "),
        })),
      });
    }
  }

  return { groups, suggestions, review };
}

