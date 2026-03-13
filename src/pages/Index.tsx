import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchoolTicker } from "@/components/SchoolTicker";
import {
  GraduationCap, Search, Sparkles, MessageSquare,
  FileText, Target, Brain, ArrowRight, CheckCircle, Trophy, Star,
} from "lucide-react";

const features = [
  { icon: Search, title: "School Finder", description: "Search and filter 350+ top schools by grades, sports, location, and more", link: "/schools" },
  { icon: Target, title: "AI School Matcher", description: "Get personalized school recommendations based on your unique profile", link: "/ai-tools/school-matcher" },
  { icon: Trophy, title: "Sports Rankings", description: "Comprehensive varsity sports rankings separated by gender and sport", link: "/sports-rankings" },
  { icon: MessageSquare, title: "Interview Coach", description: "Practice admissions interviews with AI-powered real-time feedback", link: "/ai-tools/interview" },
  { icon: FileText, title: "Application Assistant", description: "Essays, personal statements, and application strategy support", link: "/ai-tools/assistant" },
  { icon: Brain, title: "SSAT Practice", description: "AI-generated practice tests with detailed score analysis", link: "/ai-tools/ssat" },
];

const stats = [
  { value: "350+", label: "Schools Ranked" },
  { value: "50", label: "States Covered" },
  { value: "6", label: "AI Tools" },
  { value: "10", label: "Grade Categories" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Dark premium */}
      <section className="relative overflow-hidden section-dark py-24 lg:py-36">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-1.5 rounded-full text-sm font-medium text-secondary mb-8 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Admissions Platform
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in-up leading-[1.1]">
              Your Path to the
              <span className="block gradient-text mt-2">Perfect School</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/60 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-100 leading-relaxed">
              Discover, compare, and apply to the nation's top private, boarding,
              magnet, and selective public high schools — guided by AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
              <Link to="/ai-tools/school-matcher">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  <Target className="h-5 w-5" />
                  Find Your Match
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

        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-secondary/3 rounded-full blur-3xl" />
        </div>
        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      </section>

      {/* School Ticker */}
      <SchoolTicker />

      {/* Stats Bar */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl md:text-4xl font-bold text-secondary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-secondary tracking-widest uppercase mb-3">
              Complete Toolkit
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Six powerful AI tools guide you through every step of the admissions journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.link}>
                <Card className="h-full group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-border hover:border-secondary/30 bg-card">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors duration-300">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-secondary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 section-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-secondary tracking-widest uppercase mb-3">
              How It Works
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              Three Steps to Your Best Fit
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Discover",
                description: "Browse 350+ schools with detailed grades across academics, sports, arts, and more.",
              },
              {
                step: "02",
                title: "Match",
                description: "Our AI analyzes your profile to recommend reach, target, and safety schools.",
              },
              {
                step: "03",
                title: "Prepare",
                description: "Practice interviews, refine essays, and build a winning application strategy.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-secondary/30 text-secondary font-display text-xl font-bold mb-5">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold text-primary-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-primary-foreground/50 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Program */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 px-4 py-1.5 rounded-full text-sm font-medium text-secondary mb-4">
                <Star className="h-3.5 w-3.5" />
                Limited Pilot
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Join Our Exclusive Pilot Program
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Partner with us to shape the future of high school admissions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-t-2 border-t-secondary">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-4">
                    For Families
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Free access to all AI tools",
                      "Personalized school matching",
                      "Direct feedback channel",
                      "Priority support",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-t-2 border-t-primary">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-4">
                    For Schools
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Enhanced visibility to matched students",
                      "Prospective applicant analytics",
                      "Admissions workflow integration",
                      "Co-develop platform features",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-10">
              <Link to="/pilot">
                <Button variant="outline" size="lg" className="gap-2">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 section-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Find Your Path?
            </h2>
            <p className="text-primary-foreground/50 mb-8 max-w-lg mx-auto">
              Join students and families discovering their perfect school match with AI-powered tools.
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
