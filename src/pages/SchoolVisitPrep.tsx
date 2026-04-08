import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Copy, Check } from "lucide-react";
import { streamAIResponse } from "@/lib/streamAI";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function SchoolVisitPrep() {
  const [schoolName, setSchoolName] = useState("");
  const [studentInterests, setStudentInterests] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [userMode, setUserMode] = useState("student");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!schoolName.trim()) { toast.error("Please enter a school name."); return; }
    setIsLoading(true);
    setResult("");

    let accumulated = "";
    await streamAIResponse({
      functionName: "school-visit-prep",
      body: { schoolName, studentInterests, visitDate, userMode },
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
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">School Visit Prep</h1>
            <p className="text-sm text-muted-foreground">Get a personalized visit guide with questions & checklists</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Visit Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>School Name</Label>
                <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Phillips Academy Andover" className="mt-1.5" />
              </div>
              <div>
                <Label>I am a...</Label>
                <Select value={userMode} onValueChange={setUserMode}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Student Interests (optional)</Label>
                <Textarea value={studentInterests} onChange={e => setStudentInterests(e.target.value)} placeholder="e.g. robotics, soccer, creative writing..." className="mt-1.5" />
              </div>
              <div>
                <Label>Visit Date (optional)</Label>
                <Input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="mt-1.5" />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Preparing...</> : "Generate Visit Guide"}
              </Button>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Visit Guide</CardTitle>
              {result && <Button variant="ghost" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{result}</ReactMarkdown></div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-12">Enter your visit details and generate a personalized guide.</p>
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
