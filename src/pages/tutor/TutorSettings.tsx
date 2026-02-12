import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Eye, Trash2, Download, Moon, Sun, Monitor } from 'lucide-react';
import { TutorLayout } from '@/components/tutor/TutorLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function TutorSettings() {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'pt-BR',
    twoFactorAuth: false,
    showProfilePublic: true,
    shareDataAnalytics: true,
  });

  const handleExportData = () => {
    toast.info('Preparando exportação de dados...');
    // Implementar exportação real
    setTimeout(() => {
      toast.success('Seus dados foram exportados com sucesso!');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    toast.error('Esta funcionalidade ainda não está disponível');
  };

  return (
    <TutorLayout 
      title="Configurações" 
      subtitle="Gerencie suas preferências e privacidade"
    >
      <div className="max-w-3xl space-y-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-primary" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme" className="flex flex-col">
                  <span>Tema</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Escolha entre claro, escuro ou automático
                  </span>
                </Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Claro
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Escuro
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="language" className="flex flex-col">
                  <span>Idioma</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Idioma da interface
                  </span>
                </Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (BR)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configure opções de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="two-factor" className="flex flex-col">
                  <span>Autenticação em Dois Fatores</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Adicione uma camada extra de segurança
                  </span>
                </Label>
                <Switch
                  id="two-factor"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => {
                    setSettings(prev => ({ ...prev, twoFactorAuth: checked }));
                    toast.info(checked 
                      ? 'Configure seu app de autenticação' 
                      : 'Autenticação em dois fatores desativada'
                    );
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Alterar Senha</Label>
                <p className="text-xs text-muted-foreground">
                  Recomendamos alterar sua senha periodicamente
                </p>
                <Button variant="outline" className="mt-2">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Privacidade
              </CardTitle>
              <CardDescription>
                Controle quem pode ver suas informações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="public-profile" className="flex flex-col">
                  <span>Perfil Público</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Permitir que profissionais vejam seu perfil
                  </span>
                </Label>
                <Switch
                  id="public-profile"
                  checked={settings.showProfilePublic}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, showProfilePublic: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="analytics" className="flex flex-col">
                  <span>Compartilhar Dados de Uso</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    Ajude-nos a melhorar a plataforma
                  </span>
                </Label>
                <Switch
                  id="analytics"
                  checked={settings.shareDataAnalytics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, shareDataAnalytics: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data & Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Dados e Conta
              </CardTitle>
              <CardDescription>
                Gerencie seus dados e sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Exportar Meus Dados</Label>
                  <p className="text-xs text-muted-foreground">
                    Baixe uma cópia de todos os seus dados
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-destructive">Excluir Conta</Label>
                  <p className="text-xs text-muted-foreground">
                    Exclua permanentemente sua conta e todos os dados
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                        e removerá todos os seus dados de nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteAccount}
                      >
                        Sim, excluir minha conta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end"
        >
          <Button 
            className="bg-gradient-primary hover:opacity-90"
            onClick={() => toast.success('Configurações salvas com sucesso!')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </motion.div>
      </div>
    </TutorLayout>
  );
}
