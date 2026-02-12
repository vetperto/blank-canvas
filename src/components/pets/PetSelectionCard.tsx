import { useState } from 'react';
import { Link } from 'react-router-dom';
import { differenceInYears, differenceInMonths } from 'date-fns';
import { PawPrint, Plus, ChevronRight, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';

type Pet = Tables<'pets'>;

const speciesLabels: Record<string, string> = {
  cao: 'Cão',
  gato: 'Gato',
  pequeno_porte: 'Pequeno Porte',
  grande_porte: 'Grande Porte',
  producao: 'Produção',
  silvestre_exotico: 'Silvestre/Exótico',
};

const genderLabels: Record<string, string> = {
  male: 'Macho',
  female: 'Fêmea',
};

const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return 'Idade não informada';
  const birth = new Date(birthDate);
  const years = differenceInYears(new Date(), birth);
  const months = differenceInMonths(new Date(), birth) % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
};

interface PetSelectionCardProps {
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (petId: string) => void;
  error?: boolean;
  required?: boolean;
}

export function PetSelectionCard({
  pets,
  selectedPetId,
  onSelect,
  error = false,
  required = true,
}: PetSelectionCardProps) {
  const selectedPet = pets.find(p => p.id === selectedPetId);

  if (pets.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Nenhum pet cadastrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Cadastre seu pet para poder agendar consultas
          </p>
          <Link to="/tutor/pets">
            <Button className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Pet
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <PawPrint className="w-4 h-4" />
          Qual pet será atendido?
          {required && <span className="text-destructive">*</span>}
        </h4>
        {pets.length > 0 && (
          <Link to="/tutor/pets" className="text-sm text-primary hover:underline flex items-center gap-1">
            Gerenciar pets <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {error && !selectedPetId && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Selecione um pet para continuar com o agendamento
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-2">
        {pets.map((pet) => (
          <button
            key={pet.id}
            type="button"
            onClick={() => onSelect(pet.id)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full',
              selectedPetId === pet.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50 hover:bg-muted/50',
              error && !selectedPetId && 'border-destructive/50'
            )}
          >
            <Avatar className="w-14 h-14">
              <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
              <AvatarFallback className="bg-primary/10">
                <PawPrint className="w-6 h-6 text-primary" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h5 className="font-semibold truncate">{pet.name}</h5>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {speciesLabels[pet.species] || pet.species}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {pet.breed || 'Raça não informada'}
              </p>
              <p className="text-xs text-muted-foreground">
                {calculateAge(pet.birth_date)}
                {pet.gender && ` • ${genderLabels[pet.gender] || pet.gender}`}
              </p>
            </div>

            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              selectedPetId === pet.id
                ? 'border-primary bg-primary'
                : 'border-muted-foreground/30'
            )}>
              {selectedPetId === pet.id && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedPet && (
        <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
          <p className="font-medium text-primary">Pet selecionado: {selectedPet.name}</p>
          {selectedPet.health_history && (
            <p className="text-muted-foreground">
              <strong>Histórico:</strong> {selectedPet.health_history.slice(0, 100)}
              {selectedPet.health_history.length > 100 && '...'}
            </p>
          )}
          {selectedPet.preferences && (
            <p className="text-muted-foreground">
              <strong>Observações:</strong> {selectedPet.preferences.slice(0, 100)}
              {selectedPet.preferences.length > 100 && '...'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
