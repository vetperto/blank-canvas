-- =============================================================
-- VetPerto - Schema Completo para Migração
-- Gerado em: 2026-02-12
-- Compatível com: Supabase / PostgreSQL 15+
-- =============================================================

-- =====================
-- 1. TIPOS (ENUMS)
-- =====================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE public.day_of_week AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
CREATE TYPE public.document_type AS ENUM ('rg', 'cnh', 'crmv', 'cnpj_card');
CREATE TYPE public.pet_species AS ENUM ('cao', 'gato', 'pequeno_porte', 'grande_porte', 'producao', 'silvestre_exotico');
CREATE TYPE public.service_location_type AS ENUM ('clinic', 'home_visit', 'both');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');
CREATE TYPE public.user_type AS ENUM ('tutor', 'profissional', 'empresa');
CREATE TYPE public.verification_status AS ENUM ('not_verified', 'under_review', 'verified', 'rejected');


-- =====================
-- 2. TABELAS
-- =====================

-- profiles (tabela central)
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type public.user_type NOT NULL,
  full_name text NOT NULL,
  social_name text,
  email text NOT NULL,
  phone text,
  cpf text,
  cnpj text,
  crmv text,
  bio text,
  profile_picture_url text,
  cep text,
  street text,
  number text,
  complement text,
  neighborhood text,
  city text,
  state text,
  latitude double precision,
  longitude double precision,
  home_service_radius integer DEFAULT 10,
  years_experience integer,
  payment_methods text[] DEFAULT '{}'::text[],
  is_verified boolean DEFAULT false,
  verification_status public.verification_status DEFAULT 'not_verified'::verification_status,
  verification_notes text,
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users(id),
  is_featured boolean DEFAULT false,
  account_status text DEFAULT 'active'::text,
  lgpd_accepted boolean NOT NULL DEFAULT false,
  lgpd_accepted_at timestamp with time zone,
  terms_accepted boolean NOT NULL DEFAULT false,
  terms_accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_account_status_check CHECK (account_status = ANY (ARRAY['active'::text, 'blocked'::text, 'suspended'::text, 'pending'::text])),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT unique_user_profile_type UNIQUE (user_id, user_type)
);

-- user_roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- documents
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type public.document_type NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  is_verified boolean DEFAULT false,
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- pets
CREATE TABLE public.pets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  species public.pet_species NOT NULL,
  breed text,
  birth_date date,
  gender text,
  photo_url text,
  health_history text,
  preferences text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- subscriptions
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  price numeric NOT NULL,
  target_user_type public.user_type NOT NULL,
  monthly_appointments_limit integer,
  has_verified_badge boolean DEFAULT false,
  has_price_table boolean DEFAULT false,
  has_portfolio boolean DEFAULT false,
  portfolio_limit integer DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_slug_key UNIQUE (slug)
);

-- user_subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id),
  status public.subscription_status NOT NULL DEFAULT 'pending'::subscription_status,
  start_date date NOT NULL,
  end_date date NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- legal_agreements
CREATE TABLE public.legal_agreements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_type text NOT NULL,
  accepted_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- services
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 30,
  price numeric,
  location_type public.service_location_type NOT NULL DEFAULT 'clinic'::service_location_type,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- availability
CREATE TABLE public.availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week public.day_of_week NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  location_type public.service_location_type NOT NULL DEFAULT 'clinic'::service_location_type,
  is_available_for_shift boolean DEFAULT false,
  slot_duration_minutes integer NOT NULL DEFAULT 30,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- blocked_dates
CREATE TABLE public.blocked_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_date date NOT NULL,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- reviews (criar antes de appointments por causa da FK)
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_id uuid, -- FK adicionada após appointments
  rating integer NOT NULL,
  comment text,
  is_approved boolean DEFAULT false,
  is_moderated boolean DEFAULT false,
  moderated_at timestamp with time zone,
  moderated_by uuid REFERENCES auth.users(id),
  moderation_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_rating_check CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT reviews_comment_check CHECK (char_length(comment) <= 500),
  CONSTRAINT reviews_appointment_id_key UNIQUE (appointment_id)
);

-- appointments
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL,
  review_id uuid REFERENCES public.reviews(id) ON DELETE SET NULL,
  appointment_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  location_type public.service_location_type NOT NULL,
  location_address text,
  status public.appointment_status NOT NULL DEFAULT 'pending'::appointment_status,
  price numeric,
  tutor_notes text,
  professional_notes text,
  confirmed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancelled_by uuid REFERENCES auth.users(id),
  cancellation_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Adicionar FK de reviews -> appointments (circular)
ALTER TABLE public.reviews ADD CONSTRAINT reviews_appointment_id_fkey 
  FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

-- appointment_confirmations
CREATE TABLE public.appointment_confirmations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  confirmation_token uuid NOT NULL DEFAULT gen_random_uuid(),
  confirmation_type text NOT NULL,
  confirmed_at timestamp with time zone,
  reschedule_requested_at timestamp with time zone,
  email_sent_at timestamp with time zone,
  push_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT appointment_confirmations_confirmation_type_check CHECK (confirmation_type = ANY (ARRAY['24h'::text, '2h'::text])),
  CONSTRAINT appointment_confirmations_appointment_id_confirmation_type_key UNIQUE (appointment_id, confirmation_type)
);

-- appointment_reminders
CREATE TABLE public.appointment_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  reminder_type text NOT NULL,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- pet_vaccines
CREATE TABLE public.pet_vaccines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_administered date NOT NULL,
  next_dose_date date,
  veterinarian_name text,
  clinic_name text,
  batch_number text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- pet_medical_records
