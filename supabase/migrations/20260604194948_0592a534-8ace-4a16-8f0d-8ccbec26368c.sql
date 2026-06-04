-- 1. Add provenance / verification columns to schools
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'ai_estimated',
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS data_confidence numeric,
  ADD COLUMN IF NOT EXISTS field_sources jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_notes text;

-- Helpful index for prioritising stale / unverified rows
CREATE INDEX IF NOT EXISTS idx_schools_verification
  ON public.schools (verification_status, last_verified_at NULLS FIRST);

-- 2. Audit trail of every verification change
CREATE TABLE IF NOT EXISTS public.school_data_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  field text NOT NULL,
  old_value text,
  new_value text,
  source text,
  source_url text,
  confidence numeric,
  changed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.school_data_audit TO authenticated;
GRANT SELECT ON public.school_data_audit TO anon;
GRANT ALL ON public.school_data_audit TO service_role;

ALTER TABLE public.school_data_audit ENABLE ROW LEVEL SECURITY;

-- Audit log is non-sensitive provenance data: anyone can read it, only the
-- backend (service_role) writes to it.
CREATE POLICY "Audit log is publicly readable"
  ON public.school_data_audit
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_school_data_audit_school
  ON public.school_data_audit (school_id, created_at DESC);