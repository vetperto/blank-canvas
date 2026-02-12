-- Fix the permissive RLS policy for lost_appointments
-- Only allow insert via the SECURITY DEFINER function, not direct inserts

DROP POLICY IF EXISTS "System can insert lost appointments" ON public.lost_appointments;

-- Create a more restrictive policy that only allows inserts for authenticated users
-- where the tutor_profile_id matches their own profile
CREATE POLICY "Tutors can record their own lost appointments"
ON public.lost_appointments FOR INSERT
WITH CHECK (tutor_profile_id = get_profile_id(auth.uid()));