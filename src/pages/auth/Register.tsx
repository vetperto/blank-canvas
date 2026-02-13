import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, ArrowLeft, ArrowRight, 
  User, Building2, Stethoscope,
  CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCepLookup } from '@/hooks/useCepLookup';
import { useMultiProfile } from '@/hooks/useMultiProfile';
import { LinkAccountDialog } from '@/components/auth/LinkAccountDialog';
import { 
  isValidCPF, isValidCNPJ, isValidCRMV, isValidCEP,
  formatCPF, formatCNPJ, formatCEP, formatPhone 
} from '@/lib/validators';

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const professionalCategories = [
  'Veterinário',
  'Pet Walker',
  'Adestrador',
  'Hospedador',
  'Groomer (Banho e Tosa)',
  'Outro',
];

const userTypeConfig = {
  tutor: {
    title: 'Tutor',
    icon: User,
    description: 'Encontre os melhores profissionais para seu pet',
    steps: ['Dados Pessoais', 'Termos e Condições'],
  },
  profissional: {
    title: 'Profissional',
    icon: Stethoscope,
    description: 'Ofereça seus serviços na plataforma',
    steps: ['Dados Pessoais', 'Dados Profissionais', 'Termos'],
  },
  empresa: {
    title: 'Empresa',
    icon: Building2,
    description: 'Cadastre sua clínica ou petshop',
    steps: ['Dados da Empresa', 'Termos e Condições'],
  },
};

