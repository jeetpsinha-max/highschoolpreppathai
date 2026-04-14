import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserPreferences {
  id: string;
  user_id: string;
  grade_level: string | null;
  interests: string[];
  target_states: string[];
  priorities: string[];
  boarding_preference: string;
  budget_range: string | null;
  extracurriculars: string[];
  academic_strengths: string[];
  test_prep_status: string | null;
  application_year: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserPreferences | null;
    },
    enabled: !!user,
  });

  const upsertMutation = useMutation({
    mutationFn: async (prefs: Partial<UserPreferences>) => {
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_preferences")
          .update(prefs)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_preferences")
          .insert({ ...prefs, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    savePreferences: upsertMutation.mutateAsync,
    isSaving: upsertMutation.isPending,
  };
}
