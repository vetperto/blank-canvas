-- Fix the security definer view warning by using security_invoker
-- Drop and recreate the view with proper security settings
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS
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

-- Grant access to the view for anon and authenticated users
GRANT SELECT ON public.profiles_public TO anon, authenticated;