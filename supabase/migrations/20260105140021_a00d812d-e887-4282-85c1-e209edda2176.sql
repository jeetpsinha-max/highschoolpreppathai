-- Add UPDATE policy to user_roles table to allow parents to update their linked_student_id
CREATE POLICY "Users can update own roles"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy to allow users to remove their own role records
CREATE POLICY "Users can delete own roles"
ON public.user_roles
FOR DELETE
USING (auth.uid() = user_id);

-- Add storage policy for parents to access linked student documents
CREATE POLICY "Parents can view linked student documents in storage" 
ON storage.objects
FOR SELECT 
USING (
  bucket_id = 'documents' AND 
  EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'parent'
      AND user_roles.linked_student_id::text = (storage.foldername(name))[1]
  )
);