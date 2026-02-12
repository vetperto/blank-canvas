import { useState, useMemo } from 'react';
import { format, startOfMonth, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CalendarOff, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklyAvailabilityForm } from './WeeklyAvailabilityForm';
import { BlockedDatesManager } from './BlockedDatesManager';
import { AnnualCalendar, type DateStatus } from './AnnualCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarAvailability } from '@/hooks/useCalendarAvailability';

export function AvailabilityManager() {
  const { profile } = useAuth();
  const [previewDate, setPreviewDate] = useState<Date | undefined>();
  
  const { data: dateStatuses, isLoading } = useCalendarAvailability(
    profile?.id,
    startOfMonth(new Date()),
    6 // 6 months ahead
  );

  return (
    <Tabs defaultValue="weekly" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
        <TabsTrigger value="weekly" className="gap-2">
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Horários Semanais</span>
          <span className="sm:hidden">Semanal</span>
        </TabsTrigger>
        <TabsTrigger value="blocked" className="gap-2">
          <CalendarOff className="w-4 h-4" />
          <span className="hidden sm:inline">Datas Bloqueadas</span>
          <span className="sm:hidden">Bloqueios</span>
        </TabsTrigger>
        <TabsTrigger value="preview" className="gap-2">
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">Visualizar Agenda</span>
          <span className="sm:hidden">Agenda</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weekly">
        <WeeklyAvailabilityForm />
      </TabsContent>

      <TabsContent value="blocked">
        <BlockedDatesManager />
      </TabsContent>

      <TabsContent value="preview">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Prévia do Calendário
            </CardTitle>
            <CardDescription>
              Veja como seu calendário aparece para os tutores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnnualCalendar
              selectedDate={previewDate}
              onSelectDate={setPreviewDate}
              dateStatuses={dateStatuses}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
