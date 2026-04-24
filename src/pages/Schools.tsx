import { useState, useMemo, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchools } from "@/hooks/useSchools";
import { SchoolFilters, defaultFilters, sortOptions, SortOption, usStates, competitivenessLevels, schoolTypes, schoolSizes } from "@/types/school";
import { GRADE_OPTIONS } from "@/lib/grading";
import { SchoolCard } from "@/components/SchoolCard";
import { SchoolCardSkeleton } from "@/components/SchoolCardSkeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { scoreSchoolForUser } from "@/lib/personalization";
import {
  Search, GraduationCap, Loader2, Filter, X, BookOpen, Trophy,
  Building2, BedDouble, ArrowUpDown, ArrowUp, ArrowDown,
  DollarSign, Users, ChevronDown, MapPin, Sparkles
} from "lucide-react";

const PAGE_SIZE = 24;

export default function Schools() {
  const [filters, setFilters] = useState<SchoolFilters>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [personalizedFirst, setPersonalizedFirst] = useState(true);
  const { data: schools, isLoading } = useSchools(filters);
  const { preferences } = useUserPreferences();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.states.length) count++;
    if (filters.competitiveness.length) count++;
    if (filters.boarding !== 'all') count++;
    if (filters.types.length) count++;
    if (filters.sizes.length) count++;
    if (filters.minAcademicsGrade) count++;
    if (filters.minSportsGrade) count++;
    if (filters.minCampusGrade) count++;
    if (filters.minDormsGrade) count++;
    if (filters.maxTuition != null) count++;
    if (filters.maxAcceptanceRate != null) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => setFilters(defaultFilters);

  // Quick state suggestions based on user preferences
  const suggestedStates = preferences?.target_states || [];

  // Personalized order: matched schools first, then everyone else by current sort
  const orderedSchools = useMemo(() => {
    if (!schools) return [] as typeof schools;
    if (!personalizedFirst || !preferences?.onboarding_completed) return schools;
    const scored = schools.map((s) => ({
      s,
      m: scoreSchoolForUser(s, preferences),
    }));
    scored.sort((a, b) => b.m.score - a.m.score);
    return scored.map((x) => x.s);
  }, [schools, preferences, personalizedFirst]);

  // Reset visible count whenever filters/sort change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, personalizedFirst]);

  // Infinite scroll: load more when sentinel comes into view
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((n) => n + PAGE_SIZE);
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [orderedSchools?.length]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">
            Find Your Perfect School
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse and filter {schools?.length ? `${schools.length.toLocaleString()} schools` : 'our database of top high schools'}
          </p>
        </div>

        {/* Search and Core Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search schools by name, city, or state..."
                className="pl-10 h-12 text-base"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters({ ...filters, sortBy: value as SortOption })}
              >
                <SelectTrigger className="w-[150px] h-12">
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
                className="h-12 px-3"
                onClick={() => setFilters({ ...filters, sortDesc: !filters.sortDesc })}
              >
                {filters.sortDesc ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Quick State Tags from user preferences */}
          {suggestedStates.length > 0 && !filters.states.length && (
            <div className="flex items-center gap-2 flex-wrap">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Your states:</span>
              {suggestedStates.map((st: string) => (
                <Badge
                  key={st}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 text-xs"
                  onClick={() => setFilters({ ...filters, states: [st] })}
                >
                  {st}
                </Badge>
              ))}
            </div>
          )}

          {/* Filter Bar - scrollable on mobile */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-hide">
            {/* Grade Filters */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Min:</span>
            </div>

            <Select
              value={filters.minAcademicsGrade || "any"}
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
              value={filters.minSportsGrade || "any"}
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
              value={filters.minCampusGrade || "any"}
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
              value={filters.minDormsGrade || "any"}
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

            <div className="h-6 w-px bg-border" />

            <Button
              variant={showAdvanced ? "secondary" : "outline"}
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Filter className="h-3.5 w-3.5" />
              More Filters
              {activeFilterCount > 0 && (
                <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <Card className="animate-in slide-in-from-top-2 duration-200">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* State filter */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <MapPin className="h-3.5 w-3.5" /> State
                    </label>
                    <Select
                      value={filters.states[0] || "all"}
                      onValueChange={(v) => setFilters({ ...filters, states: v === "all" ? [] : [v] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All States" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {usStates.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Competitiveness */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <GraduationCap className="h-3.5 w-3.5" /> Selectivity
                    </label>
                    <Select
                      value={filters.competitiveness[0] || "all"}
                      onValueChange={(v) => setFilters({ ...filters, competitiveness: v === "all" ? [] : [v] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        {competitivenessLevels.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Boarding */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <BedDouble className="h-3.5 w-3.5" /> Boarding
                    </label>
                    <Select
                      value={filters.boarding}
                      onValueChange={(v: 'all' | 'yes' | 'no') => setFilters({ ...filters, boarding: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Boarding Only</SelectItem>
                        <SelectItem value="no">Day Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tuition */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <DollarSign className="h-3.5 w-3.5" /> Max Tuition
                    </label>
                    <Select
                      value={filters.maxTuition?.toString() || "any"}
                      onValueChange={(v) => setFilters({ ...filters, maxTuition: v === "any" ? null : parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="0">Free (Public)</SelectItem>
                        <SelectItem value="20000">Under $20k</SelectItem>
                        <SelectItem value="35000">Under $35k</SelectItem>
                        <SelectItem value="50000">Under $50k</SelectItem>
                        <SelectItem value="65000">Under $65k</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Acceptance Rate */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <Users className="h-3.5 w-3.5" /> Max Acceptance Rate
                    </label>
                    <Select
                      value={filters.maxAcceptanceRate?.toString() || "any"}
                      onValueChange={(v) => setFilters({ ...filters, maxAcceptanceRate: v === "any" ? null : parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="10">Under 10% (Very Selective)</SelectItem>
                        <SelectItem value="20">Under 20%</SelectItem>
                        <SelectItem value="35">Under 35%</SelectItem>
                        <SelectItem value="50">Under 50%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* School Size */}
                  <div>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-2">
                      <Users className="h-3.5 w-3.5" /> Size
                    </label>
                    <Select
                      value={filters.sizes[0] || "all"}
                      onValueChange={(v) => setFilters({ ...filters, sizes: v === "all" ? [] : [v] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        {schoolSizes.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Active filter tags */}
        {filters.states.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.states.map((st) => (
              <Badge key={st} variant="secondary" className="gap-1">
                {st}
                <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, states: filters.states.filter(s => s !== st) })} />
              </Badge>
            ))}
          </div>
        )}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
