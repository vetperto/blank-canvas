import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type ServiceLocationType = 'clinic' | 'home_visit' | 'both';
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface Service {
  id: string;
  profile_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number | null;
  location_type: ServiceLocationType;
  is_active: boolean;
}

export interface Availability {
  id: string;
  profile_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  location_type: ServiceLocationType;
  is_available_for_shift: boolean;
  slot_duration_minutes: number;
}

export interface Appointment {
  id: string;
  tutor_profile_id: string;
  professional_profile_id: string;
  service_id: string | null;
  pet_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  location_type: ServiceLocationType;
  location_address: string | null;
  status: AppointmentStatus;
  tutor_notes: string | null;
  professional_notes: string | null;
  price: number | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
}

export interface TimeSlot {
  slot_start: string;
  slot_end: string;
  location_type: ServiceLocationType;
}

const dayMap: Record<string, DayOfWeek> = {
  'Domingo': 'sunday',
  'Segunda': 'monday',
  'Terça': 'tuesday',
  'Quarta': 'wednesday',
  'Quinta': 'thursday',
  'Sexta': 'friday',
  'Sábado': 'saturday',
};

const dayMapReverse: Record<DayOfWeek, string> = {
  'sunday': 'Domingo',
  'monday': 'Segunda',
  'tuesday': 'Terça',
  'wednesday': 'Quarta',
  'thursday': 'Quinta',
  'friday': 'Sexta',
  'saturday': 'Sábado',
};

export const getDayLabel = (day: DayOfWeek) => dayMapReverse[day];
export const getDayValue = (label: string) => dayMap[label];

// Fetch services for a professional
export function useServices(profileId?: string) {
  return useQuery({
    queryKey: ['services', profileId],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select('*')
        .eq('is_active', true);
      
      if (profileId) {
        query = query.eq('profile_id', profileId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Service[];
    },
    enabled: !!profileId,
  });
}

// Fetch availability for a professional
export function useAvailability(profileId?: string) {
  return useQuery({
    queryKey: ['availability', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('profile_id', profileId);

      if (error) throw error;
      return data as Availability[];
    },
    enabled: !!profileId,
  });
}

// Fetch available time slots for a professional on a specific date
export function useAvailableSlots(profileId: string, date: string, durationMinutes: number = 30) {
  return useQuery({
    queryKey: ['available-slots', profileId, date, durationMinutes],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          _professional_profile_id: profileId,
          _date: date,
          _duration_minutes: durationMinutes,
        });

      if (error) throw error;
      return data as TimeSlot[];
    },
    enabled: !!profileId && !!date,
  });
}

// Fetch appointments
export function useAppointments(options?: { 
  asTutor?: boolean; 
  asProfessional?: boolean;
  status?: AppointmentStatus[];
}) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['appointments', profile?.id, options],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          tutor:profiles!appointments_tutor_profile_id_fkey(id, full_name, profile_picture_url, phone),
          professional:profiles!appointments_professional_profile_id_fkey(id, full_name, profile_picture_url, phone),
          service:services(id, name, duration_minutes, price),
          pet:pets(id, name, species)
        `)
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (options?.asTutor && profile?.id) {
        query = query.eq('tutor_profile_id', profile.id);
      }

      if (options?.asProfessional && profile?.id) {
        query = query.eq('professional_profile_id', profile.id);
      }

      if (options?.status && options.status.length > 0) {
        query = query.in('status', options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
}

// Create appointment via secure RPC (no direct inserts allowed)
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (appointment: {
      professional_profile_id: string;
      service_id?: string;
      pet_id?: string;
      appointment_date: string;
      start_time: string;
      end_time: string;
      location_type: ServiceLocationType;
      location_address?: string;
      tutor_notes?: string;
      price?: number;
    }) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');
      
      if (!appointment.pet_id) {
        throw new Error('É obrigatório selecionar um pet para o agendamento');
      }

      const { data, error } = await supabase.rpc('create_appointment_secure', {
        p_professional_id: appointment.professional_profile_id,
        p_tutor_id: profile.id,
        p_service_id: appointment.service_id || null,
        p_pet_id: appointment.pet_id,
        p_date: appointment.appointment_date,
        p_start_time: appointment.start_time,
        p_end_time: appointment.end_time,
        p_location_type: appointment.location_type,
        p_location_address: appointment.location_address || null,
        p_tutor_notes: appointment.tutor_notes || null,
        p_price: appointment.price || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      toast.success('Agendamento solicitado! Aguarde a confirmação do profissional.');
    },
    onError: (error: any) => {
      const msg = error?.message || '';
      if (msg.includes('NO_CREDITS_AVAILABLE') || msg.includes('Profissional sem créditos')) {
        toast.error('Profissional temporariamente indisponível', {
          description: 'Este profissional não pode receber novos agendamentos no momento.',
        });
      } else if (msg.includes('Profissional não está ativo')) {
        toast.error('Profissional indisponível', {
          description: 'Este profissional não está ativo no momento.',
        });
      } else {
        toast.error(msg || 'Erro ao criar agendamento');
      }
    },
  });
}

// Update appointment status
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      appointmentId, 
      status, 
      notes 
    }: { 
      appointmentId: string; 
      status: AppointmentStatus;
      notes?: string;
    }) => {
      const updateData: Record<string, any> = { status };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        if (notes) updateData.cancellation_reason = notes;
      }

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['available-slots'] });
      
      const messages: Record<AppointmentStatus, string> = {
        confirmed: 'Agendamento confirmado!',
        cancelled: 'Agendamento cancelado.',
        completed: 'Atendimento concluído!',
        no_show: 'Marcado como não compareceu.',
        pending: 'Status atualizado.',
      };
      
      toast.success(messages[variables.status]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar agendamento');
    },
  });
}

// Manage availability
export function useManageAvailability() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const addAvailability = useMutation({
    mutationFn: async (availability: Omit<Availability, 'id' | 'profile_id'>) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('availability')
        .insert({
          ...availability,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.success('Disponibilidade adicionada!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar disponibilidade');
    },
  });

  const removeAvailability = useMutation({
    mutationFn: async (availabilityId: string) => {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', availabilityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      toast.success('Disponibilidade removida!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover disponibilidade');
    },
  });

  return { addAvailability, removeAvailability };
}

// Manage services
export function useManageServices() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const addService = useMutation({
    mutationFn: async (service: Omit<Service, 'id' | 'profile_id' | 'is_active'>) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('services')
        .insert({
          ...service,
          profile_id: profile.id,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço adicionado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao adicionar serviço');
    },
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...service }: Partial<Service> & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(service)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço atualizado!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar serviço');
    },
  });

  const deleteService = useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Serviço removido!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover serviço');
    },
  });

  return { addService, updateService, deleteService };
}
