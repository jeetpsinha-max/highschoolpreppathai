import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Link2, Loader2, CheckCircle, XCircle, Play, Square, AlertTriangle,
  Copy, ArrowRight, Trash2, Search,
} from 'lucide-react';
import { toast } from 'sonner';

interface LocationChange {
  field: string;
  from: string | null;
  to: string | null;
}

interface CleanResult {
  name: string;
  outcome: string;
  original: string | null;
  canonical: string | null;
  reachable?: boolean;
  changed: boolean;
  locationChanges?: LocationChange[];
  success: boolean;
  error?: string;
}

interface DuplicateGroup {
  domainKey: string;
  count: number;
  schools: { id: string; name: string; location: string; verification_status: string }[];
}

const outcomeMeta: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  cleaned: { label: 'Cleaned', variant: 'default' },
  already_clean: { label: 'Already clean', variant: 'secondary' },
  cleared_invalid: { label: 'Cleared junk', variant: 'destructive' },
  invalid: { label: 'Invalid', variant: 'outline' },
  empty: { label: 'No URL', variant: 'outline' },
  error: { label: 'Error', variant: 'destructive' },
};

export function UrlCleaner() {
  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [limit, setLimit] = useState([100]);
  const [resolveRedirects, setResolveRedirects] = useState(true);
  const [clearInvalid, setClearInvalid] = useState(true);
  const [normalizeLocation, setNormalizeLocation] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentSchool: '' });
  const [results, setResults] = useState<CleanResult[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const queryClient = useQueryClient();
  const stopRef = useRef(false);

  const handleScanDuplicates = async () => {
    setIsScanning(true);
    setDuplicates(null);
    try {
      const { data, error } = await supabase.functions.invoke('clean-school-urls', {
        body: { action: 'scan-duplicates' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDuplicates(data.duplicates ?? []);
      toast.success(`Found ${data.groupCount} domains shared by multiple schools.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Duplicate scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setIsStopping(false);
    stopRef.current = false;
    setResults([]);
    let processed = 0;

    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, name')
      .not('website', 'is', null)
      .order('updated_at', { ascending: true })
      .limit(limit[0]);

    if (error || !schools) {
      toast.error('Could not load schools to clean');
      setIsRunning(false);
      return;
    }
    if (schools.length === 0) {
      toast.success('No schools with websites to clean.');
      setIsRunning(false);
      return;
    }

    setProgress({ current: 0, total: schools.length, currentSchool: '' });

    for (let i = 0; i < schools.length; i++) {
      if (stopRef.current) break;
      const school = schools[i];
      processed = i + 1;
      setProgress({ current: i + 1, total: schools.length, currentSchool: school.name });

      try {
        const { data, error: fnError } = await supabase.functions.invoke('clean-school-urls', {
          body: { schoolId: school.id, resolveRedirects, clearInvalid, normalizeLocation },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        setResults(prev => [...prev, { ...data, success: true }]);
      } catch (err) {
        setResults(prev => [...prev, {
          name: school.name,
          outcome: 'error',
          original: null,
          canonical: null,
          changed: false,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        }]);
      }

      if (i < schools.length - 1 && !stopRef.current) {
        await new Promise(r => setTimeout(r, resolveRedirects ? 400 : 120));
      }
    }

    queryClient.invalidateQueries({ queryKey: ['schools'] });
    toast[stopRef.current ? 'info' : 'success'](
      stopRef.current ? `Stopped after ${processed} schools.` : 'URL cleaning complete.',
    );
    setIsRunning(false);
    setIsStopping(false);
  };

  const handleStop = () => {
    setIsStopping(true);
    stopRef.current = true;
  };

  const changedCount = results.filter(r => r.changed).length;
  const failCount = results.filter(r => !r.success).length;
  const progressPercent = progress.total ? (progress.current / progress.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              URL Cleaner
            </CardTitle>
            <CardDescription>
              Standardize website URLs — canonicalize, follow redirects, and flag duplicates
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleScanDuplicates} disabled={isScanning || isRunning}>
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
              Scan duplicates
            </Button>
            {isRunning ? (
              <Button variant="destructive" size="sm" onClick={handleStop} disabled={isStopping}>
                {isStopping ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                Stop
              </Button>
            ) : (
              <Button onClick={handleRun} size="sm">
                <Play className="h-4 w-4 mr-1" />
                Clean URLs
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Schools to process: {limit[0]}</label>
              <Slider value={limit} onValueChange={setLimit} min={10} max={500} step={10} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Follow redirects</p>
                <p className="text-xs text-muted-foreground">Resolve each URL to its real final destination (slower, more accurate)</p>
              </div>
              <Switch checked={resolveRedirects} onCheckedChange={setResolveRedirects} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Clear junk values</p>
                <p className="text-xs text-muted-foreground">Remove unparseable placeholders like "invalid_url"</p>
              </div>
              <Switch checked={clearInvalid} onCheckedChange={setClearInvalid} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Normalize location fields</p>
                <p className="text-xs text-muted-foreground">Standardize city casing/whitespace and state codes for consistent verification</p>
              </div>
              <Switch checked={normalizeLocation} onCheckedChange={setNormalizeLocation} />
            </div>
          </div>
        )}

        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="truncate">Cleaning: {progress.currentSchool}</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />{changedCount} updated</Badge>
              <Badge variant="secondary">{results.length - changedCount - failCount} unchanged</Badge>
              {failCount > 0 && (
                <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{failCount} failed</Badge>
              )}
            </div>
            <div className="max-h-56 overflow-y-auto border rounded-lg p-2 space-y-1">
              {results.filter(r => r.changed || !r.success).map((r, idx) => {
                const meta = outcomeMeta[r.outcome] ?? outcomeMeta.error;
                return (
                  <div key={idx} className="text-xs p-1.5 rounded bg-muted/50 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 min-w-0">
                        {r.success ? <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" /> : <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0" />}
                        <span className="truncate font-medium">{r.name}</span>
                      </span>
                      <Badge variant={meta.variant} className="text-[10px] flex-shrink-0">{meta.label}</Badge>
                    </div>
                    {r.success && r.outcome === 'cleaned' && (
                      <div className="flex items-center gap-1 text-muted-foreground truncate">
                        <span className="truncate line-through">{r.original}</span>
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate text-foreground">{r.canonical}</span>
                      </div>
                    )}
                    {r.success && r.locationChanges?.map((lc) => (
                      <div key={lc.field} className="flex items-center gap-1 text-muted-foreground truncate">
                        <span className="uppercase text-[9px] font-semibold text-primary flex-shrink-0">{lc.field}</span>
                        <span className="truncate line-through">{lc.from ?? '—'}</span>
                        <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate text-foreground">{lc.to ?? '—'}</span>
                      </div>
                    ))}
                    {!r.success && <p className="text-destructive truncate">{r.error}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {duplicates && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Copy className="h-4 w-4 text-amber-500" />
              {duplicates.length} shared-domain groups
              {duplicates.length === 0 && <span className="text-muted-foreground font-normal">— no duplicates found</span>}
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2">
              {duplicates.map((g) => (
                <div key={g.domainKey} className="border rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium">{g.domainKey}</span>
                    <Badge variant="outline" className="text-[10px]">{g.count} schools</Badge>
                  </div>
                  {g.schools.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 text-xs text-muted-foreground pl-2">
                      <span className="truncate">{s.name}</span>
                      <span className="flex-shrink-0">{s.location}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {duplicates.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Trash2 className="h-3 w-3" />
                Review these manually — some share a district domain legitimately, others are true duplicates.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
