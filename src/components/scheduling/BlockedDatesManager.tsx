import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarOff, Plus, Trash2, X } from 'lucide-react';
import { format, isBefore, startOfToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBlockedDates } from '@/hooks/useCalendarAvailability';
import { AnnualCalendar, type DateStatus } from './AnnualCalendar';

export function BlockedDatesManager() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: blockedDates, isLoading } = useBlockedDates(profile?.id);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [reason, setReason] = useState('');

  // Create date statuses for the calendar
  const dateStatuses = useMemo(() => {
    const statuses = new Map<string, DateStatus>();
    blockedDates?.forEach(bd => {
      const date = parseISO(bd.blocked_date);
      statuses.set(bd.blocked_date, {
        date,
        status: 'blocked',
        slotsCount: 0,
      });
    });
    // Add selected dates (pending block)
    selectedDates.forEach(date => {
      const key = format(date, 'yyyy-MM-dd');
      if (!statuses.has(key)) {
        statuses.set(key, {
          date,
          status: 'blocked',
          slotsCount: 0,
        });
      }
    });
    return statuses;
  }, [blockedDates, selectedDates]);

  const addBlockedDate = useMutation({
    mutationFn: async (dates: Date[]) => {
      if (!profile?.id) throw new Error('Usuário não autenticado');

      const inserts = dates.map(date => ({
        profile_id: profile.id,
        blocked_date: format(date, 'yyyy-MM-dd'),
        reason: reason || null,
      }));

      const { error } = await supabase
        .from('blocked_dates')
        .insert(inserts);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-availability'] });
      toast.success('Data(s) bloqueada(s) com sucesso!');
      setIsDialogOpen(false);
      setSelectedDates([]);
      setReason('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao bloquear data');
    },
  });

  const removeBlockedDate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-availability'] });
      toast.success('Bloqueio removido!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao remover bloqueio');
    },
  });

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAlreadyBlocked = blockedDates?.some(bd => bd.blocked_date === dateStr);
    
    if (isAlreadyBlocked) {
      toast.error('Esta data já está bloqueada');
      return;
    }

    setSelectedDates(prev => {
      const exists = prev.some(d => format(d, 'yyyy-MM-dd') === dateStr);
      if (exists) {
        return prev.filter(d => format(d, 'yyyy-MM-dd') !== dateStr);
      }
      return [...prev, date];
    });
  };

  const handleSubmit = () => {
    if (selectedDates.length === 0) {
      toast.error('Selecione pelo menos uma data');
      return;
    }
    addBlockedDate.mutate(selectedDates);
  };

  const futureDates = blockedDates?.filter(
    bd => !isBefore(parseISO(bd.blocked_date), startOfToday())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarOff className="w-5 h-5" />
          Datas Bloqueadas
        </CardTitle>
        <CardDescription>
          Bloqueie datas específicas como feriados, folgas ou exceções
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Bloquear Datas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Bloquear Datas</DialogTitle>
              <DialogDescription>
                Selecione as datas que deseja bloquear no calendário
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <AnnualCalendar
                selectedDate={selectedDates[selectedDates.length - 1]}
                onSelectDate={handleDateSelect}
                dateStatuses={dateStatuses}
              />

              {selectedDates.length > 0 && (
                <div className="space-y-2">
                  <Label>Datas selecionadas:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map(date => (
                      <Badge
                        key={format(date, 'yyyy-MM-dd')}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {format(date, 'dd/MM/yyyy')}
                        <button
                          onClick={() => handleDateSelect(date)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Motivo (opcional)</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Feriado, Férias, Compromisso pessoal..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedDates.length === 0 || addBlockedDate.isPending}
                className="bg-gradient-primary"
              >
                {addBlockedDate.isPending ? 'Bloqueando...' : 'Confirmar Bloqueio'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* List of blocked dates */}
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Carregando...
          </div>
        ) : !futureDates?.length ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhuma data bloqueada
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {futureDates.map((bd) => (
                <motion.div
                  key={bd.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {format(parseISO(bd.blocked_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    {bd.reason && (
                      <p className="text-sm text-muted-foreground">{bd.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBlockedDate.mutate(bd.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
