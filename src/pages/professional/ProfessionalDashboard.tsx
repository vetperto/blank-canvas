import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Users,
  Star,
  ArrowRight,
  Bell,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { CreditStatusCard } from '@/components/credits/CreditStatusCard';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useSubscription } from '@/hooks/useSubscription';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ProfessionalDashboard() {
  const { profile } = useAuth();
  const { data: appointments } = useAppointments({ asProfessional: true });
  const { subscriptionStatus, isLoading: loadingPlan } = useSubscription();
  const planLimits = subscriptionStatus.appointmentLimits;

  const pendingAppointments = appointments?.filter(a => a.status === 'pending') || [];
  const confirmedAppointments = appointments?.filter(a => a.status === 'confirmed') || [];
  const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;

  const todayAppointments = appointments?.filter(a => {
    return isToday(parseISO(a.appointment_date)) && 
           (a.status === 'confirmed' || a.status === 'pending');
  }) || [];

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "dd 'de' MMM", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Pendente</Badge>;
      default:
        return null;
    }
  };

  const appointmentLimit = planLimits?.monthlyLimit || 0;
  const usedAppointments = planLimits?.currentCount || 0;
  const usagePercentage = appointmentLimit ? (usedAppointments / appointmentLimit) * 100 : 0;

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: todayAppointments.length,
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Aguardando Confirmação',
      value: pendingAppointments.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Confirmados',
      value: confirmedAppointments.length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Realizados',
      value: completedCount,
      icon: TrendingUp,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  const quickActions = [
    {
      label: 'Gerenciar Disponibilidade',
      href: '/profissional/disponibilidade',
      icon: Clock,
      description: 'Configure seus horários',
    },
    {
      label: 'Gerenciar Serviços',
      href: '/profissional/servicos',
      icon: Briefcase,
      description: 'Adicione ou edite serviços',
    },
    {
      label: 'Ver Avaliações',
      href: '/profissional/avaliacoes',
      icon: Star,
      description: 'Feedback dos clientes',
    },
  ];

  return (
    <ProfessionalLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Olá, {profile?.social_name || profile?.full_name?.split(' ')[0] || 'Profissional'}! 👋
            </h1>
            {!profile?.is_verified && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                Verificação pendente
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Gerencie sua agenda e atendimentos no VetPerto.
          </p>
        </motion.div>
      </div>

      {/* Credit Status Card - New Credit System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <CreditStatusCard />
      </motion.div>

      {/* Plan Usage Card */}
      {!loadingPlan && planLimits && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className={cn(
            "border-border/50",
            usagePercentage >= 90 && "border-yellow-500/50 bg-yellow-500/5"
          )}>
            <CardContent className="p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      Plano: {planLimits?.planName || 'Sem Plano'}
                    </h3>
                    {usagePercentage >= 90 && (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {appointmentLimit === null 
                      ? 'Agendamentos ilimitados' 
                      : `${usedAppointments} de ${appointmentLimit} agendamentos usados este mês`
                    }
                  </p>
                  {appointmentLimit !== null && (
                    <Progress 
                      value={usagePercentage} 
                      className="h-2"
                    />
                  )}
                </div>
                <Button asChild variant="outline">
                  <Link to="/planos">Upgrade de Plano</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-border/50 hover:shadow-soft transition-shadow">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl lg:text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs lg:text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Aguardando Confirmação
                {pendingAppointments.length > 0 && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                    {pendingAppointments.length}
                  </Badge>
                )}
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-secondary">
                <Link to="/profissional/agendamentos">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pendingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {pendingAppointments.slice(0, 4).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 hover:bg-yellow-500/10 transition-colors"
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-yellow-500/10 flex flex-col items-center justify-center">
                        <span className="text-xs text-yellow-600 font-medium">
                          {getDateLabel(appointment.appointment_date)}
                        </span>
                        <span className="text-lg font-bold text-yellow-600">
                          {appointment.start_time?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {(appointment as any).tutor?.full_name || 'Tutor'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {(appointment as any).service?.name || 'Consulta'} 
                          {(appointment as any).pet?.name && ` • ${(appointment as any).pet.name}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          Recusar
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum agendamento pendente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card className="border-border/50 mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                Agenda de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length > 0 ? (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-secondary/10 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-secondary">
                          {appointment.start_time?.slice(0, 5)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {appointment.end_time?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {(appointment as any).tutor?.full_name || 'Tutor'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {(appointment as any).service?.name || 'Consulta'}
                          {(appointment as any).pet?.name && ` • ${(appointment as any).pet.name}`}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum agendamento para hoje</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    to={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-secondary/20 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                      <Icon className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Notifications Preview */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificações
              </CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                3 novas
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                  <div className="p-1.5 rounded-full bg-yellow-500/20">
                    <Clock className="w-3 h-3 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">Novo agendamento pendente</p>
                    <p className="text-xs text-muted-foreground">há 15 minutos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="p-1.5 rounded-full bg-green-500/20">
                    <Star className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">Nova avaliação recebida</p>
                    <p className="text-xs text-muted-foreground">há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="p-1.5 rounded-full bg-primary/20">
                    <Users className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">Novo cliente interessado</p>
                    <p className="text-xs text-muted-foreground">há 5 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Summary */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Sua Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-foreground">4.8</div>
                <div className="flex-1">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-5 h-5",
                          star <= 4 ? "text-yellow-500 fill-yellow-500" : "text-yellow-500/50"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Baseado em {completedCount} avaliações
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProfessionalLayout>
  );
}
