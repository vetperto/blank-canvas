import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell,
  Shield,
  CreditCard,
  Moon,
  Sun,
  Loader2,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

export default function ProfessionalSettings() {
  const { planLimits, isLoading: planLoading } = usePlanLimits();
  const { openCustomerPortal, isLoading: portalLoading } = useSubscription();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  if (planLoading) {
    return (
      <ProfessionalLayout title="Configurações" subtitle="Preferências da sua conta">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </ProfessionalLayout>
    );
  }

  return (
    <ProfessionalLayout title="Configurações" subtitle="Preferências da sua conta">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Plan Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-secondary/30 bg-gradient-to-r from-secondary/5 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-secondary" />
                Seu Plano
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura e benefícios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{planLimits?.planName || 'Sem Plano'}</h3>
                    {planLimits?.isSubscribed && (
                      <Badge className="bg-green-500 text-white">Ativo</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {planLimits?.hasVerifiedBadge && (
                      <Badge variant="outline" className="text-xs">Selo Verificado</Badge>
                    )}
                    {planLimits?.hasPriceTable && (
                      <Badge variant="outline" className="text-xs">Tabela de Preços</Badge>
                    )}
                    {planLimits?.hasPortfolio && (
                      <Badge variant="outline" className="text-xs">Portfólio</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {planLimits?.monthlyAppointmentsLimit 
                        ? `${planLimits.monthlyAppointmentsLimit} agendamentos/mês`
                        : 'Agendamentos ilimitados'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to="/planos">
                    <Button variant="outline">
                      Alterar Plano
                    </Button>
                  </Link>
                  <Button 
                    onClick={openCustomerPortal}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Gerenciar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
        </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-secondary" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como deseja receber alertas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por email</p>
                  <p className="text-sm text-muted-foreground">
                    Receba emails sobre agendamentos e atualizações
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações push</p>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas em tempo real no navegador
                  </p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {darkMode ? <Moon className="w-5 h-5 text-secondary" /> : <Sun className="w-5 h-5 text-secondary" />}
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Modo escuro</p>
                  <p className="text-sm text-muted-foreground">
                    Ative o tema escuro para reduzir o cansaço visual
                  </p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                Segurança
              </CardTitle>
              <CardDescription>
                Configurações de segurança da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alterar senha</p>
                  <p className="text-sm text-muted-foreground">
                    Atualize sua senha de acesso
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">Excluir conta</p>
                  <p className="text-sm text-muted-foreground">
                    Remova permanentemente sua conta e dados
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProfessionalLayout>
  );
}
