-- Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('not_verified', 'under_review', 'verified', 'rejected');

-- Add verification fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_status public.verification_status DEFAULT 'not_verified',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Migrate existing is_verified data to new verification_status
UPDATE public.profiles 
SET verification_status = CASE 
  WHEN is_verified = true THEN 'verified'::verification_status
  ELSE 'not_verified'::verification_status
END;

-- Create verification_logs table for audit trail
CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'status_change', 'document_verified', 'document_rejected', 'reset'
  old_status public.verification_status,
  new_status public.verification_status,
  notes TEXT,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on verification_logs
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage verification logs
CREATE POLICY "Only admins can view verification logs"
ON public.verification_logs
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can insert verification logs"
ON public.verification_logs
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Update the profiles_public view to only show verified professionals
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  user_type,
  full_name,
  social_name,
  bio,
  profile_picture_url,
  city,
  state,
  neighborhood,
  crmv,
  latitude,
  longitude,
  home_service_radius,
  years_experience,
  is_verified,
  verification_status,
  created_at
FROM public.profiles
WHERE 
  -- Show all tutors
  (user_type = 'tutor')
  OR 
  -- Only show verified professionals and companies
  (user_type IN ('profissional', 'empresa') AND verification_status = 'verified');

-- Create function to change verification status with logging
CREATE OR REPLACE FUNCTION public.change_verification_status(
  _profile_id UUID,
  _new_status verification_status,
  _notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _old_status verification_status;
  _admin_id UUID;
BEGIN
  -- Get admin user id
  _admin_id := auth.uid();
  
  -- Check if user is admin
  IF NOT is_admin(_admin_id) THEN
    RAISE EXCEPTION 'Only administrators can change verification status';
  END IF;
  
  -- Get current status
  SELECT verification_status INTO _old_status
  FROM public.profiles
  WHERE id = _profile_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  
  -- Update profile status
  UPDATE public.profiles
  SET 
    verification_status = _new_status,
    is_verified = (_new_status = 'verified'),
    verified_at = CASE WHEN _new_status = 'verified' THEN now() ELSE NULL END,
    verified_by = CASE WHEN _new_status = 'verified' THEN _admin_id ELSE NULL END,
    verification_notes = _notes,
    updated_at = now()
  WHERE id = _profile_id;
  
  -- Log the action
  INSERT INTO public.verification_logs (
    profile_id,
    action,
    old_status,
    new_status,
    notes,
    performed_by
  ) VALUES (
    _profile_id,
    CASE 
      WHEN _new_status IN ('not_verified', 'under_review') AND _old_status = 'verified' THEN 'reset'
      ELSE 'status_change'
    END,
    _old_status,
    _new_status,
    _notes,
    _admin_id
  );
  
  RETURN TRUE;
END;
$$;

-- Create function to get verification statistics
CREATE OR REPLACE FUNCTION public.get_verification_stats()
RETURNS TABLE (
  total_professionals INTEGER,
  not_verified INTEGER,
  under_review INTEGER,
  verified INTEGER,
  rejected INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COUNT(*)::INTEGER as total_professionals,
    COUNT(*) FILTER (WHERE verification_status = 'not_verified')::INTEGER as not_verified,
    COUNT(*) FILTER (WHERE verification_status = 'under_review')::INTEGER as under_review,
    COUNT(*) FILTER (WHERE verification_status = 'verified')::INTEGER as verified,
    COUNT(*) FILTER (WHERE verification_status = 'rejected')::INTEGER as rejected
  FROM public.profiles
  WHERE user_type IN ('profissional', 'empresa');
$$;

-- Create function to check if profile can be verified (has required documents)
CREATE OR REPLACE FUNCTION public.can_verify_profile(_profile_id UUID)
RETURNS TABLE (
  can_verify BOOLEAN,
  missing_documents TEXT[],
  has_crmv_document BOOLEAN,
  has_id_document BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _has_crmv BOOLEAN;
  _has_id BOOLEAN;
  _missing TEXT[] := '{}';
BEGIN
  -- Check for CRMV document
  SELECT EXISTS (
    SELECT 1 FROM public.documents 
    WHERE profile_id = _profile_id 
    AND document_type = 'crmv'
    AND is_verified = true
  ) INTO _has_crmv;
  
  -- Check for ID document (RG or CNH)
  SELECT EXISTS (
    SELECT 1 FROM public.documents 
    WHERE profile_id = _profile_id 
    AND document_type IN ('rg', 'cnh')
    AND is_verified = true
  ) INTO _has_id;
  
  -- Build missing documents array
  IF NOT _has_crmv THEN
    _missing := array_append(_missing, 'CRMV');
  END IF;
  
  IF NOT _has_id THEN
    _missing := array_append(_missing, 'RG ou CNH');
  END IF;
  
  can_verify := _has_crmv AND _has_id;
  missing_documents := _missing;
  has_crmv_document := _has_crmv;
  has_id_document := _has_id;
  RETURN NEXT;
END;
$$;

-- Create index for faster verification status queries
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status 
ON public.profiles(verification_status) 
WHERE user_type IN ('profissional', 'empresa');