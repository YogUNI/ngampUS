"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock,
  Crop,
  ExternalLink,
  Layers,
  Link2,
  ListChecks,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  UsersRound,
  X,
} from "lucide-react";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";
import { PositionForm } from "@/components/organizations/position-form";
import { ActivityForm } from "@/components/activities/activity-form";
import { useToast } from "@/components/ui/toast-provider";
import { extractOrgLogoAndNotes } from "@/lib/utils/org-logo";
import { ImageCropModal } from "@/components/settings/image-crop-modal";
import {
  createProgram,
  deletePosition,
  deleteProgram,
  updateOrganization,
  updateProgram,
} from "@/app/(dashboard)/organisasi/actions";

const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

function dateRange(start: string | null, end: string | null) {
  if (!start && !end) return "Periode aktif belum diatur";
  const startLabel = start ? dateFormatter.format(new Date(`${start}T00:00:00`)) : "—";
  const endLabel = end ? dateFormatter.format(new Date(`${end}T00:00:00`)) : "Sekarang";
  return `${startLabel} — ${endLabel}`;
}

const roleLabel: Record<string, string> = {
  ketua_umum: "Ketua Umum",
  wakil_ketua_umum: "Wakil Ketua",
  sekretaris: "Sekretaris",
  bendahara: "Bendahara",
  kepala_departemen: "Kepala Departemen",
  wakil_kepala_departemen: "Wakil Kepala Dept.",
  anggota: "Anggota",
  lainnya: "Lainnya",
};

type OrgActivity = {
  id: string;
  judul: string;
  status: string;
  deadline?: string | null;
  program_id?: string | null;
  prioritas: string;
};

type Organization = {
  id: string;
  nama_organisasi: string;
  tipe: "organisasi" | "ukm" | "ukk" | "kepanitiaan" | "lainnya";
  periode_mulai: string | null;
  periode_selesai: string | null;
  catatan: string | null;
};

type Position = {
  id: string;
  role_type: "ketua_umum" | "wakil_ketua_umum" | "sekretaris" | "bendahara" | "kepala_departemen" | "wakil_kepala_departemen" | "anggota" | "lainnya";
  jabatan: string;
  divisi: string | null;
  mulai: string | null;
  selesai: string | null;
};

type Program = {
  id: string;
  organization_id: string;
  nama_proker: string;
  peran: string | null;
  deskripsi: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  status: "perencanaan" | "berjalan" | "selesai" | "dibatalkan";
};

