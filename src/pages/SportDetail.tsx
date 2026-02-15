import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Search, Medal, ArrowUpDown, ExternalLink, ArrowLeft, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { getGradeColor, gradeToRank, GRADE_OPTIONS } from '@/lib/grading';
import { SportProgram } from '@/hooks/useEnhancedGrades';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const PAGE_SIZE = 50;

interface SportSchoolEntry {
  school_id: string;
  school_name: string;
  school_state: string | null;
  school_city: string | null;
  gender: string;
  grade: string;
  level: string;
  record?: string;
  stateRanking?: number;
  nationalRanking?: number;
  conference?: string;
  championships?: string[];
  highlights?: string[];
}

const GRADE_COLORS: Record<string, string> = {
  'A+': '#059669', 'A': '#10b981', 'A-': '#34d399',
  'B+': '#3b82f6', 'B': '#60a5fa', 'B-': '#93c5fd',
  'C+': '#eab308', 'C': '#facc15', 'C-': '#fde047',
  'D+': '#f97316', 'D': '#fb923c', 'D-': '#fdba74',
  'F': '#ef4444',
};

export default function SportDetail() {
  const { sport: sportParam } = useParams<{ sport: string }>();
  const sportName = decodeURIComponent(sportParam || '');
  
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'grade' | 'ranking' | 'name'>('grade');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['sport-detail', sportName],
    queryFn: async () => {
      const { data: enhanced, error } = await supabase
        .from('enhanced_school_grades')
        .select('school_id, sports_programs');
      if (error) throw error;

      const schoolIds = enhanced?.map(e => e.school_id) || [];
      const { data: schools } = await supabase
        .from('schools')
        .select('id, name, city, state')
        .in('id', schoolIds);

      const schoolMap = new Map(schools?.map(s => [s.id, s]) || []);
      const entries: SportSchoolEntry[] = [];

      for (const e of enhanced || []) {
        const programs = (e.sports_programs as unknown as SportProgram[]) || [];
        const school = schoolMap.get(e.school_id);
        if (!school) continue;

        for (const p of programs) {
          if (p.sport.toLowerCase() === sportName.toLowerCase()) {
            entries.push({
              school_id: e.school_id,
              school_name: school.name,
              school_state: school.state,
              school_city: school.city,
              gender: p.gender,
              grade: p.grade,
              level: p.level,
              record: p.record,
              stateRanking: p.stateRanking,
              nationalRanking: p.nationalRanking,
              conference: p.conference,
              championships: p.championships,
              highlights: p.highlights,
            });
          }
        }
      }

      const states = [...new Set(entries.map(e => e.school_state).filter(Boolean) as string[])].sort();
      const genders = [...new Set(entries.map(e => e.gender))].sort();

      return { entries, states, genders };
    },
    enabled: !!sportName,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = [...data.entries];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.school_name.toLowerCase().includes(q));
    }
    if (stateFilter !== 'all') result = result.filter(e => e.school_state === stateFilter);
    if (genderFilter !== 'all') result = result.filter(e => e.gender === genderFilter);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'grade') cmp = gradeToRank(a.grade) - gradeToRank(b.grade);
      else if (sortBy === 'ranking') {
        const ra = a.stateRanking ?? 9999;
        const rb = b.stateRanking ?? 9999;
        cmp = rb - ra;
      } else cmp = a.school_name.localeCompare(b.school_name);
      return sortDesc ? -cmp : cmp;
    });

    return result;
  }, [data, search, stateFilter, genderFilter, sortBy, sortDesc]);

  // Chart data
  const gradeDistribution = useMemo(() => {
    if (!filtered.length) return [];
    const counts: Record<string, number> = {};
    for (const e of filtered) {
      const key = e.grade?.charAt(0) || 'F';
      counts[key] = (counts[key] || 0) + 1;
    }
    return ['A', 'B', 'C', 'D', 'F'].map(g => ({
      grade: g,
      count: counts[g] || 0,
      fill: g === 'A' ? '#10b981' : g === 'B' ? '#3b82f6' : g === 'C' ? '#eab308' : g === 'D' ? '#f97316' : '#ef4444',
    }));
  }, [filtered]);

  const topByState = useMemo(() => {
    if (!filtered.length) return [];
    const stateMap: Record<string, { count: number; avgGrade: number }> = {};
    for (const e of filtered) {
      const st = e.school_state || 'Unknown';
      if (!stateMap[st]) stateMap[st] = { count: 0, avgGrade: 0 };
      stateMap[st].count++;
      stateMap[st].avgGrade += gradeToRank(e.grade);
    }
    return Object.entries(stateMap)
      .map(([state, d]) => ({ state, count: d.count, avgGrade: +(d.avgGrade / d.count).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [filtered]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDesc(!sortDesc);
    else { setSortBy(col); setSortDesc(true); }
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/sports-rankings">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{sportName} Rankings</h1>
            <p className="text-muted-foreground">
              {filtered.length} programs across {data?.states.length || 0} states
            </p>
          </div>
        </div>

        {/* Charts */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="grade" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Medal className="h-4 w-4" />
                  Programs by State (Top 15)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topByState} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="state" type="category" width={40} className="text-xs" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="pl-10"
                />
              </div>
              <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {data?.states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={(v) => { setGenderFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full md:w-[140px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  {data?.genders.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {isLoading ? (
          <Card><CardContent className="py-12 text-center"><div className="animate-pulse">Loading {sportName} rankings...</div></CardContent></Card>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No {sportName} programs found.</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{filtered.length} Programs</span>
                <Pagination page={page} total={totalPages} onChange={setPage} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">#</TableHead>
                    <TableHead>
                      <SortButton label="School" active={sortBy === 'name'} desc={sortDesc} onClick={() => toggleSort('name')} />
                    </TableHead>
                    <TableHead className="text-center">Gender</TableHead>
                    <TableHead className="text-center">
                      <SortButton label="Grade" active={sortBy === 'grade'} desc={sortDesc} onClick={() => toggleSort('grade')} />
                    </TableHead>
                    <TableHead className="text-center">
                      <SortButton label="Ranking" active={sortBy === 'ranking'} desc={sortDesc} onClick={() => toggleSort('ranking')} />
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Record</TableHead>
                    <TableHead className="hidden lg:table-cell">Achievements</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((entry, idx) => (
                    <TableRow key={`${entry.school_id}-${entry.gender}-${idx}`}>
                      <TableCell className="font-mono text-muted-foreground">
                        {page * PAGE_SIZE + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Link to={`/schools/${entry.school_id}`} className="font-medium hover:text-primary transition-colors">
                          {entry.school_name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {[entry.school_city, entry.school_state].filter(Boolean).join(', ')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">{entry.gender}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${getGradeColor(entry.grade)} font-bold`}>{entry.grade}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          {entry.stateRanking && (
                            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">#{entry.stateRanking} State</span>
                          )}
                          {entry.nationalRanking && (
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">#{entry.nationalRanking} Natl</span>
                          )}
                          {!entry.stateRanking && !entry.nationalRanking && '-'}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell font-mono text-sm">
                        {entry.record || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {entry.championships && entry.championships.length > 0 ? (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">🏆 {entry.championships[0]}</span>
                        ) : entry.highlights && entry.highlights.length > 0 ? (
                          <span className="text-xs text-muted-foreground line-clamp-1">{entry.highlights[0]}</span>
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
                <Pagination page={page} total={totalPages} onChange={setPage} />
              </div>
            </CardContent>
          </Card>
        )}
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
