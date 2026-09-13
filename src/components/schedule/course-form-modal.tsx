"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Calendar, Clock, MapPin, Link2, Plus, User, X } from "lucide-react";
import { createCourse, updateCourse } from "@/app/(dashboard)/jadwal/actions";
import { useToast } from "@/components/ui/toast-provider";

export type CourseData = {
  id?: string;
  semester_id: string;
  nama_matkul: string;
  kode_matkul?: string | null;
  sks: number;
  dosen_pengampu?: string | null;
  kontak_dosen?: string | null;
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
  tipe_pertemuan: "offline" | "online" | "hybrid";
  ruangan?: string | null;
  link_pertemuan?: string | null;
  link_materi?: string | null;
  warna_label: string;
  catatan?: string | null;
};

const COLOR_PRESETS = [
  { label: "Emerald (Brand)", hex: "#0f6849" },
  { label: "Blue / Info", hex: "#2563eb" },
  { label: "Purple / Creative", hex: "#7c3aed" },
  { label: "Amber / Warning", hex: "#d97706" },
  { label: "Rose / Urgent", hex: "#e11d48" },
  { label: "Teal / Fresh", hex: "#0d9488" },
];

const DAYS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

export function CourseFormModal({
  course,
  semesters,
  activeSemesterId,
  triggerText,
  triggerClass,
  isOpen: externalOpen,
  onClose: externalClose,
}: {
  course?: CourseData;
  semesters: { id: string; nama_semester: string; is_active: boolean }[];
  activeSemesterId?: string;
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

  const isEdit = Boolean(course?.id);

  const [tipe, setTipe] = useState<"offline" | "online" | "hybrid">(
    course?.tipe_pertemuan || "offline"
  );
  const [warna, setWarna] = useState<string>(course?.warna_label || "#0f6849");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (isEdit) {
        await updateCourse(formData);
        showToast("Mata kuliah berhasil diperbarui!", "success");
      } else {
        await createCourse(formData);
        showToast("Mata kuliah baru berhasil ditambahkan!", "success");
      }
      setOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  const modalContent = open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand)]">
              {isEdit ? "UBAH JADWAL KULIAH" : "TAMBAH MATA KULIAH"}
            </p>
            <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight">
              {isEdit ? course?.nama_matkul : "Detail Jadwal & Mata Kuliah"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup modal"
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-[#f7f8f5] hover:text-[var(--ink)]"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-[var(--brand)] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:outline-none [&_select]:focus:border-[var(--brand)] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-[var(--brand)]"
        >
          {isEdit && <input type="hidden" name="id" value={course?.id} />}
          <input type="hidden" name="warna_label" value={warna} />

          {/* Semester Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Semester
            </label>
            <select
              name="semester_id"
              required
              defaultValue={course?.semester_id || activeSemesterId || semesters[0]?.id || ""}
              className="mt-1"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_semester} {s.is_active ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Nama & Kode Matkul */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Nama Mata Kuliah *
              </label>
              <input
                required
                name="nama_matkul"
                defaultValue={course?.nama_matkul || ""}
                placeholder="Misal: Pemrograman Web Lanjut"
                className="mt-1 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Kode Matkul
              </label>
              <input
                name="kode_matkul"
                defaultValue={course?.kode_matkul || ""}
                placeholder="IF1234"
                className="mt-1"
              />
            </div>
          </div>

          {/* SKS & Hari & Jam */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Bobot SKS
              </label>
              <select name="sks" defaultValue={course?.sks ?? 3} className="mt-1">
                {[1, 2, 3, 4, 6].map((s) => (
                  <option key={s} value={s}>
                    {s} SKS
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Hari Kuliah *
              </label>
              <select name="hari" required defaultValue={course?.hari ?? 1} className="mt-1 font-semibold">
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Jam Mulai *
              </label>
              <input
                required
                type="time"
                name="jam_mulai"
                defaultValue={course?.jam_mulai ? course.jam_mulai.slice(0, 5) : "08:00"}
                className="mt-1 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Jam Selesai *
              </label>
              <input
                required
                type="time"
                name="jam_selesai"
                defaultValue={course?.jam_selesai ? course.jam_selesai.slice(0, 5) : "10:30"}
                className="mt-1 font-semibold"
              />
            </div>
          </div>

          {/* Dosen & Kontak */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Dosen Pengampu (Opsional)
              </label>
              <input
                name="dosen_pengampu"
                defaultValue={course?.dosen_pengampu || ""}
                placeholder="Nama Dosen / Gelar"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Kontak Dosen / Asisten
              </label>
              <input
                name="kontak_dosen"
                defaultValue={course?.kontak_dosen || ""}
                placeholder="Email dosen / No. WA / Info Komti"
                className="mt-1"
              />
            </div>
          </div>

          {/* Tipe & Lokasi Kelas */}
          <div className="rounded-2xl border border-[#d6e1d8] bg-[#f8faf7] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">
                Format Pertemuan
              </label>
              <div className="flex gap-1.5">
                {(["offline", "online", "hybrid"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipe(t)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition ${
                      tipe === t
                        ? "bg-[var(--brand)] text-white shadow-xs"
                        : "bg-white text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <input type="hidden" name="tipe_pertemuan" value={tipe} />

            <div className="grid sm:grid-cols-2 gap-3">
              {(tipe === "offline" || tipe === "hybrid") && (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)]">
                    Gedung / Ruang Kelas
                  </label>
                  <input
                    name="ruangan"
                    defaultValue={course?.ruangan || ""}
                    placeholder="Contoh: R.402 Gedung Kuliah Utama"
                    className="mt-1 bg-white"
                  />
                </div>
              )}

              {(tipe === "online" || tipe === "hybrid") && (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)]">
                    Link Kuliah Virtual (Zoom / Meet)
                  </label>
                  <input
                    type="url"
                    name="link_pertemuan"
                    defaultValue={course?.link_pertemuan || ""}
                    placeholder="https://zoom.us/j/..."
                    className="mt-1 bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quick Hub: Link Materi / Drive */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Link Drive / Modul / Classroom (Opsional)
            </label>
            <input
              type="url"
              name="link_materi"
              defaultValue={course?.link_materi || ""}
              placeholder="https://drive.google.com/drive/folders/..."
              className="mt-1"
            />
          </div>

          {/* Tag Warna Kartu */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Warna Penanda Jadwal
            </label>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setWarna(preset.hex)}
                  title={preset.label}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    warna === preset.hex ? "ring-2 ring-offset-2 ring-[var(--brand)] scale-110 shadow-sm" : "hover:scale-105 opacity-80"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f7f8f5]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : isEdit ? "Perbarui Mata Kuliah" : "Simpan Jadwal Kuliah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      {!isControlled && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={
            triggerClass ||
            "inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0f6849]/15 transition hover:bg-[var(--brand-dark)]"
          }
        >
          <Plus size={16} /> {triggerText || "Tambah Mata Kuliah"}
        </button>
      )}
      {typeof document !== "undefined" && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
