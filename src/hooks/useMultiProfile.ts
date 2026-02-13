import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileType {
  profile_id: string;
  profile_type: 'tutor' | 'profissional' | 'empresa' | 'professional';
  full_name: string;
  is_verified: boolean;
}

interface CpfCheckResult {
  exists_for_type: boolean;
  existing_user_id: string | null;
  existing_email: string | null;
}

interface ProfileByType {
  id: string;
  user_id: string;
  user_type: 'tutor' | 'profissional' | 'empresa' | 'professional';
  full_name: string;
  social_name: string | null;
  email: string;
  phone: string | null;
  cpf: string | null;
  cnpj: string | null;
  crmv: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  is_verified: boolean;
  city: string | null;
  state: string | null;
}

export function useMultiProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verifica se um CPF já está cadastrado para um tipo específico de perfil
   */
  const checkCpfForType = useCallback(async (
    cpf: string, 
    userType: 'tutor' | 'profissional' | 'empresa'
  ): Promise<CpfCheckResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase
        .rpc('check_cpf_exists_for_type', {
          _cpf: cpf,
          _user_type: userType
        });

      if (rpcError) throw rpcError;
      
      return data?.[0] || null;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao verificar CPF:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Busca um perfil específico por tipo de usuário
   */
  const getProfileByType = useCallback(async (
    userId: string,
    userType: 'tutor' | 'profissional' | 'empresa'
  ): Promise<ProfileByType | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_profile_by_type', {
          _user_id: userId,
          _user_type: userType
        });

      if (rpcError) throw rpcError;
      
      return data?.[0] || null;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar perfil:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Lista todos os tipos de perfil de um usuário
   */
  const getUserProfileTypes = useCallback(async (
    userId: string
  ): Promise<ProfileType[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: rpcError } = await supabase
        .rpc('get_user_profile_types', {
          _user_id: userId
        });

      if (rpcError) throw rpcError;
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao listar perfis:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verifica se o usuário tem um perfil do tipo especificado
   */
  const hasProfileType = useCallback(async (
    userId: string,
    userType: 'tutor' | 'profissional' | 'empresa'
  ): Promise<boolean> => {
    const profile = await getProfileByType(userId, userType);
    return profile !== null;
  }, [getProfileByType]);

  /**
   * Valida login verificando se o usuário tem perfil do tipo selecionado
   */
  const validateLoginForType = useCallback(async (
    userId: string,
    requestedType: 'tutor' | 'profissional' | 'empresa'
  ): Promise<{ valid: boolean; profile: ProfileByType | null; message: string }> => {
    const profile = await getProfileByType(userId, requestedType);
    
    if (!profile) {
      // Verificar se o usuário tem outros perfis
      const allProfiles = await getUserProfileTypes(userId);
      
      if (allProfiles.length === 0) {
        return {
          valid: false,
          profile: null,
          message: 'Nenhum perfil encontrado para este usuário.'
        };
      }
      
      const profileTypeNames: Record<string, string> = {
        tutor: 'Tutor',
        profissional: 'Profissional',
        empresa: 'Empresa'
      };
      
      const existingTypes = allProfiles.map(p => profileTypeNames[p.profile_type]).join(', ');
      
      return {
        valid: false,
        profile: null,
        message: `Você não possui perfil como ${profileTypeNames[requestedType]}. Perfis disponíveis: ${existingTypes}.`
      };
    }
    
    return {
      valid: true,
      profile,
      message: 'Login válido'
    };
  }, [getProfileByType, getUserProfileTypes]);

  /**
   * Cria um novo perfil para uma conta existente
   */
  const createAdditionalProfile = useCallback(async (
    userId: string,
    profileData: {
      user_type: 'tutor' | 'profissional' | 'empresa';
      full_name: string;
      email: string;
      cpf?: string;
      cnpj?: string;
      phone?: string;
      cep?: string;
      street?: string;
      number?: string;
      complement?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      crmv?: string;
      bio?: string;
      years_experience?: number;
      lgpd_accepted?: boolean;
      terms_accepted?: boolean;
    }
  ): Promise<{ success: boolean; profileId?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se já existe perfil deste tipo
      const existingProfile = await getProfileByType(userId, profileData.user_type);
      
      if (existingProfile) {
        return {
          success: false,
          error: `Você já possui um perfil como ${profileData.user_type}.`
        };
      }
      
      // Separate professional-specific fields from profile fields
      const { crmv, ...profileFields } = profileData;
      
      // Criar novo perfil
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          ...profileFields,
          lgpd_accepted_at: profileData.lgpd_accepted ? new Date().toISOString() : null,
          terms_accepted_at: profileData.terms_accepted ? new Date().toISOString() : null,
        })
        .select('id')
        .single();
      
      if (insertError) throw insertError;
      
      // If professional, insert into professionals table
      if (profileData.user_type === 'profissional' && crmv && data) {
        await supabase.from('professionals').insert({
          id: data.id,
          crmv: crmv ?? null,
        });
      }
      
      toast.success(`Perfil de ${profileData.user_type} criado com sucesso!`);
      
      return {
        success: true,
        profileId: data.id
      };
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao criar perfil adicional:', err);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setIsLoading(false);
    }
  }, [getProfileByType]);

  return {
    isLoading,
    error,
    checkCpfForType,
    getProfileByType,
    getUserProfileTypes,
    hasProfileType,
    validateLoginForType,
    createAdditionalProfile,
  };
}
