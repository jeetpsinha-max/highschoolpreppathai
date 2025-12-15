-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'admin');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'student',
    linked_student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create application_checklists table
CREATE TABLE public.application_checklists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
    school_name TEXT NOT NULL,
    task_name TEXT NOT NULL,
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on application_checklists
ALTER TABLE public.application_checklists ENABLE ROW LEVEL SECURITY;

-- RLS policies for application_checklists
CREATE POLICY "Users can view own checklists"
ON public.application_checklists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own checklists"
ON public.application_checklists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checklists"
ON public.application_checklists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checklists"
ON public.application_checklists FOR DELETE
USING (auth.uid() = user_id);

-- Parents can view their linked student's checklists
CREATE POLICY "Parents can view linked student checklists"
ON public.application_checklists FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'parent'
      AND user_roles.linked_student_id = application_checklists.user_id
  )
);

-- Parents can view linked student's essays
CREATE POLICY "Parents can view linked student essays"
ON public.essays FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'parent'
      AND user_roles.linked_student_id = essays.user_id
  )
);

-- Parents can view linked student's saved schools
CREATE POLICY "Parents can view linked student saved schools"
ON public.saved_schools FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'parent'
      AND user_roles.linked_student_id = saved_schools.user_id
  )
);

-- Parents can view linked student's matcher results
CREATE POLICY "Parents can view linked student matcher results"
ON public.matcher_results FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'parent'
      AND user_roles.linked_student_id = matcher_results.user_id
  )
);

-- Parents can view linked student's interview sessions
CREATE POLICY "Parents can view linked student interview sessions"
ON public.interview_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'parent'
      AND user_roles.linked_student_id = interview_sessions.user_id
  )
);

-- Parents can view linked student's SSAT practice
CREATE POLICY "Parents can view linked student ssat practice"
ON public.ssat_practice FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'parent'
      AND user_roles.linked_student_id = ssat_practice.user_id
  )
);

-- Trigger for updated_at on application_checklists
CREATE TRIGGER update_application_checklists_updated_at
BEFORE UPDATE ON public.application_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();