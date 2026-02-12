-- =====================================================
-- SECURITY FIX: Restrict sensitive data exposure
-- =====================================================

-- 1. FIX: profiles table - Create a public view with only safe fields
--    Keep sensitive PII (CPF, full address, phone) private to owner only
--    But allow public viewing of professional business info (name, bio, city, ratings)

-- Drop existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;

-- Create restricted SELECT policy: users see their own full profile
CREATE POLICY "Users can view their own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for viewing limited public professional info (for search/discovery)
-- This uses a view instead - we'll create a public_profiles view
CREATE POLICY "Anon can view limited professional info"
ON public.profiles
FOR SELECT
TO anon
USING (
  user_type IN ('profissional', 'empresa') AND
  -- Only allow reading non-sensitive fields via the table
  -- The application should use the public view for anonymous access
  FALSE -- Block direct table access for anon users
);

-- Create a secure view for public professional profiles (search/discovery)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  p.id,
  p.user_id,
  p.full_name,
  p.social_name,
  p.bio,
  p.profile_picture_url,
  p.user_type,
  p.city,
  p.state,
  p.neighborhood,
  p.is_verified,
  p.years_experience,
  p.latitude,
  p.longitude,
  p.home_service_radius,
  p.created_at,
  p.crmv -- Professional license can be public for verification
FROM public.profiles p
WHERE p.user_type IN ('profissional', 'empresa');

-- Grant access to the public view
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- 2. FIX: legal_agreements - Add INSERT policy restricting to own records
-- The INSERT policy should ensure users can only create agreements for themselves
CREATE POLICY "Users can only insert their own agreements"
ON public.legal_agreements
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. FIX: user_subscriptions - Remove the overly permissive "Anyone can view" policy
DROP POLICY IF EXISTS "Anyone can view subscription status" ON public.user_subscriptions;

-- The "Users can view their own subscriptions" policy already exists and is sufficient
-- Professionals need to verify their own subscription status via check-subscription edge function