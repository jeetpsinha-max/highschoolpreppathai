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

export type GradeValue = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F' | 'N/A' | null;

export const gradeRank = (grade: string | null): number => {
  if (!grade || grade === 'N/A') return -1;
  const ranks: Record<string, number> = {
    'A+': 13, 'A': 12, 'A-': 11,
    'B+': 10, 'B': 9, 'B-': 8,
    'C+': 7, 'C': 6, 'C-': 5,
    'D+': 4, 'D': 3, 'D-': 2,
    'F': 1
  };
  return ranks[grade] || 0;
};

export const rankToGrade = (rank: number): string => {
  if (rank >= 12.5) return 'A+';
  if (rank >= 11.5) return 'A';
  if (rank >= 10.5) return 'A-';
  if (rank >= 9.5) return 'B+';
  if (rank >= 8.5) return 'B';
  if (rank >= 7.5) return 'B-';
  if (rank >= 6.5) return 'C+';
  if (rank >= 5.5) return 'C';
  if (rank >= 4.5) return 'C-';
  if (rank >= 3.5) return 'D+';
  if (rank >= 2.5) return 'D';
  if (rank >= 1.5) return 'D-';
  return 'F';
};

export const calculateOverallGrade = (school: School): string => {
  const grades = [
    school.academics_grade,
    school.sports_grade,
    school.campus_grade,
    school.arts_grade,
    school.clubs_grade,
    school.diversity_grade,
    school.college_prep_grade,
    school.facilities_grade,
    school.faculty_grade,
  ];
  
  // Only include dorms if boarding school
  if (school.boarding && school.dorms_grade && school.dorms_grade !== 'N/A') {
    grades.push(school.dorms_grade);
  }
  
  const validGrades = grades.filter(g => g && g !== 'N/A');
  if (validGrades.length === 0) return '-';
  
  const totalRank = validGrades.reduce((sum, g) => sum + gradeRank(g), 0);
  const avgRank = totalRank / validGrades.length;
  
  return rankToGrade(avgRank);
};

export const getGradeColor = (grade: string | null): string => {
  if (!grade || grade === 'N/A' || grade === '-') return 'bg-muted text-muted-foreground';
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
};

export const getOverallGradeColor = (grade: string | null): string => {
  if (!grade || grade === '-') return 'bg-muted text-muted-foreground';
  if (grade.startsWith('A')) return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white';
  if (grade.startsWith('B')) return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white';
  if (grade.startsWith('C')) return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white';
  if (grade.startsWith('D')) return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white';
  return 'bg-gradient-to-br from-red-500 to-red-600 text-white';
};

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
