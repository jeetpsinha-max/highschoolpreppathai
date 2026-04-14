import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, DollarSign, Copy, Check, Sparkles } from "lucide-react";
import { streamAIResponse } from "@/lib/streamAI";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useUserPreferences } from "@/hooks/useUserPreferences";

export default function FinancialAidAdvisor() {
  const { preferences } = useUserPreferences();
  const [familyInfo, setFamilyInfo] = useState("");
  const [schoolNames, setSchoolNames] = useState("");
  const [questions, setQuestions] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Pre-fill context from user preferences
  useEffect(() => {
    if (preferences?.grade_level && !familyInfo) {
      const ctx = [`Student in ${preferences.grade_level} grade`];
      if (preferences.application_year) ctx.push(`applying for ${preferences.application_year}`);
      if (preferences.boarding_preference === 'boarding') ctx.push('interested in boarding schools');
      if (preferences.priorities?.length) ctx.push(`priorities: ${preferences.priorities.join(', ')}`);
      setFamilyInfo(ctx.join('. ') + '.');
    }
  }, [preferences]);

  const handleSubmit = async () => {
    if (!familyInfo.trim()) { toast.error("Please describe your family's situation."); return; }
    setIsLoading(true);
    setResult("");

    let accumulated = "";
    await streamAIResponse({
      functionName: "financial-aid-advisor",
      body: {
        familyInfo,
        schoolNames: schoolNames.split(",").map(s => s.trim()).filter(Boolean),
        questions,
      },
      onDelta: (text) => { accumulated += text; setResult(accumulated); },
      onDone: () => setIsLoading(false),
      onError: (err) => { toast.error(err); setIsLoading(false); },
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Financial Aid Advisor</h1>
            <p className="text-sm text-muted-foreground">Get personalized scholarship & aid strategies</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Your Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Family Situation & Financial Context</Label>
                <Textarea value={familyInfo} onChange={e => setFamilyInfo(e.target.value)} placeholder="Describe your financial situation, number of children, any special circumstances..." className="mt-1.5 min-h-[120px]" />
              </div>
              <div>
                <Label>Target Schools (comma-separated)</Label>
                <Input value={schoolNames} onChange={e => setSchoolNames(e.target.value)} placeholder="e.g. Phillips Exeter, Choate Rosemary Hall" className="mt-1.5" />
              </div>
              <div>
                <Label>Specific Questions (optional)</Label>
                <Textarea value={questions} onChange={e => setQuestions(e.target.value)} placeholder="Any specific questions about financial aid?" className="mt-1.5" />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : "Get Aid Advice"}
              </Button>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
              {result && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-12">Fill in your information and click "Get Aid Advice" to receive personalized recommendations.</p>
              )}
              {isLoading && <div className="absolute bottom-4 right-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
