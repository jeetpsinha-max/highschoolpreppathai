import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Lightbulb, FileEdit, ListChecks, Mail, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const ApplicationAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("brainstorm");

  // Form states
  const [schoolName, setSchoolName] = useState("");
  const [brainstormContent, setBrainstormContent] = useState("");
  const [essayDraft, setEssayDraft] = useState("");
  const [activities, setActivities] = useState("");
  const [emailContext, setEmailContext] = useState("");
  const [parentSummary, setParentSummary] = useState("");

  const assistantTypes = [
    { id: 'brainstorm', name: 'Essay Brainstorm', icon: Lightbulb, description: 'Generate creative essay ideas' },
    { id: 'improve', name: 'Draft Improvement', icon: FileEdit, description: 'Enhance your essay draft' },
    { id: 'activities', name: 'Activity List', icon: ListChecks, description: 'Organize your activities' },
    { id: 'email', name: 'Email Templates', icon: Mail, description: 'Professional inquiry emails' },
    { id: 'parent_summary', name: 'Parent Summary', icon: Users, description: 'Progress summary for parents' },
  ];

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
                  <span className="text-xs">{type.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {assistantTypes.map((type) => (
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
                          <span className="animate-spin mr-2">⏳</span>
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
              </TabsContent>
            ))}
          </Tabs>

          {result && (
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplicationAssistant;
