import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfessionalCredits } from '@/hooks/useProfessionalCredits';

export function LostClientNotificationListener() {
  const { profile } = useAuth();
  const { refetch } = useProfessionalCredits();

  useEffect(() => {
    if (!profile?.id || (profile.user_type !== 'profissional' && profile.user_type !== 'empresa')) {
      return;
    }

    // Subscribe to lost_appointments insertions for this professional
    const channel = supabase
      .channel('lost-appointments-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lost_appointments',
          filter: `professional_profile_id=eq.${profile.id}`,
        },
        (payload) => {
          // Show notification when a lost appointment is recorded
          toast.error('❌ Você perdeu um novo cliente', {
            description: 'Um tutor tentou agendar um atendimento, mas seus créditos acabaram. Recarregue agora para não perder mais clientes.',
            duration: 10000,
            action: {
              label: 'Recarregar',
              onClick: () => {
                window.location.href = '/planos';
              },
            },
          });

          // Send email notification
          supabase.functions.invoke('send-credit-notification', {
            body: {
              professionalProfileId: profile.id,
              type: 'lost_client',
            }
          }).catch(console.error);
          
          // Refetch credit stats
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, profile?.user_type, refetch]);

  return null;
}
