import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sparkles, FileEdit, CheckCircle2, AlertTriangle, Lightbulb, BookOpen, GraduationCap, Target, RefreshCw } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

const SCHOOL_PROMPTS = [
  {
    school: "The Peddie School",
    prompt: "Peddie values curiosity, passion, and community. Describe an experience where you pursued an interest purely out of curiosity and what you contributed to your school or local community.",
  },
  {
    school: "Phillips Andover",
    prompt: "In the spirit of 'Youth from Every Quarter', share how your background, unique perspective, or personal experiences will enrich the Andover boarding community.",
  },
  {
    school: "Phillips Exeter Academy",
    prompt: "Harkness learning requires active listening, collaboration, and defending ideas respectfully. Describe a time you discussed a challenging topic with peers who held different views.",
  },
  {
    school: "Choate Rosemary Hall",
    prompt: "Character and leadership are core to Choate. Tell us about a setback or obstacle you faced, how you responded, and what you learned about yourself.",
  },
  {
    school: "The Lawrenceville School",
    prompt: "Lawrenceville emphasizes house loyalty and intellectual rigor. How do you balance individual ambition with building a supportive residential community?",
  },
];

interface AnalysisResult {
  overall_score: number;
  maturity_score: number;
  fit_score: number;
  vocabulary_score: number;
  authenticity_score: number;
  word_count: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: { original: string; suggestion: string; rationale: string }[];
}

export default function EssayCoach() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedSchool, setSelectedSchool] = useState(SCHOOL_PROMPTS[0].school);
  const [essayText, setEssayText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const currentPromptObj = SCHOOL_PROMPTS.find(s => s.school === selectedSchool) || SCHOOL_PROMPTS[0];

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

  const handleAnalyze = async () => {
    if (wordCount < 50) {
      return toast({
        title: "Essay Too Short",
        description: "Please write at least 50 words to receive a comprehensive analysis.",
        variant: "destructive",
      });
    }

    setLoading(true);

    // Simulated AI Evaluation Engine (or connected via Supabase edge function)
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        overall_score: Math.min(96, Math.max(72, Math.round(75 + (wordCount > 250 ? 12 : 5)))),
        maturity_score: 88,
        fit_score: 92,
        vocabulary_score: 85,
        authenticity_score: 94,
        word_count: wordCount,
        summary: `Strong narrative voice tailored directly to ${selectedSchool}'s core values. Your essay demonstrates clear personal reflection, though tightening word choice in paragraph 2 will elevate the maturity tone further.`,
        strengths: [
          `Directly answers the prompt's core question regarding ${selectedSchool}'s values`,
          "Authentic, reflective tone that avoids cliché applicant phrases",
          "Clear structural arc from opening conflict to personal growth",
        ],
        weaknesses: [
          "Paragraph 2 relies on passive voice in two sentences",
          "Conclusion could end on a punchier statement of future impact",
        ],
        suggestions: [
          {
            original: "I felt really happy when our team finally won after working hard.",
            suggestion: "Securing the championship validated months of disciplined practice and collective resilience.",
            rationale: "Replaces informal emotion adjectives ('really happy') with mature, active leadership vocabulary.",
          },
          {
            original: "I think Peddie is a great school because of the community.",
            suggestion: `Peddie's collaborative culture directly mirrors my dedication to peer mentorship and intellectual inquiry.`,
            rationale: "Elevates school-fit alignment by referencing specific institutional attributes.",
          },
        ],
      };

      setResult(mockResult);
      setLoading(false);
      toast({
        title: "Analysis Complete!",
        description: `Essay scored ${mockResult.overall_score}/100 for ${selectedSchool}.`,
      });
    }, 1800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/ai-tools")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Tools
        </Button>

        {/* Page Title */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-2 px-3 py-1 border-primary/40 text-primary">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> PrepPath AI Admissions Essay Coach
          </Badge>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Top High School Admissions Essay Coach</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">
            Get instant AI analysis on tone maturity, school-fit alignment, vocabulary elevation, and line-by-line revisions for elite boarding & private school prompts.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column — Prompt Selector & Input (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" /> Target School & Prompt
                </CardTitle>
                <CardDescription>Select the school you are applying to</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Target School" />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHOOL_PROMPTS.map(sp => (
                        <SelectItem key={sp.school} value={sp.school}>
                          {sp.school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-muted/60 border rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-foreground uppercase tracking-wider block text-[10px]">Official Prompt</span>
                  <p className="text-muted-foreground leading-relaxed font-medium">{currentPromptObj.prompt}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileEdit className="h-5 w-5 text-primary" /> Essay Draft
                  </CardTitle>
                  <CardDescription>Paste or type your essay draft below</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {wordCount} Words
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your essay draft here..."
                  className="min-h-[260px] font-sans leading-relaxed text-sm p-4 resize-none"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />

                <Button
                  onClick={handleAnalyze}
                  disabled={loading || wordCount < 20}
                  className="w-full shadow-md"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Evaluating Essay Rubric...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Run AI Admissions Essay Evaluation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column — AI Evaluation & Revisions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {result ? (
              <>
                {/* Overall Score */}
                <Card className="border-primary/40 bg-primary/5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Admissions Fit Score
                      </CardTitle>
                      <Badge className="bg-primary text-primary-foreground font-bold">
                        {result.overall_score}/100
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={result.overall_score} className="h-2" />
                    <p className="text-xs text-muted-foreground leading-relaxed bg-background p-3 rounded-lg border">
                      {result.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Score Breakdown Gauges */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" /> Rubric Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span>Tone & Maturity</span>
                        <span className="font-mono font-bold text-primary">{result.maturity_score}%</span>
                      </div>
                      <Progress value={result.maturity_score} className="h-1.5" />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span>School Alignment ({selectedSchool})</span>
                        <span className="font-mono font-bold text-green-600 dark:text-green-400">{result.fit_score}%</span>
                      </div>
                      <Progress value={result.fit_score} className="h-1.5" />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span>Vocabulary Elevation</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{result.vocabulary_score}%</span>
                      </div>
                      <Progress value={result.vocabulary_score} className="h-1.5" />
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span>Authenticity & Voice</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{result.authenticity_score}%</span>
                      </div>
                      <Progress value={result.authenticity_score} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths & Edits */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Line-by-Line AI Revisions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.suggestions.map((sug, idx) => (
                      <div key={idx} className="p-3 bg-muted/60 border rounded-xl space-y-1.5 text-xs">
                        <div className="text-red-500/90 line-through">{sug.original}</div>
                        <div className="text-green-600 dark:text-green-400 font-medium">→ {sug.suggestion}</div>
                        <p className="text-[11px] text-muted-foreground italic pt-1">{sug.rationale}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-full min-h-[300px] flex items-center justify-center p-8 text-center text-muted-foreground">
                <div className="space-y-3">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40" />
                  <p className="text-sm">Select target school, paste essay draft, and run evaluation to see rubric score & line-by-line revisions.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
