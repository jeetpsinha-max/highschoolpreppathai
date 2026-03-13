import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Mail, Lock, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationState {
  from?: { pathname: string };
}

export default function Auth() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "parent">("student");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const state = location.state as LocationState;
  const from = state?.from?.pathname || null;

  useEffect(() => {
    if (user) {
      checkUserRoleAndRedirect();
    }
  }, [user]);

  const checkUserRoleAndRedirect = async () => {
    if (!user) return;
    if (from && from !== "/auth") {
      navigate(from, { replace: true });
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "parent")
      .maybeSingle();
    if (data) {
      navigate("/parent-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          toast.error(error.message);
        } else {
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Left panel - dark branded */}
        <div className="hidden lg:flex lg:w-1/2 section-dark items-center justify-center p-12 relative">
          <div className="max-w-md text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-secondary shadow-gold mb-6">
              <GraduationCap className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold text-primary-foreground mb-4">
              Your Journey Starts Here
            </h2>
            <p className="text-primary-foreground/50 leading-relaxed">
              Join PrepPath to discover your best-fit high school with AI-powered
              matching, interview prep, and application support.
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        </div>

        {/* Right panel - form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-background">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="lg:hidden inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-md mb-4">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isSignUp ? "Create Your Account" : "Welcome Back"}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {isSignUp
                  ? "Start your journey to the perfect school"
                  : "Sign in to continue your journey"}
              </p>
            </div>

            <Card className="shadow-lg border-border">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <>
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-medium">
                          Full Name
                        </Label>
                        <div className="relative mt-1.5">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">I am a</Label>
                        <div className="flex gap-2 mt-1.5">
                          {(["student", "parent"] as const).map((r) => (
                            <Button
                              key={r}
                              type="button"
                              variant={role === r ? "secondary" : "outline"}
                              className="flex-1 capitalize"
                              onClick={() => setRole(r)}
                            >
                              {r}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="pl-10"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSignUp ? "Create Account" : "Sign In"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">
                    {isSignUp
                      ? "Already have an account?"
                      : "Don't have an account?"}
                  </span>
                  <Button
                    variant="link"
                    className="ml-1 p-0"
                    onClick={() => setIsSignUp(!isSignUp)}
                  >
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
