-- Migration: Superadmin Role, Permissions, and Platform Broadcast System
-- Jalankan di Supabase Dashboard -> SQL Editor -> Run

-- 1. Tambah kolom role di tabel public.profiles (jika belum ada)
alter table public.profiles
  add column if not exists role text not null default 'student'
  check (role in ('student', 'superadmin'));

create index if not exists idx_profiles_role on public.profiles (role);

-- 2. Function helper untuk mengecek status superadmin secara aman (security definer)
create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$;

-- 3. Policy RLS agar Superadmin dapat membaca seluruh direktori profil mahasiswa
drop policy if exists "Superadmin can view all profiles" on public.profiles;
create policy "Superadmin can view all profiles"
  on public.profiles for select
  using (public.is_superadmin() or auth.uid() = id);

-- 4. Tabel Pengumuman / Broadcast Global dari Superadmin
create table if not exists public.broadcast_announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete cascade not null,
  judul text not null check (char_length(trim(judul)) between 2 and 200),
  pesan text not null check (char_length(trim(pesan)) between 2 and 2000),
  tipe text not null default 'info' check (tipe in ('info', 'update', 'warning', 'maintenance')),
  is_active boolean not null default true,
  tautan text check (tautan is null or tautan ~* '^https?://'),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_broadcast_announcements_active on public.broadcast_announcements (is_active, created_at desc);

-- 5. RLS untuk broadcast_announcements
alter table public.broadcast_announcements enable row level security;

-- Semua mahasiswa dapat membaca pengumuman yang aktif
create policy "Anyone authenticated can view active announcements"
  on public.broadcast_announcements for select
  using (is_active = true or public.is_superadmin());

-- Hanya superadmin yang dapat membuat, mengubah, atau menghapus pengumuman
create policy "Superadmin can insert announcements"
  on public.broadcast_announcements for insert
  with check (public.is_superadmin());

create policy "Superadmin can update announcements"
  on public.broadcast_announcements for update
  using (public.is_superadmin())
  with check (public.is_superadmin());

create policy "Superadmin can delete announcements"
  on public.broadcast_announcements for delete
  using (public.is_superadmin());

-- 6. Grant execute on function
grant execute on function public.is_superadmin to authenticated;
grant execute on function public.is_superadmin to service_role;
