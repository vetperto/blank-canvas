import { motion } from 'framer-motion';
import { 
  Calendar, 
  PawPrint, 
  Clock, 
  Star,
  ArrowRight,
  Bell,
  Heart,
  Stethoscope
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TutorLayout } from '@/components/tutor/TutorLayout';
import { useAuth } from '@/hooks/useAuth';
import { usePets } from '@/hooks/usePets';
import { useAppointments } from '@/hooks/useAppointments';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TutorDashboard() {
  const { profile } = useAuth();
  const { pets } = usePets();
  const { data: appointments } = useAppointments({ asTutor: true });

  const upcomingAppointments = appointments
    ?.filter(a => a.status === 'confirmed' || a.status === 'pending')
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
    .slice(0, 3);

  const completedCount = appointments?.filter(a => a.status === 'completed').length || 0;
  const pendingCount = appointments?.filter(a => a.status === 'pending').length || 0;

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

  const stats = [
    {
      label: 'Pets Cadastrados',
      value: pets?.length || 0,
      icon: PawPrint,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Agendamentos Pendentes',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Consultas Realizadas',
      value: completedCount,
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Profissionais Favoritos',
      value: 0, // TODO: Implement favorites
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  const quickActions = [
    {
      label: 'Buscar Profissionais',
      href: '/buscar',
      icon: Stethoscope,
      description: 'Encontre veterinários e especialistas',
    },
    {
      label: 'Adicionar Pet',
      href: '/tutor/pets',
      icon: PawPrint,
      description: 'Cadastre um novo pet',
    },
    {
      label: 'Ver Agendamentos',
      href: '/tutor/agendamentos',
      icon: Calendar,
      description: 'Gerencie suas consultas',
    },
  ];

  return (
    <TutorLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Olá, {profile?.social_name || profile?.full_name?.split(' ')[0] || 'Tutor'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta ao VetPerto. Cuide dos seus pets com carinho.
          </p>
        </motion.div>
      </div>

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
        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Próximos Agendamentos
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-primary">
                <Link to="/tutor/agendamentos">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingAppointments && upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex flex-col items-center justify-center">
                        <span className="text-xs text-primary font-medium">
                          {getDateLabel(appointment.appointment_date)}
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {appointment.start_time?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {(appointment as any).services?.name || 'Consulta'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {(appointment as any).professional?.full_name || 'Profissional'}
                        </p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum agendamento próximo</p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to="/buscar">Buscar Profissionais</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
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
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted hover:border-primary/20 transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Notifications Preview */}
          <Card className="border-border/50 mt-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-secondary" />
                Notificações
              </CardTitle>
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                2 novas
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                  <div className="p-1.5 rounded-full bg-secondary/20">
                    <Star className="w-3 h-3 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">Avalie sua última consulta</p>
                    <p className="text-xs text-muted-foreground">há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="p-1.5 rounded-full bg-primary/20">
                    <Calendar className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground">Lembrete: Vacinação do Max</p>
                    <p className="text-xs text-muted-foreground">em 3 dias</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Pets Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              Meus Pets
            </CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-primary">
              <Link to="/tutor/pets">
                Gerenciar
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pets && pets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pets.slice(0, 4).map((pet) => (
                  <div
                    key={pet.id}
                    className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2 overflow-hidden">
                      {pet.photo_url ? (
                        <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <PawPrint className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    <p className="font-medium text-foreground text-center truncate w-full">
                      {pet.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {pet.species === 'cao' ? 'Cão' : pet.species === 'gato' ? 'Gato' : pet.species}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PawPrint className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum pet cadastrado</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link to="/tutor/pets">Adicionar Pet</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </TutorLayout>
  );
}
