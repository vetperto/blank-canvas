import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pet, PetInsert } from "@/hooks/usePets";
import { Dog } from "lucide-react";

const petSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.enum(["cao", "gato", "pequeno_porte", "grande_porte", "producao", "silvestre_exotico"]),
  breed: z.string().optional(),
  gender: z.string().optional(),
  birth_date: z.string().optional(),
  health_history: z.string().optional(),
  preferences: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

interface PetFormProps {
  pet?: Pet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<PetInsert, "profile_id">, photoFile?: File) => Promise<void>;
  isLoading?: boolean;
}

const speciesOptions = [
  { value: "cao", label: "Cão" },
  { value: "gato", label: "Gato" },
  { value: "pequeno_porte", label: "Pequeno Porte (roedores, aves)" },
  { value: "grande_porte", label: "Grande Porte (cavalos, etc)" },
  { value: "producao", label: "Animal de Produção" },
  { value: "silvestre_exotico", label: "Silvestre/Exótico" },
];

const genderOptions = [
  { value: "macho", label: "Macho" },
  { value: "femea", label: "Fêmea" },
];

export function PetForm({ pet, open, onOpenChange, onSubmit, isLoading }: PetFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(pet?.photo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: pet?.name || "",
      species: pet?.species || "cao",
      breed: pet?.breed || "",
      gender: pet?.gender || "",
      birth_date: pet?.birth_date || "",
      health_history: pet?.health_history || "",
      preferences: pet?.preferences || "",
    },
  });

  const species = watch("species");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFormSubmit = async (data: PetFormData) => {
    await onSubmit(
      {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        gender: data.gender || null,
        birth_date: data.birth_date || null,
        health_history: data.health_history || null,
        preferences: data.preferences || null,
      },
      photoFile || undefined
    );
    reset();
    setPhotoFile(null);
    setPhotoPreview(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    reset();
    setPhotoFile(null);
    setPhotoPreview(pet?.photo_url || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pet ? `Editar ${pet.name}` : "Cadastrar Novo Pet"}
          </DialogTitle>
          <DialogDescription>
            {pet
              ? "Atualize as informações do seu pet"
              : "Preencha os dados do seu pet para cadastrá-lo"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary/20">
                <AvatarImage src={photoPreview || undefined} />
                <AvatarFallback className="bg-primary/10">
                  <Dog className="h-10 w-10 text-primary" />
                </AvatarFallback>
              </Avatar>
              {photoPreview && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
                  onClick={removePhoto}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="h-4 w-4 mr-2" />
              {photoPreview ? "Trocar Foto" : "Adicionar Foto"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              placeholder="Nome do pet"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Species & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Espécie *</Label>
              <Select
                value={species}
                onValueChange={(value) => setValue("species", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select
                value={watch("gender") || ""}
                onValueChange={(value) => setValue("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Breed & Birth Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Raça</Label>
              <Input
                id="breed"
                placeholder="Ex: Golden Retriever"
                {...register("breed")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                {...register("birth_date")}
              />
            </div>
          </div>

          {/* Health History */}
          <div className="space-y-2">
            <Label htmlFor="health_history">Histórico de Saúde</Label>
            <Textarea
              id="health_history"
              placeholder="Vacinas, alergias, condições médicas..."
              className="resize-none"
              rows={3}
              {...register("health_history")}
            />
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label htmlFor="preferences">Preferências e Observações</Label>
            <Textarea
              id="preferences"
              placeholder="Comportamento, preferências alimentares, cuidados especiais..."
              className="resize-none"
              rows={3}
              {...register("preferences")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {pet ? "Salvar Alterações" : "Cadastrar Pet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
