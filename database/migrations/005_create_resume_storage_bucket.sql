-- Create the 'resumes' storage bucket for storing user resume files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'resumes',
    'resumes',
    true,
    10485760, -- 10MB in bytes
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files to the resumes bucket
-- Users can only upload files with their own user ID as the filename prefix
CREATE POLICY "Users can upload their own resume files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to view their own resume files
-- Users can only access files with their own user ID as the filename prefix
CREATE POLICY "Users can view their own resume files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to update/replace their own resume files
-- Users can only update files with their own user ID as the filename prefix
CREATE POLICY "Users can update their own resume files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy to allow authenticated users to delete their own resume files
-- Users can only delete files with their own user ID as the filename prefix
CREATE POLICY "Users can delete their own resume files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Grant necessary permissions to authenticated users for the resumes bucket
CREATE POLICY IF NOT EXISTS "Allow authenticated users to access resumes bucket"
ON storage.buckets
FOR SELECT
TO authenticated
USING (id = 'resumes');