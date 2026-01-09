import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { School, SchoolFilters, gradeRank, calculateOverallGrade } from "@/types/school";

export function useSchools(filters?: SchoolFilters) {
  return useQuery({
    queryKey: ["schools", filters],
    queryFn: async () => {
      let query = supabase
        .from("schools")
        .select("*");

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
      
      // Client-side filtering for grades (since we need >= comparison)
      let schools = data as School[];
      
      if (filters?.minAcademicsGrade) {
        const minRank = gradeRank(filters.minAcademicsGrade);
        schools = schools.filter(s => gradeRank(s.academics_grade) >= minRank);
      }
      
      if (filters?.minSportsGrade) {
        const minRank = gradeRank(filters.minSportsGrade);
        schools = schools.filter(s => gradeRank(s.sports_grade) >= minRank);
      }
      
      if (filters?.minCampusGrade) {
        const minRank = gradeRank(filters.minCampusGrade);
        schools = schools.filter(s => gradeRank(s.campus_grade) >= minRank);
      }
      
      if (filters?.minDormsGrade) {
        const minRank = gradeRank(filters.minDormsGrade);
        schools = schools.filter(s => s.boarding && gradeRank(s.dorms_grade) >= minRank);
      }
      
      // Client-side sorting
      const sortBy = filters?.sortBy || 'name';
      const sortDesc = filters?.sortDesc ?? false;
      
      schools.sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'overall') {
          comparison = gradeRank(calculateOverallGrade(a)) - gradeRank(calculateOverallGrade(b));
        } else {
          const gradeFieldMap: Record<string, keyof School> = {
            academics: 'academics_grade',
            sports: 'sports_grade',
            arts: 'arts_grade',
            clubs: 'clubs_grade',
            diversity: 'diversity_grade',
            college_prep: 'college_prep_grade',
            campus: 'campus_grade',
            facilities: 'facilities_grade',
            faculty: 'faculty_grade',
            dorms: 'dorms_grade',
          };
          const field = gradeFieldMap[sortBy];
          if (field) {
            comparison = gradeRank(a[field] as string | null) - gradeRank(b[field] as string | null);
          }
        }
        
        return sortDesc ? -comparison : comparison;
      });
      
      return schools;
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
