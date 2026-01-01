import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  School, Users, BarChart3, Shield, 
  CheckCircle, Sparkles, ArrowRight, GraduationCap 
} from "lucide-react";
import { z } from "zod";

const betaSignupSchema = z.object({
  schoolName: z.string().trim().min(2, "School name must be at least 2 characters").max(100, "School name must be less than 100 characters"),
  contactName: z.string().trim().min(2, "Contact name must be at least 2 characters").max(100, "Contact name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().optional(),
  studentCount: z.string().trim().optional(),
  message: z.string().trim().max(1000, "Message must be less than 1000 characters").optional(),
});

const benefits = [
  {
    icon: Sparkles,
    title: "AI-Powered Tools",
    description: "Give your students access to our AI school matcher, interview coach, and SSAT practice tools.",
  },
  {
    icon: BarChart3,
    title: "Track Student Progress",
    description: "Monitor application readiness and identify students who need additional support.",
  },
  {
    icon: Users,
    title: "Parent Engagement",
    description: "Keep parents informed with real-time visibility into their child's progress.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Student data is protected with enterprise-grade security and privacy controls.",
  },
];

export default function BetaForSchools() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    contactName: "",
    email: "",
    phone: "",
    studentCount: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = betaSignupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest. We'll be in touch within 2 business days.",
    });

    setFormData({
      schoolName: "",
      contactName: "",
      email: "",
      phone: "",
      studentCount: "",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full text-sm font-medium text-secondary mb-6">
              <School className="h-4 w-4" />
              Free Pilot Program
            </div>
            
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Partner with PrepPath
              <span className="block text-secondary">For Your Students</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our free pilot program and give your middle school students access to 
              AI-powered tools that prepare them for high school admissions success.
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Why Schools Love PrepPath
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to support your students' journey to top high schools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center border-none shadow-sm">
                <CardContent className="pt-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary mb-4">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                What's Included in the Pilot
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "AI School Matcher for personalized recommendations",
                "Interview Coach with AI feedback",
                "SSAT Practice with adaptive questions",
                "Application tracking dashboard",
                "Parent visibility portal",
                "Dedicated onboarding support",
                "Training materials for counselors",
                "Priority feature requests",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-secondary shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="inline-flex mx-auto h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary mb-4">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <CardTitle className="font-display text-2xl">Join the Pilot Program</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll be in touch within 2 business days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        placeholder="Millstone Middle School"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        className={errors.schoolName ? "border-destructive" : ""}
                      />
                      {errors.schoolName && (
                        <p className="text-sm text-destructive">{errors.schoolName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactName">Your Name *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        placeholder="Jane Smith"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className={errors.contactName ? "border-destructive" : ""}
                      />
                      {errors.contactName && (
                        <p className="text-sm text-destructive">{errors.contactName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jsmith@school.edu"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentCount">Approximate Student Count (Grades 6-8)</Label>
                    <Input
                      id="studentCount"
                      name="studentCount"
                      placeholder="e.g., 500"
                      value={formData.studentCount}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Information</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your school and how you'd like to use PrepPath..."
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        Apply for Free Pilot
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
