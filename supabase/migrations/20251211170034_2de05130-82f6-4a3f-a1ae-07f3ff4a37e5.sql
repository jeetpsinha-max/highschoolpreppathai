-- Create schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  city TEXT,
  state TEXT,
  website TEXT,
  admission_type TEXT,
  boarding BOOLEAN DEFAULT false,
  competitiveness TEXT,
  size TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Public read policy for schools (everyone can view)
CREATE POLICY "Anyone can view schools" 
ON public.schools 
FOR SELECT 
USING (true);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'parent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create saved_schools table
CREATE TABLE public.saved_schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  category TEXT DEFAULT 'saved' CHECK (category IN ('saved', 'reach', 'target', 'safety')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, school_id)
);

-- Enable RLS on saved_schools
ALTER TABLE public.saved_schools ENABLE ROW LEVEL SECURITY;

-- Users can view their saved schools
CREATE POLICY "Users can view own saved schools" 
ON public.saved_schools 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert saved schools
CREATE POLICY "Users can save schools" 
ON public.saved_schools 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can delete their saved schools
CREATE POLICY "Users can delete saved schools" 
ON public.saved_schools 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create matcher_results table
CREATE TABLE public.matcher_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_data JSONB NOT NULL,
  reach_schools JSONB,
  target_schools JSONB,
  safety_schools JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on matcher_results
ALTER TABLE public.matcher_results ENABLE ROW LEVEL SECURITY;

-- Users can view their matcher results
CREATE POLICY "Users can view own matcher results" 
ON public.matcher_results 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert matcher results
CREATE POLICY "Users can create matcher results" 
ON public.matcher_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create interview_sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  questions JSONB NOT NULL,
  responses JSONB,
  feedback JSONB,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on interview_sessions
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their interview sessions
CREATE POLICY "Users can view own interview sessions" 
ON public.interview_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create interview sessions
CREATE POLICY "Users can create interview sessions" 
ON public.interview_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their interview sessions
CREATE POLICY "Users can update interview sessions" 
ON public.interview_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create essays table
CREATE TABLE public.essays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  prompt TEXT,
  ai_feedback JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on essays
ALTER TABLE public.essays ENABLE ROW LEVEL SECURITY;

-- Users can view their essays
CREATE POLICY "Users can view own essays" 
ON public.essays 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create essays
CREATE POLICY "Users can create essays" 
ON public.essays 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their essays
CREATE POLICY "Users can update essays" 
ON public.essays 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their essays
CREATE POLICY "Users can delete essays" 
ON public.essays 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create ssat_practice table
CREATE TABLE public.ssat_practice (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('verbal', 'quantitative', 'reading')),
  questions JSONB NOT NULL,
  answers JSONB,
  score INTEGER,
  time_spent INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ssat_practice
ALTER TABLE public.ssat_practice ENABLE ROW LEVEL SECURITY;

-- Users can view their ssat practice
CREATE POLICY "Users can view own ssat practice" 
ON public.ssat_practice 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create ssat practice
CREATE POLICY "Users can create ssat practice" 
ON public.ssat_practice 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their ssat practice
CREATE POLICY "Users can update ssat practice" 
ON public.ssat_practice 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_essays_updated_at
  BEFORE UPDATE ON public.essays
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();