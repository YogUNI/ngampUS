"use client";

import { useState } from "react";
import { CalendarPlus, PencilLine, X } from "lucide-react";
import { createSemester, updateSemester } from "@/app/(dashboard)/semester/actions";

import { useToast } from "@/components/ui/toast-provider";

type Semester = { id: string; nama_semester: string; tanggal_mulai: string; tanggal_selesai: string; is_active: boolean };

export function SemesterForm({ semester }: { semester?: Semester }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const editing = Boolean(semester);
  const action = editing ? updateSemester : createSemester;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
      showToast(editing ? "Semester berhasil diperbarui!" : "Semester berhasil ditambahkan!", "success");
      setOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menyimpan semester.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  return <><button onClick={() => setOpen(true)} className={editing ? "inline-flex items-center gap-1 rounded-lg bg-[#f7f8f5] px-3 py-2 text-sm font-bold hover:bg-[#dcefe4]" : "inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)]"}>{editing ? <PencilLine size={16}/> : <CalendarPlus size={17}/>} {editing ? "Ubah" : "Tambah semester"}</button>{open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"><div className="relative my-auto w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-[var(--brand)]">{editing ? "UBAH SEMESTER" : "SEMESTER BARU"}</p><h2 className="font-display mt-1 text-2xl font-extrabold">{editing ? "Perbarui periode fokusmu" : "Buat periode fokusmu"}</h2></div><button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-[#f7f8f5]" aria-label="Tutup"><X size={18}/></button></div><form onSubmit={handleSubmit} className="mt-6 space-y-4">{semester && <input type="hidden" name="id" value={semester.id}/>}<label className="block text-sm font-bold">Nama semester<input required name="nama_semester" defaultValue={semester?.nama_semester} placeholder="Contoh: Semester 5" className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--brand)]"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Tanggal mulai<input required name="tanggal_mulai" type="date" defaultValue={semester?.tanggal_mulai} className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--brand)]"/></label><label className="block text-sm font-bold">Tanggal selesai<input required name="tanggal_selesai" type="date" defaultValue={semester?.tanggal_selesai} className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--brand)]"/></label></div><label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f7f8f5] px-3 py-3 text-sm"><input name="is_active" type="checkbox" defaultChecked={semester?.is_active} className="h-4 w-4 accent-[var(--brand)]"/><span><b className="block">Jadikan semester aktif</b><span className="text-[var(--muted)]">Semester aktif sebelumnya akan dinonaktifkan.</span></span></label><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f7f8f5]">Batal</button><button disabled={loading} className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50">{loading ? "Menyimpan..." : editing ? "Simpan perubahan" : "Simpan semester"}</button></div></form></div></div>}</>;
}
