import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type DateAvailabilityStatus = 'available' | 'partial' | 'unavailable' | 'blocked';

export interface DateStatus {
  date: Date;
  status: DateAvailabilityStatus;
  slotsCount?: number;
}

interface AnnualCalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date) => void;
  dateStatuses?: Map<string, DateStatus>;
  disablePastDates?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  isLoading?: boolean;
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function AnnualCalendar({
  selectedDate,
  onSelectDate,
  dateStatuses,
  disablePastDates = true,
  minDate,
  maxDate,
  className,
  isLoading = false,
}: AnnualCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const today = startOfToday();
  const effectiveMinDate = disablePastDates ? today : minDate;

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setDirection(-1);
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const canGoBack = !effectiveMinDate || !isBefore(startOfMonth(currentMonth), effectiveMinDate);
  const canGoForward = !maxDate || !isBefore(maxDate, endOfMonth(currentMonth));

  const getDateStatus = (date: Date): DateStatus | undefined => {
    const key = format(date, 'yyyy-MM-dd');
    return dateStatuses?.get(key);
  };

  const isDateDisabled = (date: Date): boolean => {
    if (effectiveMinDate && isBefore(date, effectiveMinDate)) return true;
    if (maxDate && isBefore(maxDate, date)) return true;
    const status = getDateStatus(date);
    return status?.status === 'unavailable' || status?.status === 'blocked';
  };

  const getStatusColor = (date: Date): string => {
    const status = getDateStatus(date)?.status;
    
    if (!isSameMonth(date, currentMonth)) {
      return 'text-muted-foreground/30';
    }

    if (isDateDisabled(date)) {
      return 'text-muted-foreground/50 cursor-not-allowed';
    }

    switch (status) {
      case 'available':
        return 'text-foreground hover:bg-primary/10';
      case 'partial':
        return 'text-foreground hover:bg-primary/10';
      case 'unavailable':
      case 'blocked':
        return 'text-muted-foreground/50 cursor-not-allowed';
      default:
        return 'text-foreground hover:bg-primary/10';
    }
  };

  const getStatusIndicator = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return null;
    
    const status = getDateStatus(date)?.status;
    const slotsCount = getDateStatus(date)?.slotsCount;

    switch (status) {
      case 'available':
        return (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
        );
      case 'partial':
        return (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
        );
      case 'blocked':
        return (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-destructive" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          disabled={!canGoBack}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h3 className="text-lg font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          disabled={!canGoForward}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Parcial</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-destructive" />
          <span>Bloqueado</span>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={format(currentMonth, 'yyyy-MM')}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1"
        >
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 35 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square flex items-center justify-center"
              >
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              </div>
            ))
          ) : (
            calendarDays.map((day, idx) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const disabled = isDateDisabled(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={idx}
                  onClick={() => !disabled && isCurrentMonth && onSelectDate(day)}
                  disabled={disabled || !isCurrentMonth}
                  className={cn(
                    'relative aspect-square flex items-center justify-center rounded-full transition-all',
                    getStatusColor(day),
                    isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                    isTodayDate && !isSelected && 'ring-2 ring-primary ring-offset-2',
                    disabled && 'opacity-50'
                  )}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {!isSelected && getStatusIndicator(day)}
                </button>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>

      {/* Selected date info */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20"
        >
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="font-medium">
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
          {getDateStatus(selectedDate)?.slotsCount !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {getDateStatus(selectedDate)?.slotsCount} horários disponíveis
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
