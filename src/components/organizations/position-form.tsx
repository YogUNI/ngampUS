"use client";

import { useState } from "react";
import { Info, PencilLine, Plus } from "lucide-react";
import { createPosition, updatePosition } from "@/app/(dashboard)/organisasi/actions";

const roleOptions = [
  ["ketua_umum", "Ketua Umum"], ["wakil_ketua_umum", "Wakil Ketua Umum"], ["sekretaris", "Sekretaris"], ["bendahara", "Bendahara"], ["kepala_departemen", "Kepala Departemen"], ["wakil_kepala_departemen", "Wakil Kepala Departemen"], ["anggota", "Anggota"], ["lainnya", "Lainnya"],
] as const;

type Position = { id: string; role_type: (typeof roleOptions)[number][0]; jabatan: string; divisi: string | null; mulai: string | null; selesai: string | null };

export function PositionForm({ organizationId, position }: { organizationId: string; position?: Position }) {
  const editing = Boolean(position);
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<(typeof roleOptions)[number][0]>(position?.role_type || "anggota");
  const needsDepartment = role === "kepala_departemen" || role === "wakil_kepala_departemen" || role === "anggota";
  const action = editing ? updatePosition : createPosition;

  const fields = <><input type="hidden" name="organization_id" value={organizationId}/>{position && <input type="hidden" name="id" value={position.id}/>}<select name="role_type" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>{roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{role === "lainnya" && <input required name="jabatan" defaultValue={position?.jabatan || ""} placeholder="Nama jabatan, mis. Koordinator Acara"/>}{needsDepartment && <label className="text-xs font-bold text-[var(--muted)]">Nama departemen<input required name="divisi" defaultValue={position?.divisi || ""} placeholder="Contoh: Departemen Humas" className="mt-1"/><span className="mt-1 flex gap-1 text-xs font-normal leading-5"><Info size={13} className="mt-0.5 shrink-0"/>Wajib diisi dan diawali huruf kapital.</span></label>}<div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-[var(--muted)]">Mulai<input name="mulai" type="date" defaultValue={position?.mulai || ""} className="mt-1"/></label><label className="text-xs font-bold text-[var(--muted)]">Selesai<input name="selesai" type="date" defaultValue={position?.selesai || ""} className="mt-1"/></label></div></>;

  if (!editing) return <form action={action} className="mt-5 grid gap-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5">{fields}<button className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#dcefe4] px-3 py-2.5 text-sm font-bold text-[var(--brand)] hover:bg-[#cbe9d4]"><Plus size={16}/> Tambah jabatan</button></form>;

  return <><button onClick={() => setOpen(true)} title={`Ubah ${position?.jabatan || "jabatan"}`} className="grid h-9 w-9 place-items-center rounded-lg text-[var(--muted)] hover:bg-[#dcefe4] hover:text-[var(--brand)]"><PencilLine size={16}/></button>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-[#17251e]/35 p-5"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-[var(--brand)]">UBAH JABATAN</p><h2 className="font-display mt-1 text-2xl font-extrabold">{position?.jabatan || "Jabatan"}</h2></div><button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-sm font-bold hover:bg-[#f7f8f5]">Tutup</button></div><form action={action} className="mt-6 grid gap-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5">{fields}<button className="w-fit rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-dark)]">Simpan jabatan</button></form></div></div>}</>;
}
