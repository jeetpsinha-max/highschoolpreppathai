import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GradeEnhancement {
  category: string;
  grade: string;
  confidence: number;
  description: string;
  highlights: string[];
  sources: string[];
}

export interface EnhancedSchoolData {
  schoolName: string;
  overallDescription: string;
  gradeEnhancements: GradeEnhancement[];
  keyStrengths: string[];
  areasForImprovement: string[];
  notablePrograms: string[];
  reputation: string;
}

interface CachedEnhancedGrades {
  id: string;
  school_id: string;
  overall_description: string | null;
  grade_enhancements: GradeEnhancement[];
  key_strengths: string[];
  areas_for_improvement: string[];
  notable_programs: string[];
  reputation: string | null;
  sources_used: string[];
  confidence_avg: number | null;
  created_at: string;
  updated_at: string;
}

interface UseEnhancedGradesResult {
  enhancedData: EnhancedSchoolData | null;
  isLoading: boolean;
  isCached: boolean;
  cachedAt: string | null;
  error: string | null;
  fetchEnhancedGrades: (forceRefresh?: boolean) => Promise<void>;
}

export function useEnhancedGrades(schoolId: string, schoolName: string): UseEnhancedGradesResult {
  const [enhancedData, setEnhancedData] = useState<EnhancedSchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for cached data on mount
  useEffect(() => {
    if (!schoolId) return;
    
    const checkCache = async () => {
      const { data: cached } = await supabase
        .from('enhanced_school_grades')
        .select('*')
        .eq('school_id', schoolId)
        .single();
      
      if (cached) {
        setEnhancedData({
          schoolName,
          overallDescription: cached.overall_description || '',
          gradeEnhancements: (cached.grade_enhancements as unknown as GradeEnhancement[]) || [],
          keyStrengths: (cached.key_strengths as unknown as string[]) || [],
          areasForImprovement: (cached.areas_for_improvement as unknown as string[]) || [],
          notablePrograms: (cached.notable_programs as unknown as string[]) || [],
          reputation: cached.reputation || ''
        });
        setIsCached(true);
        setCachedAt(cached.updated_at);
      }
    };
    
    checkCache();
  }, [schoolId, schoolName]);

  const fetchEnhancedGrades = useCallback(async (forceRefresh = false) => {
    if (!schoolId || !schoolName) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('enhance-school-grades', {
        body: { 
          schoolId, 
          schoolName,
          forceRefresh
        }
      });

      if (funcError) {
        throw funcError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setEnhancedData(data.data);
      setIsCached(data.cached || false);
      setCachedAt(data.cachedAt || new Date().toISOString());
      
      // Invalidate any related queries
      queryClient.invalidateQueries({ queryKey: ['enhanced-grades', schoolId] });
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enhance grades';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast({
          title: "Rate Limited",
          description: "Please wait a moment before trying again.",
          variant: "destructive"
        });
      } else if (message.includes('credits')) {
        toast({
          title: "AI Credits Exhausted",
          description: "Please add credits to continue using AI features.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [schoolId, schoolName, toast, queryClient]);

  return {
    enhancedData,
    isLoading,
    isCached,
    cachedAt,
    error,
    fetchEnhancedGrades
  };
}

// Hook for bulk enhancement
interface BulkEnhanceResult {
  success: boolean;
  processed: number;
  errors: number;
  skipped: number;
  total: number;
  results: { schoolId: string; schoolName: string; status: 'success' | 'error'; error?: string }[];
}

export function useBulkEnhanceGrades() {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [progress, setProgress] = useState<BulkEnhanceResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enhanceAll = useCallback(async (schoolIds?: string[]) => {
    setIsEnhancing(true);
    setProgress(null);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-enhance-grades', {
        body: { schoolIds, batchSize: 3, delayMs: 3000 }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setProgress(data);
      
      toast({
        title: "Bulk Enhancement Complete",
        description: `${data.processed} schools enhanced, ${data.skipped} already cached, ${data.errors} errors`,
      });

      // Invalidate all enhanced grades queries
      queryClient.invalidateQueries({ queryKey: ['enhanced-grades'] });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enhance grades';
      toast({
        title: "Enhancement Failed",
        description: message,
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsEnhancing(false);
    }
  }, [toast, queryClient]);

  return {
    enhanceAll,
    isEnhancing,
    progress
  };
}

// Hook to get enhancement stats
export function useEnhancementStats() {
  return useQuery({
    queryKey: ['enhancement-stats'],
    queryFn: async () => {
      const { count: totalSchools } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });

      const { count: enhancedCount } = await supabase
        .from('enhanced_school_grades')
        .select('*', { count: 'exact', head: true });

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: recentCount } = await supabase
        .from('enhanced_school_grades')
        .select('*', { count: 'exact', head: true })
        .gt('updated_at', thirtyDaysAgo);

      return {
        totalSchools: totalSchools || 0,
        enhancedCount: enhancedCount || 0,
        recentCount: recentCount || 0,
        pendingCount: (totalSchools || 0) - (enhancedCount || 0),
        staleCount: (enhancedCount || 0) - (recentCount || 0)
      };
    }
  });
}
