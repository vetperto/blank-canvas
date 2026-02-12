import { useState } from 'react';
import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, User, CheckCircle, XCircle, 
  AlertCircle, Phone, MessageSquare, MoreVertical, PawPrint, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { 
  useAppointments, 
  useUpdateAppointmentStatus,
  type AppointmentStatus,
  type ServiceLocationType
} from '@/hooks/useAppointments';
import { PetDetailDialog } from '@/components/scheduling/PetDetailDialog';

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  no_show: { label: 'Não compareceu', color: 'bg-gray-100 text-gray-800', icon: XCircle },
};

const locationLabels: Record<ServiceLocationType, string> = {
  clinic: 'Na clínica',
  home_visit: 'Domiciliar',
  both: 'Flexível',
};

interface AppointmentListProps {
  viewAs: 'tutor' | 'professional';
}

export function AppointmentList({ viewAs }: AppointmentListProps) {
  const { profile } = useAuth();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [petDetailOpen, setPetDetailOpen] = useState(false);
  const [selectedPetAppointment, setSelectedPetAppointment] = useState<any>(null);

  const { data: appointments, isLoading } = useAppointments({
    asTutor: viewAs === 'tutor',
    asProfessional: viewAs === 'professional',
  });

  const updateStatus = useUpdateAppointmentStatus();
  
  const handleViewPet = (appointment: any) => {
    setSelectedPetAppointment(appointment);
    setPetDetailOpen(true);
  };

  const handleConfirm = (appointmentId: string) => {
    updateStatus.mutate({ appointmentId, status: 'confirmed' });
  };

  const handleCancel = () => {
    if (!selectedAppointment) return;
    updateStatus.mutate({ 
      appointmentId: selectedAppointment.id, 
      status: 'cancelled',
      notes: cancelReason,
    });
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
    setCancelReason('');
  };

  const handleComplete = (appointmentId: string) => {
    updateStatus.mutate({ appointmentId, status: 'completed' });
  };

  const handleNoShow = (appointmentId: string) => {
    updateStatus.mutate({ appointmentId, status: 'no_show' });
  };

  const upcomingAppointments = appointments?.filter(
    (apt: any) => 
      ['pending', 'confirmed'].includes(apt.status) &&
      (isToday(parseISO(apt.appointment_date)) || isAfter(parseISO(apt.appointment_date), new Date()))
  ) || [];

  const pastAppointments = appointments?.filter(
    (apt: any) => 
      ['completed', 'cancelled', 'no_show'].includes(apt.status) ||
      isBefore(parseISO(apt.appointment_date), new Date())
  ) || [];

  const renderAppointmentCard = (appointment: any) => {
    const status = statusConfig[appointment.status as AppointmentStatus];
    const StatusIcon = status.icon;
    const otherPerson = viewAs === 'tutor' ? appointment.professional : appointment.tutor;
    const isPending = appointment.status === 'pending';
    const isConfirmed = appointment.status === 'confirmed';
    const appointmentDate = parseISO(appointment.appointment_date);
    const isPast = isBefore(appointmentDate, new Date()) && !isToday(appointmentDate);

    return (
      <motion.div
        key={appointment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={otherPerson?.profile_picture_url} />
              <AvatarFallback>
                {otherPerson?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">
                  {otherPerson?.full_name || 'Usuário'}
                </h4>
                <Badge className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              {appointment.service && (
                <p className="text-sm text-muted-foreground mb-2">
                  {appointment.service.name}
                </p>
              )}

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(appointmentDate, "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {appointment.start_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {locationLabels[appointment.location_type as ServiceLocationType]}
                </span>
              </div>

              {appointment.tutor_notes && (
                <p className="mt-2 text-sm bg-muted p-2 rounded">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  {appointment.tutor_notes}
                </p>
              )}

              {appointment.pet && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    <PawPrint className="w-4 h-4 text-primary" />
                    <strong>Pet:</strong> {appointment.pet.name}
                    {appointment.pet.species && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {appointment.pet.species}
                      </Badge>
                    )}
                  </div>
                  {viewAs === 'professional' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleViewPet(appointment)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver ficha
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {/* Professional actions for pending appointments */}
            {viewAs === 'professional' && isPending && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleConfirm(appointment.id)}
                  className="bg-gradient-primary"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setCancelDialogOpen(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Recusar
                </Button>
              </>
            )}

            {/* Actions for confirmed appointments */}
            {isConfirmed && !isPast && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {otherPerson?.phone && (
                    <DropdownMenuItem asChild>
                      <a href={`tel:${otherPerson.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Ligar
                      </a>
                    </DropdownMenuItem>
                  )}
                  {viewAs === 'professional' && appointment.pet && (
                    <>
                      <DropdownMenuItem onClick={() => handleViewPet(appointment)}>
                        <PawPrint className="w-4 h-4 mr-2" />
                        Ver ficha do pet
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {viewAs === 'professional' && (
                    <>
                      <DropdownMenuItem onClick={() => handleComplete(appointment.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como concluído
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNoShow(appointment.id)}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Não compareceu
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setCancelDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Price if available */}
            {appointment.price && (
              <span className="text-sm font-semibold text-primary">
                R$ {Number(appointment.price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Carregando agendamentos...
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upcoming">
            Próximos ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Histórico ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {!upcomingAppointments.length ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum agendamento próximo
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(renderAppointmentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {!pastAppointments.length ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum agendamento no histórico
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map(renderAppointmentCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O outro participante será notificado do cancelamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo do cancelamento (opcional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar Cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pet Detail Dialog */}
      {selectedPetAppointment?.pet && (
        <PetDetailDialog
          petId={selectedPetAppointment.pet.id}
          tutorName={selectedPetAppointment.tutor?.full_name}
          serviceName={selectedPetAppointment.service?.name}
          appointmentDate={format(parseISO(selectedPetAppointment.appointment_date), "dd/MM/yyyy", { locale: ptBR })}
          appointmentTime={selectedPetAppointment.start_time?.slice(0, 5)}
          isOpen={petDetailOpen}
          onClose={() => {
            setPetDetailOpen(false);
            setSelectedPetAppointment(null);
          }}
        />
      )}
    </>
  );
}
