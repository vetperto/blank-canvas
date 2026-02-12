-- Drop existing view and recreate with payment_methods field
-- payment_methods is not sensitive data and should be publicly visible

DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
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
  is_verified,
  verification_status,
  crmv,
  latitude,
  longitude,
  home_service_radius,
  years_experience,
  payment_methods,
  created_at
FROM public.profiles
WHERE user_type IN ('profissional', 'empresa');