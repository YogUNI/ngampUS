"use client";

import { useState } from "react";
import { PencilLine, X } from "lucide-react";
import { updateActivity } from "@/app/(dashboard)/kegiatan/actions";

import { useToast } from "@/components/ui/toast-provider";

type Activity = { id: string; judul: string; deskripsi: string | null; kategori: string; jenis_item: string; prioritas: string; tanggal_mulai: string | null; deadline_status: string; deadline: string | null; jam_deadline: string | null; semester_id: string | null; organization_id: string | null; program_id: string | null };
type Option = { id: string; name: string };
type ProgramOption = { id: string; name: string; organization_id?: string | null };

export function ActivityEditForm({ activity, semesters, organizations, programs }: { activity: Activity; semesters: Option[]; organizations: Option[]; programs: ProgramOption[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deadlineStatus, setDeadlineStatus] = useState(activity.deadline_status as "terjadwal" | "belum_ditentukan");
  const [selectedOrgId, setSelectedOrgId] = useState<string>(activity.organization_id || "");
  const { showToast } = useToast();

  const availablePrograms = selectedOrgId
    ? programs.filter((p) => p.organization_id === selectedOrgId)
    : [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
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

  return <><button onClick={() => setOpen(true)} title={`Ubah ${activity.judul}`} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[#dcefe4] hover:text-[var(--brand)]"><PencilLine size={16}/></button>{open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"><div className="relative my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-[var(--brand)]">UBAH KEGIATAN</p><h2 className="font-display mt-1 text-2xl font-extrabold">Perbarui detail item</h2></div><button onClick={() => setOpen(false)} title="Tutup" className="rounded-lg p-2 hover:bg-[#f7f8f5]"><X size={18}/></button></div><form onSubmit={handleSubmit} className="mt-6 space-y-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-[var(--brand)] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5"><input type="hidden" name="id" value={activity.id}/><label className="block text-sm font-bold">Judul<input required name="judul" defaultValue={activity.judul} className="mt-1.5"/></label><div className="grid grid-cols-3 gap-3"><select name="jenis_item" defaultValue={activity.jenis_item}><option value="tugas">Tugas</option><option value="reminder">Reminder</option><option value="catatan">Catatan</option></select><select name="kategori" defaultValue={activity.kategori}><option value="kuliah">Kuliah</option><option value="organisasi">Organisasi</option><option value="lomba">Lomba</option><option value="event">Event</option><option value="lainnya">Lainnya</option></select><select name="prioritas" defaultValue={activity.prioritas}><option value="tinggi">Tinggi</option><option value="sedang">Sedang</option><option value="rendah">Rendah</option></select></div><label className="block text-sm font-bold">Deskripsi<textarea name="deskripsi" rows={3} defaultValue={activity.deskripsi || ""} className="mt-1.5"/></label><div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-[var(--muted)]">Tanggal mulai<input name="tanggal_mulai" type="date" defaultValue={activity.tanggal_mulai || ""} className="mt-1"/></label><label className="text-xs font-bold text-[var(--muted)]">Status deadline<select name="deadline_status" value={deadlineStatus} onChange={(event) => setDeadlineStatus(event.target.value as typeof deadlineStatus)} className="mt-1"><option value="terjadwal">Terjadwal</option><option value="belum_ditentukan">Belum ditentukan</option></select></label></div>{deadlineStatus === "terjadwal" && <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-[var(--muted)]">Tanggal deadline<input required name="deadline" type="date" defaultValue={activity.deadline || ""} className="mt-1"/></label><label className="text-xs font-bold text-[var(--muted)]">Jam deadline<input name="jam_deadline" type="time" defaultValue={activity.jam_deadline || ""} className="mt-1"/></label></div>}<div className="grid grid-cols-3 gap-3"><select name="semester_id" defaultValue={activity.semester_id || ""}><option value="">Tanpa semester</option>{semesters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select name="organization_id" value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}><option value="">Tanpa organisasi</option>{organizations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select name="program_id" defaultValue={activity.program_id || ""} disabled={!selectedOrgId}><option value="">{selectedOrgId ? "Tanpa proker" : "Pilih organisasi dulu"}</option>{availablePrograms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f7f8f5]">Batal</button><button disabled={loading} className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)] disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan perubahan"}</button></div></form></div></div>}</>;
}
