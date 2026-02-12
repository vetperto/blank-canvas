import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { 
  useAvailability, 
  useManageAvailability, 
  getDayLabel,
  type DayOfWeek, 
  type ServiceLocationType 
} from '@/hooks/useAppointments';

const daysOfWeek: DayOfWeek[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const timeSlots = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const locationLabels: Record<ServiceLocationType, string> = {
  clinic: 'Na clínica',
  home_visit: 'Domiciliar',
  both: 'Ambos',
};

export function WeeklyAvailabilityForm() {
  const { profile } = useAuth();
  const { data: availability, isLoading } = useAvailability(profile?.id);
  const { addAvailability, removeAvailability } = useManageAvailability();

  const [newSlot, setNewSlot] = useState({
    day_of_week: '' as DayOfWeek | '',
    start_time: '',
    end_time: '',
    location_type: 'clinic' as ServiceLocationType,
    is_available_for_shift: false,
    slot_duration_minutes: 30,
  });

  const handleAddSlot = () => {
    if (!newSlot.day_of_week || !newSlot.start_time || !newSlot.end_time) return;

    addAvailability.mutate({
      day_of_week: newSlot.day_of_week,
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
      location_type: newSlot.location_type,
      is_available_for_shift: newSlot.is_available_for_shift,
      slot_duration_minutes: newSlot.slot_duration_minutes,
    });

    setNewSlot({
      day_of_week: '',
      start_time: '',
      end_time: '',
      location_type: 'clinic',
      is_available_for_shift: false,
      slot_duration_minutes: 30,
    });
  };

  const groupedAvailability = availability?.reduce((acc, slot) => {
    if (!acc[slot.day_of_week]) {
      acc[slot.day_of_week] = [];
    }
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {} as Record<DayOfWeek, typeof availability>);

  return (
    <div className="space-y-6">
      {/* Add New Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Horário Recorrente
          </CardTitle>
          <CardDescription>
            Configure os dias da semana e horários padrão de atendimento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block">Dia da Semana</Label>
              <Select
                value={newSlot.day_of_week}
                onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: v as DayOfWeek })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day} value={day}>
                      {getDayLabel(day)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Início</Label>
              <Select
                value={newSlot.start_time}
                onValueChange={(v) => setNewSlot({ ...newSlot, start_time: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Horário início" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Término</Label>
              <Select
                value={newSlot.end_time}
                onValueChange={(v) => setNewSlot({ ...newSlot, end_time: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Horário término" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.filter((t) => t > newSlot.start_time).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Local de Atendimento</Label>
              <Select
                value={newSlot.location_type}
                onValueChange={(v) => setNewSlot({ ...newSlot, location_type: v as ServiceLocationType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clinic">Na clínica</SelectItem>
                  <SelectItem value="home_visit">Domiciliar</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Duração do Slot</Label>
              <Select
                value={newSlot.slot_duration_minutes.toString()}
                onValueChange={(v) => setNewSlot({ ...newSlot, slot_duration_minutes: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="shift"
                checked={newSlot.is_available_for_shift}
                onCheckedChange={(v) => setNewSlot({ ...newSlot, is_available_for_shift: v })}
              />
              <Label htmlFor="shift">Disponível para plantão</Label>
            </div>
          </div>

          <Button
            onClick={handleAddSlot}
            disabled={!newSlot.day_of_week || !newSlot.start_time || !newSlot.end_time || addAvailability.isPending}
            className="mt-4 bg-gradient-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Horário
          </Button>
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horários Configurados
          </CardTitle>
          <CardDescription>
            Estes horários se repetem toda semana automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !availability?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum horário configurado. Adicione seus horários de atendimento acima.
            </div>
          ) : (
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const slots = groupedAvailability?.[day];
                if (!slots?.length) return null;

                return (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4"
                  >
                    <h4 className="font-semibold mb-3">{getDayLabel(day)}</h4>
                    <div className="flex flex-wrap gap-2">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
                        >
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                          <span className="text-muted-foreground">|</span>
                          <MapPin className="w-4 h-4 text-secondary" />
                          <span>{locationLabels[slot.location_type]}</span>
                          {slot.is_available_for_shift && (
                            <span className="px-2 py-0.5 bg-accent-light text-accent text-xs rounded-full">
                              Plantão
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => removeAvailability.mutate(slot.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
