import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { ServiceManager } from '@/components/scheduling/ServiceManager';

export default function ProfessionalServices() {
  return (
    <ProfessionalLayout title="Serviços" subtitle="Gerencie os serviços que você oferece">
      <ServiceManager />
    </ProfessionalLayout>
  );
}
