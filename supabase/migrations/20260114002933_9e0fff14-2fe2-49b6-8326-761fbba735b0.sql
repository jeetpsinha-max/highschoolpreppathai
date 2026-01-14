-- Create table to cache enhanced grade data
CREATE TABLE public.enhanced_school_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  overall_description TEXT,
  grade_enhancements JSONB NOT NULL DEFAULT '[]',
  key_strengths JSONB NOT NULL DEFAULT '[]',
  areas_for_improvement JSONB NOT NULL DEFAULT '[]',
  notable_programs JSONB NOT NULL DEFAULT '[]',
  reputation TEXT,
  sources_used JSONB DEFAULT '[]',
  confidence_avg NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(school_id)
);

-- Enable RLS
ALTER TABLE public.enhanced_school_grades ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read enhanced grades (public data)
CREATE POLICY "Enhanced grades are publicly readable"
ON public.enhanced_school_grades
FOR SELECT
USING (true);

-- Only allow service role to insert/update (via edge functions)
CREATE POLICY "Service role can manage enhanced grades"
ON public.enhanced_school_grades
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_enhanced_school_grades_updated_at
BEFORE UPDATE ON public.enhanced_school_grades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_enhanced_school_grades_school_id ON public.enhanced_school_grades(school_id);
CREATE INDEX idx_enhanced_school_grades_updated_at ON public.enhanced_school_grades(updated_at);