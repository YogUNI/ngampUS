# Panduan & Checklist Keamanan Sistem nGampUS 🛡️
### *Hardening Standard untuk Perlindungan Data Rahasia Mahasiswa*

Dokumen ini adalah standar operasional keamanan (**Defense-in-Depth**) untuk memastikan seluruh data akademik, identitas (NIM, nomor telepon, email, dokumen kuliah, dan catatan organisasi) mahasiswa nGampUS terlindungi dari upaya peretasan (*data breach*, SQL Injection, XSS, CSRF, IDOR, dan account takeover).

---

## 1. Verifikasi Status Row Level Security (RLS) PostgreSQL
Setiap tabel di Supabase wajib memiliki status **RLS Enabled** dengan policy ketat berbasis `auth.uid() = user_id` (atau `auth.uid() = id` untuk tabel `profiles`).

| Nama Tabel | Status RLS | Aturan Policy (SELECT / INSERT / UPDATE / DELETE) |
| :--- | :---: | :--- |
| `public.profiles` | ✅ **LOCKED** | `auth.uid() = id` (User hanya dapat melihat & memperbarui profil pribadinya) |
| `public.semesters` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.courses` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.course_modules` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.module_quizzes` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.module_chats` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.activities` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.organizations` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.organization_positions` | ✅ **LOCKED** | `auth.uid() = user_id` |
| `public.programs` | ✅ **LOCKED** | `auth.uid() = user_id` |

> 🔒 **Anti-IDOR (Insecure Direct Object References):** Walaupun penyerang menebak atau mengetahui UUID modul atau kegiatan mahasiswa lain, database PostgreSQL akan langsung menolak query (`0 rows affected`) karena filter RLS dieksekusi di level kernel database.

---

## 2. Pengaturan Autentikasi (Supabase Dashboard -> Authentication)

### A. Rate Limiting (Mencegah Serangan Brute Force & Credential Stuffing)
Masuk ke **Supabase Dashboard -> Authentication -> Rate Limits**:
* **Email Sign In / Password Login**: Batasi maksimal **5–10 percobaan per 15 menit** per IP/email.
* **Sign Up**: Batasi maksimal **5–10 pendaftaran per jam** per IP.
* **Password Recovery / Reset**: Batasi maksimal **3 permintaan per jam**.

### B. Password Hygiene & Kebocoran Kredensial
Masuk ke **Authentication -> Providers -> Email**:
* **Minimum Password Length**: Wajib minimal **8 karakter** (rekomendasi: 10 karakter).
* **Leaked Password Detection (HaveIBeenPwned)**: **WAJIB AKTIFKAN**. Supabase akan otomatis memblokir kata sandi mahasiswa yang pernah terindikasi bocor di internet.
* **Confirm Email**: Aktifkan verifikasi email untuk mencegah akun spam bot.

### C. Session Token Lifecycle & Revocation
Masuk ke **Authentication -> URL Configuration & Sessions**:
* **JWT Access Token Expiry**: `3600` detik (1 jam). Next.js Middleware nGampUS otomatis melakukan refresh token di background.
* **Refresh Token Expiry**: `30` hari.
* **Revoke Refresh Tokens on Password Change**: **AKTIFKAN (YES)**. Jika mahasiswa mengubah password karena merasa akunnya dicurigai, semua sesi login di laptop dan HP lain otomatis terputus.

---

## 3. Storage Bucket Security (`course-materials` & `avatars`)
Untuk file lampiran perkuliahan (PDF, DOCX, PPTX) dan foto KTM:
* **JANGAN buat bucket berstatus Full Public** tanpa kebijakan RLS.
* Terapkan policy RLS pada `storage.objects` agar hanya mahasiswa pemilik folder yang dapat mengunggah, menghapus, atau mengganti file:
  ```sql
  -- Mahasiswa hanya boleh upload ke foldernya sendiri:
  create policy "User can upload to own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'course-materials' and (storage.foldername(name))[1] = auth.uid()::text);

  -- Mahasiswa hanya boleh menghapus file miliknya:
  create policy "User can delete own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'course-materials' and (storage.foldername(name))[1] = auth.uid()::text);
  ```

---

## 4. Perlindungan HTTP Headers & XSS/Clickjacking (Next.js & Edge)
Aplikasi telah diproteksi dengan header keamanan tingkat industri:
1. **Content-Security-Policy (CSP)**: Membatasi eksekusi skrip pihak ketiga yang tidak diizinkan.
2. **X-Frame-Options: DENY**: Mencegah web dibungkus ke dalam `<iframe>` phising (Anti-Clickjacking).
3. **X-Content-Type-Options: nosniff**: Mencegah browser mengeksekusi file non-eksekusi sebagai skrip (MIME Sniffing).
4. **Strict-Transport-Security (HSTS)**: Memaksa enkripsi SSL/TLS HTTPS selama 2 tahun (`max-age=63072000`).
5. **Permissions-Policy**: Mematikan akses sensor hardware (kamera, mikrofon, geolokasi) yang tidak diperlukan.
6. **Anti-Open Redirect**: Validasi path `next` pada callback auth agar tidak bisa dibelokkan ke domain berbahaya penipu.
7. **Strict URL Protocol Filter**: Validasi Zod pada seluruh tautan eksternal (link meet, materi, tugas, LinkedIn, GitHub) dengan regex `^https?://` guna memblokir serangan vektor `javascript:` URI.

---

## 5. Manajemen Kunci Rahasia (Environment Variables)
* `NEXT_PUBLIC_SUPABASE_URL`: Publik aman (dijaga RLS).
* `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Publik aman (dijaga RLS).
* `GEMINI_API_KEY`: **RAHASIA SERVER**. Disimpan di server-side (`.env.local`), tidak memiliki prefix `NEXT_PUBLIC_`, dan tidak pernah bocor ke browser client.
* `SUPABASE_SERVICE_ROLE_KEY`: **SUPER RAHASIA (BYPASS RLS)**. Jangan pernah dipasang di kode frontend atau client.
