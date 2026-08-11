import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Copy, Check, Sparkles, HelpCircle, CheckSquare, Star, Building2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const PRESET_VISIT_GUIDES: Record<string, { tourQuestions: string[]; keyChecklist: string[]; proTip: string }> = {
  "The Peddie School": {
    tourQuestions: [
      "How do students balance heavy honors/AP coursework with afternoon athletic commitments?",
      "What opportunities exist for freshman research or independent STEM projects in the science center?",
      "How does the residential house advisor system foster campus community?",
    ],
    keyChecklist: [
      "Observe a Harkness or discussion-based class in Annenberg Hall",
      "Check out the athletic facilities & Geiger-Reeves hall",
      "Ask a current student about weekend campus traditions & trips",
    ],
    proTip: "Peddie values genuine curiosity and community spirit. Mention your passion for collaborative learning!",
  },
  "Phillips Andover": {
    tourQuestions: [
      "How do students navigate course placement for advanced math and science?",
      "What support services exist for first-year boarding students adjusting to dormitory life?",
      "What are the most popular student-led clubs on campus?",
    ],
    keyChecklist: [
      "Visit the Addison Gallery of American Art & Oliver Wendell Holmes Library",
      "Observe student interactions in Paresky Commons during lunch",
      "Take note of dorm culture and house proctor mentorship",
    ],
    proTip: "Emphasize your alignment with Andover's non-sibi (not for self) motto in all discussions.",
  },
  "Phillips Exeter Academy": {
    tourQuestions: [
      "How does the Harkness method change the dynamic between teachers and students?",
      "What is the average prep workload per night for 9th/10th graders?",
      "How are athletic and arts requirements integrated into the weekly schedule?",
    ],
    keyChecklist: [
      "Sit at an actual Harkness table in a humanities or math class",
      "Tour the Louis Kahn Library — the largest secondary school library in the world",
      "Ask tour guides how quiet hours and dorm check-ins work",
    ],
    proTip: "Harkness requires active listening. Practice speaking thoughtfully rather than trying to dominate discussion.",
  },
};

export default function SchoolVisitPrep() {
  const [schoolName, setSchoolName] = useState("The Peddie School");
  const [studentInterests, setStudentInterests] = useState("Robotics, Varsity Soccer, Computer Science");
  const [visitDate, setVisitDate] = useState("");
  const [userMode, setUserMode] = useState("student");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const preset = PRESET_VISIT_GUIDES[schoolName] || PRESET_VISIT_GUIDES["The Peddie School"];

  const handleGenerate = () => {
    setIsLoading(true);

    setTimeout(() => {
      const generated = `# Campus Visit Guide: ${schoolName}
**Role:** ${userMode === "student" ? "Student Applicant" : "Parent"} | **Interests:** ${studentInterests || "STEM & Athletics"}

---

### 1. High-Yield Questions to Ask Your Tour Guide
${preset.tourQuestions.map((q, i) => `${i + 1}. "${q}"`).join("\n")}

---

### 2. Campus Inspection Checklist
${preset.keyChecklist.map((c) => `- [ ] ${c}`).join("\n")}

---

### 3. Insider Admissions Tip for ${schoolName}
> **Pro Tip:** ${preset.proTip}
`;
      setResult(generated);
      setIsLoading(false);
      toast.success(`Campus visit guide generated for ${schoolName}!`);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Visit guide copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-foreground">Campus Visit Prep & Checklist</h1>
              <Badge variant="outline" className="border-sky-500/40 text-sky-500">
                <Sparkles className="w-3 h-3 mr-1" /> AI Tour Guide
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Personalized campus visit checklists, insider questions, and observation guides for elite secondary schools.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-12">
          {/* Controls Form (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-sky-500" /> Target School Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <Label className="text-xs">Select Target School</Label>
                  <Select value={schoolName} onValueChange={setSchoolName}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="The Peddie School">The Peddie School</SelectItem>
                      <SelectItem value="Phillips Andover">Phillips Andover</SelectItem>
                      <SelectItem value="Phillips Exeter Academy">Phillips Exeter Academy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Applicant Role</Label>
                  <Select value={userMode} onValueChange={setUserMode}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student Applicant</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Student Key Interests</Label>
                  <Textarea
                    value={studentInterests}
                    onChange={(e) => setStudentInterests(e.target.value)}
                    placeholder="e.g. Robotics, Varsity Soccer, Debate, Theater..."
                    className="mt-1 text-xs"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-xs">Visit Date (Optional)</Label>
                  <Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} className="mt-1 text-xs" />
                </div>

                <Button onClick={handleGenerate} disabled={isLoading} className="w-full shadow-md">
                  {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Guide...</> : "Generate Personalized Visit Guide"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Visit Guide Output (7 cols) */}
          <div className="md:col-span-7">
            <Card className="h-full relative">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-sky-500" /> Customized Visit Guide
                </CardTitle>
                {result && (
                  <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs">
                    {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copied ? "Copied" : "Copy Guide"}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                {result ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3 text-muted-foreground">
                    <HelpCircle className="h-10 w-10 mx-auto opacity-40" />
                    <p className="text-sm">Click "Generate Personalized Visit Guide" to create tour questions and campus checklists.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
