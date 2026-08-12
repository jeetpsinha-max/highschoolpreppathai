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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Search, Medal, ArrowUpDown, ExternalLink, Users, ChevronLeft, ChevronRight, Star, TrendingUp, Activity } from 'lucide-react';
import { getGradeColor, gradeToRank } from '@/lib/grading';
import { SportProgram } from '@/hooks/useEnhancedGrades';
import { CONFERENCES, SCHOOL_SPORTS_DATA, Conference, SchoolSports } from '@/data/sportsData';

const PAGE_SIZE = 50;

const SPORTS_LIST = [
  'Football', 'Basketball', 'Soccer', 'Baseball', 'Softball',
  'Tennis', 'Swimming', 'Track & Field', 'Cross Country', 'Lacrosse',
  'Hockey', 'Golf', 'Volleyball', 'Wrestling', 'Field Hockey',
  'Water Polo', 'Rowing', 'Squash', 'Skiing', 'Sailing'
];

interface SchoolRow {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  sports_grade: string | null;
  total_sports: number;
  ranked_sports: number;
  top_sports: { sport: string; grade: string; gender: string; stateRanking?: number }[];
  has_detail: boolean;
  compositeScore: number; // For accurate tie-breaking
}

interface SportEntry {
  school_id: string;
  school_name: string;
  school_state: string | null;
  sport: string;
  gender: string;
  grade: string;
  level: string;
  record?: string;
  stateRanking?: number;
  nationalRanking?: number;
  championships?: string[];
}

