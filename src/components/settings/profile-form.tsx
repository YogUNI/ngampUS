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
  Shield,
  Sparkles,
  User,
  UserRound,
  IdCard,
  Trash2,
  Pencil,
  Check,
  X,
  Lock,
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

  // Exclusive single-field editing state
  const [activeEditingField, setActiveEditingField] = useState<string | null>(null);

  // Live profile state synced with inputs
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [university, setUniversity] = useState(profile?.university || "");
  const [major, setMajor] = useState(profile?.major || "");
  const [studentId, setStudentId] = useState(profile?.student_id || "");
  const [angkatan, setAngkatan] = useState(profile?.angkatan || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [linkedin, setLinkedin] = useState(profile?.linkedin || "");
  const [github, setGithub] = useState(profile?.github || "");

  // Backup values for cancelling edit
  const [backupValues, setBackupValues] = useState<Record<string, string>>({
    full_name: profile?.full_name || "",
    university: profile?.university || "",
    major: profile?.major || "",
    student_id: profile?.student_id || "",
    angkatan: profile?.angkatan || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "",
    linkedin: profile?.linkedin || "",
    github: profile?.github || "",
  });

  const initial = (fullName || email || "M").slice(0, 1).toUpperCase();

  // Save specific field directly to server
  const saveFieldToServer = (updatedValues: Record<string, string | null>) => {
    const formData = new FormData();
    formData.set("full_name", updatedValues.full_name ?? fullName);
    formData.set("university", updatedValues.university ?? university);
    formData.set("major", updatedValues.major ?? major);
    formData.set("student_id", updatedValues.student_id ?? studentId);
    formData.set("angkatan", updatedValues.angkatan ?? angkatan);
    formData.set("phone", updatedValues.phone ?? phone);
    formData.set("bio", updatedValues.bio ?? bio);
    formData.set("linkedin", updatedValues.linkedin ?? linkedin);
    formData.set("github", updatedValues.github ?? github);
    
    if (updatedValues.avatar_url !== undefined) {
      if (updatedValues.avatar_url) formData.set("avatar_url", updatedValues.avatar_url);
    } else if (avatarUrl) {
      formData.set("avatar_url", avatarUrl);
    }

    startTransition(async () => {
      try {
        await updateProfile(formData);
        showToast("Perubahan data berhasil disimpan! ✨", "success");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal menyimpan perubahan.";
        showToast(msg, "error");
      }
    });
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeEditingField) {
      showToast("Selesaikan atau simpan pengeditan data terlebih dahulu.", "error");
      return;
    }

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

  // Crop save handler (auto save to server)
  const handleSaveCroppedImage = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
    saveFieldToServer({ avatar_url: croppedDataUrl });
  };

  const handleRemovePhoto = () => {
    if (activeEditingField) {
      showToast("Selesaikan atau simpan pengeditan data terlebih dahulu.", "error");
      return;
    }
    setAvatarUrl(null);
    saveFieldToServer({ avatar_url: null });
  };

  // Handler to start editing a field
  const handleStartEdit = (fieldKey: string) => {
    if (activeEditingField && activeEditingField !== fieldKey) {
      showToast("Selesaikan atau simpan perubahan data yang sedang aktif terlebih dahulu.", "error");
      return;
    }

    // Save current backup
    setBackupValues({
      full_name: fullName,
      university,
      major,
      student_id: studentId,
      angkatan,
      phone,
      bio,
      linkedin,
      github,
    });

    setActiveEditingField(fieldKey);
  };

  // Handler to cancel editing
  const handleCancelEdit = (fieldKey: string) => {
    if (fieldKey === "full_name") setFullName(backupValues.full_name || "");
    if (fieldKey === "university") setUniversity(backupValues.university || "");
    if (fieldKey === "major") setMajor(backupValues.major || "");
    if (fieldKey === "student_id") setStudentId(backupValues.student_id || "");
    if (fieldKey === "angkatan") setAngkatan(backupValues.angkatan || "");
    if (fieldKey === "phone") setPhone(backupValues.phone || "");
    if (fieldKey === "bio") setBio(backupValues.bio || "");
    if (fieldKey === "linkedin") setLinkedin(backupValues.linkedin || "");
    if (fieldKey === "github") setGithub(backupValues.github || "");

    setActiveEditingField(null);
  };

  // Handler to confirm single field edit and auto-save directly
  const handleConfirmEdit = (fieldKey: string) => {
    if (fieldKey === "full_name" && !fullName.trim()) {
      showToast("Nama lengkap tidak boleh kosong.", "error");
      return;
    }

    setActiveEditingField(null);

    const updated: Record<string, string> = {};
    if (fieldKey === "full_name") updated.full_name = fullName;
    if (fieldKey === "university") updated.university = university;
    if (fieldKey === "major") updated.major = major;
    if (fieldKey === "student_id") updated.student_id = studentId;
    if (fieldKey === "angkatan") updated.angkatan = angkatan;
    if (fieldKey === "phone") updated.phone = phone;
    if (fieldKey === "bio") updated.bio = bio;
    if (fieldKey === "linkedin") updated.linkedin = linkedin;
    if (fieldKey === "github") updated.github = github;

    saveFieldToServer(updated);
  };

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
          Klik tombol edit pada data yang ingin diubah, simpan, dan data akan otomatis terupdate secara instan.
        </p>
      </header>

      {/* ── 2-Column Responsive Layout: Mobile shows KTM on top (order-1), Desktop shows Form Left & KTM Right ── */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">

        {/* ── RIGHT COLUMN: DIGITAL KTM (On Mobile: ORDER-1 Top; On Desktop: ORDER-2 Right) ── */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-6 space-y-5 min-w-0">
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
          <div className="relative overflow-hidden rounded-[2rem] border border-[#0f6849]/40 bg-gradient-to-br from-[#0c2e20] via-[#12422f] to-[#071f15] p-5 sm:p-6 text-white shadow-2xl shadow-[#0c2e20]/40">
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
                <h3 className="font-display text-lg sm:text-2xl font-black leading-snug tracking-tight text-white truncate">
                  {fullName || "Nama Mahasiswa"}
                </h3>
                <p className="font-mono text-xs font-bold text-[#c8ef70] tracking-wider mt-0.5">
                  {studentId ? `NIM: ${studentId}` : "NIM: Belum diisi"}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-white/90 leading-tight">
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
              <div className="space-y-1 text-[11px] text-white/70 min-w-0 flex-1">
                <p className="truncate">✉️ {email}</p>
                {phone && <p className="truncate">📱 {phone}</p>}
              </div>

              {/* Simulated Micro QR / Security Seal */}
              <div className="flex flex-col items-center shrink-0">
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
          <div className="rounded-3xl border border-[var(--line)] bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#dcefe4] text-[var(--brand)]">
                <Shield size={16} />
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">Simpan Otomatis Terintegrasi</h4>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                  Cukup klik tombol simpan di kotak edit yang sedang kamu ubah. Data otomatis tersimpan dan terpasang di kartu KTM digitalmu.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── LEFT COLUMN: EDIT FORM (On Mobile: ORDER-2 Bottom; On Desktop: ORDER-1 Left) ── */}
        <div className="order-2 lg:order-1 space-y-6 min-w-0">

          {/* Section: Identitas */}
          <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dcefe4] text-[var(--brand)] shrink-0">
                <UserRound size={18} />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold text-[var(--ink)]">Identitas Mahasiswa</h2>
                <p className="text-xs text-[var(--muted)]">
                  Data utama yang tercantum di kartu kampus.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              
              {/* Field: Nama Lengkap */}
              <SingleEditableField
                fieldKey="full_name"
                label="Nama Lengkap"
                icon={<User size={15} />}
                value={fullName}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                className="sm:col-span-2"
                placeholder="Nama lengkap kamu"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap kamu"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />

              {/* Field: Email Akun (Non-editable clean text) */}
              <div className="sm:col-span-2 block text-sm font-bold text-[var(--ink)]">
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Mail size={15} className="text-[var(--muted)]" />
                    Email Akun
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#f0f4f1] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                    <Lock size={10} /> Terikat Auth
                  </span>
                </div>
                <div className="min-h-[42px] flex items-center px-3.5 py-2">
                  <span className="text-sm font-semibold text-[var(--ink)]/85">
                    {email}
                  </span>
                </div>
                <p className="mt-0.5 px-3.5 text-[11px] text-[var(--muted)]">
                  <Shield size={11} className="mr-1 inline text-[var(--brand)]" />
                  Email terikat dengan otentikasi akun Supabase.
                </p>
              </div>

              {/* Field: Universitas */}
              <SingleEditableField
                fieldKey="university"
                label="Universitas / Kampus"
                icon={<GraduationCap size={15} />}
                value={university}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                placeholder="Contoh: Universitas Mercu Buana"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Contoh: Universitas Mercu Buana"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />

              {/* Field: Program Studi */}
              <SingleEditableField
                fieldKey="major"
                label="Program Studi / Jurusan"
                icon={<BookOpen size={15} />}
                value={major}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                placeholder="Contoh: Teknik Informatika"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Contoh: Teknik Informatika"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />

              {/* Field: NIM */}
              <SingleEditableField
                fieldKey="student_id"
                label="NIM / ID Mahasiswa"
                icon={<Hash size={15} />}
                value={studentId}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                placeholder="Contoh: 41523110001"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Contoh: 41523110001"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />

              {/* Field: Tahun Angkatan */}
              <SingleEditableField
                fieldKey="angkatan"
                label="Tahun Angkatan"
                icon={<BadgeCheck size={15} />}
                value={angkatan}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                placeholder="Contoh: 2023"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="text"
                    maxLength={4}
                    value={angkatan}
                    onChange={(e) => setAngkatan(e.target.value)}
                    placeholder="Contoh: 2023"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />

              {/* Field: Nomor WhatsApp */}
              <SingleEditableField
                fieldKey="phone"
                label="Nomor WhatsApp"
                icon={<Phone size={15} />}
                value={phone}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                className="sm:col-span-2"
                placeholder="Contoh: 081234567890"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />

              {/* Field: Bio */}
              <SingleEditableField
                fieldKey="bio"
                label="Bio Singkat / Motto"
                icon={<MessageSquare size={15} />}
                value={bio}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                className="sm:col-span-2"
                placeholder="Contoh: Mahasiswa aktif yang menyeimbangkan kuliah, organisasi, dan inovasi."
                renderInput={(ref) => (
                  <div className="space-y-1.5">
                    <textarea
                      ref={ref as React.RefObject<HTMLTextAreaElement>}
                      rows={3}
                      maxLength={280}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Contoh: Mahasiswa aktif yang menyeimbangkan kuliah, organisasi, dan inovasi."
                      className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                    />
                    <p className="flex justify-between text-xs text-[var(--muted)]">
                      <span>Akan tampil di kartu KTM.</span>
                      <span className={bio.length > 250 ? "font-bold text-[#c53e1c]" : ""}>
                        {bio.length}/280
                      </span>
                    </p>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Section: Upload & Edit Foto Profil */}
          <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dcefe4] text-[var(--brand)] shrink-0">
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
                  disabled={!!activeEditingField || isPending}
                  className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-[var(--brand)] px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--brand-dark)] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={14} />
                  {avatarUrl ? "Ganti & Edit Foto" : "Upload Foto Baru"}
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={!!activeEditingField || isPending}
                    className="flex items-center gap-1.5 rounded-xl sm:rounded-2xl border border-[#f5c6cb] bg-[#fff5f5] px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs font-bold text-[#b93c21] hover:bg-[#ffebee] transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-[11px] text-[var(--muted)]">
              Format: JPG, PNG, atau WebP (maks. 5MB). Foto yang diubah akan otomatis tersimpan langsung ke cloud.
            </p>
          </div>

          {/* Section: Social Links */}
          <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e8e1fa] text-[#5c3a9c] shrink-0">
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
              <SingleEditableField
                fieldKey="linkedin"
                label="URL LinkedIn"
                value={linkedin}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                placeholder="https://linkedin.com/in/username"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />

              <SingleEditableField
                fieldKey="github"
                label="URL GitHub"
                value={github}
                activeField={activeEditingField}
                isSaving={isPending}
                onStartEdit={handleStartEdit}
                onCancel={handleCancelEdit}
                onConfirm={handleConfirmEdit}
                placeholder="https://github.com/username"
                renderInput={(ref) => (
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-[var(--brand)] bg-white px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Exclusive Single Editable Field Component dengan Tombol Simpan Instan ──
function SingleEditableField({
  fieldKey,
  label,
  icon,
  value,
  placeholder,
  activeField,
  isSaving,
  className = "",
  onStartEdit,
  onCancel,
  onConfirm,
  renderInput,
}: {
  fieldKey: string;
  label: string;
  icon?: React.ReactNode;
  value: string;
  placeholder?: string;
  activeField: string | null;
  isSaving?: boolean;
  className?: string;
  onStartEdit: (fieldKey: string) => void;
  onCancel: (fieldKey: string) => void;
  onConfirm: (fieldKey: string) => void;
  renderInput: (ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>) => React.ReactNode;
}) {
  const isEditing = activeField === fieldKey;
  const isBlockedByOther = activeField !== null && activeField !== fieldKey;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Auto focus when editing starts
  const handleEditClick = () => {
    if (isBlockedByOther || isSaving) {
      return;
    }
    onStartEdit(fieldKey);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        if (inputRef.current.value) {
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }
    }, 50);
  };

  return (
    <div
      className={`block text-sm font-bold text-[var(--ink)] transition-opacity duration-200 ${
        isBlockedByOther || (isSaving && !isEditing) ? "opacity-45" : "opacity-100"
      } ${className}`}
    >
      {/* Label and Action Header */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="flex items-center gap-1.5">
          {icon && <span className="text-[var(--muted)]">{icon}</span>}
          {label}
        </span>

        {/* Edit / Simpan / Batal Actions */}
        {!isEditing ? (
          <button
            type="button"
            onClick={handleEditClick}
            disabled={isBlockedByOther || isSaving}
            className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-bold transition ${
              isBlockedByOther || isSaving
                ? "text-[var(--muted)] cursor-not-allowed"
                : "text-[var(--muted)] hover:bg-[#dcefe4] hover:text-[var(--brand)] active:scale-90"
            }`}
            title={isBlockedByOther ? "Selesaikan field yang sedang diedit dahulu" : `Edit ${label}`}
          >
            <Pencil size={11} className={isBlockedByOther ? "text-[var(--muted)]" : "text-[var(--brand)]"} />
            <span>Edit</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-90 duration-200">
            <button
              type="button"
              onClick={() => onCancel(fieldKey)}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-lg border border-[#f0c8c8] bg-[#fff5f5] px-2 py-0.5 text-[11px] font-black text-[#b93c21] hover:bg-[#ffebee] transition active:scale-90 disabled:opacity-50"
              title="Batal ubah data"
            >
              <X size={12} /> Batal
            </button>
            <button
              type="button"
              onClick={() => onConfirm(fieldKey)}
              disabled={isSaving}
              className="flex items-center gap-1 rounded-lg bg-[var(--brand)] px-2.5 py-0.5 text-[11px] font-black text-white shadow-xs hover:bg-[var(--brand-dark)] transition active:scale-90 disabled:opacity-50"
              title="Simpan perubahan langsung ke database"
            >
              {isSaving ? (
                <>
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check size={12} />
                  <span>Simpan</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Field Display Mode: Clean Plain Text when NOT editing, Animated Input Box when EDITING */}
      {!isEditing ? (
        <div
          onClick={handleEditClick}
          className={`min-h-[42px] flex items-center justify-between rounded-xl border border-transparent px-3.5 py-2 transition-all ${
            isBlockedByOther || isSaving
              ? "cursor-not-allowed"
              : "cursor-pointer hover:border-[var(--brand)]/40 hover:bg-[#f2f7f3]/60 group"
          }`}
        >
          <span className={`text-sm font-semibold truncate ${value ? "text-[var(--ink)]" : "text-[var(--muted)]/60 italic"}`}>
            {value || placeholder || "Belum diisi"}
          </span>
          {!isBlockedByOther && !isSaving && (
            <span className="text-[10px] font-bold text-[var(--muted)] opacity-0 group-hover:opacity-80 transition shrink-0 ml-2">
              Klik untuk edit
            </span>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-[0.98] duration-200 pt-0.5">
          {renderInput(inputRef)}
        </div>
      )}
    </div>
  );
}
