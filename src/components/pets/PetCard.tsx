import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Cat, Dog, Bird, Rabbit, 
  Edit, Trash2, Calendar, Heart, MoreVertical, Eye 
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pet } from "@/hooks/usePets";

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
  onViewDetails?: (pet: Pet) => void;
}

const speciesIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  cao: Dog,
  gato: Cat,
  pequeno_porte: Rabbit,
  grande_porte: Dog,
  producao: Bird,
  silvestre_exotico: Bird,
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

export function PetCard({ pet, onEdit, onDelete, onViewDetails }: PetCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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

  const age = calculateAge(pet.birth_date);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onViewDetails?.(pet)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-primary/20">
                  <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
                  <AvatarFallback className="bg-primary/10">
                    <SpeciesIcon className="h-7 w-7 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{pet.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">
                      {speciesLabels[pet.species] || pet.species}
                    </Badge>
                    {pet.gender && (
                      <span>{genderLabels[pet.gender] || pet.gender}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  {onViewDetails && (
                    <DropdownMenuItem onClick={() => onViewDetails(pet)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(pet)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Breed & Age */}
            <div className="flex flex-wrap gap-2 text-sm">
              {pet.breed && (
                <span className="text-muted-foreground">
                  <Heart className="h-3 w-3 inline mr-1" />
                  {pet.breed}
                </span>
              )}
              {age && (
                <span className="text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {age}
                </span>
              )}
            </div>

            {/* Health History */}
            {pet.health_history && (
              <div className="text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Histórico de Saúde
                </p>
                <p className="text-muted-foreground line-clamp-2">
                  {pet.health_history}
                </p>
              </div>
            )}

            {/* Preferences */}
            {pet.preferences && (
              <div className="text-sm">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Preferências
                </p>
                <p className="text-muted-foreground line-clamp-2">
                  {pet.preferences}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {pet.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O pet será removido permanentemente 
              da sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(pet.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
