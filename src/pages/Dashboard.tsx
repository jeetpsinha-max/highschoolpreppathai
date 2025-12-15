import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Target, Mic, FileText, BookOpen, ExternalLink, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface SavedSchool {
  id: string;
  school_id: string;
  category: string;
  created_at: string;
  schools: {
    name: string;
    city: string;
    state: string;
    competitiveness: string;
  };
}

interface MatcherResult {
  id: string;
  created_at: string;
  reach_schools: any[] | null;
  target_schools: any[] | null;
  safety_schools: any[] | null;
}

interface InterviewSession {
  id: string;
  created_at: string;
  score: number | null;
  feedback: any;
}

interface SSATPractice {
  id: string;
  created_at: string;
  section: string;
  score: number | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [savedSchools, setSavedSchools] = useState<SavedSchool[]>([]);
  const [matcherResults, setMatcherResults] = useState<MatcherResult[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [ssatPractice, setSSATPractice] = useState<SSATPractice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, matcherRes, interviewRes, ssatRes] = await Promise.all([
        supabase
          .from('saved_schools')
          .select('*, schools(name, city, state, competitiveness)')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('matcher_results')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('interview_sessions')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('ssat_practice')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (schoolsRes.data) setSavedSchools(schoolsRes.data as SavedSchool[]);
      if (matcherRes.data) setMatcherResults(matcherRes.data as unknown as MatcherResult[]);
      if (interviewRes.data) setInterviewSessions(interviewRes.data);
      if (ssatRes.data) setSSATPractice(ssatRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedSchool = async (id: string) => {
    try {
      await supabase.from('saved_schools').delete().eq('id', id);
      setSavedSchools(prev => prev.filter(s => s.id !== id));
      toast({ title: "School removed from saved list" });
    } catch (error) {
      toast({ title: "Error removing school", variant: "destructive" });
    }
  };

  const getAverageSSATScore = () => {
    const withScores = ssatPractice.filter(p => p.score !== null);
    if (withScores.length === 0) return null;
    return Math.round(withScores.reduce((acc, p) => acc + (p.score || 0), 0) / withScores.length);
  };

  const getAverageInterviewScore = () => {
    const withScores = interviewSessions.filter(s => s.score !== null);
    if (withScores.length === 0) return null;
    return Math.round(withScores.reduce((acc, s) => acc + (s.score || 0), 0) / withScores.length);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">Track your application progress and preparation</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{savedSchools.length}</p>
                  <p className="text-sm text-muted-foreground">Saved Schools</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{matcherResults.length}</p>
                  <p className="text-sm text-muted-foreground">Matcher Results</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Mic className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{getAverageInterviewScore() ?? '-'}%</p>
                  <p className="text-sm text-muted-foreground">Avg Interview</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{getAverageSSATScore() ?? '-'}%</p>
                  <p className="text-sm text-muted-foreground">Avg SSAT Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schools">Saved Schools</TabsTrigger>
            <TabsTrigger value="matcher">Matcher Results</TabsTrigger>
            <TabsTrigger value="interview">Interview Practice</TabsTrigger>
            <TabsTrigger value="ssat">SSAT Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="schools">
            {savedSchools.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No saved schools yet</p>
                  <Button onClick={() => navigate('/schools')}>Browse Schools</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSchools.map((saved) => (
                  <Card key={saved.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{saved.schools?.name}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeSavedSchool(saved.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <CardDescription>
                        {saved.schools?.city}, {saved.schools?.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{saved.schools?.competitiveness}</Badge>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => navigate(`/schools/${saved.school_id}`)}
                        >
                          View <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matcher">
            {matcherResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No matcher results yet</p>
                  <Button onClick={() => navigate('/ai-tools/school-matcher')}>
                    Take School Matcher Assessment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {matcherResults.map((result) => (
                  <Card key={result.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Assessment from {new Date(result.created_at).toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-semibold text-red-600 mb-2">Reach Schools ({result.reach_schools?.length || 0})</p>
                          <ul className="text-sm space-y-1">
                            {result.reach_schools?.slice(0, 3).map((s: any, i: number) => (
                              <li key={i}>{s.name}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-yellow-600 mb-2">Target Schools ({result.target_schools?.length || 0})</p>
                          <ul className="text-sm space-y-1">
                            {result.target_schools?.slice(0, 3).map((s: any, i: number) => (
                              <li key={i}>{s.name}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-green-600 mb-2">Safety Schools ({result.safety_schools?.length || 0})</p>
                          <ul className="text-sm space-y-1">
                            {result.safety_schools?.slice(0, 3).map((s: any, i: number) => (
                              <li key={i}>{s.name}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="interview">
            {interviewSessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No interview practice sessions yet</p>
                  <Button onClick={() => navigate('/ai-tools/interview')}>
                    Start Interview Practice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {interviewSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            Session on {new Date(session.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {session.score !== null && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{session.score}%</p>
                            <Progress value={session.score} className="w-24" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ssat">
            {ssatPractice.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No SSAT practice sessions yet</p>
                  <Button onClick={() => navigate('/ai-tools/ssat')}>
                    Start SSAT Practice
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ssatPractice.map((practice) => (
                  <Card key={practice.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className="mb-2">{practice.section}</Badge>
                          <p className="text-sm text-muted-foreground">
                            {new Date(practice.created_at).toLocaleDateString()} at{' '}
                            {new Date(practice.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {practice.score !== null && (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{practice.score}%</p>
                            <Progress value={practice.score} className="w-24" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
