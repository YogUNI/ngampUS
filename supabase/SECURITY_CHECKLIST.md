# Panduan & Checklist Keamanan Supabase nGampUS 🛡️

Dokumen ini berisi langkah audit dan rekomendasi keamanan untuk mengunci database dan autentikasi Supabase nGampUS dari potensi pembobolan.

---

## 1. Verifikasi Status Row Level Security (RLS)
Pastikan semua tabel berikut memiliki status **RLS Enabled** di Supabase Dashboard -> **Table Editor** -> tanda gembok hijau:

| Nama Tabel | Status RLS Wajib | Policy Scope |
| :--- | :---: | :--- |
| `public.profiles` | ✅ ENABLED | `auth.uid() = id` |
| `public.semesters` | ✅ ENABLED | `auth.uid() = user_id` |
| `public.courses` | ✅ ENABLED | `auth.uid() = user_id` |
| `public.activities` | ✅ ENABLED | `auth.uid() = user_id` |
| `public.organizations` | ✅ ENABLED | `auth.uid() = user_id` |
| `public.organization_positions` | ✅ ENABLED | `auth.uid() = user_id` |
| `public.programs` | ✅ ENABLED | `auth.uid() = user_id` |

> ⚠️ **Penting:** Jangan pernah mematikan RLS pada tabel mana pun di atas! Jika RLS mati, siapa pun yang memiliki `NEXT_PUBLIC_SUPABASE_ANON_KEY` dapat menarik seluruh data pengguna lain via REST API.

---

## 2. Pengaturan Autentikasi (Supabase Dashboard -> Authentication)

### A. Rate Limiting (Mencegah Brute Force & Spamming Bot)
Masuk ke **Authentication -> Rate Limits**:
* **Email Sign In / Magic Link**: Batasi maksimal 5-10 percobaan per jam per IP/email.
* **Sign Up**: Batasi maksimal 5-10 pendaftaran per jam per IP.
* **Password Recovery**: Batasi maksimal 3-5 permintaan per jam.

### B. Password Security
Masuk ke **Authentication -> Providers -> Email**:
* **Minimum Password Length**: Minimal **8 karakter** (rekomendasi: 10 karakter).
* **Leaked Password Detection**: Aktifkan fitur *Enable HaveIBeenPwned check* (Supabase bawaan) agar user tidak bisa menggunakan password yang sudah pernah bocor di internet.

### C. Session & Token Expiry
Masuk ke **Authentication -> URL Configuration & Sessions**:
* **Access Token (JWT) Expiry**: 3600 detik (1 jam) — Next.js middleware nGampUS otomatis memperbarui token ini di background.
* **Refresh Token Expiry**: 30 hari.
* **Revoke refresh tokens on password change**: Aktifkan (YES) agar jika user mengganti password, semua sesi di HP/laptop lain otomatis logout.

---

## 3. Storage Bucket Security (Jika Menggunakan Supabase Storage untuk Foto/Lampiran)
Jika nanti membuat bucket (misal: `avatars` atau `activity-attachments`):
* Gunakan bucket **Private** jika berkas bersifat sensitif.
* Buat Policy Storage:
  ```sql
  -- Hanya pemilik yang bisa upload foto ke foldernya sendiri:
  create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  ```

---

## 4. Environment Variables & Secret Protection
* `NEXT_PUBLIC_SUPABASE_URL`: Boleh publik (ada di browser).
* `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Anon Key): Boleh publik (aman karena dijaga oleh RLS).
* `SUPABASE_SERVICE_ROLE_KEY`: **HARUS RAHASIA!**
  - JANGAN PERNAH menyematkan `service_role` key di frontend Next.js.
  - JANGAN PERNAH diawali `NEXT_PUBLIC_`.
  - Hanya boleh digunakan untuk background worker / cron job internal di server.
