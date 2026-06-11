import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ShieldCheck, Loader2, CheckCircle, XCircle, Play, Square, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface VerifyResult {
  name: string;
  status: string;
  verifiedFields: number;
  changedFields: string[];
  success: boolean;
  error?: string;
}

export function BulkDataVerifier() {
  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [limit, setLimit] = useState([50]);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentSchool: '' });
  const [results, setResults] = useState<VerifyResult[]>([]);
  const queryClient = useQueryClient();
  const stopRef = useRef(false);

  const handleRun = async () => {
    setIsRunning(true);
    setIsStopping(false);
    stopRef.current = false;
    setResults([]);
    let processed = 0;

    // Prioritise never-verified / stalest schools first.
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, name')
      .order('last_verified_at', { ascending: true, nullsFirst: true })
      .limit(limit[0]);

    if (error || !schools) {
      toast.error('Could not load schools to verify');
      setIsRunning(false);
      return;
    }

    if (schools.length === 0) {
      toast.success('No schools available to verify.');
      setIsRunning(false);
      return;
    }

    setProgress({ current: 0, total: schools.length, currentSchool: '' });

    for (let i = 0; i < schools.length; i++) {
      if (stopRef.current) break;
      const school = schools[i];
      processed = i + 1;
      setProgress({ current: i + 1, total: schools.length, currentSchool: school.name });

      let retries = 0;
      const maxRetries = 3;
      let done = false;

      while (!done && retries < maxRetries && !stopRef.current) {
        try {
          const { data, error: fnError } = await supabase.functions.invoke('verify-school-data', {
            body: { schoolId: school.id },
          });
          if (fnError) throw fnError;
          if (data?.error) {
            if (data.error === 'RATE_LIMIT') throw new Error('RATE_LIMIT');
            throw new Error(data.error);
          }

          setResults(prev => [...prev, {
            name: school.name,
            status: data.status,
            verifiedFields: data.verifiedFields ?? 0,
            changedFields: data.changedFields ?? [],
            success: true,
          }]);
          done = true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Unknown error';
          const isRate = msg === 'RATE_LIMIT' || msg.includes('429') || msg.toLowerCase().includes('rate');
          if (isRate && retries < maxRetries - 1) {
            retries++;
            await new Promise(r => setTimeout(r, Math.pow(2, retries) * 8000));
          } else {
            setResults(prev => [...prev, {
              name: school.name,
              status: 'error',
              verifiedFields: 0,
              changedFields: [],
              success: false,
              error: msg,
            }]);
            done = true;
          }
        }
      }

      // Gentle pacing between schools to respect Firecrawl + AI limits.
      if (i < schools.length - 1 && !stopRef.current) {
        await new Promise(r => setTimeout(r, 2500));
      }
    }

    queryClient.invalidateQueries({ queryKey: ['schools'] });
    if (stopRef.current) {
      toast.info(`Stopped after ${processed} schools.`);
    } else {
      toast.success('Verification run complete.');
    }
    setIsRunning(false);
    setIsStopping(false);
  };

  const handleStop = () => {
    setIsStopping(true);
    stopRef.current = true;
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const changedCount = results.reduce((s, r) => s + r.changedFields.length, 0);
  const progressPercent = progress.total ? (progress.current / progress.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Web Data Verifier
            </CardTitle>
            <CardDescription>
              Cross-reference schools against the live web and record sources
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isRunning ? (
              <Button variant="destructive" size="sm" onClick={handleStop} disabled={isStopping}>
                {isStopping ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                Stop
              </Button>
            ) : (
              <Button onClick={handleRun} size="sm">
                <Play className="h-4 w-4 mr-1" />
                Verify
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Schools to verify (oldest first): {limit[0]}</label>
            <Slider value={limit} onValueChange={setLimit} min={5} max={300} step={5} />
            <p className="text-xs text-muted-foreground">
              Each school uses web scraping + AI credits. Start small to gauge speed and quality.
            </p>
          </div>
        )}

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="truncate">Verifying: {progress.currentSchool}</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />{successCount} verified</Badge>
              {failCount > 0 && (
                <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{failCount} failed</Badge>
              )}
              <Badge variant="secondary">{changedCount} fields corrected</Badge>
            </div>

            <div className="max-h-56 overflow-y-auto border rounded-lg p-2 space-y-1">
              {results.map((r, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-2 text-xs p-1.5 rounded ${
                    r.success ? 'bg-primary/5' : 'bg-destructive/10'
                  }`}
                >
                  <span className="flex items-center gap-1 min-w-0">
                    {r.success ? (
                      <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />
                    )}
                    <span className="truncate font-medium">{r.name}</span>
                  </span>
                  {r.success ? (
                    <span className="text-muted-foreground flex-shrink-0">
                      {r.status} · {r.changedFields.length} fixed
                    </span>
                  ) : (
                    <span className="text-destructive flex-shrink-0 truncate max-w-[40%]">{r.error}</span>
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
