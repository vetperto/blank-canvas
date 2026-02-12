import { useState } from 'react';
import { Eye, EyeOff, Link2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMultiProfile } from '@/hooks/useMultiProfile';

interface LinkAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cpf: string;
  existingEmail: string;
  requestedUserType: 'tutor' | 'profissional' | 'empresa';
  profileData: {
    full_name: string;
    email: string;
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
    cnpj?: string;
  };
  onSuccess: (profileId: string) => void;
  onCreateNew: () => void;
}

const userTypeLabels: Record<string, string> = {
  tutor: 'Tutor',
  profissional: 'Profissional',
  empresa: 'Empresa',
};

export function LinkAccountDialog({
  open,
  onOpenChange,
  cpf,
  existingEmail,
  requestedUserType,
  profileData,
  onSuccess,
  onCreateNew,
}: LinkAccountDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createAdditionalProfile } = useMultiProfile();

  // Mask email for privacy
  const maskedEmail = existingEmail
    ? existingEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  const handleLinkAccount = async () => {
    if (!password) {
      toast.error('Digite sua senha');
      return;
    }

    setIsLoading(true);
    try {
      // First, sign in with the existing account
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: existingEmail,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          toast.error('Senha incorreta');
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao autenticar');
        return;
      }

      // Create the new profile for this account
      const result = await createAdditionalProfile(authData.user.id, {
        user_type: requestedUserType,
        full_name: profileData.full_name,
        email: profileData.email,
        cpf: cpf,
        phone: profileData.phone,
        cep: profileData.cep,
        street: profileData.street,
        number: profileData.number,
        complement: profileData.complement,
        neighborhood: profileData.neighborhood,
        city: profileData.city,
        state: profileData.state,
        crmv: profileData.crmv,
        bio: profileData.bio,
        years_experience: profileData.years_experience,
        lgpd_accepted: profileData.lgpd_accepted,
        terms_accepted: profileData.terms_accepted,
        cnpj: profileData.cnpj,
      });

      if (result.success && result.profileId) {
        toast.success(`Perfil de ${userTypeLabels[requestedUserType]} vinculado à sua conta!`);
        onSuccess(result.profileId);
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Erro ao vincular perfil');
      }
    } catch (error: any) {
      console.error('Error linking account:', error);
      toast.error(error.message || 'Erro ao vincular conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            CPF já cadastrado
          </DialogTitle>
          <DialogDescription>
            Este CPF já está associado a uma conta VetPerto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              O CPF <strong>{cpf}</strong> já possui um cadastro associado ao email <strong>{maskedEmail}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Você pode vincular o perfil de <strong>{userTypeLabels[requestedUserType]}</strong> à conta existente ou criar uma conta nova com outro email.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-password">Senha da conta existente</Label>
              <div className="relative">
                <Input
                  id="link-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLinkAccount}
              className="w-full bg-gradient-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Vinculando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  Vincular à conta existente
                </span>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onCreateNew}
              className="w-full"
              disabled={isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Criar conta nova com outro email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
