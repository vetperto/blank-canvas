import { useState } from 'react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  PawPrint, Calendar, Heart, FileText, Syringe, 
  ChevronDown, ChevronUp, User, Clock, MapPin,
  AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';
import { PetVaccine, PetMedicalRecord } from '@/hooks/usePetHealth';

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

const recordTypeLabels: Record<string, string> = {
  consultation: 'Consulta',
  exam: 'Exame',
  surgery: 'Cirurgia',
  treatment: 'Tratamento',
  other: 'Outro',
};

interface PetInfoCardProps {
  pet: Pet;
  vaccines?: PetVaccine[];
  medicalRecords?: PetMedicalRecord[];
  tutorName?: string;
  serviceName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  showFullDetails?: boolean;
  compact?: boolean;
}

const calculateAge = (birthDate: string | null): string => {
  if (!birthDate) return 'Idade não informada';
  const birth = new Date(birthDate);
  const years = differenceInYears(new Date(), birth);
  const months = differenceInMonths(new Date(), birth) % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`;
};

export function PetInfoCard({
  pet,
  vaccines = [],
  medicalRecords = [],
  tutorName,
  serviceName,
  appointmentDate,
  appointmentTime,
  showFullDetails = false,
  compact = false,
}: PetInfoCardProps) {
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [isVaccinesOpen, setIsVaccinesOpen] = useState(false);
  const [isMedicalOpen, setIsMedicalOpen] = useState(false);

  // Get upcoming vaccines (next dose date in the future)
  const upcomingVaccines = vaccines.filter(
    v => v.next_dose_date && new Date(v.next_dose_date) > new Date()
  );

  // Get recent medical records (last 5)
  const recentRecords = medicalRecords.slice(0, 5);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <Avatar className="w-12 h-12">
          <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
          <AvatarFallback>
            <PawPrint className="w-6 h-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{pet.name}</h4>
            <Badge variant="secondary" className="text-xs">
              {speciesLabels[pet.species] || pet.species}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {pet.breed || 'Raça não informada'} • {calculateAge(pet.birth_date)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20 border-4 border-white shadow-md">
            <AvatarImage src={pet.photo_url || undefined} alt={pet.name} />
            <AvatarFallback className="bg-primary/10">
              <PawPrint className="w-10 h-10 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-xl">{pet.name}</CardTitle>
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                {speciesLabels[pet.species] || pet.species}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {pet.breed || 'Raça não informada'}
              </p>
              <p className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {calculateAge(pet.birth_date)}
                {pet.gender && ` • ${genderLabels[pet.gender] || pet.gender}`}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment info if provided */}
        {(tutorName || serviceName || appointmentDate) && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg space-y-1 text-sm">
            {tutorName && (
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <strong>Tutor:</strong> {tutorName}
              </p>
            )}
            {serviceName && (
              <p className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <strong>Serviço:</strong> {serviceName}
              </p>
            )}
            {appointmentDate && (
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <strong>Data:</strong> {appointmentDate}
                {appointmentTime && ` às ${appointmentTime}`}
              </p>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Health info and preferences */}
        <Collapsible open={isHealthOpen} onOpenChange={setIsHealthOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <span className="flex items-center gap-2 font-medium">
                <Heart className="w-4 h-4 text-primary" />
                Informações de Saúde e Preferências
              </span>
              {isHealthOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            {pet.health_history ? (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="text-sm font-medium mb-1">Histórico de Saúde</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{pet.health_history}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhum histórico de saúde registrado</p>
            )}
            
            {pet.preferences ? (
              <div className="p-3 bg-muted/50 rounded-lg">
                <h5 className="text-sm font-medium mb-1">Preferências e Observações</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{pet.preferences}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhuma preferência registrada</p>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Vaccines */}
        {showFullDetails && (
          <>
            <Collapsible open={isVaccinesOpen} onOpenChange={setIsVaccinesOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <span className="flex items-center gap-2 font-medium">
                    <Syringe className="w-4 h-4 text-green-600" />
                    Carteira de Vacinas
                    {vaccines.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{vaccines.length}</Badge>
                    )}
                  </span>
                  {isVaccinesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                {vaccines.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Nenhuma vacina registrada</p>
                ) : (
                  <>
                    {/* Upcoming vaccines alert */}
                    {upcomingVaccines.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                        <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                          <AlertCircle className="w-4 h-4" />
                          Próximas vacinas
                        </div>
                        <ul className="text-sm text-amber-600 space-y-1">
                          {upcomingVaccines.slice(0, 3).map(v => (
                            <li key={v.id}>
                              {v.name} - {format(new Date(v.next_dose_date!), "dd/MM/yyyy")}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {vaccines.map(vaccine => (
                        <div key={vaccine.id} className="p-2 bg-muted/50 rounded text-sm">
                          <div className="flex justify-between items-start">
                            <strong>{vaccine.name}</strong>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(vaccine.date_administered), "dd/MM/yyyy")}
                            </span>
                          </div>
                          {vaccine.veterinarian_name && (
                            <p className="text-xs text-muted-foreground">
                              Dr(a). {vaccine.veterinarian_name}
                              {vaccine.clinic_name && ` - ${vaccine.clinic_name}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Medical Records */}
            <Collapsible open={isMedicalOpen} onOpenChange={setIsMedicalOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                  <span className="flex items-center gap-2 font-medium">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Histórico Médico
                    {medicalRecords.length > 0 && (
                      <Badge variant="secondary" className="ml-1">{medicalRecords.length}</Badge>
                    )}
                  </span>
                  {isMedicalOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                {medicalRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Nenhum registro médico</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {recentRecords.map(record => (
                      <div key={record.id} className="p-2 bg-muted/50 rounded text-sm">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {recordTypeLabels[record.record_type] || record.record_type}
                            </Badge>
                            <strong className="truncate">{record.title}</strong>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(record.date), "dd/MM/yyyy")}
                          </span>
                        </div>
                        {record.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {record.description}
                          </p>
                        )}
                        {record.veterinarian_name && (
                          <p className="text-xs text-muted-foreground">
                            Dr(a). {record.veterinarian_name}
                          </p>
                        )}
                      </div>
                    ))}
                    {medicalRecords.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        + {medicalRecords.length - 5} registros anteriores
                      </p>
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
      </CardContent>
    </Card>
  );
}
