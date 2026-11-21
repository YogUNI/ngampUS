-- ==============================================================================
-- Migration: Fix Superadmin Profile Update RLS & Safe Role Management RPC
-- Jalankan file ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Perbarui check constraint pada kolom role agar mengizinkan 'student', 'superadmin', dan 'suspended'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'superadmin', 'suspended'));

-- 2. Kebijakan RLS agar Superadmin diizinkan memperbarui (UPDATE) data & role pada profil pengguna lain
drop policy if exists "Superadmin can update all profiles" on public.profiles;
create policy "Superadmin can update all profiles"
  on public.profiles for update
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- 3. Database-Level Safe RPC Function (Security Definer)
-- Menghilangkan silent failure dan menjamin perubahan role 100% tereksekusi di database
create or replace function public.admin_set_user_role(target_user_id uuid, target_role text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_count int;
begin
  -- Validasi otorisasi pemanggil: hanya Superadmin yang boleh mengeksekusi
  if not public.is_superadmin() then
    raise exception 'Akses ditolak: Hanya Superadmin yang berwenang mengubah role akun.';
  end if;

  -- Validasi role target
  if target_role not in ('student', 'superadmin', 'suspended') then
    raise exception 'Role target tidak valid. Pilihan yang diizinkan: student, superadmin, suspended.';
  end if;

  -- Eksekusi update langsung ke tabel profiles
  update public.profiles
  set role = target_role,
      updated_at = now()
  where id = target_user_id;

  get diagnostics updated_count = row_count;

  if updated_count = 0 then
    raise exception 'Pengguna dengan ID % tidak ditemukan di tabel profiles.', target_user_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'target_user_id', target_user_id,
    'new_role', target_role
  );
end;
$$;

-- Berikan izin akses eksekusi fungsi ke user authenticated dan service_role
grant execute on function public.admin_set_user_role to authenticated;
grant execute on function public.admin_set_user_role to service_role;