// Base fields for all users
const baseFields = {
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  social_name: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  cep: z.string().refine((val) => isValidCEP(val), 'CEP inválido'),
  street: z.string().min(3, 'Endereço obrigatório'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado obrigatório'),
  lgpd_accepted: z.boolean().refine((val) => val === true, 'Aceite obrigatório'),
  terms_accepted: z.boolean().refine((val) => val === true, 'Aceite obrigatório'),
};

// Tutor schema
const tutorSchema = z.object({
  ...baseFields,
  cpf: z.string().refine((val) => isValidCPF(val), 'CPF inválido'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Professional schema
const professionalSchema = z.object({
  ...baseFields,
  cpf: z.string().refine((val) => isValidCPF(val), 'CPF inválido'),
  category: z.string().min(1, 'Categoria obrigatória'),
  crmv: z.string().optional(),
  bio: z.string().optional(),
  years_experience: z.number().min(0).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

// Company schema
const companySchema = z.object({
  ...baseFields,
  cnpj: z.string().refine((val) => isValidCNPJ(val), 'CNPJ inválido'),
  company_name: z.string().min(3, 'Razão social obrigatória'),
  bio: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof tutorSchema> | z.infer<typeof professionalSchema> | z.infer<typeof companySchema>;

const getRedirectPath = (userType: string) => {
  switch (userType) {
    case 'tutor':
      return '/tutor';
    case 'profissional':
    case 'empresa':
      return '/profissional';
    default:
      return '/dashboard';
  }
};

export default function Register() {
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { checkCpfForType } = useMultiProfile();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('');
  
  // Link account dialog state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [existingAccountEmail, setExistingAccountEmail] = useState('');
  const [pendingCpf, setPendingCpf] = useState('');
  
  // Check if we're linking to an existing account
  const linkAccount = searchParams.get('link_account') === 'true';
  
  // CEP lookup hook
  const { 
    isLoading: isCepLoading, 
    addressFound, 
    error: cepError, 
    fetchAddressByCep,
    resetCepState 
  } = useCepLookup();

  const userType = (type as keyof typeof userTypeConfig) || 'tutor';
  const config = userTypeConfig[userType] || userTypeConfig.tutor;
  const Icon = config.icon;
  const totalSteps = config.steps.length;

  const getSchema = () => {
    switch (userType) {
      case 'profissional':
        return professionalSchema;
      case 'empresa':
        return companySchema;
      default:
        return tutorSchema;
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      social_name: '',
      phone: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      lgpd_accepted: false,
      terms_accepted: false,
    },
  });

  const isVeterinarian = category === 'Veterinário';

  // Handle CEP lookup
  const handleCepBlur = useCallback(async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      const addressData = await fetchAddressByCep(cepValue);
      
      if (addressData) {
        form.setValue('street', addressData.street, { shouldValidate: true });
        form.setValue('neighborhood', addressData.neighborhood, { shouldValidate: true });
        form.setValue('city', addressData.city, { shouldValidate: true });
        form.setValue('state', addressData.state, { shouldValidate: true });
      }
    } else {
      resetCepState();
    }
  }, [fetchAddressByCep, form, resetCepState]);

  // Watch CEP field for auto-complete when 8 digits are entered
  const cepValue = form.watch('cep');
  
  useEffect(() => {
    const cleanCep = (cepValue || '').replace(/\D/g, '');
    if (cleanCep.length === 8 && !addressFound && !isCepLoading) {
      handleCepBlur(cepValue);
    }
  }, [cepValue]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Validate veterinarian has CRMV
      if (userType === 'profissional' && category === 'Veterinário') {
        const profData = data as z.infer<typeof professionalSchema>;
        if (!profData.crmv || !isValidCRMV(profData.crmv)) {
          form.setError('crmv' as any, { message: 'CRMV obrigatório para veterinários' });
          setIsLoading(false);
          return;
        }
      }

      // Check if CPF already exists for another profile type
      const cpf = 'cpf' in data ? data.cpf : undefined;
      if (cpf && (userType === 'tutor' || userType === 'profissional')) {
        const cpfCheck = await checkCpfForType(cpf, userType as 'tutor' | 'profissional' | 'empresa');
        
        if (cpfCheck) {
          // CPF exists for this profile type - can't create duplicate
          if (cpfCheck.exists_for_type) {
            toast.error(`Este CPF já possui um cadastro como ${userType}. Faça login para acessar.`);
            setIsLoading(false);
            return;
          }
          
          // CPF exists for another profile type - offer to link
          if (cpfCheck.existing_user_id && cpfCheck.existing_email) {
            setPendingCpf(cpf);
            setExistingAccountEmail(cpfCheck.existing_email);
            setShowLinkDialog(true);
            setIsLoading(false);
            return;
          }
        }
      }

      // Separate profile fields from professional-specific fields
      const profileData = {
        user_type: userType as 'tutor' | 'profissional' | 'empresa',
        full_name: data.full_name,
        social_name: data.social_name,
        phone: data.phone,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        lgpd_accepted: data.lgpd_accepted,
        terms_accepted: data.terms_accepted,
        cpf: 'cpf' in data ? data.cpf : undefined,
        cnpj: 'cnpj' in data ? data.cnpj : undefined,
        bio: 'bio' in data ? data.bio : undefined,
        years_experience: 'years_experience' in data ? data.years_experience : undefined,
      };

      // Professional-specific data (crmv, specialties go to `professionals` table)
      const professionalData = userType === 'profissional' ? {
        crmv: 'crmv' in data ? (data as any).crmv : undefined,
      } : undefined;

      // Create account
      const result = await signUp(data.email, data.password, profileData, professionalData);
      
      if (!result) {
        throw new Error('Falha ao criar conta');
      }

      // Redirect to appropriate dashboard - documents will be uploaded in profile
      toast.success('Conta criada! Complete seu perfil enviando os documentos obrigatórios.');
      navigate(getRedirectPath(userType), { replace: true });
    } catch (error) {
      // Error handled in useAuth
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkSuccess = (profileId: string) => {
    toast.success('Perfil vinculado com sucesso!');
    navigate(getRedirectPath(userType), { replace: true });
  };

  const handleCreateNewAccount = () => {
    setShowLinkDialog(false);
    // Clear CPF field to force user to use different email
    toast.info('Para criar uma conta nova, use um email diferente.');
  };

  const getFieldsForStep = (stepNum: number): string[] => {
    if (userType === 'tutor') {
      if (stepNum === 1) {
        return ['full_name', 'email', 'password', 'confirmPassword', 'cpf', 'phone', 'cep', 'state', 'city', 'neighborhood', 'street', 'number'];
      }
      return ['terms_accepted', 'lgpd_accepted'];
    }

    if (userType === 'profissional') {
      if (stepNum === 1) {
        return ['full_name', 'email', 'password', 'confirmPassword', 'cpf', 'phone', 'cep', 'state', 'city', 'neighborhood', 'street', 'number'];
      }
      if (stepNum === 2) {
        return ['category'];
      }
      return ['terms_accepted', 'lgpd_accepted'];
    }

    if (userType === 'empresa') {
      if (stepNum === 1) {
        return ['full_name', 'cnpj', 'email', 'password', 'confirmPassword', 'phone', 'cep', 'state', 'city', 'neighborhood', 'street', 'number'];
      }
      return ['terms_accepted', 'lgpd_accepted'];
    }

    return [];
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const result = await form.trigger(fieldsToValidate as any);
    
    if (result) {
      if (step < totalSteps) setStep(step + 1);
    } else {
      toast.error('Por favor, preencha todos os campos obrigatórios corretamente.');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStepContent = () => {
    if (userType === 'tutor') {
      return step === 1 ? renderPersonalDataStep() : renderTermsStep();
    }

    if (userType === 'profissional') {
      switch (step) {
        case 1: return renderPersonalDataStep();
        case 2: return renderProfessionalDataStep();
        case 3: return renderTermsStep();
        default: return null;
      }
    }

    if (userType === 'empresa') {
      switch (step) {
        case 1: return renderCompanyDataStep();
        case 2: return renderTermsStep();
        default: return null;
      }
    }
  };

  const renderPersonalDataStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
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
              <FormLabel>Nome Social</FormLabel>
              <FormControl>
                <Input placeholder="Nome social (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="seu@email.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {(userType === 'tutor' || userType === 'profissional') && (
        <FormField
          control={form.control}
          name={'cpf' as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF *</FormLabel>
              <FormControl>
                <Input
                  placeholder="000.000.000-00"
                  {...field}
                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
                  maxLength={14}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <Input
                placeholder="(00) 00000-0000"
                {...field}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
                maxLength={15}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>CEP *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="00000-000"
                    {...field}
                    onChange={(e) => {
                      field.onChange(formatCEP(e.target.value));
                      resetCepState();
                    }}
                    onBlur={() => handleCepBlur(field.value)}
                    maxLength={9}
                  />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              {cepError && (
                <p className="text-sm text-destructive">{cepError}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Estado *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={addressFound}
              >
                <FormControl>
                  <SelectTrigger className={addressFound ? "bg-muted" : ""}>
                    {isCepLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SelectValue placeholder="UF" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Cidade *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Sua cidade" 
                    {...field} 
                    disabled={addressFound}
                    className={addressFound ? "bg-muted" : ""}
                  />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="neighborhood"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro *</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="Seu bairro" {...field} />
                {isCepLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Endereço *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Rua, Avenida..." {...field} />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número *</FormLabel>
              <FormControl>
                <Input placeholder="Nº" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="complement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Apto, Bloco, Sala..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderProfessionalDataStep = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={'category' as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria Profissional *</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                setCategory(value);
              }} 
              value={field.value || category}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {professionalCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {isVeterinarian && (
        <FormField
          control={form.control}
          name={'crmv' as any}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CRMV *</FormLabel>
              <FormControl>
                <Input placeholder="CRMV-SP 12345" {...field} />
              </FormControl>
              <FormDescription>
                Obrigatório para veterinários
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name={'years_experience' as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Anos de Experiência</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                placeholder="0"
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
        name={'bio' as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sobre você</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Conte um pouco sobre sua experiência e especialidades..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderCompanyDataStep = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={'company_name' as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Razão Social *</FormLabel>
            <FormControl>
              <Input placeholder="Nome da empresa" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="full_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome Fantasia *</FormLabel>
            <FormControl>
              <Input placeholder="Nome fantasia" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'cnpj' as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>CNPJ *</FormLabel>
            <FormControl>
              <Input
                placeholder="00.000.000/0000-00"
                {...field}
                onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                maxLength={18}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="contato@empresa.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Senha *</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone *</FormLabel>
            <FormControl>
              <Input
                placeholder="(00) 00000-0000"
                {...field}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
                maxLength={15}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>CEP *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="00000-000"
                    {...field}
                    onChange={(e) => {
                      field.onChange(formatCEP(e.target.value));
                      resetCepState();
                    }}
                    onBlur={() => handleCepBlur(field.value)}
                    maxLength={9}
                  />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              {cepError && (
                <p className="text-sm text-destructive">{cepError}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Estado *</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={addressFound}
              >
                <FormControl>
                  <SelectTrigger className={addressFound ? "bg-muted" : ""}>
                    {isCepLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SelectValue placeholder="UF" />
                    )}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Cidade *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Cidade" 
                    {...field} 
                    disabled={addressFound}
                    className={addressFound ? "bg-muted" : ""}
                  />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="neighborhood"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bairro *</FormLabel>
            <FormControl>
              <div className="relative">
                <Input placeholder="Bairro" {...field} />
                {isCepLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Endereço *</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Rua, Avenida..." {...field} />
                  {isCepLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número *</FormLabel>
              <FormControl>
                <Input placeholder="Nº" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="complement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento</FormLabel>
            <FormControl>
              <Input placeholder="Sala, Andar..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'bio' as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sobre a empresa</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Descreva os serviços oferecidos pela sua empresa..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderTermsStep = () => (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-lg max-h-60 overflow-y-auto">
        <h3 className="font-semibold mb-2">Termos de Serviço</h3>
        <p className="text-sm text-muted-foreground">
          Ao se cadastrar na plataforma VetPerto, você concorda com nossos Termos de Serviço.
          A plataforma conecta tutores de pets a profissionais qualificados, facilitando a 
          busca por serviços veterinários e pet care. Você se compromete a fornecer informações 
          verdadeiras e manter seus dados atualizados.
        </p>
        <h3 className="font-semibold mb-2 mt-4">Política de Privacidade (LGPD)</h3>
        <p className="text-sm text-muted-foreground">
          Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), informamos 
          que seus dados pessoais serão tratados com segurança e utilizados exclusivamente para 
          a prestação dos serviços da plataforma. Você tem direito a acessar, corrigir, portar 
          ou excluir seus dados a qualquer momento.
        </p>
      </div>

      <FormField
        control={form.control}
        name="terms_accepted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Li e aceito os Termos de Serviço *
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lgpd_accepted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Li e aceito a Política de Privacidade (LGPD) *
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col px-4 py-8 sm:px-6 lg:px-12 xl:px-16 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o início
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Cadastro de {config.title}</h1>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
              {config.steps.map((stepName, index) => (
                <div key={stepName} className="flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step > index + 1
                          ? 'bg-primary text-white'
                          : step === index + 1
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {step > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    {index < config.steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 rounded ${
                          step > index + 1 ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                    {stepName}
                  </p>
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.error('Form validation errors:', errors);
                toast.error('Por favor, verifique os campos obrigatórios e tente novamente.');
              })}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>

                <div className="flex justify-between mt-8 gap-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  )}

                  {step < totalSteps ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="ml-auto bg-gradient-primary"
                    >
                      Próximo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="ml-auto bg-gradient-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Criando conta...
                        </span>
                      ) : (
                        'Criar conta'
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                to={`/login/${userType}`}
                className="font-semibold text-primary hover:underline"
              >
                Faça login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-primary items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-white p-12"
        >
          <div className="text-8xl mb-6">🐾</div>
          <h2 className="text-3xl font-display font-bold mb-4">VetPerto</h2>
          <p className="text-lg opacity-90 max-w-md">
            A plataforma #1 de serviços pet do Brasil. Conectando tutores aos melhores profissionais.
          </p>
        </motion.div>
      </div>

      {/* Link Account Dialog */}
      <LinkAccountDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        cpf={pendingCpf}
        existingEmail={existingAccountEmail}
        requestedUserType={userType as 'tutor' | 'profissional' | 'empresa'}
        profileData={{
          full_name: form.getValues('full_name'),
          email: form.getValues('email'),
          phone: form.getValues('phone'),
          cep: form.getValues('cep'),
          street: form.getValues('street'),
          number: form.getValues('number'),
          complement: form.getValues('complement'),
          neighborhood: form.getValues('neighborhood'),
          city: form.getValues('city'),
          state: form.getValues('state'),
          crmv: 'crmv' in form.getValues() ? (form.getValues() as any).crmv : undefined,
          bio: 'bio' in form.getValues() ? (form.getValues() as any).bio : undefined,
          years_experience: 'years_experience' in form.getValues() ? (form.getValues() as any).years_experience : undefined,
          lgpd_accepted: form.getValues('lgpd_accepted'),
          terms_accepted: form.getValues('terms_accepted'),
          cnpj: 'cnpj' in form.getValues() ? (form.getValues() as any).cnpj : undefined,
        }}
        onSuccess={handleLinkSuccess}
        onCreateNew={handleCreateNewAccount}
      />
    </div>
  );
}
