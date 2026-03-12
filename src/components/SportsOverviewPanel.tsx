import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { SportProgram } from '@/hooks/useEnhancedGrades';
import { getGradeColor } from '@/lib/grading';

interface SportsOverviewPanelProps {
  sportsPrograms: SportProgram[];
  isLoading: boolean;
  onRefresh: () => void;
  isCached: boolean;
}

const seasonColors: Record<string, string> = {
  'Fall': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Winter': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Spring': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Year-round': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const genderStyles: Record<string, { icon: string; color: string; label: string }> = {
  'Boys': { icon: '♂', color: 'border-l-blue-500', label: 'Boys' },
  'Girls': { icon: '♀', color: 'border-l-pink-500', label: 'Girls' },
  'Coed': { icon: '⚥', color: 'border-l-purple-500', label: 'Coed' },
};

const levelStyles: Record<string, string> = {
  'Varsity': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'JV': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'Freshman': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

export function SportsOverviewPanel({ 
  sportsPrograms, 
  isLoading, 
  onRefresh,
  isCached 
}: SportsOverviewPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter to Varsity only
  const varsityPrograms = useMemo(() => 
    sportsPrograms.filter(s => s.level === 'Varsity'),
    [sportsPrograms]
  );

  // Group sports by season
  const sportsBySeason = useMemo(() => {
    return varsityPrograms.reduce((acc, sport) => {
      const season = sport.season || 'Other';
      if (!acc[season]) acc[season] = [];
      acc[season].push(sport);
      return acc;
    }, {} as Record<string, SportProgram[]>);
  }, [varsityPrograms]);

  const seasons = useMemo(() => ['all', ...Object.keys(sportsBySeason).sort()], [sportsBySeason]);

  // Filter by season tab
  const filteredSports = useMemo(() => {
    return activeTab === 'all' ? varsityPrograms : sportsBySeason[activeTab] || [];
  }, [activeTab, sportsPrograms, sportsBySeason]);

  // Group filtered sports by gender
  const groupedByGender = useMemo(() => {
    const groups: Record<string, SportProgram[]> = {};
    for (const sport of filteredSports) {
      const gender = sport.gender || 'Other';
      if (!groups[gender]) groups[gender] = [];
      groups[gender].push(sport);
    }
    const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
    for (const key of Object.keys(groups)) {
      groups[key].sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));
    }
    const orderedKeys = ['Boys', 'Girls', 'Coed'].filter(k => groups[k]);
    const otherKeys = Object.keys(groups).filter(k => !orderedKeys.includes(k));
    return [...orderedKeys, ...otherKeys].map(key => ({ gender: key, programs: groups[key] }));
  }, [filteredSports]);

  const allDisplayItems = useMemo(() => groupedByGender.flatMap(g => g.programs), [groupedByGender]);

  if (!sportsPrograms || sportsPrograms.length === 0) {
    if (isLoading) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Sports Programs
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Researching sports programs...</span>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Sports Programs
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            Sports program data not yet available for this school.
          </p>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <Sparkles className="h-4 w-4 mr-2" />
            Load Sports Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Stats
  const totalSports = sportsPrograms.length;
  const varsitySports = sportsPrograms.filter(s => s.level === 'Varsity').length;
  const topSports = sportsPrograms.filter(s => s.grade.startsWith('A')).length;
  const boysCount = sportsPrograms.filter(s => s.gender === 'Boys').length;
  const girlsCount = sportsPrograms.filter(s => s.gender === 'Girls').length;
  const coedCount = sportsPrograms.filter(s => s.gender === 'Coed').length;
  const displayLimit = expanded ? allDisplayItems.length : 8;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Sports Programs
          </CardTitle>
          <div className="flex items-center gap-2">
            {isCached && (
              <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        {/* Summary stats with gender breakdown */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{totalSports}</span>
            <span className="text-muted-foreground">Total</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{varsitySports}</span>
            <span className="text-muted-foreground">Varsity</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{topSports}</span>
            <span className="text-muted-foreground">A-Rated</span>
          </div>
          <span className="text-muted-foreground/40">|</span>
          {boysCount > 0 && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span>♂</span>
              <span className="font-semibold">{boysCount}</span>
            </div>
          )}
          {girlsCount > 0 && (
            <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
              <span>♀</span>
              <span className="font-semibold">{girlsCount}</span>
            </div>
          )}
          {coedCount > 0 && (
            <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
              <span>⚥</span>
              <span className="font-semibold">{coedCount}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            {seasons.map(season => (
              <TabsTrigger 
                key={season} 
                value={season}
                className="text-xs capitalize"
              >
                {season === 'all' ? 'All Sports' : season}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-4">
              {groupedByGender.map(({ gender, programs }) => {
                const gs = genderStyles[gender] || { icon: '', color: 'border-l-muted', label: gender };
                const visiblePrograms = expanded 
                  ? programs 
                  : programs.slice(0, Math.max(2, Math.floor(displayLimit / groupedByGender.length)));

                return (
                  <div key={gender}>
                    {/* Gender section header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">{gs.icon} {gs.label}</span>
                      <span className="text-xs text-muted-foreground">({programs.length} sports)</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid gap-1.5">
                      {visiblePrograms.map((sport, idx) => (
                        <SportRow key={`${sport.sport}-${sport.gender}-${sport.level}-${idx}`} sport={sport} genderColor={gs.color} />
                      ))}
                      {!expanded && programs.length > visiblePrograms.length && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{programs.length - visiblePrograms.length} more {gs.label.toLowerCase()} sports
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {allDisplayItems.length > 8 && (
              <Button 
                variant="ghost" 
                className="w-full mt-3"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show All {allDisplayItems.length} Sports
                  </>
                )}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SportRow({ sport, genderColor }: { sport: SportProgram; genderColor: string }) {
  return (
    <div className={`flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border-l-3 ${genderColor}`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-bold ${getGradeColor(sport.grade)}`}>
          {sport.grade}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{sport.sport}</span>
            {sport.record && (
              <Badge variant="secondary" className="text-xs font-mono py-0 h-5">
                {sport.record}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {sport.stateRanking && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                #{sport.stateRanking} State
              </span>
            )}
            {sport.nationalRanking && (
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                #{sport.nationalRanking} National
              </span>
            )}
            {sport.conference && <span>{sport.conference}</span>}
          </div>
          {sport.championships && sport.championships.length > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              🏆 {sport.championships[0]}
            </p>
          )}
          {sport.highlights && sport.highlights.length > 0 && !sport.championships?.length && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {sport.highlights[0]}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge variant="outline" className={`text-xs py-0 h-5 ${levelStyles[sport.level] || ''}`}>
          {sport.level}
        </Badge>
        <Badge className={`text-xs py-0 h-5 ${seasonColors[sport.season] || 'bg-muted'}`}>
          {sport.season}
        </Badge>
      </div>
    </div>
  );
}