CREATE TABLE public.pet_medical_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  title text NOT NULL,
  record_type text NOT NULL,
  date date NOT NULL,
  description text,
  veterinarian_name text,
  clinic_name text,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT pet_medical_records_record_type_check CHECK (record_type = ANY (ARRAY['consultation'::text, 'exam'::text, 'surgery'::text, 'treatment'::text, 'other'::text]))
);

-- professional_education
CREATE TABLE public.professional_education (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  institution text NOT NULL,
  year integer NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- favorite_professionals
CREATE TABLE public.favorite_professionals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT favorite_professionals_tutor_profile_id_professional_profil_key UNIQUE (tutor_profile_id, professional_profile_id)
);

-- user_notifications
CREATE TABLE public.user_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'::text,
  related_appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  action_url text,
  action_label text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_notifications_type_check CHECK (type = ANY (ARRAY['info'::text, 'warning'::text, 'success'::text, 'appointment'::text, 'reminder'::text, 'confirmation'::text]))
);

-- notification_preferences
CREATE TABLE public.notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_appointments boolean NOT NULL DEFAULT true,
  email_reminders boolean NOT NULL DEFAULT true,
  email_marketing boolean NOT NULL DEFAULT false,
  push_appointments boolean NOT NULL DEFAULT true,
  push_reminders boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notification_preferences_profile_id_key UNIQUE (profile_id)
);

-- verification_logs
CREATE TABLE public.verification_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_status public.verification_status,
  new_status public.verification_status,
  notes text,
  performed_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- admin_logs
CREATE TABLE public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  description text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- professional_credits
CREATE TABLE public.professional_credits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_credits integer NOT NULL DEFAULT 0,
  used_credits integer NOT NULL DEFAULT 0,
  remaining_credits integer GENERATED ALWAYS AS (total_credits - used_credits) STORED,
  status text NOT NULL DEFAULT 'active'::text,
  last_credit_update timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT professional_credits_professional_profile_id_key UNIQUE (professional_profile_id),
  CONSTRAINT professional_credits_status_check CHECK (status = ANY (ARRAY['active'::text, 'low_credits'::text, 'exhausted'::text]))
);

-- lost_appointments
CREATE TABLE public.lost_appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  reason text NOT NULL DEFAULT 'no_credits'::text,
  attempted_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);


-- =====================
-- 3. VIEW
-- =====================

CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT 
  id, user_id, user_type, full_name, social_name, bio,
  profile_picture_url, city, state, neighborhood,
  is_verified, verification_status, crmv,
  latitude, longitude, home_service_radius,
  years_experience, payment_methods, created_at
FROM public.profiles
WHERE user_type = ANY (ARRAY['profissional'::user_type, 'empresa'::user_type]);


-- =====================
-- 4. ENABLE RLS
-- =====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_appointments ENABLE ROW LEVEL SECURITY;


-- =====================
-- 5. FUNCTIONS
-- =====================

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- handle_new_user (placeholder)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- sync_is_verified
CREATE OR REPLACE FUNCTION public.sync_is_verified()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.is_verified := (NEW.verification_status = 'verified');
  RETURN NEW;
END;
$$;

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- get_profile_id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- get_user_type
CREATE OR REPLACE FUNCTION public.get_user_type(_user_id uuid)
RETURNS public.user_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT user_type FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- get_profile_id_by_type
CREATE OR REPLACE FUNCTION public.get_profile_id_by_type(_user_id uuid, _user_type public.user_type)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id AND user_type = _user_type LIMIT 1
$$;

