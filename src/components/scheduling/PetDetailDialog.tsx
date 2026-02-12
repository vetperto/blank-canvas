import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PetInfoCard } from '@/components/pets/PetInfoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PetVaccine, PetMedicalRecord, MedicalRecordAttachment } from '@/hooks/usePetHealth';
import { Tables } from '@/integrations/supabase/types';

type Pet = Tables<'pets'>;

interface PetDetailDialogProps {
  petId: string;
  tutorName?: string;
  serviceName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PetDetailDialog({
  petId,
  tutorName,
  serviceName,
  appointmentDate,
  appointmentTime,
  isOpen,
  onClose,
}: PetDetailDialogProps) {
  // Fetch pet details
  const { data: pet, isLoading: petLoading } = useQuery({
    queryKey: ['pet-detail', petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();
      if (error) throw error;
      return data as Pet;
    },
    enabled: isOpen && !!petId,
  });

  // Fetch vaccines
  const { data: vaccines } = useQuery({
    queryKey: ['pet-vaccines', petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_vaccines')
        .select('*')
        .eq('pet_id', petId)
        .order('date_administered', { ascending: false });
      if (error) throw error;
      return data as PetVaccine[];
    },
    enabled: isOpen && !!petId,
  });

  // Fetch medical records
  const { data: medicalRecords } = useQuery({
    queryKey: ['pet-medical-records', petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_medical_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(record => ({
        ...record,
        record_type: record.record_type as PetMedicalRecord["record_type"],
        attachments: (Array.isArray(record.attachments) ? record.attachments : []) as unknown as MedicalRecordAttachment[],
      })) as PetMedicalRecord[];
    },
    enabled: isOpen && !!petId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Informações do Pet</DialogTitle>
        </DialogHeader>

        {petLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : pet ? (
          <PetInfoCard
            pet={pet}
            vaccines={vaccines || []}
            medicalRecords={medicalRecords || []}
            tutorName={tutorName}
            serviceName={serviceName}
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            showFullDetails
          />
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Pet não encontrado
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
