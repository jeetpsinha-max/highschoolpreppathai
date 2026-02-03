import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Search, Medal, ArrowUpDown, ExternalLink } from 'lucide-react';
import { getGradeColor, gradeToRank } from '@/lib/grading';
import { SportProgram } from '@/hooks/useEnhancedGrades';

interface SchoolSportsData {
  school_id: string;
  school_name: string;
  school_city: string;
  school_state: string;
  sports_programs: SportProgram[];
  overall_sports_grade: string;
  total_sports: number;
  ranked_sports: number;
}

const SPORTS_LIST = [
  'All Sports',
  'Football', 'Basketball', 'Soccer', 'Baseball', 'Softball',
  'Tennis', 'Swimming', 'Track & Field', 'Cross Country', 'Lacrosse',
  'Hockey', 'Golf', 'Volleyball', 'Wrestling', 'Field Hockey',
  'Water Polo', 'Rowing', 'Squash', 'Skiing', 'Sailing'
];

export default function SportsRankings() {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [sortBy, setSortBy] = useState<'grade' | 'total' | 'ranked'>('grade');
  const [sortDesc, setSortDesc] = useState(true);

  const { data: schoolsData, isLoading } = useQuery({
    queryKey: ['sports-rankings'],
    queryFn: async () => {
      const { data: enhanced, error } = await supabase
        .from('enhanced_school_grades')
        .select(`
          school_id,
          sports_programs
        `);

      if (error) throw error;

      // Get school details
      const schoolIds = enhanced?.map(e => e.school_id) || [];
      const { data: schools } = await supabase
        .from('schools')
        .select('id, name, city, state, sports_grade')
        .in('id', schoolIds);

      const schoolMap = new Map(schools?.map(s => [s.id, s]) || []);

      // Process and calculate rankings
      const processed: SchoolSportsData[] = (enhanced || [])
        .filter(e => e.sports_programs && Array.isArray(e.sports_programs) && e.sports_programs.length > 0)
        .map(e => {
          const school = schoolMap.get(e.school_id);
          const programs = (e.sports_programs as unknown as SportProgram[]) || [];
          
          // Calculate average grade
          const validGrades = programs.filter(p => p.grade).map(p => gradeToRank(p.grade));
          const avgGrade = validGrades.length > 0 
            ? validGrades.reduce((a, b) => a + b, 0) / validGrades.length 
            : 0;
          
          // Count ranked sports
          const rankedSports = programs.filter(p => p.stateRanking || p.nationalRanking).length;

          return {
            school_id: e.school_id,
            school_name: school?.name || 'Unknown School',
            school_city: school?.city || '',
            school_state: school?.state || '',
            sports_programs: programs,
            overall_sports_grade: school?.sports_grade || calculateGradeFromAvg(avgGrade),
            total_sports: programs.length,
            ranked_sports: rankedSports
          };
        });

      return processed;
    }
  });

  const filteredAndSorted = useMemo(() => {
    if (!schoolsData) return [];

    let result = [...schoolsData];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(s => 
        s.school_name.toLowerCase().includes(searchLower) ||
        s.school_city?.toLowerCase().includes(searchLower) ||
        s.school_state?.toLowerCase().includes(searchLower)
      );
    }

    // Sport filter
    if (sportFilter !== 'All Sports') {
      result = result.filter(s => 
        s.sports_programs.some(p => 
          p.sport.toLowerCase().includes(sportFilter.toLowerCase())
        )
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'grade') {
        comparison = gradeToRank(a.overall_sports_grade) - gradeToRank(b.overall_sports_grade);
      } else if (sortBy === 'total') {
        comparison = a.total_sports - b.total_sports;
      } else {
        comparison = a.ranked_sports - b.ranked_sports;
      }
      return sortDesc ? -comparison : comparison;
    });

    return result;
  }, [schoolsData, search, sportFilter, sortBy, sortDesc]);

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sports Rankings</h1>
            <p className="text-muted-foreground">Top athletic programs at private and boarding schools</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  {SPORTS_LIST.map(sport => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-pulse">Loading sports rankings...</div>
            </CardContent>
          </Card>
        ) : filteredAndSorted.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No schools with sports data found.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Sports data is populated when viewing individual school profiles.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                {filteredAndSorted.length} Schools Ranked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('grade')}
                        className="gap-1"
                      >
                        Grade
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('total')}
                        className="gap-1"
                      >
                        Sports
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleSort('ranked')}
                        className="gap-1"
                      >
                        Ranked
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Top Sports</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.map((school, idx) => {
                    const topSports = school.sports_programs
                      .filter(p => p.grade.startsWith('A'))
                      .slice(0, 3);
                    
                    return (
                      <TableRow key={school.school_id}>
                        <TableCell className="font-medium text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link 
                              to={`/schools/${school.school_id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {school.school_name}
                            </Link>
                            <div className="text-sm text-muted-foreground">
                              {school.school_city}, {school.school_state}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getGradeColor(school.overall_sports_grade)} font-bold`}>
                            {school.overall_sports_grade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {school.total_sports}
                        </TableCell>
                        <TableCell className="text-center">
                          {school.ranked_sports > 0 ? (
                            <Badge variant="secondary" className="gap-1">
                              <Medal className="h-3 w-3" />
                              {school.ranked_sports}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {topSports.map((sport, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {sport.sport}
                                {sport.stateRanking && ` #${sport.stateRanking}`}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/schools/${school.school_id}`}>
                            <Button variant="ghost" size="icon">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

function calculateGradeFromAvg(avg: number): string {
  if (avg >= 12) return 'A+';
  if (avg >= 11) return 'A';
  if (avg >= 10) return 'A-';
  if (avg >= 9) return 'B+';
  if (avg >= 8) return 'B';
  if (avg >= 7) return 'B-';
  if (avg >= 6) return 'C+';
  if (avg >= 5) return 'C';
  if (avg >= 4) return 'C-';
  if (avg >= 3) return 'D+';
  if (avg >= 2) return 'D';
  if (avg >= 1) return 'D-';
  return 'F';
}
