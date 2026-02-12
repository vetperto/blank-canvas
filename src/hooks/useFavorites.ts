import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface FavoriteProfessional {
  id: string;
  professional_profile_id: string;
  created_at: string;
  professional: {
    id: string;
    full_name: string;
    social_name: string | null;
    profile_picture_url: string | null;
    bio: string | null;
    city: string | null;
    state: string | null;
    user_type: string;
    is_verified: boolean;
  };
}

export function useFavorites() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('favorite_professionals')
        .select(`
          id,
          professional_profile_id,
          created_at,
          professional:profiles!favorite_professionals_professional_profile_id_fkey (
            id,
            full_name,
            social_name,
            profile_picture_url,
            bio,
            city,
            state,
            user_type,
            is_verified
          )
        `)
        .eq('tutor_profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as FavoriteProfessional[];
    },
    enabled: !!profile?.id,
  });

  const addFavorite = useMutation({
    mutationFn: async (professionalProfileId: string) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('favorite_professionals')
        .insert({
          tutor_profile_id: profile.id,
          professional_profile_id: professionalProfileId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', profile?.id] });
      toast.success('Profissional adicionado aos favoritos');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.info('Este profissional já está nos seus favoritos');
      } else {
        toast.error('Erro ao adicionar favorito');
      }
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (professionalProfileId: string) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('favorite_professionals')
        .delete()
        .eq('tutor_profile_id', profile.id)
        .eq('professional_profile_id', professionalProfileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', profile?.id] });
      toast.success('Profissional removido dos favoritos');
    },
    onError: () => {
      toast.error('Erro ao remover favorito');
    },
  });

  const isFavorite = (professionalProfileId: string) => {
    return favorites.some(f => f.professional_profile_id === professionalProfileId);
  };

  const toggleFavorite = (professionalProfileId: string) => {
    if (isFavorite(professionalProfileId)) {
      removeFavorite.mutate(professionalProfileId);
    } else {
      addFavorite.mutate(professionalProfileId);
    }
  };

  return {
    favorites,
    isLoading,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    toggleFavorite,
    isFavorite,
    isAddingFavorite: addFavorite.isPending,
    isRemovingFavorite: removeFavorite.isPending,
  };
}
