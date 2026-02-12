-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('tutor', 'profissional', 'empresa');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for document types
CREATE TYPE public.document_type AS ENUM ('rg', 'cnh', 'crmv', 'cnpj_card');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'pending');

-- Create enum for pet species
CREATE TYPE public.pet_species AS ENUM ('cao', 'gato', 'pequeno_porte', 'grande_porte', 'producao', 'silvestre_exotico');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_type user_type NOT NULL,
  full_name TEXT NOT NULL,
  social_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  cnpj TEXT,
  crmv TEXT,
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  bio TEXT,
  profile_picture_url TEXT,
  years_experience INTEGER,
  is_verified BOOLEAN DEFAULT FALSE,
  lgpd_accepted BOOLEAN DEFAULT FALSE NOT NULL,
  terms_accepted BOOLEAN DEFAULT FALSE NOT NULL,
  lgpd_accepted_at TIMESTAMPTZ,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create documents table for document uploads
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  document_type document_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create pets table
CREATE TABLE public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species pet_species NOT NULL,
  breed TEXT,
  birth_date DATE,
  gender TEXT,
  photo_url TEXT,
  health_history TEXT,
  preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create subscriptions (plans) table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  target_user_type user_type NOT NULL,
  monthly_appointments_limit INTEGER,
  has_verified_badge BOOLEAN DEFAULT FALSE,
  has_price_table BOOLEAN DEFAULT FALSE,
  has_portfolio BOOLEAN DEFAULT FALSE,
  portfolio_limit INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) NOT NULL,
  status subscription_status DEFAULT 'pending' NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create legal_agreements table
CREATE TABLE public.legal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agreement_type TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Helper function to get profile id from user id
CREATE OR REPLACE FUNCTION public.get_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Helper function to check user type
CREATE OR REPLACE FUNCTION public.get_user_type(_user_id UUID)
RETURNS user_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_type FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all public profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_profile_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can upload their own documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Users can update their own documents"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (
    profile_id = public.get_profile_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Users can delete their own documents"
  ON public.documents FOR DELETE
  TO authenticated
  USING (
    profile_id = public.get_profile_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- RLS Policies for pets
CREATE POLICY "Users can view their own pets"
  ON public.pets FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_profile_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Tutors can insert pets"
  ON public.pets FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = public.get_profile_id(auth.uid()) 
    AND public.get_user_type(auth.uid()) = 'tutor'
  );

CREATE POLICY "Users can update their own pets"
  ON public.pets FOR UPDATE
  TO authenticated
  USING (profile_id = public.get_profile_id(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Users can delete their own pets"
  ON public.pets FOR DELETE
  TO authenticated
  USING (profile_id = public.get_profile_id(auth.uid()) OR public.is_admin(auth.uid()));

-- RLS Policies for subscriptions (public read)
CREATE POLICY "Anyone can view subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (
    profile_id = public.get_profile_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Professionals and companies can subscribe"
  ON public.user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = public.get_profile_id(auth.uid()) 
    AND public.get_user_type(auth.uid()) IN ('profissional', 'empresa')
  );

CREATE POLICY "Only admins can update subscriptions"
  ON public.user_subscriptions FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can cancel their own subscriptions"
  ON public.user_subscriptions FOR DELETE
  TO authenticated
  USING (
    profile_id = public.get_profile_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- RLS Policies for legal_agreements
CREATE POLICY "Users can view their own agreements"
  ON public.legal_agreements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can accept agreements"
  ON public.legal_agreements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON public.pets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profile will be created during registration with full data
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default subscription plans
INSERT INTO public.subscriptions (name, slug, description, price, target_user_type, monthly_appointments_limit, has_verified_badge, has_price_table, has_portfolio, portfolio_limit, features) VALUES
('Básico', 'basico', 'Perfil básico com descrição, foto e avaliações', 29.99, 'profissional', 5, false, false, false, 0, '["Perfil básico", "Foto de perfil", "Avaliações", "5 agendamentos/mês"]'),
('Intermediário', 'intermediario', 'Perfil básico + selo verificado + tabela de preços', 39.99, 'profissional', 15, true, true, false, 0, '["Perfil básico", "Selo verificado", "Tabela de preços", "15 agendamentos/mês"]'),
('Completo', 'completo', 'Perfil completo com portfólio e agendamentos ilimitados', 49.99, 'profissional', NULL, true, true, true, 10, '["Perfil completo", "Portfólio 10 fotos", "Agendamentos ilimitados", "Selo verificado", "Tabela de preços"]'),
('Empresas', 'empresas', 'Plano completo para clínicas, hospitais e petshops', 59.99, 'empresa', NULL, true, true, true, 10, '["Perfil completo", "Portfólio 10 fotos", "Agendamentos ilimitados", "Selo verificado", "Tabela de preços"]');

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage bucket for pet photos
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-photos', 'pet-photos', true);

-- Storage policies for documents bucket (private)
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket (public read)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for pet-photos bucket
CREATE POLICY "Anyone can view pet photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-photos');

CREATE POLICY "Users can upload pet photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update pet photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete pet photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'pet-photos' AND auth.uid()::text = (storage.foldername(name))[1]);