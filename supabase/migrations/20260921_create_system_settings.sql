-- ==============================================================================
-- Migration: Create system_settings Table & Superadmin Policies
-- Jalankan file ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Buat tabel system_settings untuk Feature Switches, Maintenance, & AI Telemetry
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now() not null,
  updated_by_email text
);

-- 2. Aktifkan Row Level Security (RLS)
alter table public.system_settings enable row level security;

-- 3. Policy: Siapapun (publik, anon, authenticated) bisa membaca pengaturan sistem
-- (Penting agar middleware & auth-card-flip bisa mengecek maintenance_mode dan registration_active)
drop policy if exists "Anyone can read system settings" on public.system_settings;
create policy "Anyone can read system settings"
  on public.system_settings for select
  using (true);

-- 4. Policy: Hanya Superadmin yang boleh mengubah, menambah, atau menghapus pengaturan
drop policy if exists "Superadmin can manage system settings" on public.system_settings;
create policy "Superadmin can manage system settings"
  on public.system_settings for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- 5. Seed default flags awal jika belum ada data
insert into public.system_settings (key, value, updated_at)
values 
  ('maintenance_mode', 'false'::jsonb, now()),
  ('ai_service_active', 'true'::jsonb, now()),
  ('registration_active', 'true'::jsonb, now())
on conflict (key) do nothing;
