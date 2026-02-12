-- Fix incorrect RLS policies for pet-medical-files storage
-- The original policies have a bug: they reference p.name instead of name (the storage object name)

-- Drop the incorrect policies
DROP POLICY IF EXISTS "Pet owners can upload medical files" ON storage.objects;
DROP POLICY IF EXISTS "Pet owners can view their pet medical files" ON storage.objects;
DROP POLICY IF EXISTS "Pet owners can delete their pet medical files" ON storage.objects;

-- Create corrected policies
-- INSERT: Users can upload medical files to their pets' folders
CREATE POLICY "Pet owners can upload medical files" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'pet-medical-files' 
  AND EXISTS (
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid() 
    AND p.id::text = (storage.foldername(name))[1]
  )
);

-- SELECT: Users can view medical files of their pets
CREATE POLICY "Pet owners can view their pet medical files" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (
  bucket_id = 'pet-medical-files' 
  AND EXISTS (
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid() 
    AND p.id::text = (storage.foldername(name))[1]
  )
);

-- DELETE: Users can delete medical files of their pets
CREATE POLICY "Pet owners can delete their pet medical files" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'pet-medical-files' 
  AND EXISTS (
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid() 
    AND p.id::text = (storage.foldername(name))[1]
  )
);

-- UPDATE: Users can update medical files of their pets
CREATE POLICY "Pet owners can update their pet medical files" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'pet-medical-files' 
  AND EXISTS (
    SELECT 1 
    FROM pets p
    JOIN profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid() 
    AND p.id::text = (storage.foldername(name))[1]
  )
);