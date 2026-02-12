-- Drop existing SELECT policies and recreate them to include anon role

-- Profiles: Allow public read access
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;
CREATE POLICY "Anyone can view public profiles" 
ON public.profiles 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Services: Allow public read access for active services  
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services" 
ON public.services 
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Reviews: Allow public read access for approved reviews
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews" 
ON public.reviews 
FOR SELECT 
TO anon, authenticated
USING (
  (is_approved = true) OR 
  (tutor_profile_id = get_profile_id(auth.uid())) OR 
  (professional_profile_id = get_profile_id(auth.uid())) OR 
  is_admin(auth.uid())
);

-- Subscriptions: Allow public read for basic subscription info (needed for plan badges)
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;

-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
TO authenticated
USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

-- Public can view subscription info for displaying plan badges
CREATE POLICY "Anyone can view subscription status" 
ON public.user_subscriptions 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Subscriptions table (plan definitions) - Allow public read
DROP POLICY IF EXISTS "Anyone can view subscriptions" ON public.subscriptions;
CREATE POLICY "Anyone can view subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO anon, authenticated
USING (true);