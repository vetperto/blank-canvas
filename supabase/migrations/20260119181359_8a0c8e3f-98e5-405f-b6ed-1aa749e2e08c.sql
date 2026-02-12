-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- Create enum for service location type
CREATE TYPE public.service_location_type AS ENUM ('clinic', 'home_visit', 'both');

-- Create enum for day of week
CREATE TYPE public.day_of_week AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- Create services table (services offered by professionals)
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price DECIMAL(10,2),
  location_type service_location_type NOT NULL DEFAULT 'clinic',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create availability table (weekly recurring availability)
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_type service_location_type NOT NULL DEFAULT 'clinic',
  is_available_for_shift BOOLEAN DEFAULT FALSE, -- For plantão (shift work)
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create blocked_dates table (for vacations, holidays, etc.)
CREATE TABLE public.blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  professional_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_type service_location_type NOT NULL,
  location_address TEXT,
  status appointment_status NOT NULL DEFAULT 'pending',
  tutor_notes TEXT,
  professional_notes TEXT,
  price DECIMAL(10,2),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create appointment_reminders table
CREATE TABLE public.appointment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT NOT NULL, -- '24h', '1h', etc.
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Professionals can manage their services"
  ON public.services FOR ALL
  TO authenticated
  USING (profile_id = public.get_profile_id(auth.uid()))
  WITH CHECK (profile_id = public.get_profile_id(auth.uid()));

-- RLS Policies for availability
CREATE POLICY "Anyone can view availability"
  ON public.availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professionals can manage their availability"
  ON public.availability FOR ALL
  TO authenticated
  USING (profile_id = public.get_profile_id(auth.uid()))
  WITH CHECK (profile_id = public.get_profile_id(auth.uid()));

-- RLS Policies for blocked_dates
CREATE POLICY "Anyone can view blocked dates"
  ON public.blocked_dates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professionals can manage their blocked dates"
  ON public.blocked_dates FOR ALL
  TO authenticated
  USING (profile_id = public.get_profile_id(auth.uid()))
  WITH CHECK (profile_id = public.get_profile_id(auth.uid()));

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    tutor_profile_id = public.get_profile_id(auth.uid()) 
    OR professional_profile_id = public.get_profile_id(auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Tutors can create appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    tutor_profile_id = public.get_profile_id(auth.uid())
    AND public.get_user_type(auth.uid()) = 'tutor'
  );

CREATE POLICY "Participants can update appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (
    tutor_profile_id = public.get_profile_id(auth.uid()) 
    OR professional_profile_id = public.get_profile_id(auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can cancel their appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (
    tutor_profile_id = public.get_profile_id(auth.uid()) 
    OR professional_profile_id = public.get_profile_id(auth.uid())
    OR public.is_admin(auth.uid())
  );

-- RLS Policies for appointment_reminders
CREATE POLICY "Users can view their appointment reminders"
  ON public.appointment_reminders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a 
      WHERE a.id = appointment_id 
      AND (a.tutor_profile_id = public.get_profile_id(auth.uid()) 
           OR a.professional_profile_id = public.get_profile_id(auth.uid()))
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_updated_at
  BEFORE UPDATE ON public.availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if a time slot is available
CREATE OR REPLACE FUNCTION public.is_slot_available(
  _professional_profile_id UUID,
  _date DATE,
  _start_time TIME,
  _end_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _day_name day_of_week;
  _is_blocked BOOLEAN;
  _has_availability BOOLEAN;
  _has_conflict BOOLEAN;
BEGIN
  -- Get day of week
  _day_name := LOWER(TO_CHAR(_date, 'day'))::day_of_week;
  
  -- Check if date is blocked
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_dates 
    WHERE profile_id = _professional_profile_id 
    AND blocked_date = _date
  ) INTO _is_blocked;
  
  IF _is_blocked THEN
    RETURN FALSE;
  END IF;
  
  -- Check if professional has availability for this day/time
  SELECT EXISTS (
    SELECT 1 FROM public.availability 
    WHERE profile_id = _professional_profile_id 
    AND day_of_week = _day_name
    AND start_time <= _start_time 
    AND end_time >= _end_time
  ) INTO _has_availability;
  
  IF NOT _has_availability THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicting appointments
  SELECT EXISTS (
    SELECT 1 FROM public.appointments 
    WHERE professional_profile_id = _professional_profile_id 
    AND appointment_date = _date
    AND status IN ('pending', 'confirmed')
    AND (
      (_start_time >= start_time AND _start_time < end_time)
      OR (_end_time > start_time AND _end_time <= end_time)
      OR (_start_time <= start_time AND _end_time >= end_time)
    )
  ) INTO _has_conflict;
  
  RETURN NOT _has_conflict;
END;
$$;

-- Function to get available slots for a professional on a date
CREATE OR REPLACE FUNCTION public.get_available_slots(
  _professional_profile_id UUID,
  _date DATE,
  _duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE (
  slot_start TIME,
  slot_end TIME,
  location_type service_location_type
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _day_name day_of_week;
  _avail RECORD;
  _current_time TIME;
  _slot_end TIME;
BEGIN
  -- Get day of week (trim spaces from TO_CHAR result)
  _day_name := TRIM(LOWER(TO_CHAR(_date, 'day')))::day_of_week;
  
  -- Check if date is blocked
  IF EXISTS (
    SELECT 1 FROM public.blocked_dates 
    WHERE profile_id = _professional_profile_id 
    AND blocked_date = _date
  ) THEN
    RETURN;
  END IF;
  
  -- Loop through availability for this day
  FOR _avail IN 
    SELECT a.start_time, a.end_time, a.location_type, a.slot_duration_minutes
    FROM public.availability a
    WHERE a.profile_id = _professional_profile_id 
    AND a.day_of_week = _day_name
  LOOP
    _current_time := _avail.start_time;
    
    WHILE _current_time + (COALESCE(_duration_minutes, _avail.slot_duration_minutes) || ' minutes')::interval <= _avail.end_time LOOP
      _slot_end := _current_time + (_duration_minutes || ' minutes')::interval;
      
      -- Check if this slot is available (no conflicts)
      IF NOT EXISTS (
        SELECT 1 FROM public.appointments 
        WHERE professional_profile_id = _professional_profile_id 
        AND appointment_date = _date
        AND status IN ('pending', 'confirmed')
        AND (
          (_current_time >= start_time AND _current_time < end_time)
          OR (_slot_end > start_time AND _slot_end <= end_time)
          OR (_current_time <= start_time AND _slot_end >= end_time)
        )
      ) THEN
        slot_start := _current_time;
        slot_end := _slot_end;
        location_type := _avail.location_type;
        RETURN NEXT;
      END IF;
      
      _current_time := _current_time + (_avail.slot_duration_minutes || ' minutes')::interval;
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$$;

-- Function to check and auto-cancel pending appointments after 24h
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_appointments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cancelled_count INTEGER;
BEGIN
  UPDATE public.appointments
  SET 
    status = 'cancelled',
    cancelled_at = NOW(),
    cancellation_reason = 'Cancelado automaticamente: sem confirmação em 24 horas'
  WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS _cancelled_count = ROW_COUNT;
  RETURN _cancelled_count;
END;
$$;

-- Create index for faster queries
CREATE INDEX idx_appointments_professional_date ON public.appointments(professional_profile_id, appointment_date);
CREATE INDEX idx_appointments_tutor ON public.appointments(tutor_profile_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_availability_profile_day ON public.availability(profile_id, day_of_week);
CREATE INDEX idx_blocked_dates_profile_date ON public.blocked_dates(profile_id, blocked_date);