-- Add payment_methods column to profiles table
-- Using text array for flexibility and easy filtering
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_methods text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.payment_methods IS 'Array of accepted payment methods: credit_card, debit_card, pix, cash';

-- Create index for future filtering capabilities
CREATE INDEX IF NOT EXISTS idx_profiles_payment_methods ON public.profiles USING GIN (payment_methods);