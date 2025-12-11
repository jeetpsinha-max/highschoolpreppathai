import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { School, SchoolFilters } from "@/types/school";

export function useSchools(filters?: SchoolFilters) {
  return useQuery({
    queryKey: ["schools", filters],
    queryFn: async () => {
      let query = supabase
        .from("schools")
        .select("*")
        .order("name");

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,state.ilike.%${filters.search}%`);
      }

      if (filters?.states && filters.states.length > 0) {
        query = query.in("state", filters.states);
      }

      if (filters?.competitiveness && filters.competitiveness.length > 0) {
        query = query.in("competitiveness", filters.competitiveness);
      }

      if (filters?.boarding && filters.boarding !== "all") {
        query = query.eq("boarding", filters.boarding === "yes");
      }

      if (filters?.sizes && filters.sizes.length > 0) {
        query = query.in("size", filters.sizes);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as School[];
    },
  });
}

export function useSchool(id: string) {
  return useQuery({
    queryKey: ["school", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as School | null;
    },
    enabled: !!id,
  });
}

export function useSchoolsByIds(ids: string[]) {
  return useQuery({
    queryKey: ["schools", "byIds", ids],
    queryFn: async () => {
      if (!ids.length) return [];
      
      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .in("id", ids);

      if (error) throw error;
      return data as School[];
    },
    enabled: ids.length > 0,
  });
}
