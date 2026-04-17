import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, Target, Mic, FileText, BookOpen, ExternalLink, Trash2, 
  Plus, Calendar, CheckCircle2, Edit2, ClipboardList, Scale, File,
  MessageCircle, Send, Loader2, Sparkles
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEssays } from "@/hooks/useEssays";
import { useChecklist } from "@/hooks/useChecklist";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DocumentUpload } from "@/components/DocumentUpload";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { RecommendedSchools } from "@/components/RecommendedSchools";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [savedSchools, setSavedSchools] = useState<SavedSchool[]>([]);
  const [matcherResults, setMatcherResults] = useState<MatcherResult[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [ssatPractice, setSSATPractice] = useState<SSATPractice[]>([]);
  const [loading, setLoading] = useState(true);

  // Essay management
  const { essays, createEssay, updateEssay, deleteEssay } = useEssays();
  const [newEssayTitle, setNewEssayTitle] = useState("");
  const [newEssayPrompt, setNewEssayPrompt] = useState("");
  const [editingEssay, setEditingEssay] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Checklist management
  const { items: checklistItems, addItem, toggleComplete, deleteItem, getUpcomingDeadlines, getOverdueTasks } = useChecklist();
  const [newTaskSchool, setNewTaskSchool] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");

  // AI Assistant state
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);

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

  // Show onboarding for new users
  useEffect(() => {
    if (user && !prefsLoading && !preferences?.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [user, prefsLoading, preferences]);

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

  const handleCreateEssay = async () => {
    if (!newEssayTitle) return;
    await createEssay(newEssayTitle, newEssayPrompt);
    setNewEssayTitle("");
    setNewEssayPrompt("");
  };

  const handleSaveEssayContent = async (id: string) => {
    await updateEssay(id, { content: editContent });
    setEditingEssay(null);
    setEditContent("");
  };

  const handleAddChecklistItem = async () => {
    if (!newTaskSchool || !newTaskName) return;
    await addItem(newTaskSchool, newTaskName, newTaskDate || undefined);
    setNewTaskSchool("");
    setNewTaskName("");
    setNewTaskDate("");
  };

  // AI Chat handler
  const handleAIChatSubmit = async () => {
    if (!aiChatInput.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: aiChatInput };
    setAiChatMessages((prev) => [...prev, userMessage]);
    setAiChatInput("");
    setAiChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("application-assistant", {
        body: {
          type: "chat",
          content: aiChatInput,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = { role: "assistant", content: data.result };
      setAiChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiChatLoading(false);
    }
  };

  // Scroll chat to bottom
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChatMessages]);

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

  const upcomingDeadlines = getUpcomingDeadlines(7);
  const overdueTasks = getOverdueTasks();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-20 md:pb-0">
      {showOnboarding && <OnboardingWizard onComplete={() => setShowOnboarding(false)} />}
      <Navbar />
      
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            {preferences?.grade_level
              ? `Welcome back, ${preferences.grade_level} Grader! 👋`
              : 'Your Dashboard'}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {preferences?.application_year
              ? `Preparing for your ${preferences.application_year} application journey`
              : 'Track your application progress and preparation'}
          </p>
        </div>

        {/* Deadline Alerts */}
        {(overdueTasks.length > 0 || upcomingDeadlines.length > 0) && (
          <div className="mb-6 space-y-3">
            {overdueTasks.length > 0 && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</span>
                  </div>
                </CardContent>
              </Card>
            )}
            {upcomingDeadlines.length > 0 && (
              <Card className="border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">{upcomingDeadlines.length} deadline{upcomingDeadlines.length > 1 ? 's' : ''} this week</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
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
                <ClipboardList className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {checklistItems.filter(i => i.completed).length}/{checklistItems.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Tasks</p>
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
                <Mic className="h-8 w-8 text-purple-500" />
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
                  <p className="text-sm text-muted-foreground">Avg SSAT</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Schools */}
        <div className="mb-8">
          <RecommendedSchools />
        </div>

        <Tabs defaultValue="essays" className="space-y-6">
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <TabsList className="inline-flex md:grid w-max md:w-full md:grid-cols-7 min-w-full md:min-w-0">
              <TabsTrigger value="essays">Essays</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="schools">Schools</TabsTrigger>
              <TabsTrigger value="matcher">Matcher</TabsTrigger>
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="ssat">SSAT</TabsTrigger>
            </TabsList>
          </div>

          {/* Essays Tab */}
          <TabsContent value="essays">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Essay Draft</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="essayTitle">Essay Title</Label>
                      <Input
                        id="essayTitle"
                        value={newEssayTitle}
                        onChange={(e) => setNewEssayTitle(e.target.value)}
                        placeholder="e.g., Why I Want to Attend..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="essayPrompt">Prompt (optional)</Label>
                      <Input
                        id="essayPrompt"
                        value={newEssayPrompt}
                        onChange={(e) => setNewEssayPrompt(e.target.value)}
                        placeholder="Enter the essay prompt..."
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateEssay} disabled={!newEssayTitle}>
                    <Plus className="h-4 w-4 mr-2" /> Create Draft
                  </Button>
                </CardContent>
              </Card>

              {essays.length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    {!showAIAssistant ? (
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">No essay drafts yet</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button onClick={() => setShowAIAssistant(true)} className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            Get Help from AI Assistant
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => navigate('/ai-tools/assistant', { 
                              state: { 
                                chatMessages: aiChatMessages,
                                essayDraft: editContent || undefined
                              } 
                            })}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Open Full Assistant
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">AI Essay Assistant</h3>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setShowAIAssistant(false)}>
                            Close
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                          Ask me anything about essays! I can help you brainstorm ideas, structure your thoughts, or improve your writing.
                        </p>

                        <ScrollArea className="h-[300px] border rounded-lg p-4 mb-4">
                          {aiChatMessages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p className="mb-3 text-sm">Try asking:</p>
                              <ul className="text-xs space-y-2">
                                <li className="bg-muted rounded-full px-3 py-1.5 inline-block">"Help me brainstorm essay topics"</li>
                                <li className="bg-muted rounded-full px-3 py-1.5 inline-block">"How do I start a 'Why this school' essay?"</li>
                                <li className="bg-muted rounded-full px-3 py-1.5 inline-block">"What makes a strong opening paragraph?"</li>
                              </ul>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {aiChatMessages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                                      message.role === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                  </div>
                                </div>
                              ))}
                              {aiChatLoading && (
                                <div className="flex justify-start">
                                  <div className="bg-muted rounded-lg px-3 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                </div>
                              )}
                              <div ref={aiChatEndRef} />
                            </div>
                          )}
                        </ScrollArea>

                        <div className="flex gap-2">
                          <Input
                            placeholder="Ask about essays, brainstorm ideas..."
                            value={aiChatInput}
                            onChange={(e) => setAiChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAIChatSubmit();
                              }
                            }}
                            disabled={aiChatLoading}
                          />
                          <Button onClick={handleAIChatSubmit} disabled={aiChatLoading || !aiChatInput.trim()} size="icon">
                            {aiChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {essays.map((essay) => (
                    <Card key={essay.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{essay.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={essay.status === 'final' ? 'default' : 'secondary'}>
                              {essay.status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteEssay(essay.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                        {essay.prompt && (
                          <CardDescription className="line-clamp-2">{essay.prompt}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Updated {new Date(essay.updated_at).toLocaleDateString()}
                        </p>
                        {editingEssay === essay.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              placeholder="Write your essay content..."
                              rows={6}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleSaveEssayContent(essay.id)}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingEssay(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {essay.content ? (
                              <p className="text-sm line-clamp-3 mb-3">{essay.content}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic mb-3">No content yet</p>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingEssay(essay.id);
                                setEditContent(essay.content || '');
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" /> Edit
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Checklist Tab */}
          <TabsContent value="checklist">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="taskSchool">School Name</Label>
                      <Input
                        id="taskSchool"
                        value={newTaskSchool}
                        onChange={(e) => setNewTaskSchool(e.target.value)}
                        placeholder="e.g., Phillips Academy"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taskName">Task</Label>
                      <Input
                        id="taskName"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="e.g., Submit application"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taskDate">Due Date (optional)</Label>
                      <Input
                        id="taskDate"
                        type="date"
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddChecklistItem} disabled={!newTaskSchool || !newTaskName}>
                    <Plus className="h-4 w-4 mr-2" /> Add Task
                  </Button>
                </CardContent>
              </Card>

              {checklistItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No tasks yet. Add your first task above!</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {checklistItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            item.completed ? 'bg-muted/50' : ''
                          } ${!item.completed && item.due_date && new Date(item.due_date) < new Date() ? 'border-destructive/50' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={(checked) => toggleComplete(item.id, !!checked)}
                            />
                            <div>
                              <p className={item.completed ? 'line-through text-muted-foreground' : ''}>
                                {item.task_name}
                              </p>
                              <p className="text-sm text-muted-foreground">{item.school_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.due_date && (
                              <Badge 
                                variant={item.completed ? 'secondary' : 
                                  new Date(item.due_date) < new Date() ? 'destructive' : 'outline'}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(item.due_date).toLocaleDateString()}
                              </Badge>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <DocumentUpload />
          </TabsContent>

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
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Link to="/schools/compare">
                    <Button variant="outline" size="sm">
                      <Scale className="h-4 w-4 mr-2" />
                      Compare Schools
                    </Button>
                  </Link>
                </div>
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
