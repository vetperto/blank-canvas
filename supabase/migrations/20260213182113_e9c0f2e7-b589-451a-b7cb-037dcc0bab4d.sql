
-- Drop existing function if any
DROP FUNCTION IF EXISTS public.search_professionals_by_radius(double precision, double precision, double precision);
DROP FUNCTION IF EXISTS public.search_professionals_by_radius(double precision, double precision, integer);

-- Create the definitive PostGIS-based RPC
CREATE OR REPLACE FUNCTION public.search_professionals_by_radius(
  user_lat double precision,
  user_lng double precision,
  search_radius_km integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  full_name text,
  social_name text,
  bio text,
  city text,
  state text,
  neighborhood text,
  profile_picture_url text,
  average_rating numeric,
  total_reviews integer,
  distance_meters double precision,
  crmv text,
  is_verified boolean,
  payment_methods text[],
  home_service_radius integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_point AS (
    SELECT ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography AS geog
  )
  SELECT
    p.id,
    p.full_name,
    p.social_name,
    p.bio,
    p.city,
    p.state,
    p.neighborhood,
    p.profile_picture_url,
    p.average_rating,
    p.total_reviews,
    ST_Distance(p.location::geography, up.geog) AS distance_meters,
    p.crmv,
    p.is_verified,
    p.payment_methods,
    pr.home_service_radius
  FROM public_search_professionals p
  CROSS JOIN user_point up
  JOIN profiles pr ON pr.id = p.id
  WHERE
    p.location IS NOT NULL
    AND ST_DWithin(
      p.location::geography,
      up.geog,
      LEAST(
        search_radius_km,
        COALESCE(pr.home_service_radius, search_radius_km)
      ) * 1000
    )
  ORDER BY distance_meters ASC;
$$;
