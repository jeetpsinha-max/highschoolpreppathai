/**
 * Authoritative school grading model (v2).
 *
 * This file is the single source of truth for how a school's overall rating is
 * produced. It is imported both by the `recompute-grades` edge function (which
 * persists the results) and by the frontend in `src/lib/grading.ts`, so it must
 * stay free of any Deno-, Node- or browser-specific imports.
 *
 * ## Why v2 replaced the old model
 *
 * v1 took a flat, unweighted average of the category letter grades. That
 * treated "Clubs" as being exactly as important as "Academics", and because the
 * underlying letters were generated optimistically it produced severe grade
 * inflation: ~65% of schools carried an A in academics and not one school
 * scored below a C. A rating where almost everyone is excellent tells a
 * student nothing.
 *
 * v2 fixes both problems:
 *
 *  1. **Weighting** — categories contribute according to how much they actually
 *     matter when choosing a school (see `CATEGORY_WEIGHTS`).
 *  2. **A hard-data signal** — selectivity is derived from the real
 *     `acceptance_rate` column rather than from a generated letter, so part of
 *     every score is anchored to a fact.
 *  3. **Curving** — the weighted composite is ranked against every other school
 *     and the letter is assigned by percentile (see `CURVE`). Grades are
 *     therefore comparative and spread across the whole A–F range.
 */

export type LetterGrade =
  | "A+" | "A" | "A-"
  | "B+" | "B" | "B-"
  | "C+" | "C" | "C-"
  | "D+" | "D" | "D-"
  | "F";

export const GRADE_OPTIONS: LetterGrade[] = [
  "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F",
];

export type GradeCategory =
  | "academics"
  | "college_prep"
  | "faculty"
  | "facilities"
  | "campus"
  | "sports"
  | "arts"
  | "clubs"
  | "diversity"
  | "dorms";

/** Points a letter grade is worth on the internal 0-100 scale. */
export const GRADE_POINTS: Record<LetterGrade, number> = {
  "A+": 100, "A": 95, "A-": 90,
  "B+": 85, "B": 80, "B-": 75,
  "C+": 70, "C": 65, "C-": 60,
  "D+": 55, "D": 50, "D-": 45,
  "F": 40,
};

/**
 * Relative importance of each input. `selectivity` is not a letter-graded
 * category — it is computed from `acceptance_rate`.
 *
 * `dorms` only applies to boarding schools; for day schools its weight is
 * dropped and the remaining weights are renormalized, so a day school is never
 * penalised for having no dormitories.
 */
export const CATEGORY_WEIGHTS: Record<GradeCategory | "selectivity", number> = {
  academics: 20,
  college_prep: 15,
  selectivity: 10,
  faculty: 11,
  facilities: 9,
  sports: 9,
  campus: 7,
  arts: 7,
  clubs: 6,
  diversity: 6,
  dorms: 8, // boarding schools only
};

/** Column on `schools` backing each letter-graded category. */
export const CATEGORY_FIELDS: Record<GradeCategory, string> = {
  academics: "academics_grade",
  college_prep: "college_prep_grade",
  faculty: "faculty_grade",
  facilities: "facilities_grade",
  campus: "campus_grade",
  sports: "sports_grade",
  arts: "arts_grade",
  clubs: "clubs_grade",
  diversity: "diversity_grade",
  dorms: "dorms_grade",
};

export const CATEGORY_LABELS: Record<GradeCategory | "selectivity", string> = {
  academics: "Academics",
  college_prep: "College Prep",
  selectivity: "Selectivity",
  faculty: "Faculty",
  facilities: "Facilities",
  campus: "Campus",
  sports: "Sports",
  arts: "Arts",
  clubs: "Clubs",
  diversity: "Diversity",
  dorms: "Dorms",
};

/** Current model version, persisted to `schools.grading_version`. */
export const GRADING_VERSION = 2;

export function letterToPoints(grade: unknown): number | null {
  if (typeof grade !== "string") return null;
  const g = grade.trim().toUpperCase();
  if (!g || g === "N/A" || g === "-") return null;
  return GRADE_POINTS[g as LetterGrade] ?? null;
}

/**
 * Turn a published acceptance rate (0-100) into a 0-100 selectivity score.
 * Monotonic and roughly linear across the real data range (3%-89%): a 5%
 * acceptance rate scores ~97, a 50% rate scores ~66, and a 90% rate scores ~39.
 */
export function selectivityScore(acceptanceRate: unknown): number | null {
  const rate = Number(acceptanceRate);
  if (!Number.isFinite(rate) || rate <= 0 || rate > 100) return null;
  return Math.max(35, Math.min(100, 100 - 0.68 * rate));
}

export interface ScoreBreakdownPart {
  key: GradeCategory | "selectivity";
  label: string;
  points: number;
  weight: number;
}

