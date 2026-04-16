import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useSchools } from "@/hooks/useSchools";
import { getOverallGradeColor, calculateOverallGrade, gradeToRank } from "@/lib/grading";
import type { School } from "@/types/school";

export function RecommendedSchools() {
  const { preferences } = useUserPreferences();
  const { data: allSchools } = useSchools();

  const recommended = useMemo(() => {
    if (!allSchools || !preferences?.onboarding_completed) return [];

    return allSchools
      .map((school) => {
        let score = 0;

        // Match by target states
        if (preferences.target_states?.length > 0 && school.state) {
          if (preferences.target_states.includes(school.state)) score += 30;
        }

        // Match by boarding preference
        if (preferences.boarding_preference === "boarding_only" && school.boarding) score += 20;
        if (preferences.boarding_preference === "day_only" && !school.boarding) score += 20;

        // Match by interests
        if (preferences.interests?.includes("Athletics") && gradeToRank(school.sports_grade) <= 4) score += 15;
        if (preferences.interests?.includes("Arts") && gradeToRank(school.arts_grade) <= 4) score += 15;
        if (preferences.interests?.includes("STEM") && school.notes?.includes("STEM")) score += 15;
        if (preferences.interests?.includes("Academics") && gradeToRank(school.academics_grade) <= 3) score += 15;

        // Match by priorities
        if (preferences.priorities?.includes("Strong academics") && gradeToRank(school.academics_grade) <= 3) score += 10;
        if (preferences.priorities?.includes("Campus life") && gradeToRank(school.campus_grade) <= 4) score += 10;
        if (preferences.priorities?.includes("College placement") && gradeToRank(school.college_prep_grade) <= 3) score += 10;

        // Base quality score
        const overall = calculateOverallGrade(school);
        const qualityScore = Math.max(0, 14 - gradeToRank(overall));
        score += qualityScore;

        return { school, score };
      })
      .filter((s) => s.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [allSchools, preferences]);

  if (!preferences?.onboarding_completed || recommended.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {recommended.map(({ school }) => {
            const overall = calculateOverallGrade(school);
            return (
              <Link key={school.id} to={`/schools/${school.id}`} className="group">
                <div className="p-3 rounded-lg border bg-card hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {school.name}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getOverallGradeColor(overall)}`}>
                      {overall}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {school.city}, {school.state}
                  </div>
                  {school.tuition != null && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {school.tuition === 0 ? "Free" : `$${(school.tuition / 1000).toFixed(0)}k/yr`}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        <Link to="/schools" className="inline-flex items-center gap-1 text-sm text-primary mt-3 hover:gap-2 transition-all">
          See all schools <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
