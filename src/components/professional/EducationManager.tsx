import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Building2,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const educationSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  institution: z.string().min(2, 'Instituição deve ter pelo menos 2 caracteres'),
  year: z.number().min(1950, 'Ano inválido').max(new Date().getFullYear(), 'Ano não pode ser futuro'),
  description: z.string().max(300, 'Descrição deve ter no máximo 300 caracteres').optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface Education {
  id: string;
  title: string;
  institution: string;
  year: number;
  description: string | null;
  created_at: string;
}

interface EducationManagerProps {
  profileId: string;
}

export function EducationManager({ profileId }: EducationManagerProps) {
  const [education, setEducation] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      title: '',
      institution: '',
      year: new Date().getFullYear(),
      description: '',
    },
  });

  const fetchEducation = async () => {
    try {
      const { data, error } = await supabase
        .from('professional_education')
        .select('*')
        .eq('profile_id', profileId)
        .order('year', { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (error) {
      console.error('Error fetching education:', error);
      toast.error('Erro ao carregar formações');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchEducation();
    }
  }, [profileId]);

  const openCreateDialog = () => {
    setEditingEducation(null);
    form.reset({
      title: '',
      institution: '',
      year: new Date().getFullYear(),
      description: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (edu: Education) => {
    setEditingEducation(edu);
    form.reset({
      title: edu.title,
      institution: edu.institution,
      year: edu.year,
      description: edu.description || '',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: EducationFormData) => {
    setIsSubmitting(true);
    try {
      if (editingEducation) {
        // Update existing
        const { error } = await supabase
          .from('professional_education')
          .update({
            title: data.title,
            institution: data.institution,
            year: data.year,
            description: data.description || null,
          })
          .eq('id', editingEducation.id);

        if (error) throw error;
        toast.success('Formação atualizada com sucesso!');
      } else {
        // Create new
        const { error } = await supabase
          .from('professional_education')
          .insert({
            profile_id: profileId,
            title: data.title,
            institution: data.institution,
            year: data.year,
            description: data.description || null,
          });

        if (error) throw error;
        toast.success('Formação adicionada com sucesso!');
      }

      setIsDialogOpen(false);
      fetchEducation();
    } catch (error: any) {
      console.error('Error saving education:', error);
      toast.error('Erro ao salvar formação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('professional_education')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      setEducation((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success('Formação removida com sucesso!');
    } catch (error: any) {
      console.error('Error deleting education:', error);
      toast.error('Erro ao remover formação');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-secondary" />
                Formação Acadêmica
              </CardTitle>
              <CardDescription>
                Adicione sua formação, cursos e especializações
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : education.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma formação cadastrada</p>
              <p className="text-sm">Adicione sua formação acadêmica para aparecer no seu perfil público</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-primary/30 space-y-6">
              <AnimatePresence mode="popLayout">
                {education.map((edu) => (
                  <motion.div
                    key={edu.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative group"
                  >
                    <div className="absolute -left-[29px] w-4 h-4 rounded-full bg-primary" />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-primary font-medium">{edu.year}</p>
                        <p className="font-semibold text-foreground">{edu.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {edu.institution}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-muted-foreground mt-1">{edu.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditDialog(edu)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(edu.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEducation ? 'Editar Formação' : 'Adicionar Formação'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da sua formação acadêmica ou curso
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título / Curso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Medicina Veterinária" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instituição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: USP - Universidade de São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de Conclusão</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="2020"
                          className="pl-10"
                          min={1950}
                          max={new Date().getFullYear()}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Breve descrição do curso ou especialização..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : editingEducation ? (
                    'Atualizar'
                  ) : (
                    'Adicionar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover formação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A formação será removida permanentemente do seu perfil.
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
    </>
  );
}
