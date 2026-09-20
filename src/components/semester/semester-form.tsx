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

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          editing
            ? "inline-flex items-center gap-1 rounded-lg bg-[#f7f8f5] px-3 py-1.5 text-xs font-bold hover:bg-[#dcefe4] transition"
            : "inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[var(--brand-dark)] transition active:scale-95 shadow-2xs"
        }
      >
        {editing ? <PencilLine size={14} /> : <CalendarPlus size={15} />}
        {editing ? "Ubah" : "Tambah semester"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-3xl border border-[var(--line)] bg-white p-4 sm:p-6 shadow-2xl pb-24 sm:pb-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[var(--line)] pb-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[var(--brand)]">
                  {editing ? "UBAH SEMESTER" : "SEMESTER BARU"}
                </p>
                <h2 className="font-display mt-0.5 text-lg sm:text-2xl font-extrabold truncate">
                  {editing ? "Perbarui periode fokusmu" : "Buat periode fokusmu"}
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-1.5 text-[var(--muted)] hover:bg-[#f7f8f5] hover:text-[var(--ink)] transition shrink-0"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {semester && <input type="hidden" name="id" value={semester.id} />}
              <label className="block text-xs font-bold text-[var(--ink)]">
                Nama semester
                <input
                  required
                  name="nama_semester"
                  defaultValue={semester?.nama_semester}
                  placeholder="Contoh: Semester 5"
                  className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-xs sm:text-sm outline-none focus:border-[var(--brand)]"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-bold text-[var(--ink)]">
                  Tanggal mulai
                  <input
                    required
                    name="tanggal_mulai"
                    type="date"
                    defaultValue={semester?.tanggal_mulai}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-xs sm:text-sm outline-none focus:border-[var(--brand)]"
                  />
                </label>
                <label className="block text-xs font-bold text-[var(--ink)]">
                  Tanggal selesai
                  <input
                    required
                    name="tanggal_selesai"
                    type="date"
                    defaultValue={semester?.tanggal_selesai}
                    className="mt-1 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-xs sm:text-sm outline-none focus:border-[var(--brand)]"
                  />
                </label>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#f7f8f5] p-3 text-xs">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={semester?.is_active}
                  className="h-4 w-4 accent-[var(--brand)] shrink-0"
                />
                <div>
                  <b className="block font-bold text-[var(--ink)]">Jadikan semester aktif</b>
                  <span className="text-[11px] text-[var(--muted)]">
                    Semester aktif sebelumnya akan dinonaktifkan otomatis.
                  </span>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--muted)] hover:bg-[#f7f8f5]"
                >
                  Batal
                </button>
                <button
                  disabled={loading}
                  className="rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50"
                >
                  {loading
                    ? "Menyimpan..."
                    : editing
                    ? "Simpan perubahan"
                    : "Simpan semester"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
