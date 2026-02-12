-- Sync is_verified field with verification_status
UPDATE public.profiles 
SET is_verified = (verification_status = 'verified')
WHERE user_type IN ('profissional', 'empresa');

-- Create trigger to keep is_verified in sync with verification_status
CREATE OR REPLACE FUNCTION public.sync_is_verified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_verified := (NEW.verification_status = 'verified');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS sync_is_verified_trigger ON public.profiles;

CREATE TRIGGER sync_is_verified_trigger
BEFORE INSERT OR UPDATE OF verification_status ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_is_verified();