"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Calendar, ExternalLink, FileText, Link2, Plus, Sparkles, X } from "lucide-react";
import { createModule, updateModule } from "@/app/(dashboard)/modul/actions";
import { useToast } from "@/components/ui/toast-provider";

export type CourseModuleData = {
  id?: string;
  course_id: string;
  pertemuan: number;
  topik: string;
  deskripsi?: string | null;
  link_modul?: string | null;
  link_tugas?: string | null;
  status: "belum_baca" | "sudah_baca" | "dipelajari";
  tanggal_pertemuan?: string | null;
  catatan?: string | null;
};

export type CourseOption = {
  id: string;
  nama_matkul: string;
  kode_matkul?: string | null;
  sks?: number;
  warna_label?: string | null;
  semester_id?: string;
};

export function ModuleFormModal({
  module,
  courses,
  defaultCourseId,
  defaultPertemuan,
  triggerText,
  triggerClass,
  isOpen: externalOpen,
  onClose: externalClose,
}: {
  module?: CourseModuleData;
  courses: CourseOption[];
  defaultCourseId?: string;
  defaultPertemuan?: number;
  triggerText?: string;
  triggerClass?: string;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) {
      if (!val && externalClose) externalClose();
    } else {
      setInternalOpen(val);
    }
  };

  const isEdit = Boolean(module?.id);
  const [status, setStatus] = useState<"belum_baca" | "sudah_baca" | "dipelajari">(
    module?.status || "belum_baca"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (isEdit && module?.id) {
        formData.set("id", module.id);
        await updateModule(formData);
        showToast("Modul perkuliahan berhasil diperbarui!", "success");
      } else {
        await createModule(formData);
        showToast("Modul perkuliahan berhasil ditambahkan!", "success");
      }
      setOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan modul.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            triggerClass ||
            "inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-3.5 py-2 text-xs font-black text-white shadow-xs transition hover:bg-[var(--brand-dark)] active:scale-95"
          }
        >
          <Plus size={15} strokeWidth={2.5} />
          {triggerText || "Tambah Modul"}
        </button>
      )}

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setOpen(false)}
            />

            {/* Modal Dialog Content */}
            <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--background)] p-5 sm:p-7 shadow-2xl transition-all">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dff3e5] text-[var(--brand)]">
                    <BookOpen size={20} strokeWidth={2.2} />
                  </span>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-black tracking-tight text-[var(--ink)]">
                      {isEdit ? "Edit Modul Kuliah" : "Tambah Modul Kuliah"}
                    </h2>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">
                      Simpan materi dosen, link Google Drive/slide, dan tugas pertemuan.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-[var(--muted)] transition hover:bg-[#eaf5eb] hover:text-[var(--ink)]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Pilih Mata Kuliah & Pertemuan ke */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[var(--ink)]">
                      Mata Kuliah <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="course_id"
                      required
                      defaultValue={module?.course_id || defaultCourseId || courses[0]?.id || ""}
                      className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs font-semibold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama_matkul} {c.kode_matkul ? `(${c.kode_matkul})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)]">
                      Pertemuan Ke- <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="pertemuan"
                      min={1}
                      max={32}
                      required
                      defaultValue={module?.pertemuan ?? defaultPertemuan ?? 1}
                      className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs font-bold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Topik Materi */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)]">
                    Topik / Judul Materi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topik"
                    required
                    defaultValue={module?.topik || ""}
                    placeholder="Contoh: Pertemuan 3 - Pengenalan Algoritma Sorting"
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs font-semibold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                  />
                </div>

                {/* Deskripsi Singkat */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)]">
                    Deskripsi Ringkas / Silabus
                  </label>
                  <input
                    type="text"
                    name="deskripsi"
                    defaultValue={module?.deskripsi || ""}
                    placeholder="Contoh: Bubble sort, Quick sort, kompleksitas O(n log n)"
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                  />
                </div>

                {/* Link Modul & Link Tugas */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)]">
                      Link Modul / Slide Dosen
                    </label>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--muted)]">
                        <Link2 size={14} />
                      </span>
                      <input
                        type="url"
                        name="link_modul"
                        defaultValue={module?.link_modul || ""}
                        placeholder="https://drive.google.com/..."
                        className="block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] py-2 pl-9 pr-3 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)]">
                      Link Tugas / Submission (Opsional)
                    </label>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--muted)]">
                        <ExternalLink size={14} />
                      </span>
                      <input
                        type="url"
                        name="link_tugas"
                        defaultValue={module?.link_tugas || ""}
                        placeholder="https://classroom.google.com/..."
                        className="block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] py-2 pl-9 pr-3 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Tanggal Pertemuan & Status Baca */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)]">
                      Tanggal Pertemuan
                    </label>
                    <div className="relative mt-1">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--muted)]">
                        <Calendar size={14} />
                      </span>
                      <input
                        type="date"
                        name="tanggal_pertemuan"
                        defaultValue={module?.tanggal_pertemuan || ""}
                        className="block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] py-2 pl-9 pr-3 text-xs font-semibold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)]">
                      Status Baca
                    </label>
                    <input type="hidden" name="status" value={status} />
                    <div className="mt-1 grid grid-cols-3 gap-1 rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] p-1">
                      {(
                        [
                          { id: "belum_baca", label: "Belum" },
                          { id: "sudah_baca", label: "Dibaca" },
                          { id: "dipelajari", label: "Paham ✓" },
                        ] as const
                      ).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStatus(s.id)}
                          className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                            status === s.id
                              ? "bg-[var(--brand)] text-white shadow-xs"
                              : "text-[var(--muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Catatan Pribadi / Resume */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)]">
                    Catatan Materi / Resume Pribadi
                  </label>
                  <textarea
                    name="catatan"
                    rows={3}
                    defaultValue={module?.catatan || ""}
                    placeholder="Tulis poin penting dari dosen, catatan ujian, atau kisi-kisi..."
                    className="mt-1 block w-full rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 border-t border-[var(--line)] pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                    className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-4 py-2.5 text-xs font-bold text-[var(--muted)] transition hover:bg-[var(--card-subtle)] hover:text-[var(--ink)]"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-xs font-black text-white shadow-xs transition hover:bg-[var(--brand-dark)] active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      "Menyimpan..."
                    ) : (
                      <>
                        <Sparkles size={14} />
                        {isEdit ? "Simpan Perubahan" : "Tambahkan Modul"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
