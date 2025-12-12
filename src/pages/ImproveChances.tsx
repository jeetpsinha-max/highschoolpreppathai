import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Loader2, 
  TrendingUp, 
  GraduationCap, 
  Users, 
  FileText, 
  Calendar,
  CheckCircle2,
  Lightbulb,
  Target,
  BookOpen,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSchools, useSchool } from "@/hooks/useSchools";
import { toast } from "sonner";

interface Plan {
  schoolInsights: {
    whatTheyValue: string[];
    typicalAcceptedStudent: string;
    standoutFactors: string[];
  };
  academicRecommendations: {
    coursesToTake: string[];
    subjectsToStrengthen: string[];
    testPrepTips: string;
  };
  extracurricularRecommendations: {
    activitiesToConsider: { activity: string; reason: string }[];
    leadershipOpportunities: string[];
    communityInvolvement: string;
  };
  applicationStrategy: {
    essayTopics: string[];
    interviewTips: string[];
    lettersOfRecommendation: string;
  };
  timeline: { timeframe: string; tasks: string[] }[];
  summary: string;
}

export default function ImproveChances() {
  const [searchParams] = useSearchParams();
  const preselectedSchoolId = searchParams.get("school");
  
  const [selectedSchoolId, setSelectedSchoolId] = useState(preselectedSchoolId || "");
  const [studentProfile, setStudentProfile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [schoolName, setSchoolName] = useState("");

  const { data: schools } = useSchools();
  const { data: preselectedSchool } = useSchool(preselectedSchoolId || "");

  useEffect(() => {
    if (preselectedSchoolId && preselectedSchool) {
      setSelectedSchoolId(preselectedSchoolId);
    }
  }, [preselectedSchoolId, preselectedSchool]);

  const generatePlan = async () => {
    if (!selectedSchoolId) {
      toast.error("Please select a school first");
      return;
    }

    setIsLoading(true);
    setPlan(null);

    try {
      const { data, error } = await supabase.functions.invoke("improve-chances", {
        body: { 
          schoolId: selectedSchoolId,
          studentProfile: studentProfile.trim() || undefined
        }
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setPlan(data.plan);
      setSchoolName(`${data.school.name} (${data.school.city}, ${data.school.state})`);
      toast.success("Improvement plan generated!");
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Improve Your Chances - PrepPath AI</title>
        <meta name="description" content="Get personalized strategies and recommendations to improve your admission chances at your target school." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-4">
              <TrendingUp className="h-4 w-4" />
              Strategic Planning
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Improve Your Chances</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get a personalized action plan with strategic insights, recommendations, 
              and a timeline to maximize your admission chances at your target school.
            </p>
          </div>

          {!plan ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Your Target School</CardTitle>
                <CardDescription>
                  Choose the school you're applying to and optionally share some background about yourself.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target School</label>
                  <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a school..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {schools?.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name} ({school.city}, {school.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">About You (Optional)</label>
                  <Textarea
                    placeholder="Share a bit about yourself: current grade, interests, extracurriculars, academic strengths, etc. This helps us personalize recommendations..."
                    value={studentProfile}
                    onChange={(e) => setStudentProfile(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    The more you share, the more tailored your plan will be
                  </p>
                </div>

                <Button 
                  onClick={generatePlan} 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || !selectedSchoolId}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Your Plan...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Generate Improvement Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal/5 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">Your Improvement Plan</h2>
                      <p className="text-muted-foreground">{schoolName}</p>
                    </div>
                    <Button variant="outline" onClick={() => setPlan(null)}>
                      Choose Different School
                    </Button>
                  </div>
                  <p className="mt-4 text-muted-foreground">{plan.summary}</p>
                </CardContent>
              </Card>

              {/* School Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    What This School Values
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {plan.schoolInsights.whatTheyValue.map((value, i) => (
                      <Badge key={i} variant="secondary">{value}</Badge>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-medium mb-2">Typical Accepted Student</h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.schoolInsights.typicalAcceptedStudent}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Standout Factors</h4>
                    <ul className="space-y-1">
                      {plan.schoolInsights.standoutFactors.map((factor, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                    Academic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Courses to Consider</h4>
                      <ul className="space-y-1">
                        {plan.academicRecommendations.coursesToTake.map((course, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Areas to Strengthen</h4>
                      <ul className="space-y-1">
                        {plan.academicRecommendations.subjectsToStrengthen.map((subject, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {subject}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <h4 className="font-medium mb-2">Test Prep Tips</h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.academicRecommendations.testPrepTips}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Extracurricular Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Extracurricular Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.extracurricularRecommendations.activitiesToConsider.map((item, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg">
                        <h4 className="font-medium">{item.activity}</h4>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Leadership Opportunities</h4>
                      <ul className="space-y-1">
                        {plan.extracurricularRecommendations.leadershipOpportunities.map((opp, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <Award className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Community Involvement</h4>
                      <p className="text-sm text-muted-foreground">
                        {plan.extracurricularRecommendations.communityInvolvement}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Application Strategy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Application Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Essay Topic Ideas</h4>
                    <ul className="space-y-1">
                      {plan.applicationStrategy.essayTopics.map((topic, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <FileText className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Interview Tips</h4>
                    <ul className="space-y-1">
                      {plan.applicationStrategy.interviewTips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                    <h4 className="font-medium mb-2">Letters of Recommendation</h4>
                    <p className="text-sm text-muted-foreground">
                      {plan.applicationStrategy.lettersOfRecommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-teal" />
                    Preparation Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {plan.timeline.map((phase, i) => (
                      <div key={i} className="relative pl-6 border-l-2 border-teal/30 last:border-l-transparent">
                        <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal"></div>
                        <h4 className="font-medium mb-2">{phase.timeframe}</h4>
                        <ul className="space-y-1">
                          {phase.tasks.map((task, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-teal mt-0.5 flex-shrink-0" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setPlan(null)}>
                  Try Different School
                </Button>
                <Link to="/ai-tools/interview">
                  <Button>
                    Practice Interview
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
