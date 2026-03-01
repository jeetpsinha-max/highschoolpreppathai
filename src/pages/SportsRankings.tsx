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
  top_sports: { sport: string; grade: string; stateRanking?: number }[];
  has_detail: boolean;
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
        if (programs.length > 0) enhancedMap.set(e.school_id, programs);
      }

      // Build overall rows
      const overallRows: SchoolRow[] = (schools || [])
        .filter(s => s.sports_grade)
        .map(s => {
          const programs = enhancedMap.get(s.id) || [];
          const rankedSports = programs.filter(p => p.stateRanking || p.nationalRanking).length;
          const topSports = programs
            .filter(p => p.grade?.startsWith('A'))
            .slice(0, 3)
            .map(p => ({ sport: p.sport, grade: p.grade, stateRanking: p.stateRanking }));

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
      if (sortBy === 'grade') cmp = gradeToRank(a.sports_grade) - gradeToRank(b.sports_grade);
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

    result.sort((a, b) => {
      let cmp = 0;
      if (sportSortBy === 'grade') cmp = gradeToRank(a.grade) - gradeToRank(b.grade);
      else if (sportSortBy === 'ranking') {
        const ra = a.stateRanking ?? 9999;
        const rb = b.stateRanking ?? 9999;
        cmp = rb - ra;
      } else if (sportSortBy === 'school') {
        cmp = a.school_name.localeCompare(b.school_name);
      } else if (sportSortBy === 'sport') {
        cmp = a.sport.localeCompare(b.sport);
      } else if (sportSortBy === 'record') {
        // Parse win percentage from record like "15-3"
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
  }, [data, search, stateFilter, sportFilter, sportSortBy, sportSortDesc]);

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sports Rankings</h1>
            <p className="text-muted-foreground">
              {data ? `${filteredOverall.length.toLocaleString()} schools ranked` : 'Loading...'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools or sports..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); setSportPage(0); }}
                  className="pl-10"
                />
              </div>
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
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(0); setSportPage(0); }}>
          <TabsList className="mb-4">
            <TabsTrigger value="overall" className="gap-2">
              <Trophy className="h-4 w-4" />
              Overall Rankings
            </TabsTrigger>
            <TabsTrigger value="by-sport" className="gap-2">
              <Medal className="h-4 w-4" />
              By Sport
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
                                  {s.sport}{s.stateRanking ? ` #${s.stateRanking}` : ''}
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
                            <div className="text-xs text-muted-foreground">
                              {entry.gender} · {entry.level}
                            </div>
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
    .slice(0, 5);

  // States with most A-rated schools
  const stateCounts = new Map<string, number>();
  for (const s of allRows.filter(s => s.sports_grade?.startsWith('A'))) {
    if (s.state) stateCounts.set(s.state, (stateCounts.get(s.state) || 0) + 1);
  }
  const topStates = [...stateCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
      {topSports.length > 0 && (
        <Card className="col-span-2">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Most Popular Sports</div>
            <div className="flex flex-wrap gap-1.5">
              {topSports.map(([sport, count]) => (
                <Badge key={sport} variant="secondary" className="text-xs">
                  {sport} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {topStates.length > 0 && (
        <Card className="col-span-2">
          <CardContent className="pt-4 pb-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">Top States (A-Rated)</div>
            <div className="flex flex-wrap gap-1.5">
              {topStates.map(([state, count]) => (
                <Badge key={state} variant="outline" className="text-xs">
                  {state} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
