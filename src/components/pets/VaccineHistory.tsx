import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Syringe, Plus, Trash2, Edit, AlertCircle,
  Calendar, User, Building, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { PetVaccine, VaccineInsert } from "@/hooks/usePetHealth";

const vaccineSchema = z.object({
  name: z.string().min(1, "Nome da vacina é obrigatório"),
  date_administered: z.string().min(1, "Data é obrigatória"),
  next_dose_date: z.string().optional(),
  veterinarian_name: z.string().optional(),
  clinic_name: z.string().optional(),
  batch_number: z.string().optional(),
  notes: z.string().optional(),
});

type VaccineFormData = z.infer<typeof vaccineSchema>;

interface VaccineHistoryProps {
  petId: string;
  vaccines: PetVaccine[];
  onAdd: (vaccine: VaccineInsert) => Promise<void>;
  onUpdate: (data: Partial<PetVaccine> & { id: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function VaccineHistory({
  petId,
  vaccines,
  onAdd,
  onUpdate,
  onDelete,
  isLoading
}: VaccineHistoryProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<PetVaccine | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VaccineFormData>({
    resolver: zodResolver(vaccineSchema),
    defaultValues: editingVaccine ? {
      name: editingVaccine.name,
      date_administered: editingVaccine.date_administered,
      next_dose_date: editingVaccine.next_dose_date || "",
      veterinarian_name: editingVaccine.veterinarian_name || "",
      clinic_name: editingVaccine.clinic_name || "",
      batch_number: editingVaccine.batch_number || "",
      notes: editingVaccine.notes || "",
    } : undefined,
  });

  const handleFormSubmit = async (data: VaccineFormData) => {
    setIsSubmitting(true);
    try {
      if (editingVaccine) {
        await onUpdate({
          id: editingVaccine.id,
          ...data,
          next_dose_date: data.next_dose_date || null,
          veterinarian_name: data.veterinarian_name || null,
          clinic_name: data.clinic_name || null,
          batch_number: data.batch_number || null,
          notes: data.notes || null,
        });
      } else {
        await onAdd({
          pet_id: petId,
          name: data.name,
          date_administered: data.date_administered,
          next_dose_date: data.next_dose_date || null,
          veterinarian_name: data.veterinarian_name || null,
          clinic_name: data.clinic_name || null,
          batch_number: data.batch_number || null,
          notes: data.notes || null,
        });
      }
      reset();
      setShowForm(false);
      setEditingVaccine(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (vaccine: PetVaccine) => {
    setEditingVaccine(vaccine);
    reset({
      name: vaccine.name,
      date_administered: vaccine.date_administered,
      next_dose_date: vaccine.next_dose_date || "",
      veterinarian_name: vaccine.veterinarian_name || "",
      clinic_name: vaccine.clinic_name || "",
      batch_number: vaccine.batch_number || "",
      notes: vaccine.notes || "",
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVaccine(null);
    reset();
  };

  // Check for upcoming vaccines
  const upcomingVaccines = vaccines.filter(v => {
    if (!v.next_dose_date) return false;
    const nextDose = new Date(v.next_dose_date);
    const today = new Date();
    const diffDays = Math.ceil((nextDose.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Syringe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Carteira de Vacinação</h3>
          <Badge variant="secondary">{vaccines.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Upcoming vaccines alert */}
      {upcomingVaccines.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                  Vacinas próximas do vencimento
                </p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  {upcomingVaccines.map(v => (
                    <li key={v.id}>
                      {v.name} - {format(new Date(v.next_dose_date!), "dd/MM/yyyy")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vaccines list */}
      {vaccines.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Syringe className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhuma vacina registrada
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {vaccines.map((vaccine) => (
              <motion.div
                key={vaccine.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="hover:bg-muted/30 transition-colors">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vaccine.name}</span>
                          {vaccine.next_dose_date && new Date(vaccine.next_dose_date) < new Date() && (
                            <Badge variant="destructive" className="text-xs">
                              Vencida
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(vaccine.date_administered), "dd/MM/yyyy")}
                          </span>
                          {vaccine.next_dose_date && (
                            <span>
                              Próxima: {format(new Date(vaccine.next_dose_date), "dd/MM/yyyy")}
                            </span>
                          )}
                          {vaccine.veterinarian_name && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {vaccine.veterinarian_name}
                            </span>
                          )}
                          {vaccine.clinic_name && (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {vaccine.clinic_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(vaccine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(vaccine.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVaccine ? "Editar Vacina" : "Registrar Vacina"}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da vacinação
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Vacina *</Label>
              <Input
                id="name"
                placeholder="Ex: V10, Antirrábica"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_administered">Data *</Label>
                <Input
                  id="date_administered"
                  type="date"
                  {...register("date_administered")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_dose_date">Próxima Dose</Label>
                <Input
                  id="next_dose_date"
                  type="date"
                  {...register("next_dose_date")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarian_name">Veterinário</Label>
                <Input
                  id="veterinarian_name"
                  placeholder="Nome do veterinário"
                  {...register("veterinarian_name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clínica</Label>
                <Input
                  id="clinic_name"
                  placeholder="Nome da clínica"
                  {...register("clinic_name")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_number">Número do Lote</Label>
              <Input
                id="batch_number"
                placeholder="Lote da vacina"
                {...register("batch_number")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações adicionais..."
                rows={2}
                {...register("notes")}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingVaccine ? "Salvar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vacina?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
