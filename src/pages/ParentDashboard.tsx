import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Heart, Target, Mic, FileText, BookOpen, ExternalLink, 
  Users, AlertCircle, CheckCircle2, Clock, Calendar 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEssays } from "@/hooks/useEssays";
import { useChecklist } from "@/hooks/useChecklist";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface StudentData {
  savedSchools: any[];
  matcherResults: any[];
  interviewSessions: any[];
  ssatPractice: any[];
  profile: any;
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isParent, linkedStudentId, linkStudent, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [studentEmail, setStudentEmail] = useState("");
  const [linking, setLinking] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  const { essays } = useEssays(linkedStudentId || undefined);
  const { items: checklistItems, getUpcomingDeadlines, getOverdueTasks } = useChecklist(linkedStudentId || undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && user && !isParent()) {
      navigate('/dashboard');
    }
  }, [roleLoading, user, isParent, navigate]);

  useEffect(() => {
    if (linkedStudentId) {
      fetchStudentData();
    } else {
      setLoading(false);
    }
  }, [linkedStudentId]);

  const fetchStudentData = async () => {
    if (!linkedStudentId) return;
    
    setLoading(true);
    try {
      const [schoolsRes, matcherRes, interviewRes, ssatRes, profileRes] = await Promise.all([
        supabase
          .from('saved_schools')
          .select('*, schools(name, city, state, competitiveness)')
          .eq('user_id', linkedStudentId)
          .order('created_at', { ascending: false }),
        supabase
          .from('matcher_results')
          .select('*')
          .eq('user_id', linkedStudentId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('interview_sessions')
          .select('*')
          .eq('user_id', linkedStudentId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('ssat_practice')
          .select('*')
          .eq('user_id', linkedStudentId)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', linkedStudentId)
          .maybeSingle(),
      ]);

      setStudentData({
        savedSchools: schoolsRes.data || [],
        matcherResults: matcherRes.data || [],
        interviewSessions: interviewRes.data || [],
        ssatPractice: ssatRes.data || [],
        profile: profileRes.data,
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkStudent = async () => {
    if (!studentEmail) return;
    
    setLinking(true);
    const result = await linkStudent(studentEmail);
    setLinking(false);

    if (result.error) {
      toast({ 
        title: "Error linking student", 
        description: result.error instanceof Error ? result.error.message : "Please try again",
        variant: "destructive" 
      });
    } else {
      toast({ title: "Student linked successfully!" });
      setStudentEmail("");
    }
  };

  const getAverageScore = (items: any[], key: string) => {
    const withScores = items.filter(i => i[key] !== null);
    if (withScores.length === 0) return null;
    return Math.round(withScores.reduce((acc, i) => acc + (i[key] || 0), 0) / withScores.length);
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!linkedStudentId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle>Link Your Child's Account</CardTitle>
              </div>
              <CardDescription>
                Enter your child's email address to view their application progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studentEmail">Student's Email</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@email.com"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleLinkStudent} 
                disabled={linking || !studentEmail}
                className="w-full"
              >
                {linking ? "Linking..." : "Link Student Account"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Make sure your child has already created an account with this email.
              </p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const upcomingDeadlines = getUpcomingDeadlines(7);
  const overdueTasks = getOverdueTasks();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Parent Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Viewing progress for: <span className="font-medium">{studentData?.profile?.full_name || 'Your Child'}</span>
          </p>
        </div>

        {/* Alerts Section */}
        {(overdueTasks.length > 0 || upcomingDeadlines.length > 0) && (
          <div className="mb-8 space-y-4">
            {overdueTasks.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">
                        {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {overdueTasks.map(t => t.task_name).join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {upcomingDeadlines.length > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-700">
                        {upcomingDeadlines.length} Deadline{upcomingDeadlines.length > 1 ? 's' : ''} This Week
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {upcomingDeadlines.map(t => `${t.task_name} (${t.school_name})`).join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{studentData?.savedSchools.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Saved Schools</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{essays.length}</p>
                  <p className="text-sm text-muted-foreground">Essays</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {checklistItems.filter(i => i.completed).length}/{checklistItems.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Tasks Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Mic className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {getAverageScore(studentData?.interviewSessions || [], 'score') ?? '-'}%
                  </p>
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
                  <p className="text-2xl font-bold">
                    {getAverageScore(studentData?.ssatPractice || [], 'score') ?? '-'}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg SSAT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="essays">Essays</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="schools">Schools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Essay Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {essays.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No essays yet</p>
                  ) : (
                    <div className="space-y-3">
                      {essays.slice(0, 5).map((essay) => (
                        <div key={essay.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{essay.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Updated {new Date(essay.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={essay.status === 'final' ? 'default' : 'secondary'}>
                            {essay.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  {checklistItems.filter(i => !i.completed && i.due_date).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No upcoming deadlines</p>
                  ) : (
                    <div className="space-y-3">
                      {checklistItems
                        .filter(i => !i.completed && i.due_date)
                        .slice(0, 5)
                        .map((item) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.task_name}</p>
                              <p className="text-sm text-muted-foreground">{item.school_name}</p>
                            </div>
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.due_date!).toLocaleDateString()}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="essays">
            {essays.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No essay drafts yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {essays.map((essay) => (
                  <Card key={essay.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{essay.title}</CardTitle>
                        <Badge variant={essay.status === 'final' ? 'default' : 'secondary'}>
                          {essay.status}
                        </Badge>
                      </div>
                      {essay.prompt && (
                        <CardDescription className="line-clamp-2">{essay.prompt}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(essay.updated_at).toLocaleDateString()}
                      </p>
                      {essay.content && (
                        <p className="text-sm mt-2 line-clamp-3">{essay.content}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="checklist">
            <Card>
              <CardHeader>
                <CardTitle>Application Checklist Progress</CardTitle>
                <CardDescription>
                  {checklistItems.filter(i => i.completed).length} of {checklistItems.length} tasks completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checklistItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No checklist items yet</p>
                ) : (
                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          item.completed ? 'bg-muted/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 
                            className={`h-5 w-5 ${
                              item.completed ? 'text-green-500' : 'text-muted-foreground'
                            }`} 
                          />
                          <div>
                            <p className={item.completed ? 'line-through text-muted-foreground' : ''}>
                              {item.task_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{item.school_name}</p>
                          </div>
                        </div>
                        {item.due_date && (
                          <Badge variant={item.completed ? 'secondary' : 'outline'}>
                            {new Date(item.due_date).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schools">
            {studentData?.savedSchools.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No saved schools yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentData?.savedSchools.map((saved: any) => (
                  <Card key={saved.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{saved.schools?.name}</CardTitle>
                      <CardDescription>
                        {saved.schools?.city}, {saved.schools?.state}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">{saved.schools?.competitiveness}</Badge>
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

export default ParentDashboard;
