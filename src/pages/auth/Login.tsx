import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowLeft, User, Building2, Stethoscope, AlertCircle, Plus, Chrome } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useMultiProfile } from '@/hooks/useMultiProfile';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const userTypeConfig = {
  tutor: {
    title: 'Tutor',
    icon: User,
    description: 'Encontre os melhores profissionais para seu pet',
    color: 'primary',
  },
  profissional: {
    title: 'Profissional',
    icon: Stethoscope,
    description: 'Acesse sua conta e gerencie seus serviços',
    color: 'secondary',
  },
  empresa: {
    title: 'Empresa',
    icon: Building2,
    description: 'Gerencie sua clínica ou petshop',
    color: 'accent',
  },
};

const getRedirectPath = (userType: string | undefined, customRedirect?: string | null) => {
  // If there's a custom redirect URL, use it
  if (customRedirect) {
    return customRedirect;
  }
  
  switch (userType) {
    case 'tutor':
      return '/tutor';
    case 'profissional':
    case 'empresa':
      return '/profissional';
    default:
      return '/dashboard';
  }
};

export default function Login() {
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, profile, user } = useAuth();
  const { validateLoginForType, getUserProfileTypes } = useMultiProfile();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<string[]>([]);

  const userType = type as keyof typeof userTypeConfig || 'tutor';
  const config = userTypeConfig[userType] || userTypeConfig.tutor;
  const Icon = config.icon;
  
  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

  // Redirect after profile is loaded and validated
  useEffect(() => {
    if (loginSuccess && user && profile) {
      // Verify the profile matches the requested type
      if (profile.user_type === userType) {
        const redirectPath = getRedirectPath(profile.user_type, redirectUrl);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [loginSuccess, user, profile, navigate, redirectUrl, userType]);

  // Redirect if already logged in with matching profile
  useEffect(() => {
    if (user && profile && !loginSuccess) {
      if (profile.user_type === userType) {
        const redirectPath = getRedirectPath(profile.user_type, redirectUrl);
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, profile, navigate, loginSuccess, redirectUrl, userType]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setProfileError(null);
    setAvailableProfiles([]);
    
    try {
      // First, authenticate the user
      await signIn(data.email, data.password);
      
      // Get the current session to get the user ID
      const { data: sessionData } = await (await import('@/integrations/supabase/client')).supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        throw new Error('Falha ao obter sessão do usuário');
      }
      
      // Validate that the user has a profile of the requested type
      const validationResult = await validateLoginForType(userId, userType as 'tutor' | 'profissional' | 'empresa');
      
      if (!validationResult.valid) {
        // Get available profile types to show user
        const profiles = await getUserProfileTypes(userId);
        const profileTypeNames: Record<string, string> = {
          tutor: 'Tutor',
          profissional: 'Profissional',
          empresa: 'Empresa'
        };
        setAvailableProfiles(profiles.map(p => p.profile_type));
        setProfileError(validationResult.message);
        
        // Sign out since they can't access this profile type
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.auth.signOut();
        return;
      }
      
      setLoginSuccess(true);
    } catch (error: any) {
      // Error handled in useAuth hook, but we can add profile-specific handling
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchProfile = (profileType: string) => {
    navigate(`/login/${profileType}`, { replace: true });
    setProfileError(null);
    setAvailableProfiles([]);
    form.reset();
  };

  const handleCreateProfile = () => {
    navigate(`/cadastro/${userType}?link_account=true`, { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast.error('Erro ao fazer login com Google');
        console.error('Google sign-in error:', error);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o início
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <div className={`w-12 h-12 rounded-xl bg-${config.color}-light flex items-center justify-center`}>
                <Icon className={`w-6 h-6 text-${config.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Entrar como {config.title}</h1>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>

            {/* Profile Type Error Alert */}
            {profileError && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Perfil não encontrado</AlertTitle>
                <AlertDescription className="mt-2">
                  <p>{profileError}</p>
                  
                  {availableProfiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Entrar com outro perfil:</p>
                      <div className="flex flex-wrap gap-2">
                        {availableProfiles.map((profileType) => {
                          const profileNames: Record<string, string> = {
                            tutor: 'Tutor',
                            profissional: 'Profissional',
                            empresa: 'Empresa'
                          };
                          return (
                            <Button
                              key={profileType}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSwitchProfile(profileType)}
                            >
                              Entrar como {profileNames[profileType]}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={handleCreateProfile}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar perfil de {config.title}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <Link
                    to="/recuperar-senha"
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Entrar
                    </span>
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      ou continue com
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Entrar com Google
                </Button>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link
                to={`/cadastro/${userType}`}
                className="font-semibold text-primary hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-primary items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-white p-12"
        >
          <div className="text-8xl mb-6">🐾</div>
          <h2 className="text-3xl font-display font-bold mb-4">VetPerto</h2>
          <p className="text-lg opacity-90 max-w-md">
            A plataforma #1 de serviços pet do Brasil. Conectando tutores aos melhores profissionais.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
