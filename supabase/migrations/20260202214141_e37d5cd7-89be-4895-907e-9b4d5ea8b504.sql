-- Add sports_programs column to enhanced_school_grades table
-- This will store detailed sports information including individual sports and their grades
ALTER TABLE public.enhanced_school_grades 
ADD COLUMN IF NOT EXISTS sports_programs jsonb DEFAULT '[]'::jsonb;