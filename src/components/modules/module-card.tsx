"use client";

import { useState } from "react";
import {
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Link2,
  MessageSquare,
  Paperclip,
  Pencil,
  Sparkles,
  Trophy,
} from "lucide-react";
import { CourseModuleData, CourseOption, ModuleFormModal } from "./module-form-modal";
import { deleteModule, updateModuleStatus } from "@/app/(dashboard)/modul/actions";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";
import { useToast } from "@/components/ui/toast-provider";
import { ModuleSummaryModal } from "./module-summary-modal";
import { ModuleQuizModal } from "./module-quiz-modal";
import { ModuleChatModal } from "./module-chat-modal";

const STATUS_CONFIG = {
  belum_baca: {
    label: "Belum Dibaca",
    badge: "bg-[#fff0cc] text-[#8a5d00] border-[#fae29c]",
    icon: Circle,
    next: "sudah_baca" as const,
  },
  sudah_baca: {
    label: "Sudah Dibaca",
    badge: "bg-[#dff3e5] text-[var(--brand)] border-[#b9ddc6]",
    icon: CheckCircle2,
    next: "dipelajari" as const,
  },
  dipelajari: {
    label: "Tuntas Dipelajari",
    badge: "bg-[#e8e1fa] text-[#5c3a9c] border-[#d3c5f5]",
    icon: Sparkles,
    next: "belum_baca" as const,
  },
};

