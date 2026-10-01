"use client";

import { useRef, useState } from "react";
import {
  Award,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  Copy,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
  Sparkles,
  Trophy,
  Users,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

export type ActivityItem = {
  id: string;
  judul: string;
  deskripsi?: string | null;
  kategori: string;
  jenis_item: string;
  status: string;
  prioritas: string;
  deadline?: string | null;
  tanggal_mulai?: string | null;
  peran_portfolio?: string | null;
  is_portfolio: boolean;
  organization_id?: string | null;
  program_id?: string | null;
};

export type OrgPosition = {
  organization_id: string;
  jabatan: string;
  role_type: string;
  divisi?: string | null;
};

export type ProgramItem = {
  id: string;
  nama_proker: string;
  organization_id: string;
  peran?: string | null;
  status: string;
};

export type StudentProfile = {
  full_name: string;
  university: string;
  major: string;
  student_id?: string | null;
  email: string;
  phone?: string | null;
  bio?: string | null;
  angkatan?: string | null;
  linkedin?: string | null;
  github?: string | null;
};

export type SemesterInfo = {
  nama: string;
  mulai: string;
  selesai: string;
} | null;

export function PortfolioPreview({
  activities,
  orgMap,
  programMap = {},
  positions = [],
  programs = [],
  profile,
  semester,
}: {
  activities: ActivityItem[];
  orgMap: Record<string, string>;
  programMap?: Record<string, string>;
  positions?: OrgPosition[];
  programs?: ProgramItem[];
  profile: StudentProfile;
  semester: SemesterInfo;
}) {
  const [template, setTemplate] = useState<"corporate" | "classic">("corporate");
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  // Group activities by formal resume sections
  const orgActivities = activities.filter((a) => a.kategori === "organisasi");
  const compActivities = activities.filter((a) => a.kategori === "lomba");
  const eventActivities = activities.filter((a) => a.kategori === "event");
  const academicActivities = activities.filter((a) => a.kategori === "kuliah");
  const otherActivities = activities.filter((a) => a.kategori === "lainnya");

  const today = new Date();
  const generatedDate = today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  };

  const handleCopyTextResume = () => {
    let text = `CURRICULUM VITAE & PORTOFOLIO\n`;
    text += `=====================================\n`;
    text += `${profile.full_name.toUpperCase()}\n`;
    text += `${profile.major} | ${profile.university}\n`;
    text += `Email: ${profile.email} | No. Telp: ${profile.phone || "-"}\n`;
    if (profile.linkedin) text += `LinkedIn: ${profile.linkedin}\n`;
    if (profile.github) text += `Portfolio/GitHub: ${profile.github}\n`;
    text += `\nRINGKASAN PROFIL:\n${profile.bio || "Mahasiswa berdedikasi tinggi dengan rekam jejak aktif dalam bidang akademik, kepemimpinan organisasi, dan pencapaian kompetisi."}\n`;

    text += `\nPENDIDIKAN:\n- ${profile.university} (${profile.major})\n  Angkatan: ${profile.angkatan || "-"} | NIM: ${profile.student_id || "-"}\n`;

    if (orgActivities.length > 0) {
      text += `\nPENGALAMAN KEPEMIMPINAN & ORGANISASI:\n`;
      orgActivities.forEach((a) => {
        const orgName = a.organization_id ? orgMap[a.organization_id] : "Organisasi";
        text += `* ${a.judul} - ${orgName} (${a.peran_portfolio || "Anggota"})\n`;
        if (a.deskripsi) text += `  ${a.deskripsi}\n`;
      });
    }

    if (compActivities.length > 0) {
      text += `\nPRESTASI & KOMPETISI:\n`;
      compActivities.forEach((a) => {
        text += `* ${a.judul} (${a.peran_portfolio || "Pemenang/Peserta"})\n`;
        if (a.deskripsi) text += `  ${a.deskripsi}\n`;
      });
    }

    if (academicActivities.length > 0) {
      text += `\nPROYEK AKADEMIK & KARYA:\n`;
      academicActivities.forEach((a) => {
        text += `* ${a.judul}\n`;
        if (a.deskripsi) text += `  ${a.deskripsi}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Teks resume formal berhasil disalin ke clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="portfolio-doc-container">
      {/* ── Top Floating Action Dock (No-Print) ── */}
      <div className="no-print mt-6 mb-8 rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849] font-black text-[10px]">
                EXPORT READY
              </span>
              <span className="text-xs text-[var(--muted)] font-bold">
                {activities.length} Pencapaian Terverifikasi
              </span>
            </div>
            <h2 className="font-display text-base font-black text-[var(--ink)] mt-1">
              Format Standar CV & Portofolio Perusahaan
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Siap cetak ke format PDF A4 rapi, bebas dari navbar aplikasi, dan siap dikirim ke HR recruiter.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Template Selector */}
            <div className="flex rounded-xl bg-[var(--card-subtle)] p-1 border border-[var(--line)]">
              <button
                type="button"
                onClick={() => setTemplate("corporate")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  template === "corporate"
                    ? "bg-[#0f6849] text-white shadow-xs font-black"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Corporate Executive
              </button>
              <button
                type="button"
                onClick={() => setTemplate("classic")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  template === "classic"
                    ? "bg-[#111827] text-white shadow-xs font-black"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Classic ATS (Clean)
              </button>
            </div>

            {/* Copy Text Button */}
            <button
              type="button"
              onClick={handleCopyTextResume}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs font-bold text-[var(--ink)] hover:border-[#0f6849] transition active:scale-95 cursor-pointer"
              title="Salin teks format plain text untuk form lamaran online"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copied ? "Tersalin!" : "Salin Teks"}</span>
            </button>

            {/* Print / Download PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f6849] px-4 py-2 text-xs font-black text-white hover:bg-[#0a4a34] transition active:scale-95 shadow-md shadow-emerald-900/20 cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Printable Paper Document (A4 Ratio Standard) ── */}
      <div
        className={`portfolio-paper mx-auto w-full max-w-[850px] bg-white text-[#111827] p-8 sm:p-12 shadow-xl print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none transition-all ${
          template === "corporate" ? "border-t-8 border-[#0f6849] rounded-b-3xl print:rounded-none" : "border-t-4 border-[#111827]"
        }`}
        style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}
      >
        {/* ── 1. HEADER PROFIL RESMI ── */}
        <header className="border-b-2 border-[#e2e8f0] pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a] uppercase">
                {profile.full_name}
              </h1>
              <p className="text-sm font-bold text-[#0f6849] mt-0.5">
                {profile.major} · {profile.university}
              </p>
              {profile.bio && (
                <p className="text-xs text-[#475569] mt-2 max-w-xl leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Contact Information Bar */}
            <div className="text-xs text-[#475569] space-y-1 sm:text-right shrink-0">
              <div className="flex items-center sm:justify-end gap-1.5">
                <Mail size={12} className="text-[#0f6849] shrink-0" />
                <span className="font-medium">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center sm:justify-end gap-1.5">
                  <Phone size={12} className="text-[#0f6849] shrink-0" />
                  <span className="font-medium">{profile.phone}</span>
                </div>
              )}
              {profile.linkedin && (
                <div className="flex items-center sm:justify-end gap-1.5 text-[#0f6849]">
                  <ExternalLink size={12} className="shrink-0" />
                  <span className="font-semibold">{profile.linkedin.replace(/^https?:\/\//i, "")}</span>
                </div>
              )}
              {profile.github && (
                <div className="flex items-center sm:justify-end gap-1.5 text-[#334155]">
                  <ExternalLink size={12} className="shrink-0" />
                  <span className="font-mono text-[11px]">{profile.github.replace(/^https?:\/\//i, "")}</span>
                </div>
              )}
              <div className="flex items-center sm:justify-end gap-1.5 text-[#64748b]">
                <MapPin size={12} className="shrink-0" />
                <span>Indonesia</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── 2. PENDIDIKAN (EDUCATION) ── */}
        <section className="cv-section mt-6">
          <SectionHeader title="PENDIDIKAN & LATAR BELAKANG AKADEMIK" />
          <div className="mt-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div>
                <h3 className="text-sm font-black text-[#0f172a]">{profile.university}</h3>
                <p className="text-xs font-semibold text-[#334155]">
                  Program Sarjana (S1) · {profile.major}
                </p>
              </div>
              <div className="text-xs font-mono text-[#64748b] sm:text-right">
                {profile.angkatan ? `Angkatan ${profile.angkatan}` : "Mahasiswa Aktif"}
                {profile.student_id ? ` · NIM: ${profile.student_id}` : ""}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. PENGALAMAN KEPEMIMPINAN & ORGANISASI ── */}
        {orgActivities.length > 0 && (
          <section className="cv-section mt-6">
            <SectionHeader title="PENGALAMAN KEPEMIMPINAN & ORGANISASI KAMPUS" />
            <div className="mt-3 space-y-4">
              {orgActivities.map((item) => {
                const orgName = item.organization_id ? orgMap[item.organization_id] : "Organisasi Mahasiswa";
                const progName = item.program_id ? programMap[item.program_id] : null;

                return (
                  <div key={item.id} className="cv-item">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">
                          {orgName} — <span className="font-normal italic text-[#334155]">{item.judul}</span>
                        </h4>
                        {item.peran_portfolio && (
                          <span className="inline-block mt-0.5 text-[11px] font-bold text-[#0f6849]">
                            Peran / Jabatan: {item.peran_portfolio}
                          </span>
                        )}
                        {progName && (
                          <span className="ml-2 inline-block text-[11px] font-medium text-[#64748b]">
                            (Proker: {progName})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#64748b] shrink-0">
                        {formatDate(item.deadline ?? item.tanggal_mulai)}
                      </span>
                    </div>
                    {item.deskripsi && (
                      <p className="mt-1 text-xs text-[#334155] leading-relaxed pl-3 border-l-2 border-[#cbd5e1]">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 4. PRESTASI & PENGHARGAAN KOMPETISI ── */}
        {compActivities.length > 0 && (
          <section className="cv-section mt-6">
            <SectionHeader title="PRESTASI, KOMPETISI & PENGHARGAAN" />
            <div className="mt-3 space-y-3.5">
              {compActivities.map((item) => (
                <div key={item.id} className="cv-item">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">
                        {item.judul}
                      </h4>
                      {item.peran_portfolio && (
                        <p className="text-[11px] font-bold text-[#b45309]">
                          ★ {item.peran_portfolio}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#64748b] shrink-0">
                      {formatDate(item.deadline ?? item.tanggal_mulai)}
                    </span>
                  </div>
                  {item.deskripsi && (
                    <p className="mt-1 text-xs text-[#334155] leading-relaxed pl-3 border-l-2 border-[#fcd34d]">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 5. KEPANITIAAN & INISIATIF EVENT ── */}
        {eventActivities.length > 0 && (
          <section className="cv-section mt-6">
            <SectionHeader title="KEPANITIAAN & PENGALAMAN EVENT" />
            <div className="mt-3 space-y-3.5">
              {eventActivities.map((item) => {
                const orgName = item.organization_id ? orgMap[item.organization_id] : null;

                return (
                  <div key={item.id} className="cv-item">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">
                          {item.judul} {orgName ? `· ${orgName}` : ""}
                        </h4>
                        {item.peran_portfolio && (
                          <p className="text-[11px] font-bold text-[#6366f1]">
                            Divisi / Peran: {item.peran_portfolio}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#64748b] shrink-0">
                        {formatDate(item.deadline ?? item.tanggal_mulai)}
                      </span>
                    </div>
                    {item.deskripsi && (
                      <p className="mt-1 text-xs text-[#334155] leading-relaxed pl-3 border-l-2 border-[#c7d2fe]">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 6. PROYEK & KARYA AKADEMIK UNGGULAN ── */}
        {academicActivities.length > 0 && (
          <section className="cv-section mt-6">
            <SectionHeader title="PROYEK & RISET AKADEMIK UNGGULAN" />
            <div className="mt-3 space-y-3.5">
              {academicActivities.map((item) => (
                <div key={item.id} className="cv-item">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-[#0f172a]">
                      {item.judul}
                    </h4>
                    <span className="text-[11px] font-mono text-[#64748b] shrink-0">
                      {formatDate(item.deadline ?? item.tanggal_mulai)}
                    </span>
                  </div>
                  {item.deskripsi && (
                    <p className="mt-1 text-xs text-[#334155] leading-relaxed pl-3 border-l-2 border-[#cbd5e1]">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 7. PENCAPAIAN LAINNYA ── */}
        {otherActivities.length > 0 && (
          <section className="cv-section mt-6">
            <SectionHeader title="KOMITMEN & PENCAPAIAN LAINNYA" />
            <div className="mt-3 space-y-3">
              {otherActivities.map((item) => (
                <div key={item.id} className="cv-item">
                  <div className="flex justify-between items-baseline gap-1">
                    <h4 className="text-xs font-bold text-[#0f172a]">{item.judul}</h4>
                    <span className="text-[11px] font-mono text-[#64748b]">
                      {formatDate(item.deadline ?? item.tanggal_mulai)}
                    </span>
                  </div>
                  {item.deskripsi && <p className="text-xs text-[#334155] mt-0.5">{item.deskripsi}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 8. FOOTER RESMI DOKUMEN ── */}
        <footer className="mt-10 pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#64748b]">
          <div>
            Dokumen resmi rekapitulasi portofolio mahasiswa · Sistem Informasi{" "}
            <span className="font-bold text-[#0f6849]">ngampUS</span>
          </div>
          <div className="font-mono">
            Diterbitkan: {generatedDate} · ID: {profile.student_id || "VERIFIED"}
          </div>
        </footer>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-[#0f172a] pb-1">
      <h2 className="text-xs font-black tracking-wider uppercase text-[#0f172a]">
        {title}
      </h2>
    </div>
  );
}
