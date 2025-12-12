import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface SavedSchool {
  id: string;
  user_id: string;
  school_id: string;
  category: string;
  created_at: string;
}

export function useSavedSchools() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-schools", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("saved_schools")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SavedSchool[];
    },
    enabled: !!user,
  });
}

export function useSaveSchool() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ schoolId, category = "saved" }: { schoolId: string; category?: string }) => {
      if (!user) throw new Error("Must be logged in to save schools");

      const { data, error } = await supabase
        .from("saved_schools")
        .insert({
          user_id: user.id,
          school_id: schoolId,
          category,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-schools"] });
      toast.success("School saved to your list!");
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast.error("Failed to save school");
    },
  });
}

export function useUnsaveSchool() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (schoolId: string) => {
      if (!user) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("saved_schools")
        .delete()
        .eq("user_id", user.id)
        .eq("school_id", schoolId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-schools"] });
      toast.success("School removed from your list");
    },
    onError: (error) => {
      console.error("Unsave error:", error);
      toast.error("Failed to remove school");
    },
  });
}

export function useIsSchoolSaved(schoolId: string) {
  const { data: savedSchools } = useSavedSchools();
  return savedSchools?.some((s) => s.school_id === schoolId) ?? false;
}
