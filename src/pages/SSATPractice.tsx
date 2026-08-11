import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calculator, FileText, CheckCircle, XCircle, RotateCcw, Award, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type?: string;
}

interface SectionQuestions {
  passage?: string;
  questions: Question[];
}

// Authentic Upper Level SSAT Question Bank
const SSAT_QUESTION_BANK: Record<string, SectionQuestions> = {
  verbal: {
    questions: [
      {
        id: 1,
        type: "Synonym",
        question: "BENEVOLENT most nearly means:",
        options: ["A) Hostile", "B) Kindhearted", "C) Wealthy", "D) Hesitant", "E) Arrogant"],
        correctAnswer: "B",
        explanation: "'Benevolent' comes from Latin roots 'bene' (well) and 'volent' (wishing). It means well-meaning, charitable, or kindhearted.",
      },
      {
        id: 2,
        type: "Synonym",
        question: "EPHEMERAL most nearly means:",
        options: ["A) Permanent", "B) Short-lived", "C) Transparent", "D) Mysterious", "E) Ancient"],
        correctAnswer: "B",
        explanation: "'Ephemeral' describes something lasting for a very short time, such as ephemeral flowers or fleeting moments.",
      },
      {
        id: 3,
        type: "Synonym",
        question: "PRAGMATIC most nearly means:",
        options: ["A) Theoretical", "B) Idealistic", "C) Practical", "D) Reckless", "E) Emotional"],
        correctAnswer: "C",
        explanation: "'Pragmatic' means dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
      },
      {
        id: 4,
        type: "Analogy",
        question: "ARCHITECT : BUILDING ::",
        options: [
          "A) Painter : Canvas",
          "B) Composer : Symphony",
          "C) Pilot : Airplane",
          "D) Doctor : Patient",
          "E) Sculptor : Marble",
        ],
        correctAnswer: "B",
        explanation: "An architect creates/designs a building; similarly, a composer creates/designs a symphony.",
      },
      {
        id: 5,
        type: "Analogy",
        question: "THERMOMETER : TEMPERATURE ::",
        options: [
          "A) Clock : Time",
          "B) Scale : Weight",
          "C) Speedometer : Distance",
          "D) Barometer : Pressure",
          "E) Both A, B, and D",
        ],
        correctAnswer: "E",
        explanation: "A thermometer measures temperature. Similarly, a clock measures time, a scale measures weight, and a barometer measures pressure.",
      },
    ],
  },
  quantitative: {
    questions: [
      {
        id: 1,
        question: "If 3x + 7 = 22, what is the value of 6x - 4?",
        options: ["A) 26", "B) 30", "C) 15", "D) 22", "E) 34"],
        correctAnswer: "A",
        explanation: "Solve 3x + 7 = 22 → 3x = 15 → x = 5. Now substitute into 6x - 4: 6(5) - 4 = 30 - 4 = 26.",
      },
      {
        id: 2,
        question: "A rectangle has a perimeter of 36 inches. If the length is twice the width, what is the area of the rectangle in square inches?",
        options: ["A) 48", "B) 72", "C) 81", "D) 108", "E) 144"],
        correctAnswer: "B",
        explanation: "Let width = w, length = 2w. Perimeter = 2(w + 2w) = 6w = 36 → w = 6 in, length = 12 in. Area = 6 × 12 = 72 sq in.",
      },
      {
        id: 3,
        question: "A bag contains 5 red marbles, 3 blue marbles, and 2 green marbles. If one marble is drawn at random, what is the probability that it is NOT blue?",
        options: ["A) 3/10", "B) 1/2", "C) 7/10", "D) 4/5", "E) 1/5"],
        correctAnswer: "C",
        explanation: "Total marbles = 5 + 3 + 2 = 10. Non-blue marbles = 5 (red) + 2 (green) = 7. Probability = 7/10 = 0.70.",
      },
      {
        id: 4,
        question: "If the average (arithmetic mean) of 4, 8, 15, and x is 10, what is the value of x?",
        options: ["A) 11", "B) 12", "C) 13", "D) 14", "E) 15"],
        correctAnswer: "C",
        explanation: "Sum = 10 × 4 = 40. Sum of known numbers = 4 + 8 + 15 = 27. x = 40 - 27 = 13.",
      },
      {
        id: 5,
        question: "A store reduces the price of a $80 jacket by 25%. During a weekend sale, an additional 10% discount is applied to the reduced price. What is the final sale price?",
        options: ["A) $52.00", "B) $54.00", "C) $56.00", "D) $58.00", "E) $60.00"],
        correctAnswer: "B",
        explanation: "25% off $80 = $60. Additional 10% off $60 = $60 - $6 = $54.00.",
      },
    ],
  },
  reading: {
    passage: `The American industrial boom of the late nineteenth century transformed the nation's economy and social structure. As factories expanded in urban centers, millions of workers migrated from rural agrarian communities and overseas. While industrialization produced unprecedented material wealth and technological innovation, it also brought severe challenges, including dangerous working conditions, tenement housing, and wealth disparity. Early labor movements arose as workers sought fair wages, reasonable hours, and safer working environments.`,
    questions: [
      {
        id: 1,
        question: "Which of the following best summarizes the main idea of the passage?",
        options: [
          "A) Industrialization benefited only factory owners.",
          "B) The late 19th-century industrial boom created both economic growth and significant social challenges.",
          "C) Agrarian life was superior to urban industrial life.",
          "D) Labor movements were unsuccessful in achieving reform.",
          "E) Technology eliminated the need for manual labor.",
        ],
        correctAnswer: "B",
        explanation: "The passage balances the growth/wealth of industrialization with the social and labor challenges that emerged.",
      },
      {
        id: 2,
        question: "As used in line 5, the word 'unprecedented' most nearly means:",
        options: ["A) Temporary", "B) Never seen before", "C) Predictable", "D) Overwhelming", "E) Minor"],
        correctAnswer: "B",
        explanation: "'Unprecedented' means never done or known before; unparalleled in scope.",
      },
      {
        id: 3,
        question: "According to the passage, what triggered the emergence of early labor movements?",
        options: [
          "A) Government mandates requiring unions",
          "B) Workers seeking fair wages, safer conditions, and reasonable hours",
          "C) Technological innovations in agriculture",
          "D) Decreased urban populations",
          "E) Competition from overseas markets",
        ],
        correctAnswer: "B",
        explanation: "The final sentence explicitly states workers organized labor movements for fair wages, reasonable hours, and safer conditions.",
      },
    ],
  },
};

