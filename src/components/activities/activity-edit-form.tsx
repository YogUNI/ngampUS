"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BookOpen, PencilLine, X } from "lucide-react";
import { updateActivity } from "@/app/(dashboard)/kegiatan/actions";

import { useToast } from "@/components/ui/toast-provider";

type Activity = {
  id: string;
  judul: string;
  deskripsi: string | null;
  kategori: string;
  jenis_item: string;
  prioritas: string;
  tanggal_mulai: string | null;
  deadline_status: string;
  deadline: string | null;
  jam_deadline: string | null;
  semester_id: string | null;
  organization_id: string | null;
  program_id: string | null;
  course_id?: string | null;
  is_portfolio: boolean;
  peran_portfolio: string | null;
};
type Option = { id: string; name: string };
type ProgramOption = { id: string; name: string; organization_id?: string | null };
type CourseOption = { id: string; name: string; semester_id?: string | null; sks?: number };

const PORTFOLIO_CATEGORIES = ["lomba", "event", "organisasi"];

export function ActivityEditForm({
  activity,
  semesters,
  organizations,
  programs,
  courses = [],
}: {
  activity: Activity;
  semesters: Option[];
  organizations: Option[];
  programs: ProgramOption[];
  courses?: CourseOption[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fully controlled form state
  const [judul, setJudul] = useState(activity.judul);
  const [deskripsi, setDeskripsi] = useState(activity.deskripsi || "");
  const [jenisItem, setJenisItem] = useState<string>(activity.jenis_item);
  const [kategori, setKategori] = useState<string>(activity.kategori);
  const [prioritas, setPrioritas] = useState<string>(activity.prioritas);
  const [tanggalMulai, setTanggalMulai] = useState(activity.tanggal_mulai || "");
  const [deadlineStatus, setDeadlineStatus] = useState(activity.deadline_status as "terjadwal" | "belum_ditentukan");
  const [deadline, setDeadline] = useState(activity.deadline || "");
  const [jamDeadline, setJamDeadline] = useState(activity.jam_deadline || "");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(activity.semester_id || "");
  const [selectedOrgId, setSelectedOrgId] = useState<string>(activity.organization_id || "");
  const [selectedProgramId, setSelectedProgramId] = useState<string>(activity.program_id || "");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(activity.course_id || "");
  const [isPortfolio, setIsPortfolio] = useState(activity.is_portfolio ?? PORTFOLIO_CATEGORIES.includes(activity.kategori));
  const [peranPortfolio, setPeranPortfolio] = useState(activity.peran_portfolio || "");

  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset all form state to latest activity data every time modal opens
  useEffect(() => {
    if (open) {
      setJudul(activity.judul);
      setDeskripsi(activity.deskripsi || "");
      setJenisItem(activity.jenis_item);
      setKategori(activity.kategori);
      setPrioritas(activity.prioritas);
      setTanggalMulai(activity.tanggal_mulai || "");
      setDeadlineStatus(activity.deadline_status as "terjadwal" | "belum_ditentukan");
      setDeadline(activity.deadline || "");
      setJamDeadline(activity.jam_deadline || "");
      setSelectedSemesterId(activity.semester_id || "");
      setSelectedOrgId(activity.organization_id || "");
      setSelectedProgramId(activity.program_id || "");
      setSelectedCourseId(activity.course_id || "");
      setIsPortfolio(activity.is_portfolio ?? PORTFOLIO_CATEGORIES.includes(activity.kategori));
      setPeranPortfolio(activity.peran_portfolio || "");
    }
  }, [open, activity]);

  const availablePrograms = selectedOrgId
    ? programs.filter((p) => p.organization_id === selectedOrgId)
    : [];

  const availableCourses = selectedSemesterId
    ? courses.filter((c) => !c.semester_id || c.semester_id === selectedSemesterId)
    : courses;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("id", activity.id);
      formData.set("judul", judul);
      formData.set("deskripsi", deskripsi);
      formData.set("jenis_item", jenisItem);
      formData.set("kategori", kategori);
      formData.set("prioritas", prioritas);
      formData.set("tanggal_mulai", tanggalMulai);
      formData.set("deadline_status", deadlineStatus);
      formData.set("deadline", deadlineStatus === "terjadwal" ? deadline : "");
      formData.set("jam_deadline", deadlineStatus === "terjadwal" ? jamDeadline : "");
      formData.set("semester_id", selectedSemesterId);
      formData.set("organization_id", selectedOrgId);
      formData.set("program_id", selectedProgramId);
      formData.set("course_id", kategori === "kuliah" ? selectedCourseId : "");
      formData.set("is_portfolio", isPortfolio ? "true" : "false");
      formData.set("peran_portfolio", isPortfolio ? peranPortfolio : "");
      await updateActivity(formData);
      showToast("Kegiatan berhasil diperbarui!", "success");
      setOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui kegiatan.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  const modalContent = open ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--brand)]">UBAH KEGIATAN</p>
            <h2 className="font-display mt-1 text-2xl font-extrabold">Perbarui detail item</h2>
          </div>
          <button onClick={() => setOpen(false)} title="Tutup" className="rounded-lg p-2 hover:bg-[#f7f8f5]">
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-[var(--brand)] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5"
        >
          <input type="hidden" name="id" value={activity.id} />
          <input type="hidden" name="is_portfolio" value={isPortfolio ? "true" : "false"} />

          <label className="block text-sm font-bold">
            Judul
            <input required name="judul" value={judul} onChange={(e) => setJudul(e.target.value)} className="mt-1.5" />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <select
              name="jenis_item"
              value={jenisItem}
              onChange={(e) => setJenisItem(e.target.value)}
            >
              <option value="tugas">Tugas</option>
              <option value="reminder">Reminder</option>
              <option value="catatan">Catatan</option>
            </select>
            <select
              name="kategori"
              value={kategori}
              onChange={(e) => {
                const newKat = e.target.value;
                setKategori(newKat);
                if (newKat !== "kuliah") setSelectedCourseId("");
              }}
            >
              <option value="kuliah">Kuliah</option>
              <option value="organisasi">Organisasi</option>
              <option value="lomba">Lomba</option>
              <option value="event">Event</option>
              <option value="lainnya">Lainnya</option>
            </select>
            <select
              name="prioritas"
              value={prioritas}
              onChange={(e) => setPrioritas(e.target.value)}
            >
              <option value="tinggi">Tinggi</option>
              <option value="sedang">Sedang</option>
              <option value="rendah">Rendah</option>
            </select>
          </div>

          {/* Pilihan Mata Kuliah (Khusus Kategori Kuliah) */}
          {kategori === "kuliah" && (
            <div className="rounded-2xl border border-[#c7d2fe] bg-[#f5f7ff] p-3 transition-all">
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#3730a3]">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#4f46e5]" />
                  Mata Kuliah Terkait (Semester Ini)
                </span>
              </label>
              {availableCourses.length > 0 ? (
                <select
                  name="course_id"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="mt-1.5 bg-white text-xs font-semibold text-[#1e1b4b] border-[#c7d2fe] focus:border-[#4f46e5]"
                >
                  <option value="">Pilih mata kuliah (opsional / umum)</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.sks ? `(${c.sks} SKS)` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-1.5 rounded-xl bg-white p-2.5 border border-[#e0e7ff] text-xs text-[#4338ca]">
                  <p className="font-bold text-[11px]">Belum ada jadwal mata kuliah yang ditambahkan.</p>
                </div>
              )}
            </div>
          )}

          <label className="block text-sm font-bold">
            Deskripsi
            <textarea name="deskripsi" rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="mt-1.5" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-bold text-[var(--muted)]">
              Tanggal mulai
              <input name="tanggal_mulai" type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="mt-1" />
            </label>
            <label className="text-xs font-bold text-[var(--muted)]">
              Status deadline
              <select
                name="deadline_status"
                value={deadlineStatus}
                onChange={(e) => setDeadlineStatus(e.target.value as typeof deadlineStatus)}
                className="mt-1"
              >
                <option value="terjadwal">Terjadwal</option>
                <option value="belum_ditentukan">Belum ditentukan</option>
              </select>
            </label>
          </div>

          {deadlineStatus === "terjadwal" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-bold text-[var(--muted)]">
                Tanggal deadline
                <input required name="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
              </label>
              <label className="text-xs font-bold text-[var(--muted)]">
                Jam deadline
                <input name="jam_deadline" type="time" value={jamDeadline} onChange={(e) => setJamDeadline(e.target.value)} className="mt-1" />
              </label>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <select
              name="semester_id"
              value={selectedSemesterId}
              onChange={(e) => {
                const newSemId = e.target.value;
                setSelectedSemesterId(newSemId);
                if (selectedCourseId) {
                  const courseObj = courses.find((c) => c.id === selectedCourseId);
                  if (courseObj?.semester_id && courseObj.semester_id !== newSemId) {
                    setSelectedCourseId("");
                  }
                }
              }}
            >
              <option value="">Tanpa semester</option>
              {semesters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select name="organization_id" value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}>
              <option value="">Tanpa organisasi</option>
              {organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <select
              name="program_id"
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              disabled={!selectedOrgId}
            >
              <option value="">{selectedOrgId ? "Tanpa proker" : "Pilih organisasi dulu"}</option>
              {availablePrograms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>

          {/* Portfolio Toggle */}
          <div
            className={`flex items-start justify-between gap-3 rounded-2xl border px-3.5 py-3 cursor-pointer transition ${
              isPortfolio ? "border-[#c8ef70] bg-[#f4fbe8]" : "border-[var(--line)] bg-[#fafbf9]"
            }`}
            onClick={() => setIsPortfolio((v) => !v)}
          >
            <div className="min-w-0">
              <p className={`text-xs font-black ${isPortfolio ? "text-[#456a1e]" : "text-[var(--muted)]"}`}>
                {isPortfolio ? "⭐ Masuk ke Portofolio Semester" : "📋 Tidak Masuk Portofolio"}
              </p>
              <p className="mt-0.5 text-[10.5px] text-[var(--muted)] leading-snug">
                {isPortfolio
                  ? "Ditampilkan di CV / rekap prestasi semester."
                  : "Bersifat internal/pribadi, tidak masuk rekap CV."}
              </p>
            </div>
            <div className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${isPortfolio ? "bg-[#6aaa17]" : "bg-[#d0d5c8]"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${isPortfolio ? "left-[18px]" : "left-0.5"}`} />
            </div>
          </div>

          {/* Peran Portfolio Field */}
          {isPortfolio && (
            <label className="block text-xs font-bold text-[var(--muted)]">
              Peran / Pencapaian (Opsional)
              <input
                name="peran_portfolio"
                value={peranPortfolio}
                onChange={(e) => setPeranPortfolio(e.target.value)}
                placeholder="Contoh: Ketua Pelaksana, Juara 2 Nasional"
                maxLength={120}
                className="mt-1"
              />
            </label>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f7f8f5]">Batal</button>
            <button disabled={loading} className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)] disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Ubah ${activity.judul}`}
        className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[#dcefe4] hover:text-[var(--brand)]"
      >
        <PencilLine size={16} />
      </button>

      {mounted && modalContent ? createPortal(modalContent, document.body) : null}
    </>
  );
}
