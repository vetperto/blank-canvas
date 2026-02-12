
-- Drop and recreate the search function with proper mode support
CREATE OR REPLACE FUNCTION public.search_professionals_by_location(
  user_lat double precision, 
  user_lng double precision, 
  search_radius integer DEFAULT 10,
  search_mode text DEFAULT 'all'
)
RETURNS TABLE(profile_id uuid, distance_km double precision, covers_user_location boolean)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS profile_id,
    public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) AS distance_km,
    CASE 
      WHEN search_mode = 'local_fixo' THEN
        -- LOCAL FIXO: only user's search radius matters
        p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
        AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
      WHEN search_mode = 'domiciliar' THEN
        -- DOMICILIAR: only professional's home service radius matters
        p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
        AND p.home_service_radius IS NOT NULL AND p.home_service_radius > 0
        AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
      ELSE
        -- ALL: either within user's search radius OR within professional's home coverage
        CASE
          WHEN p.latitude IS NULL OR p.longitude IS NULL THEN TRUE
          WHEN p.home_service_radius IS NOT NULL AND p.home_service_radius > 0 THEN
            public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
            OR public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
          ELSE
            public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
        END
    END AS covers_user_location
  FROM public.profiles p
  WHERE p.user_type IN ('profissional', 'empresa')
    AND p.verification_status = 'verified'
    AND (
      CASE 
        WHEN search_mode = 'local_fixo' THEN
          p.latitude IS NOT NULL AND p.longitude IS NOT NULL
          AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
        WHEN search_mode = 'domiciliar' THEN
          p.latitude IS NOT NULL AND p.longitude IS NOT NULL
          AND p.home_service_radius IS NOT NULL AND p.home_service_radius > 0
          AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
        ELSE
          (p.latitude IS NULL AND p.longitude IS NULL)
          OR (p.home_service_radius IS NULL AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius)
          OR (p.home_service_radius IS NOT NULL AND (
            public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
            OR public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
          ))
      END
    )
  ORDER BY 
    CASE WHEN p.latitude IS NULL OR p.longitude IS NULL THEN 1 ELSE 0 END,
    public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude);
END;
$function$;

-- Create index for faster geo queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_geo ON public.profiles (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON public.profiles (verification_status, user_type) WHERE user_type IN ('profissional', 'empresa');
