-- Function to count monthly appointments for a professional
CREATE OR REPLACE FUNCTION public.count_monthly_appointments(_professional_profile_id uuid, _month date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.appointments
  WHERE professional_profile_id = _professional_profile_id
  AND appointment_date >= date_trunc('month', _month)::date
  AND appointment_date < (date_trunc('month', _month) + interval '1 month')::date
  AND status IN ('pending', 'confirmed', 'completed');
$$;

-- Function to get professional's current subscription plan limits
CREATE OR REPLACE FUNCTION public.get_professional_plan_limits(_profile_id uuid)
RETURNS TABLE(
  monthly_appointments_limit integer,
  has_verified_badge boolean,
  has_price_table boolean,
  has_portfolio boolean,
  portfolio_limit integer,
  plan_name text,
  is_subscribed boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(s.monthly_appointments_limit, 0) as monthly_appointments_limit,
    COALESCE(s.has_verified_badge, false) as has_verified_badge,
    COALESCE(s.has_price_table, false) as has_price_table,
    COALESCE(s.has_portfolio, false) as has_portfolio,
    COALESCE(s.portfolio_limit, 0) as portfolio_limit,
    COALESCE(s.name, 'Sem Plano') as plan_name,
    (us.id IS NOT NULL AND us.status = 'active') as is_subscribed
  FROM public.profiles p
  LEFT JOIN public.user_subscriptions us ON us.profile_id = p.id AND us.status = 'active'
  LEFT JOIN public.subscriptions s ON s.id = us.subscription_id
  WHERE p.id = _profile_id;
$$;

-- Function to check if professional can accept more appointments this month
CREATE OR REPLACE FUNCTION public.can_accept_appointment(_professional_profile_id uuid)
RETURNS TABLE(
  can_accept boolean,
  current_count integer,
  monthly_limit integer,
  remaining integer,
  plan_name text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _current_count integer;
  _monthly_limit integer;
  _plan_name text;
  _is_subscribed boolean;
BEGIN
  -- Get current month's appointment count
  _current_count := public.count_monthly_appointments(_professional_profile_id);
  
  -- Get plan limits
  SELECT 
    pl.monthly_appointments_limit,
    pl.plan_name,
    pl.is_subscribed
  INTO _monthly_limit, _plan_name, _is_subscribed
  FROM public.get_professional_plan_limits(_professional_profile_id) pl;
  
  -- If no subscription, allow 0 appointments
  IF NOT COALESCE(_is_subscribed, false) THEN
    can_accept := false;
    current_count := _current_count;
    monthly_limit := 0;
    remaining := 0;
    plan_name := 'Sem Plano Ativo';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- NULL limit means unlimited
  IF _monthly_limit IS NULL THEN
    can_accept := true;
    current_count := _current_count;
    monthly_limit := NULL;
    remaining := NULL;
    plan_name := _plan_name;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Check if under limit
  can_accept := _current_count < _monthly_limit;
  current_count := _current_count;
  monthly_limit := _monthly_limit;
  remaining := GREATEST(0, _monthly_limit - _current_count);
  plan_name := _plan_name;
  RETURN NEXT;
  RETURN;
END;
$$;

-- Trigger function to validate appointment creation based on plan limits
CREATE OR REPLACE FUNCTION public.validate_appointment_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _can_accept boolean;
  _plan_name text;
BEGIN
  -- Only check on INSERT
  IF TG_OP = 'INSERT' THEN
    SELECT ca.can_accept, ca.plan_name
    INTO _can_accept, _plan_name
    FROM public.can_accept_appointment(NEW.professional_profile_id) ca;
    
    IF NOT COALESCE(_can_accept, false) THEN
      RAISE EXCEPTION 'Limite de agendamentos mensais atingido para o plano: %', _plan_name;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on appointments table
DROP TRIGGER IF EXISTS check_appointment_limit ON public.appointments;
CREATE TRIGGER check_appointment_limit
  BEFORE INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_appointment_limit();