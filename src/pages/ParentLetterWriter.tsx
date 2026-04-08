import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Copy, Check } from "lucide-react";
import { streamAIResponse } from "@/lib/streamAI";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function ParentLetterWriter() {
  const [letterType, setLetterType] = useState("thank_you");
  const [schoolName, setSchoolName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!context.trim()) { toast.error("Please provide some context."); return; }
    setIsLoading(true);
    setResult("");

    let accumulated = "";
    await streamAIResponse({
      functionName: "parent-letter-writer",
      body: { letterType, schoolName, recipientName, studentName, context },
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
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Parent Letter Writer</h1>
            <p className="text-sm text-muted-foreground">Generate polished letters for every admissions scenario</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-lg">Letter Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Letter Type</Label>
                <Select value={letterType} onValueChange={setLetterType}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommendation_request">Recommendation Request</SelectItem>
                    <SelectItem value="thank_you">Thank You Letter</SelectItem>
                    <SelectItem value="follow_up">Follow-Up Letter</SelectItem>
                    <SelectItem value="appeal">Financial Aid Appeal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>School Name (optional)</Label>
                <Input value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. Deerfield Academy" className="mt-1.5" />
              </div>
              <div>
                <Label>Recipient Name (optional)</Label>
                <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="e.g. Mrs. Johnson" className="mt-1.5" />
              </div>
              <div>
                <Label>Student Name (optional)</Label>
                <Input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Emily" className="mt-1.5" />
              </div>
              <div>
                <Label>Context & Details</Label>
                <Textarea value={context} onChange={e => setContext(e.target.value)} placeholder="Describe the situation, what you want to convey..." className="mt-1.5 min-h-[100px]" />
              </div>
              <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Writing...</> : "Generate Letter"}
              </Button>
            </CardContent>
          </Card>

          <Card className="relative">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Letter</CardTitle>
              {result && <Button variant="ghost" size="sm" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>}
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{result}</ReactMarkdown></div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-12">Choose a letter type, fill in the details, and generate a polished draft.</p>
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
