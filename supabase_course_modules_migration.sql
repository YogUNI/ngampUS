-- ==========================================================
-- Full Migration: Create course_modules table & Storage Bucket
-- Run this in Supabase SQL Editor
-- ==========================================================

-- 1. Create table course_modules
CREATE TABLE IF NOT EXISTS public.course_modules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  pertemuan         INTEGER NOT NULL DEFAULT 1,
  topik             TEXT NOT NULL,
  deskripsi         TEXT,
  link_modul        TEXT,
  link_tugas        TEXT,
  status            TEXT NOT NULL DEFAULT 'belum_baca'
                    CHECK (status IN ('belum_baca', 'sudah_baca', 'dipelajari')),
  tanggal_pertemuan DATE,
  catatan           TEXT,
  file_url          TEXT,
  file_name         TEXT,
  file_size         BIGINT,
  file_type         TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table already created
ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Enable Row Level Security (RLS)
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Policy for course_modules
DROP POLICY IF EXISTS "Users manage own course modules" ON public.course_modules;
CREATE POLICY "Users manage own course modules"
  ON public.course_modules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_user_id ON public.course_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id, pertemuan);

-- 2. Create Storage Bucket for course documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for course-materials bucket
DROP POLICY IF EXISTS "Authenticated users can upload course materials" ON storage.objects;
CREATE POLICY "Authenticated users can upload course materials"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'course-materials');

DROP POLICY IF EXISTS "Public can view course materials" ON storage.objects;
CREATE POLICY "Public can view course materials"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'course-materials');

DROP POLICY IF EXISTS "Users can delete own course materials" ON storage.objects;
CREATE POLICY "Users can delete own course materials"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'course-materials');