export interface CompositeResult {
  /** Weighted 0-100 composite, or null when there is nothing to score. */
  score: number | null;
  /** Share (0-1) of the model's weight that was backed by real data. */
  coverage: number;
  breakdown: ScoreBreakdownPart[];
}

export interface GradableSchool {
  boarding?: boolean | null;
  acceptance_rate?: number | string | null;
  [key: string]: unknown;
}

/**
 * Weighted composite for a single school.
 *
 * Missing inputs are excluded rather than treated as zero, and the weights of
 * whatever remains are renormalized — so a school with sparse data is scored
 * fairly on what is known, while `coverage` records how much was actually
 * available.
 */
export function computeComposite(school: GradableSchool): CompositeResult {
  const breakdown: ScoreBreakdownPart[] = [];

  // Dorms only count for boarding schools.
  const categories = (Object.keys(CATEGORY_FIELDS) as GradeCategory[]).filter(
    (c) => c !== "dorms" || school.boarding === true,
  );

  let applicableWeight = 0;

  for (const key of categories) {
    const weight = CATEGORY_WEIGHTS[key];
    applicableWeight += weight;
    const points = letterToPoints(school[CATEGORY_FIELDS[key]]);
    if (points === null) continue;
    breakdown.push({ key, label: CATEGORY_LABELS[key], points, weight });
  }

  const selWeight = CATEGORY_WEIGHTS.selectivity;
  applicableWeight += selWeight;
  const sel = selectivityScore(school.acceptance_rate);
  if (sel !== null) {
    breakdown.push({
      key: "selectivity",
      label: CATEGORY_LABELS.selectivity,
      points: sel,
      weight: selWeight,
    });
  }

  const presentWeight = breakdown.reduce((s, p) => s + p.weight, 0);
  if (presentWeight === 0) return { score: null, coverage: 0, breakdown };

  const weighted = breakdown.reduce((s, p) => s + p.points * p.weight, 0) / presentWeight;

  return {
    score: Math.round(weighted * 100) / 100,
    coverage: applicableWeight === 0 ? 0 : presentWeight / applicableWeight,
    breakdown,
  };
}

/**
 * Target grade distribution, as cumulative share from the top.
 *
 * Deliberately shaped like a real academic curve so the rating discriminates:
 * an A means genuinely top-tier, and the middle of the range is where most
 * schools land.
 */
export const CURVE: { grade: LetterGrade; cumulative: number }[] = [
  { grade: "A+", cumulative: 0.02 },
  { grade: "A", cumulative: 0.08 },
  { grade: "A-", cumulative: 0.16 },
  { grade: "B+", cumulative: 0.28 },
  { grade: "B", cumulative: 0.43 },
  { grade: "B-", cumulative: 0.57 },
  { grade: "C+", cumulative: 0.70 },
  { grade: "C", cumulative: 0.82 },
  { grade: "C-", cumulative: 0.90 },
  { grade: "D+", cumulative: 0.95 },
  { grade: "D", cumulative: 0.98 },
  { grade: "D-", cumulative: 0.995 },
  { grade: "F", cumulative: 1 },
];

/**
 * Map a top-down rank fraction (0 = best school, 1 = worst) to a letter.
 */
export function rankFractionToGrade(fraction: number): LetterGrade {
  const f = Math.max(0, Math.min(1, fraction));
  for (const band of CURVE) {
    if (f <= band.cumulative) return band.grade;
  }
  return "F";
}

export interface GradedSchool {
  id: string;
  overall_score: number;
  overall_grade: LetterGrade;
  grade_percentile: number;
  grade_coverage: number;
}

/**
 * Score a whole population and curve it.
 *
 * Ties share the same rank fraction, so two schools with an identical composite
 * can never receive different letters.
 */
export function gradePopulation(
  schools: (GradableSchool & { id: string })[],
): { graded: GradedSchool[]; ungraded: string[] } {
  const scored: { id: string; score: number; coverage: number }[] = [];
  const ungraded: string[] = [];

  for (const s of schools) {
    const { score, coverage } = computeComposite(s);
    if (score === null) ungraded.push(s.id);
    else scored.push({ id: s.id, score, coverage });
  }

  // Best first.
  scored.sort((a, b) => b.score - a.score);

  const n = scored.length;
  // Rank fraction of the first row holding each distinct score, so ties match.
  const firstIndexOfScore = new Map<number, number>();
  scored.forEach((s, i) => {
    if (!firstIndexOfScore.has(s.score)) firstIndexOfScore.set(s.score, i);
  });

  const graded = scored.map((s) => {
    const idx = firstIndexOfScore.get(s.score)!;
    const fraction = n <= 1 ? 0 : idx / (n - 1);
    return {
      id: s.id,
      overall_score: s.score,
      overall_grade: rankFractionToGrade(fraction),
      grade_percentile: Math.round((1 - fraction) * 1000) / 10,
      grade_coverage: Math.round(s.coverage * 1000) / 1000,
    };
  });

  return { graded, ungraded };
}
