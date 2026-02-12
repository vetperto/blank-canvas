-- Create favorites table for tutors to save their favorite professionals
CREATE TABLE public.favorite_professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tutor_profile_id, professional_profile_id)
);

-- Enable RLS
ALTER TABLE public.favorite_professionals ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorite_professionals
FOR SELECT
TO authenticated
USING (tutor_profile_id = get_profile_id(auth.uid()));

-- Users can add favorites
CREATE POLICY "Users can add favorites"
ON public.favorite_professionals
FOR INSERT
TO authenticated
WITH CHECK (tutor_profile_id = get_profile_id(auth.uid()));

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
ON public.favorite_professionals
FOR DELETE
TO authenticated
USING (tutor_profile_id = get_profile_id(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_favorite_professionals_tutor ON public.favorite_professionals(tutor_profile_id);
CREATE INDEX idx_favorite_professionals_professional ON public.favorite_professionals(professional_profile_id);