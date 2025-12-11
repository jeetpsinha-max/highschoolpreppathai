import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  GraduationCap, Search, Sparkles, MessageSquare, 
  FileText, Target, Brain, ArrowRight, CheckCircle 
} from "lucide-react";

const features = [
  { icon: Search, title: "School Finder", description: "Search and filter 350+ top schools", link: "/schools" },
  { icon: Target, title: "AI Matcher", description: "Get personalized school recommendations", link: "/ai-tools/matcher" },
  { icon: MessageSquare, title: "Interview Coach", description: "Practice with AI-powered feedback", link: "/ai-tools/interview" },
  { icon: FileText, title: "Application Assistant", description: "Essays, resumes, and more", link: "/ai-tools/application" },
  { icon: Brain, title: "SSAT Practice", description: "AI-generated practice tests", link: "/ai-tools/ssat" },
  { icon: Sparkles, title: "Improve Your Chances", description: "Strategic admission insights", link: "/ai-tools/improve" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full text-sm font-medium text-accent-foreground mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered School Discovery
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
              Find Your Best-Fit
              <span className="block text-secondary">High School with AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
              Discover, match, and apply to the nation's top private, boarding, magnet, and selective public high schools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
              <Link to="/ai-tools/matcher">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  <Target className="h-5 w-5" />
                  Try School Matcher
                </Button>
              </Link>
              <Link to="/schools">
                <Button variant="hero-outline" size="xl" className="gap-2 w-full sm:w-auto">
                  <Search className="h-5 w-5" />
                  Explore Schools
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered tools guide you through every step of the high school admissions journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link key={feature.title} to={feature.link}>
                <Card className="h-full group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-secondary">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "350+", label: "Schools" },
              { value: "50", label: "States Covered" },
              { value: "6", label: "AI Tools" },
              { value: "100%", label: "Free to Start" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl md:text-4xl font-bold text-secondary mb-2">{stat.value}</div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Find Your Path?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of students who've discovered their perfect school match.
            </p>
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl" className="gap-2">
                <GraduationCap className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
