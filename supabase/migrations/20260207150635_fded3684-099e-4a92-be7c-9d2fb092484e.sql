-- Create professional_credits table
CREATE TABLE public.professional_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 0,
  used_credits INTEGER NOT NULL DEFAULT 0,
  remaining_credits INTEGER GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'low_credits', 'exhausted')),
  last_credit_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lost_appointments table
CREATE TABLE public.lost_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  attempted_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL DEFAULT 'no_credits',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professional_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professional_credits
CREATE POLICY "Professionals can view their own credits"
ON public.professional_credits FOR SELECT
USING (professional_profile_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Only system/admin can update credits"
ON public.professional_credits FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Only system/admin can insert credits"
ON public.professional_credits FOR INSERT
WITH CHECK (is_admin(auth.uid()) OR professional_profile_id = get_profile_id(auth.uid()));

-- RLS Policies for lost_appointments
CREATE POLICY "Professionals can view their lost appointments"
ON public.lost_appointments FOR SELECT
USING (professional_profile_id = get_profile_id(auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "System can insert lost appointments"
ON public.lost_appointments FOR INSERT
WITH CHECK (true);

-- Function to check if professional has available credits
CREATE OR REPLACE FUNCTION public.check_professional_credits(p_professional_profile_id UUID)
RETURNS TABLE (
  has_credits BOOLEAN,
  remaining INTEGER,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(pc.remaining_credits > 0, false) AS has_credits,
    COALESCE(pc.remaining_credits, 0) AS remaining,
    COALESCE(pc.status, 'exhausted') AS status
  FROM professional_credits pc
  WHERE pc.professional_profile_id = p_professional_profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'exhausted'::TEXT;
  END IF;
END;
$$;

-- Function to consume a credit when appointment is confirmed
CREATE OR REPLACE FUNCTION public.consume_professional_credit(p_professional_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_remaining INTEGER;
BEGIN
  -- Get current remaining credits with lock
  SELECT remaining_credits INTO v_remaining
  FROM professional_credits
  WHERE professional_profile_id = p_professional_profile_id
  FOR UPDATE;
  
  -- Check if credits available
  IF v_remaining IS NULL OR v_remaining <= 0 THEN
    RETURN false;
  END IF;
  
  -- Consume the credit
  UPDATE professional_credits
  SET 
    used_credits = used_credits + 1,
    last_credit_update = now(),
    updated_at = now()
  WHERE professional_profile_id = p_professional_profile_id;
  
  RETURN true;
END;
$$;

-- Function to update credit status based on remaining credits
CREATE OR REPLACE FUNCTION public.update_credit_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Calculate remaining credits (since it's a generated column, we calculate it)
  IF (NEW.total_credits - NEW.used_credits) <= 0 THEN
    NEW.status := 'exhausted';
  ELSIF (NEW.total_credits - NEW.used_credits) <= 5 THEN
    NEW.status := 'low_credits';
  ELSE
    NEW.status := 'active';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Trigger to auto-update status
CREATE TRIGGER update_professional_credits_status
BEFORE UPDATE ON public.professional_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_credit_status();

-- Function to add credits to a professional
CREATE OR REPLACE FUNCTION public.add_professional_credits(
  p_professional_profile_id UUID,
  p_credits_to_add INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO professional_credits (professional_profile_id, total_credits)
  VALUES (p_professional_profile_id, p_credits_to_add)
  ON CONFLICT (professional_profile_id)
  DO UPDATE SET 
    total_credits = professional_credits.total_credits + p_credits_to_add,
    last_credit_update = now();
  
  RETURN true;
END;
$$;

-- Function to record a lost appointment
CREATE OR REPLACE FUNCTION public.record_lost_appointment(
  p_professional_profile_id UUID,
  p_tutor_profile_id UUID,
  p_service_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO lost_appointments (
    professional_profile_id,
    tutor_profile_id,
    service_id,
    reason
  )
  VALUES (
    p_professional_profile_id,
    p_tutor_profile_id,
    p_service_id,
    'no_credits'
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Function to get credit stats for dashboard
CREATE OR REPLACE FUNCTION public.get_professional_credit_stats(p_professional_profile_id UUID)
RETURNS TABLE (
  total_credits INTEGER,
  used_credits INTEGER,
  remaining_credits INTEGER,
  status TEXT,
  confirmed_appointments BIGINT,
  lost_clients BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(pc.total_credits, 0),
    COALESCE(pc.used_credits, 0),
    COALESCE(pc.remaining_credits, 0),
    COALESCE(pc.status, 'exhausted'),
    (SELECT COUNT(*) FROM appointments a 
     WHERE a.professional_profile_id = p_professional_profile_id 
     AND a.status IN ('confirmed', 'completed')),
    (SELECT COUNT(*) FROM lost_appointments la 
     WHERE la.professional_profile_id = p_professional_profile_id)
  FROM professional_credits pc
  WHERE pc.professional_profile_id = p_professional_profile_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 0, 'exhausted'::TEXT, 0::BIGINT, 0::BIGINT;
  END IF;
END;
$$;

-- Create index for performance
CREATE INDEX idx_lost_appointments_professional ON public.lost_appointments(professional_profile_id);
CREATE INDEX idx_lost_appointments_date ON public.lost_appointments(attempted_date);
CREATE INDEX idx_professional_credits_status ON public.professional_credits(status);