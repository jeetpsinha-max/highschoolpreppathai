import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Sparkles, MapPin, Target, Heart, Wallet, GraduationCap, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type StepKey =
  | "grade_level"
  | "application_year"
  | "target_states"
  | "budget_range"
  | "interests"
  | "priorities";

interface StepDef {
  key: StepKey;
  /** Onboarding wizard step index (1-based) for the deep link */
  step: number;
  title: string;
  blurb: string;
  cta: string;
  Icon: typeof Sparkles;
  isMissing: (p: any) => boolean;
}

const STEPS: StepDef[] = [
  {
    key: "grade_level",
    step: 1,
    title: "Tell us what grade you're in",
    blurb: "We tailor timelines, deadlines, and AI tools to your year — it takes 10 seconds.",
    cta: "Set my grade",
    Icon: GraduationCap,
    isMissing: (p) => !p?.grade_level,
  },
  {
    key: "application_year",
    step: 1,
    title: "When are you applying?",
    blurb: "Pick your application year so we can sequence the right next steps for you.",
    cta: "Set application year",
    Icon: Sparkles,
    isMissing: (p) => !p?.application_year,
  },
  {
    key: "target_states",
    step: 2,
    title: "Add the states you're considering",
    blurb: "We'll surface schools in your target regions and skip ones that don't fit.",
    cta: "Pick target states",
    Icon: MapPin,
    isMissing: (p) => !p?.target_states || p.target_states.length === 0,
  },
  {
    key: "budget_range",
    step: 2,
    title: "Set a tuition budget",
    blurb: "We'll only recommend schools that fit your family's budget range.",
    cta: "Set my budget",
    Icon: Wallet,
    isMissing: (p) => !p?.budget_range,
  },
  {
    key: "interests",
    step: 3,
    title: "What are you most interested in?",
    blurb: "Athletics, arts, STEM, academics — your interests power your match score.",
    cta: "Pick my interests",
    Icon: Heart,
    isMissing: (p) => !p?.interests || p.interests.length === 0,
  },
  {
    key: "priorities",
    step: 4,
    title: "Pick your top priorities",
    blurb: "Class size, college placement, campus life — tell us what matters most.",
    cta: "Set priorities",
    Icon: Target,
    isMissing: (p) => !p?.priorities || p.priorities.length === 0,
  },
];

export function OnboardingNextStepCTA() {
  const { user } = useAuth();
  const { preferences, isLoading } = useUserPreferences();

  // Don't render for signed-out users or while we don't know yet
  if (!user || isLoading) return null;

  const completedCount = STEPS.filter((s) => !s.isMissing(preferences)).length;
  const totalCount = STEPS.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  // Fully complete and onboarding flag set — nothing to show
  if (preferences?.onboarding_completed && completedCount === totalCount) {
    return null;
  }

  const next = STEPS.find((s) => s.isMissing(preferences));

  // Edge case: marked complete but a field is empty — nudge to finish anyway
  const step = next ?? STEPS[0];
  const Icon = step.Icon;
  const target = `/dashboard?onboarding=1&step=${step.step}`;

  return (
    <section className="py-8 md:py-12 bg-background border-b">
      <div className="container mx-auto px-4">
        <Card className="overflow-hidden border-secondary/30 bg-gradient-to-br from-secondary/10 via-background to-primary/5 shadow-sm">
          <CardContent className="p-5 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
              <div className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-md">
                <Icon className="h-7 w-7 md:h-8 md:w-8" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Next step in your profile
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {completedCount}/{totalCount} done
                  </span>
                </div>
                <h2 className="font-display text-lg md:text-2xl font-bold text-foreground mb-1.5">
                  {step.title}
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-3 max-w-2xl">
                  {step.blurb}
                </p>

                <div className="flex items-center gap-3 max-w-md">
                  <Progress value={percent} className="h-2 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                    {percent}%
                  </span>
                </div>

                {/* Mini checklist of remaining items */}
                <ul className="hidden md:flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  {STEPS.map((s) => {
                    const done = !s.isMissing(preferences);
                    return (
                      <li
                        key={s.key}
                        className={`flex items-center gap-1.5 text-xs ${
                          done ? "text-muted-foreground" : "text-foreground/80"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40" />
                        )}
                        <span className={done ? "line-through" : ""}>{s.cta}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="flex md:flex-col gap-2 md:items-stretch shrink-0">
                <Link to={target} className="w-full">
                  <Button variant="hero" size="lg" className="w-full gap-2">
                    {step.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard" className="w-full">
                  <Button variant="outline" size="lg" className="w-full">
                    Go to dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
