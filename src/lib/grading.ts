import type { School } from "@/types/school";

// Grade type definitions
export type LetterGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';
export type GradeValue = LetterGrade | 'N/A' | null;

// All grade options in order from best to worst
export const GRADE_OPTIONS: LetterGrade[] = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

// Grade category definitions with icons and display names
export type GradeCategory = 
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

export interface GradeCategoryInfo {
  key: GradeCategory;
  label: string;
  field: keyof School;
  description: string;
}

export const GRADE_CATEGORIES: GradeCategoryInfo[] = [
  { key: 'academics', label: 'Academics', field: 'academics_grade', description: 'Academic rigor, curriculum quality, and college preparation' },
  { key: 'sports', label: 'Sports', field: 'sports_grade', description: 'Athletic programs, facilities, and competitive success' },
  { key: 'arts', label: 'Arts', field: 'arts_grade', description: 'Visual arts, music, theater, and creative programs' },
  { key: 'clubs', label: 'Clubs', field: 'clubs_grade', description: 'Extracurricular activities, student organizations, and clubs' },
  { key: 'diversity', label: 'Diversity', field: 'diversity_grade', description: 'Student body diversity and inclusive culture' },
  { key: 'college_prep', label: 'College Prep', field: 'college_prep_grade', description: 'College counseling, placement rates, and preparation' },
  { key: 'campus', label: 'Campus', field: 'campus_grade', description: 'Campus beauty, size, and overall environment' },
  { key: 'facilities', label: 'Facilities', field: 'facilities_grade', description: 'Buildings, technology, labs, and infrastructure' },
  { key: 'faculty', label: 'Faculty', field: 'faculty_grade', description: 'Teacher quality, experience, and student support' },
  { key: 'dorms', label: 'Dorms', field: 'dorms_grade', description: 'Residential life quality for boarding schools' },
];

// Numeric grade ranking (higher = better)
const GRADE_RANK_MAP: Record<string, number> = {
  'A+': 13, 'A': 12, 'A-': 11,
  'B+': 10, 'B': 9, 'B-': 8,
  'C+': 7, 'C': 6, 'C-': 5,
  'D+': 4, 'D': 3, 'D-': 2,
  'F': 1
};

/**
 * Convert a letter grade to a numeric rank (higher = better)
 */
export const gradeToRank = (grade: string | null): number => {
  if (!grade || grade === 'N/A') return -1;
  return GRADE_RANK_MAP[grade] ?? 0;
};

/**
 * Convert a numeric rank to a letter grade
 */
