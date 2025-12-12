import { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  MessageSquare, 
  Mic, 
  MicOff, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  CheckCircle2,
  Lightbulb,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  category: string;
  tips: string;
}

interface Feedback {
  scores: {
    clarity: number;
    confidence: number;
    content: number;
    structure: number;
    overall: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    examplePhrase: string;
  };
  summary: string;
}

export default function InterviewCoach() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const generateQuestions = async () => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCompletedQuestions(new Set());
    setFeedback(null);
    setResponse("");

    try {
      const { data, error } = await supabase.functions.invoke("interview-coach", {
        body: { action: "generate_questions" }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setQuestions(data.questions);
      toast.success("Interview questions generated!");
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // For now, we'll use the text input for evaluation
        // In a full implementation, you'd send the audio for transcription
        stream.getTracks().forEach(track => track.stop());
        toast.info("Recording stopped. Please type or edit your response below.");
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started. Speak your answer!");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const evaluateResponse = async () => {
    if (!response.trim()) {
      toast.error("Please provide a response first");
      return;
    }

    setIsEvaluating(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.functions.invoke("interview-coach", {
        body: { 
          action: "evaluate_response",
          response: response,
          questionIndex: currentQuestionIndex
        }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setFeedback(data.feedback);
      setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]));
      toast.success("Response evaluated!");
    } catch (error) {
      console.error("Error evaluating response:", error);
      toast.error("Failed to evaluate response. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setResponse("");
      setFeedback(null);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setResponse("");
      setFeedback(null);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((completedQuestions.size) / questions.length) * 100 : 0;

  const ScoreBar = ({ label, score }: { label: string; score: number }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}/10</span>
      </div>
      <Progress value={score * 10} className="h-2" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Interview Coach - PrepPath AI</title>
        <meta name="description" content="Practice interview questions with AI feedback on clarity, confidence, and structure." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-4">
              <MessageSquare className="h-4 w-4" />
              AI Interview Coach
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Interview Coach</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Practice with realistic interview questions and get AI feedback on your responses. 
              Improve your clarity, confidence, and content before the real thing.
            </p>
          </div>

          {questions.length === 0 ? (
            <Card className="text-center">
              <CardContent className="pt-12 pb-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                <h2 className="text-xl font-semibold mb-2">Ready to Practice?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  We'll generate 5 realistic interview questions for you to practice. 
                  Answer each one and get instant AI feedback.
                </p>
                <Button onClick={generateQuestions} size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start Practice Session
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Progress */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {completedQuestions.size} of {questions.length} completed
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>

              {/* Question Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{currentQuestion.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-4">{currentQuestion.question}</CardTitle>
                  <CardDescription className="flex items-start gap-2 mt-2">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                    <span>{currentQuestion.tips}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Your Response</label>
                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        size="sm"
                        onClick={isRecording ? stopRecording : startRecording}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="mr-2 h-4 w-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2 h-4 w-4" />
                            Record Answer
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Type your answer here, or use the microphone to practice speaking..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={evaluateResponse}
                      disabled={isEvaluating || !response.trim()}
                      className="flex-1"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Target className="mr-2 h-4 w-4" />
                          Get Feedback
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Card */}
              {feedback && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      Feedback
                    </CardTitle>
                    <CardDescription>{feedback.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Scores */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <ScoreBar label="Clarity" score={feedback.scores.clarity} />
                      <ScoreBar label="Confidence" score={feedback.scores.confidence} />
                      <ScoreBar label="Content" score={feedback.scores.content} />
                      <ScoreBar label="Structure" score={feedback.scores.structure} />
                    </div>

                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{feedback.scores.overall}/10</div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>

                    <Separator />

                    {/* Strengths & Improvements */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-emerald-600 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {feedback.feedback.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-600 mb-2">Areas to Improve</h4>
                        <ul className="space-y-1">
                          {feedback.feedback.improvements.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {feedback.feedback.examplePhrase && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2 text-sm">Try This Approach</h4>
                        <p className="text-sm text-muted-foreground italic">
                          "{feedback.feedback.examplePhrase}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={generateQuestions}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Questions
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
