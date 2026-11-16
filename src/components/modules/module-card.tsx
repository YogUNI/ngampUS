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
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50",
    icon: Circle,
    next: "sudah_baca" as const,
  },
  sudah_baca: {
    label: "Sudah Dibaca",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50",
    icon: CheckCircle2,
    next: "dipelajari" as const,
  },
  dipelajari: {
    label: "Tuntas Dipelajari",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/50",
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
  if (!fileName) return { label: "FILE", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return { label: "PDF", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/50" };
  if (["doc", "docx"].includes(ext || "")) return { label: "WORD", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/50" };
  if (["ppt", "pptx"].includes(ext || "")) return { label: "PPT", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/50" };
  if (["xls", "xlsx"].includes(ext || "")) return { label: "EXCEL", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50" };
  return { label: ext?.toUpperCase() || "DOC", color: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" };
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
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-emerald-500/40 hover:shadow-md"
        style={{ borderLeftColor: courseColor || "#10b981", borderLeftWidth: "4px" }}
      >
        <div>
          {/* Top row: Pertemuan & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="inline-flex rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                PERTEMUAN {module.pertemuan < 10 ? `0${module.pertemuan}` : module.pertemuan}
              </span>
              {courseName && (
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
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
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer ${cfg.badge}`}
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
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover/title:text-emerald-600 dark:group-hover/title:text-emerald-400 transition flex items-start gap-1.5 leading-snug">
              <span className="break-words">{module.topik}</span>
              <ArrowRight size={15} className="mt-0.5 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-emerald-600 dark:text-emerald-400 shrink-0" />
            </h3>
          </Link>

          {/* Deskripsi */}
          {module.deskripsi && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              {module.deskripsi}
            </p>
          )}

          {/* Direct File Document Badge / Download Box */}
          {module.file_url && module.file_name && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-slate-50/70 dark:bg-[#16221a] p-2.5 transition hover:bg-white dark:hover:bg-[#1b2b21] hover:border-emerald-500/40 hover:shadow-2xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${fileBadge.color}`}>
                  {fileBadge.label}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {module.file_name}
                  </p>
                  {module.file_size ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
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
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-2.5 py-1 text-[10.5px] font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title="Unduh file dokumen"
              >
                <Download size={11} /> Unduh
              </a>
            </div>
          )}

          {/* Catatan / Resume */}
          {module.catatan && (
            <div className="mt-3 rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-slate-50/50 dark:bg-[#16221a] p-3 text-[11px] text-slate-700 dark:text-slate-300 relative overflow-hidden">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-bold text-[9.5px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  📝 RESUME CATATAN:
                </span>
              </div>
              <p className="line-clamp-3 whitespace-pre-wrap leading-relaxed">{module.catatan}</p>
            </div>
          )}

          {/* ── AI STUDY COMPANION TOOLBAR ── */}
          <div className="mt-3.5 rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-slate-50/70 dark:bg-[#16221a] p-2.5">
            <div className="flex items-center justify-between px-1 mb-2 gap-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <Sparkles size={12} className="shrink-0 text-emerald-600 dark:text-emerald-400" /> AI STUDY SUITE
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {module.ai_summary && (
                  <span className="hidden xs:inline-block text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400">
                    ✓ Rangkuman Siap
                  </span>
                )}
                <Link
                  href={`/modul/${module.id}`}
                  className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
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
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-white dark:bg-[#111914] py-1.5 px-1 sm:px-2 text-[10.5px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-[#203227] hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition shadow-2xs text-center cursor-pointer"
                title="Rangkum materi dengan AI"
              >
                <BookOpen size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Rangkum</span>
              </button>

              {/* 2. Tanya AI */}
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-white dark:bg-[#111914] py-1.5 px-1 sm:px-2 text-[10.5px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-[#203227] hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition shadow-2xs text-center cursor-pointer"
                title="Tanya AI seputar materi pertemuan ini"
              >
                <Bot size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Tanya AI</span>
              </button>

              {/* 3. Kuis AI */}
              <button
                type="button"
                onClick={() => setIsQuizOpen(true)}
                className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black py-1.5 px-1 sm:px-2 text-[10.5px] sm:text-[11px] font-bold shadow-2xs transition active:scale-95 text-center cursor-pointer"
                title="Uji pemahaman dengan Kuis AI"
              >
                <Trophy size={11} className="shrink-0" />
                <span className="truncate">Kuis AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom meta & links */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1c2d22] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {module.tanggal_pertemuan ? (
              <span className="flex items-center gap-1 text-[10.5px]">
                <Calendar size={12} className="text-emerald-600 dark:text-emerald-400" />
                {module.tanggal_pertemuan}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
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
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 transition"
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
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] px-2 py-0.5 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1f3024] transition"
              >
                <ExternalLink size={11} /> Tugas
              </a>
            )}

            {/* Edit */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit modul"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-[#1f3024] hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
