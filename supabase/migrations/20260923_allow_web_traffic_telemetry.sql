-- ==============================================================================
-- Migration: Web Traffic Ingest Policy & Security Function
-- Jalankan file ini di Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Berikan hak akses kepada pengunjung (anonim & authenticated)
-- untuk meng-upsert data traffic (key berawalan 'web_traffic%')
-- Ini diperlukan agar PageTracker dari pengunjung publik (yang belum login)
-- dapat mencatat pageviews secara sah ke system_settings.

drop policy if exists "Allow anonymous traffic telemetry insert and update" on public.system_settings;

create policy "Allow anonymous traffic telemetry insert and update"
  on public.system_settings
  for all
  using (key like 'web_traffic%')
  with check (key like 'web_traffic%');

-- 2. Pastikan tabel system_settings memiliki replica identity full untuk realtime
alter table public.system_settings replica identity full;

-- 3. Beri notifikasi bahwa migrasi sukses
do $$
begin
  raise notice 'Web Traffic Policy successfully applied to system_settings.';
end $$;
