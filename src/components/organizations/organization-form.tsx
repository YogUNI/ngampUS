"use client";

import { useState } from "react";
import { Building2, Info, Plus, X } from "lucide-react";
import { createOrganization } from "@/app/(dashboard)/organisasi/actions";

const roleOptions = [
  ["ketua_umum", "Ketua Umum"],
  ["wakil_ketua_umum", "Wakil Ketua Umum"],
  ["sekretaris", "Sekretaris"],
  ["bendahara", "Bendahara"],
  ["kepala_departemen", "Kepala Departemen"],
  ["wakil_kepala_departemen", "Wakil Kepala Departemen"],
  ["anggota", "Anggota"],
  ["lainnya", "Lainnya"],
] as const;

function capitalizeFirst(value: string) {
  return value ? value.charAt(0).toLocaleUpperCase("id-ID") + value.slice(1) : value;
}

import { useToast } from "@/components/ui/toast-provider";

export function OrganizationForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<(typeof roleOptions)[number][0]>("anggota");
  const [department, setDepartment] = useState("");
  const { showToast } = useToast();
  const needsDepartment = role === "kepala_departemen" || role === "wakil_kepala_departemen" || role === "anggota";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createOrganization(formData);
      showToast("Organisasi & jabatan berhasil ditambahkan!", "success");
      setOpen(false);
      setDepartment("");
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal menambahkan organisasi.";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  return <><button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)]"><Plus size={17}/> Tambah organisasi</button>{open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"><div className="relative my-auto w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-[var(--brand)]">ORGANISASI BARU</p><h2 className="font-display mt-1 text-2xl font-extrabold">Tambahkan keterlibatanmu</h2></div><button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-[#f7f8f5]" title="Tutup"><X size={18}/></button></div><form onSubmit={handleSubmit} className="mt-6 space-y-4"><label className="block text-sm font-bold">Nama organisasi<input required name="nama_organisasi" placeholder="Contoh: BEM FASILKOM" className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--brand)]"/></label><label className="block text-sm font-bold">Tipe organisasi<select name="tipe" defaultValue="organisasi" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 outline-none focus:border-[var(--brand)]"><option value="organisasi">Organisasi</option><option value="ukm">UKM</option><option value="ukk">UKK</option><option value="kepanitiaan">Kepanitiaan</option><option value="lainnya">Lainnya</option></select></label><section className="rounded-2xl border border-[#b9ddc6] bg-[#f3faf5] p-4"><div className="flex gap-2"><Building2 size={18} className="mt-0.5 text-[var(--brand)]"/><div><h3 className="text-sm font-extrabold">Peran utama kamu</h3><p className="mt-0.5 text-xs leading-5 text-[var(--muted)]">Role ini langsung dibuat sebagai jabatan pertama pada organisasi ini.</p></div></div><label className="mt-3 block text-sm font-bold">Jabatan<select name="role_type" value={role} onChange={(event) => setRole(event.target.value as typeof role)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 outline-none focus:border-[var(--brand)]">{roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>{needsDepartment && <label className="mt-3 block text-sm font-bold">Nama departemen<input required name="divisi" value={department} onChange={(event) => setDepartment(event.target.value)} onBlur={() => setDepartment((value) => capitalizeFirst(value.trim()))} placeholder="Contoh: Departemen PSDM" className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-3 outline-none focus:border-[var(--brand)]"/><span className="mt-1.5 flex gap-1.5 text-xs font-normal leading-5 text-[var(--muted)]"><Info size={14} className="mt-0.5 shrink-0"/>Wajib diisi untuk {role === "anggota" ? "Anggota" : roleOptions.find(([value]) => value === role)?.[1]}. Awali setiap kata penting dengan huruf kapital, misalnya “Departemen Media Kreatif”.</span></label>}{role === "lainnya" && <label className="mt-3 block text-sm font-bold">Nama jabatan<input required name="jabatan_lainnya" placeholder="Contoh: Koordinator Lapangan" className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--brand)]"/></label>}</section><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Mulai (opsional)<input name="periode_mulai" type="date" className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-3"/></label><label className="block text-sm font-bold">Selesai (opsional)<input name="periode_selesai" type="date" className="mt-2 w-full rounded-xl border border-[var(--line)] px-3 py-3"/></label></div><label className="block text-sm font-bold">Catatan (opsional)<textarea name="catatan" rows={3} placeholder="Hal penting tentang keterlibatanmu" className="mt-2 w-full resize-none rounded-xl border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--brand)]"/></label><div className="flex justify-end gap-2"><button onClick={() => setOpen(false)} type="button" className="rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f7f8f5]">Batal</button><button disabled={loading} className="rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan organisasi & jabatan"}</button></div></form></div></div>}</>;
}
