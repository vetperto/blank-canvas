import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PawPrint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePets, Pet, PetInsert } from "@/hooks/usePets";
import { PetCard } from "./PetCard";
import { PetForm } from "./PetForm";
import { PetDetail } from "./PetDetail";

export function PetManager() {
  const { pets, isLoading, createPet, updatePet, deletePet, uploadPetPhoto } = usePets();
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: Omit<PetInsert, "profile_id">, photoFile?: File) => {
    setIsSubmitting(true);
    try {
      const result = await createPet.mutateAsync(data);
      
      if (photoFile && result?.id) {
        const photoUrl = await uploadPetPhoto(photoFile, result.id);
        await updatePet.mutateAsync({ id: result.id, photo_url: photoUrl });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Omit<PetInsert, "profile_id">, photoFile?: File) => {
    const petToUpdate = editingPet || selectedPet;
    if (!petToUpdate) return;
    
    setIsSubmitting(true);
    try {
      let photoUrl = petToUpdate.photo_url;
      
      if (photoFile) {
        photoUrl = await uploadPetPhoto(photoFile, petToUpdate.id);
      }
      
      await updatePet.mutateAsync({
        id: petToUpdate.id,
        ...data,
        photo_url: photoUrl,
      });
      
      // Update the selected pet if we're in detail view
      if (selectedPet && selectedPet.id === petToUpdate.id) {
        const updatedPet = pets.find(p => p.id === petToUpdate.id);
        if (updatedPet) {
          setSelectedPet({ ...updatedPet, ...data, photo_url: photoUrl });
        }
      }
      
      setEditingPet(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (petId: string) => {
    await deletePet.mutateAsync(petId);
    if (selectedPet?.id === petId) {
      setSelectedPet(null);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  const handleViewDetails = (pet: Pet) => {
    setSelectedPet(pet);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPet(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pet detail view
  if (selectedPet) {
    return (
      <PetDetail
        pet={selectedPet}
        onBack={() => setSelectedPet(null)}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Meus Pets</h2>
          <p className="text-sm text-muted-foreground">
            {pets.length === 0
              ? "Cadastre seus pets para agendar serviços"
              : `${pets.length} pet${pets.length !== 1 ? "s" : ""} cadastrado${pets.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Pet
        </Button>
      </div>

      {/* Empty State */}
      {pets.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <PawPrint className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Nenhum pet cadastrado</h3>
              <p className="text-muted-foreground text-center mb-4 max-w-sm">
                Cadastre seus pets para facilitar o agendamento de consultas 
                e manter um histórico de saúde organizado.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Pet
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pet Grid */}
      {pets.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pet Form Dialog */}
      <PetForm
        pet={editingPet}
        open={showForm}
        onOpenChange={handleCloseForm}
        onSubmit={editingPet ? handleUpdate : handleCreate}
        isLoading={isSubmitting}
      />
    </div>
  );
}
