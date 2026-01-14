import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useEnhancementStats, useBulkEnhanceGrades } from '@/hooks/useEnhancedGrades';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { 
  Sparkles, 
  Loader2, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  RefreshCw,
  BarChart3,
  Zap
} from 'lucide-react';

export default function BulkEnhancement() {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useUserRole();
  const isAdmin = hasRole('admin');
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useEnhancementStats();
  const { enhanceAll, isEnhancing, progress } = useBulkEnhanceGrades();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleBulkEnhance = async () => {
    await enhanceAll();
    refetchStats();
  };

  const enhancementPercentage = stats 
    ? Math.round((stats.enhancedCount / stats.totalSchools) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Bulk Grade Enhancement - Admin | PrepPath AI</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bulk Grade Enhancement</h1>
            <p className="text-muted-foreground">
              Use AI to cross-reference and enhance school grades with data from multiple sources
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.totalSchools || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Schools</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.enhancedCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Enhanced</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.pendingCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats?.staleCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Stale (30d+)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Enhancement Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stats?.enhancedCount || 0} of {stats?.totalSchools || 0} schools enhanced</span>
                  <span className="font-medium">{enhancementPercentage}%</span>
                </div>
                <Progress value={enhancementPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Bulk Enhancement
              </CardTitle>
              <CardDescription>
                Process all unenhanced schools automatically. This will use AI credits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <strong>AI Cross-Referencing:</strong> Each school will be researched using data from 
                    Niche, PrepReview, official school sites, and more.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <strong>Caching:</strong> Results are cached for 30 days to avoid redundant processing.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <strong>Rate Limiting:</strong> Schools are processed in batches with delays to avoid rate limits.
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleBulkEnhance} 
                disabled={isEnhancing || (stats?.pendingCount === 0)}
                className="w-full"
                size="lg"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enhancing Schools...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Enhance {stats?.pendingCount || 0} Pending Schools
                  </>
                )}
              </Button>

              {progress && (
                <div className="space-y-3 pt-4">
                  <Separator />
                  <h4 className="font-semibold">Latest Run Results</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                      <div className="text-xl font-bold text-emerald-600">{progress.processed}</div>
                      <div className="text-xs text-muted-foreground">Processed</div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{progress.skipped}</div>
                      <div className="text-xs text-muted-foreground">Skipped (Cached)</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <div className="text-xl font-bold text-red-600">{progress.errors}</div>
                      <div className="text-xs text-muted-foreground">Errors</div>
                    </div>
                  </div>

                  {progress.results.filter(r => r.status === 'error').length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-destructive">Errors:</h5>
                      {progress.results
                        .filter(r => r.status === 'error')
                        .slice(0, 5)
                        .map((r, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm p-2 bg-destructive/10 rounded">
                            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium">{r.schoolName}:</span> {r.error}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
