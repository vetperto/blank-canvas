-- Create admin action logs table for auditing
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'profile', 'review', 'document', 'subscription', 'setting'
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Only admins can view admin logs"
ON public.admin_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- Only admins can insert logs
CREATE POLICY "Only admins can create admin logs"
ON public.admin_logs
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Create index for fast querying
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_entity ON public.admin_logs(entity_type, entity_id);
CREATE INDEX idx_admin_logs_admin ON public.admin_logs(admin_user_id);

-- Add account_status to profiles for blocking/suspending users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'blocked', 'suspended', 'pending'));

-- Add featured flag for highlighting professionals in search
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create moderator role if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'moderator'
  ) THEN
    ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'moderator';
  END IF;
END $$;