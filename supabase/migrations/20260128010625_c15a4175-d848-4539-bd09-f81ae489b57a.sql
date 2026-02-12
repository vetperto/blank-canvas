-- FIX: appointment_confirmations table - Block direct client access
-- Confirmations should only be managed by edge functions using service role key

-- Block all direct INSERTs from authenticated/anon users
-- Edge functions with service role bypass RLS
CREATE POLICY "Block direct client inserts"
  ON public.appointment_confirmations
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

-- Block all direct UPDATEs from authenticated/anon users
CREATE POLICY "Block direct client updates"
  ON public.appointment_confirmations
  FOR UPDATE
  TO authenticated, anon
  USING (false);

-- Block all direct DELETEs from authenticated/anon users
CREATE POLICY "Block direct client deletes"
  ON public.appointment_confirmations
  FOR DELETE
  TO authenticated, anon
  USING (false);