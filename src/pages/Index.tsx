import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchoolTicker } from "@/components/SchoolTicker";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { RecommendedSchools } from "@/components/RecommendedSchools";
import {
  GraduationCap, Search, Sparkles, MessageSquare,
  FileText, Target, Brain, ArrowRight, CheckCircle, LayoutDashboard, Trophy
} from "lucide-react";

const features = [
  { icon: Search, title: "School Finder", description: "Search and filter 1,750+ schools nationwide", link: "/schools" },
  { icon: Trophy, title: "Sports Rankings", description: "Compare athletic programs by sport & state", link: "/sports-rankings" },
  { icon: Target, title: "AI Matcher", description: "Get personalized school recommendations", link: "/ai-tools/school-matcher" },
  { icon: MessageSquare, title: "Interview Coach", description: "Practice with AI-powered feedback", link: "/ai-tools/interview" },
  { icon: FileText, title: "Application Assistant", description: "Essays, resumes, and more", link: "/ai-tools/assistant" },
  { icon: Brain, title: "SSAT Practice", description: "AI-generated practice tests", link: "/ai-tools/ssat" },
];

export default function Index() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const isOnboarded = !!preferences?.onboarding_completed;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-12 md:py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium text-accent-foreground mb-4 md:mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              {user && isOnboarded ? "Personalized for you" : "AI-Powered School Discovery"}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 animate-fade-in-up">
              {user && preferences?.grade_level ? (
                <>
                  Welcome back,
                  <span className="block text-secondary">{preferences.grade_level} Grader</span>
                </>
              ) : (
                <>
                  Find Your Best-Fit
                  <span className="block text-secondary">High School with AI</span>
                </>
              )}
            </h1>

            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-100 px-2">
              {user && isOnboarded
                ? `Continue your ${preferences?.application_year || ""} application journey — your tools, schools, and progress are tailored to you.`
                : "Discover, match, and apply to the nation's top private, boarding, magnet, and selective public high schools."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center animate-fade-in-up animation-delay-200 px-2">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                      <LayoutDashboard className="h-5 w-5" />
                      My Dashboard
                    </Button>
                  </Link>
                  <Link to="/schools">
                    <Button variant="hero-outline" size="xl" className="gap-2 w-full sm:w-auto">
                      <Search className="h-5 w-5" />
                      Browse Schools
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/ai-tools/school-matcher">
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
                </>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Personalized recommendations for signed-in onboarded users */}
      {user && isOnboarded && (
        <section className="bg-background py-8 md:py-10 border-b">
          <div className="container mx-auto px-4">
            <RecommendedSchools />
          </div>
        </section>
      )}

      {/* School Ticker */}
      <SchoolTicker />

      {/* Features Grid */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
              {user && isOnboarded ? "Tools Built Around You" : "Everything You Need to Succeed"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-2">
              {user && isOnboarded
                ? "Each tool adapts to your grade, interests, and goals."
                : "Our AI-powered tools guide you through every step of the high school admissions journey."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.link}>
                <Card className="h-full group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-secondary">
                  <CardContent className="p-5 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-secondary transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { value: "1,750+", label: "Schools" },
              { value: "50", label: "States Covered" },
              { value: "275+", label: "Boarding Schools" },
              { value: "10", label: "AI Tools" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl md:text-4xl font-bold text-secondary mb-1 md:mb-2">{stat.value}</div>
                <div className="text-xs md:text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot Program Section - hidden for onboarded users */}
      {!isOnboarded && (
        <section className="py-12 md:py-20 bg-background border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <div className="inline-flex items-center gap-2 bg-secondary/10 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium text-secondary mb-3 md:mb-4">
                  <Sparkles className="h-4 w-4" />
                  Limited Pilot Program
                </div>
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
                  Join Our Exclusive Pilot
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base px-2">
                  We're partnering with select families and schools to shape the future of high school admissions.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <Card className="border-l-4 border-l-secondary">
                  <CardContent className="p-5 md:p-6">
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
                          <span className="text-muted-foreground text-sm md:text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-5 md:p-6">
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
                          <span className="text-muted-foreground text-sm md:text-base">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center mt-8 md:mt-10">
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
      )}

      {/* CTA Section */}
      {!user && (
        <section className="py-12 md:py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
                Ready to Find Your Path?
              </h2>
              <p className="text-muted-foreground mb-6 md:mb-8 text-sm md:text-base">
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
      )}

      <Footer />
    </div>
  );
}
