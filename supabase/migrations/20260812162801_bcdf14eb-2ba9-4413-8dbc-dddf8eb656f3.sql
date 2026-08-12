DROP POLICY IF EXISTS "Anyone can view audit log" ON public.school_data_audit;
DROP POLICY IF EXISTS "Audit log is viewable by everyone" ON public.school_data_audit;
DROP POLICY IF EXISTS "Public can view school data audit" ON public.school_data_audit;
DROP POLICY IF EXISTS "Admins can view school data audit" ON public.school_data_audit;

REVOKE ALL ON public.school_data_audit FROM anon;
GRANT SELECT ON public.school_data_audit TO authenticated;
GRANT ALL ON public.school_data_audit TO service_role;

ALTER TABLE public.school_data_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view school data audit"
ON public.school_data_audit
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));