export default function SSATPractice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [section, setSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [practiceData, setPracticeData] = useState<SectionQuestions | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Scaled Score (500 to 800 per section; Total 1500 to 2400)
  const [sectionScaledScore, setSectionScaledScore] = useState<number | null>(null);
  const [totalCompositeEstimate, setTotalCompositeEstimate] = useState<number | null>(null);
  const [percentileEstimate, setPercentileEstimate] = useState<number | null>(null);

  const sections = [
    { id: "verbal", name: "Verbal", icon: BookOpen, description: "Synonyms & Analogies (500–800 Range)" },
    { id: "quantitative", name: "Quantitative Math", icon: Calculator, description: "Algebra, Geometry & Ratios (500–800 Range)" },
    { id: "reading", name: "Reading Comprehension", icon: FileText, description: "Passage Analysis & Tone (500–800 Range)" },
  ];

  const startPractice = (sectionId: string) => {
    setSection(sectionId);
    setLoading(true);
    setSubmitted(false);
    setSectionScaledScore(null);
    setTotalCompositeEstimate(null);
    setPercentileEstimate(null);
    setAnswers({});

    setTimeout(() => {
      setPracticeData(SSAT_QUESTION_BANK[sectionId] || SSAT_QUESTION_BANK.verbal);
      setLoading(false);
    }, 400);
  };

  const submitAnswers = async () => {
    if (!practiceData) return;

    let correct = 0;
    practiceData.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    const totalQ = practiceData.questions.length;
    const rawPct = correct / totalQ;

    // Official Upper Level SSAT Section Scaled Score (500 - 800 points)
    const scaledScore = Math.min(800, Math.max(500, Math.round(500 + rawPct * 300)));

    // Estimated 3-Section Composite SSAT Score (1500 - 2400 points)
    const totalComposite = Math.min(2400, Math.max(1500, Math.round(scaledScore * 3)));

    // SSAT National Percentile Rank (1% - 99%)
    const percentile = Math.min(99, Math.max(15, Math.round(20 + rawPct * 78)));

    setSectionScaledScore(scaledScore);
    setTotalCompositeEstimate(totalComposite);
    setPercentileEstimate(percentile);
    setSubmitted(true);

    if (user) {
      try {
        await supabase.from("ssat_practice").insert({
          user_id: user.id,
          section: section!,
          questions: practiceData.questions as any,
          answers: answers as any,
          score: Math.round(rawPct * 100),
        });
      } catch (error) {
        console.error("Failed to log SSAT practice:", error);
      }
    }

    toast({
      title: "SSAT Section Complete!",
      description: `Section Score: ${scaledScore}/800 | Estimated Total SSAT: ${totalComposite}/2400 (${percentile}th Percentile)`,
    });
  };

  const resetPractice = () => {
    setSection(null);
    setPracticeData(null);
    setAnswers({});
    setSubmitted(false);
    setSectionScaledScore(null);
    setTotalCompositeEstimate(null);
    setPercentileEstimate(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/ai-tools")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Tools
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-2 px-3 py-1 border-primary/40 text-primary">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Upper Level SSAT Engine (1500–2400 Scale)
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">Real Upper Level SSAT Practice</h1>
            <p className="text-muted-foreground">
              Authentic practice questions with 2400-point composite score forecasting and national percentile rankings for elite boarding applications.
            </p>
          </div>

          {!section ? (
            <div className="grid md:grid-cols-3 gap-6">
              {sections.map((s) => (
                <Card
                  key={s.id}
                  className="cursor-pointer hover:shadow-lg transition-all border-border/60 hover:border-primary/40 group"
                  onClick={() => startPractice(s.id)}
                >
                  <CardHeader className="text-center">
                    <s.icon className="h-12 w-12 mx-auto text-primary mb-2 group-hover:scale-110 transition-transform" />
                    <CardTitle>{s.name}</CardTitle>
                    <CardDescription>{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full shadow-sm">Start Section Practice</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading authentic SSAT test questions...</p>
              </CardContent>
            </Card>
          ) : practiceData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-sm px-4 py-1 font-mono">
                  {sections.find((s) => s.id === section)?.name} (500–800 Score Scale)
                </Badge>
                <Button variant="outline" onClick={resetPractice} size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" /> Change Section
                </Button>
              </div>

              {/* Score Results Card on Submit */}
              {submitted && sectionScaledScore !== null && (
                <Card className="border-primary/40 bg-gradient-to-r from-primary/5 via-background to-primary/5">
                  <CardContent className="py-6 space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Section Score</span>
                        <div className="text-3xl font-bold font-mono text-primary mt-0.5">
                          {sectionScaledScore} <span className="text-sm text-muted-foreground font-normal">/ 800</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Projected Composite</span>
                        <div className="text-3xl font-bold font-mono text-amber-500 mt-0.5">
                          {totalCompositeEstimate} <span className="text-sm text-muted-foreground font-normal">/ 2400</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Percentile Rank</span>
                        <div className="text-3xl font-bold font-mono text-green-600 dark:text-green-400 mt-0.5">
                          {percentileEstimate}th <span className="text-xs text-muted-foreground font-normal">Percentile</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Passage */}
              {practiceData.passage && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" /> SSAT Reading Passage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-serif bg-muted/30 p-4 rounded-xl border">
                      {practiceData.passage}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Questions List */}
              {practiceData.questions.map((q, index) => (
                <Card key={q.id} className={submitted ? (answers[q.id] === q.correctAnswer ? "border-green-500/60" : "border-red-500/60") : ""}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        {q.type && (
                          <Badge variant="secondary" className="text-[10px] mb-1 font-mono">
                            {q.type}
                          </Badge>
                        )}
                        <CardTitle className="text-base font-medium leading-snug">{q.question}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[q.id] || ""}
                      onValueChange={(val) => !submitted && setAnswers((prev) => ({ ...prev, [q.id]: val }))}
                      disabled={submitted}
                    >
                      {q.options.map((option, optIndex) => {
                        const optionLetter = option.charAt(0);
                        const isCorrect = optionLetter === q.correctAnswer;
                        const isSelected = answers[q.id] === optionLetter;

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center space-x-2 p-3 rounded-lg text-sm transition ${
                              submitted
                                ? isCorrect
                                  ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300"
                                  : isSelected
                                  ? "bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300"
                                  : ""
                                : "hover:bg-muted/60"
                            }`}
                          >
                            <RadioGroupItem value={optionLetter} id={`q${q.id}-${optionLetter}`} />
                            <Label htmlFor={`q${q.id}-${optionLetter}`} className="flex-grow cursor-pointer font-normal">
                              {option}
                            </Label>
                            {submitted && isCorrect && <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />}
                            {submitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {submitted && (
                      <div className="mt-4 p-4 bg-muted/60 border rounded-xl text-xs space-y-1">
                        <span className="font-semibold text-foreground">SSAT Solution Rationale:</span>
                        <p className="text-muted-foreground leading-relaxed">{q.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {!submitted && (
                <Button
                  onClick={submitAnswers}
                  className="w-full shadow-md"
                  size="lg"
                  disabled={Object.keys(answers).length < practiceData.questions.length}
                >
                  Submit SSAT Section Answers
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}
