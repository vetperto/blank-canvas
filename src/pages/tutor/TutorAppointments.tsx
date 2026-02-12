import { TutorLayout } from '@/components/tutor/TutorLayout';
import { AppointmentList } from '@/components/scheduling/AppointmentList';

export default function TutorAppointments() {
  return (
    <TutorLayout title="Meus Agendamentos" subtitle="Gerencie suas consultas e atendimentos">
      <AppointmentList viewAs="tutor" />
    </TutorLayout>
  );
}
