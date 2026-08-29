-- Run once in Supabase SQL Editor after the existing profile migrations.
-- Do not rerun schema.sql; this migration preserves existing users and data.
alter table public.profiles alter column university drop default;
alter table public.profiles alter column major drop default;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, university, major)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'university', new.raw_user_meta_data ->> 'major');
  return new;
end;
$$ language plpgsql security definer set search_path = public;
