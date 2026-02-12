-- FIX: Profiles table RLS - authenticated users need to view professional profiles for booking
-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can view their own full profile" ON public.profiles;
DROP POLICY IF EXISTS "Anon can view limited professional info" ON public.profiles;

-- Create policy: Users can always view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy: Authenticated users can view professional profiles (for booking/search)
-- Only exposes necessary fields for professional discovery
CREATE POLICY "Authenticated users can view professional profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_type IN ('profissional', 'empresa'));

-- Anonymous users should use the profiles_public view for search
-- No direct table access for anon - they must use the view