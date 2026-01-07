import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchoolTicker } from "@/components/SchoolTicker";
import { 
  GraduationCap, Search, Sparkles, MessageSquare, 
  FileText, Target, Brain, ArrowRight, CheckCircle,
  Users, Star, Clock, Shield, Zap, BookOpen
} from "lucide-react";

const features = [
  { icon: Search, title: "School Finder", description: "Search and filter 350+ top schools", link: "/schools" },
  { icon: Target, title: "AI Matcher", description: "Get personalized school recommendations", link: "/ai-tools/school-matcher" },
  { icon: MessageSquare, title: "Interview Coach", description: "Practice with AI-powered feedback", link: "/ai-tools/interview" },
  { icon: FileText, title: "Application Assistant", description: "Essays, resumes, and more", link: "/ai-tools/assistant" },
  { icon: Brain, title: "SSAT Practice", description: "AI-generated practice tests", link: "/ai-tools/ssat" },
  { icon: Sparkles, title: "Improve Your Chances", description: "Strategic admission insights", link: "/ai-tools/improve" },
];

const howItWorks = [
  { step: 1, title: "Create Your Profile", description: "Tell us about your academic interests, activities, and what you're looking for in a school.", icon: Users },
  { step: 2, title: "Get AI-Matched Schools", description: "Our AI analyzes your profile against 350+ schools to find your best matches.", icon: Target },
  { step: 3, title: "Prepare & Apply", description: "Use our tools to practice interviews, write essays, and track deadlines.", icon: BookOpen },
];

const testimonials = [
  { name: "Sarah M.", role: "Student, Class of 2025", quote: "The AI matcher found schools I never would have discovered on my own. I'm now attending my dream school!", rating: 5 },
  { name: "James L.", role: "Parent", quote: "The interview coach was invaluable. My daughter's confidence improved dramatically.", rating: 5 },
  { name: "Emily R.", role: "Student, Class of 2024", quote: "The essay assistant helped me articulate my story in a way that truly represented me.", rating: 5 },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-accent/30 to-background py-24 lg:py-36">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-full text-sm font-medium text-secondary mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered School Discovery
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 animate-fade-in-up leading-tight">
              Find Your Best-Fit
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">High School with AI</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
              Discover, match, and apply to the nation's top private, boarding, magnet, and selective public high schools—all with AI-powered guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
              <Link to="/ai-tools/school-matcher">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto group">
                  <Target className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Try School Matcher
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/schools">
                <Button variant="hero-outline" size="xl" className="gap-2 w-full sm:w-auto">
                  <Search className="h-5 w-5" />
                  Explore Schools
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-secondary" />
                <span>100% Free to Start</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-secondary" />
                <span>Ready in Minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-secondary" />
                <span>AI-Powered Matching</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-secondary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* School Ticker */}
      <SchoolTicker />

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get matched with your ideal schools in three simple steps
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="relative">
                  <Card className="h-full text-center p-6 border-t-4 border-t-secondary hover:shadow-lg transition-shadow">
                    <CardContent className="pt-4">
                      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                        <item.icon className="h-8 w-8 text-secondary" />
                      </div>
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-4">
                        {item.step}
                      </div>
                      <h3 className="font-display font-semibold text-lg text-foreground mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
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
            {features.map((feature) => (
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
      <section className="py-16 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "350+", label: "Schools" },
              { value: "50", label: "States Covered" },
              { value: "6", label: "AI Tools" },
              { value: "100%", label: "Free to Start" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="font-display text-3xl md:text-5xl font-bold text-secondary">{stat.value}</div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Families Are Saying
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and parents who've found success with BoardingSchoolBuddy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Program Section */}
      <section className="py-20 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full text-sm font-medium text-secondary mb-4">
                <Sparkles className="h-4 w-4" />
                Limited Pilot Program
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Join Our Exclusive Pilot
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're partnering with select families and schools to shape the future of high school admissions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-t-4 border-t-secondary">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-4">For Families</h3>
                  <ul className="space-y-3">
                    {[
                      "Free access to all AI tools during pilot",
                      "Personalized school matching & recommendations",
                      "Direct feedback channel to shape features",
                      "Priority support from our team",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-4">For Schools</h3>
                  <ul className="space-y-3">
                    {[
                      "Enhanced visibility to matched students",
                      "Analytics on prospective applicant interests",
                      "Direct integration with admissions workflow",
                      "Co-develop features for your needs",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center mt-10">
              <Link to="/pilot">
                <Button variant="outline" size="lg" className="gap-2">
                  Learn More About the Pilot
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary via-primary to-secondary/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Ready to Find Your Path?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10">
              Join thousands of students who've discovered their perfect school match with AI-powered guidance.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="xl" className="gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <GraduationCap className="h-5 w-5" />
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
