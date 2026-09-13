-- Migration: Tabel courses untuk Jadwal Kuliah & Manajemen Mata Kuliah Mingguan
-- Jalankan di Supabase Dashboard -> SQL Editor -> Run

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  semester_id uuid references public.semesters(id) on delete cascade not null,
  
  -- Info Akademik
  nama_matkul text not null check (char_length(trim(nama_matkul)) between 2 and 120),
  kode_matkul text check (char_length(trim(coalesce(kode_matkul, ''))) <= 25),
  sks smallint not null default 3 check (sks between 1 and 8),
  dosen_pengampu text check (char_length(trim(coalesce(dosen_pengampu, ''))) <= 120),
  kontak_dosen text check (char_length(trim(coalesce(kontak_dosen, ''))) <= 120),
  
  -- Jadwal Mingguan (1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu, 7: Minggu)
  hari smallint not null check (hari between 1 and 7),
  jam_mulai time not null,
  jam_selesai time not null check (jam_selesai > jam_mulai),
  
  -- Tipe & Lokasi
  tipe_pertemuan text not null default 'offline' check (tipe_pertemuan in ('offline', 'online', 'hybrid')),
  ruangan text check (char_length(trim(coalesce(ruangan, ''))) <= 80),
  link_pertemuan text check (char_length(trim(coalesce(link_pertemuan, ''))) <= 500),
  link_materi text check (char_length(trim(coalesce(link_materi, ''))) <= 500),
  
  -- Visual & Catatan
  warna_label text not null default '#0f6849' check (char_length(warna_label) <= 20),
  catatan text check (char_length(trim(coalesce(catatan, ''))) <= 1000),
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index performa query per semester & hari
create index if not exists idx_courses_user_semester on public.courses (user_id, semester_id);
create index if not exists idx_courses_user_hari on public.courses (user_id, hari, jam_mulai);

-- RLS
alter table public.courses enable row level security;

create policy "Users can view their own courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own courses"
  on public.courses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own courses"
  on public.courses for delete
  using (auth.uid() = user_id);

-- Tambah relasi course_id ke tabel activities (optional)
alter table public.activities
  add column if not exists course_id uuid references public.courses(id) on delete set null;
