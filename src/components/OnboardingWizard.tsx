import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Target, Sparkles, ChevronRight, ChevronLeft, Check } from "lucide-react";

const STEPS = ["About You", "Interests", "Goals"];

const INTEREST_OPTIONS = [
  "Academics", "Athletics", "Arts", "STEM", "Music", "Theater",
  "Community Service", "Debate", "Robotics", "Writing", "Leadership",
  "Entrepreneurship", "Environmental Science", "Foreign Languages",
];

const EXTRACURRICULAR_OPTIONS = [
  "Varsity Sports", "Club Sports", "Student Government", "Model UN",
  "Science Olympiad", "Math Team", "Drama/Theater", "Band/Orchestra",
  "Choir", "Newspaper/Yearbook", "Community Service Club", "Coding/Robotics",
];

const PRIORITY_OPTIONS = [
  "Strong academics", "Athletic programs", "College placement",
  "Small class sizes", "Diversity", "Arts programs",
  "Boarding experience", "Financial aid", "Location/proximity",
  "STEM focus", "Religious affiliation", "Campus facilities",
];

const STRENGTH_OPTIONS = [
  "Math", "Science", "English/Writing", "History", "Foreign Languages",
  "Computer Science", "Visual Arts", "Performing Arts", "Physical Education",
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [gradeLevel, setGradeLevel] = useState("");
  const [applicationYear, setApplicationYear] = useState("");
  const [boardingPref, setBoardingPref] = useState("no_preference");
  const [interests, setInterests] = useState<string[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [testPrep, setTestPrep] = useState("");
  const { savePreferences, isSaving } = useUserPreferences();
  const { toast } = useToast();

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleFinish = async () => {
    try {
      await savePreferences({
        grade_level: gradeLevel || null,
        application_year: applicationYear || null,
        boarding_preference: boardingPref,
        interests,
        extracurriculars,
        priorities,
        academic_strengths: strengths,
        test_prep_status: testPrep || null,
        onboarding_completed: true,
      });
      toast({ title: "Profile saved!", description: "Your experience is now personalized." });
      onComplete();
    } catch {
      toast({ title: "Error", description: "Failed to save preferences.", variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            {step === 0 && <GraduationCap className="h-6 w-6 text-primary" />}
            {step === 1 && <Sparkles className="h-6 w-6 text-primary" />}
            {step === 2 && <Target className="h-6 w-6 text-primary" />}
          </div>
          <CardTitle className="text-xl">{STEPS[step]}</CardTitle>
          <CardDescription>Step {step + 1} of {STEPS.length}</CardDescription>
          <div className="flex gap-1 justify-center mt-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Current Grade</label>
                <Select value={gradeLevel} onValueChange={setGradeLevel}>
                  <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>
                    {["6th", "7th", "8th", "9th", "10th", "11th", "12th"].map(g => (
                      <SelectItem key={g} value={g}>{g} Grade</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Application Year</label>
                <Select value={applicationYear} onValueChange={setApplicationYear}>
                  <SelectTrigger><SelectValue placeholder="When applying?" /></SelectTrigger>
                  <SelectContent>
                    {["2025-2026", "2026-2027", "2027-2028", "2028-2029"].map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Boarding Preference</label>
                <Select value={boardingPref} onValueChange={setBoardingPref}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_preference">No Preference</SelectItem>
                    <SelectItem value="boarding">Prefer Boarding</SelectItem>
                    <SelectItem value="day">Prefer Day School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Test Prep Status</label>
                <Select value={testPrep} onValueChange={setTestPrep}>
                  <SelectTrigger><SelectValue placeholder="SSAT/ISEE status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="studying">Currently Studying</SelectItem>
                    <SelectItem value="taken">Already Taken</SelectItem>
                    <SelectItem value="not_needed">Not Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">What interests you? (select all)</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map(item => (
                    <Badge
                      key={item}
                      variant={interests.includes(item) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleItem(interests, setInterests, item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Extracurriculars</label>
                <div className="flex flex-wrap gap-1.5">
                  {EXTRACURRICULAR_OPTIONS.map(item => (
                    <Badge
                      key={item}
                      variant={extracurriculars.includes(item) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleItem(extracurriculars, setExtracurriculars, item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Academic Strengths</label>
                <div className="flex flex-wrap gap-1.5">
                  {STRENGTH_OPTIONS.map(item => (
                    <Badge
                      key={item}
                      variant={strengths.includes(item) ? "default" : "outline"}
                      className="cursor-pointer transition-colors"
                      onClick={() => toggleItem(strengths, setStrengths, item)}
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <label className="text-sm font-medium mb-2 block">What matters most to you? (pick top 5)</label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_OPTIONS.map(item => (
                  <Badge
                    key={item}
                    variant={priorities.includes(item) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${priorities.length >= 5 && !priorities.includes(item) ? 'opacity-40' : ''}`}
                    onClick={() => {
                      if (priorities.includes(item)) {
                        setPriorities(priorities.filter(p => p !== item));
                      } else if (priorities.length < 5) {
                        setPriorities([...priorities, item]);
                      }
                    }}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{priorities.length}/5 selected</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isSaving}>
                <Check className="h-4 w-4 mr-1" /> {isSaving ? "Saving..." : "Finish"}
              </Button>
            )}
          </div>
          <button onClick={onComplete} className="w-full text-xs text-muted-foreground hover:underline mt-1">
            Skip for now
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
