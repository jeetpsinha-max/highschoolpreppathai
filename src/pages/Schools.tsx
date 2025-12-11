import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSchools } from "@/hooks/useSchools";
import { SchoolFilters, defaultFilters } from "@/types/school";
import { Search, MapPin, ExternalLink, GraduationCap, Loader2, Home, Users } from "lucide-react";

export default function Schools() {
  const [filters, setFilters] = useState<SchoolFilters>(defaultFilters);
  const { data: schools, isLoading } = useSchools(filters);

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
  };

  const getCompetitivenessColor = (level: string | null) => {
    switch (level) {
      case "Highly Selective": return "competitive";
      case "Selective": return "teal";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Find Your Perfect School
          </h1>
          <p className="text-muted-foreground">
            Browse and filter through our database of top high schools
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search schools by name, city, or state..."
            className="pl-10 h-12 text-base"
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : schools?.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">No schools found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools?.map((school) => (
              <Card key={school.id} className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4 border-l-secondary">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-display font-semibold text-foreground group-hover:text-secondary transition-colors line-clamp-2">
                      {school.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{school.city}, {school.state}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {school.competitiveness && (
                      <Badge variant={getCompetitivenessColor(school.competitiveness)}>
                        {school.competitiveness}
                      </Badge>
                    )}
                    {school.boarding && (
                      <Badge variant="boarding">
                        <Home className="h-3 w-3 mr-1" />
                        Boarding
                      </Badge>
                    )}
                    {school.size && (
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {school.size}
                      </Badge>
                    )}
                    {school.notes?.includes("girls") && <Badge variant="girls-only">Girls</Badge>}
                    {school.notes?.includes("Catholic") && <Badge variant="religious">Catholic</Badge>}
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/schools/${school.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {school.website && (
                      <a href={school.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
