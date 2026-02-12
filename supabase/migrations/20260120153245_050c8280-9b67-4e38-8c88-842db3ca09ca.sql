-- Create storage bucket for pet medical files
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-medical-files', 'pet-medical-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for pet-medical-files bucket
CREATE POLICY "Pet owners can upload medical files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pet-medical-files' 
  AND EXISTS (
    SELECT 1 FROM public.pets p
    JOIN public.profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Pet owners can view their pet medical files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pet-medical-files'
  AND EXISTS (
    SELECT 1 FROM public.pets p
    JOIN public.profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Pet owners can delete their pet medical files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pet-medical-files'
  AND EXISTS (
    SELECT 1 FROM public.pets p
    JOIN public.profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid()
    AND p.id::text = (storage.foldername(name))[1]
  )
);