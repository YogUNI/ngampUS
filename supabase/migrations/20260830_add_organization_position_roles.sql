-- Run after 20260829_expand_profiles.sql in Supabase SQL Editor.
-- Adds a structured initial role when creating an organization.

alter table public.organization_positions
  add column if not exists role_type text not null default 'lainnya';

alter table public.organization_positions
  drop constraint if exists organization_positions_role_type_check;

alter table public.organization_positions
  add constraint organization_positions_role_type_check
  check (role_type in ('ketua_umum', 'wakil_ketua_umum', 'sekretaris', 'bendahara', 'kepala_departemen', 'anggota', 'lainnya'));

create index if not exists idx_positions_role_type on public.organization_positions (role_type);

create or replace function public.create_organization_with_position(
  p_nama_organisasi text,
  p_tipe text,
  p_periode_mulai date,
  p_periode_selesai date,
  p_catatan text,
  p_role_type text,
  p_jabatan text,
  p_divisi text
) returns uuid language plpgsql security invoker set search_path = public as $$
declare organization_uuid uuid;
begin
  if auth.uid() is null then raise exception 'Sesi tidak ditemukan.'; end if;
  if p_role_type in ('kepala_departemen', 'anggota') and nullif(trim(p_divisi), '') is null then
    raise exception 'Nama departemen wajib diisi untuk role ini.';
  end if;

  insert into public.organizations (user_id, nama_organisasi, tipe, periode_mulai, periode_selesai, catatan)
  values (auth.uid(), p_nama_organisasi, p_tipe, p_periode_mulai, p_periode_selesai, nullif(trim(p_catatan), ''))
  returning id into organization_uuid;

  insert into public.organization_positions (organization_id, user_id, role_type, jabatan, divisi)
  values (organization_uuid, auth.uid(), p_role_type, p_jabatan, nullif(trim(p_divisi), ''));

  return organization_uuid;
end;
$$;
