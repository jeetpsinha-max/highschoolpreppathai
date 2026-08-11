import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Calculator, FileText, CheckCircle, XCircle, RotateCcw } from "lucide-react";
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
}

interface PracticeData {
  passage?: string | null;
  questions: Question[];
}

const SSATPractice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [section, setSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const sections = [
    { id: 'verbal', name: 'Verbal', icon: BookOpen, description: 'Synonyms and analogies' },
    { id: 'quantitative', name: 'Quantitative', icon: Calculator, description: 'Math and problem solving' },
    { id: 'reading', name: 'Reading', icon: FileText, description: 'Comprehension and analysis' },
  ];

  const startPractice = async (sectionId: string) => {
    setSection(sectionId);
    setLoading(true);
    setSubmitted(false);
    setScore(null);
    setAnswers({});

    try {
      const { data, error } = await supabase.functions.invoke('ssat-practice', {
        body: { section: sectionId, difficulty: 'middle' }
      });

      if (error) throw error;
      setPracticeData(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate practice questions",
        variant: "destructive"
      });
      setSection(null);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    if (!practiceData) return;

    let correct = 0;
    practiceData.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });

    const calculatedScore = Math.round((correct / practiceData.questions.length) * 100);
    const scaledScore = Math.min(800, Math.max(500, Math.round(500 + (correct / practiceData.questions.length) * 300)));
    const estimatedPercentile = Math.min(99, Math.max(25, Math.round(30 + (correct / practiceData.questions.length) * 68)));

    setScore(calculatedScore);
    setSubmitted(true);

    // Save to database if user is logged in
    if (user) {
      try {
        await supabase.from('ssat_practice').insert({
          user_id: user.id,
          section: section!,
          questions: practiceData.questions as any,
          answers: answers as any,
          score: calculatedScore,
        });
      } catch (error) {
        console.error('Failed to save practice session:', error);
      }
    }

    toast({
      title: "SSAT Session Complete!",
      description: `Raw Score: ${correct}/${practiceData.questions.length} | Scaled: ${scaledScore}/800 (Est. ${estimatedPercentile}th Percentile)`,
    });
  };

  const resetPractice = () => {
    setSection(null);
    setPracticeData(null);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/ai-tools')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Tools
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">SSAT Practice</h1>
            <p className="text-muted-foreground">
              AI-generated practice questions with detailed explanations
            </p>
          </div>

          {!section ? (
            <div className="grid md:grid-cols-3 gap-6">
              {sections.map((s) => (
                <Card 
                  key={s.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => startPractice(s.id)}
                >
                  <CardHeader className="text-center">
                    <s.icon className="h-12 w-12 mx-auto text-primary mb-2" />
                    <CardTitle>{s.name}</CardTitle>
                    <CardDescription>{s.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Start Practice</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Generating practice questions...</p>
              </CardContent>
            </Card>
          ) : practiceData ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-lg px-4 py-1">
                  {sections.find(s => s.id === section)?.name} Section
                </Badge>
                <Button variant="outline" onClick={resetPractice}>
                  <RotateCcw className="mr-2 h-4 w-4" /> New Practice
                </Button>
              </div>

              {submitted && score !== null && (
                <Card className={score >= 70 ? "border-green-500" : "border-orange-500"}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Your Score:</span>
                      <span className={`text-2xl font-bold ${score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                        {score}%
                      </span>
                    </div>
                    <Progress value={score} className="mt-2" />
                  </CardContent>
                </Card>
              )}

              {practiceData.passage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reading Passage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {practiceData.passage}
                    </p>
                  </CardContent>
                </Card>
              )}

              {practiceData.questions.map((q, index) => (
                <Card key={q.id} className={submitted ? (
                  answers[q.id] === q.correctAnswer ? 'border-green-500' : 'border-red-500'
                ) : ''}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <CardTitle className="text-lg font-medium">{q.question}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[q.id] || ''}
                      onValueChange={(value) => !submitted && setAnswers(prev => ({ ...prev, [q.id]: value }))}
                      disabled={submitted}
                    >
                      {q.options.map((option, optIndex) => {
                        const optionLetter = option.charAt(0);
                        const isCorrect = optionLetter === q.correctAnswer;
                        const isSelected = answers[q.id] === optionLetter;
                        
                        return (
                          <div 
                            key={optIndex} 
                            className={`flex items-center space-x-2 p-3 rounded-lg ${
                              submitted 
                                ? isCorrect 
                                  ? 'bg-green-50 dark:bg-green-950' 
                                  : isSelected 
                                    ? 'bg-red-50 dark:bg-red-950' 
                                    : ''
                                : 'hover:bg-muted'
                            }`}
                          >
                            <RadioGroupItem value={optionLetter} id={`q${q.id}-${optionLetter}`} />
                            <Label htmlFor={`q${q.id}-${optionLetter}`} className="flex-grow cursor-pointer">
                              {option}
                            </Label>
                            {submitted && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {submitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                          </div>
                        );
                      })}
                    </RadioGroup>

                    {submitted && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <p className="font-semibold text-sm mb-1">Explanation:</p>
                        <p className="text-sm text-muted-foreground">{q.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {!submitted && (
                <Button 
                  onClick={submitAnswers} 
                  className="w-full" 
                  size="lg"
                  disabled={Object.keys(answers).length < practiceData.questions.length}
                >
                  Submit Answers
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SSATPractice;
