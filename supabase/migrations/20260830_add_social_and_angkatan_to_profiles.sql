-- Migration: Tambahkan kolom angkatan, linkedin, github, dan avatar_url ke public.profiles
-- Jalankan query ini di Supabase Dashboard -> SQL Editor -> Run

alter table public.profiles
  add column if not exists angkatan text,
  add column if not exists linkedin text,
  add column if not exists github text,
  add column if not exists avatar_url text;
