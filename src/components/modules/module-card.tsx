"use client";

import { useState } from "react";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileText,
  Link2,
  Pencil,
  Sparkles,
} from "lucide-react";
import { CourseModuleData, CourseOption, ModuleFormModal } from "./module-form-modal";
import { deleteModule, updateModuleStatus } from "@/app/(dashboard)/modul/actions";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";
import { useToast } from "@/components/ui/toast-provider";

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

export function ModuleCard({
  module,
  courses,
  courseName,
  courseColor,
}: {
  module: CourseModuleData & { id: string };
  courses: CourseOption[];
  courseName?: string;
  courseColor?: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { showToast } = useToast();

  const cfg = STATUS_CONFIG[module.status] || STATUS_CONFIG.belum_baca;
  const StatusIcon = cfg.icon;

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

          {/* Catatan / Resume */}
          {module.catatan && (
            <div className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--card-subtle)] p-2.5 text-[11px] text-[var(--ink)]">
              <p className="font-bold text-[10px] uppercase tracking-wider text-[var(--muted)] mb-0.5">
                📝 Catatan Kuliah:
              </p>
              <p className="line-clamp-3 whitespace-pre-wrap">{module.catatan}</p>
            </div>
          )}
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
              >
                <Link2 size={12} /> Buka Modul
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
    </>
  );
}
