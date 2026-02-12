import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PetVaccine {
  id: string;
  pet_id: string;
  name: string;
  date_administered: string;
  next_dose_date: string | null;
  veterinarian_name: string | null;
  clinic_name: string | null;
  batch_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecordAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface PetMedicalRecord {
  id: string;
  pet_id: string;
  appointment_id: string | null;
  record_type: "consultation" | "exam" | "surgery" | "treatment" | "other";
  title: string;
  description: string | null;
  date: string;
  veterinarian_name: string | null;
  clinic_name: string | null;
  attachments: MedicalRecordAttachment[];
  created_at: string;
  updated_at: string;
}

export type VaccineInsert = Omit<PetVaccine, "id" | "created_at" | "updated_at">;
export type MedicalRecordInsert = Omit<PetMedicalRecord, "id" | "created_at" | "updated_at">;

export const usePetHealth = (petId: string) => {
  const queryClient = useQueryClient();

  // Fetch vaccines
  const { data: vaccines, isLoading: vaccinesLoading } = useQuery({
    queryKey: ["pet-vaccines", petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_vaccines")
        .select("*")
        .eq("pet_id", petId)
        .order("date_administered", { ascending: false });

      if (error) throw error;
      return data as PetVaccine[];
    },
    enabled: !!petId,
  });

  // Fetch medical records
  const { data: medicalRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ["pet-medical-records", petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pet_medical_records")
        .select("*")
        .eq("pet_id", petId)
        .order("date", { ascending: false });

      if (error) throw error;
      
      // Transform attachments from Json to typed array
      return (data || []).map(record => ({
        ...record,
        record_type: record.record_type as PetMedicalRecord["record_type"],
        attachments: (Array.isArray(record.attachments) ? record.attachments : []) as unknown as MedicalRecordAttachment[],
      })) as PetMedicalRecord[];
    },
    enabled: !!petId,
  });

  // Fetch pet's appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["pet-appointments", petId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          professional:profiles!appointments_professional_profile_id_fkey(full_name, profile_picture_url),
          service:services(name)
        `)
        .eq("pet_id", petId)
        .eq("status", "completed")
        .order("appointment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!petId,
  });

  // Add vaccine
  const addVaccine = useMutation({
    mutationFn: async (vaccine: VaccineInsert) => {
      const { data, error } = await supabase
        .from("pet_vaccines")
        .insert(vaccine)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-vaccines", petId] });
      toast.success("Vacina registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Error adding vaccine:", error);
      toast.error("Erro ao registrar vacina.");
    },
  });

  // Update vaccine
  const updateVaccine = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PetVaccine> & { id: string }) => {
      const { data, error } = await supabase
        .from("pet_vaccines")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-vaccines", petId] });
      toast.success("Vacina atualizada!");
    },
    onError: (error) => {
      console.error("Error updating vaccine:", error);
      toast.error("Erro ao atualizar vacina.");
    },
  });

  // Delete vaccine
  const deleteVaccine = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pet_vaccines")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-vaccines", petId] });
      toast.success("Vacina removida!");
    },
    onError: (error) => {
      console.error("Error deleting vaccine:", error);
      toast.error("Erro ao remover vacina.");
    },
  });

  // Add medical record
  const addMedicalRecord = useMutation({
    mutationFn: async (record: MedicalRecordInsert) => {
      const { data, error } = await supabase
        .from("pet_medical_records")
        .insert({
          pet_id: record.pet_id,
          appointment_id: record.appointment_id,
          record_type: record.record_type,
          title: record.title,
          description: record.description,
          date: record.date,
          veterinarian_name: record.veterinarian_name,
          clinic_name: record.clinic_name,
          attachments: record.attachments as unknown as any,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-medical-records", petId] });
      toast.success("Registro adicionado com sucesso!");
    },
    onError: (error) => {
      console.error("Error adding medical record:", error);
      toast.error("Erro ao adicionar registro.");
    },
  });

  // Update medical record
  const updateMedicalRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PetMedicalRecord> & { id: string }) => {
      const updateData: any = { ...updates };
      if (updates.attachments) {
        updateData.attachments = updates.attachments as unknown as any;
      }
      
      const { data, error } = await supabase
        .from("pet_medical_records")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-medical-records", petId] });
      toast.success("Registro atualizado!");
    },
    onError: (error) => {
      console.error("Error updating medical record:", error);
      toast.error("Erro ao atualizar registro.");
    },
  });

  // Delete medical record
  const deleteMedicalRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pet_medical_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pet-medical-records", petId] });
      toast.success("Registro removido!");
    },
    onError: (error) => {
      console.error("Error deleting medical record:", error);
      toast.error("Erro ao remover registro.");
    },
  });

  // Upload file to storage - uses signed URLs for secure access
  const uploadFile = async (petId: string, file: File): Promise<MedicalRecordAttachment> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${petId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-medical-files")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Use signed URL for private bucket (3 hour expiration)
    const { data: urlData, error: signedUrlError } = await supabase.storage
      .from("pet-medical-files")
      .createSignedUrl(filePath, 3 * 60 * 60); // 3 hours

    if (signedUrlError || !urlData) {
      console.error("Signed URL error:", signedUrlError);
      throw signedUrlError || new Error("Failed to generate signed URL");
    }

    return {
      id: crypto.randomUUID(),
      name: file.name,
      url: urlData.signedUrl,
      type: file.type,
      size: file.size,
    };
  };

  // Delete file from storage
  const deleteFile = async (petId: string, fileUrl: string): Promise<void> => {
    const urlParts = fileUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${petId}/${fileName}`;

    const { error } = await supabase.storage
      .from("pet-medical-files")
      .remove([filePath]);

    if (error) {
      console.error("Delete file error:", error);
      throw error;
    }
  };

  return {
    vaccines: vaccines || [],
    medicalRecords: medicalRecords || [],
    appointments: appointments || [],
    isLoading: vaccinesLoading || recordsLoading || appointmentsLoading,
    addVaccine,
    updateVaccine,
    deleteVaccine,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    uploadFile,
    deleteFile,
  };
};
