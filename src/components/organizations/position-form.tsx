"use client";

import { useState } from "react";
import { Info, Plus } from "lucide-react";
import { createPosition } from "@/app/(dashboard)/organisasi/actions";

const roleOptions = [
  ["ketua_umum", "Ketua Umum"], ["wakil_ketua_umum", "Wakil Ketua Umum"], ["sekretaris", "Sekretaris"], ["bendahara", "Bendahara"], ["kepala_departemen", "Kepala Departemen"], ["anggota", "Anggota"], ["lainnya", "Lainnya"],
] as const;

export function PositionForm({ organizationId }: { organizationId: string }) {
  const [role, setRole] = useState<(typeof roleOptions)[number][0]>("anggota");
  const needsDepartment = role === "kepala_departemen" || role === "anggota";

  return <form action={createPosition} className="mt-5 grid gap-3 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-[var(--line)] [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5"><input type="hidden" name="organization_id" value={organizationId}/><select name="role_type" value={role} onChange={(event) => setRole(event.target.value as typeof role)}>{roleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{role === "lainnya" && <input required name="jabatan" placeholder="Nama jabatan, mis. Koordinator Acara"/>}{needsDepartment && <label className="text-xs font-bold text-[var(--muted)]">Nama departemen<input required name="divisi" placeholder="Contoh: Departemen Humas" className="mt-1"/><span className="mt-1 flex gap-1 text-xs font-normal leading-5"><Info size={13} className="mt-0.5 shrink-0"/>Wajib diisi dan diawali huruf kapital.</span></label>}<div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-[var(--muted)]">Mulai<input name="mulai" type="date" className="mt-1"/></label><label className="text-xs font-bold text-[var(--muted)]">Selesai<input name="selesai" type="date" className="mt-1"/></label></div><button className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#dcefe4] px-3 py-2.5 text-sm font-bold text-[var(--brand)] hover:bg-[#cbe9d4]"><Plus size={16}/> Tambah jabatan</button></form>;
}
