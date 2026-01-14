import { useState, useCallback } from 'react';
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

interface UseEnhancedGradesResult {
  enhancedData: EnhancedSchoolData | null;
  isLoading: boolean;
  error: string | null;
  fetchEnhancedGrades: (schoolId: string, schoolName: string, currentGrades?: Record<string, string | null>) => Promise<void>;
}

export function useEnhancedGrades(): UseEnhancedGradesResult {
  const [enhancedData, setEnhancedData] = useState<EnhancedSchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEnhancedGrades = useCallback(async (
    schoolId: string, 
    schoolName: string, 
    currentGrades?: Record<string, string | null>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('enhance-school-grades', {
        body: { 
          schoolId, 
          schoolName,
          currentGrades 
        }
      });

      if (funcError) {
        throw funcError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setEnhancedData(data.data);
      
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
  }, [toast]);

  return {
    enhancedData,
    isLoading,
    error,
    fetchEnhancedGrades
  };
}
