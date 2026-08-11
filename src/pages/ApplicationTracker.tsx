import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, Clock, FileText, GraduationCap, Plus, Sparkles, TrendingUp, Trash2, Award, Building } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";

interface ApplicationEntry {
  id: string;
  schoolName: string;
  category: "Reach" | "Target" | "Safety";
  deadline: string;
  status: "Not Started" | "Essay Drafting" | "Interview Completed" | "Submitted" | "Accepted";
  ssatScore: number;
  gpa: number;
  calculatedProbability: number;
}

const DEFAULT_APPLICATIONS: ApplicationEntry[] = [
  {
    id: "app-1",
    schoolName: "The Peddie School",
    category: "Target",
    deadline: "Jan 15",
    status: "Essay Drafting",
    ssatScore: 2180,
    gpa: 3.9,
    calculatedProbability: 78,
  },
  {
    id: "app-2",
    schoolName: "Phillips Andover",
    category: "Reach",
    deadline: "Jan 15",
    status: "Interview Completed",
    ssatScore: 2280,
    gpa: 3.95,
    calculatedProbability: 42,
  },
  {
    id: "app-3",
    schoolName: "Choate Rosemary Hall",
    category: "Target",
    deadline: "Jan 15",
    status: "Submitted",
    ssatScore: 2220,
    gpa: 3.88,
    calculatedProbability: 68,
  },
];

export default function ApplicationTracker() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [apps, setApps] = useState<ApplicationEntry[]>(DEFAULT_APPLICATIONS);
  const [newSchool, setNewSchool] = useState("");
  const [newCategory, setNewCategory] = useState<"Reach" | "Target" | "Safety">("Target");
  const [newSsat, setNewSsat] = useState("2150");
  const [newGpa, setNewGpa] = useState("3.85");

  const calculateProb = (ssat: number, gpa: number, category: string) => {
    let base = 50;
    if (ssat >= 2250) base += 20;
    else if (ssat >= 2100) base += 10;

    if (gpa >= 3.9) base += 15;
    else if (gpa >= 3.7) base += 8;

    if (category === "Reach") base -= 25;
    if (category === "Safety") base += 25;

    return Math.min(96, Math.max(15, base));
  };

  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool.trim()) return;

    const ssatNum = parseInt(newSsat) || 2100;
    const gpaNum = parseFloat(newGpa) || 3.8;
    const prob = calculateProb(ssatNum, gpaNum, newCategory);

    const entry: ApplicationEntry = {
      id: `app-${Date.now()}`,
      schoolName: newSchool,
      category: newCategory,
      deadline: "Jan 15",
      status: "Not Started",
      ssatScore: ssatNum,
      gpa: gpaNum,
      calculatedProbability: prob,
    };

    setApps([...apps, entry]);
    setNewSchool("");
    toast({
      title: "Application Added!",
      description: `${entry.schoolName} added with ${prob}% predicted acceptance chance.`,
    });
  };

  const handleDelete = (id: string) => {
    setApps(apps.filter((a) => a.id !== id));
  };

  const updateStatus = (id: string, status: ApplicationEntry["status"]) => {
    setApps(apps.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const avgProb = Math.round(apps.reduce((s, a) => s + a.calculatedProbability, 0) / (apps.length || 1));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/ai-tools")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Tools
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-2 px-3 py-1 border-primary/40 text-primary">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Admissions Command Center
          </Badge>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Boarding School Application Tracker</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl mx-auto">
            Track deadlines, application progress, and real-time AI acceptance probability predictions for top secondary schools.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="p-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Total Applications</span>
              <div className="text-3xl font-bold text-primary mt-1">{apps.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Average Acceptance Odds</span>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{avgProb}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Submitted</span>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {apps.filter((a) => a.status === "Submitted" || a.status === "Accepted").length} / {apps.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Next Deadline</span>
              <div className="text-2xl font-bold font-mono text-amber-500 mt-1">Jan 15</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Applications Table (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Active Applications
            </h2>

            {apps.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{app.schoolName}</h3>
                        <Badge
                          variant="outline"
                          className={
                            app.category === "Reach"
                              ? "border-amber-500 text-amber-500"
                              : app.category === "Safety"
                              ? "border-green-500 text-green-500"
                              : "border-primary text-primary"
                          }
                        >
                          {app.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 font-mono">
                        <span>SSAT Target: {app.ssatScore}</span>
                        <span>GPA: {app.gpa}</span>
                        <span>Deadline: {app.deadline}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Acceptance Probability */}
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground uppercase font-semibold">Acceptance Odds</div>
                        <div className="text-xl font-bold font-mono text-green-600 dark:text-green-400">
                          {app.calculatedProbability}%
                        </div>
                      </div>

                      {/* Status Selector */}
                      <Select value={app.status} onValueChange={(val: any) => updateStatus(app.id, val)}>
                        <SelectTrigger className="w-[150px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="Essay Drafting">Essay Drafting</SelectItem>
                          <SelectItem value="Interview Completed">Interview Done</SelectItem>
                          <SelectItem value="Submitted">Submitted</SelectItem>
                          <SelectItem value="Accepted">Accepted</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column: Add School Form (4 cols) */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" /> Add Target School
                </CardTitle>
                <CardDescription>Calculate acceptance chance for a new school</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSchool} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-muted-foreground uppercase">School Name</label>
                    <Input
                      placeholder="e.g. Phillips Exeter"
                      value={newSchool}
                      onChange={(e) => setNewSchool(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground uppercase">Category</label>
                    <Select value={newCategory} onValueChange={(val: any) => setNewCategory(val)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reach">Reach School</SelectItem>
                        <SelectItem value="Target">Target School</SelectItem>
                        <SelectItem value="Safety">Safety School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-muted-foreground uppercase">SSAT Score</label>
                      <Input
                        type="number"
                        placeholder="2150"
                        value={newSsat}
                        onChange={(e) => setNewSsat(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-muted-foreground uppercase">GPA</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3.85"
                        value={newGpa}
                        onChange={(e) => setNewGpa(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-2">
                    Add & Calculate Odds
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
