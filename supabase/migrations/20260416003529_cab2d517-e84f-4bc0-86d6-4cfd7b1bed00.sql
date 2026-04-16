
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS tuition integer,
  ADD COLUMN IF NOT EXISTS acceptance_rate numeric,
  ADD COLUMN IF NOT EXISTS enrollment integer,
  ADD COLUMN IF NOT EXISTS founded_year integer;
