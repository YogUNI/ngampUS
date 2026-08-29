"use client";

import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { createActivity } from "@/app/(dashboard)/kegiatan/actions";

type Option = { id: string; name: string; active?: boolean };
type ProgramOption = { id: string; name: string };

export function ActivityForm({ semesters, organizations, programs }: { semesters: Option[]; organizations: Option[]; programs: ProgramOption[] }) {
  const [deadlineStatus, setDeadlineStatus] = useState<"terjadwal" | "belum_ditentukan">("terjadwal");

  return <form id="tambah-kegiatan" action={createActivity} className="h-fit rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
    <div className="flex items-center gap-2"><Plus className="text-[var(--brand)]" size={18}/><h2 className="font-display text-xl font-extrabold">Tambah kegiatan</h2></div>
    <p className="mt-1 text-sm text-[var(--muted)]">Tugas, pengingat, atau catatan—satu ruang untuk semuanya.</p>
    <div className="mt-5 space-y-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:focus:border-[var(--brand)] [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:outline-none [&_select]:focus:border-[var(--brand)] [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:focus:border-[var(--brand)]">
      <input required name="judul" placeholder="Apa yang perlu dicatat?"/>
      <div className="grid grid-cols-2 gap-3"><select name="jenis_item" defaultValue="tugas"><option value="tugas">Tugas</option><option value="reminder">Reminder</option><option value="catatan">Catatan</option></select><select name="prioritas"><option value="sedang">Prioritas sedang</option><option value="tinggi">Prioritas tinggi</option><option value="rendah">Prioritas rendah</option></select></div>
      <select name="kategori"><option value="kuliah">Kuliah</option><option value="organisasi">Organisasi</option><option value="lomba">Lomba</option><option value="event">Event</option><option value="lainnya">Lainnya</option></select>
      <textarea name="deskripsi" rows={3} placeholder="Keterangan atau langkah yang perlu diingat (opsional)"/>
      <div className="grid grid-cols-2 gap-3"><label className="block text-xs font-bold text-[var(--muted)]">Mulai (opsional)<input name="tanggal_mulai" type="date" className="mt-1"/></label><label className="block text-xs font-bold text-[var(--muted)]">Status deadline<select name="deadline_status" value={deadlineStatus} onChange={(event) => setDeadlineStatus(event.target.value as typeof deadlineStatus)} className="mt-1"><option value="terjadwal">Terjadwal</option><option value="belum_ditentukan">Belum ditentukan</option></select></label></div>
      {deadlineStatus === "terjadwal" ? <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f7f8f5] p-3"><label className="block text-xs font-bold text-[var(--muted)]">Deadline<input required name="deadline" type="date" className="mt-1 bg-white"/></label><label className="block text-xs font-bold text-[var(--muted)]">Jam (opsional)<input name="jam_deadline" type="time" className="mt-1 bg-white"/></label></div> : <div className="flex items-start gap-2 rounded-xl bg-[#fff9e6] px-3 py-3 text-xs leading-5 text-[#765800]"><CalendarClock size={16} className="mt-0.5 shrink-0"/>Item ini disimpan tanpa deadline dan akan muncul dalam daftar item yang perlu diputuskan nanti.</div>}
      <select name="semester_id" defaultValue={semesters.find((semester) => semester.active)?.id || ""}><option value="">Tanpa semester</option>{semesters.map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}</select>
      <select name="organization_id"><option value="">Tanpa organisasi</option>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select>
      <select name="program_id"><option value="">Tanpa program kerja</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select>
      <button className="w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]">Simpan kegiatan</button>
    </div>
  </form>;
}
