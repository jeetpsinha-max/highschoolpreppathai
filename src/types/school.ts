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
  created_at: string;
  updated_at: string;
}

export type GradeValue = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F' | 'N/A' | null;

export const getGradeColor = (grade: string | null): string => {
  if (!grade || grade === 'N/A') return 'bg-muted text-muted-foreground';
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
};

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
};

export const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

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
