-- Drop old permissive policies
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete own roles" ON public.user_roles;

-- Restrict INSERT: only student or parent, and linked_student_id must be NULL on self-insert
CREATE POLICY "Users can insert own non-admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('student'::app_role, 'parent'::app_role)
  AND linked_student_id IS NULL
);

-- Restrict UPDATE: cannot escalate to admin, and cannot self-assign linked_student_id
-- (linked_student_id can only be set through the secure link_parent_to_student function below)
CREATE POLICY "Users can update own non-admin role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND role <> 'admin'::app_role)
WITH CHECK (
  auth.uid() = user_id
  AND role IN ('student'::app_role, 'parent'::app_role)
  AND linked_student_id IS NULL
);

-- Allow users to delete their own non-admin roles
CREATE POLICY "Users can delete own non-admin roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND role <> 'admin'::app_role);

-- Secure function to link a parent to a student by email.
-- Verifies the caller has the parent role before updating linked_student_id.
CREATE OR REPLACE FUNCTION public.link_parent_to_student(_student_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _student_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.has_role(auth.uid(), 'parent'::app_role) THEN
    RAISE EXCEPTION 'Only parent accounts can link to a student';
  END IF;

  SELECT user_id INTO _student_id
  FROM public.profiles
  WHERE email = _student_email
  LIMIT 1;

  IF _student_id IS NULL THEN
    RAISE EXCEPTION 'Student not found with that email';
  END IF;

  IF _student_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot link to your own account';
  END IF;

  UPDATE public.user_roles
  SET linked_student_id = _student_id
  WHERE user_id = auth.uid()
    AND role = 'parent'::app_role;

  RETURN _student_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_parent_to_student(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_parent_to_student(text) TO authenticated;