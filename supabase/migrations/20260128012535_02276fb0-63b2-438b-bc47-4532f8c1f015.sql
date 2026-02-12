-- FIX 1: profiles table - Remove overly permissive policy for viewing all professional profiles
-- The profiles_public view already exists for public discovery, so we should use that instead

-- Drop the overly permissive policy that allows any authenticated user to see all professional profiles
DROP POLICY IF EXISTS "Authenticated users can view professional profiles" ON public.profiles;

-- FIX 2: services table - Require authentication for viewing services
-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;

-- Create new policy that requires authentication to view active services
CREATE POLICY "Authenticated users can view active services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Also allow anon users to view services only when they have a valid context
-- (e.g., viewing a professional's public profile page)
-- For now, services should require authentication for full protection
-- Professionals can still manage their own services via the existing ALL policy