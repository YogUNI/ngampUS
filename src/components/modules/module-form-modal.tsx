"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Link2,
  Paperclip,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { createModule, updateModule } from "@/app/(dashboard)/modul/actions";
import { useToast } from "@/components/ui/toast-provider";
import { createClient } from "@/lib/supabase/client";

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
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
};

export type CourseOption = {
  id: string;
  nama_matkul: string;
  kode_matkul?: string | null;
  sks?: number;
  warna_label?: string | null;
  semester_id?: string;
};

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

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
  const [uploadProgress, setUploadProgress] = useState(false);
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

  // File document upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<{
    url: string;
    name: string;
    size?: number | null;
    type?: string | null;
  } | null>(
    module?.file_url && module?.file_name
      ? {
          url: module.file_url,
          name: module.file_name,
          size: module.file_size,
          type: module.file_type,
        }
      : null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      showToast("Ukuran file maksimal 50MB.", "error");
      return;
    }

    setSelectedFile(file);
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExistingFile(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);

      // Handle direct file upload to Supabase Storage if file selected
      let fileUrl = existingFile?.url || "";
      let fileName = existingFile?.name || "";
      let fileSize = existingFile?.size || 0;
      let fileType = existingFile?.type || "";

      if (selectedFile) {
        setUploadProgress(true);
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("Sesi login berakhir.");

        // Sanitize file name & add timestamp
        const cleanName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${user.id}/${Date.now()}_${cleanName}`;

        const { error: uploadError } = await supabase.storage
          .from("course-materials")
          .upload(filePath, selectedFile, {
            upsert: true,
            contentType: selectedFile.type || "application/octet-stream",
          });

        if (uploadError) {
          throw new Error("Gagal mengunggah dokumen: " + uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("course-materials")
          .getPublicUrl(filePath);

        fileUrl = publicUrlData.publicUrl;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        fileType = selectedFile.type;
        setUploadProgress(false);
      }

      formData.set("file_url", fileUrl);
      formData.set("file_name", fileName);
      formData.set("file_size", String(fileSize || ""));
      formData.set("file_type", fileType);

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
      setUploadProgress(false);
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
            <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#d6e2d8] bg-white p-5 sm:p-7 shadow-2xl transition-all">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[#edf2ee] pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#103626] text-[#c8ef70] shadow-sm">
                    <BookOpen size={20} strokeWidth={2.5} />
                  </span>
                  <div>
                    <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849]">
                      {isEdit ? "CODEX // EDIT MODUL" : "CODEX // MODUL BARU"}
                    </span>
                    <h2 className="font-display text-lg sm:text-xl font-black tracking-tight text-[#10261b] mt-0.5">
                      {isEdit ? "Edit Arsip Modul Kuliah" : "Tambah Dokumen & Modul Kuliah"}
                    </h2>
                    <p className="tag-mono mt-0.5 text-[11px] text-[#697c6f]">
                      Unggah slide PDF/Word dosen atau sematkan tautan Google Drive.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-[#697c6f] transition hover:bg-[#f0f4f0] hover:text-[#10261b] cursor-pointer"
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

                {/* FILE UPLOAD SECTION (PDF, Word, PPT, Excel, dll.) */}
                <div>
                  <label className="block text-xs font-bold text-[var(--ink)]">
                    Unggah Dokumen Modul (Word, PDF, PPT, Excel, dll.)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                    className="hidden"
                  />

                  {selectedFile ? (
                    /* Newly selected file banner */
                    <div className="mt-1.5 flex items-center justify-between gap-3 rounded-2xl border border-[var(--brand)]/40 bg-[var(--brand-soft)] p-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white">
                          <FileCheck size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-[var(--ink)]">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] font-bold text-[var(--muted)]">
                            {formatBytes(selectedFile.size)} · Siap diunggah
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        title="Hapus file"
                        className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-white hover:text-red-600 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : existingFile ? (
                    /* Existing file from database */
                    <div className="mt-1.5 flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
                          <FileText size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-black text-[var(--ink)]">
                            {existingFile.name}
                          </p>
                          <p className="text-[10px] font-semibold text-[var(--muted)]">
                            {existingFile.size ? formatBytes(existingFile.size) : "Dokumen tersimpan"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-[var(--brand)] hover:bg-[var(--card-bg)] transition"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          title="Hapus file tersimpan"
                          className="rounded-lg p-1.5 text-[var(--muted)] hover:text-red-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Upload Dropzone / Button */
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1.5 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--card-subtle)] p-4 text-center cursor-pointer transition hover:border-[var(--brand)] hover:bg-[var(--card-bg)]"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
                        <UploadCloud size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[var(--ink)]">
                          Klik untuk memilih file dokumen
                        </p>
                        <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                          Format didukung: PDF, Word (.docx), PPT (.pptx), Excel (.xlsx), ZIP (Maksimal 50MB)
                        </p>
                      </div>
                    </div>
                  )}
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

                {/* Link Modul Eksternal & Link Tugas */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)]">
                      Link Eksternal (Google Drive / Slide jika ada)
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
                      Status Pemahaman
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
                    Catatan Materi / Kisi-kisi Kuliah
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
                    {uploadProgress ? (
                      "Mengunggah Dokumen..."
                    ) : loading ? (
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
