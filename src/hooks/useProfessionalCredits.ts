import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';

export interface CreditStats {
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
  status: 'active' | 'low_credits' | 'exhausted';
  confirmed_appointments: number;
  lost_clients: number;
}

export interface CreditCheck {
  has_credits: boolean;
  remaining: number;
  status: string;
}

export function useProfessionalCredits() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const previousStatusRef = useRef<string | null>(null);

  const { data: creditStats, isLoading, refetch } = useQuery({
    queryKey: ['professional-credits', profile?.id],
    queryFn: async (): Promise<CreditStats | null> => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .rpc('get_professional_credit_stats', {
          p_professional_profile_id: profile.id
        });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          total_credits: data[0].total_credits,
          used_credits: data[0].used_credits,
          remaining_credits: data[0].remaining_credits,
          status: data[0].status as CreditStats['status'],
          confirmed_appointments: Number(data[0].confirmed_appointments),
          lost_clients: Number(data[0].lost_clients),
        };
      }
      
      return {
        total_credits: 0,
        used_credits: 0,
        remaining_credits: 0,
        status: 'exhausted',
        confirmed_appointments: 0,
        lost_clients: 0,
      };
    },
    enabled: !!profile?.id && (profile.user_type === 'profissional' || profile.user_type === 'empresa'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Send notification when credit status changes to low or exhausted
  useEffect(() => {
    if (!creditStats || !profile?.id) return;

    const currentStatus = creditStats.status;
    const previousStatus = previousStatusRef.current;

    // Only send notification if status changed
    if (previousStatus !== null && previousStatus !== currentStatus) {
      if (currentStatus === 'low_credits' || currentStatus === 'exhausted') {
        // Send email notification
        supabase.functions.invoke('send-credit-notification', {
          body: {
            professionalProfileId: profile.id,
            type: currentStatus === 'low_credits' ? 'low_credits' : 'exhausted',
            remainingCredits: creditStats.remaining_credits,
          }
        }).catch(console.error);
      } else if (currentStatus === 'active' && (previousStatus === 'low_credits' || previousStatus === 'exhausted')) {
        // Credits were reactivated
        supabase.functions.invoke('send-credit-notification', {
          body: {
            professionalProfileId: profile.id,
            type: 'credits_reactivated',
          }
        }).catch(console.error);
      }
    }

    previousStatusRef.current = currentStatus;
  }, [creditStats?.status, profile?.id]);

  return {
    creditStats,
    isLoading,
    refetch,
    hasCredits: (creditStats?.remaining_credits ?? 0) > 0,
    isLowCredits: creditStats?.status === 'low_credits',
    isExhausted: creditStats?.status === 'exhausted',
  };
}

export function useCheckProfessionalCredits(professionalId: string | undefined) {
  return useQuery({
    queryKey: ['check-credits', professionalId],
    queryFn: async (): Promise<CreditCheck> => {
      if (!professionalId) {
        return { has_credits: false, remaining: 0, status: 'exhausted' };
      }

      const { data, error } = await supabase
        .rpc('check_professional_credits', {
          p_professional_profile_id: professionalId
        });

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          has_credits: data[0].has_credits,
          remaining: data[0].remaining,
          status: data[0].status,
        };
      }
      
      return { has_credits: false, remaining: 0, status: 'exhausted' };
    },
    enabled: !!professionalId,
    staleTime: 10000, // Cache for 10 seconds
  });
}

// useRecordLostAppointment REMOVED — lost_appointments are now created by backend triggers only
