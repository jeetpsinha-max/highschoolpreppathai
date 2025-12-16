import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Target, Users, Sparkles, CheckCircle, Heart } from "lucide-react";
export default function About() {
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-6">
            <GraduationCap className="h-5 w-5" />
            <span className="font-medium">About PrepPath</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Empowering Students to Reach Their{" "}
            <span className="text-secondary">Dream Schools</span>
          </h1>
          <p className="text-lg text-muted-foreground">Highschool PrepPath is an AI-powered platform made by a high school Sophomore to help students and families navigate the competitive world of private high school admissions with confidence and ease.</p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="border-l-4 border-l-secondary">
            <CardContent className="p-8">
              <Target className="h-10 w-10 text-secondary mb-4" />
              <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To democratize access to high-quality admissions guidance by leveraging 
                AI technology, making the path to elite education more accessible to 
                families everywhere, regardless of their background or resources.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-8">
              <Heart className="h-10 w-10 text-primary mb-4" />
              <h2 className="font-display text-2xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground">
                We believe every student deserves the opportunity to find their perfect 
                fit school. Our platform combines cutting-edge AI with genuine care for 
                student success and family peace of mind.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-4">What We Offer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and AI-powered assistance for every step of your admissions journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="h-14 w-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">AI-Powered Tools</h3>
                <p className="text-sm text-muted-foreground">
                  School matching, interview practice, essay assistance, and SSAT prep 
                  powered by advanced AI technology.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">School Database</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive information on top private high schools, with filters 
                  to find your perfect match.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-4">
                <div className="h-14 w-14 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-teal" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Family Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Track applications, manage documents, and keep parents informed 
                  with dedicated dashboards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-br from-secondary/5 to-primary/5 rounded-3xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-8">
              Why Choose PrepPath?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {["Personalized school recommendations based on your unique profile", "AI interview coach that provides real-time feedback", "SSAT practice with adaptive difficulty and explanations", "Application checklist with deadline tracking", "Essay brainstorming and improvement tools", "Parent dashboard for family collaboration"].map((item, index) => <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>)}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>;
}