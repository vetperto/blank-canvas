import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Review {
  id: string;
  appointment_id: string | null;
  tutor_profile_id: string;
  professional_profile_id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  is_moderated: boolean;
  created_at: string;
  tutor?: {
    id: string;
    full_name: string;
    profile_picture_url: string | null;
  };
}

export interface ProfessionalRating {
  average_rating: number | null;
  total_reviews: number;
}

// Fetch reviews for a professional
export function useReviews(professionalProfileId?: string) {
  return useQuery({
    queryKey: ['reviews', professionalProfileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          tutor:profiles!reviews_tutor_profile_id_fkey(id, full_name, profile_picture_url)
        `)
        .eq('professional_profile_id', professionalProfileId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
    enabled: !!professionalProfileId,
  });
}

// Fetch rating stats for a professional
export function useProfessionalRating(professionalProfileId?: string) {
  return useQuery({
    queryKey: ['professional-rating', professionalProfileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_professional_rating', {
          _professional_profile_id: professionalProfileId,
        });

      if (error) throw error;
      return (data?.[0] || { average_rating: null, total_reviews: 0 }) as ProfessionalRating;
    },
    enabled: !!professionalProfileId,
  });
}

// Check if can review an appointment
export function useCanReview(appointmentId?: string) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['can-review', appointmentId, profile?.id],
    queryFn: async () => {
      if (!profile?.id || !appointmentId) return false;

      const { data, error } = await supabase
        .rpc('can_review_appointment', {
          _appointment_id: appointmentId,
          _tutor_profile_id: profile.id,
        });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!appointmentId && !!profile?.id,
  });
}

// Fetch pending reviews for a tutor (appointments without reviews)
export function usePendingReviews() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['pending-reviews', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          professional:profiles!appointments_professional_profile_id_fkey(id, full_name, profile_picture_url),
          service:services(name)
        `)
        .eq('tutor_profile_id', profile.id)
        .eq('status', 'completed')
        .is('review_id', null)
        .order('appointment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
}

// Create review
export function useCreateReview() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({
      appointmentId,
      professionalProfileId,
      rating,
      comment,
    }: {
      appointmentId?: string;
      professionalProfileId: string;
      rating: number;
      comment: string;
    }) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      // Validate comment length
      if (comment.length > 500) {
        throw new Error('Comentário deve ter no máximo 500 caracteres');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          appointment_id: appointmentId,
          tutor_profile_id: profile.id,
          professional_profile_id: professionalProfileId,
          rating,
          comment: comment || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Review created successfully - appointment link is handled by the review's appointment_id field

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['professional-rating'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Avaliação enviada! Será publicada após moderação.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao enviar avaliação');
    },
  });
}

// Fetch all reviews for admin moderation
export function useAllReviews(options?: { pendingOnly?: boolean }) {
  return useQuery({
    queryKey: ['all-reviews', options],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          tutor:profiles!reviews_tutor_profile_id_fkey(id, full_name, profile_picture_url),
          professional:profiles!reviews_professional_profile_id_fkey(id, full_name, profile_picture_url)
        `)
        .order('created_at', { ascending: false });

      if (options?.pendingOnly) {
        query = query.eq('is_moderated', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Moderate review (admin only)
export function useModerateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      approved,
      notes,
    }: {
      reviewId: string;
      approved: boolean;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update({
          is_approved: approved,
          is_moderated: true,
          moderated_at: new Date().toISOString(),
          moderation_notes: notes,
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['professional-rating'] });
      toast.success(variables.approved ? 'Avaliação aprovada!' : 'Avaliação rejeitada.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao moderar avaliação');
    },
  });
}
