import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { AppointmentList } from '@/components/scheduling/AppointmentList';

export default function ProfessionalAppointments() {
  return (
    <ProfessionalLayout title="Agendamentos" subtitle="Gerencie suas consultas e atendimentos">
      <AppointmentList viewAs="professional" />
    </ProfessionalLayout>
  );
}
