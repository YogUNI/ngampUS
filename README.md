# nGampUS

Personal activity, organization, and program tracker untuk mahasiswa aktif. nGampUS menyatukan semester, organisasi, kegiatan, dan deadline dalam satu workspace yang aman per pengguna.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Supabase: PostgreSQL, Auth, Row Level Security, SSR cookies
- React Hook Form + Zod
- FullCalendar

## Fitur

- Auth aman: register, login, logout, session SSR, dan semua halaman workspace terlindungi.
- Profil mahasiswa: nama, email sinkron dari Auth, universitas, prodi, NIM, WhatsApp, dan bio.
- Semester: tambah, ubah, tandai aktif, hapus dengan konfirmasi, serta konteks semester aktif di sidebar dan dashboard.
- Organisasi: tambah, ubah, hapus, dan halaman detail setiap organisasi.
- Jabatan/divisi: simpan riwayat peran di masing-masing organisasi.
- Program kerja: simpan, ubah, pantau status, dan hapus proker per organisasi.
- Kegiatan: tugas, reminder, atau catatan; deskripsi, prioritas, tanggal mulai, jam deadline, deadline fleksibel, semester, organisasi, dan proker.
- Kegiatan: filter semester/organisasi/kategori/prioritas/status, ubah detail/status, tandai selesai, hapus dengan konfirmasi, dan kalender bulanan.
- Dashboard: statistik sesuai semester aktif, deadline 3 hari mendatang, dan pengingat ketika semester aktif belum dipilih.
- Rekap: metrik penyelesaian, distribusi kategori, filter semester, dan ekspor CSV UTF-8.

## Setup lokal

1. Install dependencies.

   ```bash
   npm install
   ```

2. Buat project baru di Supabase, lalu buka **SQL Editor** dan jalankan seluruh isi [supabase/schema.sql](./supabase/schema.sql).

   Jika project Supabase sudah dibuat menggunakan schema versi awal, jalankan juga migration yang sesuai secara berurutan: [20260829_expand_profiles.sql](./supabase/migrations/20260829_expand_profiles.sql), lalu [20260830_add_organization_position_roles.sql](./supabase/migrations/20260830_add_organization_position_roles.sql). Migration kedua menambahkan role terstruktur dan fungsi transaksi untuk membuat organisasi beserta jabatan awalnya.

3. Salin `.env.example` menjadi `.env.local`, lalu isi dua credential browser dari **Supabase Dashboard → Connect**.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
   ```

   `SUPABASE_SERVICE_ROLE_KEY` tidak dibutuhkan untuk MVP dan tidak boleh diberikan ke browser atau di-commit.

4. Di Supabase Auth, aktifkan Email provider. Untuk uji lokal cepat, nonaktifkan **Confirm email**; bila tetap aktif, tambahkan `http://localhost:3000` pada URL Configuration dan konfirmasi email sebelum login.

5. Jalankan app.

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Uji keamanan RLS

1. Buat dua akun berbeda.
2. Dengan akun A, buat semester, organisasi, jabatan, proker, dan kegiatan.
3. Keluar lalu masuk sebagai akun B.
4. Pastikan data akun A tidak muncul di semua halaman, tidak dapat diperbarui, dan tidak dapat dihapus.

Kebijakan RLS berada di `schema.sql`. Semua operasi client tetap membawa session user Supabase; tidak ada service role key di client.

## Struktur ringkas

```text
src/
  app/                 # Route App Router dan server actions
  components/          # UI auth, dashboard, semester, organisasi, kegiatan, rekap
  lib/supabase/        # Browser dan server Supabase clients
supabase/schema.sql    # Schema awal: tables, constraints, triggers, RLS, views
supabase/migrations/   # Migration aman untuk project yang sudah berjalan
```

## Perintah pemeriksaan

```bash
npm run lint
npx tsc --noEmit
npm run build
```
