import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { usStates } from '@/types/school';
import { 
  School, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Download
} from 'lucide-react';

interface ImportResult {
  success: boolean;
  state: string;
  found: number;
  inserted: number;
  duplicatesSkipped: number;
  duplicateNames: string[];
  newSchools: string[];
}

export default function ImportSchools() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [limit, setLimit] = useState([25]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImport = async () => {
    if (!selectedState) {
      toast({
        title: "Select a State",
        description: "Please select a state to import schools from.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setResult(null);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('import-niche-schools', {
        body: { state: selectedState, limit: limit[0] }
      });

      if (funcError) throw funcError;
      if (data.error) throw new Error(data.error);

      setResult(data);
      
      toast({
        title: "Import Complete",
        description: `Added ${data.inserted} new schools, skipped ${data.duplicatesSkipped} duplicates.`,
      });

      // Invalidate schools queries
      queryClient.invalidateQueries({ queryKey: ['schools'] });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import schools';
      setError(message);
      toast({
        title: "Import Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Download className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Import Schools</h1>
            <p className="text-muted-foreground">Add schools from Niche data using AI research</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Import Settings
              </CardTitle>
              <CardDescription>
                Select a state and number of schools to research and import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {usStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Number of Schools: {limit[0]}
                </label>
                <Slider
                  value={limit}
                  onValueChange={setLimit}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher numbers may take longer and use more AI credits
                </p>
              </div>

              <Button 
                onClick={handleImport} 
                disabled={isImporting || !selectedState}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Researching Schools...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import Schools
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Import Results
                </CardTitle>
                <CardDescription>
                  Imported schools for {result.state}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-2xl font-bold">{result.found}</div>
                    <div className="text-xs text-muted-foreground">Found</div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10">
                    <div className="text-2xl font-bold text-emerald-600">{result.inserted}</div>
                    <div className="text-xs text-muted-foreground">Added</div>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10">
                    <div className="text-2xl font-bold text-amber-600">{result.duplicatesSkipped}</div>
                    <div className="text-xs text-muted-foreground">Duplicates</div>
                  </div>
                </div>

                {result.newSchools.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">New Schools Added:</h4>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {result.newSchools.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.duplicateNames.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Duplicates Skipped:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {result.duplicateNames.slice(0, 10).map((name, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                      {result.duplicateNames.length > 10 && (
                        <Badge variant="secondary" className="text-xs">
                          +{result.duplicateNames.length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
