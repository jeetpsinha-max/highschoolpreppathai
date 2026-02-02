import { useState } from 'react';
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

const genderIcons: Record<string, string> = {
  'Boys': '♂',
  'Girls': '♀',
  'Coed': '⚥',
};

export function SportsOverviewPanel({ 
  sportsPrograms, 
  isLoading, 
  onRefresh,
  isCached 
}: SportsOverviewPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

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

  // Group sports by season
  const sportsBySeason = sportsPrograms.reduce((acc, sport) => {
    const season = sport.season || 'Other';
    if (!acc[season]) acc[season] = [];
    acc[season].push(sport);
    return acc;
  }, {} as Record<string, SportProgram[]>);

  // Get unique seasons for tabs
  const seasons = ['all', ...Object.keys(sportsBySeason).sort()];

  // Calculate stats
  const totalSports = sportsPrograms.length;
  const varsitySports = sportsPrograms.filter(s => s.level === 'Varsity').length;
  const topSports = sportsPrograms.filter(s => s.grade.startsWith('A')).length;

  // Filter sports based on active tab
  const filteredSports = activeTab === 'all' 
    ? sportsPrograms 
    : sportsBySeason[activeTab] || [];

  // Limit display if not expanded
  const displaySports = expanded ? filteredSports : filteredSports.slice(0, 6);

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
        <div className="flex gap-4 mt-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{totalSports}</span>
            <span className="text-muted-foreground">Total Sports</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{varsitySports}</span>
            <span className="text-muted-foreground">Varsity</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{topSports}</span>
            <span className="text-muted-foreground">A-Rated</span>
          </div>
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
            <div className="grid gap-2">
              {displaySports.map((sport, idx) => (
                <div 
                  key={`${sport.sport}-${sport.gender}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${getGradeColor(sport.grade)}`}>
                      {sport.grade}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sport.sport}</span>
                        <span className="text-muted-foreground text-sm" title={sport.gender}>
                          {genderIcons[sport.gender]}
                        </span>
                      </div>
                      {sport.highlights && sport.highlights.length > 0 && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {sport.highlights[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {sport.level}
                    </Badge>
                    <Badge className={`text-xs ${seasonColors[sport.season] || 'bg-muted'}`}>
                      {sport.season}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {filteredSports.length > 6 && (
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
                    Show All {filteredSports.length} Sports
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