-- get_profile_by_type
CREATE OR REPLACE FUNCTION public.get_profile_by_type(_user_id uuid, _user_type public.user_type)
RETURNS TABLE(id uuid, user_id uuid, user_type public.user_type, full_name text, social_name text, email text, phone text, cpf text, cnpj text, crmv text, bio text, profile_picture_url text, is_verified boolean, city text, state text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id, p.user_id, p.user_type, p.full_name, p.social_name,
    p.email, p.phone, p.cpf, p.cnpj, p.crmv, p.bio,
    p.profile_picture_url, p.is_verified, p.city, p.state
  FROM public.profiles p
  WHERE p.user_id = _user_id AND p.user_type = _user_type
  LIMIT 1;
$$;

-- get_user_profile_types
CREATE OR REPLACE FUNCTION public.get_user_profile_types(_user_id uuid)
RETURNS TABLE(profile_id uuid, profile_type public.user_type, full_name text, is_verified boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id as profile_id, user_type as profile_type, full_name, is_verified
  FROM public.profiles
  WHERE user_id = _user_id
  ORDER BY created_at;
$$;

-- check_cpf_exists_for_type
CREATE OR REPLACE FUNCTION public.check_cpf_exists_for_type(_cpf text, _user_type public.user_type)
RETURNS TABLE(exists_for_type boolean, existing_user_id uuid, existing_email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    EXISTS(SELECT 1 FROM public.profiles WHERE cpf = _cpf AND user_type = _user_type) as exists_for_type,
    (SELECT user_id FROM public.profiles WHERE cpf = _cpf LIMIT 1) as existing_user_id,
    (SELECT email FROM public.profiles WHERE cpf = _cpf LIMIT 1) as existing_email;
$$;

-- calculate_distance
CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 double precision, lon1 double precision, lat2 double precision, lon2 double precision)
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
DECLARE
  R CONSTANT DOUBLE PRECISION := 6371;
  dlat DOUBLE PRECISION;
  dlon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  a := sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$;

-- count_monthly_appointments
CREATE OR REPLACE FUNCTION public.count_monthly_appointments(_professional_profile_id uuid, _month date DEFAULT CURRENT_DATE)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::integer
  FROM public.appointments
  WHERE professional_profile_id = _professional_profile_id
  AND appointment_date >= date_trunc('month', _month)::date
  AND appointment_date < (date_trunc('month', _month) + interval '1 month')::date
  AND status IN ('pending', 'confirmed', 'completed');
$$;

-- get_professional_plan_limits
CREATE OR REPLACE FUNCTION public.get_professional_plan_limits(_profile_id uuid)
RETURNS TABLE(monthly_appointments_limit integer, has_verified_badge boolean, has_price_table boolean, has_portfolio boolean, portfolio_limit integer, plan_name text, is_subscribed boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(s.monthly_appointments_limit, 0),
    COALESCE(s.has_verified_badge, false),
    COALESCE(s.has_price_table, false),
    COALESCE(s.has_portfolio, false),
    COALESCE(s.portfolio_limit, 0),
    COALESCE(s.name, 'Sem Plano'),
    (us.id IS NOT NULL AND us.status = 'active')
  FROM public.profiles p
  LEFT JOIN public.user_subscriptions us ON us.profile_id = p.id AND us.status = 'active'
  LEFT JOIN public.subscriptions s ON s.id = us.subscription_id
  WHERE p.id = _profile_id;
$$;

-- can_accept_appointment
CREATE OR REPLACE FUNCTION public.can_accept_appointment(_professional_profile_id uuid)
RETURNS TABLE(can_accept boolean, current_count integer, monthly_limit integer, remaining integer, plan_name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _current_count integer;
  _monthly_limit integer;
  _plan_name text;
  _is_subscribed boolean;
BEGIN
  _current_count := public.count_monthly_appointments(_professional_profile_id);
  SELECT pl.monthly_appointments_limit, pl.plan_name, pl.is_subscribed
  INTO _monthly_limit, _plan_name, _is_subscribed
  FROM public.get_professional_plan_limits(_professional_profile_id) pl;
  IF NOT COALESCE(_is_subscribed, false) THEN
    can_accept := false; current_count := _current_count; monthly_limit := 0; remaining := 0; plan_name := 'Sem Plano Ativo';
    RETURN NEXT; RETURN;
  END IF;
  IF _monthly_limit IS NULL THEN
    can_accept := true; current_count := _current_count; monthly_limit := NULL; remaining := NULL; plan_name := _plan_name;
    RETURN NEXT; RETURN;
  END IF;
  can_accept := _current_count < _monthly_limit;
  current_count := _current_count;
  monthly_limit := _monthly_limit;
  remaining := GREATEST(0, _monthly_limit - _current_count);
  plan_name := _plan_name;
  RETURN NEXT; RETURN;
END;
$$;

-- validate_appointment_limit (trigger function)
CREATE OR REPLACE FUNCTION public.validate_appointment_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _can_accept boolean;
  _plan_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT ca.can_accept, ca.plan_name INTO _can_accept, _plan_name
    FROM public.can_accept_appointment(NEW.professional_profile_id) ca;
    IF NOT COALESCE(_can_accept, false) THEN
      RAISE EXCEPTION 'Limite de agendamentos mensais atingido para o plano: %', _plan_name;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- get_available_slots
CREATE OR REPLACE FUNCTION public.get_available_slots(_professional_profile_id uuid, _date date, _duration_minutes integer DEFAULT 30)
RETURNS TABLE(slot_start time without time zone, slot_end time without time zone, location_type public.service_location_type)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _day_name public.day_of_week;
  _avail RECORD;
  _current_time TIME;
  _slot_end TIME;
BEGIN
  _day_name := TRIM(LOWER(TO_CHAR(_date, 'day')))::public.day_of_week;
  IF EXISTS (SELECT 1 FROM public.blocked_dates WHERE profile_id = _professional_profile_id AND blocked_date = _date) THEN
    RETURN;
  END IF;
  FOR _avail IN 
    SELECT a.start_time, a.end_time, a.location_type, a.slot_duration_minutes
    FROM public.availability a WHERE a.profile_id = _professional_profile_id AND a.day_of_week = _day_name
  LOOP
    _current_time := _avail.start_time;
    WHILE _current_time + (COALESCE(_duration_minutes, _avail.slot_duration_minutes) || ' minutes')::interval <= _avail.end_time LOOP
      _slot_end := _current_time + (_duration_minutes || ' minutes')::interval;
      IF NOT EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE professional_profile_id = _professional_profile_id AND appointment_date = _date AND status IN ('pending', 'confirmed')
        AND ((_current_time >= start_time AND _current_time < end_time) OR (_slot_end > start_time AND _slot_end <= end_time) OR (_current_time <= start_time AND _slot_end >= end_time))
      ) THEN
        slot_start := _current_time; slot_end := _slot_end; location_type := _avail.location_type;
        RETURN NEXT;
      END IF;
      _current_time := _current_time + (_avail.slot_duration_minutes || ' minutes')::interval;
    END LOOP;
  END LOOP;
  RETURN;
END;
$$;

-- is_slot_available
CREATE OR REPLACE FUNCTION public.is_slot_available(_professional_profile_id uuid, _date date, _start_time time without time zone, _end_time time without time zone)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _day_name public.day_of_week;
  _is_blocked BOOLEAN;
  _has_availability BOOLEAN;
  _has_conflict BOOLEAN;
BEGIN
  _day_name := LOWER(TO_CHAR(_date, 'day'))::public.day_of_week;
  SELECT EXISTS (SELECT 1 FROM public.blocked_dates WHERE profile_id = _professional_profile_id AND blocked_date = _date) INTO _is_blocked;
  IF _is_blocked THEN RETURN FALSE; END IF;
  SELECT EXISTS (SELECT 1 FROM public.availability WHERE profile_id = _professional_profile_id AND day_of_week = _day_name AND start_time <= _start_time AND end_time >= _end_time) INTO _has_availability;
  IF NOT _has_availability THEN RETURN FALSE; END IF;
  SELECT EXISTS (
    SELECT 1 FROM public.appointments WHERE professional_profile_id = _professional_profile_id AND appointment_date = _date AND status IN ('pending', 'confirmed')
    AND ((_start_time >= start_time AND _start_time < end_time) OR (_end_time > start_time AND _end_time <= end_time) OR (_start_time <= start_time AND _end_time >= end_time))
  ) INTO _has_conflict;
  RETURN NOT _has_conflict;
END;
$$;

-- get_appointments_needing_confirmation
CREATE OR REPLACE FUNCTION public.get_appointments_needing_confirmation()
RETURNS TABLE(appointment_id uuid, tutor_name text, tutor_email text, professional_name text, pet_name text, service_name text, appointment_date date, start_time time without time zone, end_time time without time zone, location_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, tp.full_name, tp.email, pp.full_name, p.name, s.name, a.appointment_date, a.start_time, a.end_time, a.location_type::TEXT
  FROM appointments a
  INNER JOIN profiles tp ON a.tutor_profile_id = tp.id
  INNER JOIN profiles pp ON a.professional_profile_id = pp.id
  LEFT JOIN pets p ON a.pet_id = p.id
  LEFT JOIN services s ON a.service_id = s.id
  WHERE a.status IN ('pending', 'confirmed') AND a.appointment_date = CURRENT_DATE + INTERVAL '1 day'
  AND NOT EXISTS (SELECT 1 FROM appointment_confirmations ac WHERE ac.appointment_id = a.id AND ac.confirmation_type = '24h' AND ac.email_sent_at IS NOT NULL);
END;
$$;

-- get_appointments_needing_reminder
CREATE OR REPLACE FUNCTION public.get_appointments_needing_reminder()
RETURNS TABLE(appointment_id uuid, tutor_name text, tutor_email text, professional_name text, pet_name text, service_name text, appointment_date date, start_time time without time zone, end_time time without time zone, location_type text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, tp.full_name, tp.email, pp.full_name, p.name, s.name, a.appointment_date, a.start_time, a.end_time, a.location_type::TEXT
  FROM appointments a
  INNER JOIN profiles tp ON a.tutor_profile_id = tp.id
  INNER JOIN profiles pp ON a.professional_profile_id = pp.id
  LEFT JOIN pets p ON a.pet_id = p.id
  LEFT JOIN services s ON a.service_id = s.id
  WHERE a.status = 'confirmed' AND a.appointment_date = CURRENT_DATE
  AND a.start_time BETWEEN (CURRENT_TIME + INTERVAL '2 hours') AND (CURRENT_TIME + INTERVAL '2 hours 30 minutes')
  AND NOT EXISTS (SELECT 1 FROM appointment_confirmations ac WHERE ac.appointment_id = a.id AND ac.confirmation_type = '2h' AND ac.email_sent_at IS NOT NULL);
END;
$$;

-- get_professional_rating
CREATE OR REPLACE FUNCTION public.get_professional_rating(_professional_profile_id uuid)
RETURNS TABLE(average_rating numeric, total_reviews integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ROUND(AVG(rating)::numeric, 1), COUNT(*)::integer
  FROM public.reviews
  WHERE professional_profile_id = _professional_profile_id AND is_approved = true;
$$;

-- can_review_appointment
CREATE OR REPLACE FUNCTION public.can_review_appointment(_appointment_id uuid, _tutor_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = _appointment_id AND a.tutor_profile_id = _tutor_profile_id AND a.status = 'completed'
    AND NOT EXISTS (SELECT 1 FROM public.reviews r WHERE r.appointment_id = _appointment_id)
  );
$$;

-- auto_approve_reviews
CREATE OR REPLACE FUNCTION public.auto_approve_reviews()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _approved_count INTEGER;
BEGIN
  UPDATE public.reviews SET is_approved = true, is_moderated = true, moderated_at = NOW(), moderation_notes = 'Auto-aprovado após 48 horas'
  WHERE is_moderated = false AND created_at < NOW() - INTERVAL '48 hours';
  GET DIAGNOSTICS _approved_count = ROW_COUNT;
  RETURN _approved_count;
END;
$$;

-- auto_cancel_expired_appointments
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_appointments()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _cancelled_count INTEGER;
BEGIN
  UPDATE public.appointments SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = 'Cancelado automaticamente: sem confirmação em 24 horas'
  WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours';
  GET DIAGNOSTICS _cancelled_count = ROW_COUNT;
  RETURN _cancelled_count;
END;
$$;

-- search_professionals_by_location (versão com search_mode)
CREATE OR REPLACE FUNCTION public.search_professionals_by_location(user_lat double precision, user_lng double precision, search_radius integer DEFAULT 10, search_mode text DEFAULT 'all'::text)
RETURNS TABLE(profile_id uuid, distance_km double precision, covers_user_location boolean)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS profile_id,
    public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) AS distance_km,
    CASE 
      WHEN search_mode = 'local_fixo' THEN
        p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
        AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
      WHEN search_mode = 'domiciliar' THEN
        p.latitude IS NOT NULL AND p.longitude IS NOT NULL 
        AND p.home_service_radius IS NOT NULL AND p.home_service_radius > 0
        AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
      ELSE
        CASE
          WHEN p.latitude IS NULL OR p.longitude IS NULL THEN TRUE
          WHEN p.home_service_radius IS NOT NULL AND p.home_service_radius > 0 THEN
            public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
            OR public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
          ELSE
            public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
        END
    END AS covers_user_location
  FROM public.profiles p
  WHERE p.user_type IN ('profissional', 'empresa')
    AND p.verification_status = 'verified'
    AND (
      CASE 
        WHEN search_mode = 'local_fixo' THEN
          p.latitude IS NOT NULL AND p.longitude IS NOT NULL
          AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
        WHEN search_mode = 'domiciliar' THEN
          p.latitude IS NOT NULL AND p.longitude IS NOT NULL
          AND p.home_service_radius IS NOT NULL AND p.home_service_radius > 0
          AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
        ELSE
          (p.latitude IS NULL AND p.longitude IS NULL)
          OR (p.home_service_radius IS NULL AND public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius)
          OR (p.home_service_radius IS NOT NULL AND (
            public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= search_radius
            OR public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude) <= p.home_service_radius
          ))
      END
    )
  ORDER BY 
    CASE WHEN p.latitude IS NULL OR p.longitude IS NULL THEN 1 ELSE 0 END,
    public.calculate_distance(user_lat, user_lng, p.latitude, p.longitude);
END;
$$;

-- change_verification_status
CREATE OR REPLACE FUNCTION public.change_verification_status(_profile_id uuid, _new_status public.verification_status, _notes text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _old_status public.verification_status;
  _admin_id UUID;
BEGIN
  _admin_id := auth.uid();
  IF NOT is_admin(_admin_id) THEN RAISE EXCEPTION 'Only administrators can change verification status'; END IF;
  SELECT verification_status INTO _old_status FROM public.profiles WHERE id = _profile_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  UPDATE public.profiles SET 
    verification_status = _new_status,
    is_verified = (_new_status = 'verified'),
    verified_at = CASE WHEN _new_status = 'verified' THEN now() ELSE NULL END,
    verified_by = CASE WHEN _new_status = 'verified' THEN _admin_id ELSE NULL END,
    verification_notes = _notes, updated_at = now()
  WHERE id = _profile_id;
  INSERT INTO public.verification_logs (profile_id, action, old_status, new_status, notes, performed_by)
  VALUES (_profile_id, CASE WHEN _new_status IN ('not_verified', 'under_review') AND _old_status = 'verified' THEN 'reset' ELSE 'status_change' END, _old_status, _new_status, _notes, _admin_id);
  RETURN TRUE;
END;
$$;

-- get_verification_stats
CREATE OR REPLACE FUNCTION public.get_verification_stats()
RETURNS TABLE(total_professionals integer, not_verified integer, under_review integer, verified integer, rejected integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*)::INTEGER,
    COUNT(*) FILTER (WHERE verification_status = 'not_verified')::INTEGER,
    COUNT(*) FILTER (WHERE verification_status = 'under_review')::INTEGER,
    COUNT(*) FILTER (WHERE verification_status = 'verified')::INTEGER,
    COUNT(*) FILTER (WHERE verification_status = 'rejected')::INTEGER
  FROM public.profiles WHERE user_type IN ('profissional', 'empresa');
$$;

-- can_verify_profile
CREATE OR REPLACE FUNCTION public.can_verify_profile(_profile_id uuid)
RETURNS TABLE(can_verify boolean, missing_documents text[], has_crmv_document boolean, has_id_document boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _has_crmv BOOLEAN;
  _has_id BOOLEAN;
  _missing TEXT[] := '{}';
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.documents WHERE profile_id = _profile_id AND document_type = 'crmv' AND is_verified = true) INTO _has_crmv;
  SELECT EXISTS (SELECT 1 FROM public.documents WHERE profile_id = _profile_id AND document_type IN ('rg', 'cnh') AND is_verified = true) INTO _has_id;
  IF NOT _has_crmv THEN _missing := array_append(_missing, 'CRMV'); END IF;
  IF NOT _has_id THEN _missing := array_append(_missing, 'RG ou CNH'); END IF;
  can_verify := _has_crmv AND _has_id;
  missing_documents := _missing;
  has_crmv_document := _has_crmv;
  has_id_document := _has_id;
  RETURN NEXT;
END;
$$;

-- check_professional_credits
CREATE OR REPLACE FUNCTION public.check_professional_credits(p_professional_profile_id uuid)
RETURNS TABLE(has_credits boolean, remaining integer, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(pc.remaining_credits > 0, false), COALESCE(pc.remaining_credits, 0), COALESCE(pc.status, 'exhausted')
  FROM professional_credits pc WHERE pc.professional_profile_id = p_professional_profile_id;
  IF NOT FOUND THEN RETURN QUERY SELECT false, 0, 'exhausted'::TEXT; END IF;
END;
$$;

-- consume_professional_credit
CREATE OR REPLACE FUNCTION public.consume_professional_credit(p_professional_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_remaining INTEGER;
BEGIN
  SELECT remaining_credits INTO v_remaining FROM professional_credits WHERE professional_profile_id = p_professional_profile_id FOR UPDATE;
  IF v_remaining IS NULL OR v_remaining <= 0 THEN RETURN false; END IF;
  UPDATE professional_credits SET used_credits = used_credits + 1, last_credit_update = now(), updated_at = now()
  WHERE professional_profile_id = p_professional_profile_id;
  RETURN true;
END;
$$;

-- add_professional_credits
CREATE OR REPLACE FUNCTION public.add_professional_credits(p_professional_profile_id uuid, p_credits_to_add integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO professional_credits (professional_profile_id, total_credits) VALUES (p_professional_profile_id, p_credits_to_add)
  ON CONFLICT (professional_profile_id) DO UPDATE SET total_credits = professional_credits.total_credits + p_credits_to_add, last_credit_update = now();
  RETURN true;
END;
$$;

-- update_credit_status (trigger function)
CREATE OR REPLACE FUNCTION public.update_credit_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (NEW.total_credits - NEW.used_credits) <= 0 THEN NEW.status := 'exhausted';
  ELSIF (NEW.total_credits - NEW.used_credits) <= 5 THEN NEW.status := 'low_credits';
  ELSE NEW.status := 'active';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- get_professional_credit_stats
CREATE OR REPLACE FUNCTION public.get_professional_credit_stats(p_professional_profile_id uuid)
RETURNS TABLE(total_credits integer, used_credits integer, remaining_credits integer, status text, confirmed_appointments bigint, lost_clients bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(pc.total_credits, 0), COALESCE(pc.used_credits, 0), COALESCE(pc.remaining_credits, 0), COALESCE(pc.status, 'exhausted'),
    (SELECT COUNT(*) FROM appointments a WHERE a.professional_profile_id = p_professional_profile_id AND a.status IN ('confirmed', 'completed')),
    (SELECT COUNT(*) FROM lost_appointments la WHERE la.professional_profile_id = p_professional_profile_id)
  FROM professional_credits pc WHERE pc.professional_profile_id = p_professional_profile_id;
  IF NOT FOUND THEN RETURN QUERY SELECT 0, 0, 0, 'exhausted'::TEXT, 0::BIGINT, 0::BIGINT; END IF;
END;
$$;

-- record_lost_appointment
CREATE OR REPLACE FUNCTION public.record_lost_appointment(p_professional_profile_id uuid, p_tutor_profile_id uuid, p_service_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO lost_appointments (professional_profile_id, tutor_profile_id, service_id, reason)
  VALUES (p_professional_profile_id, p_tutor_profile_id, p_service_id, 'no_credits')
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;


-- =====================
-- 6. TRIGGERS
-- =====================

CREATE TRIGGER sync_is_verified_trigger BEFORE INSERT OR UPDATE OF verification_status ON public.profiles FOR EACH ROW EXECUTE FUNCTION sync_is_verified();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON public.availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER check_appointment_limit BEFORE INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION validate_appointment_limit();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pet_vaccines_updated_at BEFORE UPDATE ON public.pet_vaccines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pet_medical_records_updated_at BEFORE UPDATE ON public.pet_medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_education_updated_at BEFORE UPDATE ON public.professional_education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_credits_status BEFORE UPDATE ON public.professional_credits FOR EACH ROW EXECUTE FUNCTION update_credit_status();


-- =====================
-- 7. INDEXES
-- =====================

-- profiles
CREATE INDEX idx_profiles_geo ON public.profiles USING btree (latitude, longitude) WHERE (latitude IS NOT NULL AND longitude IS NOT NULL);
CREATE INDEX idx_profiles_location ON public.profiles USING btree (latitude, longitude) WHERE (latitude IS NOT NULL AND longitude IS NOT NULL);
CREATE INDEX idx_profiles_home_service_radius ON public.profiles USING btree (home_service_radius) WHERE (home_service_radius IS NOT NULL);
CREATE INDEX idx_profiles_payment_methods ON public.profiles USING gin (payment_methods);
CREATE INDEX idx_profiles_cpf_user_type ON public.profiles USING btree (cpf, user_type);
CREATE INDEX idx_profiles_user_id_user_type ON public.profiles USING btree (user_id, user_type);
CREATE INDEX idx_profiles_verification ON public.profiles USING btree (verification_status, user_type) WHERE (user_type = ANY (ARRAY['profissional'::user_type, 'empresa'::user_type]));
CREATE INDEX idx_profiles_verification_status ON public.profiles USING btree (verification_status) WHERE (user_type = ANY (ARRAY['profissional'::user_type, 'empresa'::user_type]));

-- appointments
CREATE INDEX idx_appointments_professional_date ON public.appointments USING btree (professional_profile_id, appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);
CREATE INDEX idx_appointments_tutor ON public.appointments USING btree (tutor_profile_id);

-- appointment_confirmations
CREATE INDEX idx_appointment_confirmations_appointment_id ON public.appointment_confirmations USING btree (appointment_id);
CREATE INDEX idx_appointment_confirmations_token ON public.appointment_confirmations USING btree (confirmation_token);

-- availability
CREATE INDEX idx_availability_profile_day ON public.availability USING btree (profile_id, day_of_week);

-- blocked_dates
CREATE INDEX idx_blocked_dates_profile_date ON public.blocked_dates USING btree (profile_id, blocked_date);

-- favorite_professionals
CREATE INDEX idx_favorite_professionals_tutor ON public.favorite_professionals USING btree (tutor_profile_id);
CREATE INDEX idx_favorite_professionals_professional ON public.favorite_professionals USING btree (professional_profile_id);

-- reviews
CREATE INDEX idx_reviews_professional ON public.reviews USING btree (professional_profile_id);
CREATE INDEX idx_reviews_tutor ON public.reviews USING btree (tutor_profile_id);
CREATE INDEX idx_reviews_approved ON public.reviews USING btree (is_approved);
CREATE INDEX idx_reviews_created ON public.reviews USING btree (created_at DESC);

-- user_notifications
CREATE INDEX idx_user_notifications_profile_id ON public.user_notifications USING btree (profile_id);
CREATE INDEX idx_user_notifications_unread ON public.user_notifications USING btree (profile_id, is_read) WHERE (is_read = false);

-- notification_preferences
CREATE INDEX idx_notification_preferences_profile_id ON public.notification_preferences USING btree (profile_id);

-- admin_logs
CREATE INDEX idx_admin_logs_admin ON public.admin_logs USING btree (admin_user_id);
CREATE INDEX idx_admin_logs_entity ON public.admin_logs USING btree (entity_type, entity_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs USING btree (created_at DESC);

-- professional_credits
CREATE INDEX idx_professional_credits_status ON public.professional_credits USING btree (status);

-- lost_appointments
CREATE INDEX idx_lost_appointments_professional ON public.lost_appointments USING btree (professional_profile_id);
CREATE INDEX idx_lost_appointments_date ON public.lost_appointments USING btree (attempted_date);


-- =====================
-- 8. RLS POLICIES
-- =====================

-- === profiles ===
CREATE POLICY "Public can view verified professionals" ON public.profiles FOR SELECT
  USING (((user_type = ANY (ARRAY['profissional'::user_type, 'empresa'::user_type])) AND (verification_status = 'verified'::verification_status)) OR (auth.uid() = user_id));

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE
  USING ((auth.uid() = user_id) OR is_admin(auth.uid()));

CREATE POLICY "Only admins can delete profiles" ON public.profiles FOR DELETE
  USING (is_admin(auth.uid()));

-- === user_roles ===
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT
  USING ((auth.uid() = user_id) OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL
  USING (is_admin(auth.uid()));

-- === documents ===
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Users can upload their own documents" ON public.documents FOR INSERT
  WITH CHECK (profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

-- === pets ===
CREATE POLICY "Users can view their own pets" ON public.pets FOR SELECT
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Tutors can insert pets" ON public.pets FOR INSERT
  WITH CHECK ((profile_id = get_profile_id(auth.uid())) AND (get_user_type(auth.uid()) = 'tutor'::user_type));

CREATE POLICY "Users can update their own pets" ON public.pets FOR UPDATE
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Users can delete their own pets" ON public.pets FOR DELETE
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

-- === subscriptions ===
CREATE POLICY "Anyone can view subscriptions" ON public.subscriptions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage subscriptions" ON public.subscriptions FOR ALL
  USING (is_admin(auth.uid()));

-- === user_subscriptions ===
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions FOR SELECT
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Professionals and companies can subscribe" ON public.user_subscriptions FOR INSERT
  WITH CHECK ((profile_id = get_profile_id(auth.uid())) AND (get_user_type(auth.uid()) = ANY (ARRAY['profissional'::user_type, 'empresa'::user_type])));

CREATE POLICY "Only admins can update subscriptions" ON public.user_subscriptions FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can cancel their own subscriptions" ON public.user_subscriptions FOR DELETE
  USING ((profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

-- === legal_agreements ===
CREATE POLICY "Users can view their own agreements" ON public.legal_agreements FOR SELECT
  USING ((auth.uid() = user_id) OR is_admin(auth.uid()));

CREATE POLICY "Users can accept agreements" ON public.legal_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own agreements" ON public.legal_agreements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- === services ===
CREATE POLICY "Authenticated users can view active services" ON public.services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Professionals can manage their services" ON public.services FOR ALL
  USING (profile_id = get_profile_id(auth.uid()))
  WITH CHECK (profile_id = get_profile_id(auth.uid()));

-- === availability ===
CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their availability" ON public.availability FOR ALL
  USING (profile_id = get_profile_id(auth.uid()))
  WITH CHECK (profile_id = get_profile_id(auth.uid()));

-- === blocked_dates ===
CREATE POLICY "Anyone can view blocked dates" ON public.blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage their blocked dates" ON public.blocked_dates FOR ALL
  USING (profile_id = get_profile_id(auth.uid()))
  WITH CHECK (profile_id = get_profile_id(auth.uid()));

-- === appointments ===
CREATE POLICY "Users can view their own appointments" ON public.appointments FOR SELECT
  USING ((tutor_profile_id = get_profile_id(auth.uid())) OR (professional_profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Tutors can create appointments" ON public.appointments FOR INSERT
  WITH CHECK ((tutor_profile_id = get_profile_id(auth.uid())) AND (get_user_type(auth.uid()) = 'tutor'::user_type));

CREATE POLICY "Participants can update appointments" ON public.appointments FOR UPDATE
  USING ((tutor_profile_id = get_profile_id(auth.uid())) OR (professional_profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Users can cancel their appointments" ON public.appointments FOR DELETE
  USING ((tutor_profile_id = get_profile_id(auth.uid())) OR (professional_profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

-- === appointment_confirmations ===
CREATE POLICY "Users can view their appointment confirmations" ON public.appointment_confirmations FOR SELECT
  USING (EXISTS (SELECT 1 FROM appointments a WHERE a.id = appointment_confirmations.appointment_id AND (a.tutor_profile_id = get_profile_id(auth.uid()) OR a.professional_profile_id = get_profile_id(auth.uid()))));

CREATE POLICY "Block direct client inserts" ON public.appointment_confirmations FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block direct client updates" ON public.appointment_confirmations FOR UPDATE
  USING (false);

CREATE POLICY "Block direct client deletes" ON public.appointment_confirmations FOR DELETE
  USING (false);

-- === appointment_reminders ===
CREATE POLICY "Users can view their appointment reminders" ON public.appointment_reminders FOR SELECT
  USING (EXISTS (SELECT 1 FROM appointments a WHERE a.id = appointment_reminders.appointment_id AND (a.tutor_profile_id = get_profile_id(auth.uid()) OR a.professional_profile_id = get_profile_id(auth.uid()))));

-- === reviews ===
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT
  USING ((is_approved = true) OR (tutor_profile_id = get_profile_id(auth.uid())) OR (professional_profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Tutors can create reviews for completed appointments" ON public.reviews FOR INSERT
  WITH CHECK ((tutor_profile_id = get_profile_id(auth.uid())) AND (get_user_type(auth.uid()) = 'tutor'::user_type));

CREATE POLICY "Only admins can update reviews" ON public.reviews FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete reviews" ON public.reviews FOR DELETE
  USING (is_admin(auth.uid()));

-- === pet_vaccines ===
CREATE POLICY "Owners can view their pet vaccines" ON public.pet_vaccines FOR SELECT
  USING (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_vaccines.pet_id AND p.profile_id = get_profile_id(auth.uid())));

CREATE POLICY "Owners can insert vaccines for their pets" ON public.pet_vaccines FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_vaccines.pet_id AND p.profile_id = get_profile_id(auth.uid())));

CREATE POLICY "Owners can update their pet vaccines" ON public.pet_vaccines FOR UPDATE
  USING (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_vaccines.pet_id AND p.profile_id = get_profile_id(auth.uid())));

CREATE POLICY "Owners can delete their pet vaccines" ON public.pet_vaccines FOR DELETE
  USING (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_vaccines.pet_id AND p.profile_id = get_profile_id(auth.uid())));

-- === pet_medical_records ===
CREATE POLICY "Owners can view their pet medical records" ON public.pet_medical_records FOR SELECT
  USING (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_medical_records.pet_id AND p.profile_id = get_profile_id(auth.uid())));

CREATE POLICY "Owners can insert medical records for their pets" ON public.pet_medical_records FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_medical_records.pet_id AND p.profile_id = get_profile_id(auth.uid())));

CREATE POLICY "Owners can update their pet medical records" ON public.pet_medical_records FOR UPDATE
  USING (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_medical_records.pet_id AND p.profile_id = get_profile_id(auth.uid())));

CREATE POLICY "Owners can delete their pet medical records" ON public.pet_medical_records FOR DELETE
  USING (EXISTS (SELECT 1 FROM pets p WHERE p.id = pet_medical_records.pet_id AND p.profile_id = get_profile_id(auth.uid())));

-- === professional_education ===
CREATE POLICY "Public can view education" ON public.professional_education FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own education" ON public.professional_education FOR SELECT
  USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can create their own education" ON public.professional_education FOR INSERT
  WITH CHECK (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can update their own education" ON public.professional_education FOR UPDATE
  USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can delete their own education" ON public.professional_education FOR DELETE
  USING (profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- === favorite_professionals ===
CREATE POLICY "Users can view their own favorites" ON public.favorite_professionals FOR SELECT
  USING (tutor_profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can add favorites" ON public.favorite_professionals FOR INSERT
  WITH CHECK (tutor_profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can remove favorites" ON public.favorite_professionals FOR DELETE
  USING (tutor_profile_id = get_profile_id(auth.uid()));

-- === user_notifications ===
CREATE POLICY "Users can view their own notifications" ON public.user_notifications FOR SELECT
  USING (profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can update their own notifications" ON public.user_notifications FOR UPDATE
  USING (profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can delete their own notifications" ON public.user_notifications FOR DELETE
  USING (profile_id = get_profile_id(auth.uid()));

-- === notification_preferences ===
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT
  USING (profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT
  WITH CHECK (profile_id = get_profile_id(auth.uid()));

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE
  USING (profile_id = get_profile_id(auth.uid()));

-- === verification_logs ===
CREATE POLICY "Only admins can view verification logs" ON public.verification_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can insert verification logs" ON public.verification_logs FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- === admin_logs ===
CREATE POLICY "Only admins can view admin logs" ON public.admin_logs FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can create admin logs" ON public.admin_logs FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- === professional_credits ===
CREATE POLICY "Professionals can view their own credits" ON public.professional_credits FOR SELECT
  USING ((professional_profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Only system/admin can insert credits" ON public.professional_credits FOR INSERT
  WITH CHECK (is_admin(auth.uid()) OR (professional_profile_id = get_profile_id(auth.uid())));

CREATE POLICY "Only system/admin can update credits" ON public.professional_credits FOR UPDATE
  USING (is_admin(auth.uid()));

-- === lost_appointments ===
CREATE POLICY "Professionals can view their lost appointments" ON public.lost_appointments FOR SELECT
  USING ((professional_profile_id = get_profile_id(auth.uid())) OR is_admin(auth.uid()));

CREATE POLICY "Tutors can record their own lost appointments" ON public.lost_appointments FOR INSERT
  WITH CHECK (tutor_profile_id = get_profile_id(auth.uid()));


-- =====================
-- 9. STORAGE BUCKETS
-- =====================
-- Execute no Supabase Dashboard ou via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pet-medical-files', 'pet-medical-files', false);


-- =====================
-- FIM DO DUMP ESTRUTURAL
-- =====================
