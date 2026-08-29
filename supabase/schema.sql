-- nGampUS schema. Run once in the Supabase SQL editor before using the app.
create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null unique,
  university text default 'Universitas Mercu Buana',
  major text default 'Teknik Informatika',
  student_id text,
  phone text,
  bio text check (bio is null or char_length(bio) <= 280),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama_semester text not null check (char_length(trim(nama_semester)) between 1 and 80),
  tanggal_mulai date not null,
  tanggal_selesai date not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint semester_tanggal_valid check (tanggal_selesai >= tanggal_mulai),
  constraint semesters_id_user_unique unique (id, user_id)
);
create unique index idx_one_active_semester_per_user on public.semesters (user_id) where is_active;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama_organisasi text not null check (char_length(trim(nama_organisasi)) between 1 and 140),
  tipe text not null default 'organisasi' check (tipe in ('organisasi', 'ukm', 'ukk', 'kepanitiaan', 'lainnya')),
  periode_mulai date,
  periode_selesai date,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_periode_valid check (periode_mulai is null or periode_selesai is null or periode_selesai >= periode_mulai),
  constraint organizations_id_user_unique unique (id, user_id)
);

create table public.organization_positions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  divisi text,
  jabatan text not null default 'Anggota' check (char_length(trim(jabatan)) between 1 and 120),
  mulai date,
  selesai date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint position_tanggal_valid check (mulai is null or selesai is null or selesai >= mulai),
  constraint position_owned_organization foreign key (organization_id, user_id) references public.organizations (id, user_id) on delete cascade
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  nama_proker text not null check (char_length(trim(nama_proker)) between 1 and 140),
  peran text,
  deskripsi text,
  tanggal_mulai date,
  tanggal_selesai date,
  status text not null default 'perencanaan' check (status in ('perencanaan', 'berjalan', 'selesai', 'dibatalkan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint program_tanggal_valid check (tanggal_mulai is null or tanggal_selesai is null or tanggal_selesai >= tanggal_mulai),
  constraint program_owned_organization foreign key (organization_id, user_id) references public.organizations (id, user_id) on delete cascade,
  constraint programs_id_user_organization_unique unique (id, user_id, organization_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid,
  organization_id uuid,
  program_id uuid,
  judul text not null check (char_length(trim(judul)) between 1 and 180),
  deskripsi text,
  kategori text not null default 'kuliah' check (kategori in ('kuliah', 'organisasi', 'lomba', 'event', 'lainnya')),
  jenis_item text not null default 'tugas' check (jenis_item in ('tugas', 'reminder', 'catatan')),
  status text not null default 'belum_mulai' check (status in ('belum_mulai', 'on_progress', 'selesai')),
  prioritas text not null default 'sedang' check (prioritas in ('rendah', 'sedang', 'tinggi')),
  tanggal_mulai date,
  deadline_status text not null default 'terjadwal' check (deadline_status in ('terjadwal', 'belum_ditentukan')),
  deadline date,
  jam_deadline time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_tanggal_valid check (tanggal_mulai is null or deadline is null or tanggal_mulai <= deadline),
  constraint activity_deadline_consistency check ((deadline_status = 'terjadwal' and deadline is not null) or (deadline_status = 'belum_ditentukan' and deadline is null and jam_deadline is null)),
  constraint activity_owned_semester foreign key (semester_id, user_id) references public.semesters (id, user_id) on delete set null (semester_id),
  constraint activity_owned_organization foreign key (organization_id, user_id) references public.organizations (id, user_id) on delete set null (organization_id),
  constraint activity_owned_program foreign key (program_id, user_id, organization_id) references public.programs (id, user_id, organization_id) on delete set null (program_id)
);

create index idx_activities_user_deadline on public.activities (user_id, deadline);
create index idx_activities_user_semester on public.activities (user_id, semester_id);
create index idx_activities_user_organization on public.activities (user_id, organization_id);
create index idx_positions_org on public.organization_positions (organization_id);
create index idx_programs_org on public.programs (organization_id);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, full_name, email) values (new.id, new.raw_user_meta_data ->> 'full_name', new.email); return new; end; $$;

create or replace function public.sync_profile_email() returns trigger language plpgsql security definer set search_path = public as $$
begin update public.profiles set email = new.email where id = new.id; return new; end; $$;

create or replace function public.enforce_single_active_semester() returns trigger language plpgsql set search_path = public as $$
begin
  if new.is_active then update public.semesters set is_active = false where user_id = new.user_id and id <> new.id and is_active; end if;
  return new;
end; $$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_semesters_updated before update on public.semesters for each row execute function public.set_updated_at();
create trigger trg_organizations_updated before update on public.organizations for each row execute function public.set_updated_at();
create trigger trg_positions_updated before update on public.organization_positions for each row execute function public.set_updated_at();
create trigger trg_programs_updated before update on public.programs for each row execute function public.set_updated_at();
create trigger trg_activities_updated before update on public.activities for each row execute function public.set_updated_at();
create trigger trg_on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create trigger trg_on_auth_user_email_updated after update of email on auth.users for each row execute function public.sync_profile_email();
create trigger trg_single_active_semester before insert or update on public.semesters for each row execute function public.enforce_single_active_semester();

alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_positions enable row level security;
alter table public.programs enable row level security;
alter table public.activities enable row level security;

create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "read own semesters" on public.semesters for select using (auth.uid() = user_id);
create policy "insert own semesters" on public.semesters for insert with check (auth.uid() = user_id);
create policy "update own semesters" on public.semesters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own semesters" on public.semesters for delete using (auth.uid() = user_id);

create policy "read own organizations" on public.organizations for select using (auth.uid() = user_id);
create policy "insert own organizations" on public.organizations for insert with check (auth.uid() = user_id);
create policy "update own organizations" on public.organizations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own organizations" on public.organizations for delete using (auth.uid() = user_id);

create policy "read own positions" on public.organization_positions for select using (auth.uid() = user_id);
create policy "insert own positions" on public.organization_positions for insert with check (auth.uid() = user_id);
create policy "update own positions" on public.organization_positions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own positions" on public.organization_positions for delete using (auth.uid() = user_id);

create policy "read own programs" on public.programs for select using (auth.uid() = user_id);
create policy "insert own programs" on public.programs for insert with check (auth.uid() = user_id);
create policy "update own programs" on public.programs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own programs" on public.programs for delete using (auth.uid() = user_id);

create policy "read own activities" on public.activities for select using (auth.uid() = user_id);
create policy "insert own activities" on public.activities for insert with check (auth.uid() = user_id);
create policy "update own activities" on public.activities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own activities" on public.activities for delete using (auth.uid() = user_id);

create view public.upcoming_deadlines with (security_invoker = true) as
select a.id, a.user_id, a.judul, a.kategori, a.jenis_item, a.deadline, a.jam_deadline, a.prioritas, a.status, o.nama_organisasi, p.nama_proker, a.deadline - current_date as sisa_hari
from public.activities a left join public.organizations o on o.id = a.organization_id left join public.programs p on p.id = a.program_id
where a.status <> 'selesai' and a.deadline_status = 'terjadwal' and a.jenis_item in ('tugas', 'reminder') and a.deadline between current_date and current_date + 3
order by a.deadline asc, a.jam_deadline asc nulls last;

create view public.items_without_deadline with (security_invoker = true) as
select a.id, a.user_id, a.judul, a.kategori, a.jenis_item, o.nama_organisasi
from public.activities a left join public.organizations o on o.id = a.organization_id
where a.deadline_status = 'belum_ditentukan' and a.status <> 'selesai'
order by a.created_at desc;
