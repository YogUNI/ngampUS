"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, CalendarClock, CheckSquare, FileText, Plus, X } from "lucide-react";
import { createActivity } from "@/app/(dashboard)/kegiatan/actions";
import { useToast } from "@/components/ui/toast-provider";

type Option = { id: string; name: string; active?: boolean };
type ProgramOption = { id: string; name: string; organization_id?: string | null };

export function ActivityForm({
  semesters,
  organizations,
  programs,
  defaultDate,
  triggerText,
  triggerClass,
  initialOpen = false,
  onClose,
}: {
  semesters: Option[];
  organizations: Option[];
  programs: ProgramOption[];
  defaultDate?: string;
  triggerText?: string;
  triggerClass?: string;
  initialOpen?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"agenda" | "tugas" | "catatan">("agenda");
  const [kategori, setKategori] = useState<string>("organisasi");
  const [prioritas, setPrioritas] = useState<string>("sedang");
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const { showToast } = useToast();

  const availablePrograms = selectedOrgId
    ? programs.filter((p) => p.organization_id === selectedOrgId)
    : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      // Auto map mode to backend fields
      if (mode === "catatan") {
        formData.set("deadline_status", "belum_ditentukan");
        formData.set("jenis_item", "catatan");
      } else {
        formData.set("deadline_status", "terjadwal");
        formData.set("jenis_item", mode === "agenda" ? "reminder" : "tugas");
      }

      await createActivity(formData);
      showToast(
        mode === "agenda"
          ? "Jadwal kegiatan berhasil ditambahkan!"
          : mode === "tugas"
          ? "Tugas baru berhasil dicatat!"
          : "Catatan berhasil disimpan!",
        "success"
      );
      setOpen(false);
      onClose?.();
      setSelectedOrgId("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan kegiatan.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = open ? (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7 shadow-2xl pb-24 sm:pb-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Plus size={18}/>
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold">Jadwalkan / Catat Kegiatan</h2>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Pilih tipe kegiatan agar form menyesuaikan kebutuhanmu secara otomatis.
            </p>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-[#f7f8f5] hover:text-[var(--ink)]"
          >
            <X size={19}/>
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#f0f4f1] p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("agenda");
              if (kategori === "kuliah") setKategori("organisasi");
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition ${
              mode === "agenda"
                ? "bg-white text-[var(--brand)] shadow-sm"
                : "text-[var(--muted)] hover:text-[#103626]"
            }`}
          >
            <Calendar size={15}/> Agenda / Rapat
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("tugas");
              setKategori("kuliah");
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition ${
              mode === "tugas"
                ? "bg-white text-[#b9442a] shadow-sm"
                : "text-[var(--muted)] hover:text-[#103626]"
            }`}
          >
            <CheckSquare size={15}/> Tugas / Deadline
          </button>

          <button
            type="button"
            onClick={() => setMode("catatan")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition ${
              mode === "catatan"
                ? "bg-white text-[#765800] shadow-sm"
                : "text-[var(--muted)] hover:text-[#103626]"
            }`}
          >
            <FileText size={15}/> Catatan Ide
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-4 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-[var(--brand)] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:outline-none [&_select]:focus:border-[var(--brand)] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-[var(--brand)]"
        >
          {/* Judul */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              {mode === "agenda"
                ? "Nama Agenda / Rapat / Pertemuan"
                : mode === "tugas"
                ? "Nama Tugas / Submission"
                : "Judul Catatan"}
            </label>
            <input
              required
              name="judul"
              placeholder={
                mode === "agenda"
                  ? "Contoh: Rapat Pleno 1 BEM, Kelas Pengganti AI, dll."
                  : mode === "tugas"
                  ? "Contoh: Makalah Sistem Terdistribusi, Laporan Lab"
                  : "Contoh: Ide tema proker kaderisasi, link materi"
              }
              className="mt-1"
            />
          </div>

          {/* Kategori & Prioritas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Kategori
              </label>
              <select
                name="kategori"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="mt-1"
              >
                <option value="organisasi">Organisasi</option>
                <option value="kuliah">Kuliah</option>
                <option value="event">Event / Kepanitiaan</option>
                <option value="lomba">Lomba / Kompetisi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Tingkat Kepentingan
              </label>
              <select
                name="prioritas"
                value={prioritas}
                onChange={(e) => setPrioritas(e.target.value)}
                className="mt-1"
              >
                <option value="tinggi">Prioritas Tinggi (Wajib)</option>
                <option value="sedang">Prioritas Sedang (Normal)</option>
                <option value="rendah">Prioritas Rendah (Opsional)</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Waktu Section */}
          {mode === "agenda" && (
            <div className="rounded-2xl border border-[#b9ddc6] bg-[#f4faf6] p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--brand)]">
                <Calendar size={15}/>
                <span>Waktu Pelaksanaan</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)]">Tanggal</label>
                  <input
                    required
                    name="deadline"
                    type="date"
                    defaultValue={defaultDate || ""}
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)]">Jam Pelaksanaan (Opsional)</label>
                  <input name="jam_deadline" type="time" className="mt-1 bg-white"/>
                </div>
              </div>
            </div>
          )}

          {mode === "tugas" && (
            <div className="rounded-2xl border border-[#e8c0b8] bg-[#fdf6f4] p-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#b93c21]">
                <CheckSquare size={15}/>
                <span>Tenggat Waktu (Deadline)</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)]">Batas Tanggal</label>
                  <input
                    required
                    name="deadline"
                    type="date"
                    defaultValue={defaultDate || ""}
                    className="mt-1 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)]">Jam Deadline</label>
                  <input name="jam_deadline" type="time" defaultValue="23:59" className="mt-1 bg-white"/>
                </div>
              </div>
            </div>
          )}

          {mode === "catatan" && (
            <div className="flex items-start gap-2.5 rounded-2xl bg-[#fff9e6] p-3.5 text-xs leading-5 text-[#765800]">
              <CalendarClock size={16} className="mt-0.5 shrink-0"/>
              Item ini disimpan sebagai catatan/ide bebas tanpa pengingat tanggal tertentu.
            </div>
          )}

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Keterangan / Agenda Rapat / Lokasi (Opsional)
            </label>
            <textarea
              name="deskripsi"
              rows={2}
              placeholder="Misal: Ruang Rapat Lt.2 / Link Google Meet / Hal penting yang dibahas"
              className="mt-1"
            />
          </div>

          {/* Konteks Relasi */}
          <div className="rounded-2xl border border-[#d6e1d8] bg-[#f8faf7] p-4">
            <p className="text-xs font-black uppercase tracking-wider text-[var(--ink)]">
              Hubungkan dengan Ruang Kampusmu
            </p>
            <div className="mt-3 space-y-2.5">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)]">Semester</label>
                  <select name="semester_id" defaultValue={semesters.find((s) => s.active)?.id || ""} className="mt-1">
                    <option value="">Tanpa semester</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)]">Organisasi</label>
                  <select
                    name="organization_id"
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="mt-1"
                  >
                    <option value="">Tanpa organisasi</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedOrgId && availablePrograms.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)]">Program Kerja Terkait</label>
                  <select name="program_id" className="mt-1">
                    <option value="">Tanpa proker khusus (Umum)</option>
                    {availablePrograms.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onClose?.();
              }}
              className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f7f8f5]"
            >
              Batal
            </button>
            <button
              disabled={loading}
              className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : mode === "agenda" ? "Jadwalkan Kegiatan" : "Simpan Kegiatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      {!initialOpen && (
        <button
          id="tambah-kegiatan"
          type="button"
          onClick={() => setOpen(true)}
          className={
            triggerClass ||
            "inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#0f6849]/15 transition hover:-translate-y-0.5 hover:bg-[var(--brand-dark)]"
          }
        >
          <Plus size={18}/> {triggerText || "Tambah kegiatan"}
        </button>
      )}

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}

