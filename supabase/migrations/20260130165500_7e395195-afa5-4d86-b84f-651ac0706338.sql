-- =============================================
-- MIGRAÇÃO: Suporte a Múltiplos Perfis por CPF
-- =============================================

-- 1. Adicionar constraint UNIQUE para permitir apenas um perfil por tipo por usuário
-- Isso permite que o mesmo user_id tenha múltiplos perfis, mas apenas um de cada tipo
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_user_profile_type UNIQUE (user_id, user_type);

-- 2. Criar índice para busca eficiente por CPF + tipo de usuário
CREATE INDEX IF NOT EXISTS idx_profiles_cpf_user_type ON public.profiles(cpf, user_type);

-- 3. Criar índice para busca por user_id + user_type (usado no login)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_user_type ON public.profiles(user_id, user_type);

-- 4. Criar função para buscar perfil por tipo após autenticação
CREATE OR REPLACE FUNCTION public.get_profile_by_type(_user_id uuid, _user_type user_type)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  user_type user_type,
  full_name text,
  social_name text,
  email text,
  phone text,
  cpf text,
  cnpj text,
  crmv text,
  bio text,
  profile_picture_url text,
  is_verified boolean,
  city text,
  state text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.user_type,
    p.full_name,
    p.social_name,
    p.email,
    p.phone,
    p.cpf,
    p.cnpj,
    p.crmv,
    p.bio,
    p.profile_picture_url,
    p.is_verified,
    p.city,
    p.state
  FROM public.profiles p
  WHERE p.user_id = _user_id AND p.user_type = _user_type
  LIMIT 1;
$$;

-- 5. Criar função para verificar se CPF já existe para um tipo de perfil
CREATE OR REPLACE FUNCTION public.check_cpf_exists_for_type(_cpf text, _user_type user_type)
RETURNS TABLE(
  exists_for_type boolean,
  existing_user_id uuid,
  existing_email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXISTS(SELECT 1 FROM public.profiles WHERE cpf = _cpf AND user_type = _user_type) as exists_for_type,
    (SELECT user_id FROM public.profiles WHERE cpf = _cpf LIMIT 1) as existing_user_id,
    (SELECT email FROM public.profiles WHERE cpf = _cpf LIMIT 1) as existing_email;
$$;

-- 6. Criar função para listar todos os tipos de perfil de um usuário
CREATE OR REPLACE FUNCTION public.get_user_profile_types(_user_id uuid)
RETURNS TABLE(
  profile_id uuid,
  profile_type user_type,
  full_name text,
  is_verified boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id as profile_id,
    user_type as profile_type,
    full_name,
    is_verified
  FROM public.profiles
  WHERE user_id = _user_id
  ORDER BY created_at;
$$;

-- 7. Atualizar política de SELECT para permitir que usuário veja todos seus perfis
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 8. Atualizar política de UPDATE para permitir atualizar qualquer perfil próprio
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profiles"
ON public.profiles
FOR UPDATE
USING ((auth.uid() = user_id) OR is_admin(auth.uid()));

-- 9. Atualizar função get_profile_id para aceitar tipo de usuário
CREATE OR REPLACE FUNCTION public.get_profile_id_by_type(_user_id uuid, _user_type user_type)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id AND user_type = _user_type LIMIT 1;
$$;