-- Add grade columns to schools table
ALTER TABLE public.schools
ADD COLUMN sports_grade text,
ADD COLUMN academics_grade text,
ADD COLUMN campus_grade text,
ADD COLUMN dorms_grade text;

-- Add check constraints for valid grades
ALTER TABLE public.schools
ADD CONSTRAINT valid_sports_grade CHECK (sports_grade IS NULL OR sports_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_academics_grade CHECK (academics_grade IS NULL OR academics_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_campus_grade CHECK (campus_grade IS NULL OR campus_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F')),
ADD CONSTRAINT valid_dorms_grade CHECK (dorms_grade IS NULL OR dorms_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'N/A'));