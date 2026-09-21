-- ==============================================================================
-- Migration: Admin Audit Trail, Security Hardening & Broadcast Enhancements
-- Jalankan file ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Tambah kolom is_emergency_sticky di tabel broadcast_announcements
alter table public.broadcast_announcements
  add column if not exists is_emergency_sticky boolean not null default false;

-- 2. Buat tabel admin_audit_logs untuk rekam jejak aktivitas Superadmin
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text not null,
  action_type text not null,
  description text not null,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default now() not null
);

create index if not exists idx_admin_audit_logs_created on public.admin_audit_logs (created_at desc);
create index if not exists idx_admin_audit_logs_action on public.admin_audit_logs (action_type);

-- 3. RLS untuk admin_audit_logs: Hanya Superadmin yang boleh melihat dan menulis log
alter table public.admin_audit_logs enable row level security;

drop policy if exists "Superadmin can view audit logs" on public.admin_audit_logs;
create policy "Superadmin can view audit logs"
  on public.admin_audit_logs for select
  using (public.is_superadmin());

drop policy if exists "Superadmin can insert audit logs" on public.admin_audit_logs;
create policy "Superadmin can insert audit logs"
  on public.admin_audit_logs for insert
  with check (public.is_superadmin());

-- 4. Database-Level Registration Gatekeeper Check Function
-- Mencegah pendaftaran langsung jika registration_active = false
create or replace function public.check_registration_gatekeeper()
returns trigger
language plpgsql
security definer
as $$
declare
  reg_setting jsonb;
begin
  select value into reg_setting
  from public.system_settings
  where key = 'registration_active';

  -- Jika ditemukan setting dan nilainya false, batalkan pendaftaran
  if reg_setting is not null and reg_setting = 'false'::jsonb then
    raise exception 'Pendaftaran akun baru sedang ditutup oleh Superadmin.';
  end if;

  return new;
end;
$$;

-- Pasang trigger pada public.profiles sebelum insert
drop trigger if exists tr_check_registration_gatekeeper on public.profiles;
create trigger tr_check_registration_gatekeeper
  before insert on public.profiles
  for each row
  execute function public.check_registration_gatekeeper();
