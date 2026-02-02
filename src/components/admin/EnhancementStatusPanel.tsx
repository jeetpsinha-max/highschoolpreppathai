import { useEnhancementStats } from '@/hooks/useEnhancedGrades';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Database, Clock, CheckCircle, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function EnhancementStatusPanel() {
  const { data: stats, isLoading: statsLoading } = useEnhancementStats();
  
  const { data: lastRefresh, isLoading: refreshLoading } = useQuery({
    queryKey: ['last-enhancement-refresh'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enhanced_school_grades')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.updated_at || null;
    }
  });

  const isLoading = statsLoading || refreshLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const cachedPercentage = stats?.totalSchools 
    ? Math.round((stats.enhancedCount / stats.totalSchools) * 100) 
    : 0;

  const freshPercentage = stats?.enhancedCount 
    ? Math.round((stats.recentCount / stats.enhancedCount) * 100) 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Enhancement Status
            </CardTitle>
            <CardDescription>
              AI-enhanced school grade data cache status
            </CardDescription>
          </div>
          <Badge variant={freshPercentage > 80 ? "default" : freshPercentage > 50 ? "secondary" : "destructive"}>
            {freshPercentage}% Fresh
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Database className="h-5 w-5" />}
            label="Total Schools"
            value={stats?.totalSchools || 0}
            color="text-primary"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Cached"
            value={stats?.enhancedCount || 0}
            subtext={`${cachedPercentage}%`}
            color="text-green-500"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Fresh (< 30 days)"
            value={stats?.recentCount || 0}
            color="text-blue-500"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Stale"
            value={stats?.staleCount || 0}
            color="text-amber-500"
          />
        </div>

        {/* Last Refresh Info */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Last Enhancement Update</p>
              <p className="text-xs text-muted-foreground">
                Weekly refresh runs Sunday 3 AM UTC
              </p>
            </div>
          </div>
          <div className="text-right">
            {lastRefresh ? (
              <>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(lastRefresh), { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(lastRefresh), 'MMM d, yyyy h:mm a')}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </div>
        </div>

        {/* Pending Notice */}
        {stats?.pendingCount && stats.pendingCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              {stats.pendingCount} school{stats.pendingCount > 1 ? 's' : ''} pending initial enhancement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  color: string;
}

function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subtext && <p className="text-xs font-medium text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}
