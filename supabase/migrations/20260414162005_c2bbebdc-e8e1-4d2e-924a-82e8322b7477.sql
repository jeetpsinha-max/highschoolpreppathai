
-- Add image_url column to schools
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS image_url text;

-- Create user_preferences table for personalization
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  grade_level text,
  interests text[] DEFAULT '{}',
  target_states text[] DEFAULT '{}',
  priorities text[] DEFAULT '{}',
  boarding_preference text DEFAULT 'no_preference',
  budget_range text,
  extracurriculars text[] DEFAULT '{}',
  academic_strengths text[] DEFAULT '{}',
  test_prep_status text,
  application_year text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
