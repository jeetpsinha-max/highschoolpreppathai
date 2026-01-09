-- Add additional grade columns to schools table
ALTER TABLE public.schools
ADD COLUMN arts_grade text,
ADD COLUMN clubs_grade text,
ADD COLUMN diversity_grade text,
ADD COLUMN college_prep_grade text,
ADD COLUMN facilities_grade text,
ADD COLUMN faculty_grade text;

-- Add check constraints for valid grades
ALTER TABLE public.schools
ADD CONSTRAINT valid_arts_grade CHECK (arts_grade IS NULL OR arts_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_clubs_grade CHECK (clubs_grade IS NULL OR clubs_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_diversity_grade CHECK (diversity_grade IS NULL OR diversity_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_college_prep_grade CHECK (college_prep_grade IS NULL OR college_prep_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_facilities_grade CHECK (facilities_grade IS NULL OR facilities_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_faculty_grade CHECK (faculty_grade IS NULL OR faculty_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'));