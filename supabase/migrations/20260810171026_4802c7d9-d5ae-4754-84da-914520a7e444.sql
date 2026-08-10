ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS overall_score numeric,
  ADD COLUMN IF NOT EXISTS overall_grade text,
  ADD COLUMN IF NOT EXISTS grade_percentile numeric,
  ADD COLUMN IF NOT EXISTS grade_coverage numeric,
  ADD COLUMN IF NOT EXISTS graded_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS grading_version integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.schools.overall_score IS 'Weighted 0-100 composite of category grades plus selectivity (pre-curve).';
COMMENT ON COLUMN public.schools.overall_grade IS 'Letter grade derived by curving overall_score against the full school population.';
COMMENT ON COLUMN public.schools.grade_percentile IS 'Percentile rank (0-100) of overall_score across all graded schools.';
COMMENT ON COLUMN public.schools.grade_coverage IS 'Share of the weighting model (0-1) backed by real data rather than missing values.';
COMMENT ON COLUMN public.schools.grading_version IS 'Version of the grading model that produced these values. 0 = never graded.';

-- Sorting/filtering by the new rating happens on every school listing page.
CREATE INDEX IF NOT EXISTS schools_overall_score_idx
  ON public.schools (overall_score DESC NULLS LAST);