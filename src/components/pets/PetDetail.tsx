import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, Cat, Dog, Calendar, Heart, 
  Syringe, FileText, Edit, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Pet } from "@/hooks/usePets";
import { usePetHealth } from "@/hooks/usePetHealth";
import { VaccineHistory } from "./VaccineHistory";
import { MedicalHistory } from "./MedicalHistory";
import { PetForm } from "./PetForm";
import { PetInsert } from "@/hooks/usePets";

interface PetDetailProps {
  pet: Pet;
  onBack: () => void;
  onUpdate: (data: Omit<PetInsert, "profile_id">, photoFile?: File) => Promise<void>;
}

const speciesIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cao: Dog,
  gato: Cat,
};

const speciesLabels: Record<string, string> = {
  cao: "Cão",
  gato: "Gato",
  pequeno_porte: "Pequeno Porte",
  grande_porte: "Grande Porte",
  producao: "Animal de Produção",
  silvestre_exotico: "Silvestre/Exótico",
};

const genderLabels: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
};

export function PetDetail({ pet, onBack, onUpdate }: PetDetailProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const {
    vaccines,
    medicalRecords,
    appointments,
    isLoading,
    addVaccine,
    updateVaccine,
    deleteVaccine,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    uploadFile,
    deleteFile,
  } = usePetHealth(pet.id);

  const SpeciesIcon = speciesIcons[pet.species] || Dog;

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    if (years === 0) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    }
    if (years === 1 && months < 0) {
      return `${12 + months} meses`;
    }
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  };

  const handleUpdate = async (data: Omit<PetInsert, "profile_id">, photoFile?: File) => {
    setIsUpdating(true);
    try {
      await onUpdate(data, photoFile);
      setShowEditForm(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const age = calculateAge(pet.birth_date);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
            <AvatarFallback className="bg-primary/10">
              <SpeciesIcon className="h-8 w-8 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{pet.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="secondary">
                {speciesLabels[pet.species] || pet.species}
              </Badge>
              {pet.breed && <span>{pet.breed}</span>}
              {pet.gender && <span>• {genderLabels[pet.gender] || pet.gender}</span>}
              {age && <span>• {age}</span>}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowEditForm(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Syringe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vaccines.length}</p>
                <p className="text-sm text-muted-foreground">Vacinas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{medicalRecords.length}</p>
                <p className="text-sm text-muted-foreground">Registros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-sm text-muted-foreground">Consultas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health & Preferences */}
      {(pet.health_history || pet.preferences) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pet.health_history && (
              <div>
                <h4 className="font-medium text-sm mb-1">Histórico de Saúde</h4>
                <p className="text-sm text-muted-foreground">{pet.health_history}</p>
              </div>
            )}
            {pet.health_history && pet.preferences && <Separator />}
            {pet.preferences && (
              <div>
                <h4 className="font-medium text-sm mb-1">Preferências e Observações</h4>
                <p className="text-sm text-muted-foreground">{pet.preferences}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Health Tabs */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="vaccines" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vaccines" className="gap-2">
              <Syringe className="h-4 w-4" />
              Vacinas
            </TabsTrigger>
            <TabsTrigger value="medical" className="gap-2">
              <FileText className="h-4 w-4" />
              Histórico Médico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vaccines">
            <VaccineHistory
              petId={pet.id}
              vaccines={vaccines}
              onAdd={async (v) => { await addVaccine.mutateAsync(v); }}
              onUpdate={async (v) => { await updateVaccine.mutateAsync(v); }}
              onDelete={async (id) => { await deleteVaccine.mutateAsync(id); }}
            />
          </TabsContent>

          <TabsContent value="medical">
            <MedicalHistory
              petId={pet.id}
              records={medicalRecords}
              appointments={appointments}
              onAdd={async (r) => { await addMedicalRecord.mutateAsync(r); }}
              onUpdate={async (r) => { await updateMedicalRecord.mutateAsync(r); }}
              onDelete={async (id) => { await deleteMedicalRecord.mutateAsync(id); }}
              onUploadFile={uploadFile}
              onDeleteFile={deleteFile}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Form */}
      <PetForm
        pet={pet}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />
    </motion.div>
  );
}
