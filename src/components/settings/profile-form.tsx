"use client";

import { useState, useTransition } from "react";
import {
  BadgeCheck,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Hash,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Shield,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import { useToast } from "@/components/ui/toast-provider";

type Profile = {
  full_name?: string | null;
  university?: string | null;
  major?: string | null;
  student_id?: string | null;
  phone?: string | null;
  bio?: string | null;
  angkatan?: string | null;
  linkedin?: string | null;
  github?: string | null;
};

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [charCount, setCharCount] = useState((profile?.bio ?? "").length);

  const initial = (profile?.full_name || email || "M").slice(0, 1).toUpperCase();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateProfile(formData);
        showToast("Profil berhasil disimpan! ✨", "success");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan profil.";
        showToast(msg, "error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">

      {/* ── Page Header ── */}
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--brand)]">PERSONAL WORKSPACE</p>
        <h1 className="font-display mt-2 text-4xl font-black tracking-tight">Profil & pengaturan</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Data ini membuat workspace nGampUS benar-benar terasa milikmu.
        </p>
      </header>

      {/* ── Campus Passport Card ── */}
      <section className="relative mt-8 overflow-hidden rounded-3xl border border-[#0f6849]/30 bg-gradient-to-br from-[#103828] via-[#174633] to-[#0a291d] p-7 text-white shadow-xl shadow-[#0a291d]/20">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 -translate-y-14 translate-x-14 rounded-full bg-[#d9ee72]/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 translate-y-12 rounded-full bg-[#0f6849]/30 blur-xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-black text-[#d9ee72] ring-1 ring-white/20">
              {initial}
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#d9ee72]">
                <Sparkles size={10} /> Campus Passport
              </span>
              <h2 className="font-display mt-1.5 text-2xl font-extrabold">
                {profile?.full_name || "Mahasiswa nGampUS"}
              </h2>
              <p className="mt-0.5 text-sm text-white/70">{email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90">
                {profile?.major && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[#c8ef70]" />
                    {profile.major}
                  </span>
                )}
                {profile?.major && profile?.university && <span className="text-white/30">·</span>}
                {profile?.university && <span>{profile.university}</span>}
                {profile?.angkatan && (
                  <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-bold">
                    Angkatan {profile.angkatan}
                  </span>
                )}
              </div>
              {profile?.bio && (
                <p className="mt-3 max-w-md text-xs leading-relaxed text-white/60 italic">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* NIM Badge */}
          {profile?.student_id && (
            <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-right backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">NIM / ID</p>
              <p className="font-mono text-sm font-bold text-white">{profile.student_id}</p>
            </div>
          )}
        </div>

        {/* Social Links Preview */}
        {(profile?.linkedin || profile?.github) && (
          <div className="relative mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/20"
              >
                <ExternalLink size={12} /> LinkedIn
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white/80 transition hover:bg-white/20"
              >
                <ExternalLink size={12} /> GitHub
              </a>
            )}
          </div>
        )}
      </section>

      {/* ── Form ── */}
      <form
        action={handleSubmit}
        className="mt-6 space-y-5"
      >
        {/* Section: Identitas */}
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dcefe4] text-[var(--brand)]">
              <UserRound size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold">Identitas mahasiswa</h2>
              <p className="text-xs text-[var(--muted)]">
                Lengkapi sekali, lalu siap dipakai di seluruh aplikasi.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              icon={<User size={15} />}
              label="Nama lengkap"
              className="sm:col-span-2"
            >
              <input
                required
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Nama lengkap kamu"
              />
            </FormField>

            <FormField icon={<Mail size={15} />} label="Email akun" className="sm:col-span-2">
              <input
                disabled
                value={email}
                className="cursor-not-allowed !bg-[#f7f8f5] !text-[var(--muted)]"
              />
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                <Shield size={11} className="mr-1 inline" />
                Email dikelola oleh autentikasi Supabase dan tidak bisa diubah di sini.
              </p>
            </FormField>

            <FormField icon={<GraduationCap size={15} />} label="Universitas">
              <input
                name="university"
                defaultValue={profile?.university ?? ""}
                placeholder="Contoh: Universitas Mercu Buana"
              />
            </FormField>

            <FormField icon={<BookOpen size={15} />} label="Program studi">
              <input
                name="major"
                defaultValue={profile?.major ?? ""}
                placeholder="Contoh: Teknik Informatika"
              />
            </FormField>

            <FormField icon={<Hash size={15} />} label="NIM">
              <input
                name="student_id"
                defaultValue={profile?.student_id ?? ""}
                placeholder="Contoh: 41523110001"
              />
            </FormField>

            <FormField icon={<BadgeCheck size={15} />} label="Angkatan">
              <input
                name="angkatan"
                defaultValue={profile?.angkatan ?? ""}
                placeholder="Contoh: 2023"
                maxLength={4}
              />
            </FormField>

            <FormField icon={<Phone size={15} />} label="Nomor WhatsApp" className="sm:col-span-2">
              <input
                name="phone"
                inputMode="tel"
                defaultValue={profile?.phone ?? ""}
                placeholder="Contoh: 081234567890"
              />
            </FormField>

            <FormField
              icon={<MessageSquare size={15} />}
              label="Bio singkat"
              className="sm:col-span-2"
            >
              <textarea
                name="bio"
                maxLength={280}
                rows={3}
                defaultValue={profile?.bio ?? ""}
                placeholder="Contoh: Mahasiswa aktif yang menyeimbangkan kuliah, organisasi, dan riset."
                onChange={(e) => setCharCount(e.target.value.length)}
              />
              <p className="mt-1.5 flex justify-between text-xs text-[var(--muted)]">
                <span>Muncul di Campus Passport-mu.</span>
                <span className={charCount > 250 ? "font-bold text-[#c53e1c]" : ""}>
                  {charCount}/280
                </span>
              </p>
            </FormField>
          </div>
        </div>

        {/* Section: Social & Links */}
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8e1fa] text-[#5c3a9c]">
              <ExternalLink size={18} />
            </span>
            <div>
              <h2 className="font-display text-lg font-extrabold">Tautan & jejaring</h2>
              <p className="text-xs text-[var(--muted)]">
                Tambahkan profil LinkedIn atau GitHub untuk ditampilkan di passport.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField label="URL LinkedIn">
              <input
                name="linkedin"
                type="url"
                defaultValue={profile?.linkedin ?? ""}
                placeholder="https://linkedin.com/in/username"
              />
            </FormField>
            <FormField label="URL GitHub">
              <input
                name="github"
                type="url"
                defaultValue={profile?.github ?? ""}
                placeholder="https://github.com/username"
              />
            </FormField>
          </div>
        </div>

        {/* Section: Account Security Info */}
        <div className="rounded-3xl border border-[var(--line)] bg-[#f9fbf9] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fff0cc] text-[#8a5d00]">
              <Shield size={16} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold">Keamanan akun</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Password dan email autentikasi dikelola secara aman melalui Supabase Auth. 
                Untuk mengubah password, gunakan fitur reset password yang dikirim ke email kamu.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm">
          <p className="text-xs text-[var(--muted)]">
            Perubahanmu tersimpan secara aman di cloud.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm font-black text-white shadow-md shadow-[#0f6849]/20 transition hover:bg-[var(--brand-dark)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} /> Simpan profil
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Reusable Field wrapper ──
function FormField({
  label,
  icon,
  className = "",
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`block text-sm font-bold text-[var(--ink)] ${className} [&_input]:mt-1.5 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[var(--brand)] [&_input]:focus:ring-2 [&_input]:focus:ring-[var(--brand)]/10 [&_textarea]:mt-1.5 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:text-sm [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:focus:border-[var(--brand)] [&_textarea]:focus:ring-2 [&_textarea]:focus:ring-[var(--brand)]/10`}
    >
      <span className="flex items-center gap-1.5">
        {icon && <span className="text-[var(--muted)]">{icon}</span>}
        {label}
      </span>
      {children}
    </label>
  );
}
