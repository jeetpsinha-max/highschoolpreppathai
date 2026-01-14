import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSchool } from "@/hooks/useSchools";
import { getGradeColor, getOverallGradeColor, calculateOverallGrade, getGradeDescription } from "@/lib/grading";
import { SaveSchoolButton } from "@/components/SaveSchoolButton";
import { AskAdmissionsChat } from "@/components/AskAdmissionsChat";
import { EnhancedGradesPanel } from "@/components/EnhancedGradesPanel";
import { 
  MapPin, 
  ExternalLink, 
  GraduationCap, 
  Users, 
  Home, 
  Building, 
  ArrowLeft, 
  Loader2,
  TrendingUp,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Trophy,
  Building2,
  BedDouble,
  Palette,
  Users2,
  Globe,
  Award,
  Wrench,
  GraduationCap as Faculty,
  Star
} from "lucide-react";

export default function SchoolProfile() {
  const { id } = useParams<{ id: string }>();
  const { data: school, isLoading, error } = useSchool(id || "");

  const getCompetitivenessColor = (level: string | null) => {
    switch (level) {
      case "Highly Selective": return "competitive";
      case "Selective": return "teal";
      default: return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">School Not Found</h1>
          <p className="text-muted-foreground mb-6">The school you're looking for doesn't exist or has been removed.</p>
          <Link to="/schools">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Schools
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Parse notes for additional info
  const notes = school.notes?.toLowerCase() || "";
  const isGirlsOnly = notes.includes("girls");
  const isBoysOnly = notes.includes("boys");
  const isReligious = notes.includes("catholic") || notes.includes("jesuit") || notes.includes("quaker") || notes.includes("christian");
  const hasLDSupport = notes.includes("ld") || notes.includes("learning diff");
  const isSTEM = notes.includes("stem") || notes.includes("science") || notes.includes("tech");
  const isArts = notes.includes("arts") || notes.includes("performing") || notes.includes("visual");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{school.name} - PrepPath AI</title>
        <meta name="description" content={`Learn about ${school.name} in ${school.city}, ${school.state}. View admissions info, programs, and get AI-powered insights.`} />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <Link to="/schools" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Schools
            </Link>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {school.name}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{school.city}, {school.state}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {school.competitiveness && (
                    <Badge variant={getCompetitivenessColor(school.competitiveness)} className="text-sm">
                      {school.competitiveness}
                    </Badge>
                  )}
                  {school.boarding && (
                    <Badge variant="boarding" className="text-sm">
                      <Home className="h-3.5 w-3.5 mr-1" />
                      Boarding
                    </Badge>
                  )}
                  {school.type && (
                    <Badge variant="outline" className="text-sm">
                      <Building className="h-3.5 w-3.5 mr-1" />
                      {school.type}
                    </Badge>
                  )}
                  {school.size && (
                    <Badge variant="outline" className="text-sm">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {school.size}
                    </Badge>
                  )}
                  {isGirlsOnly && <Badge variant="girls-only">Girls Only</Badge>}
                  {isBoysOnly && <Badge variant="secondary">Boys Only</Badge>}
                  {isReligious && <Badge variant="religious">Religious</Badge>}
                  {hasLDSupport && <Badge variant="outline">LD Support</Badge>}
                  {isSTEM && <Badge variant="outline">STEM Focus</Badge>}
                  {isArts && <Badge variant="outline">Arts Focus</Badge>}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <SaveSchoolButton schoolId={school.id} variant="full" />
                {school.website && (
                  <a href={school.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Visit Website
                    </Button>
                  </a>
                )}
                <Link to={`/ai-tools/improve?school=${school.id}`}>
                  <Button className="w-full sm:w-auto">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Improve Your Chances
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Facts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    School Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Location</div>
                      <div className="font-medium">{school.city}, {school.state}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Admission Type</div>
                      <div className="font-medium">{school.admission_type || "Not specified"}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">School Size</div>
                      <div className="font-medium">{school.size || "Not specified"}</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Boarding</div>
                      <div className="font-medium">{school.boarding ? "Yes, offers boarding" : "Day school only"}</div>
                    </div>
                  </div>
                  
                  {school.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-muted-foreground mb-2">Additional Information</div>
                      <p className="text-foreground">{school.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI-Generated Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">What This School Excels At</h4>
                    <div className="space-y-2">
                      {school.competitiveness === "Highly Selective" && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                          <span className="text-sm text-muted-foreground">Rigorous academic environment that prepares students for top universities</span>
                        </div>
                      )}
                      {school.boarding && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                          <span className="text-sm text-muted-foreground">Immersive residential experience fostering independence and community</span>
                        </div>
                      )}
                      {isSTEM && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                          <span className="text-sm text-muted-foreground">Strong STEM curriculum with hands-on learning opportunities</span>
                        </div>
                      )}
                      {isArts && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                          <span className="text-sm text-muted-foreground">Dedicated arts programs nurturing creative expression</span>
                        </div>
                      )}
                      {hasLDSupport && (
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                          <span className="text-sm text-muted-foreground">Specialized support for students with learning differences</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <span className="text-sm text-muted-foreground">Strong college counseling and preparation support</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Student Experience Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      {school.size === "Small" 
                        ? "As a smaller school, students often enjoy close-knit relationships with teachers and personalized attention. Class sizes are typically smaller, allowing for more discussion-based learning."
                        : school.size === "Large"
                        ? "As a larger school, students have access to a wide variety of courses, clubs, and extracurricular activities. The diverse community offers many opportunities to find your niche."
                        : "Students at this school experience a balance of academic rigor and extracurricular opportunities, with access to various programs and a supportive community."
                      }
                      {school.boarding && " The boarding experience adds a unique dimension of independence, with students living and learning together in a 24/7 educational environment."}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Is This School a Good Fit for You?</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This school might be ideal if you:
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Are looking for a {school.competitiveness?.toLowerCase() || "quality"} academic environment</li>
                      <li>• {school.boarding ? "Want an immersive boarding experience" : "Prefer to live at home while attending school"}</li>
                      <li>• Thrive in a {school.size?.toLowerCase() || "supportive"} school community</li>
                      {isReligious && <li>• Value faith-based education and community</li>}
                      {isGirlsOnly && <li>• Prefer an all-girls learning environment</li>}
                      {isBoysOnly && <li>• Prefer an all-boys learning environment</li>}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to={`/ai-tools/improve?school=${school.id}`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Improve Your Chances
                    </Button>
                  </Link>
                  <Link to="/ai-tools/school-matcher" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Find Similar Schools
                    </Button>
                  </Link>
                  {school.website && (
                    <a href={school.website} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        School Website
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* Overall Rating Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Overall Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg ${getOverallGradeColor(calculateOverallGrade(school))}`}>
                      {calculateOverallGrade(school)}
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Based on all category grades
                  </p>
                </CardContent>
              </Card>

              {/* Grades Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">School Grades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { icon: BookOpen, label: 'Academics', grade: school.academics_grade },
                    { icon: Trophy, label: 'Sports', grade: school.sports_grade },
                    { icon: Palette, label: 'Arts', grade: school.arts_grade },
                    { icon: Users2, label: 'Clubs', grade: school.clubs_grade },
                    { icon: Globe, label: 'Diversity', grade: school.diversity_grade },
                    { icon: Award, label: 'College Prep', grade: school.college_prep_grade },
                    { icon: Building2, label: 'Campus', grade: school.campus_grade },
                    { icon: Wrench, label: 'Facilities', grade: school.facilities_grade },
                    { icon: Faculty, label: 'Faculty', grade: school.faculty_grade },
                    { icon: BedDouble, label: 'Dorms', grade: school.boarding ? school.dorms_grade : null, hideIfNA: !school.boarding },
                  ].filter(item => !item.hideIfNA || item.grade).map(({ icon: Icon, label, grade }, index, arr) => (
                    <div key={label}>
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{label}</span>
                        </div>
                        <span className={`font-bold px-2 py-0.5 rounded text-sm ${getGradeColor(grade)}`}>
                          {grade || '-'}
                        </span>
                      </div>
                      {index < arr.length - 1 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Enhanced Grades Panel */}
              <EnhancedGradesPanel school={school} />

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">At a Glance</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Competitiveness</dt>
                      <dd className="font-medium">{school.competitiveness || "N/A"}</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="font-medium">{school.type || "N/A"}</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Size</dt>
                      <dd className="font-medium">{school.size || "N/A"}</dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Boarding</dt>
                      <dd className="font-medium">{school.boarding ? "Yes" : "No"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />

      {/* Ask Admissions Chat Widget */}
      <AskAdmissionsChat school={school} />
    </div>
  );
}
