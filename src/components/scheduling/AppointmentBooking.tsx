import { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  useServices, 
  useAvailableSlots, 
  useCreateAppointment,
  type Service,
  type TimeSlot,
  type ServiceLocationType 
} from '@/hooks/useAppointments';
import { useCalendarAvailability } from '@/hooks/useCalendarAvailability';
import { useCheckProfessionalCredits, useRecordLostAppointment } from '@/hooks/useProfessionalCredits';
import { AnnualCalendar } from './AnnualCalendar';
import { PetSelectionCard } from '@/components/pets/PetSelectionCard';
import { CreditExhaustedMessage } from '@/components/credits/CreditExhaustedMessage';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface AppointmentBookingProps {
  professionalId: string;
  professionalName: string;
  isOpen: boolean;
  onClose: () => void;
}

const locationLabels: Record<ServiceLocationType, string> = {
  clinic: 'Na clínica',
  home_visit: 'Atendimento domiciliar',
  both: 'Flexível',
};

export function AppointmentBooking({ 
  professionalId, 
  professionalName,
  isOpen, 
  onClose 
}: AppointmentBookingProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [locationType, setLocationType] = useState<ServiceLocationType>('clinic');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [petError, setPetError] = useState(false);

  const { data: services } = useServices(professionalId);
  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    professionalId,
    selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    selectedService?.duration_minutes || 30
  );
  const { data: dateStatuses, isLoading: isLoadingCalendar } = useCalendarAvailability(
    professionalId,
    startOfMonth(new Date()),
    6 // 6 months ahead
  );
  const createAppointment = useCreateAppointment();
  
  // Credit system checks
  const { data: creditCheck, isLoading: checkingCredits } = useCheckProfessionalCredits(professionalId);
  const recordLostAppointment = useRecordLostAppointment();

  // Fetch tutor's pets
  const { data: pets } = useQuery({
    queryKey: ['pets', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('profile_id', profile?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const resetBooking = () => {
    setStep(1);
    setSelectedDate(undefined);
    setSelectedService(null);
    setSelectedSlot(null);
    setSelectedPetId('');
    setLocationType('clinic');
    setAddress('');
    setNotes('');
    setPetError(false);
  };

  const handleClose = () => {
    resetBooking();
    onClose();
  };

  const handleBooking = async () => {
    // Check if professional has credits before attempting to book
    if (!creditCheck?.has_credits) {
      // Record this as a lost appointment
      if (profile?.id) {
        try {
          await recordLostAppointment.mutateAsync({
            professionalProfileId: professionalId,
            tutorProfileId: profile.id,
            serviceId: selectedService?.id,
          });
        } catch (err) {
          console.error('Error recording lost appointment:', err);
        }
      }
      toast.error('Este profissional está temporariamente indisponível para novos agendamentos.');
      return;
    }

    // Validate pet selection
    if (!selectedPetId) {
      setPetError(true);
      toast.error('Por favor, selecione um pet para continuar');
      return;
    }

    if (!selectedDate || !selectedSlot || !profile?.id) return;

    try {
      const result = await createAppointment.mutateAsync({
        professional_profile_id: professionalId,
        service_id: selectedService?.id,
        pet_id: selectedPetId,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedSlot.slot_start,
        end_time: selectedSlot.slot_end,
        location_type: locationType,
        location_address: locationType === 'home_visit' ? address : undefined,
        tutor_notes: notes || undefined,
        price: selectedService?.price || undefined,
      });

      // Send notification to professional
      if (result?.id) {
        try {
          await supabase.functions.invoke('notify-professional-appointment', {
            body: { appointmentId: result.id }
          });
        } catch (notifError) {
          console.error('Error sending notification:', notifError);
          // Don't fail the booking if notification fails
        }
      }

      handleClose();
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const renderStep1 = () => {
    // Check if professional has no credits
    if (!checkingCredits && creditCheck && !creditCheck.has_credits) {
      return (
        <div className="space-y-4">
          <CreditExhaustedMessage />
          <Button variant="outline" onClick={handleClose} className="w-full">
            Voltar e escolher outro profissional
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Selecione o serviço</Label>
          <div className="grid gap-2">
            {services?.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg border transition-all text-left',
                  selectedService?.id === service.id
                    ? 'border-primary bg-primary-light'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {locationLabels[service.location_type]}
                    </span>
                  </div>
                </div>
                {service.price && (
                  <span className="font-semibold text-primary">
                    R$ {service.price.toFixed(2)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => setStep(2)}
          disabled={!selectedService}
          className="w-full bg-gradient-primary"
        >
          Continuar
        </Button>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Selecione a data</Label>
          <AnnualCalendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setSelectedSlot(null); // Reset slot when date changes
            }}
            dateStatuses={dateStatuses}
            isLoading={isLoadingCalendar}
            className="border rounded-lg p-4"
          />
        </div>

        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label className="mb-2 block">Horários disponíveis</Label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Carregando horários...
                </div>
              ) : !slots?.length ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum horário disponível nesta data</p>
                  <p className="text-xs mt-1">Tente selecionar outra data</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setLocationType(slot.location_type === 'both' ? 'clinic' : slot.location_type);
                      }}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-all',
                        selectedSlot?.slot_start === slot.slot_start
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      )}
                    >
                      <span className="font-medium">{slot.slot_start.slice(0, 5)}</span>
                      <span className="text-xs text-muted-foreground block">
                        {locationLabels[slot.location_type]}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
            Voltar
          </Button>
          <Button
            onClick={() => setStep(3)}
            disabled={!selectedDate || !selectedSlot}
            className="flex-1 bg-gradient-primary"
          >
            Continuar
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-4">
      {selectedSlot?.location_type === 'both' && (
        <div>
          <Label className="mb-2 block">Local do atendimento</Label>
          <Select
            value={locationType}
            onValueChange={(v) => setLocationType(v as ServiceLocationType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinic">Na clínica</SelectItem>
              <SelectItem value="home_visit">Domiciliar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {locationType === 'home_visit' && (
        <div>
          <Label htmlFor="address" className="mb-2 block">Endereço para atendimento</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número, bairro, cidade..."
          />
        </div>
      )}

      {/* Pet Selection - Required */}
      <PetSelectionCard
        pets={pets || []}
        selectedPetId={selectedPetId}
        onSelect={(petId) => {
          setSelectedPetId(petId);
          setPetError(false);
        }}
        error={petError}
        required
      />

      <div>
        <Label htmlFor="notes" className="mb-2 block">Observações para o profissional</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Descreva o motivo da consulta, sintomas observados..."
        />
      </div>

      {/* Summary */}
      <div className="p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-semibold">Resumo do agendamento</h4>
        <div className="text-sm space-y-1">
          <p><strong>Profissional:</strong> {professionalName}</p>
          <p><strong>Serviço:</strong> {selectedService?.name}</p>
          <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</p>
          <p><strong>Horário:</strong> {selectedSlot?.slot_start.slice(0, 5)} - {selectedSlot?.slot_end.slice(0, 5)}</p>
          <p><strong>Local:</strong> {locationLabels[locationType]}</p>
          {selectedPetId && pets && (
            <p><strong>Pet:</strong> {pets.find(p => p.id === selectedPetId)?.name}</p>
          )}
          {selectedService?.price && (
            <p><strong>Valor:</strong> R$ {selectedService.price.toFixed(2)}</p>
          )}
        </div>
      </div>

      {!selectedPetId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É obrigatório selecionar um pet para realizar o agendamento. 
            Caso não tenha pets cadastrados, cadastre um primeiro.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          Voltar
        </Button>
        <Button
          onClick={handleBooking}
          disabled={createAppointment.isPending || (locationType === 'home_visit' && !address) || !selectedPetId}
          className="flex-1 bg-gradient-primary"
        >
          {createAppointment.isPending ? 'Agendando...' : 'Confirmar Agendamento'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar com {professionalName}</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Escolha o serviço desejado'}
            {step === 2 && 'Selecione data e horário'}
            {step === 3 && 'Confirme os detalhes'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                step >= s ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </DialogContent>
    </Dialog>
  );
}
