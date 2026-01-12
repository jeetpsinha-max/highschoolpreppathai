import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Target, TrendingUp, Shield, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getGradeColor } from "@/lib/grading";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

interface SchoolMatch {
  id: string;
  name: string;
  reason: string;
  grades?: Record<string, string>;
}

interface MatchResults {
  reach: SchoolMatch[];
  target: SchoolMatch[];
  safety: SchoolMatch[];
  summary: string;
}

export default function SchoolMatcher() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MatchResults | null>(null);
  const [preferences, setPreferences] = useState({
    academicInterests: "",
    extracurriculars: "",
    preferredStates: [] as string[],
    boardingPreference: "",
    sizePreference: "",
    competitivenessLevel: "",
    specialPrograms: "",
    budgetNotes: "",
    additionalNotes: ""
  });

  const toggleState = (state: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredStates: prev.preferredStates.includes(state)
        ? prev.preferredStates.filter(s => s !== state)
        : [...prev.preferredStates, state]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("school-matcher", {
        body: { preferences }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResults(data.results);
      toast.success("School matches found!");
    } catch (error) {
      console.error("Matcher error:", error);
      toast.error("Failed to find matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const SchoolCard = ({ school, category }: { school: SchoolMatch; category: "reach" | "target" | "safety" }) => {
    const icons = {
      reach: <TrendingUp className="h-4 w-4" />,
      target: <Target className="h-4 w-4" />,
      safety: <Shield className="h-4 w-4" />
    };
    
    const colors = {
      reach: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      target: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      safety: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    };

    // Key grades to display
    const keyGrades = ['academics', 'sports', 'arts', 'campus'];

    return (
      <Card className="border-border/50 hover:border-primary/30 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold">{school.name}</CardTitle>
            <Badge variant="outline" className={colors[category]}>
              {icons[category]}
              <span className="ml-1 capitalize">{category}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{school.reason}</p>
          
          {/* Display grades if available */}
          {school.grades && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {keyGrades.map(key => {
                const grade = school.grades?.[key];
                if (!grade) return null;
                return (
                  <Badge key={key} className={`${getGradeColor(grade)} text-xs`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {grade}
                  </Badge>
                );
              })}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2 p-0 h-auto text-primary"
            onClick={() => navigate(`/schools/${school.id}`)}
          >
            View School <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Matching
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">School Matcher</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tell us about your interests, preferences, and goals. Our AI will analyze 500+ schools 
              to find your best-fit reach, target, and safety schools.
            </p>
          </div>

          {!results ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
                <CardDescription>
                  The more details you provide, the better your matches will be.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="academicInterests">Academic Interests</Label>
                      <Input
                        id="academicInterests"
                        placeholder="e.g., STEM, humanities, arts, languages..."
                        value={preferences.academicInterests}
                        onChange={(e) => setPreferences(p => ({ ...p, academicInterests: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="extracurriculars">Extracurricular Interests</Label>
                      <Input
                        id="extracurriculars"
                        placeholder="e.g., sports, music, debate, robotics..."
                        value={preferences.extracurriculars}
                        onChange={(e) => setPreferences(p => ({ ...p, extracurriculars: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred States (click to select)</Label>
                    <div className="flex flex-wrap gap-1.5 p-3 border rounded-md bg-muted/30 max-h-32 overflow-y-auto">
                      {US_STATES.map(state => (
                        <Badge
                          key={state}
                          variant={preferences.preferredStates.includes(state) ? "default" : "outline"}
                          className="cursor-pointer hover:bg-primary/80 transition-colors"
                          onClick={() => toggleState(state)}
                        >
                          {state}
                        </Badge>
                      ))}
                    </div>
                    {preferences.preferredStates.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Selected: {preferences.preferredStates.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Boarding Preference</Label>
                      <Select 
                        value={preferences.boardingPreference} 
                        onValueChange={(v) => setPreferences(p => ({ ...p, boardingPreference: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boarding">Boarding Only</SelectItem>
                          <SelectItem value="day">Day School Only</SelectItem>
                          <SelectItem value="either">Either is fine</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>School Size</Label>
                      <Select 
                        value={preferences.sizePreference} 
                        onValueChange={(v) => setPreferences(p => ({ ...p, sizePreference: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Small">Small</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Large">Large</SelectItem>
                          <SelectItem value="any">No preference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Competitiveness</Label>
                      <Select 
                        value={preferences.competitivenessLevel} 
                        onValueChange={(v) => setPreferences(p => ({ ...p, competitivenessLevel: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Highly Selective">Highly Selective</SelectItem>
                          <SelectItem value="Selective">Selective</SelectItem>
                          <SelectItem value="Competitive">Competitive</SelectItem>
                          <SelectItem value="any">Any level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialPrograms">Special Programs or Features</Label>
                    <Input
                      id="specialPrograms"
                      placeholder="e.g., learning differences support, religious affiliation, single-gender..."
                      value={preferences.specialPrograms}
                      onChange={(e) => setPreferences(p => ({ ...p, specialPrograms: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Anything else we should know about what you're looking for..."
                      value={preferences.additionalNotes}
                      onChange={(e) => setPreferences(p => ({ ...p, additionalNotes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding Your Matches...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Find My School Matches
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <h2 className="font-semibold mb-2">AI Assessment</h2>
                  <p className="text-muted-foreground">{results.summary}</p>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {results.reach?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-amber-500" />
                      Reach Schools ({results.reach.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {results.reach.map((school, i) => (
                        <SchoolCard key={i} school={school} category="reach" />
                      ))}
                    </div>
                  </div>
                )}

                {results.target?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-500" />
                      Target Schools ({results.target.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {results.target.map((school, i) => (
                        <SchoolCard key={i} school={school} category="target" />
                      ))}
                    </div>
                  </div>
                )}

                {results.safety?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-500" />
                      Safety Schools ({results.safety.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {results.safety.map((school, i) => (
                        <SchoolCard key={i} school={school} category="safety" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setResults(null)}>
                  Start Over
                </Button>
                <Button onClick={() => navigate("/schools")}>
                  Browse All Schools
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
