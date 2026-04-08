import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calendar, Copy, Check } from "lucide-react";
import { streamAIResponse } from "@/lib/streamAI";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function TimelinePlanner() {
  const [currentGrade, setCurrentGrade] = useState("");
  const [targetSchools, setTargetSchools] = useState("");
  const [applicationYear, setApplicationYear] = useState("");
  const [priorities, setPriorities] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!currentGrade) { toast.error("Please select your current grade."); return; }
    setIsLoading(true);
    setResult("");

    let accumulated = "";
    await streamAIResponse({
      functionName: "timeline-planner",
      body: {
        currentGrade,
        targetSchools: targetSchools.split(",").map(s => s.trim()).filter(Boolean),
        applicationYear,
        priorities,
      },
      onDelta: (text) => { accumulated += text; setResult(accumulated); },
      onDone: () => setIsLoading(false),
      onError: (err) => { toast.error(err); setIsLoading(false); },
    });
  };

  const handleCopy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Admissions Timeline Planner</h1>
            <p className="text-sm text-muted-foreground">Get a personalized month-by-month preparation plan</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Your Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Grade</Label>
                <Select value={currentGrade} onValueChange={setCurrentGrade}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select grade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5th">5th Grade</SelectItem>
                    <SelectItem value="6th">6th Grade</SelectItem>
                    <SelectItem value="7th">7th Grade</SelectItem>
                    <SelectItem value="8th">8th Grade</SelectItem>
                    <SelectItem value="9th">9th Grade</SelectItem>
                    <SelectItem value="10th">10th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Application Year</Label>
                <Select value={applicationYear} onValueChange={setApplicationYear}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-2026">2025–2026</SelectItem>
                    <SelectItem value="2026-2027">2026–2027</SelectItem>
                    <SelectItem value="2027-2028">2027–2028</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Schools (comma-separated)</Label>
                <Input value={targetSchools} onChange={e => setTargetSchools(e.target.value)} placeholder="e.g. Exeter, Andover, Choate" className="mt-1.5" />
              </div>
              <div>
                <Label>Key Priorities (optional)</Label>
                <Textarea value={priorities} onChange={e => setPriorities(e.target.value)} placeholder="e.g. SSAT prep, essay writing, campus visits..." className="mt-1.5" />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Planning...</> : "Create My Timeline"}
              </Button>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Timeline</CardTitle>
              {result && <Button variant="ghost" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{result}</ReactMarkdown></div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-12">Fill in your details and create a personalized admissions timeline.</p>
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
