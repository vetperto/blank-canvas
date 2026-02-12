import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  user_type: 'tutor' | 'profissional' | 'empresa';
  full_name: string;
  social_name: string | null;
  email: string;
  phone: string | null;
  cpf: string | null;
  cnpj: string | null;
  crmv: string | null;
  cep: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  years_experience: number | null;
  is_verified: boolean;
  lgpd_accepted: boolean;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profiles: Profile[];  // All profiles for this user
  loading: boolean;
  signUp: (email: string, password: string, profileData: Partial<Profile>) => Promise<{ userId: string; profileId: string } | undefined>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  fetchAllProfiles: () => Promise<Profile[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // Fetch all profiles for this user (supports multiple profiles per account)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setProfiles(data);
        // Set the first profile as the active one (can be changed with switchProfile)
        setProfile(data[0]);
      } else {
        setProfiles([]);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfiles([]);
      setProfile(null);
    }
  };

  const fetchAllProfiles = async (): Promise<Profile[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (data) {
        setProfiles(data);
        return data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
  };

  const switchProfile = async (profileId: string) => {
    const targetProfile = profiles.find(p => p.id === profileId);
    if (targetProfile) {
      setProfile(targetProfile);
      toast.success(`Alternado para perfil de ${targetProfile.user_type}`);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // INITIAL load
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          await fetchProfile(existingSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Listener for ONGOING auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setProfiles([]);
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, profileData: Partial<Profile>): Promise<{ userId: string; profileId: string } | undefined> => {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      // 2. Create profile
      const { data: profileData2, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email,
          full_name: profileData.full_name || '',
          user_type: profileData.user_type || 'tutor',
          social_name: profileData.social_name,
          phone: profileData.phone,
          cpf: profileData.cpf,
          cnpj: profileData.cnpj,
          crmv: profileData.crmv,
          cep: profileData.cep,
          street: profileData.street,
          number: profileData.number,
          complement: profileData.complement,
          neighborhood: profileData.neighborhood,
          city: profileData.city,
          state: profileData.state,
          bio: profileData.bio,
          years_experience: profileData.years_experience,
          lgpd_accepted: profileData.lgpd_accepted || false,
          terms_accepted: profileData.terms_accepted || false,
          lgpd_accepted_at: profileData.lgpd_accepted ? new Date().toISOString() : null,
          terms_accepted_at: profileData.terms_accepted ? new Date().toISOString() : null,
        })
        .select('id')
        .single();

      if (profileError) throw profileError;

      // 3. Record legal agreements
      await supabase.from('legal_agreements').insert([
        {
          user_id: authData.user.id,
          agreement_type: 'lgpd',
          accepted_at: new Date().toISOString(),
        },
        {
          user_id: authData.user.id,
          agreement_type: 'terms',
          accepted_at: new Date().toISOString(),
        },
      ]);

      toast.success('Conta criada com sucesso!');
      return { userId: authData.user.id, profileId: profileData2.id };
    } catch (error: any) {
      console.error('SignUp error:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('SignIn error:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // Ignore "session missing" errors - user is already logged out
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      setProfiles([]);
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('SignOut error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setSession(null);
      setProfile(null);
      setProfiles([]);
      toast.error(error.message || 'Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        profiles,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        switchProfile,
        fetchAllProfiles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
