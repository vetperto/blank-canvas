import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppointments } from '@/hooks/useAppointments';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  completed: { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
  no_show: { label: 'Não Compareceu', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
};

const locationLabels: Record<string, string> = {
  clinic: 'Clínica',
  home: 'Domicílio',
  home_visit: 'Domicílio',
  online: 'Online',
  both: 'Clínica/Domicílio',
};

export function AppointmentHistory() {
  const { data: appointmentsData, isLoading } = useAppointments({ asTutor: true });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Filter only past appointments or completed/cancelled ones
  const historyAppointments = appointmentsData?.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'no_show';
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (historyAppointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum histórico disponível
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Seus agendamentos anteriores aparecerão aqui.
          </p>
          <Button asChild variant="outline">
            <Link to="/buscar">Agendar Consulta</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {historyAppointments.map((appointment, index) => {
        const status = statusConfig[appointment.status] || statusConfig.pending;
        const StatusIcon = status.icon;
        const professional = appointment.professional;
        
        return (
          <motion.div
            key={appointment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={professional?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(professional?.full_name || 'P')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                      <h4 className="font-medium text-foreground">
                        {professional?.full_name}
                      </h4>
                      {appointment.service && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.service.name}
                        </p>
                      )}
                    </div>
                    
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {appointment.start_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {locationLabels[appointment.location_type] || appointment.location_type}
                      </span>
                    </div>
                    
                    {appointment.pet && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Pet: <span className="font-medium text-foreground">{appointment.pet.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
