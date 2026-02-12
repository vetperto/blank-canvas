import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { AvailabilityManager } from '@/components/scheduling/AvailabilityManager';

export default function ProfessionalAvailability() {
  return (
    <ProfessionalLayout title="Disponibilidade" subtitle="Configure seus horários de atendimento">
      <AvailabilityManager />
    </ProfessionalLayout>
  );
}
