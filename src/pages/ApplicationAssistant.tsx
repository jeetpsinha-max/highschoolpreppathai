import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lightbulb, FileEdit, ListChecks, Mail, Users, MessageCircle, Send, Loader2, Save, History, Trash2, FileUp, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatConversations, useSaveConversation, useDeleteConversation, ChatConversation } from "@/hooks/useChatConversations";
import { useUploadDocument } from "@/hooks/useDocuments";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ApplicationAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get state passed from Dashboard
  const passedState = location.state as { 
    chatMessages?: ChatMessage[]; 
    essayDraft?: string;
  } | null;
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("improve");

  // Chat state - initialize with passed messages if available
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(passedState?.chatMessages || []);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Conversation management
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState("New Conversation");
  const [showHistory, setShowHistory] = useState(false);
  
  // Document paste state
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [pastedContent, setPastedContent] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("essay");

  // Form states - initialize essay draft with passed content if available
  const [schoolName, setSchoolName] = useState("");
  const [brainstormContent, setBrainstormContent] = useState("");
  const [essayDraft, setEssayDraft] = useState(passedState?.essayDraft || "");
  const [activities, setActivities] = useState("");
  const [emailContext, setEmailContext] = useState("");
  const [parentSummary, setParentSummary] = useState("");

  // Hooks
  const { data: conversations = [], isLoading: conversationsLoading } = useChatConversations();
  const saveConversation = useSaveConversation();
  const deleteConversation = useDeleteConversation();
  const uploadDocument = useUploadDocument();

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

  // Auto-generate title from first message
  useEffect(() => {
    if (chatMessages.length === 1 && chatMessages[0].role === "user" && conversationTitle === "New Conversation") {
      const firstMessage = chatMessages[0].content;
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
      setConversationTitle(title);
    }
  }, [chatMessages, conversationTitle]);

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

  const handleSaveConversation = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save conversations",
        variant: "destructive"
      });
      return;
    }

    if (chatMessages.length === 0) {
      toast({
        title: "No messages",
        description: "Start a conversation before saving",
        variant: "destructive"
      });
      return;
    }

    saveConversation.mutate({
      id: currentConversationId || undefined,
      title: conversationTitle,
      messages: chatMessages,
      essayDraft: essayDraft || undefined,
      schoolName: schoolName || undefined,
    }, {
      onSuccess: (data) => {
        setCurrentConversationId(data.id);
      }
    });
  };

  const handleLoadConversation = (conv: ChatConversation) => {
    setCurrentConversationId(conv.id);
    setConversationTitle(conv.title);
    setChatMessages(conv.messages);
    setEssayDraft(conv.essay_draft || "");
    setSchoolName(conv.school_name || "");
    setShowHistory(false);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setConversationTitle("New Conversation");
    setChatMessages([]);
    setEssayDraft("");
    setSchoolName("");
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation.mutate(id);
  };

  const handleSaveDocument = async () => {
    if (!pastedContent.trim() || !documentName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both content and a document name",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save documents",
        variant: "destructive"
      });
      return;
    }

    // Create a text file from the pasted content
    const blob = new Blob([pastedContent], { type: "text/plain" });
    const file = new File([blob], `${documentName}.txt`, { type: "text/plain" });

    uploadDocument.mutate({
      file,
      name: documentName,
      type: documentType,
    }, {
      onSuccess: () => {
        setPastedContent("");
        setDocumentName("");
        setShowDocumentDialog(false);
      }
    });
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileEdit className="h-5 w-5 text-primary" />
                          Your Essay Draft
                        </CardTitle>
                        <CardDescription>Paste or write your essay draft here</CardDescription>
                      </div>
                      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileUp className="h-4 w-4 mr-1" />
                            Save as Doc
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Save Document</DialogTitle>
                            <DialogDescription>
                              Paste content and save it as a document
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="docName">Document Name</Label>
                              <Input 
                                id="docName"
                                placeholder="e.g., My Application Essay"
                                value={documentName}
                                onChange={(e) => setDocumentName(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="docType">Document Type</Label>
                              <Select value={documentType} onValueChange={setDocumentType}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="essay">Essay</SelectItem>
                                  <SelectItem value="transcript">Transcript</SelectItem>
                                  <SelectItem value="recommendation">Recommendation Letter</SelectItem>
                                  <SelectItem value="activities">Activities List</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="docContent">Content</Label>
                              <Textarea
                                id="docContent"
                                placeholder="Paste your document content here..."
                                value={pastedContent}
                                onChange={(e) => setPastedContent(e.target.value)}
                                rows={8}
                              />
                            </div>
                            <Button 
                              onClick={handleSaveDocument} 
                              disabled={uploadDocument.isPending}
                              className="w-full"
                            >
                              {uploadDocument.isPending ? (
                                <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Saving...</>
                              ) : (
                                <><Save className="mr-2 h-4 w-4" /> Save Document</>
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-primary" />
                          AI Assistant
                        </CardTitle>
                        <CardDescription>
                          Ask questions about your essay - the AI can see your draft
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleNewConversation}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowHistory(!showHistory)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleSaveConversation}
                          disabled={saveConversation.isPending || chatMessages.length === 0}
                        >
                          {saveConversation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {currentConversationId && (
                      <Input
                        value={conversationTitle}
                        onChange={(e) => setConversationTitle(e.target.value)}
                        className="mt-2 text-sm"
                        placeholder="Conversation title..."
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    {showHistory ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">Saved Conversations</h4>
                        {conversationsLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : conversations.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8 text-sm">
                            No saved conversations yet
                          </p>
                        ) : (
                          <ScrollArea className="h-[350px]">
                            <div className="space-y-2 pr-4">
                              {conversations.map((conv) => (
                                <div
                                  key={conv.id}
                                  onClick={() => handleLoadConversation(conv)}
                                  className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${
                                    currentConversationId === conv.id ? "border-primary bg-muted" : ""
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm truncate flex-1">{conv.title}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {conv.messages.length} messages • {new Date(conv.updated_at).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    ) : (
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
                    )}
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
