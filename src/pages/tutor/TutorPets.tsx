import { TutorLayout } from '@/components/tutor/TutorLayout';
import { PetManager } from '@/components/pets/PetManager';
import { VaccineReminderTest } from '@/components/pets/VaccineReminderTest';

export default function TutorPets() {
  return (
    <TutorLayout title="Meus Pets" subtitle="Gerencie os perfis dos seus pets">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PetManager />
        </div>
        <div>
          <VaccineReminderTest />
        </div>
      </div>
    </TutorLayout>
  );
}
