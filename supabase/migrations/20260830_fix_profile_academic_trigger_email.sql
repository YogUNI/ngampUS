-- Run once after 20260830_profile_academic_fields.sql.
-- Keeps Auth email synced into public.profiles when a new user registers.
-- This is a corrective migration for databases where email is NOT NULL.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, university, major)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'university',
    new.raw_user_meta_data ->> 'major'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
