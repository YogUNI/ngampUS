"use client";

import { useState } from "react";
import { CalendarClock, Plus, X } from "lucide-react";
import { createActivity } from "@/app/(dashboard)/kegiatan/actions";

import { useToast } from "@/components/ui/toast-provider";

type Option = { id: string; name: string; active?: boolean };
type ProgramOption = { id: string; name: string; organization_id?: string | null };

export function ActivityForm({ semesters, organizations, programs }: { semesters: Option[]; organizations: Option[]; programs: ProgramOption[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deadlineStatus, setDeadlineStatus] = useState<"terjadwal" | "belum_ditentukan">("terjadwal");
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
      await createActivity(formData);
      showToast("Kegiatan baru berhasil disimpan!", "success");
      setOpen(false);
      setSelectedOrgId("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan kegiatan.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  return <>
    <button id="tambah-kegiatan" type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#0f6849]/15 hover:-translate-y-0.5 hover:bg-[var(--brand-dark)]"><Plus size={18}/> Tambah kegiatan</button>
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative my-auto w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Plus size={18}/></span>
              <h2 className="font-display text-2xl font-extrabold">Tambah kegiatan</h2>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">Tugas, pengingat, atau catatan—satu ruang untuk semuanya.</p>
          </div>
          <button type="button" aria-label="Tutup" onClick={() => setOpen(false)} className="rounded-xl p-2 text-[var(--muted)] hover:bg-[#f7f8f5] hover:text-[var(--ink)]"><X size={19}/></button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-[var(--brand)] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:outline-none [&_select]:focus:border-[var(--brand)] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-[var(--brand)]">
          <input required name="judul" placeholder="Apa yang perlu dicatat?"/>
          <div className="grid grid-cols-2 gap-3"><select name="jenis_item" defaultValue="tugas"><option value="tugas">Tugas</option><option value="reminder">Reminder</option><option value="catatan">Catatan</option></select><select name="prioritas"><option value="sedang">Prioritas sedang</option><option value="tinggi">Prioritas tinggi</option><option value="rendah">Prioritas rendah</option></select></div>
          <select name="kategori"><option value="kuliah">Kuliah</option><option value="organisasi">Organisasi</option><option value="lomba">Lomba</option><option value="event">Event</option><option value="lainnya">Lainnya</option></select>
          <textarea name="deskripsi" rows={3} placeholder="Keterangan atau langkah yang perlu diingat (opsional)"/>
          <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-[var(--muted)]">Mulai (opsional)<input name="tanggal_mulai" type="date" className="mt-1"/></label><label className="block text-xs font-bold text-[var(--muted)]">Status deadline<select name="deadline_status" value={deadlineStatus} onChange={(event) => setDeadlineStatus(event.target.value as typeof deadlineStatus)} className="mt-1"><option value="terjadwal">Terjadwal</option><option value="belum_ditentukan">Belum ditentukan</option></select></label></div>
          {deadlineStatus === "terjadwal" ? <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f7f8f5] p-3"><label className="block text-xs font-bold text-[var(--muted)]">Deadline<input required name="deadline" type="date" className="mt-1 bg-white"/></label><label className="block text-xs font-bold text-[var(--muted)]">Jam (opsional)<input name="jam_deadline" type="time" className="mt-1 bg-white"/></label></div> : <div className="flex items-start gap-2 rounded-xl bg-[#fff9e6] px-3 py-3 text-xs leading-5 text-[#765800]"><CalendarClock size={16} className="mt-0.5 shrink-0"/>Item ini disimpan tanpa deadline dan akan muncul dalam daftar item yang perlu diputuskan nanti.</div>}
          <div className="rounded-2xl border border-[#b9ddc6] bg-[var(--brand-soft)]/55 p-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[var(--brand-dark)]">Konteks kegiatan</p><p className="mt-1 text-xs text-[var(--muted)]">Hubungkan aktivitas dengan semester dan organisasi agar rekapmu lebih bermakna.</p><div className="mt-3 space-y-3"><select name="semester_id" defaultValue={semesters.find((semester) => semester.active)?.id || ""}><option value="">Tanpa semester</option>{semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}</select><select name="organization_id" value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}><option value="">Tanpa organisasi</option>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select><select name="program_id" disabled={!selectedOrgId}><option value="">{selectedOrgId ? "Tanpa program kerja" : "Pilih organisasi terlebih dahulu"}</option>{availablePrograms.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></div></div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f7f8f5]">Batal</button>
            <button disabled={loading} className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan kegiatan"}</button>
          </div>
        </form>
      </div>
    </div>}
  </>;
}
