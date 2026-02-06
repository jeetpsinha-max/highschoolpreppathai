import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Loader2, CheckCircle, XCircle, Play, Square, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BatchResult {
  schoolName: string;
  status: 'success' | 'error';
  error?: string;
}

interface RegradeResult {
  total: number;
  changed: number;
  upgrades: number;
  downgrades: number;
}

export function BulkSportsLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegrading, setIsRegrading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'enhancing' | 'regrading' | 'done'>('idle');
  const [progress, setProgress] = useState({ processed: 0, total: 0, current: '' });
  const [results, setResults] = useState<BatchResult[]>([]);
  const [regradeResult, setRegradeResult] = useState<RegradeResult | null>(null);
  const queryClient = useQueryClient();

  const triggerRegrade = async (schoolIds?: string[]) => {
    setIsRegrading(true);
    setPhase('regrading');
    try {
      const { data, error } = await supabase.functions.invoke('regrade-sports', {
        body: { schoolIds },
      });
      if (error) throw error;
      setRegradeResult({
        total: data.total,
        changed: data.changed,
        upgrades: data.upgrades,
        downgrades: data.downgrades,
      });
      toast.success(`Regraded: ${data.upgrades} upgrades, ${data.downgrades} downgrades out of ${data.total} schools`);
      queryClient.invalidateQueries({ queryKey: ['sports-rankings'] });
      queryClient.invalidateQueries({ queryKey: ['schools'] });
    } catch (error) {
      console.error('Regrade error:', error);
      toast.error('Failed to regrade sports');
    } finally {
      setIsRegrading(false);
      setPhase('done');
    }
  };

  const handleBulkLoad = async () => {
    setIsLoading(true);
    setPhase('enhancing');
    setResults([]);
    setRegradeResult(null);
    setProgress({ processed: 0, total: 0, current: 'Starting...' });

    try {
      const { count } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true });

      setProgress(prev => ({ ...prev, total: count || 0 }));

      const { data, error } = await supabase.functions.invoke('bulk-enhance-grades', {
        body: { batchSize: 3, delayMs: 3000 },
      });

      if (error) throw error;

      const enhancedIds: string[] = [];

      if (data.results) {
        setResults(data.results.map((r: { schoolId: string; schoolName: string; status: 'success' | 'error'; error?: string }) => {
          if (r.status === 'success') enhancedIds.push(r.schoolId);
          return { schoolName: r.schoolName, status: r.status, error: r.error };
        }));
        setProgress(prev => ({
          ...prev,
          processed: data.processed + data.skipped,
          current: 'Enhancement complete',
        }));
      }

      toast.success(`Enhanced ${data.processed} schools, ${data.skipped} cached, ${data.errors} errors`);

      queryClient.invalidateQueries({ queryKey: ['enhancement-stats'] });

      // Auto-trigger regrade after enhancement
      if (data.processed > 0 || data.skipped > 0) {
        toast.info('Now regrading sports based on new data...');
        await triggerRegrade();
      } else {
        setPhase('done');
      }
    } catch (error) {
      console.error('Bulk load error:', error);
      toast.error('Failed to complete bulk loading');
      setPhase('done');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegradeOnly = async () => {
    await triggerRegrade();
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const failCount = results.filter(r => r.status === 'error').length;
  const progressPercent = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;
  const isBusy = isLoading || isRegrading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Bulk Sports Data Loader
            </CardTitle>
            <CardDescription>
              Load AI-enhanced data and auto-regrade sports for all schools
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRegradeOnly} disabled={isBusy}>
              {isRegrading && phase !== 'enhancing' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Regrade Only
            </Button>
            <Button onClick={handleBulkLoad} size="sm" disabled={isBusy}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Load & Regrade
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase indicator */}
        {phase !== 'idle' && phase !== 'done' && (
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="font-medium">
              {phase === 'enhancing' ? 'Phase 1: Enhancing school data...' : 'Phase 2: Regrading sports...'}
            </span>
          </div>
        )}

        {(isLoading || progress.processed > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing: {progress.current}</span>
              <span>{progress.processed} / {progress.total || '?'}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex gap-4">
              <Badge variant="default" className="bg-primary">
                <CheckCircle className="h-3 w-3 mr-1" />
                {successCount} Enhanced
              </Badge>
              {failCount > 0 && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {failCount} Failed
                </Badge>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
              {results.slice(-20).map((result, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                  )}
                  <span className={result.status === 'success' ? '' : 'text-muted-foreground'}>
                    {result.schoolName}
                  </span>
                  {result.error && (
                    <span className="text-xs text-destructive truncate">({result.error})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regrade results */}
        {regradeResult && (
          <div className="p-3 rounded-lg bg-muted/50 border space-y-1">
            <div className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Sports Regrade Results
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{regradeResult.total} Schools</Badge>
              <Badge variant="outline">{regradeResult.changed} Changed</Badge>
              <Badge variant="default" className="bg-emerald-600">{regradeResult.upgrades} Upgrades</Badge>
              {regradeResult.downgrades > 0 && (
                <Badge variant="destructive">{regradeResult.downgrades} Downgrades</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
