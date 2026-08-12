import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SchoolTicker } from "@/components/SchoolTicker";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { RecommendedSchools } from "@/components/RecommendedSchools";
import { OnboardingNextStepCTA } from "@/components/OnboardingNextStepCTA";
import { useState, useEffect, useRef } from "react";
import {
  GraduationCap, Search, Sparkles, MessageSquare,
  FileText, Target, Brain, ArrowRight, CheckCircle,
  Trophy, Star, Users, Building2, TrendingUp,
  Shield, Clock, ChevronRight
} from "lucide-react";

/* ─── Static Data ───────────────────────────────────────────── */
const features = [
  {
    icon: Search,
    title: "School Finder",
    description: "Search and filter 1,750+ schools nationwide by location, size, tuition, athletics, and more.",
    link: "/schools",
    gradient: "from-blue-600 to-blue-400",
    glow: "group-hover:shadow-blue-500/25",
  },
  {
    icon: Trophy,
    title: "Sports Rankings",
    description: "Compare athletic programs by sport & state. Find where your sport is strongest.",
    link: "/sports-rankings",
    gradient: "from-amber-500 to-orange-400",
    glow: "group-hover:shadow-amber-500/25",
  },
  {
    icon: Target,
    title: "AI Matcher",
    description: "Get personalized school recommendations based on your profile, goals, and preferences.",
    link: "/ai-tools/school-matcher",
    gradient: "from-teal-500 to-emerald-400",
    glow: "group-hover:shadow-teal-500/25",
  },
  {
    icon: MessageSquare,
    title: "Interview Coach",
    description: "Practice admission interviews with AI-powered feedback. Walk in confident.",
    link: "/ai-tools/interview",
    gradient: "from-purple-500 to-violet-400",
    glow: "group-hover:shadow-purple-500/25",
  },
  {
    icon: FileText,
    title: "Application Assistant",
    description: "AI-crafted essays, activity lists, and resumes tuned to each school's culture.",
    link: "/ai-tools/assistant",
    gradient: "from-rose-500 to-pink-400",
    glow: "group-hover:shadow-rose-500/25",
  },
  {
    icon: Brain,
    title: "SSAT Practice",
    description: "AI-generated practice tests with adaptive difficulty and instant explanations.",
    link: "/ai-tools/ssat",
    gradient: "from-cyan-500 to-sky-400",
    glow: "group-hover:shadow-cyan-500/25",
  },
];

const stats = [
  { value: "1,750+", label: "Schools Indexed", icon: Building2 },
  { value: "50", label: "States Covered", icon: Shield },
  { value: "< 30s", label: "To Get Matched", icon: Clock },
];

const steps = [
  {
    step: "01",
    title: "Build Your Profile",
    description: "Enter your grade, GPA, test scores, sports, and dream school traits. Takes 3 minutes.",
  },
  {
    step: "02",
    title: "Get AI-Matched",
    description: "Our model ranks 1,750+ schools against your profile and surfaces your best-fit schools.",
  },
  {
    step: "03",
    title: "Apply with AI",
    description: "Use our suite — essay writer, interview coach, SSAT prep — to make every application elite.",
  },
];

const testimonials = [
  {
    name: "Sophia R.",
    school: "Accepted to Andover '25",
    quote: "PrepPath's AI matcher surfaced Andover as my #1 fit when I hadn't even considered it. The interview coach got me ready in a week.",
    avatar: "SR",
    stars: 5,
  },
  {
    name: "Marcus T.",
    school: "Accepted to Exeter '25",
    quote: "The essay assistant understood each school's voice better than my private counselor. Worth every minute I spent on it.",
    avatar: "MT",
    stars: 5,
  },
  {
    name: "Priya K.",
    school: "Accepted to Choate '25",
    quote: "I compared 12 schools side-by-side in minutes. The sports rankings feature locked in my decision. This platform is unreal.",
    avatar: "PK",
    stars: 5,
  },
];