export function OrganizationDetailView({
  organization,
  positions = [],
  programs = [],
  activities = [],
  mappedSemesters = [],
  mappedOrgs = [],
  mappedPrograms = [],
}: {
  organization: Organization;
  positions: Position[];
  programs: Program[];
  activities: OrgActivity[];
  mappedSemesters: { id: string; name: string; active?: boolean }[];
  mappedOrgs: { id: string; name: string }[];
  mappedPrograms: { id: string; name: string; organization_id?: string | null }[];
}) {
  const [activeTab, setActiveTab] = useState<"proker" | "struktur" | "catatan">("proker");
  const [editOrgOpen, setEditOrgOpen] = useState(false);
  const [newProkerOpen, setNewProkerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // KPI Calculations
  const totalProker = programs.length;
  const completedProker = programs.filter((p) => p.status === "selesai").length;
  const runningProker = programs.filter((p) => p.status === "berjalan").length;
  const plannedProker = programs.filter((p) => p.status === "perencanaan").length;
  const completionRate = totalProker > 0 ? Math.round((completedProker / totalProker) * 100) : 0;

  // Parse stored logo and notes from organization.catatan
  const parsedOrg = extractOrgLogoAndNotes(organization.catatan);
  const [logoUrl, setLogoUrl] = useState<string | null>(parsedOrg.logoUrl);
  const [editCatatan, setEditCatatan] = useState<string>(parsedOrg.notes);
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(parsedOrg.logoUrl);

  // Smart Logo Crop states
  const [rawCropImage, setRawCropImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropTargetSource, setCropTargetSource] = useState<"quick_hero" | "edit_modal">("quick_hero");

  const editLogoInputRef = useRef<HTMLInputElement | null>(null);
  const heroLogoInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  function handleFileSelectForCrop(
    e: React.ChangeEvent<HTMLInputElement>,
    source: "quick_hero" | "edit_modal"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Pilih file gambar yang valid (PNG, JPG, WebP).", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran gambar maksimal 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRawCropImage(reader.result as string);
      setCropTargetSource(source);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function handleSaveCroppedLogo(croppedDataUrl: string) {
    if (cropTargetSource === "quick_hero") {
      setLogoUrl(croppedDataUrl);
      setEditLogoUrl(croppedDataUrl);
      try {
        const formData = new FormData();
        formData.set("id", organization.id);
        formData.set("nama_organisasi", organization.nama_organisasi);
        formData.set("tipe", organization.tipe);
        formData.set("periode_mulai", organization.periode_mulai || "");
        formData.set("periode_selesai", organization.periode_selesai || "");
        formData.set("catatan", editCatatan);
        formData.set("logo_url", croppedDataUrl);
        await updateOrganization(formData);
        showToast("Logo organisasi berhasil diperbarui & disimpan! ✨", "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Gagal mengunggah logo.";
        showToast(msg, "error");
      }
    } else {
      setEditLogoUrl(croppedDataUrl);
      showToast("Logo berhasil disesuaikan! Klik 'Simpan Perubahan' untuk memperbarui.", "success");
    }
  }

  // Activities group by program
  const activitiesByProgram: Record<string, OrgActivity[]> = {};
  activities.forEach((act) => {
    if (act.program_id) {
      if (!activitiesByProgram[act.program_id]) {
        activitiesByProgram[act.program_id] = [];
      }
      activitiesByProgram[act.program_id]!.push(act);
    }
  });

  // Filtered programs
  const displayedPrograms = programs.filter((p) => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  // Most recent role
  const currentRole = positions[0];

  return (
    <div className="space-y-6">
      {/* ── Hidden file input for quick hero logo upload ── */}
      <input
        ref={heroLogoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelectForCrop(e, "quick_hero")}
      />

      {/* ── Top Breadcrumb & Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/organisasi"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--muted)] shadow-2xs transition hover:bg-[#eef7f2] hover:text-[var(--brand)]"
        >
          <ArrowLeft size={14} /> Semua Organisasi
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOrgOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--ink)] shadow-2xs transition hover:bg-[#f7f8f5]"
          >
            <PencilLine size={13} className="text-[var(--brand)]" /> Edit Organisasi
          </button>
          <Link
            href={`/kegiatan?organization_id=${organization.id}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-3.5 py-1.5 text-xs font-bold text-[#c8ef70] shadow-xs transition hover:bg-[#174934]"
          >
            <Calendar size={13} /> {activities.length} Agenda Terkait
          </Link>
        </div>
      </div>

      {/* ── Modern Executive Hero Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1e4d3b] bg-gradient-to-br from-[#0c2419] via-[#103626] to-[#174934] p-6 sm:p-8 text-white shadow-md">
        {/* Glow ambient decoration */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #c8ef70, transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Logo container with hover quick-upload button */}
            <div className="group relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white shadow-inner flex items-center justify-center p-1">
              {logoUrl ? (
                <div className="relative h-full w-full">
                  <Image
                    src={logoUrl}
                    alt={organization.nama_organisasi}
                    fill
                    className="object-contain transition duration-300 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="grid h-full w-full place-items-center rounded-xl bg-[#c8ef70]/20 text-[#c8ef70] ring-1 ring-[#c8ef70]/30">
                  <Building2 size={32} strokeWidth={2.3} />
                </div>
              )}
              {/* Quick logo hover action */}
              <button
                type="button"
                onClick={() => heroLogoInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white"
                title="Ganti / Unggah Logo"
              >
                <Camera size={18} className="text-[#c8ef70]" />
                <span className="mt-0.5 text-[9px] font-bold tracking-wider uppercase">Logo</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#c8ef70] px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#103626]">
                  {organization.tipe}
                </span>
                {currentRole && (
                  <span className="rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-bold text-[#dff3e5] backdrop-blur-xs">
                    {roleLabel[currentRole.role_type] || currentRole.jabatan}
                    {currentRole.divisi ? ` · ${currentRole.divisi}` : ""}
                  </span>
                )}
              </div>
              <h1 className="font-display mt-2 text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {organization.nama_organisasi}
              </h1>
              <p className="mt-1 text-xs sm:text-sm font-medium text-[#c0d8c7] flex items-center gap-1.5">
                <CalendarDays size={14} className="text-[#c8ef70]" />
                {dateRange(organization.periode_mulai, organization.periode_selesai)}
              </p>
            </div>
          </div>

          {/* Quick Action Button to Add Proker */}
          <button
            onClick={() => setNewProkerOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#c8ef70] px-5 py-3 text-xs sm:text-sm font-black text-[#103626] shadow-sm transition hover:bg-[#d8f48f] active:scale-95"
          >
            <Plus size={16} strokeWidth={2.8} /> Buat Program Kerja
          </button>
        </div>

        {/* ── Executive Stat Highlights ── */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 border-t border-white/10 pt-5">
          <div
            className="rounded-2xl p-3 sm:p-3.5 border border-white/10 shadow-inner"
            style={{ backgroundColor: "rgba(10, 35, 25, 0.65)" }}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9cbca5]">Total Proker</span>
            <p className="font-display mt-0.5 text-xl sm:text-2xl font-black text-white">{totalProker}</p>
          </div>
          <div
            className="rounded-2xl p-3 sm:p-3.5 border border-[#c8ef70]/20 shadow-inner"
            style={{ backgroundColor: "rgba(10, 35, 25, 0.65)" }}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c8ef70]">Sedang Berjalan</span>
            <p className="font-display mt-0.5 text-xl sm:text-2xl font-black text-[#c8ef70]">{runningProker}</p>
          </div>
          <div
            className="rounded-2xl p-3 sm:p-3.5 border border-white/10 shadow-inner"
            style={{ backgroundColor: "rgba(10, 35, 25, 0.65)" }}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9cbca5]">Proker Selesai</span>
            <p className="font-display mt-0.5 text-xl sm:text-2xl font-black text-white">
              {completedProker}{" "}
              <span className="text-xs font-bold text-[#c8ef70]">({completionRate}%)</span>
            </p>
          </div>
          <div
            className="rounded-2xl p-3 sm:p-3.5 border border-white/10 shadow-inner"
            style={{ backgroundColor: "rgba(10, 35, 25, 0.65)" }}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9cbca5]">Agenda & Rapat</span>
            <p className="font-display mt-0.5 text-xl sm:text-2xl font-black text-white">{activities.length}</p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex border-b border-[var(--line)]">
        <button
          onClick={() => setActiveTab("proker")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-extrabold transition ${
            activeTab === "proker"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <BriefcaseBusiness size={16} />
          Program Kerja ({programs.length})
        </button>
        <button
          onClick={() => setActiveTab("struktur")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-extrabold transition ${
            activeTab === "struktur"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <UsersRound size={16} />
          Jabatan & Riwayat ({positions.length})
        </button>
        <button
          onClick={() => setActiveTab("catatan")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-extrabold transition ${
            activeTab === "catatan"
              ? "border-[var(--brand)] text-[var(--brand)]"
              : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Layers size={16} />
          Catatan & Dokumen
        </button>
      </div>

      {/* ── TAB 1: PROGRAM KERJA (MAIN VIEW) ── */}
      {activeTab === "proker" && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "Semua Proker" },
                { id: "berjalan", label: "🔥 Sedang Berjalan" },
                { id: "perencanaan", label: "📋 Rencana" },
                { id: "selesai", label: "✅ Selesai" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                    filterStatus === f.id
                      ? "bg-[var(--brand)] text-white shadow-2xs"
                      : "bg-white text-[var(--muted)] border border-[var(--line)] hover:bg-[#f7f8f5] hover:text-[var(--ink)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setNewProkerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#b9ddc6] bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-extrabold text-[var(--brand-dark)] transition hover:bg-[#c9e8d3]"
            >
              <Plus size={14} /> Tambah Proker
            </button>
          </div>

          {/* Program Kerja Grid */}
          {displayedPrograms.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {displayedPrograms.map((program) => {
                const related = activitiesByProgram[program.id] || [];
                const isFinished = program.status === "selesai";
                const isRunning = program.status === "berjalan";

                return (
                  <article
                    key={program.id}
                    className={`group flex flex-col justify-between rounded-3xl border bg-white p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                      isFinished
                        ? "border-[#d1e7d8] bg-gradient-to-b from-white to-[#f7fbf8]"
                        : isRunning
                        ? "border-[#f7dc9f] bg-gradient-to-b from-white to-[#fffdf7]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <div>
                      {/* Status pill & Delete button */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold capitalize ${
                              isFinished
                                ? "bg-[#dff3e5] text-[#0f6849]"
                                : isRunning
                                ? "bg-[#fff2d6] text-[#9a6900]"
                                : program.status === "dibatalkan"
                                ? "bg-[#feece7] text-[#b93c21]"
                                : "bg-[#f0f4f0] text-[#55675b]"
                            }`}
                          >
                            {program.status}
                          </span>
                          {program.peran && (
                            <span className="rounded-full bg-[#f4f0e7] px-2.5 py-0.5 text-[11px] font-bold text-[#7d6738]">
                              Peran: {program.peran}
                            </span>
                          )}
                        </div>

                        <ConfirmDeleteForm
                          action={deleteProgram}
                          id={program.id}
                          itemName={`program kerja “${program.nama_proker}”`}
                          fields={{ organization_id: organization.id }}
                        />
                      </div>

                      {/* Title & Dates */}
                      <h3 className="font-display mt-3 text-lg font-black text-[var(--ink)] leading-snug">
                        {program.nama_proker}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--muted)]">
                        <Clock size={13} />
                        {dateRange(program.tanggal_mulai, program.tanggal_selesai)}
                      </p>

                      {program.deskripsi && (
                        <p className="mt-2.5 text-xs leading-relaxed text-[var(--muted)] line-clamp-3">
                          {program.deskripsi}
                        </p>
                      )}
                    </div>

                    {/* Footer: Agenda Connection & Action */}
                    <div className="mt-5 border-t border-[#edf2ee] pt-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#eef7f2] text-[var(--brand)]">
                            <ListChecks size={13} />
                          </span>
                          <span className="text-xs font-extrabold text-[var(--ink)]">
                            {related.length} Agenda Terjadwal
                          </span>
                        </div>

                        <ActivityForm
                          semesters={mappedSemesters}
                          organizations={mappedOrgs}
                          programs={mappedPrograms}
                          defaultOrganizationId={organization.id}
                          defaultProgramId={program.id}
                          defaultJudul={`Agenda ${program.nama_proker}`}
                          defaultPeranPortfolio={program.peran || undefined}
                          triggerNode={
                            <span className="inline-flex items-center gap-1 rounded-lg bg-[#f0f4f0] px-2 py-1 text-[11px] font-bold text-[#0f6849] hover:bg-[#dff3e5] transition cursor-pointer">
                              <Plus size={12} /> Jadwalkan
                            </span>
                          }
                        />
                      </div>

                      {/* Display recent 2 scheduled agendas for this proker */}
                      {related.length > 0 && (
                        <div className="space-y-1 rounded-xl bg-[#fbfcfb] p-2 border border-[#eef2ee]">
                          {related.slice(0, 2).map((act) => (
                            <div key={act.id} className="flex items-center justify-between text-[11px]">
                              <span className="truncate font-semibold text-[var(--ink)]">
                                • {act.judul}
                              </span>
                              <span className="shrink-0 text-[10px] text-[var(--muted)]">
                                {act.deadline ? act.deadline : act.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Inline Edit Form for Proker */}
                      <details className="group mt-2 rounded-xl bg-[#f7f8f5] p-2.5">
                        <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[var(--brand)]">
                          <span>Ubah data proker</span>
                          <span className="text-[10px] group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <form
                          action={updateProgram}
                          className="mt-3 grid gap-2.5 border-t border-[var(--line)] pt-3 text-xs [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:bg-white [&_input]:px-3 [&_input]:py-2 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2"
                        >
                          <input type="hidden" name="id" value={program.id} />
                          <input type="hidden" name="organization_id" value={organization.id} />
                          <div className="grid grid-cols-2 gap-2">
                            <input required name="nama_proker" defaultValue={program.nama_proker} placeholder="Nama proker" />
                            <input name="peran" defaultValue={program.peran || ""} placeholder="Peranmu" />
                          </div>
                          <textarea name="deskripsi" rows={2} defaultValue={program.deskripsi || ""} placeholder="Deskripsi ringkas" />
                          <div className="grid grid-cols-3 gap-2">
                            <input name="tanggal_mulai" type="date" defaultValue={program.tanggal_mulai || ""} />
                            <input name="tanggal_selesai" type="date" defaultValue={program.tanggal_selesai || ""} />
                            <select name="status" defaultValue={program.status}>
                              <option value="perencanaan">Rencana</option>
                              <option value="berjalan">Berjalan</option>
                              <option value="selesai">Selesai</option>
                              <option value="dibatalkan">Batal</option>
                            </select>
                          </div>
                          <button className="w-fit rounded-xl bg-[var(--brand)] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-dark)]">
                            Simpan Perubahan
                          </button>
                        </form>
                      </details>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#cfe0d3] bg-white p-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3e5] text-[var(--brand)]">
                <BriefcaseBusiness size={24} />
              </div>
              <h3 className="font-display mt-3 text-base font-black text-[var(--ink)]">
                Belum ada program kerja dengan filter ini
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Mulai catat rencana kegiatan atau kepanitiaan organisasi agar mudah dimonitor.
              </p>
              <button
                onClick={() => setNewProkerOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[var(--brand-dark)]"
              >
                <Plus size={14} /> Buat Program Kerja
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: JABATAN & RIWAYAT PERAN ── */}
      {activeTab === "struktur" && (
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#edf2ee] pb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
                <UsersRound size={18} />
              </span>
              <div>
                <h3 className="font-display text-lg font-black text-[var(--ink)]">Riwayat Jabatan & Peran</h3>
                <p className="text-xs text-[var(--muted)]">Jejak kepengurusanmu di organisasi ini.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {positions.length > 0 ? (
                positions.map((pos) => (
                  <article
                    key={pos.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[#fbfcfb] p-4 transition hover:border-[#b9ddc6]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-sm text-[var(--ink)]">{pos.jabatan}</h4>
                        <span className="rounded-md bg-[#eef7f2] px-2 py-0.5 text-[10px] font-bold text-[var(--brand-dark)]">
                          {roleLabel[pos.role_type] || pos.role_type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                        {pos.divisi ? `Divisi: ${pos.divisi}` : "Umum / Non-divisi"} ·{" "}
                        {dateRange(pos.mulai, pos.selesai)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <PositionForm organizationId={organization.id} position={pos} />
                      <ConfirmDeleteForm
                        action={deletePosition}
                        id={pos.id}
                        itemName={`jabatan “${pos.jabatan}”`}
                        fields={{ organization_id: organization.id }}
                      />
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl bg-[#f7f8f5] p-6 text-center text-xs text-[var(--muted)]">
                  Belum ada jabatan dicatat.
                </div>
              )}
            </div>
          </div>

          {/* Form Tambah Jabatan Baru */}
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#edf2ee] pb-4">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0cc] text-[#9a6900]">
                <Plus size={18} />
              </span>
              <div>
                <h3 className="font-display text-lg font-black text-[var(--ink)]">Tambah Jabatan Baru</h3>
                <p className="text-xs text-[var(--muted)]">Contoh: Promosi jabatan, periode baru, atau divisi baru.</p>
              </div>
            </div>
            <div className="mt-4">
              <PositionForm organizationId={organization.id} />
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CATATAN & DOKUMEN LINK ── */}
      {activeTab === "catatan" && (
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#edf2ee] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
                <Layers size={18} />
              </span>
              <div>
                <h3 className="font-display text-lg font-black text-[var(--ink)]">Catatan Strategis Organisasi</h3>
                <p className="text-xs text-[var(--muted)]">Visi, misi, pedoman kerja, atau evaluasi kepengurusan.</p>
              </div>
            </div>

            <button
              onClick={() => setEditOrgOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#f0f4f0] px-3.5 py-1.5 text-xs font-bold text-[var(--brand)] hover:bg-[#dff3e5] transition"
            >
              <PencilLine size={13} /> Edit Catatan
            </button>
          </div>

          <div className="rounded-2xl bg-[#fbfcfb] p-5 border border-[#edf2ee]">
            {editCatatan ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
                {editCatatan}
              </p>
            ) : (
              <p className="text-xs italic text-[var(--muted)]">
                Belum ada catatan khusus untuk organisasi ini. Klik tombol &ldquo;Edit Catatan&rdquo; untuk menambahkan info penting seperti link Google Drive, grup WA, atau catatan evaluasi.
              </p>
            )}
          </div>

          {/* Quick Guidance Box */}
          <div className="rounded-2xl border border-[#d8e3da] bg-gradient-to-r from-[#f7faf8] to-[#f2f8f4] p-5">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="mt-0.5 text-[var(--brand)] shrink-0" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--brand-dark)]">
                  Tips Portofolio Mahasiswa
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                  Semua proker dan peran yang kamu buat di sini otomatis terhubung ke halaman{" "}
                  <Link href="/rekap/portfolio" className="font-bold text-[var(--brand)] hover:underline">
                    Rekap & Portofolio CV
                  </Link>
                  . Jadwalkan agenda rapat dan eksekusi di menu proker agar rekam jejak kontribusimu tercatat akurat!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: UBAH INFORMASI ORGANISASI ── */}
      {editOrgOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative my-auto w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--line)] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2">
                <PencilLine size={18} className="text-[var(--brand)]" />
                <h3 className="font-display text-xl font-black">Ubah Informasi Organisasi</h3>
              </div>
              <button
                onClick={() => setEditOrgOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[#f7f8f5]"
              >
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                if (editLogoUrl) {
                  formData.set("logo_url", editLogoUrl);
                }
                formData.set("catatan", editCatatan);
                await updateOrganization(formData);
                setLogoUrl(editLogoUrl);
                setEditOrgOpen(false);
                showToast("Informasi organisasi berhasil diperbarui!", "success");
              }}
              className="mt-5 space-y-3.5 text-xs [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5"
            >
              <input type="hidden" name="id" value={organization.id} />

              {/* Logo in Edit Modal */}
              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">Logo Organisasi</label>
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-dashed border-[var(--line)] bg-[#fafcfb]">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-2xs flex items-center justify-center">
                    {editLogoUrl ? (
                      <Image
                        src={editLogoUrl}
                        alt="Logo"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Building2 className="text-[var(--muted)]" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--ink)]">
                      {editLogoUrl ? "Logo terpasang" : "Belum ada logo"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => editLogoInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--ink)] shadow-2xs hover:bg-[#f7f8f5]"
                      >
                        <Camera size={12} className="text-[var(--brand)]" />
                        {editLogoUrl ? "Ganti Logo" : "Upload Logo"}
                      </button>
                      {editLogoUrl && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRawCropImage(editLogoUrl);
                              setCropTargetSource("edit_modal");
                              setIsCropModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--brand-dark)] shadow-2xs hover:bg-[#eef7f2]"
                          >
                            <Crop size={12} className="text-[var(--brand)]" /> Sesuaikan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditLogoUrl(null)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={12} /> Hapus Logo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    ref={editLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelectForCrop(e, "edit_modal")}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">Nama Organisasi</label>
                <input required name="nama_organisasi" defaultValue={organization.nama_organisasi} />
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">Tipe Organisasi</label>
                <select name="tipe" defaultValue={organization.tipe}>
                  <option value="organisasi">Organisasi Mahasiswa (BEM/HIMA)</option>
                  <option value="ukm">Unit Kegiatan Mahasiswa (UKM)</option>
                  <option value="ukk">Unit Kegiatan Khusus (UKK)</option>
                  <option value="kepanitiaan">Kepanitiaan Khusus</option>
                  <option value="lainnya">Lainnya / Komunitas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Periode Mulai</label>
                  <input type="date" name="periode_mulai" defaultValue={organization.periode_mulai || ""} />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Periode Selesai</label>
                  <input type="date" name="periode_selesai" defaultValue={organization.periode_selesai || ""} />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">Catatan / Link Penting</label>
                <textarea
                  name="catatan"
                  rows={4}
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  placeholder="Catatan visi misi, link google drive dokumen LPJ, kontak tim, dll."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setEditOrgOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--muted)] hover:bg-[#f7f8f5]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-dark)]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TAMBAH PROGRAM KERJA BARU ── */}
      {newProkerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness size={18} className="text-[var(--brand)]" />
                <h3 className="font-display text-xl font-black">Tambah Program Kerja</h3>
              </div>
              <button
                onClick={() => setNewProkerOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:bg-[#f7f8f5]"
              >
                <X size={16} />
              </button>
            </div>

            <form
              action={async (formData) => {
                await createProgram(formData);
                setNewProkerOpen(false);
              }}
              className="mt-5 space-y-3.5 text-xs [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5"
            >
              <input type="hidden" name="organization_id" value={organization.id} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Nama Program Kerja *</label>
                  <input required name="nama_proker" placeholder="Mis. Seminar Nasional IT 2026" />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Peran Kamu (Opsional)</label>
                  <input name="peran" placeholder="Mis. Project Manager / Koordinator Acara" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--ink)] mb-1">Tujuan / Catatan Proker</label>
                <textarea
                  name="deskripsi"
                  rows={2}
                  placeholder="Target peserta, output kegiatan, atau deskripsi proker..."
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Mulai</label>
                  <input name="tanggal_mulai" type="date" />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Selesai</label>
                  <input name="tanggal_selesai" type="date" />
                </div>
                <div>
                  <label className="block font-bold text-[var(--ink)] mb-1">Status</label>
                  <select name="status" defaultValue="perencanaan">
                    <option value="perencanaan">Rencana</option>
                    <option value="berjalan">Berjalan</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Batal</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setNewProkerOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--muted)] hover:bg-[#f7f8f5]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--brand-dark)]"
                >
                  Tambah Proker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Smart Logo Crop & Adjustment Modal ── */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawCropImage}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleSaveCroppedLogo}
        title="Sesuaikan Logo Organisasi"
        subtitle="Atur orientasi (persegi/landscape/portrait), zoom, posisi, dan rotasi agar logo rapi dan presisi."
        shape="rounded-rect"
        allowAspectRatioChange={true}
        defaultAspectRatio="square"
      />
    </div>
  );
}
