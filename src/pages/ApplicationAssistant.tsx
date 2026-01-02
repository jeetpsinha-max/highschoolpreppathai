import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lightbulb, FileEdit, ListChecks, Mail, Users, MessageCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ApplicationAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("improve");

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form states
  const [schoolName, setSchoolName] = useState("");
  const [brainstormContent, setBrainstormContent] = useState("");
  const [essayDraft, setEssayDraft] = useState("");
  const [activities, setActivities] = useState("");
  const [emailContext, setEmailContext] = useState("");
  const [parentSummary, setParentSummary] = useState("");

  const assistantTypes = [
    { id: 'brainstorm', name: 'Essay Brainstorm', icon: Lightbulb, description: 'Generate creative essay ideas' },
    { id: 'improve', name: 'Draft Improvement', icon: FileEdit, description: 'Enhance your essay draft with AI chat' },
    { id: 'activities', name: 'Activity List', icon: ListChecks, description: 'Organize your activities' },
    { id: 'email', name: 'Email Templates', icon: Mail, description: 'Professional inquiry emails' },
    { id: 'parent_summary', name: 'Parent Summary', icon: Users, description: 'Progress summary for parents' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const getContentForType = (type: string): string => {
    switch (type) {
      case 'brainstorm': return brainstormContent;
      case 'improve': return essayDraft;
      case 'activities': return activities;
      case 'email': return emailContext;
      case 'parent_summary': return parentSummary;
      default: return '';
    }
  };

  const getPlaceholder = (type: string): string => {
    switch (type) {
      case 'brainstorm': return "Tell us about yourself: your interests, hobbies, memorable experiences, challenges you've overcome, or unique perspectives...";
      case 'improve': return "Paste your essay draft here for feedback and suggestions...";
      case 'activities': return "List your activities, clubs, sports, volunteer work, achievements, awards, etc. One per line works great!";
      case 'email': return "What do you want to ask about? (e.g., campus visit request, application deadline question, financial aid inquiry)";
      case 'parent_summary': return "Share details about your application progress, schools you're considering, deadlines coming up, etc.";
      default: return '';
    }
  };

  const setContentForType = (type: string, value: string) => {
    switch (type) {
      case 'brainstorm': setBrainstormContent(value); break;
      case 'improve': setEssayDraft(value); break;
      case 'activities': setActivities(value); break;
      case 'email': setEmailContext(value); break;
      case 'parent_summary': setParentSummary(value); break;
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("application-assistant", {
        body: {
          type: "chat",
          content: chatInput,
          essayDraft: essayDraft.trim() || undefined,
          schoolName: schoolName.trim() || undefined,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = { role: "assistant", content: data.result };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmit = async () => {
    const content = getContentForType(activeTab);
    
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please provide some information to work with.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('application-assistant', {
        body: { 
          type: activeTab, 
          content: content.trim(),
          schoolName: schoolName.trim() || undefined
        }
      });

      if (error) throw error;
      setResult(data.result);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get assistance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/ai-tools')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to AI Tools
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Application Assistant</h1>
            <p className="text-muted-foreground">
              AI-powered help for essays, activities, and more
            </p>
          </div>

          <div className="mb-6">
            <Label htmlFor="schoolName">School Name (optional)</Label>
            <Input
              id="schoolName"
              placeholder="e.g., Phillips Academy Andover"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Adding a school name helps tailor advice to that specific school
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 h-auto">
              {assistantTypes.map((type) => (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id}
                  className="flex flex-col items-center gap-1 py-3"
                >
                  <type.icon className="h-5 w-5" />
                  <span className="text-xs hidden sm:block">{type.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Draft Improvement with AI Chat */}
            <TabsContent value="improve">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Draft Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileEdit className="h-5 w-5 text-primary" />
                      Your Essay Draft
                    </CardTitle>
                    <CardDescription>Paste or write your essay draft here</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Paste your essay draft here..."
                      value={essayDraft}
                      onChange={(e) => setEssayDraft(e.target.value)}
                      rows={12}
                      className="resize-none"
                    />
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileEdit className="mr-2 h-4 w-4" />
                          Get Improvement Suggestions
                        </>
                      )}
                    </Button>
                    {result && activeTab === "improve" && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">AI Suggestions</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm">
                          {result}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Chat Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      AI Assistant
                    </CardTitle>
                    <CardDescription>
                      Ask questions about your essay - the AI can see your draft
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col h-[400px]">
                      <ScrollArea className="flex-1 pr-4 mb-4">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8">
                            <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="mb-2 text-sm">Ask questions about your essay!</p>
                            <ul className="text-xs mt-2 space-y-1">
                              <li>"How can I make my intro stronger?"</li>
                              <li>"Is my essay too long?"</li>
                              <li>"How do I show more personality?"</li>
                            </ul>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {chatMessages.map((message, index) => (
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
                            {chatLoading && (
                              <div className="flex justify-start">
                                <div className="bg-muted rounded-lg px-3 py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </div>
                        )}
                      </ScrollArea>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ask about your essay..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleChatSubmit();
                            }
                          }}
                          disabled={chatLoading}
                        />
                        <Button onClick={handleChatSubmit} disabled={chatLoading || !chatInput.trim()} size="icon">
                          {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Other Tool Tabs */}
            {assistantTypes.filter(t => t.id !== 'improve').map((type) => (
              <TabsContent key={type.id} value={type.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <type.icon className="h-5 w-5 text-primary" />
                      {type.name}
                    </CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={getPlaceholder(type.id)}
                      value={getContentForType(type.id)}
                      onChange={(e) => setContentForType(type.id, e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <type.icon className="mr-2 h-4 w-4" />
                          Get {type.name} Help
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {result && activeTab === type.id && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>AI Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap">{result}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplicationAssistant;
