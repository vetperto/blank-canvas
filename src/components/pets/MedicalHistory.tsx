import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Trash2, Edit, Calendar,
  User, Building, Loader2, Stethoscope, TestTube,
  Scissors, Pill, MoreHorizontal, Paperclip
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { PetMedicalRecord, MedicalRecordInsert, MedicalRecordAttachment } from "@/hooks/usePetHealth";
import { FileUploader } from "./FileUploader";

const recordSchema = z.object({
  record_type: z.enum(["consultation", "exam", "surgery", "treatment", "other"]),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  date: z.string().min(1, "Data é obrigatória"),
  veterinarian_name: z.string().optional(),
  clinic_name: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

interface MedicalHistoryProps {
  petId: string;
  records: PetMedicalRecord[];
  appointments: any[];
  onAdd: (record: MedicalRecordInsert) => Promise<void>;
  onUpdate: (data: Partial<PetMedicalRecord> & { id: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUploadFile: (petId: string, file: File) => Promise<MedicalRecordAttachment>;
  onDeleteFile: (petId: string, fileUrl: string) => Promise<void>;
  isLoading?: boolean;
}

const recordTypeConfig = {
  consultation: { icon: Stethoscope, label: "Consulta", color: "bg-blue-500" },
  exam: { icon: TestTube, label: "Exame", color: "bg-purple-500" },
  surgery: { icon: Scissors, label: "Cirurgia", color: "bg-red-500" },
  treatment: { icon: Pill, label: "Tratamento", color: "bg-green-500" },
  other: { icon: MoreHorizontal, label: "Outro", color: "bg-gray-500" },
};

export function MedicalHistory({
  petId,
  records,
  appointments,
  onAdd,
  onUpdate,
  onDelete,
  onUploadFile,
  onDeleteFile,
  isLoading
}: MedicalHistoryProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PetMedicalRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<MedicalRecordAttachment[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      record_type: "consultation",
    },
  });

  const recordType = watch("record_type");

  const handleFileUpload = async (file: File): Promise<MedicalRecordAttachment> => {
    const attachment = await onUploadFile(petId, file);
    setPendingAttachments((prev) => [...prev, attachment]);
    return attachment;
  };

  const handleFileRemove = async (attachment: MedicalRecordAttachment) => {
    try {
      await onDeleteFile(petId, attachment.url);
      setPendingAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    } catch (error) {
      console.error("Error removing file:", error);
    }
  };

  const handleFormSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        const existingAttachments = editingRecord.attachments || [];
        await onUpdate({
          id: editingRecord.id,
          ...data,
          description: data.description || null,
          veterinarian_name: data.veterinarian_name || null,
          clinic_name: data.clinic_name || null,
          attachments: [...existingAttachments, ...pendingAttachments],
        });
      } else {
        await onAdd({
          pet_id: petId,
          appointment_id: null,
          record_type: data.record_type,
          title: data.title,
          description: data.description || null,
          date: data.date,
          veterinarian_name: data.veterinarian_name || null,
          clinic_name: data.clinic_name || null,
          attachments: pendingAttachments,
        });
      }
      reset();
      setPendingAttachments([]);
      setShowForm(false);
      setEditingRecord(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record: PetMedicalRecord) => {
    setEditingRecord(record);
    setPendingAttachments([]);
    reset({
      record_type: record.record_type,
      title: record.title,
      description: record.description || "",
      date: record.date,
      veterinarian_name: record.veterinarian_name || "",
      clinic_name: record.clinic_name || "",
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
    setEditingRecord(null);
    setPendingAttachments([]);
    reset({ record_type: "consultation" });
  };

  // Combine records with completed appointments
  const allEvents = [
    ...records.map(r => ({ ...r, source: "record" as const })),
    ...appointments.map(a => ({
      id: a.id,
      date: a.appointment_date,
      record_type: "consultation" as const,
      title: a.service?.name || "Consulta",
      description: a.tutor_notes || a.professional_notes,
      veterinarian_name: a.professional?.full_name,
      clinic_name: null,
      source: "appointment" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Histórico Médico</h3>
          <Badge variant="secondary">{allEvents.length}</Badge>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Events list */}
      {allEvents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhum registro médico
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {allEvents.map((event) => {
              const config = recordTypeConfig[event.record_type] || recordTypeConfig.other;
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={`${event.source}-${event.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="hover:bg-muted/30 transition-colors">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${config.color}/10`}>
                          <Icon className={`h-4 w-4 text-${config.color.replace('bg-', '')}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{event.title}</span>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {config.label}
                            </Badge>
                            {event.source === "appointment" && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Agendamento
                              </Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(event.date), "dd/MM/yyyy")}
                            </span>
                            {event.veterinarian_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.veterinarian_name}
                              </span>
                            )}
                            {event.clinic_name && (
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {event.clinic_name}
                              </span>
                            )}
                            {event.source === "record" && (event as PetMedicalRecord).attachments?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                {(event as PetMedicalRecord).attachments.length} arquivo(s)
                              </span>
                            )}
                          </div>
                        </div>
                        {event.source === "record" && (
                          <div className="flex gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(event as PetMedicalRecord)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(event.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Editar Registro" : "Adicionar Registro"}
            </DialogTitle>
            <DialogDescription>
              Registre uma consulta, exame ou procedimento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Registro *</Label>
              <Select
                value={recordType}
                onValueChange={(v) => setValue("record_type", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(recordTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Check-up anual, Hemograma completo"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarian_name">Veterinário</Label>
                <Input
                  id="veterinarian_name"
                  placeholder="Nome"
                  {...register("veterinarian_name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clínica</Label>
                <Input
                  id="clinic_name"
                  placeholder="Local"
                  {...register("clinic_name")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Detalhes do procedimento, diagnóstico, resultados..."
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label>Anexos (PDF, imagens)</Label>
              <FileUploader
                petId={petId}
                attachments={[
                  ...(editingRecord?.attachments || []),
                  ...pendingAttachments,
                ]}
                onUpload={handleFileUpload}
                onRemove={handleFileRemove}
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingRecord ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
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
