-- Adicionar campos de geolocalização à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS home_service_radius INTEGER DEFAULT 10;

-- Criar índice para consultas geográficas mais eficientes
CREATE INDEX IF NOT EXISTS idx_profiles_location 
ON public.profiles (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Criar índice para raio de atendimento
CREATE INDEX IF NOT EXISTS idx_profiles_home_service_radius 
ON public.profiles (home_service_radius) 
WHERE home_service_radius IS NOT NULL;

-- Função para calcular distância entre duas coordenadas (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R CONSTANT DOUBLE PRECISION := 6371; -- Raio da Terra em km
  dlat DOUBLE PRECISION;
  dlon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Função para buscar profissionais dentro de um raio
CREATE OR REPLACE FUNCTION public.search_professionals_by_location(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  search_radius INTEGER DEFAULT 10
)
RETURNS TABLE (
  profile_id UUID,
  distance_km DOUBLE PRECISION,
  covers_user_location BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS profile_id,
    public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) AS distance_km,
    CASE 
      -- Se o profissional tem coordenadas e raio de atendimento, verificar se cobre a localização do usuário
      WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND p.home_service_radius IS NOT NULL THEN
        public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
      -- Se só tem coordenadas (clínica fixa), verificar se está dentro do raio de busca do usuário
      WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN
        public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
      -- Se não tem coordenadas, incluir mas sem distância
      ELSE TRUE
    END AS covers_user_location
  FROM public.profiles p
  WHERE p.user_type IN ('profissional', 'empresa')
    AND (
      -- Profissional sem coordenadas (ainda não configurou)
      (p.latitude IS NULL AND p.longitude IS NULL)
      OR
      -- Clínica/empresa fixa dentro do raio de busca
      (p.home_service_radius IS NULL AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius)
      OR
      -- Profissional móvel que cobre a área do usuário
      (p.home_service_radius IS NOT NULL AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius)
    )
  ORDER BY 
    CASE WHEN public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) IS NULL THEN 1 ELSE 0 END,
    public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.profiles.latitude IS 'Latitude do endereço do profissional/empresa';
COMMENT ON COLUMN public.profiles.longitude IS 'Longitude do endereço do profissional/empresa';
COMMENT ON COLUMN public.profiles.home_service_radius IS 'Raio de atendimento domiciliar em km (apenas para profissionais que fazem atendimento móvel)';
COMMENT ON FUNCTION public.calculate_distance IS 'Calcula a distância em km entre duas coordenadas usando a fórmula de Haversine';
COMMENT ON FUNCTION public.search_professionals_by_location IS 'Busca profissionais dentro de um raio especificado ou que atendem na área do usuário';