export default function SportsRankings() {
  const [tab, setTab] = useState('overall');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'grade' | 'total' | 'name' | 'state' | 'ranked'>('grade');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(0);

  // Sport tab state
  const [sportSortBy, setSportSortBy] = useState<'grade' | 'ranking' | 'school' | 'sport' | 'record'>('grade');
  const [sportSortDesc, setSportSortDesc] = useState(true);
  const [sportPage, setSportPage] = useState(0);
  const [genderFilter, setGenderFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['sports-rankings-v2'],
    queryFn: async () => {
      // Fetch all schools
      const { data: schools, error: schoolsErr } = await supabase
        .from('schools')
        .select('id, name, city, state, sports_grade');
      if (schoolsErr) throw schoolsErr;

      // Fetch enhanced data (sports programs)
      const { data: enhanced, error: enhErr } = await supabase
        .from('enhanced_school_grades')
        .select('school_id, sports_programs');
      if (enhErr) throw enhErr;

      const enhancedMap = new Map<string, SportProgram[]>();
      for (const e of enhanced || []) {
        const programs = (e.sports_programs as unknown as SportProgram[]) || [];
        const varsityPrograms = programs.filter(p => p.level === 'Varsity');
        if (varsityPrograms.length > 0) enhancedMap.set(e.school_id, varsityPrograms);
      }

      // Build overall rows
      const overallRows: SchoolRow[] = (schools || [])
        .filter(s => s.sports_grade)
        .map(s => {
          const programs = enhancedMap.get(s.id) || [];
          const rankedSports = programs.filter(p => p.stateRanking || p.nationalRanking).length;
          const topSports = programs
            .filter(p => p.grade?.startsWith('A'))
            .sort((a, b) => gradeToRank(b.grade) - gradeToRank(a.grade))
            .slice(0, 3)
            .map(p => ({ sport: p.sport, grade: p.grade, gender: p.gender, stateRanking: p.stateRanking }));

          // Composite score for accurate ranking (grade + competitive depth + breadth)
          const gradeScore = gradeToRank(s.sports_grade) * 100; // 100-1300
          const rankedBonus = Math.min(rankedSports * 15, 100); // up to 100
          const aRatedCount = programs.filter(p => p.grade?.startsWith('A')).length;
          const aBonus = Math.min(aRatedCount * 10, 80); // up to 80
          const breadthBonus = Math.min(programs.length * 3, 60); // up to 60
          // Win rate bonus from records
          let winRateBonus = 0;
          const recordPrograms = programs.filter(p => p.record);
          if (recordPrograms.length > 0) {
            const avgWinPct = recordPrograms.reduce((sum, p) => {
              const parts = p.record!.split('-').map(Number);
              if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                const total = parts[0] + parts[1];
                return sum + (total > 0 ? parts[0] / total : 0.5);
              }
              return sum + 0.5;
            }, 0) / recordPrograms.length;
            winRateBonus = Math.round(avgWinPct * 60); // up to 60
          }

          const compositeScore = gradeScore + rankedBonus + aBonus + breadthBonus + winRateBonus;

          return {
            id: s.id,
            name: s.name,
            city: s.city,
            state: s.state,
            sports_grade: s.sports_grade,
            total_sports: programs.length,
            ranked_sports: rankedSports,
            top_sports: topSports,
            has_detail: programs.length > 0,
            compositeScore,
          };
        });

      // Build individual sport entries
      const sportEntries: SportEntry[] = [];
      for (const [schoolId, programs] of enhancedMap) {
        const school = (schools || []).find(s => s.id === schoolId);
        if (!school) continue;
        for (const p of programs) {
          sportEntries.push({
            school_id: schoolId,
            school_name: school.name,
            school_state: school.state,
            sport: p.sport,
            gender: p.gender,
            grade: p.grade,
            level: p.level,
            record: p.record,
            stateRanking: p.stateRanking,
            nationalRanking: p.nationalRanking,
            championships: p.championships,
          });
        }
      }

      // Get unique states
      const states = [...new Set((schools || []).map(s => s.state).filter(Boolean) as string[])].sort();

      // Get unique sports from actual data
      const availableSports = [...new Set(sportEntries.map(e => e.sport))].sort();

      return { overallRows, sportEntries, states, availableSports };
    }
  });

  // Overall tab filtering/sorting
  const filteredOverall = useMemo(() => {
    if (!data) return [];
    let result = [...data.overallRows];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q) ||
        s.state?.toLowerCase().includes(q)
      );
    }
    if (stateFilter !== 'all') {
      result = result.filter(s => s.state === stateFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'grade') {
        // Primary: grade rank, Secondary: composite score for tie-breaking
        cmp = gradeToRank(a.sports_grade) - gradeToRank(b.sports_grade);
        if (cmp === 0) cmp = a.compositeScore - b.compositeScore;
      }
      else if (sortBy === 'total') cmp = a.total_sports - b.total_sports;
      else if (sortBy === 'ranked') cmp = a.ranked_sports - b.ranked_sports;
      else if (sortBy === 'state') cmp = (a.state || '').localeCompare(b.state || '');
      else cmp = a.name.localeCompare(b.name);
      return sortDesc ? -cmp : cmp;
    });

    return result;
  }, [data, search, stateFilter, sortBy, sortDesc]);

  // Sport tab filtering/sorting
  const filteredSports = useMemo(() => {
    if (!data) return [];
    let result = [...data.sportEntries];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.school_name.toLowerCase().includes(q) ||
        e.sport.toLowerCase().includes(q)
      );
    }
    if (stateFilter !== 'all') {
      result = result.filter(e => e.school_state === stateFilter);
    }
    if (sportFilter !== 'all') {
      result = result.filter(e => e.sport === sportFilter);
    }
    if (genderFilter !== 'all') {
      result = result.filter(e => e.gender === genderFilter);
    }
    if (levelFilter !== 'all') {
      result = result.filter(e => e.level === levelFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sportSortBy === 'grade') {
        cmp = gradeToRank(a.grade) - gradeToRank(b.grade);
        // Tie-break: state ranking (lower = better), then record
        if (cmp === 0) {
          const ra = a.stateRanking ?? 9999;
          const rb = b.stateRanking ?? 9999;
          cmp = rb - ra; // lower ranking number = better
        }
      }
      else if (sportSortBy === 'ranking') {
        // Sort by best ranking available (national first, then state)
        const getRankScore = (e: typeof a) => {
          if (e.nationalRanking && e.nationalRanking > 0) return 10000 - e.nationalRanking;
          if (e.stateRanking && e.stateRanking > 0) return 5000 - e.stateRanking;
          return -1;
        };
        cmp = getRankScore(a) - getRankScore(b);
      } else if (sportSortBy === 'school') {
        cmp = a.school_name.localeCompare(b.school_name);
      } else if (sportSortBy === 'sport') {
        cmp = a.sport.localeCompare(b.sport);
      } else if (sportSortBy === 'record') {
        const parseWinPct = (r?: string) => {
          if (!r) return -1;
          const parts = r.split('-').map(Number);
          if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return -1;
          const total = parts[0] + parts[1];
          return total > 0 ? parts[0] / total : -1;
        };
        cmp = parseWinPct(a.record) - parseWinPct(b.record);
      }
      return sportSortDesc ? -cmp : cmp;
    });

    return result;
  }, [data, search, stateFilter, sportFilter, genderFilter, levelFilter, sportSortBy, sportSortDesc]);

  // Conference Data
  const conferencesData = useMemo(() => {
    let result = CONFERENCES.map(conf => {
      const schools = SCHOOL_SPORTS_DATA.filter(s => s.conference === conf.abbreviation || s.conference === conf.id || s.conference === conf.name);
      
      const schoolsWithData = schools.map(s => {
        const supabaseSchool = data?.overallRows.find(or => or.name === s.schoolName);
        return {
          ...s,
          schoolId: supabaseSchool?.id,
          sports_grade: supabaseSchool?.sports_grade || null,
          compositeScore: supabaseSchool?.compositeScore || 0,
        };
      });

      const totalChamps = schoolsWithData.reduce((sum, s) => sum + (s.recentChampionships?.length || 0), 0);
      const aRatedCount = schoolsWithData.filter(s => s.sports_grade?.startsWith('A')).length;

      return {
        ...conf,
        schools: schoolsWithData.sort((a, b) => b.compositeScore - a.compositeScore),
        totalChamps,
        aRatedCount
      };
    });

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.abbreviation.toLowerCase().includes(q) ||
        c.schools.some(s => s.schoolName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [search, data]);

  // Alumni Data
  const alumniData = useMemo(() => {
    let result = SCHOOL_SPORTS_DATA.flatMap(school => 
      (school.notableAlumni || []).map(alumnus => ({
        ...alumnus,
        schoolName: school.schoolName,
        schoolId: data?.overallRows.find(or => or.name === school.schoolName)?.id
      }))
    );

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.sport.toLowerCase().includes(q) ||
        a.schoolName.toLowerCase().includes(q) ||
        a.achievement.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, data]);

  const overallPaged = filteredOverall.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalOverallPages = Math.ceil(filteredOverall.length / PAGE_SIZE);

  const sportsPaged = filteredSports.slice(sportPage * PAGE_SIZE, (sportPage + 1) * PAGE_SIZE);
  const totalSportPages = Math.ceil(filteredSports.length / PAGE_SIZE);

  const toggleOverallSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDesc(!sortDesc);
    else { setSortBy(col); setSortDesc(true); }
    setPage(0);
  };

  const toggleSportSort = (col: typeof sportSortBy) => {
    if (sportSortBy === col) setSportSortDesc(!sportSortDesc);
    else { setSportSortBy(col); setSportSortDesc(true); }
    setSportPage(0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 md:pb-0">
      <Navbar />
      <main className="flex-grow container mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Improved Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border mb-8 p-6 md:p-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Prep School Sports Hub
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Discover the best athletic programs, explore conference rivalries, and find where top athletes started their journey.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border px-4 py-2 rounded-full">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-semibold">{data ? data.overallRows.length.toLocaleString() : '1,750+'} Schools</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border px-4 py-2 rounded-full">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold">{data ? data.availableSports.length : '20+'} Sports Tracked</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border px-4 py-2 rounded-full">
                <Medal className="h-4 w-4 text-primary" />
                <span className="font-semibold">{CONFERENCES.length}+ Conferences</span>
              </div>
            </div>

            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search schools, sports, or alumni..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); setSportPage(0); }}
                className="pl-12 h-12 text-lg rounded-full shadow-sm bg-background/90 backdrop-blur-sm border-primary/20 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setPage(0); setSportPage(0); }}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {data?.states.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tab === 'by-sport' && (
                <>
                  <Select value={sportFilter} onValueChange={(v) => { setSportFilter(v); setSportPage(0); }}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="All Sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      {(data?.availableSports || SPORTS_LIST).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setSportPage(0); }}>
                    <SelectTrigger className="w-full md:w-[140px]">
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="Boys">♂ Boys</SelectItem>
                      <SelectItem value="Girls">♀ Girls</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(0); setSportPage(0); }}>
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="overall" className="gap-2">
              <Trophy className="h-4 w-4" />
              Overall Rankings
            </TabsTrigger>
            <TabsTrigger value="by-sport" className="gap-2">
              <Medal className="h-4 w-4" />
              By Sport
            </TabsTrigger>
            <TabsTrigger value="by-conference" className="gap-2">
              <Users className="h-4 w-4" />
              By Conference
            </TabsTrigger>
            <TabsTrigger value="alumni" className="gap-2">
              <Star className="h-4 w-4" />
              Notable Alumni
            </TabsTrigger>
          </TabsList>

          {/* Overall Rankings Tab */}
          <TabsContent value="overall">
            {isLoading ? (
              <Card><CardContent className="py-12 text-center"><div className="animate-pulse">Loading rankings...</div></CardContent></Card>
            ) : (
              <>
              {/* Summary Stats */}
              <SummaryStats data={data} filtered={filteredOverall} />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {filteredOverall.length.toLocaleString()} Schools
                    </span>
                    <Pagination page={page} total={totalOverallPages} onChange={setPage} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14">#</TableHead>
                        <TableHead>
                          <SortButton label="School" active={sortBy === 'name'} desc={sortDesc} onClick={() => toggleOverallSort('name')} />
                        </TableHead>
                        <TableHead className="text-center">
                          <SortButton label="Grade" active={sortBy === 'grade'} desc={sortDesc} onClick={() => toggleOverallSort('grade')} />
                        </TableHead>
                        <TableHead className="text-center">
                          <SortButton label="Sports" active={sortBy === 'total'} desc={sortDesc} onClick={() => toggleOverallSort('total')} />
                        </TableHead>
                        <TableHead className="text-center hidden md:table-cell">
                          <SortButton label="Ranked" active={sortBy === 'ranked'} desc={sortDesc} onClick={() => toggleOverallSort('ranked')} />
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Top Programs</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overallPaged.map((school, idx) => (
                        <TableRow key={school.id}>
                          <TableCell className="font-mono text-muted-foreground">
                            {page * PAGE_SIZE + idx + 1}
                          </TableCell>
                          <TableCell>
                            <Link to={`/schools/${school.id}`} className="font-medium hover:text-primary transition-colors">
                              {school.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">
                              {[school.city, school.state].filter(Boolean).join(', ')}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${getGradeColor(school.sports_grade)} font-bold`}>
                              {school.sports_grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {school.total_sports || '-'}
                          </TableCell>
                          <TableCell className="text-center hidden md:table-cell">
                            {school.ranked_sports > 0 ? (
                              <Badge variant="secondary" className="gap-1">
                                <Medal className="h-3 w-3" />
                                {school.ranked_sports}
                              </Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {school.top_sports.map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {s.gender === 'Boys' ? '♂' : '♀'} {s.sport}{s.stateRanking ? ` #${s.stateRanking}` : ''}
                                </Badge>
                              ))}
                              {!school.has_detail && (
                                <span className="text-xs text-muted-foreground italic">No detail data</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link to={`/schools/${school.id}`}>
                              <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-center mt-4">
                    <Pagination page={page} total={totalOverallPages} onChange={setPage} />
                  </div>
                </CardContent>
              </Card>
              </>
            )}
          </TabsContent>

          {/* By Sport Tab */}
          <TabsContent value="by-sport">
            {/* Quick sport links */}
            {!isLoading && data?.availableSports && data.availableSports.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {data.availableSports.slice(0, 20).map(sport => (
                  <Link key={sport} to={`/sports-rankings/${encodeURIComponent(sport)}`}>
                    <Badge variant={sportFilter === sport ? 'default' : 'outline'} className="cursor-pointer hover:bg-primary/10 transition-colors">
                      {sport}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
            {isLoading ? (
              <Card><CardContent className="py-12 text-center"><div className="animate-pulse">Loading...</div></CardContent></Card>
            ) : filteredSports.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No individual sport data found. Select a different sport or clear filters.</p>
              </CardContent></Card>
            ) : (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Medal className="h-5 w-5" />
                      {filteredSports.length.toLocaleString()} Programs
                      {sportFilter !== 'all' && <Badge variant="secondary">{sportFilter}</Badge>}
                    </span>
                    <Pagination page={sportPage} total={totalSportPages} onChange={setSportPage} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-14">#</TableHead>
                        <TableHead>
                          <SortButton label="School" active={sportSortBy === 'school'} desc={sportSortDesc} onClick={() => toggleSportSort('school')} />
                        </TableHead>
                        <TableHead>
              <SortButton label="Sport" active={sportSortBy === 'sport'} desc={sportSortDesc} onClick={() => toggleSportSort('sport')} />
                        </TableHead>
                        <TableHead className="text-center">Gender</TableHead>
                        <TableHead className="text-center">
                          <SortButton label="Grade" active={sportSortBy === 'grade'} desc={sportSortDesc} onClick={() => toggleSportSort('grade')} />
                        </TableHead>
                        <TableHead className="text-center">
                          <SortButton label="Ranking" active={sportSortBy === 'ranking'} desc={sportSortDesc} onClick={() => toggleSportSort('ranking')} />
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          <SortButton label="Record" active={sportSortBy === 'record'} desc={sportSortDesc} onClick={() => toggleSportSort('record')} />
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Achievements</TableHead>
                        <TableHead className="w-10" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sportsPaged.map((entry, idx) => (
                        <TableRow key={`${entry.school_id}-${entry.sport}-${entry.gender}-${idx}`}>
                          <TableCell className="font-mono text-muted-foreground">
                            {sportPage * PAGE_SIZE + idx + 1}
                          </TableCell>
                          <TableCell>
                            <Link to={`/schools/${entry.school_id}`} className="font-medium hover:text-primary transition-colors">
                              {entry.school_name}
                            </Link>
                            {entry.school_state && (
                              <div className="text-xs text-muted-foreground">{entry.school_state}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link to={`/sports-rankings/${encodeURIComponent(entry.sport)}`} className="font-medium hover:text-primary transition-colors">
                              {entry.sport}
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`text-xs gap-1 ${
                              entry.gender === 'Boys' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                              entry.gender === 'Girls' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            }`}>
                              {entry.gender === 'Boys' ? '♂' : entry.gender === 'Girls' ? '♀' : '⚥'} {entry.gender}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${getGradeColor(entry.grade)} font-bold`}>
                              {entry.grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              {entry.stateRanking && (
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                  #{entry.stateRanking} State
                                </span>
                              )}
                              {entry.nationalRanking && (
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                  #{entry.nationalRanking} Natl
                                </span>
                              )}
                              {!entry.stateRanking && !entry.nationalRanking && '-'}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-sm">
                            {entry.record || '-'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {entry.championships && entry.championships.length > 0 ? (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                🏆 {entry.championships[0]}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Link to={`/schools/${entry.school_id}`}>
                              <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-center mt-4">
                    <Pagination page={sportPage} total={totalSportPages} onChange={setSportPage} />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* By Conference Tab */}
          <TabsContent value="by-conference" className="space-y-6">
            {conferencesData.length === 0 ? (
              <Card><CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No conferences found matching your search.</p>
              </CardContent></Card>
            ) : (
              conferencesData.map(conf => (
                <Card key={conf.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{conf.name}</CardTitle>
                          <Badge variant="outline">{conf.abbreviation}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{conf.description}</p>
                      </div>
                      <div className="flex gap-4 text-sm shrink-0">
                        <div className="text-center">
                          <div className="font-bold text-lg">{conf.schools.length}</div>
                          <div className="text-muted-foreground text-xs">Members</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{conf.totalChamps}</div>
                          <div className="text-muted-foreground text-xs">Championships</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">{conf.aRatedCount}</div>
                          <div className="text-muted-foreground text-xs">A-Rated</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>School</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                          <TableHead className="hidden md:table-cell">Strongest Programs</TableHead>
                          <TableHead className="hidden lg:table-cell">Recent Championships</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conf.schools.map((school, idx) => (
                          <TableRow key={idx}>
                            <TableCell>
                              {school.schoolId ? (
                                <Link to={`/schools/${school.schoolId}`} className="font-medium hover:text-primary">
                                  {school.schoolName}
                                </Link>
                              ) : (
                                <span className="font-medium">{school.schoolName}</span>
                              )}
                              <div className="text-xs text-muted-foreground">{school.city}, {school.state}</div>
                            </TableCell>
                            <TableCell className="text-center">
                              {school.sports_grade ? (
                                <Badge className={`${getGradeColor(school.sports_grade)} font-bold`}>
                                  {school.sports_grade}
                                </Badge>
                              ) : '-'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {school.strongestPrograms?.map((p, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="flex flex-col gap-1">
                                {school.recentChampionships?.slice(0, 2).map((c, i) => (
                                  <span key={i} className="text-xs truncate max-w-[200px]" title={`${c.year} ${c.title} (${c.sport})`}>
                                    🏆 {c.year} {c.title} ({c.sport})
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Notable Alumni Tab */}
          <TabsContent value="alumni">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  {alumniData.length} Notable Alumni
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alumniData.length === 0 ? (
                  <div className="py-12 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No alumni found matching your search.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {alumniData.map((alumnus, idx) => {
                      const achievementStr = alumnus.achievement.toUpperCase();
                      let badgeColor = 'bg-primary';
                      if (achievementStr.includes('NFL')) badgeColor = 'bg-blue-600';
                      else if (achievementStr.includes('NBA')) badgeColor = 'bg-orange-500';
                      else if (achievementStr.includes('NHL')) badgeColor = 'bg-zinc-800';
                      else if (achievementStr.includes('MLB')) badgeColor = 'bg-red-600';
                      else if (achievementStr.includes('OLYMPIC')) badgeColor = 'bg-yellow-500';
                      else if (achievementStr.includes('MLS')) badgeColor = 'bg-green-600';
                      
                      return (
                        <div key={idx} className="flex flex-col border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{alumnus.name}</h3>
                            <Badge className={badgeColor}>{alumnus.sport}</Badge>
                          </div>
                          <p className="text-sm font-medium mb-4 flex-grow">
                            {alumnus.achievement}
                          </p>
                          <div className="pt-3 border-t mt-auto text-sm text-muted-foreground">
                            {alumnus.schoolId ? (
                              <Link to={`/schools/${alumnus.schoolId}`} className="hover:text-primary flex items-center gap-1">
                                {alumnus.schoolName} <ExternalLink className="h-3 w-3" />
                              </Link>
                            ) : (
                              alumnus.schoolName
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function SortButton({ label, active, desc, onClick }: { label: string; active: boolean; desc: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className={`gap-1 ${active ? 'text-foreground' : ''}`}>
      {label}
      <ArrowUpDown className={`h-3 w-3 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
    </Button>
  );
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-muted-foreground">{page + 1} / {total}</span>
      <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= total - 1} onClick={() => onChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function SummaryStats({ data, filtered }: { data: any; filtered: SchoolRow[] }) {
  if (!data) return null;

  const allRows = data.overallRows as SchoolRow[];
  const aRated = allRows.filter(s => s.sports_grade?.startsWith('A')).length;
  const bRated = allRows.filter(s => s.sports_grade?.startsWith('B')).length;
  const withDetail = allRows.filter(s => s.has_detail).length;

  // Most popular sports from sport entries
  const sportCounts = new Map<string, number>();
  for (const e of (data.sportEntries || [])) {
    sportCounts.set(e.sport, (sportCounts.get(e.sport) || 0) + 1);
  }
  const topSports = [...sportCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // States with most A-rated schools
  const stateCounts = new Map<string, number>();
  for (const s of allRows.filter(s => s.sports_grade?.startsWith('A'))) {
    if (s.state) stateCounts.set(s.state, (stateCounts.get(s.state) || 0) + 1);
  }
  const topStates = [...stateCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top 5 spotlight programs (highest composite score)
  const spotlight = allRows
    .filter(s => s.compositeScore > 0)
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, 5);

  return (
    <div className="space-y-6 mb-6">
      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Star className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{aRated}</div>
            <div className="text-xs text-muted-foreground">A-Rated Schools</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{bRated}</div>
            <div className="text-xs text-muted-foreground">B-Rated Schools</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Activity className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{withDetail}</div>
            <div className="text-xs text-muted-foreground">With Sport Details</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Trophy className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-2xl font-bold">{data.availableSports?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Sports Tracked</div>
          </CardContent>
        </Card>
      </div>

      {/* Spotlight: Top Programs */}
      {spotlight.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              🏆 Top Athletic Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {spotlight.map((school, i) => (
                <Link key={school.id} to={`/schools/${school.id}`} className="group">
                  <div className={`relative p-3 rounded-lg border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    i === 0 ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' :
                    i === 1 ? 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800' :
                    i === 2 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                    'bg-card'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                      <Badge className={`${getGradeColor(school.sports_grade)} font-bold text-xs`}>
                        {school.sports_grade}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {school.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{school.state}</div>
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {school.top_sports.slice(0, 2).map((s, j) => (
                        <Badge key={j} variant="outline" className="text-[9px] px-1 py-0">
                          {s.sport}
                        </Badge>
                      ))}
                      {school.total_sports > 0 && (
                        <span className="text-[10px] text-muted-foreground">{school.total_sports} sports</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sport popularity and state leaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topSports.length > 0 && (
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-xs font-medium text-muted-foreground mb-3">Browse by Sport</div>
              <div className="flex flex-wrap gap-2">
                {topSports.map(([sport, count]) => (
                  <Link key={sport} to={`/sports-rankings/${encodeURIComponent(sport)}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors">
                      {sport} <span className="ml-1 text-muted-foreground">({count})</span>
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {topStates.length > 0 && (
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="text-xs font-medium text-muted-foreground mb-3">Top States for Athletics</div>
              <div className="flex flex-wrap gap-2">
                {topStates.map(([state, count]) => (
                  <Badge key={state} variant="outline" className="text-xs">
                    {state} <span className="ml-1 font-bold text-primary">{count} A-rated</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
