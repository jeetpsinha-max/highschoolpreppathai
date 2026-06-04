import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { School, SchoolFilters } from "@/types/school";
import { 
  gradeToRank, 
  calculateOverallGrade, 
  meetsMinimumGrade,
  type GradeCategory 
} from "@/lib/grading";

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
      
      // Client-side filtering for grades using grading utilities
      let schools = data as unknown as School[];
      
      if (filters?.minAcademicsGrade) {
        schools = schools.filter(s => meetsMinimumGrade(s.academics_grade, filters.minAcademicsGrade));
      }
      
      if (filters?.minSportsGrade) {
        schools = schools.filter(s => meetsMinimumGrade(s.sports_grade, filters.minSportsGrade));
      }
      
      if (filters?.minCampusGrade) {
        schools = schools.filter(s => meetsMinimumGrade(s.campus_grade, filters.minCampusGrade));
      }
      
      if (filters?.minDormsGrade) {
        schools = schools.filter(s => s.boarding && meetsMinimumGrade(s.dorms_grade, filters.minDormsGrade));
      }

      if (filters?.maxTuition != null) {
        schools = schools.filter(s => s.tuition != null && s.tuition <= filters.maxTuition!);
      }

      if (filters?.maxAcceptanceRate != null) {
        schools = schools.filter(s => s.acceptance_rate != null && s.acceptance_rate <= filters.maxAcceptanceRate!);
      }
      
      // Client-side sorting using grading utilities
      const sortBy = filters?.sortBy || 'name';
      const sortDesc = filters?.sortDesc ?? false;
      
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
      
      schools.sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'overall') {
          comparison = gradeToRank(calculateOverallGrade(a)) - gradeToRank(calculateOverallGrade(b));
        } else {
          const field = gradeFieldMap[sortBy];
          if (field) {
            comparison = gradeToRank(a[field] as string | null) - gradeToRank(b[field] as string | null);
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
