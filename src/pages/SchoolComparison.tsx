import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSavedSchools } from "@/hooks/useSavedSchools";
import { useSchools } from "@/hooks/useSchools";
import { defaultFilters } from "@/types/school";
import { useAuth } from "@/hooks/useAuth";
import { 
  calculateOverallGrade, 
  getGradeColor, 
  getOverallGradeColor,
  GRADE_CATEGORIES 
} from "@/lib/grading";
import { 
  Scale, 
  MapPin, 
  Users, 
  Home, 
  GraduationCap, 
  ExternalLink,
  Loader2,
  ArrowLeft,
  X,
  Award
} from "lucide-react";

export default function SchoolComparison() {
  const { user } = useAuth();
  const { data: savedSchools, isLoading: savedLoading } = useSavedSchools();
  const { data: allSchools, isLoading: schoolsLoading } = useSchools(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const savedSchoolIds = savedSchools?.map(s => s.school_id) || [];
  const userSavedSchools = allSchools?.filter(s => savedSchoolIds.includes(s.id)) || [];
  const selectedSchools = allSchools?.filter(s => selectedIds.includes(s.id)) || [];

  const toggleSchool = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const removeFromComparison = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Scale className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to compare your saved schools.</p>
          <Link to="/auth">
            <Button variant="hero">Sign In</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isLoading = savedLoading || schoolsLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Scale className="h-8 w-8 text-secondary" />
            Compare Schools
          </h1>
          <p className="text-muted-foreground">
            Select up to 4 schools to compare side-by-side
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : userSavedSchools.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No Saved Schools</h3>
              <p className="text-muted-foreground mb-4">Save some schools first to compare them</p>
              <Link to="/schools">
                <Button variant="hero">Browse Schools</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* School Selection Panel */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Select Schools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userSavedSchools.map((school) => (
                  <div 
                    key={school.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Checkbox
                      checked={selectedIds.includes(school.id)}
                      onCheckedChange={() => toggleSchool(school.id)}
                      disabled={!selectedIds.includes(school.id) && selectedIds.length >= 4}
                    />
                    <span className="text-sm truncate flex-1">{school.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <div className="lg:col-span-3">
              {selectedSchools.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">Select Schools to Compare</h3>
                    <p className="text-muted-foreground">Choose schools from the list on the left</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 text-left bg-muted/50 font-semibold text-sm rounded-tl-lg">Attribute</th>
                        {selectedSchools.map((school) => (
                          <th key={school.id} className="p-4 text-left bg-muted/50 min-w-[200px]">
                            <div className="flex items-start justify-between gap-2">
                              <Link 
                                to={`/schools/${school.id}`}
                                className="font-semibold text-sm hover:text-secondary transition-colors"
                              >
                                {school.name}
                              </Link>
                              <button 
                                onClick={() => removeFromComparison(school.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Overall Grade Row */}
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            Overall Grade
                          </div>
                        </td>
                        {selectedSchools.map((school) => {
                          const grade = calculateOverallGrade(school);
                          return (
                            <td key={school.id} className="p-4">
                              <Badge className={`${getOverallGradeColor(grade)} text-base px-3 py-1 shadow-sm`}>
                                {grade}
                              </Badge>
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Individual Grade Categories */}
                      {GRADE_CATEGORIES.map((category) => (
                        <tr key={category.key} className="border-t border-border">
                          <td className="p-4 bg-muted/30 font-medium text-sm">
                            {category.label}
                          </td>
                          {selectedSchools.map((school) => {
                            const grade = school[category.field] as string | null;
                            // Skip dorms for non-boarding schools
                            if (category.key === 'dorms' && !school.boarding) {
                              return (
                                <td key={school.id} className="p-4">
                                  <span className="text-muted-foreground text-sm">N/A</span>
                                </td>
                              );
                            }
                            return (
                              <td key={school.id} className="p-4">
                                <Badge className={getGradeColor(grade)}>
                                  {grade || "N/A"}
                                </Badge>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Location
                          </div>
                        </td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4 text-sm">
                            {school.city}, {school.state}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            Competitiveness
                          </div>
                        </td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4">
                            <Badge variant={school.competitiveness === "Highly Selective" ? "competitive" : "secondary"}>
                              {school.competitiveness || "N/A"}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            Boarding
                          </div>
                        </td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4">
                            {school.boarding ? (
                              <Badge variant="boarding">Boarding Available</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">Day School Only</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Size
                          </div>
                        </td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4 text-sm">
                            {school.size || "N/A"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">School Type</td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4 text-sm">
                            {school.type || "N/A"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">Admission Type</td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4 text-sm">
                            {school.admission_type || "N/A"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">Notes</td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4 text-sm text-muted-foreground">
                            {school.notes || "—"}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 bg-muted/30 font-medium text-sm">Website</td>
                        {selectedSchools.map((school) => (
                          <td key={school.id} className="p-4">
                            {school.website ? (
                              <a 
                                href={school.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-secondary hover:underline text-sm"
                              >
                                Visit <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
