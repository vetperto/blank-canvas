
-- Allow public access to verified professionals and empresas through profiles_public view
-- This policy enables the search functionality while maintaining security

CREATE POLICY "Public can view verified professionals"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (
  -- Allow viewing verified professionals and empresas
  (user_type IN ('profissional', 'empresa') AND verification_status = 'verified')
  OR
  -- Users can always view their own profile
  (auth.uid() = user_id)
);

-- Drop the old restrictive policy (it conflicts with the new one)
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;

-- Add comment explaining the policy
COMMENT ON POLICY "Public can view verified professionals" ON public.profiles IS 
  'Allows public access to verified professional/empresa profiles and own profile access';
