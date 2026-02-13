DROP VIEW IF EXISTS public.public_search_professionals;

CREATE VIEW public.public_search_professionals AS
SELECT
  p.id,
  p.full_name,
  p.social_name,
  p.bio,
  p.profile_picture_url,
  p.city,
  p.state,
  p.neighborhood,
  p.is_verified,
  p.user_type,
  p.years_experience,
  p.average_rating,
  p.total_reviews,
  p.payment_methods,
  p.home_service_radius,
  p.is_featured,
  p.verification_status,
  p.location,
  pr.crmv,
  pr.specialties
FROM profiles p
LEFT JOIN professionals pr ON pr.id = p.id
WHERE
  p.user_type IN ('profissional', 'empresa')
  AND p.account_status = 'active'
  AND p.verification_status = 'verified';