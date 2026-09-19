-- ==========================================================
-- Migration: Create course_modules table for storing lecture modules
-- Run this in Supabase SQL Editor
-- ==========================================================

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
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
DROP POLICY IF EXISTS "Users manage own course modules" ON public.course_modules;
CREATE POLICY "Users manage own course modules"
  ON public.course_modules
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_user_id ON public.course_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id, pertemuan);
