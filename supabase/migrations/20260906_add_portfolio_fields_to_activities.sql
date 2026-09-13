-- Migration: Tambahkan kolom is_portfolio dan peran_portfolio ke tabel activities
-- Jalankan di Supabase Dashboard → SQL Editor → Run

alter table public.activities
  add column if not exists is_portfolio boolean not null default false,
  add column if not exists peran_portfolio text check (char_length(trim(coalesce(peran_portfolio, ''))) <= 120);

-- Index untuk query portofolio lebih cepat
create index if not exists idx_activities_portfolio on public.activities (user_id, is_portfolio, status);

comment on column public.activities.is_portfolio is 'Tandai apakah kegiatan ini layak masuk CV / portofolio semester mahasiswa';
comment on column public.activities.peran_portfolio is 'Peran spesifik mahasiswa dalam kegiatan ini, untuk ditampilkan di CV (contoh: Ketua Pelaksana, Juara 2 Nasional)';
