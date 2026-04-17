import type { School } from "@/types/school";
import { calculateOverallGrade, gradeToRank } from "@/lib/grading";

export interface UserPrefsLike {
  target_states?: string[] | null;
  boarding_preference?: string | null;
  interests?: string[] | null;
  priorities?: string[] | null;
  budget_range?: string | null;
  onboarding_completed?: boolean | null;
}

export interface PersonalizationMatch {
  score: number;
  reasons: string[];
  isMatch: boolean; // true if score above threshold
}

/**
 * Score a school against user preferences. Returns a 0-100ish score
 * and the reasons that contributed (used for "For You" badges).
 */
export function scoreSchoolForUser(
  school: School,
  prefs?: UserPrefsLike | null
): PersonalizationMatch {
  if (!prefs?.onboarding_completed) {
    return { score: 0, reasons: [], isMatch: false };
  }

  let score = 0;
  const reasons: string[] = [];

  if (prefs.target_states?.length && school.state && prefs.target_states.includes(school.state)) {
    score += 30;
    reasons.push(`In your target state (${school.state})`);
  }

  if (prefs.boarding_preference === "boarding_only" && school.boarding) {
    score += 20;
    reasons.push("Boarding school");
  }
  if (prefs.boarding_preference === "day_only" && !school.boarding) {
    score += 20;
    reasons.push("Day school");
  }

  if (prefs.interests?.includes("Athletics") && gradeToRank(school.sports_grade) <= 4) {
    score += 15;
    reasons.push("Strong athletics");
  }
  if (prefs.interests?.includes("Arts") && gradeToRank(school.arts_grade) <= 4) {
    score += 15;
    reasons.push("Great arts");
  }
  if (prefs.interests?.includes("STEM") && school.notes?.includes("STEM")) {
    score += 15;
    reasons.push("STEM focus");
  }
  if (prefs.interests?.includes("Academics") && gradeToRank(school.academics_grade) <= 3) {
    score += 15;
    reasons.push("Top academics");
  }

  if (prefs.priorities?.includes("Strong academics") && gradeToRank(school.academics_grade) <= 3) {
    score += 10;
  }
  if (prefs.priorities?.includes("Campus life") && gradeToRank(school.campus_grade) <= 4) {
    score += 10;
  }
  if (prefs.priorities?.includes("College placement") && gradeToRank(school.college_prep_grade) <= 3) {
    score += 10;
  }

  // Budget filter (subtractive)
  if (prefs.budget_range && school.tuition != null) {
    const t = school.tuition;
    const budget = prefs.budget_range;
    const overBudget =
      (budget === "under_20k" && t > 20000) ||
      (budget === "20k_40k" && t > 40000) ||
      (budget === "40k_60k" && t > 60000);
    if (overBudget) score -= 20;
    else if (t > 0) {
      reasons.push("Within your budget");
      score += 5;
    }
  }

  const overall = calculateOverallGrade(school);
  const qualityScore = Math.max(0, 14 - gradeToRank(overall));
  score += qualityScore;

  return {
    score,
    reasons,
    isMatch: score >= 35 && reasons.length >= 1,
  };
}
