import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchools } from "@/hooks/useSchools";
import { SchoolFilters, defaultFilters, sortOptions, SortOption } from "@/types/school";
import { GRADE_OPTIONS } from "@/lib/grading";
import { SchoolCard } from "@/components/SchoolCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, Loader2, Filter, X, BookOpen, Trophy, Building2, BedDouble, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function Schools() {
  const [filters, setFilters] = useState<SchoolFilters>(defaultFilters);
  const { data: schools, isLoading } = useSchools(filters);

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
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

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search schools by name, city, or state..."
              className="pl-10 h-12 text-base"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Sort and Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters({ ...filters, sortBy: value as SortOption })}
              >
                <SelectTrigger className="w-[150px] h-9">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2"
                onClick={() => setFilters({ ...filters, sortDesc: !filters.sortDesc })}
              >
                {filters.sortDesc ? (
                  <ArrowDown className="h-4 w-4" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Grade Filters */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Min:</span>
            </div>
            
            <Select
              value={filters.minAcademicsGrade}
              onValueChange={(value) => setFilters({ ...filters, minAcademicsGrade: value === "any" ? "" : value })}
            >
              <SelectTrigger className="w-[120px] h-9">
                <BookOpen className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Academics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}+</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.minSportsGrade}
              onValueChange={(value) => setFilters({ ...filters, minSportsGrade: value === "any" ? "" : value })}
            >
              <SelectTrigger className="w-[100px] h-9">
                <Trophy className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}+</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.minCampusGrade}
              onValueChange={(value) => setFilters({ ...filters, minCampusGrade: value === "any" ? "" : value })}
            >
              <SelectTrigger className="w-[110px] h-9">
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}+</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.minDormsGrade}
              onValueChange={(value) => setFilters({ ...filters, minDormsGrade: value === "any" ? "" : value })}
            >
              <SelectTrigger className="w-[100px] h-9">
                <BedDouble className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Dorms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {GRADE_OPTIONS.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}+</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filters.minAcademicsGrade || filters.minSportsGrade || filters.minCampusGrade || filters.minDormsGrade) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  ...filters,
                  minAcademicsGrade: '',
                  minSportsGrade: '',
                  minCampusGrade: '',
                  minDormsGrade: ''
                })}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
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
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
