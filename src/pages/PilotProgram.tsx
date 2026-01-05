import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Sparkles, CheckCircle, ArrowRight, Users, School, 
  Target, MessageSquare, FileText, Brain, Clock, 
  Shield, Zap, Heart
} from "lucide-react";

const familyBenefits = [
  { icon: Target, title: "AI-Powered School Matching", description: "Get personalized recommendations based on your student's unique profile, interests, and academic goals." },
  { icon: MessageSquare, title: "Interview Preparation", description: "Practice with AI-powered mock interviews that simulate real admissions conversations." },
  { icon: FileText, title: "Essay & Application Support", description: "Get feedback and guidance on essays, personal statements, and application materials." },
  { icon: Brain, title: "SSAT Practice Tests", description: "Access unlimited AI-generated practice tests tailored to your skill level." },
  { icon: Shield, title: "Priority Support", description: "Direct access to our team for questions, guidance, and personalized assistance." },
  { icon: Heart, title: "Shape the Future", description: "Your feedback directly influences new features and improvements to the platform." },
];

const schoolBenefits = [
  { icon: Users, title: "Enhanced Visibility", description: "Connect with highly motivated, well-matched prospective students actively exploring options." },
  { icon: Zap, title: "Applicant Insights", description: "Understand what students are looking for and how they perceive your school." },
  { icon: Target, title: "Better Matching", description: "Our AI helps surface students who are genuinely aligned with your school's culture and values." },
  { icon: Clock, title: "Streamlined Workflow", description: "Integration tools designed to complement your existing admissions process." },
  { icon: MessageSquare, title: "Direct Communication", description: "Reach interested families through our platform with targeted messaging." },
  { icon: Heart, title: "Co-Development", description: "Partner with us to build features that address your specific admissions challenges." },
];

const timeline = [
  { phase: "Phase 1", title: "Early Access", description: "Limited spots for founding families and partner schools", status: "current" },
  { phase: "Phase 2", title: "Expanded Beta", description: "Additional features and broader access based on feedback", status: "upcoming" },
  { phase: "Phase 3", title: "Full Launch", description: "Public availability with premium features for pilot participants", status: "upcoming" },
];

const faqs = [
  { question: "Is the pilot program really free?", answer: "Yes! During the pilot phase, all features are completely free for participating families and schools. We're focused on building the best possible product with your help." },
  { question: "How long does the pilot last?", answer: "The pilot program runs for approximately 3-6 months, depending on feedback and development progress. Pilot participants will receive advance notice before any changes." },
  { question: "What happens after the pilot ends?", answer: "Pilot participants will receive exclusive benefits including discounted pricing, early access to new features, and recognition as founding members of our community." },
  { question: "How is my data protected?", answer: "We take privacy seriously. All data is encrypted and stored securely. We never sell personal information and you can request data deletion at any time." },
  { question: "Can I leave the pilot at any time?", answer: "Absolutely. There's no commitment required. You can stop participating at any point while keeping access to any data you've created." },
];

export default function PilotProgram() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full text-sm font-medium text-secondary mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Limited Pilot Program
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
              Shape the Future of
              <span className="block text-secondary">High School Admissions</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
              Join our exclusive pilot program and get free access to all AI-powered tools while helping us build the ultimate school discovery platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-200">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  <Users className="h-5 w-5" />
                  Join as a Family
                </Button>
              </Link>
              <Link to="/beta">
                <Button variant="hero-outline" size="xl" className="gap-2 w-full sm:w-auto">
                  <School className="h-5 w-5" />
                  Partner as a School
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Why Join Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Join the Pilot?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be among the first to experience AI-powered school matching while helping shape tools that will help thousands of families.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-t-4 border-t-secondary">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Free Access</h3>
                <p className="text-muted-foreground">All premium features at no cost during the pilot period</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-t-4 border-t-primary">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Direct Input</h3>
                <p className="text-muted-foreground">Your feedback shapes features and priorities</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-t-4 border-t-secondary">
              <CardContent className="p-8">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-xl text-foreground mb-2">Founding Member</h3>
                <p className="text-muted-foreground">Exclusive benefits and recognition forever</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Families Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                For Families
              </h2>
            </div>
            
            <p className="text-muted-foreground mb-10 max-w-3xl">
              Get personalized guidance through every step of the high school admissions process. Our AI tools help you find the right schools, prepare compelling applications, and stand out in the admissions process.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {familyBenefits.map((benefit) => (
                <Card key={benefit.title} className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-10">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="lg" className="gap-2">
                  Join the Family Pilot
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* For Schools Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <School className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                For Schools
              </h2>
            </div>
            
            <p className="text-muted-foreground mb-10 max-w-3xl">
              Connect with motivated, well-matched prospective students. Our AI matching technology helps you reach families who are genuinely aligned with your school's mission and values.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schoolBenefits.map((benefit) => (
                <Card key={benefit.title} className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <benefit.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-10">
              <Link to="/beta">
                <Button variant="outline" size="lg" className="gap-2">
                  Apply as a Partner School
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Pilot Timeline
              </h2>
              <p className="text-primary-foreground/80">
                Our roadmap from early access to full launch
              </p>
            </div>
            
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={item.phase} className="flex items-start gap-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.status === 'current' 
                        ? 'bg-secondary text-secondary-foreground' 
                        : 'bg-primary-foreground/20 text-primary-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-16 bg-primary-foreground/20 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-secondary font-medium">{item.phase}</span>
                      {item.status === 'current' && (
                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-primary-foreground/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about the pilot program
              </p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardContent className="p-6">
                    <h3 className="font-display font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Join?
            </h2>
            <p className="text-muted-foreground mb-8">
              Spots are limited. Join the pilot today and help us transform school discovery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                  <Users className="h-5 w-5" />
                  Join as a Family
                </Button>
              </Link>
              <Link to="/beta">
                <Button variant="hero-outline" size="xl" className="gap-2 w-full sm:w-auto">
                  <School className="h-5 w-5" />
                  Partner as a School
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
