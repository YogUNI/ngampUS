-- Run this once in Supabase SQL Editor for an existing nGampUS project.
-- It makes public.profiles useful for the app while keeping Auth as the source of truth for login email.

alter table public.profiles
  add column if not exists email text,
  add column if not exists student_id text,
  add column if not exists phone text,
  add column if not exists bio text,
  add column if not exists avatar_url text;

alter table public.profiles
  drop constraint if exists profiles_bio_length;

alter table public.profiles
  add constraint profiles_bio_length check (bio is null or char_length(bio) <= 280);

update public.profiles profile
set email = auth_user.email
from auth.users auth_user
where profile.id = auth_user.id
  and profile.email is distinct from auth_user.email;

alter table public.profiles alter column email set not null;
create unique index if not exists profiles_email_unique on public.profiles (email);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

create or replace function public.sync_profile_email() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_email_updated on auth.users;
create trigger trg_on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.sync_profile_email();
