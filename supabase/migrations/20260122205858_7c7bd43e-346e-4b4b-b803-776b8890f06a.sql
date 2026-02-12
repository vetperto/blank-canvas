-- Tabela para armazenar confirmações de agendamentos
CREATE TABLE public.appointment_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  confirmation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  confirmation_type TEXT NOT NULL CHECK (confirmation_type IN ('24h', '2h')),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  reschedule_requested_at TIMESTAMP WITH TIME ZONE,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  push_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(appointment_id, confirmation_type)
);

-- Tabela para notificações in-app dos usuários
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'appointment', 'reminder', 'confirmation')),
  related_appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para preferências de notificação
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  email_appointments BOOLEAN NOT NULL DEFAULT true,
  email_reminders BOOLEAN NOT NULL DEFAULT true,
  email_marketing BOOLEAN NOT NULL DEFAULT false,
  push_appointments BOOLEAN NOT NULL DEFAULT true,
  push_reminders BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS para appointment_confirmations (apenas profissionais e tutores do agendamento)
CREATE POLICY "Users can view their appointment confirmations"
  ON public.appointment_confirmations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_confirmations.appointment_id
      AND (a.tutor_profile_id = public.get_profile_id(auth.uid()) 
           OR a.professional_profile_id = public.get_profile_id(auth.uid()))
    )
  );

-- RLS para user_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications
  FOR SELECT
  USING (profile_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications
  FOR UPDATE
  USING (profile_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Users can delete their own notifications"
  ON public.user_notifications
  FOR DELETE
  USING (profile_id = public.get_profile_id(auth.uid()));

-- RLS para notification_preferences
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (profile_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (profile_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (profile_id = public.get_profile_id(auth.uid()));

-- Índices para performance
CREATE INDEX idx_appointment_confirmations_appointment_id ON public.appointment_confirmations(appointment_id);
CREATE INDEX idx_appointment_confirmations_token ON public.appointment_confirmations(confirmation_token);
CREATE INDEX idx_user_notifications_profile_id ON public.user_notifications(profile_id);
CREATE INDEX idx_user_notifications_unread ON public.user_notifications(profile_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notification_preferences_profile_id ON public.notification_preferences(profile_id);

-- Trigger para updated_at em notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para obter agendamentos que precisam de confirmação (24h antes)
CREATE OR REPLACE FUNCTION public.get_appointments_needing_confirmation()
RETURNS TABLE (
  appointment_id UUID,
  tutor_name TEXT,
  tutor_email TEXT,
  professional_name TEXT,
  pet_name TEXT,
  service_name TEXT,
  appointment_date DATE,
  start_time TIME,
  end_time TIME,
  location_type TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    tp.full_name as tutor_name,
    tp.email as tutor_email,
    pp.full_name as professional_name,
    p.name as pet_name,
    s.name as service_name,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.location_type::TEXT
  FROM appointments a
  INNER JOIN profiles tp ON a.tutor_profile_id = tp.id
  INNER JOIN profiles pp ON a.professional_profile_id = pp.id
  LEFT JOIN pets p ON a.pet_id = p.id
  LEFT JOIN services s ON a.service_id = s.id
  WHERE a.status IN ('pending', 'confirmed')
    AND a.appointment_date = CURRENT_DATE + INTERVAL '1 day'
    AND NOT EXISTS (
      SELECT 1 FROM appointment_confirmations ac 
      WHERE ac.appointment_id = a.id 
      AND ac.confirmation_type = '24h'
      AND ac.email_sent_at IS NOT NULL
    );
END;
$$;

-- Função para obter agendamentos que precisam de lembrete (2h antes)
CREATE OR REPLACE FUNCTION public.get_appointments_needing_reminder()
RETURNS TABLE (
  appointment_id UUID,
  tutor_name TEXT,
  tutor_email TEXT,
  professional_name TEXT,
  pet_name TEXT,
  service_name TEXT,
  appointment_date DATE,
  start_time TIME,
  end_time TIME,
  location_type TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as appointment_id,
    tp.full_name as tutor_name,
    tp.email as tutor_email,
    pp.full_name as professional_name,
    p.name as pet_name,
    s.name as service_name,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.location_type::TEXT
  FROM appointments a
  INNER JOIN profiles tp ON a.tutor_profile_id = tp.id
  INNER JOIN profiles pp ON a.professional_profile_id = pp.id
  LEFT JOIN pets p ON a.pet_id = p.id
  LEFT JOIN services s ON a.service_id = s.id
  WHERE a.status = 'confirmed'
    AND a.appointment_date = CURRENT_DATE
    AND a.start_time BETWEEN (CURRENT_TIME + INTERVAL '2 hours') AND (CURRENT_TIME + INTERVAL '2 hours 30 minutes')
    AND NOT EXISTS (
      SELECT 1 FROM appointment_confirmations ac 
      WHERE ac.appointment_id = a.id 
      AND ac.confirmation_type = '2h'
      AND ac.email_sent_at IS NOT NULL
    );
END;
$$;