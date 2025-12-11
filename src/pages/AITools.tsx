import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, MessageSquare, FileText, TrendingUp, Brain, Wand2, ArrowRight } from "lucide-react";

const tools = [
  {
    id: "matcher",
    title: "AI School Matcher",
    description: "Answer questions about your preferences and get personalized school recommendations with Reach, Target, and Safety lists.",
    icon: Target,
    color: "from-teal to-teal-light",
  },
  {
    id: "generator",
    title: "AI School Generator",
    description: "Describe your ideal school and we'll create a profile and find the 10 closest real matches.",
    icon: Wand2,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "interview",
    title: "Interview Coach",
    description: "Practice with AI-generated questions, get feedback on clarity and confidence, and track your progress.",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "improve",
    title: "Improve Your Chances",
    description: "Get strategic insights for any school: what they value, recommended activities, and preparation timelines.",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "ssat",
    title: "SSAT Practice",
    description: "AI-generated practice questions with explanations. Track scores and identify areas for improvement.",
    icon: Brain,
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "application",
    title: "Application Assistant",
    description: "Essay brainstorming, draft improvement, activity lists, resumes, and email templates.",
    icon: FileText,
    color: "from-indigo-500 to-violet-500",
  },
];

export default function AITools() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            AI-Powered Tools for Success
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our suite of AI tools guides you through every step of the high school admissions process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <CardHeader>
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-lg mb-4`}>
                  <tool.icon className="h-7 w-7" />
                </div>
                <CardTitle className="font-display">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={`/ai-tools/${tool.id}`}>
                  <Button variant="outline" className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground group-hover:border-secondary transition-colors">
                    Launch Tool
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
