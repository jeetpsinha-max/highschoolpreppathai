import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { 
  Target, MessageSquare, FileText, TrendingUp, Brain, Wand2, ArrowRight,
  DollarSign, MapPin, Mail, Calendar, Trophy, Sparkles, Star
} from "lucide-react";

interface ToolDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
  isNew?: boolean;
}

const tools: ToolDef[] = [
  // Discovery & Matching
  {
    id: "school-matcher",
    title: "AI School Matcher",
    description: "Answer questions about your preferences and get personalized Reach, Target, and Safety school lists.",
    icon: Target,
    color: "from-secondary to-secondary/80",
    category: "Discovery",
  },
  {
    id: "school-generator",
    title: "AI School Generator",
    description: "Describe your ideal school and we'll find the 10 closest real matches.",
    icon: Wand2,
    color: "from-purple-500 to-pink-500",
    category: "Discovery",
  },
  // Preparation
  {
    id: "ssat",
    title: "SSAT Practice",
    description: "AI-generated practice questions with explanations. Track scores and identify weak areas.",
    icon: Brain,
    color: "from-orange-500 to-amber-500",
    category: "Preparation",
  },
  {
    id: "interview",
    title: "Interview Coach",
    description: "Practice with AI-generated questions, get feedback on clarity and confidence.",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
    category: "Preparation",
  },
  {
    id: "improve",
    title: "Improve Your Chances",
    description: "Get strategic insights: what schools value, recommended activities, and timelines.",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-500",
    category: "Preparation",
  },
  // Application
  {
    id: "assistant",
    title: "Application Assistant",
    description: "Essay brainstorming, draft improvement, activity lists, resumes, and email templates.",
    icon: FileText,
    color: "from-indigo-500 to-violet-500",
    category: "Application",
  },
  {
    id: "parent-letters",
    title: "Parent Letter Writer",
    description: "Generate polished recommendation requests, thank-you notes, follow-ups, and aid appeals.",
    icon: Mail,
    color: "from-rose-500 to-pink-500",
    category: "Application",
    isNew: true,
  },
  // Planning
  {
    id: "timeline",
    title: "Admissions Timeline",
    description: "Get a personalized month-by-month preparation plan based on your target schools.",
    icon: Calendar,
    color: "from-violet-500 to-purple-600",
    category: "Planning",
    isNew: true,
  },
  {
    id: "visit-prep",
    title: "School Visit Prep",
    description: "Get personalized questions, checklists, and observation tips for campus visits.",
    icon: MapPin,
    color: "from-sky-500 to-blue-600",
    category: "Planning",
    isNew: true,
  },
  {
    id: "financial-aid",
    title: "Financial Aid Advisor",
    description: "Get personalized scholarship recommendations, aid strategies, and estimated costs.",
    icon: DollarSign,
    color: "from-emerald-500 to-green-600",
    category: "Planning",
    isNew: true,
  },
];

const categories = ["Discovery", "Preparation", "Application", "Planning"];
const categoryIcons: Record<string, React.ElementType> = {
  Discovery: Target,
  Preparation: Brain,
  Application: FileText,
  Planning: Calendar,
};

function getRecommendedToolIds(prefs: any): string[] {
  if (!prefs) return [];
  const recs: string[] = [];
  if (prefs.test_prep_status === "not_started" || prefs.test_prep_status === "studying") recs.push("ssat");
  if (prefs.priorities?.includes("Financial aid")) recs.push("financial-aid");
  if (prefs.interests?.includes("Athletics")) recs.push("sports-rankings");
  if (!prefs.application_year) recs.push("school-matcher");
  recs.push("timeline-planner", "improve-chances");
  return [...new Set(recs)];
}

export default function AITools() {
  const { preferences } = useUserPreferences();
  const recommended = getRecommendedToolIds(preferences);

  // Sort tools so recommended ones appear first within each category (subtle)
  const sortByRecommendation = (a: ToolDef, b: ToolDef) => {
    const aRec = recommended.includes(a.id) ? 1 : 0;
    const bRec = recommended.includes(b.id) ? 1 : 0;
    return bRec - aRec;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 md:px-4 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            <Sparkles className="h-4 w-4" />
            {preferences?.grade_level ? `Tools for ${preferences.grade_level} Graders` : '10 AI-Powered Tools'}
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2 md:mb-3">
            Your AI Admissions Toolkit
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            {preferences?.onboarding_completed
              ? `Personalized for your ${preferences.application_year || ''} application journey.`
              : 'From finding the right school to submitting polished applications — AI guidance at every step.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        {categories.map((category) => {
          const categoryTools = tools.filter((t) => t.category === category).sort(sortByRecommendation);
          const CatIcon = categoryIcons[category];
          return (
            <div key={category} className="mb-8 md:mb-10">
              <div className="flex items-center gap-2 mb-4 md:mb-5">
                <CatIcon className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg md:text-xl font-semibold text-foreground">{category}</h2>
                <Badge variant="secondary" className="ml-1 text-xs">{categoryTools.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {categoryTools.map((tool) => (
                  <Link key={tool.id} to={`/ai-tools/${tool.id}`} className="group">
                    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/30">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-md`}>
                            <tool.icon className="h-5 w-5" />
                          </div>
                          <div className="flex gap-1">
                            {recommended.includes(tool.id) && (
                              <Badge variant="outline" className="text-[10px] px-1.5 border-primary/40 text-primary">
                                <Star className="h-2.5 w-2.5 mr-0.5" /> For You
                              </Badge>
                            )}
                            {tool.isNew && (
                              <Badge className="bg-secondary text-secondary-foreground text-[10px] px-2">NEW</Badge>
                            )}
                          </div>
                        </div>
                        <CardTitle className="font-display text-base mt-3">{tool.title}</CardTitle>
                        <CardDescription className="text-xs leading-relaxed">{tool.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          Launch Tool <ArrowRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}
