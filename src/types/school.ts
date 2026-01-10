// Re-export grading utilities for backwards compatibility
export { 
  gradeToRank as gradeRank, 
  rankToGrade,
  calculateOverallGrade,
  getGradeColor,
  getOverallGradeColor,
  getGradeDescription,
  meetsMinimumGrade,
  sortSchoolsByGrade,
  filterSchoolsByGrades,
  getGradeStats,
  compareByGrade,
  calculateGPA,
  getSchoolGrade,
  GRADE_OPTIONS,
  GRADE_CATEGORIES,
  type LetterGrade,
  type GradeValue,
  type GradeCategory,
  type GradeCategoryInfo
} from "@/lib/grading";

export interface School {
  id: string;
  name: string;
  type: string | null;
  city: string | null;
  state: string | null;
  website: string | null;
  admission_type: string | null;
  boarding: boolean;
  competitiveness: string | null;
  size: string | null;
  notes: string | null;
  sports_grade: string | null;
  academics_grade: string | null;
  campus_grade: string | null;
  dorms_grade: string | null;
  arts_grade: string | null;
  clubs_grade: string | null;
  diversity_grade: string | null;
  college_prep_grade: string | null;
  facilities_grade: string | null;
  faculty_grade: string | null;
  created_at: string;
  updated_at: string;
}

export type SortOption = 
  | 'name' 
  | 'overall' 
  | 'academics' 
  | 'sports' 
  | 'arts' 
  | 'clubs' 
  | 'diversity' 
  | 'college_prep' 
  | 'campus' 
  | 'facilities' 
  | 'faculty' 
  | 'dorms';

export interface SchoolFilters {
  search: string;
  states: string[];
  competitiveness: string[];
  boarding: 'all' | 'yes' | 'no';
  types: string[];
  sizes: string[];
  minAcademicsGrade: string;
  minSportsGrade: string;
  minCampusGrade: string;
  minDormsGrade: string;
  sortBy: SortOption;
  sortDesc: boolean;
}

export const defaultFilters: SchoolFilters = {
  search: '',
  states: [],
  competitiveness: [],
  boarding: 'all',
  types: [],
  sizes: [],
  minAcademicsGrade: '',
  minSportsGrade: '',
  minCampusGrade: '',
  minDormsGrade: '',
  sortBy: 'name',
  sortDesc: false,
};

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'overall', label: 'Overall Rating' },
  { value: 'academics', label: 'Academics' },
  { value: 'sports', label: 'Sports' },
  { value: 'arts', label: 'Arts' },
  { value: 'clubs', label: 'Clubs' },
  { value: 'diversity', label: 'Diversity' },
  { value: 'college_prep', label: 'College Prep' },
  { value: 'campus', label: 'Campus' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'dorms', label: 'Dorms' },
];

// Legacy exports - use GRADE_OPTIONS from grading.ts instead
export const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

export const competitivenessLevels = [
  'Highly Selective',
  'Selective',
  'Moderately Selective',
  'Less Selective',
];

export const schoolSizes = ['Small', 'Medium', 'Large'];

export const schoolTypes = [
  'Private',
  'Selective Public/Charter',
  'Magnet',
  'Boarding',
  'Day',
];

export const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];
