-- Create vaccines table for pet vaccination records
CREATE TABLE public.pet_vaccines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_administered DATE NOT NULL,
  next_dose_date DATE,
  veterinarian_name TEXT,
  clinic_name TEXT,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_vaccines ENABLE ROW LEVEL SECURITY;

-- Create policies for pet_vaccines
CREATE POLICY "Owners can view their pet vaccines"
ON public.pet_vaccines
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_vaccines.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

CREATE POLICY "Owners can insert vaccines for their pets"
ON public.pet_vaccines
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_vaccines.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

CREATE POLICY "Owners can update their pet vaccines"
ON public.pet_vaccines
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_vaccines.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

CREATE POLICY "Owners can delete their pet vaccines"
ON public.pet_vaccines
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_vaccines.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_pet_vaccines_updated_at
  BEFORE UPDATE ON public.pet_vaccines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create medical records table for general health events
CREATE TABLE public.pet_medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('consultation', 'exam', 'surgery', 'treatment', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  veterinarian_name TEXT,
  clinic_name TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pet_medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies for pet_medical_records
CREATE POLICY "Owners can view their pet medical records"
ON public.pet_medical_records
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_medical_records.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

CREATE POLICY "Owners can insert medical records for their pets"
ON public.pet_medical_records
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_medical_records.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

CREATE POLICY "Owners can update their pet medical records"
ON public.pet_medical_records
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_medical_records.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

CREATE POLICY "Owners can delete their pet medical records"
ON public.pet_medical_records
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = pet_medical_records.pet_id
    AND p.profile_id = get_profile_id(auth.uid())
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_pet_medical_records_updated_at
  BEFORE UPDATE ON public.pet_medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();