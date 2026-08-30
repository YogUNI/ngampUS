"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  Camera,
  ExternalLink,
  GraduationCap,
  Hash,
  Mail,
  MessageSquare,
  Phone,
  QrCode,
  Save,
  Shield,
  Sparkles,
  User,
  UserRound,
  IdCard,
  Trash2,
} from "lucide-react";
import { updateProfile } from "@/app/(dashboard)/settings/actions";
import { useToast } from "@/components/ui/toast-provider";
import { ImageCropModal } from "@/components/settings/image-crop-modal";

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
  avatar_url?: string | null;
};

export function ProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Photo & Crop states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live preview state synced with inputs
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [university, setUniversity] = useState(profile?.university || "");
  const [major, setMajor] = useState(profile?.major || "");
  const [studentId, setStudentId] = useState(profile?.student_id || "");
  const [angkatan, setAngkatan] = useState(profile?.angkatan || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [linkedin, setLinkedin] = useState(profile?.linkedin || "");
  const [github, setGithub] = useState(profile?.github || "");

  const initial = (fullName || email || "M").slice(0, 1).toUpperCase();

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Harap pilih file gambar (JPG, PNG, WebP).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran file maksimal 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  // Crop save handler
  const handleSaveCroppedImage = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
    showToast("Foto profil disesuaikan! Klik 'Simpan Perubahan' untuk mengunci.", "success");
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    showToast("Foto profil dihapus.", "success");
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (avatarUrl) {
          formData.set("avatar_url", avatarUrl);
        } else {
          formData.delete("avatar_url");
        }
        await updateProfile(formData);
        showToast("Profil dan foto berhasil disimpan! ✨", "success");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan profil.";
        showToast(msg, "error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

      {/* ── Hidden File Input ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Image Crop / Adjustment Modal ── */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageSrc}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleSaveCroppedImage}
      />

      {/* ── Page Header ── */}
      <header className="mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-[var(--brand)]">PERSONAL WORKSPACE</p>
        <h1 className="font-display mt-1 text-3xl sm:text-4xl font-black tracking-tight text-[var(--ink)]">
          Profil & Identitas Mahasiswa
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Kelola data pribadi, upload & sesuaikan foto profil, serta nikmati kartu KTM digital interaktif.
        </p>
      </header>

      {/* ── 2-Column Responsive Layout: Mobile shows KTM on top (order-1), Desktop shows Form Left & KTM Right ── */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">

        {/* ── RIGHT COLUMN: DIGITAL KTM (On Mobile: ORDER-1 Top; On Desktop: ORDER-2 Right) ── */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-6 space-y-5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#dff3e5] text-[var(--brand)]">
                <IdCard size={15} strokeWidth={2.5}/>
              </span>
              <p className="text-xs font-black uppercase tracking-wider text-[var(--brand)]">KARTU MAHASISWA DIGITAL (KTM)</p>
            </div>
            <span className="rounded-full bg-[#d9ee72]/30 px-2 py-0.5 text-[10px] font-black text-[#103626]">LIVE PREVIEW</span>
          </div>

          {/* Premium Digital ID Card / KTM */}
          <div className="relative overflow-hidden rounded-[2rem] border border-[#0f6849]/40 bg-gradient-to-br from-[#0c2e20] via-[#12422f] to-[#071f15] p-6 text-white shadow-2xl shadow-[#0c2e20]/40">
            {/* Holographic / Metallic background glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#d9ee72]/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-[#0f6849]/40 blur-xl" />
            
            {/* Card Header */}
            <div className="relative flex items-center justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo_ngampUS.png"
                  alt="ngampUS Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain drop-shadow"
                />
                <div>
                  <span className="font-display block text-lg font-black tracking-tight leading-none text-white">
                    ngamp<span className="text-[#c8ef70]">US</span>
                  </span>
                  <span className="text-[8px] font-black tracking-[0.2em] text-[#b4d8c1]">STUDENT DIGITAL PASS</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg border border-[#c8ef70]/30 bg-[#c8ef70]/10 px-2.5 py-1 text-[10px] font-black text-[#d8f89a]">
                <Sparkles size={11} className="text-[#c8ef70]" /> AKTIF
              </div>
            </div>

            {/* Photo & Main Details */}
            <div className="relative mt-5 flex items-start gap-4">
              {/* Photo Frame / Avatar */}
              <div className="relative group shrink-0">
                <div className="relative h-20 w-20 sm:h-22 sm:w-22 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#1b533c] to-[#2a7a58] ring-2 ring-[#c8ef70]/40 shadow-inner flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-black text-[#d9ee72]">
                      {initial}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[#c8ef70] text-[#103626] shadow-sm">
                  <BadgeCheck size={14} strokeWidth={2.5}/>
                </div>
              </div>

              {/* Bio & Identification Info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl sm:text-2xl font-black leading-snug tracking-tight text-white truncate">
                  {fullName || "Nama Mahasiswa"}
                </h3>
                <p className="font-mono text-xs font-bold text-[#c8ef70] tracking-wider mt-0.5">
                  {studentId ? `NIM: ${studentId}` : "NIM: Belum diisi"}
                </p>
                <p className="mt-2 text-xs font-semibold text-white/90 leading-tight">
                  {major || "Program Studi"}
                </p>
                <p className="text-[11px] text-[#b4d8c1] font-medium leading-tight">
                  {university || "Universitas"} {angkatan ? `(Angkatan ${angkatan})` : ""}
                </p>
              </div>
            </div>

            {/* Bio Quote */}
            {bio && (
              <div className="relative mt-4 rounded-xl bg-white/[0.06] p-3 border border-white/10">
                <p className="text-xs italic text-white/80 line-clamp-2 leading-relaxed">
                  &ldquo;{bio}&rdquo;
                </p>
              </div>
            )}

            {/* Bottom Card Footer: Barcode / QR & Contact */}
            <div className="relative mt-5 pt-4 border-t border-white/10 flex items-end justify-between gap-4">
              <div className="space-y-1 text-[11px] text-white/70">
                <p className="truncate max-w-[200px]">✉️ {email}</p>
                {phone && <p>📱 {phone}</p>}
              </div>

              {/* Simulated Micro QR / Security Seal */}
              <div className="flex flex-col items-center">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 p-1 text-[#c8ef70] ring-1 ring-white/20">
                  <QrCode size={24} strokeWidth={1.75} />
                </div>
                <span className="mt-1 text-[8px] font-mono text-white/50 tracking-widest">VERIFIED ID</span>
              </div>
            </div>

            {/* Social Links on KTM */}
            {(linkedin || github) && (
              <div className="relative mt-4 flex flex-wrap gap-2 pt-3 border-t border-white/10">
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/90 transition hover:bg-white/20"
                  >
                    <ExternalLink size={11} /> LinkedIn
                  </a>
                )}
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/90 transition hover:bg-white/20"
                  >
                    <ExternalLink size={11} /> GitHub
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Security & System Info note card */}
          <div className="rounded-3xl border border-[var(--line)] bg-white p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
                <Shield size={16} />
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">Kartu Identitas Terintegrasi</h4>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                  Foto dan data ini disinkronkan secara realtime dengan akun workspace ngampUS dan langsung terpasang di kartu KTM digitalmu.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── LEFT COLUMN: EDIT FORM (On Mobile: ORDER-2 Bottom; On Desktop: ORDER-1 Left) ── */}
        <form action={handleSubmit} className="order-2 lg:order-1 space-y-6">

          {/* Section: Upload & Edit Foto Profil */}
          <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dcefe4] text-[var(--brand)]">
                <Camera size={18} />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[var(--ink)]">Foto Profil</h2>
                <p className="text-xs text-[var(--muted)]">
                  Sesuaikan posisi, zoom, dan rotasi agar pas di kartu KTM.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-5">
              {/* Photo Preview Thumbnail */}
              <div className="relative group shrink-0">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gradient-to-tr from-[#103626] to-[#246145] ring-2 ring-[var(--brand)]/30 shadow-inner flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-[#d9ee72]">
                      {initial}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--brand-dark)] transition active:scale-95"
                >
                  <Camera size={15} />
                  {avatarUrl ? "Ganti & Edit Foto" : "Upload Foto Baru"}
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 rounded-2xl border border-[#f5c6cb] bg-[#fff5f5] px-3.5 py-2.5 text-xs font-bold text-[#b93c21] hover:bg-[#ffebee] transition active:scale-95"
                  >
                    <Trash2 size={14} />
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-[11px] text-[var(--muted)]">
              Format: JPG, PNG, atau WebP (maks. 5MB). Kamu bisa zoom & geser posisi setelah memilih foto.
            </p>
          </div>

          {/* Section: Identitas */}
          <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dcefe4] text-[var(--brand)]">
                <UserRound size={18} />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[var(--ink)]">Identitas Mahasiswa</h2>
                <p className="text-xs text-[var(--muted)]">
                  Data utama yang tercantum di kartu identitas kampus.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField icon={<User size={15} />} label="Nama Lengkap" className="sm:col-span-2">
                <input
                  required
                  name="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap kamu"
                />
              </FormField>

              <FormField icon={<Mail size={15} />} label="Email Akun" className="sm:col-span-2">
                <input
                  disabled
                  value={email}
                  className="cursor-not-allowed !bg-[#f7f8f5] !text-[var(--muted)]"
                />
                <p className="mt-1.5 text-xs text-[var(--muted)]">
                  <Shield size={11} className="mr-1 inline text-[var(--brand)]" />
                  Email terikat dengan otentikasi akun Supabase.
                </p>
              </FormField>

              <FormField icon={<GraduationCap size={15} />} label="Universitas / Kampus">
                <input
                  name="university"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Contoh: Universitas Mercu Buana"
                />
              </FormField>

              <FormField icon={<BookOpen size={15} />} label="Program Studi / Jurusan">
                <input
                  name="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Contoh: Teknik Informatika"
                />
              </FormField>

              <FormField icon={<Hash size={15} />} label="NIM / ID Mahasiswa">
                <input
                  name="student_id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Contoh: 41523110001"
                />
              </FormField>

              <FormField icon={<BadgeCheck size={15} />} label="Tahun Angkatan">
                <input
                  name="angkatan"
                  value={angkatan}
                  onChange={(e) => setAngkatan(e.target.value)}
                  placeholder="Contoh: 2023"
                  maxLength={4}
                />
              </FormField>

              <FormField icon={<Phone size={15} />} label="Nomor WhatsApp" className="sm:col-span-2">
                <input
                  name="phone"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                />
              </FormField>

              <FormField icon={<MessageSquare size={15} />} label="Bio Singkat / Motto" className="sm:col-span-2">
                <textarea
                  name="bio"
                  maxLength={280}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contoh: Mahasiswa aktif yang menyeimbangkan kuliah, organisasi, dan inovasi."
                />
                <p className="mt-1.5 flex justify-between text-xs text-[var(--muted)]">
                  <span>Akan tampil di kartu KTM & passport.</span>
                  <span className={bio.length > 250 ? "font-bold text-[#c53e1c]" : ""}>
                    {bio.length}/280
                  </span>
                </p>
              </FormField>
            </div>
          </div>

          {/* Section: Social Links */}
          <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8e1fa] text-[#5c3a9c]">
                <ExternalLink size={18} />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[var(--ink)]">Tautan & Jejaring</h2>
                <p className="text-xs text-[var(--muted)]">
                  Tautan profil profesional dan portofolio.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField label="URL LinkedIn">
                <input
                  name="linkedin"
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </FormField>
              <FormField label="URL GitHub">
                <input
                  name="github"
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                />
              </FormField>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between rounded-3xl border border-[var(--line)] bg-white p-5 shadow-sm">
            <p className="text-xs text-[var(--muted)] font-medium">
              Perubahan otomatis tersimpan ke cloud.
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3.5 text-sm font-black text-white shadow-md shadow-[#0f6849]/20 transition hover:bg-[var(--brand-dark)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  <Save size={16} /> Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reusable Field Wrapper ──
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
