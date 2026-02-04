import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Loader2, CheckCircle, XCircle, Play, Square } from 'lucide-react';
import { toast } from 'sonner';

interface BatchResult {
  schoolName: string;
  status: 'success' | 'error';
  error?: string;
}

export function BulkSportsLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [progress, setProgress] = useState({ processed: 0, total: 0, current: '' });
  const [results, setResults] = useState<BatchResult[]>([]);
  const queryClient = useQueryClient();

  const stopRef = { current: false };

  const handleBulkLoad = async () => {
    setIsLoading(true);
    setIsStopping(false);
    stopRef.current = false;
    setResults([]);
    setProgress({ processed: 0, total: 0, current: 'Starting...' });

    try {
      // Get count of schools without enhanced data
      const { count } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true });
      
      setProgress(prev => ({ ...prev, total: count || 0 }));

      // Use the bulk-enhance-grades function with smaller batches
      const { data, error } = await supabase.functions.invoke('bulk-enhance-grades', {
        body: { batchSize: 3, delayMs: 3000 },
      });

      if (error) throw error;

      if (data.results) {
        setResults(data.results.map((r: { schoolName: string; status: 'success' | 'error'; error?: string }) => ({
          schoolName: r.schoolName,
          status: r.status,
          error: r.error,
        })));
        setProgress(prev => ({
          ...prev,
          processed: data.processed + data.skipped,
          current: 'Complete',
        }));
      }

      toast.success(`Completed! ${data.processed} enhanced, ${data.skipped} already cached, ${data.errors} errors`);

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['enhancement-stats'] });
      queryClient.invalidateQueries({ queryKey: ['sports-rankings'] });
    } catch (error) {
      console.error('Bulk load error:', error);
      toast.error('Failed to complete bulk loading');
    } finally {
      setIsLoading(false);
      setIsStopping(false);
    }
  };

  const handleStop = () => {
    setIsStopping(true);
    stopRef.current = true;
    toast.info('Stopping after current batch...');
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const failCount = results.filter(r => r.status === 'error').length;
  const progressPercent = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

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
              Load AI-enhanced data for all schools (includes sports programs)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isLoading ? (
              <Button variant="destructive" size="sm" onClick={handleStop} disabled={isStopping}>
                {isStopping ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Square className="h-4 w-4 mr-1" />
                )}
                Stop
              </Button>
            ) : (
              <Button onClick={handleBulkLoad} size="sm">
                <Play className="h-4 w-4 mr-1" />
                Load All Sports Data
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
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
                {successCount} Success
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
      </CardContent>
    </Card>
  );
}
