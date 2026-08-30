import Link from "next/link";
import { ArrowUpRight, Building2, BriefcaseBusiness } from "lucide-react";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";
import { createClient } from "@/lib/supabase/server";
import { OrganizationForm } from "@/components/organizations/organization-form";
import { deleteOrganization } from "./actions";

export default async function OrganizationsPage() {
  const supabase = await createClient();
  const [{ data: organizations }, { data: positions }, { data: programs }] = await Promise.all([
    supabase.from("organizations").select("*").order("created_at", { ascending: false }),
    supabase.from("organization_positions").select("organization_id,jabatan,role_type,divisi").order("created_at", { ascending: true }),
    supabase.from("programs").select("organization_id,nama_proker,peran,status").order("created_at", { ascending: false })
  ]);

  const roleLabel: Record<string, string> = { ketua_umum: "Ketua Umum", wakil_ketua_umum: "Wakil Ketua", sekretaris: "Sekretaris", bendahara: "Bendahara", kepala_departemen: "Kepala Departemen", wakil_kepala_departemen: "Wakil Kepala Dept.", anggota: "Anggota", lainnya: "Lainnya" };
  return <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-[var(--brand)]">RUANG KOLABORASI</p>
        <h1 className="font-display mt-1 text-4xl font-extrabold tracking-[-.045em]">Organisasi saya</h1>
        <p className="mt-2 text-[var(--muted)]">Simpan semua ruang tempat kamu tumbuh dan berkontribusi.</p>
      </div>
      <OrganizationForm/>
    </header>
    <section className="mt-8 grid gap-4 sm:grid-cols-2">
      {organizations?.length ? organizations.map((organization) => {
        const orgPositions = positions?.filter((item) => item.organization_id === organization.id) ?? [];
        const orgPrograms = programs?.filter((item) => item.organization_id === organization.id) ?? [];
        return <article key={organization.id} className="surface-lift flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[#b9ddc6]">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef7f2] text-[var(--brand)]">
                  <Building2 size={22}/>
                </div>
                <div>
                  <span className="rounded-md bg-[#f7f8f5] px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">{organization.tipe}</span>
                  <h2 className="font-display mt-1 text-xl font-extrabold leading-snug">{organization.nama_organisasi}</h2>
                </div>
              </div>
              <ConfirmDeleteForm action={deleteOrganization} id={organization.id} itemName={`organisasi “${organization.nama_organisasi}”`}/>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {orgPositions.length > 0 ? orgPositions.map((position, idx) => (
                <span key={idx} className="rounded-lg border border-[#b9ddc6] bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-bold text-[var(--brand-dark)]">
                  {roleLabel[position.role_type] || position.jabatan}{position.divisi ? ` · ${position.divisi}` : ""}
                </span>
              )) : <span className="text-xs text-[var(--muted)] italic">Belum ada posisi dicatat</span>}
            </div>

            <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">{organization.catatan || "Belum ada catatan untuk organisasi ini."}</p>
          </div>

          <div className="mt-5 border-t border-[var(--line)] pt-3.5">
            {orgPrograms.length > 0 ? <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                <BriefcaseBusiness size={13} className="text-[var(--brand)]"/> {orgPrograms.length} Program Kerja
              </p>
              <div className="space-y-1 pt-1">
                {orgPrograms.slice(0, 2).map((program, idx) => (
                  <p key={idx} className="truncate text-xs font-semibold text-[var(--ink)]">
                    • {program.nama_proker} <span className="font-normal text-[var(--muted)]">({program.status})</span>
                  </p>
                ))}
              </div>
            </div> : <p className="text-xs text-[var(--muted)]">Belum ada proker terdaftar</p>}

            <Link href={`/organisasi/${organization.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-dark)]">
              Kelola organisasi <ArrowUpRight size={16}/>
            </Link>
          </div>
        </article>;
      }) : <div className="col-span-full rounded-2xl border border-dashed border-[var(--line)] bg-white px-6 py-16 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#f4f0e7] text-[#8b7242]"><Building2/></div>
        <h2 className="font-display mt-4 text-xl font-extrabold">Ruang kontribusimu masih kosong</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Tambahkan organisasi, UKM, atau kepanitiaan pertamamu.</p>
      </div>}
    </section>
  </div>;
}
