-- =========================================================================
-- Full Migration: Course Modules, AI Summaries, AI Chats, and AI Quizzes
-- Run this in Supabase SQL Editor
-- =========================================================================

-- 1. Table course_modules
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
  ai_summary        TEXT,              -- Cache ringkasan AI
  ai_key_points     TEXT[],            -- Cache poin-poin penting
  ai_exam_tips      TEXT[],            -- Prediksi soal / kisi-kisi
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table already exists
ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_key_points TEXT[],
  ADD COLUMN IF NOT EXISTS ai_exam_tips TEXT[];

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own course modules" ON public.course_modules;
CREATE POLICY "Users manage own course modules"
  ON public.course_modules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_course_modules_user_id ON public.course_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id, pertemuan);

-- 2. Table module_quizzes (Menyimpan Kuis yang Digenerate AI)
CREATE TABLE IF NOT EXISTS public.module_quizzes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id         UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  judul             TEXT NOT NULL,
  questions         JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { question, options, correct_index, explanation }
  skor_terakhir     INTEGER,
  total_soal        INTEGER DEFAULT 5,
  selesai_pada      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.module_quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own module quizzes" ON public.module_quizzes;
CREATE POLICY "Users manage own module quizzes"
  ON public.module_quizzes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_module_quizzes_module_id ON public.module_quizzes(module_id);

-- 3. Table module_chats (Menyimpan Riwayat Chat Tanya AI)
CREATE TABLE IF NOT EXISTS public.module_chats (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id         UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content           TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.module_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own module chats" ON public.module_chats;
CREATE POLICY "Users manage own module chats"
  ON public.module_chats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_module_chats_module_id ON public.module_chats(module_id);

-- 4. Storage Bucket for course documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

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
