import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Pet = Tables<"pets">;
export type PetInsert = TablesInsert<"pets">;
export type PetUpdate = TablesUpdate<"pets">;

export const usePets = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: pets, isLoading, error } = useQuery({
    queryKey: ["pets", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Pet[];
    },
    enabled: !!profile?.id,
  });

  const createPet = useMutation({
    mutationFn: async (pet: Omit<PetInsert, "profile_id">) => {
      if (!profile?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pets")
        .insert({ ...pet, profile_id: profile.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets", profile?.id] });
      toast.success("Pet cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating pet:", error);
      toast.error("Erro ao cadastrar pet. Tente novamente.");
    },
  });

  const updatePet = useMutation({
    mutationFn: async ({ id, ...updates }: PetUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("pets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets", profile?.id] });
      toast.success("Pet atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating pet:", error);
      toast.error("Erro ao atualizar pet. Tente novamente.");
    },
  });

  const deletePet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets", profile?.id] });
      toast.success("Pet removido com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting pet:", error);
      toast.error("Erro ao remover pet. Tente novamente.");
    },
  });

  const uploadPetPhoto = useCallback(async (file: File, petId: string) => {
    if (!profile?.user_id) throw new Error("Usuário não autenticado");
    
    const fileExt = file.name.split(".").pop();
    // RLS requires file path: {user_id}/{filename}
    const fileName = `${profile.user_id}/${petId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("pet-photos")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }, [profile?.user_id]);

  return {
    pets: pets || [],
    isLoading,
    error,
    createPet,
    updatePet,
    deletePet,
    uploadPetPhoto,
  };
};
