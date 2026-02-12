import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  Camera,
  Loader2,
  Briefcase,
  Award,
  BadgeCheck,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileText,
  X,
  Navigation,
  Target
} from 'lucide-react';
import { EducationManager } from '@/components/professional/EducationManager';
import { PaymentMethodsManager } from '@/components/professional/PaymentMethodsManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProfessionalLayout } from '@/components/professional/ProfessionalLayout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

const profileSchema = z.object({
  full_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  social_name: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  crmv: z.string().optional(),
  bio: z.string().max(500, 'Biografia deve ter no máximo 500 caracteres').optional(),
  years_experience: z.number().min(0).optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  home_service_radius: z.number().min(1).max(100).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Document {
  id: string;
  document_type: 'rg' | 'cnh' | 'crmv' | 'cnpj_card';
  file_name: string;
  file_url: string;
  is_verified: boolean | null;
  created_at: string;
}

export default function ProfessionalProfile() {
  const { profile, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      social_name: profile?.social_name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      cpf: profile?.cpf || '',
      cnpj: profile?.cnpj || '',
      crmv: profile?.crmv || '',
      bio: profile?.bio || '',
      years_experience: profile?.years_experience || 0,
      cep: profile?.cep || '',
      street: profile?.street || '',
      number: profile?.number || '',
      complement: profile?.complement || '',
      neighborhood: profile?.neighborhood || '',
      city: profile?.city || '',
      state: profile?.state || '',
      home_service_radius: (profile as any)?.home_service_radius || 10,
    },
  });

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!profile) return;
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('profile_id', profile.id);

        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, [profile]);

  const hasRequiredDocuments = () => {
    const hasRgOrCnh = documents.some(d => d.document_type === 'rg' || d.document_type === 'cnh');
    const isVet = profile?.crmv && profile.crmv.length > 0;
    const hasCrmv = documents.some(d => d.document_type === 'crmv');
    
    if (isVet) {
      return hasRgOrCnh && hasCrmv;
    }
    return hasRgOrCnh;
  };

  const getDocumentByType = (type: 'rg' | 'cnh' | 'crmv' | 'cnpj_card') => {
    return documents.find(d => d.document_type === type);
  };

  const getInitials = () => {
    const name = profile?.social_name || profile?.full_name || 'P';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      // RLS requires file path: {user_id}/filename
      const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success('Foto atualizada com sucesso!');
    } catch (error: any) {
      console.error('Photo upload error:', error);
      toast.error('Erro ao atualizar foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>, docType: 'rg' | 'crmv') => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setIsUploadingDoc(docType);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.user_id}/${docType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Save document reference
      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          profile_id: profile.id,
          document_type: docType,
          file_name: file.name,
          file_url: fileName,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setDocuments(prev => [...prev.filter(d => d.document_type !== docType), docData]);
      toast.success(`Documento ${docType.toUpperCase()} enviado com sucesso!`);
    } catch (error: any) {
      console.error('Document upload error:', error);
      toast.error('Erro ao enviar documento');
    } finally {
      setIsUploadingDoc(null);
    }
  };

  const handleDeleteDocument = async (docId: string, docType: string) => {
    if (!profile) return;

    try {
      const doc = documents.find(d => d.id === docId);
      if (doc) {
        // Delete from storage
        await supabase.storage
          .from('documents')
          .remove([doc.file_url]);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Documento removido com sucesso');
    } catch (error: any) {
      console.error('Document delete error:', error);
      toast.error('Erro ao remover documento');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) return;

    setIsLoading(true);
    try {
      // Try to geocode the address for coordinates
      let latitude: number | null = null;
      let longitude: number | null = null;
      
      if (data.cep && data.city && data.state) {
        try {
          const searchAddress = `${data.street || ''}, ${data.neighborhood || ''}, ${data.city}, ${data.state}, Brasil`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`
          );
          const geoData = await response.json();
          
          if (geoData.length > 0) {
            latitude = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
          }
        } catch (geoError) {
          console.warn('Geocoding error:', geoError);
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          social_name: data.social_name || null,
          phone: data.phone || null,
          cpf: data.cpf || null,
          cnpj: data.cnpj || null,
          crmv: data.crmv || null,
          bio: data.bio || null,
          years_experience: data.years_experience || null,
          cep: data.cep || null,
          street: data.street || null,
          number: data.number || null,
          complement: data.complement || null,
          neighborhood: data.neighborhood || null,
          city: data.city || null,
          state: data.state || null,
          home_service_radius: data.home_service_radius || 10,
          latitude,
          longitude,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddressByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        form.setValue('street', data.logradouro);
        form.setValue('neighborhood', data.bairro);
        form.setValue('city', data.localidade);
        form.setValue('state', data.uf);
      }
    } catch (error) {
      console.error('CEP lookup error:', error);
    }
  };

  return (
    <ProfessionalLayout title="Meu Perfil" subtitle="Gerencie suas informações profissionais">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Photo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-secondary/20">
                    <AvatarImage src={profile?.profile_picture_url || undefined} />
                    <AvatarFallback className="bg-secondary/10 text-secondary text-2xl font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {profile?.is_verified && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <BadgeCheck className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    {isUploadingPhoto ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isUploadingPhoto}
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-xl font-semibold text-foreground">
                      {profile?.social_name || profile?.full_name}
                    </h2>
                    {profile?.is_verified && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {profile?.crmv ? `CRMV: ${profile.crmv}` : profile?.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile?.user_type === 'empresa' ? 'Empresa' : 'Profissional'} desde{' '}
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) 
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Required Documents Section - Mandatory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className={`border-2 ${hasRequiredDocuments() ? 'border-green-500/50' : 'border-orange-500/50'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    Documentos Obrigatórios
                    {hasRequiredDocuments() ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 ml-2">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completo
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 ml-2">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Envie seus documentos para verificação e ativação do perfil
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasRequiredDocuments() && (
                <Alert className="border-orange-500/30 bg-orange-500/5">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-orange-700">
                    <strong>Ação necessária:</strong> Envie os documentos obrigatórios para ativar seu perfil e receber agendamentos.
                  </AlertDescription>
                </Alert>
              )}

              {isLoadingDocs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* RG/CNH Upload */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      RG ou CNH *
                    </label>
                    {getDocumentByType('rg') ? (
                      <div className="border rounded-lg p-4 bg-green-50/50 border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium truncate max-w-[150px]">
                              {getDocumentByType('rg')?.file_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getDocumentByType('rg')?.is_verified ? (
                              <Badge className="bg-green-500 text-white text-xs">Verificado</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Em análise</Badge>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(getDocumentByType('rg')!.id, 'rg')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          id="rg-upload"
                          disabled={isUploadingDoc === 'rg'}
                          onChange={(e) => handleDocumentUpload(e, 'rg')}
                        />
                        <label htmlFor="rg-upload" className="cursor-pointer">
                          {isUploadingDoc === 'rg' ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Enviando...</span>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Clique para enviar
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, JPG ou PNG (máx. 5MB)
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                  {/* CRMV Upload - Only for veterinarians */}
                  {profile?.crmv && profile.crmv.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Carteira do CRMV *
                      </label>
                      {getDocumentByType('crmv') ? (
                        <div className="border rounded-lg p-4 bg-green-50/50 border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium truncate max-w-[150px]">
                                {getDocumentByType('crmv')?.file_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getDocumentByType('crmv')?.is_verified ? (
                                <Badge className="bg-green-500 text-white text-xs">Verificado</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">Em análise</Badge>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(getDocumentByType('crmv')!.id, 'crmv')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            id="crmv-upload"
                            disabled={isUploadingDoc === 'crmv'}
                            onChange={(e) => handleDocumentUpload(e, 'crmv')}
                          />
                          <label htmlFor="crmv-upload" className="cursor-pointer">
                            {isUploadingDoc === 'crmv' ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Enviando...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Clique para enviar
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  PDF, JPG ou PNG (máx. 5MB)
                                </p>
                              </>
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-secondary" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Seus dados básicos de identificação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="social_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Social (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Como prefere ser chamado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                placeholder="seu@email.com" 
                                className="pl-10" 
                                {...field} 
                                disabled 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                placeholder="(11) 99999-9999" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Professional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-secondary" />
                    Informações Profissionais
                  </CardTitle>
                  <CardDescription>
                    Dados que aparecem no seu perfil público
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000/0001-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="crmv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CRMV</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input placeholder="CRMV-SP 12345" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="years_experience"
                    render={({ field }) => (
                      <FormItem className="max-w-xs">
                        <FormLabel>Anos de Experiência</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="5" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografia</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conte um pouco sobre você, sua formação e especialidades..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Máximo de 500 caracteres. {field.value?.length || 0}/500
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Education Section - Outside form since it manages its own data */}
            {profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
              >
                <EducationManager profileId={profile.id} />
              </motion.div>
            )}

            {/* Address Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    Endereço de Atendimento
                  </CardTitle>
                  <CardDescription>
                    Local onde você realiza atendimentos presenciais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="00000-000" 
                              {...field}
                              onBlur={(e) => {
                                field.onBlur();
                                fetchAddressByCep(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Sala 101" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Home Service Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" />
                    Área de Atendimento em Domicílio
                  </CardTitle>
                  <CardDescription>
                    Defina o raio máximo para atendimentos a domicílio. Os clientes só verão você nos resultados se estiverem dentro desta área.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="home_service_radius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raio de Atendimento (km)</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <Input 
                                type="number" 
                                min={1}
                                max={100}
                                placeholder="10" 
                                className="w-24"
                                {...field}
                                value={field.value || 10}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                              />
                              <span className="text-muted-foreground">km</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {[5, 10, 15, 20, 30, 50].map((km) => (
                                <button
                                  key={km}
                                  type="button"
                                  onClick={() => field.onChange(km)}
                                  className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                                    field.value === km
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  {km} km
                                </button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="flex items-start gap-2 mt-3">
                          <Navigation className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                          <span>
                            Ao salvar, suas coordenadas serão calculadas automaticamente com base no endereço informado. 
                            Clientes dentro de {field.value || 10} km do seu endereço verão você nos resultados de busca.
                          </span>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PaymentMethodsManager />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex justify-end"
            >
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-secondary to-primary hover:opacity-90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </ProfessionalLayout>
  );
}
