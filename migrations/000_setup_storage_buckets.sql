-- Create Supabase Storage Buckets and Policies
-- Run this in your Supabase SQL Editor

-- 1. Apartment Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('apartment-images', 'apartment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload apartment images
CREATE POLICY "Anyone can upload apartment images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'apartment-images');

-- Allow anyone to read apartment images
CREATE POLICY "Anyone can read apartment images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'apartment-images');

-- Allow authenticated users to delete apartment images
CREATE POLICY "Authenticated users can delete apartment images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'apartment-images');

-- Allow anyone to update apartment images
CREATE POLICY "Anyone can update apartment images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'apartment-images')
WITH CHECK (bucket_id = 'apartment-images');

-- 2. Menu Documents Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-documents', 'menu-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload menu documents
CREATE POLICY "Anyone can upload menu documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'menu-documents');

-- Allow anyone to read menu documents
CREATE POLICY "Anyone can read menu documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-documents');

-- Allow authenticated users to delete menu documents
CREATE POLICY "Authenticated users can delete menu documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-documents');

-- Allow anyone to update menu documents
CREATE POLICY "Anyone can update menu documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'menu-documents')
WITH CHECK (bucket_id = 'menu-documents');

-- 3. General Images Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('general-images', 'general-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload general images
CREATE POLICY "Anyone can upload general images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'general-images');

-- Allow anyone to read general images
CREATE POLICY "Anyone can read general images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'general-images');

-- Allow authenticated users to delete general images
CREATE POLICY "Authenticated users can delete general images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'general-images');

-- Allow anyone to update general images
CREATE POLICY "Anyone can update general images"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'general-images')
WITH CHECK (bucket_id = 'general-images');
