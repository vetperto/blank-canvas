-- Enable realtime for lost_appointments table for live notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_appointments;