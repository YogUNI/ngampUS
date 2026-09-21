-- Migration: Tabel Modul Kuliah, Kuis AI, dan Obrolan AI Tutor (Dengan Hardened RLS)
-- Jalankan di Supabase Dashboard -> SQL Editor -> Run

-- 1. Tabel Modul & Arsip Berkas Kuliah (P1 - P32)
create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  pertemuan smallint not null check (pertemuan between 1 and 32),
  topik text not null check (char_length(trim(topik)) between 2 and 200),
  deskripsi text check (char_length(trim(coalesce(deskripsi, ''))) <= 1000),
  link_modul text check (char_length(trim(coalesce(link_modul, ''))) <= 800),
  link_tugas text check (char_length(trim(coalesce(link_tugas, ''))) <= 800),
  status text not null default 'belum_baca' check (status in ('belum_baca', 'sudah_baca', 'dipelajari')),
  tanggal_pertemuan date,
  catatan text check (char_length(trim(coalesce(catatan, ''))) <= 2000),
  file_url text,
  file_name text check (char_length(trim(coalesce(file_name, ''))) <= 255),
  file_size bigint check (file_size is null or file_size >= 0),
  file_type text check (char_length(trim(coalesce(file_type, ''))) <= 100),
  ai_summary text,
  ai_key_points jsonb,
  ai_exam_tips jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_course_modules_user_course on public.course_modules (user_id, course_id, pertemuan);

-- 2. Tabel Kuis Interaktif AI
create table if not exists public.module_quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id uuid references public.course_modules(id) on delete cascade not null,
  questions jsonb not null,
  skor_terakhir smallint check (skor_terakhir is null or (skor_terakhir between 0 and 100)),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_module_quizzes_user_module on public.module_quizzes (user_id, module_id);

-- 3. Tabel Riwayat Chat AI Tutor
create table if not exists public.module_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id uuid references public.course_modules(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_module_chats_user_module on public.module_chats (user_id, module_id, created_at);

-- 4. Enable Row Level Security (RLS) pada semua tabel modul & AI
alter table public.course_modules enable row level security;
alter table public.module_quizzes enable row level security;
alter table public.module_chats enable row level security;

-- Policies untuk course_modules
create policy "Users can view their own course modules"
  on public.course_modules for select
  using (auth.uid() = user_id);

create policy "Users can insert their own course modules"
  on public.course_modules for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own course modules"
  on public.course_modules for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own course modules"
  on public.course_modules for delete
  using (auth.uid() = user_id);

-- Policies untuk module_quizzes
create policy "Users can view their own module quizzes"
  on public.module_quizzes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own module quizzes"
  on public.module_quizzes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own module quizzes"
  on public.module_quizzes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own module quizzes"
  on public.module_quizzes for delete
  using (auth.uid() = user_id);

-- Policies untuk module_chats
create policy "Users can view their own module chats"
  on public.module_chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own module chats"
  on public.module_chats for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own module chats"
  on public.module_chats for delete
  using (auth.uid() = user_id);
