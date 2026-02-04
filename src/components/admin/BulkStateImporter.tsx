import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2, CheckCircle, XCircle, Play, Square } from 'lucide-react';
import { toast } from 'sonner';
import { usStates } from '@/types/school';

interface StateResult {
  state: string;
  inserted: number;
  duplicatesSkipped: number;
  success: boolean;
  error?: string;
}

export function BulkStateImporter() {
  const [isImporting, setIsImporting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: usStates.length, currentState: '' });
  const [results, setResults] = useState<StateResult[]>([]);
  const queryClient = useQueryClient();

  const stopRef = { current: false };

  const handleBulkImport = async () => {
    setIsImporting(true);
    setIsStopping(false);
    stopRef.current = false;
    setResults([]);
    setProgress({ current: 0, total: usStates.length, currentState: '' });

    let totalInserted = 0;
    let totalDuplicates = 0;

    try {
      for (let i = 0; i < usStates.length; i++) {
        if (stopRef.current) break;

        const state = usStates[i];
        setProgress({ current: i + 1, total: usStates.length, currentState: state });

        try {
          const { data, error } = await supabase.functions.invoke('import-niche-schools', {
            body: { state, limit: 25 },
          });

          if (error) throw error;
          if (data.error) throw new Error(data.error);

          totalInserted += data.inserted || 0;
          totalDuplicates += data.duplicatesSkipped || 0;

          setResults(prev => [...prev, {
            state,
            inserted: data.inserted || 0,
            duplicatesSkipped: data.duplicatesSkipped || 0,
            success: true,
          }]);
        } catch (error) {
          console.error(`Error importing ${state}:`, error);
          setResults(prev => [...prev, {
            state,
            inserted: 0,
            duplicatesSkipped: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }]);
        }

        // Delay between states to avoid rate limiting
        if (i < usStates.length - 1 && !stopRef.current) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (stopRef.current) {
        toast.info(`Stopped after ${progress.current} states. Added ${totalInserted} schools.`);
      } else {
        toast.success(`Completed! Added ${totalInserted} schools, skipped ${totalDuplicates} duplicates.`);
      }

      queryClient.invalidateQueries({ queryKey: ['schools'] });
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Failed to complete bulk import');
    } finally {
      setIsImporting(false);
      setIsStopping(false);
    }
  };

  const handleStop = () => {
    setIsStopping(true);
    stopRef.current = true;
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalDuplicates = results.reduce((sum, r) => sum + r.duplicatesSkipped, 0);
  const progressPercent = (progress.current / progress.total) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Bulk State Importer
            </CardTitle>
            <CardDescription>
              Import schools from all 50 states using Niche data
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isImporting ? (
              <Button variant="destructive" size="sm" onClick={handleStop} disabled={isStopping}>
                {isStopping ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Square className="h-4 w-4 mr-1" />
                )}
                Stop
              </Button>
            ) : (
              <Button onClick={handleBulkImport} size="sm">
                <Play className="h-4 w-4 mr-1" />
                Import All States
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing: {progress.currentState}</span>
              <span>{progress.current} / {progress.total} states</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                {successCount} States
              </Badge>
              {failCount > 0 && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {failCount} Failed
                </Badge>
              )}
              <Badge variant="secondary">
                +{totalInserted} Schools
              </Badge>
              <Badge variant="outline">
                {totalDuplicates} Duplicates
              </Badge>
            </div>

            <div className="max-h-48 overflow-y-auto border rounded-lg p-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1 text-xs p-1 rounded ${
                      result.success ? 'bg-primary/10' : 'bg-destructive/10'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                    )}
                    <span className="font-medium">{result.state}</span>
                    {result.success && (
                      <span className="text-muted-foreground">+{result.inserted}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
