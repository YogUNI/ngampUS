"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
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
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#d6e2d8] bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-[#0f6849]/50 hover:shadow-md"
        style={{ borderLeftColor: courseColor || "#0f6849", borderLeftWidth: "4px" }}
      >
        <div>
          {/* Top row: Pertemuan & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849]">
                PERTEMUAN {module.pertemuan < 10 ? `0${module.pertemuan}` : module.pertemuan}
              </span>
              {courseName && (
                <span className="tag-mono text-[11px] font-bold text-[#697c6f] truncate max-w-[140px] sm:max-w-[200px]">
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
              className={`stamp-badge transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${cfg.badge}`}
            >
              <StatusIcon size={11} strokeWidth={2.5} />
              <span>{cfg.label}</span>
            </button>
          </div>

          {/* Topik Title linked to dedicated detail page */}
          <Link
            href={`/modul/${module.id}`}
            className="group/title mt-3 block"
          >
            <h3 className="font-display text-base sm:text-lg font-black text-[#10261b] group-hover/title:text-[#0f6849] transition flex items-start gap-1.5 leading-snug">
              <span className="break-words">{module.topik}</span>
              <ArrowRight size={15} className="mt-0.5 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-[#0f6849] shrink-0" />
            </h3>
          </Link>

          {/* Deskripsi */}
          {module.deskripsi && (
            <p className="mt-1 text-xs text-[#55675b] leading-relaxed line-clamp-2">
              {module.deskripsi}
            </p>
          )}

          {/* Direct File Document Badge / Download Box */}
          {module.file_url && module.file_name && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#d8e3da] bg-[#fafbfa] p-2.5 transition hover:bg-white hover:border-[#0f6849]/40 hover:shadow-2xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`shrink-0 tag-mono rounded-md border px-1.5 py-0.5 text-[9px] font-black ${fileBadge.color}`}>
                  {fileBadge.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#10261b]">
                    {module.file_name}
                  </p>
                  {module.file_size ? (
                    <p className="tag-mono text-[10px] text-[#697c6f]">
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
                className="tag-mono inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#103626] px-2.5 py-1 text-[10.5px] font-black text-[#c8ef70] shadow-2xs hover:bg-[#1a4a34] transition active:scale-95"
                title="Unduh file dokumen"
              >
                <Download size={11} /> Unduh
              </a>
            </div>
          )}

          {/* Catatan / Resume (Ruled notebook style) */}
          {module.catatan && (
            <div className="mt-3 rounded-xl border border-[#dce6de] bg-[#fbfdfb] p-3 text-[11px] text-[#1e382b] relative overflow-hidden">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="tag-mono font-bold text-[9.5px] uppercase tracking-wider text-[#0f6849]">
                  📝 RESUME CATATAN:
                </span>
              </div>
              <p className="line-clamp-3 whitespace-pre-wrap leading-relaxed font-sans">{module.catatan}</p>
            </div>
          )}

          {/* ── AI STUDY COMPANION TOOLBAR (Campustech Atelier Style) ── */}
          <div className="mt-3.5 rounded-2xl border border-[#d8e3da] bg-[#fcfdfc] p-2.5">
            <div className="flex items-center justify-between px-1 mb-2 gap-1.5">
              <span className="tag-mono flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#0f6849]">
                <Sparkles size={12} className="shrink-0 text-[#0f6849]" /> STUDY AI SUITE
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {module.ai_summary && (
                  <span className="hidden xs:inline-block tag-mono text-[9.5px] font-bold text-[#0f6849]">
                    ✓ Rangkuman Siap
                  </span>
                )}
                <Link
                  href={`/modul/${module.id}`}
                  className="tag-mono inline-flex items-center gap-0.5 text-[10.5px] font-black text-[#0f6849] hover:underline shrink-0"
                  title="Buka ruang belajar penuh untuk modul ini"
                >
                  Ruang Belajar →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {/* 1. Rangkuman AI */}
              <button
                type="button"
                onClick={() => setIsSummaryOpen(true)}
                className="tag-mono inline-flex items-center justify-center gap-1 rounded-xl bg-white py-1.5 px-1 sm:px-2 text-[10.5px] sm:text-[11px] font-bold text-[#10261b] border border-[#d8e3da] hover:border-[#0f6849] hover:text-[#0f6849] transition shadow-2xs text-center cursor-pointer"
                title="Rangkum materi dengan AI"
              >
                <BookOpen size={11} className="text-[#0f6849] shrink-0" />
                <span className="truncate">Rangkum</span>
              </button>

              {/* 2. Tanya AI */}
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="tag-mono inline-flex items-center justify-center gap-1 rounded-xl bg-white py-1.5 px-1 sm:px-2 text-[10.5px] sm:text-[11px] font-bold text-[#10261b] border border-[#d8e3da] hover:border-[#0f6849] hover:text-[#0f6849] transition shadow-2xs text-center cursor-pointer"
                title="Tanya AI seputar materi pertemuan ini"
              >
                <Bot size={11} className="text-[#0f6849] shrink-0" />
                <span className="truncate">Tanya AI</span>
              </button>

              {/* 3. Kuis AI */}
              <button
                type="button"
                onClick={() => setIsQuizOpen(true)}
                className="tag-mono inline-flex items-center justify-center gap-1 rounded-xl bg-[#103626] py-1.5 px-1 sm:px-2 text-[10.5px] sm:text-[11px] font-black text-[#c8ef70] shadow-2xs hover:bg-[#1a4a34] transition active:scale-95 text-center cursor-pointer"
                title="Uji pemahaman dengan Kuis AI"
              >
                <Trophy size={11} className="shrink-0" />
                <span className="truncate">Kuis AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom meta & links */}
        <div className="mt-4 pt-3 border-t border-[#edf2ee] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-[#697c6f] font-medium">
            {module.tanggal_pertemuan ? (
              <span className="tag-mono flex items-center gap-1 text-[10.5px]">
                <Calendar size={12} className="text-[#0f6849]" />
                {module.tanggal_pertemuan}
              </span>
            ) : (
              <span className="tag-mono flex items-center gap-1 text-[10px] text-[#697c6f]">
                <Clock size={11} /> Sesuai Jadwal
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {module.link_modul && (
              <a
                href={module.link_modul}
                target="_blank"
                rel="noopener noreferrer"
                className="tag-mono inline-flex items-center gap-1 rounded-xl bg-[#103626] px-2.5 py-1 text-[10.5px] font-black text-[#c8ef70] shadow-2xs hover:bg-[#1a4a34] transition active:scale-95"
                title="Buka tautan eksternal"
              >
                <Link2 size={11} /> Link
              </a>
            )}

            {module.link_tugas && (
              <a
                href={module.link_tugas}
                target="_blank"
                rel="noopener noreferrer"
                className="tag-mono inline-flex items-center gap-1 rounded-xl border border-[#d8e3da] bg-white px-2.5 py-1 text-[10.5px] font-bold text-[#10261b] hover:bg-[#f4faf6] transition"
              >
                <ExternalLink size={11} /> Tugas
              </a>
            )}

            {/* Edit */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit modul"
              className="grid h-7 w-7 place-items-center rounded-lg text-[#697c6f] transition hover:bg-[#f0f4f0] hover:text-[#10261b] cursor-pointer"
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
          fileName={module.file_name}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
