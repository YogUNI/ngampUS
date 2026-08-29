# nGampUS

Personal activity, organization, and program tracker untuk mahasiswa aktif. nGampUS menyatukan semester, organisasi, kegiatan, dan deadline dalam satu workspace yang aman per pengguna.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Supabase: PostgreSQL, Auth, Row Level Security, SSR cookies
- React Hook Form + Zod
- FullCalendar

## Fitur MVP

- Register, login, logout, dan halaman dashboard terlindungi.
- Semester: tambah, tandai aktif, hapus.
- Organisasi: tambah dan hapus.
- Kegiatan: tambah task ber-deadline, ubah menjadi selesai, filter kategori/status, serta kalender bulanan.
- Dashboard: statistik dan deadline 3 hari mendatang.

## Setup lokal

1. Install dependencies.

   ```bash
   npm install
   ```

2. Buat project baru di Supabase, lalu buka **SQL Editor** dan jalankan seluruh isi [supabase/schema.sql](./supabase/schema.sql).

3. Salin `.env.example` menjadi `.env.local`, lalu isi dua credential browser dari **Supabase Dashboard → Connect**.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
   ```

   `SUPABASE_SERVICE_ROLE_KEY` tidak dibutuhkan untuk MVP dan tidak boleh diberikan ke browser atau di-commit.

4. Di Supabase Auth, aktifkan Email provider. Untuk uji lokal cepat, nonaktifkan **Confirm email**; bila tetap aktif, ubah URL redirect ke `http://localhost:3000` dan konfirmasi email sebelum login.

5. Jalankan app.

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Uji keamanan RLS

1. Buat dua akun berbeda.
2. Dengan akun A, buat semester, organisasi, dan kegiatan.
3. Keluar lalu masuk sebagai akun B.
4. Pastikan data akun A tidak muncul, tidak dapat diperbarui, dan tidak dapat dihapus.

Kebijakan RLS berada di `schema.sql`. Semua operasi client tetap membawa session user Supabase; tidak ada service role key di client.

## Struktur ringkas

```text
src/
  app/                 # Route App Router dan server actions
  components/          # UI auth, dashboard, semester, organisasi, kegiatan
  lib/supabase/        # Browser dan server Supabase clients
supabase/schema.sql    # Tables, constraints, triggers, RLS, views
```

## Perintah pemeriksaan

```bash
npm run lint
npx tsc --noEmit
npm run build
```
