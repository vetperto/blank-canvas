-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  tutor_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  professional_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (char_length(comment) <= 500),
  is_approved BOOLEAN DEFAULT FALSE,
  is_moderated BOOLEAN DEFAULT FALSE,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES auth.users(id),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(appointment_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (is_approved = true OR tutor_profile_id = public.get_profile_id(auth.uid()) OR professional_profile_id = public.get_profile_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Tutors can create reviews for completed appointments"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    tutor_profile_id = public.get_profile_id(auth.uid())
    AND public.get_user_type(auth.uid()) = 'tutor'
  );

CREATE POLICY "Only admins can update reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get average rating for a professional
CREATE OR REPLACE FUNCTION public.get_professional_rating(_professional_profile_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_reviews INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*)::integer as total_reviews
  FROM public.reviews
  WHERE professional_profile_id = _professional_profile_id
  AND is_approved = true;
$$;

-- Function to check if tutor can review an appointment
CREATE OR REPLACE FUNCTION public.can_review_appointment(_appointment_id UUID, _tutor_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.appointments a
    WHERE a.id = _appointment_id
    AND a.tutor_profile_id = _tutor_profile_id
    AND a.status = 'completed'
    AND NOT EXISTS (
      SELECT 1 FROM public.reviews r WHERE r.appointment_id = _appointment_id
    )
  );
$$;

-- Add review_id reference to appointments
ALTER TABLE public.appointments 
ADD COLUMN review_id UUID REFERENCES public.reviews(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_reviews_professional ON public.reviews(professional_profile_id);
CREATE INDEX idx_reviews_tutor ON public.reviews(tutor_profile_id);
CREATE INDEX idx_reviews_approved ON public.reviews(is_approved);
CREATE INDEX idx_reviews_created ON public.reviews(created_at DESC);

-- Auto-approve reviews after 48 hours if not moderated
-- (This would typically be done via a cron job, but we'll create the function)
CREATE OR REPLACE FUNCTION public.auto_approve_reviews()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _approved_count INTEGER;
BEGIN
  UPDATE public.reviews
  SET 
    is_approved = true,
    is_moderated = true,
    moderated_at = NOW(),
    moderation_notes = 'Auto-aprovado após 48 horas'
  WHERE is_moderated = false
  AND created_at < NOW() - INTERVAL '48 hours';
  
  GET DIAGNOSTICS _approved_count = ROW_COUNT;
  RETURN _approved_count;
END;
$$;