function formatBytes(bytes?: number | null, decimals = 1) {
  if (!bytes) return "";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFileBadge(fileName?: string | null) {
  if (!fileName) return { label: "FILE", color: "bg-gray-100 text-gray-700" };
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { label: "PDF", color: "bg-red-50 text-red-700 border-red-200" };
  if (["doc", "docx"].includes(ext || "")) return { label: "WORD", color: "bg-blue-50 text-blue-700 border-blue-200" };
  if (["ppt", "pptx"].includes(ext || "")) return { label: "PPT", color: "bg-orange-50 text-orange-700 border-orange-200" };
  if (["xls", "xlsx"].includes(ext || "")) return { label: "EXCEL", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return { label: ext?.toUpperCase() || "DOC", color: "bg-gray-50 text-gray-700 border-gray-200" };
}

export function ModuleCard({
  module,
  courses,
  courseName,
  courseColor,
}: {
  module: CourseModuleData & {
    id: string;
    ai_summary?: string | null;
    ai_key_points?: string[] | null;
    ai_exam_tips?: string[] | null;
  };
  courses: CourseOption[];
  courseName?: string;
  courseColor?: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { showToast } = useToast();

  const cfg = STATUS_CONFIG[module.status] || STATUS_CONFIG.belum_baca;
  const StatusIcon = cfg.icon;
  const fileBadge = getFileBadge(module.file_name);

  async function handleCycleStatus() {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      await updateModuleStatus(module.id, cfg.next);
      showToast(`Status modul pertemuan ${module.pertemuan} diperbarui!`, "success");
    } catch {
      showToast("Gagal mengubah status modul.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <>
      <article
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-5 transition-all duration-200 hover:border-[var(--brand)]/30 hover:shadow-md"
        style={{ borderLeftColor: courseColor || "var(--brand)", borderLeftWidth: "4px" }}
      >
        <div>
          {/* Top row: Pertemuan & Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--card-subtle)] px-2.5 py-1 text-[11px] font-black tracking-wide text-[var(--brand)] border border-[var(--line)]">
                Pertemuan {module.pertemuan}
              </span>
              {courseName && (
                <span className="truncate text-xs font-bold text-[var(--muted)]">
                  · {courseName}
                </span>
              )}
            </div>

            {/* Quick Status Button */}
            <button
              type="button"
              onClick={handleCycleStatus}
              disabled={isUpdatingStatus}
              title="Klik untuk mengubah status baca"
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 disabled:opacity-50 ${cfg.badge}`}
            >
              <StatusIcon size={12} strokeWidth={2.5} />
              <span>{cfg.label}</span>
            </button>
          </div>

          {/* Topik Title */}
          <h3 className="font-display mt-2.5 text-sm sm:text-base font-black text-[var(--ink)]">
            {module.topik}
          </h3>

          {/* Deskripsi */}
          {module.deskripsi && (
            <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
              {module.deskripsi}
            </p>
          )}

          {/* Direct File Document Badge / Download Box */}
          {module.file_url && module.file_name && (
            <div className="mt-3 flex items-center justify-between gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] p-2.5 transition hover:bg-[var(--card-bg)]">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-black ${fileBadge.color}`}>
                  {fileBadge.label}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[var(--ink)]">
                    {module.file_name}
                  </p>
                  {module.file_size ? (
                    <p className="text-[10px] text-[var(--muted)] font-medium">
                      {formatBytes(module.file_size)}
                    </p>
                  ) : null}
                </div>
              </div>

              <a
                href={module.file_url}
                download={module.file_name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[var(--brand)] px-2.5 py-1 text-[11px] font-black text-white shadow-2xs hover:bg-[var(--brand-dark)] transition active:scale-95"
                title="Unduh file dokumen"
              >
                <Download size={12} /> Unduh
              </a>
            </div>
          )}

          {/* Catatan / Resume */}
          {module.catatan && (
            <div className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--card-subtle)] p-2.5 text-[11px] text-[var(--ink)]">
              <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--muted)] mb-0.5">
                📝 Catatan Kuliah:
              </p>
              <p className="line-clamp-3 whitespace-pre-wrap">{module.catatan}</p>
            </div>
          )}

          {/* ── AI STUDY COMPANION TOOLBAR ── */}
          <div className="mt-3.5 rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-2">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[var(--brand)]">
                <Sparkles size={12} /> AI Study Companion
              </span>
              {module.ai_summary && (
                <span className="text-[9.5px] font-bold text-emerald-600">
                  ✓ Rangkuman Siap
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* 1. Rangkuman AI */}
              <button
                type="button"
                onClick={() => setIsSummaryOpen(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[var(--card-bg)] py-1.5 px-2 text-[11px] font-bold text-[var(--ink)] border border-[var(--line)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition shadow-2xs"
                title="Rangkum materi dengan AI"
              >
                <BookOpen size={12} className="text-[var(--brand)]" />
                <span>Rangkuman</span>
              </button>

              {/* 2. Tanya AI */}
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[var(--card-bg)] py-1.5 px-2 text-[11px] font-bold text-[var(--ink)] border border-[var(--line)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition shadow-2xs"
                title="Tanya AI seputar materi pertemuan ini"
              >
                <Bot size={12} className="text-[var(--brand)]" />
                <span>Tanya AI</span>
              </button>

              {/* 3. Kuis AI */}
              <button
                type="button"
                onClick={() => setIsQuizOpen(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#103626] py-1.5 px-2 text-[11px] font-black text-[#c8ef70] shadow-2xs hover:bg-[#1a4a34] transition active:scale-95"
                title="Uji pemahaman dengan Kuis AI"
              >
                <Trophy size={12} />
                <span>Kuis Modul</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom meta & links */}
        <div className="mt-4 pt-3 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-[var(--muted)] font-medium">
            {module.tanggal_pertemuan ? (
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {module.tanggal_pertemuan}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                <Clock size={12} /> Sesuai Jadwal
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {module.link_modul && (
              <a
                href={module.link_modul}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-[#103626] px-2.5 py-1.5 text-[11px] font-black text-[#c8ef70] shadow-2xs hover:bg-[#1a4a34] transition active:scale-95"
                title="Buka tautan eksternal"
              >
                <Link2 size={12} /> Link
              </a>
            )}

            {module.link_tugas && (
              <a
                href={module.link_tugas}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--ink)] hover:bg-[var(--card-subtle)] transition"
              >
                <ExternalLink size={12} /> Tugas
              </a>
            )}

            {/* Edit */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit modul"
              className="grid h-7 w-7 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--card-subtle)] hover:text-[var(--ink)]"
            >
              <Pencil size={13} />
            </button>

            {/* Delete */}
            <ConfirmDeleteForm
              action={deleteModule}
              id={module.id}
              itemName={`modul pertemuan ke-${module.pertemuan} (${module.topik})`}
            />
          </div>
        </div>
      </article>

      {/* Edit modal */}
      {isEditing && (
        <ModuleFormModal
          module={module}
          courses={courses}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}

      {/* AI Summary Modal */}
      {isSummaryOpen && (
        <ModuleSummaryModal
          moduleId={module.id}
          moduleTopik={module.topik}
          pertemuan={module.pertemuan}
          courseName={courseName}
          initialSummary={module.ai_summary}
          initialKeyPoints={module.ai_key_points}
          initialExamTips={module.ai_exam_tips}
          isOpen={isSummaryOpen}
          onClose={() => setIsSummaryOpen(false)}
        />
      )}

      {/* AI Quiz Modal */}
      {isQuizOpen && (
        <ModuleQuizModal
          moduleId={module.id}
          moduleTopik={module.topik}
          pertemuan={module.pertemuan}
          courseName={courseName}
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
        />
      )}

      {/* AI Chat Modal */}
      {isChatOpen && (
        <ModuleChatModal
          moduleId={module.id}
          moduleTopik={module.topik}
          pertemuan={module.pertemuan}
          courseName={courseName}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
