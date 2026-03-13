import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Wand2, Star, MapPin, Users, GraduationCap, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getGradeColor } from "@/lib/grading";

interface IdealProfile {
  summary: string;
  keyCharacteristics: string[];
  academicFocus: string;
  cultureFit: string;
  locationPreferences: string;
  sizeAndStructure: string;
}

interface SchoolMatch {
  id: string;
  name: string;
  matchScore: number;
  matchReason: string;
  highlights: string[];
  grades?: Record<string, string>;
}

interface GeneratorResults {
  idealProfile: IdealProfile;
  matches: SchoolMatch[];
}

export default function SchoolGenerator() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeneratorResults | null>(null);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (description.trim().length < 20) {
      toast.error("Please provide a more detailed description (at least 20 characters)");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("school-generator", {
        body: { description }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResults(data.results);
      toast.success("Found your ideal school matches!");
    } catch (error) {
      console.error("Generator error:", error);
      toast.error("Failed to generate matches. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 80) return "text-secondary";
    if (score >= 70) return "text-amber-500";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>AI School Generator - PrepPath AI</title>
        <meta name="description" content="Describe your ideal school and our AI will create a profile and find the 10 closest real-world matches from our database." />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-sm font-medium mb-4">
              <Wand2 className="h-4 w-4" />
              AI-Powered Generation
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">School Generator</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Describe your dream school in your own words. Our AI will create an ideal profile 
              and find the 10 closest real-world matches from our database of 500+ schools.
            </p>
          </div>

          {!results ? (
            <Card>
              <CardHeader>
                <CardTitle>Describe Your Ideal School</CardTitle>
                <CardDescription>
                  Be as detailed as you'd like - the more you share, the better your matches!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Example: I'm looking for a school with a strong STEM program, especially robotics and computer science. I'd love a medium-sized school where I can get to know my teachers. Location-wise, I'm open to anywhere on the East Coast. Extracurriculars are important to me - I play soccer and want to join a debate team. I'd prefer a boarding school so I can be more independent, but day school could work too. A diverse student body is really important to my family..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      {description.length} characters • Tip: Include academics, activities, location, size, and culture preferences
                    </p>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-sm">Ideas for what to include:</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Academic strengths", "Extracurricular interests", "Preferred location/region", "School size", "Boarding vs day", "Campus culture", "Special programs", "Religious affiliation", "Single-gender preference"].map(idea => (
                        <Badge key={idea} variant="outline" className="text-xs">
                          {idea}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Your Matches...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate School Matches
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Ideal Profile Card */}
              <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <CardTitle>Your Ideal School Profile</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {results.idealProfile.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {results.idealProfile.keyCharacteristics.map((char, i) => (
                      <Badge key={i} className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                        {char}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        Academic Focus
                      </div>
                      <p className="text-sm text-muted-foreground">{results.idealProfile.academicFocus}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        Culture & Environment
                      </div>
                      <p className="text-sm text-muted-foreground">{results.idealProfile.cultureFit}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Location Preferences
                      </div>
                      <p className="text-sm text-muted-foreground">{results.idealProfile.locationPreferences}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        Size & Structure
                      </div>
                      <p className="text-sm text-muted-foreground">{results.idealProfile.sizeAndStructure}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Matches */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Top 10 Matches</h2>
                <div className="space-y-4">
                  {results.matches.map((match, index) => (
                    <Card 
                      key={match.id} 
                      className="hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => navigate(`/schools/${match.id}`)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {match.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {match.matchReason}
                                </p>
                                
                                {/* Display grades if available */}
                                {match.grades && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {['academics', 'sports', 'arts', 'campus'].map(key => {
                                      const grade = match.grades?.[key];
                                      if (!grade) return null;
                                      return (
                                        <Badge key={key} className={`${getGradeColor(grade)} text-xs`}>
                                          {key.charAt(0).toUpperCase() + key.slice(1)}: {grade}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {match.highlights.map((hl, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {hl}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
                                  {match.matchScore}%
                                </div>
                                <div className="text-xs text-muted-foreground">Match</div>
                                <Progress 
                                  value={match.matchScore} 
                                  className="w-16 h-1.5 mt-1"
                                />
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setResults(null)}>
                  Try Different Description
                </Button>
                <Button onClick={() => navigate("/schools")}>
                  Browse All Schools
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
