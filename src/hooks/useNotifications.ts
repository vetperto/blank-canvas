import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UserNotification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'appointment' | 'reminder' | 'confirmation';
  related_appointment_id: string | null;
  action_url: string | null;
  action_label: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  profile_id: string;
  email_appointments: boolean;
  email_reminders: boolean;
  email_marketing: boolean;
  push_appointments: boolean;
  push_reminders: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['user-notifications', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserNotification[];
    },
    enabled: !!profile?.id,
  });
};

export const useUnreadNotificationsCount = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['unread-notifications-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      
      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!profile?.id,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', profile?.id] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!profile?.id) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('user_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('profile_id', profile.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', profile?.id] });
      toast.success('Todas as notificações foram marcadas como lidas');
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-notifications', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count', profile?.id] });
    },
  });
};

export const useNotificationPreferences = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['notification-preferences', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) throw error;
      return data as NotificationPreferences | null;
    },
    enabled: !!profile?.id,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      // Try to update first, if nothing was updated, insert
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('notification_preferences')
          .update(preferences)
          .eq('profile_id', profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({ profile_id: profile.id, ...preferences });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', profile?.id] });
      toast.success('Preferências de notificação atualizadas');
    },
    onError: () => {
      toast.error('Erro ao atualizar preferências');
    },
  });
};
