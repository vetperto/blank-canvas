import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  format, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  addMonths,
  getDay,
} from 'date-fns';
import { type DateAvailabilityStatus, type DateStatus } from '@/components/scheduling/AnnualCalendar';
import { type DayOfWeek } from './useAppointments';

interface Availability {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  location_type: string;
  slot_duration_minutes: number;
}

interface BlockedDate {
  blocked_date: string;
  reason: string | null;
}

interface Appointment {
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

const dayOfWeekMap: Record<number, DayOfWeek> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

function calculateSlotsForDay(
  availability: Availability[],
  appointments: Appointment[],
  date: Date
): { totalSlots: number; bookedSlots: number } {
  const dayOfWeek = dayOfWeekMap[getDay(date)];
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Get availability for this day of week
  const dayAvailability = availability.filter(a => a.day_of_week === dayOfWeek);
  
  if (dayAvailability.length === 0) {
    return { totalSlots: 0, bookedSlots: 0 };
  }

  // Calculate total possible slots
  let totalSlots = 0;
  dayAvailability.forEach(slot => {
    const [startHour, startMin] = slot.start_time.split(':').map(Number);
    const [endHour, endMin] = slot.end_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = slot.slot_duration_minutes || 30;
    totalSlots += Math.floor((endMinutes - startMinutes) / duration);
  });

  // Get appointments for this date
  const dayAppointments = appointments.filter(
    a => a.appointment_date === dateStr && 
    (a.status === 'pending' || a.status === 'confirmed')
  );

  return { totalSlots, bookedSlots: dayAppointments.length };
}

export function useCalendarAvailability(
  professionalId: string | undefined,
  startDate: Date,
  monthsAhead: number = 3
) {
  const endDate = addMonths(endOfMonth(startDate), monthsAhead);

  return useQuery({
    queryKey: ['calendar-availability', professionalId, format(startDate, 'yyyy-MM'), monthsAhead],
    queryFn: async () => {
      if (!professionalId) return new Map<string, DateStatus>();

      // Fetch availability patterns, blocked dates, and appointments in parallel
      const [availabilityResult, blockedResult, appointmentsResult] = await Promise.all([
        supabase
          .from('availability')
          .select('day_of_week, start_time, end_time, location_type, slot_duration_minutes')
          .eq('profile_id', professionalId),
        supabase
          .from('blocked_dates')
          .select('blocked_date, reason')
          .eq('profile_id', professionalId)
          .gte('blocked_date', format(startDate, 'yyyy-MM-dd'))
          .lte('blocked_date', format(endDate, 'yyyy-MM-dd')),
        supabase
          .from('appointments')
          .select('appointment_date, start_time, end_time, status')
          .eq('professional_profile_id', professionalId)
          .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
          .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
          .in('status', ['pending', 'confirmed']),
      ]);

      if (availabilityResult.error) throw availabilityResult.error;
      if (blockedResult.error) throw blockedResult.error;
      if (appointmentsResult.error) throw appointmentsResult.error;

      const availability = availabilityResult.data as Availability[];
      const blockedDates = blockedResult.data as BlockedDate[];
      const appointments = appointmentsResult.data as Appointment[];

      // Create a set of blocked date strings for quick lookup
      const blockedSet = new Set(blockedDates.map(b => b.blocked_date));

      // Generate date statuses for each day in the range
      const dateStatuses = new Map<string, DateStatus>();
      const days = eachDayOfInterval({ start: startOfMonth(startDate), end: endDate });

      days.forEach(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        
        // Check if date is blocked
        if (blockedSet.has(dateKey)) {
          dateStatuses.set(dateKey, {
            date: day,
            status: 'blocked',
            slotsCount: 0,
          });
          return;
        }

        // Calculate slots for this day
        const { totalSlots, bookedSlots } = calculateSlotsForDay(
          availability,
          appointments,
          day
        );

        let status: DateAvailabilityStatus;
        const availableSlots = totalSlots - bookedSlots;

        if (totalSlots === 0) {
          status = 'unavailable';
        } else if (availableSlots === 0) {
          status = 'unavailable';
        } else if (bookedSlots > 0) {
          status = 'partial';
        } else {
          status = 'available';
        }

        dateStatuses.set(dateKey, {
          date: day,
          status,
          slotsCount: availableSlots,
        });
      });

      return dateStatuses;
    },
    enabled: !!professionalId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to manage blocked dates
export function useBlockedDates(profileId: string | undefined) {
  return useQuery({
    queryKey: ['blocked-dates', profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('profile_id', profileId)
        .order('blocked_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
}
