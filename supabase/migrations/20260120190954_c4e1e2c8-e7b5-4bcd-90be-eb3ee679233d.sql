-- Create education/formation table for professionals
CREATE TABLE public.professional_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_education ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own education" 
ON public.professional_education 
FOR SELECT 
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own education" 
ON public.professional_education 
FOR INSERT 
WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own education" 
ON public.professional_education 
FOR UPDATE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own education" 
ON public.professional_education 
FOR DELETE 
USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Public can view education for listing
CREATE POLICY "Public can view education" 
ON public.professional_education 
FOR SELECT 
USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_professional_education_updated_at
BEFORE UPDATE ON public.professional_education
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();