export const rankToGrade = (rank: number): LetterGrade => {
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

/**
 * Get the grade for a specific category from a school
 */
export const getSchoolGrade = (school: School, category: GradeCategory): string | null => {
  const categoryInfo = GRADE_CATEGORIES.find(c => c.key === category);
  if (!categoryInfo) return null;
  return school[categoryInfo.field] as string | null;
};

/**
 * Calculate the overall grade for a school based on all category grades
 */
export const calculateOverallGrade = (school: School): string => {
  const grades: (string | null)[] = [
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
  
  const validGrades = grades.filter((g): g is string => !!g && g !== 'N/A');
  if (validGrades.length === 0) return '-';
  
  const totalRank = validGrades.reduce((sum, g) => sum + gradeToRank(g), 0);
  const avgRank = totalRank / validGrades.length;
  
  return rankToGrade(avgRank);
};

/**
 * Calculate GPA-style average (4.0 scale) from grades
 */
export const calculateGPA = (school: School): number | null => {
  const grades: (string | null)[] = [
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
  
  if (school.boarding && school.dorms_grade && school.dorms_grade !== 'N/A') {
    grades.push(school.dorms_grade);
  }
  
  const validGrades = grades.filter((g): g is string => !!g && g !== 'N/A');
  if (validGrades.length === 0) return null;
  
  // Convert to 4.0 scale: A+ = 4.3, A = 4.0, A- = 3.7, etc.
  const gpaMap: Record<string, number> = {
    'A+': 4.3, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  
  const totalGpa = validGrades.reduce((sum, g) => sum + (gpaMap[g] ?? 0), 0);
  return Math.round((totalGpa / validGrades.length) * 100) / 100;
};

/**
 * Compare two schools by a specific grade category
 */
export const compareByGrade = (
  a: School, 
  b: School, 
  category: GradeCategory | 'overall',
  descending: boolean = true
): number => {
  let rankA: number;
  let rankB: number;
  
  if (category === 'overall') {
    rankA = gradeToRank(calculateOverallGrade(a));
    rankB = gradeToRank(calculateOverallGrade(b));
  } else {
    rankA = gradeToRank(getSchoolGrade(a, category));
    rankB = gradeToRank(getSchoolGrade(b, category));
  }
  
  const comparison = rankA - rankB;
  return descending ? -comparison : comparison;
};

/**
 * Get tailwind classes for grade badge styling
 */
export const getGradeColor = (grade: string | null): string => {
  if (!grade || grade === 'N/A' || grade === '-') {
    return 'bg-muted text-muted-foreground';
  }
  
  if (grade.startsWith('A')) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
  if (grade.startsWith('B')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  }
  if (grade.startsWith('C')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
  if (grade.startsWith('D')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  }
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
};

/**
 * Get tailwind classes for overall grade badge (more prominent styling)
 */
export const getOverallGradeColor = (grade: string | null): string => {
  if (!grade || grade === '-') {
    return 'bg-muted text-muted-foreground';
  }
  
  if (grade.startsWith('A')) {
    return 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25';
  }
  if (grade.startsWith('B')) {
    return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25';
  }
  if (grade.startsWith('C')) {
    return 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-yellow-500/25';
  }
  if (grade.startsWith('D')) {
    return 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/25';
  }
  return 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/25';
};

/**
 * Get a text description of the grade
 */
export const getGradeDescription = (grade: string | null): string => {
  if (!grade || grade === 'N/A' || grade === '-') return 'Not rated';
  
  if (grade === 'A+') return 'Exceptional';
  if (grade === 'A') return 'Excellent';
  if (grade === 'A-') return 'Very Good';
  if (grade === 'B+') return 'Good';
  if (grade === 'B') return 'Above Average';
  if (grade === 'B-') return 'Solid';
  if (grade === 'C+') return 'Average';
  if (grade === 'C') return 'Fair';
  if (grade === 'C-') return 'Below Average';
  if (grade === 'D+') return 'Needs Improvement';
  if (grade === 'D') return 'Poor';
  if (grade === 'D-') return 'Very Poor';
  return 'Failing';
};

/**
 * Check if a grade meets a minimum threshold
 */
export const meetsMinimumGrade = (grade: string | null, minGrade: string): boolean => {
  if (!minGrade) return true;
  const gradeRank = gradeToRank(grade);
  const minRank = gradeToRank(minGrade);
  return gradeRank >= minRank;
};

/**
 * Get schools sorted by a grade category
 */
export const sortSchoolsByGrade = (
  schools: School[], 
  category: GradeCategory | 'overall' | 'name',
  descending: boolean = true
): School[] => {
  return [...schools].sort((a, b) => {
    if (category === 'name') {
      const comparison = a.name.localeCompare(b.name);
      return descending ? -comparison : comparison;
    }
    return compareByGrade(a, b, category as GradeCategory | 'overall', descending);
  });
};

/**
 * Filter schools by minimum grades
 */
export const filterSchoolsByGrades = (
  schools: School[],
  filters: Partial<Record<GradeCategory, string>>
): School[] => {
  return schools.filter(school => {
    return Object.entries(filters).every(([category, minGrade]) => {
      if (!minGrade) return true;
      const grade = getSchoolGrade(school, category as GradeCategory);
      return meetsMinimumGrade(grade, minGrade);
    });
  });
};

/**
 * Get grade statistics for a list of schools
 */
export const getGradeStats = (schools: School[], category: GradeCategory): {
  average: string;
  highest: string;
  lowest: string;
  distribution: Record<LetterGrade, number>;
} => {
  const grades = schools
    .map(s => getSchoolGrade(s, category))
    .filter((g): g is string => !!g && g !== 'N/A');
  
  if (grades.length === 0) {
    return {
      average: '-',
      highest: '-',
      lowest: '-',
      distribution: GRADE_OPTIONS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<LetterGrade, number>)
    };
  }
  
  const ranks = grades.map(g => gradeToRank(g));
  const avgRank = ranks.reduce((a, b) => a + b, 0) / ranks.length;
  
  const distribution = GRADE_OPTIONS.reduce((acc, g) => ({ ...acc, [g]: 0 }), {} as Record<LetterGrade, number>);
  grades.forEach(g => {
    if (g in distribution) {
      distribution[g as LetterGrade]++;
    }
  });
  
  return {
    average: rankToGrade(avgRank),
    highest: rankToGrade(Math.max(...ranks)),
    lowest: rankToGrade(Math.min(...ranks)),
    distribution
  };
};
