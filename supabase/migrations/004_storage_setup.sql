-- =====================================================
-- MIGRATION 004: Supabase Storage – activity-photos bucket
-- Run this in the Supabase SQL Editor
-- =====================================================

-- Create the public bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload into their own folder (user_id/filename)
CREATE POLICY "Users can upload own activity photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'activity-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: anyone can read public activity photos
CREATE POLICY "Public read access for activity photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'activity-photos');

-- Policy: users can delete their own photos
CREATE POLICY "Users can delete own activity photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'activity-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