/* ─── Animated Counter ──────────────────────────────────────── */
function AnimatedStat({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
        <Icon className="h-5 w-5 text-teal-300" />
      </div>
      <span className="stat-number text-3xl md:text-4xl text-white">{value}</span>
      <span className="mt-1 text-sm text-white/60 font-medium">{label}</span>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────── */
export default function Index() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const isOnboarded = !!preferences?.onboarding_completed;
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setEmailSubmitted(true);
  };

  /* Authenticated returning user — show personalised dashboard prompt */
  if (user && isOnboarded) {
    return (
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <Navbar />
        <section className="relative overflow-hidden mesh-hero py-16 md:py-24">
          <div className="absolute inset-0 noise-overlay" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-6 bg-teal-500/20 text-teal-200 border-teal-400/30 animate-fade-in">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Personalized for you
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                Welcome back,{" "}
                <span className="gradient-text">{preferences?.grade_level || "Future Scholar"}</span>
              </h1>
              <p className="text-lg text-white/70 mb-8 animate-fade-in-up animation-delay-200">
                Pick up where you left off. Your school list, essays, and interviews are waiting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
                <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/30">
                  <Link to="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/15">
                  <Link to="/schools">Browse Schools</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <div className="container mx-auto px-4 py-12">
          <OnboardingNextStepCTA />
          <RecommendedSchools />
        </div>
        <Footer />
      </div>
    );
  }

  /* ─── Public Landing Page ──────────────────────────────────── */
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden mesh-hero min-h-[92vh] flex items-center">
        {/* Animated mesh orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/15 blur-[100px] animate-mesh" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/15 blur-[80px] animate-mesh animation-delay-300" />
          <div className="absolute top-2/3 left-1/2 w-[300px] h-[300px] rounded-full bg-teal-400/10 blur-[70px] animate-mesh animation-delay-600" />
        </div>
        <div className="absolute inset-0 noise-overlay" />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm font-medium text-teal-200 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-teal-300" />
              AI-Powered School Discovery — Free to Start
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[1.05] animate-fade-in-up">
              Find Your{" "}
              <span className="gradient-text">Best-Fit</span>
              <br />
              High School
            </h1>

            <p className="text-lg md:text-xl text-white/65 mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed">
              Search 1,750+ private, boarding, magnet, and selective public schools.
              Get AI-matched in seconds. Apply with confidence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-in-up animation-delay-300">
              <Button
                asChild
                size="lg"
                className="bg-teal-500 hover:bg-teal-400 text-white text-base px-8 shadow-xl shadow-teal-500/30 hover-lift"
              >
                <Link to="/auth">
                  Get Matched Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white bg-white/10 hover:bg-white/15 text-base px-8 backdrop-blur-sm"
              >
                <Link to="/schools">Browse 1,750+ Schools</Link>
              </Button>
            </div>

            {/* School Ticker */}
            <div className="mt-12 animate-fade-in animation-delay-500">
              <SchoolTicker />
            </div>
            <div className="mt-12 animate-fade-in animation-delay-500">
              <SchoolTicker />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="bg-[hsl(213,56%,14%)] border-y border-white/8 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <AnimatedStat key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-accent text-accent-foreground border-0">
              Everything You Need
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Six tools. One platform.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every stage of the private school application journey — handled by AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Link
                key={feature.title}
                to={feature.link}
                className={`group relative block rounded-2xl bg-card border border-border p-6 hover-lift hover-glow transition-all duration-300 animate-fade-in-up opacity-0`}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
              >
                {/* Icon */}
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow} transition-shadow duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-secondary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                <span className="inline-flex items-center text-sm font-medium text-secondary gap-1 group-hover:gap-2 transition-all">
                  Explore <ChevronRight className="h-4 w-4" />
                </span>

                {/* Subtle hover border glow */}
                <div className={`absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-teal-400/30 transition-all duration-300`} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-accent text-accent-foreground border-0">
              Simple Process
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              From zero to accepted in 3 steps
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />

            {steps.map((step, i) => (
              <div
                key={step.step}
                className={`relative flex flex-col items-center text-center animate-fade-in-up opacity-0`}
                style={{ animationDelay: `${i * 150}ms`, animationFillMode: "forwards" }}
              >
                {/* Step number bubble */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                  <span className="font-display text-2xl font-bold text-white">{step.step}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 shadow-lg shadow-primary/20 hover-lift">
              <Link to="/auth">Start For Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-accent text-accent-foreground border-0">
              Student Stories
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Real students. Real acceptances.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`glass-card-light rounded-2xl p-6 border border-border hover-lift transition-all duration-300 animate-fade-in-up opacity-0`}
                style={{ animationDelay: `${i * 120}ms`, animationFillMode: "forwards" }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-foreground/80 text-sm leading-relaxed mb-5 italic">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t.name}</p>
                    <p className="text-xs text-secondary font-medium">{t.school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Band ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden mesh-hero py-20 md:py-28">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-teal-500/15 blur-[100px]" />
          <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] rounded-full bg-blue-600/15 blur-[80px]" />
        </div>
        <div className="absolute inset-0 noise-overlay" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-500/20 text-teal-200 border-teal-400/30">
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Early Access — Free
            </Badge>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Your dream school is{" "}
              <span className="gradient-text">one match away.</span>
            </h2>
            <p className="text-white/60 text-lg mb-10">
              Join thousands of students who used PrepPath to find and get into their best-fit school.
            </p>

            {!emailSubmitted ? (
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-400 text-white px-8 shadow-xl shadow-teal-500/30 whitespace-nowrap"
                >
                  Get Started Free
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-center gap-3 text-teal-300 animate-scale-in">
                <CheckCircle className="h-6 w-6" />
                <span className="text-lg font-medium">You're in! Check your email.</span>
              </div>
            )}

            <p className="mt-4 text-white/35 text-xs">
              No credit card required. Free forever for students.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
