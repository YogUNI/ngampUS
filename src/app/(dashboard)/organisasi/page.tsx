import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Building2, BriefcaseBusiness } from "lucide-react";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";
import { createClient } from "@/lib/supabase/server";
import { OrganizationForm } from "@/components/organizations/organization-form";
import { extractOrgLogoAndNotes } from "@/lib/utils/org-logo";
import { deleteOrganization } from "./actions";

export default async function OrganizationsPage() {
  const supabase = await createClient();
  const [{ data: organizations }, { data: positions }, { data: programs }] = await Promise.all([
    supabase.from("organizations").select("*").order("created_at", { ascending: false }),
    supabase.from("organization_positions").select("organization_id,jabatan,role_type,divisi").order("created_at", { ascending: true }),
    supabase.from("programs").select("organization_id,nama_proker,peran,status").order("created_at", { ascending: false })
  ]);

  const roleLabel: Record<string, string> = { ketua_umum: "Ketua Umum", wakil_ketua_umum: "Wakil Ketua", sekretaris: "Sekretaris", bendahara: "Bendahara", kepala_departemen: "Kepala Departemen", wakil_kepala_departemen: "Wakil Kepala Dept.", anggota: "Anggota", lainnya: "Lainnya" };
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            RUANG KOLABORASI
          </span>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Organisasi Saya
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Simpan semua ruang tempat kamu tumbuh, memimpin, dan berkontribusi.
          </p>
        </div>
        <div className="shrink-0">
          <OrganizationForm />
        </div>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        {organizations?.length ? (
          organizations.map((organization) => {
            const orgPositions = positions?.filter((item) => item.organization_id === organization.id) ?? [];
            const orgPrograms = programs?.filter((item) => item.organization_id === organization.id) ?? [];
            const { logoUrl, notes } = extractOrgLogoAndNotes(organization.catatan);

            return (
              <article
                key={organization.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-5 shadow-xs transition hover:border-emerald-500/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-slate-50 dark:bg-[#16221a] text-emerald-600 dark:text-emerald-400 flex items-center justify-center p-1">
                        {logoUrl ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={logoUrl}
                              alt={organization.nama_organisasi}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <Building2 size={22} />
                        )}
                      </div>
                      <div>
                        <span className="rounded-md bg-slate-100 dark:bg-[#16221a] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-[#1c2d22]">
                          {organization.tipe}
                        </span>
                        <h2 className="font-display mt-1 text-lg sm:text-xl font-bold leading-snug text-slate-900 dark:text-white">
                          {organization.nama_organisasi}
                        </h2>
                      </div>
                    </div>
                    <ConfirmDeleteForm action={deleteOrganization} id={organization.id} itemName={`organisasi “${organization.nama_organisasi}”`} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {orgPositions.length > 0 ? (
                      orgPositions.map((position, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
                        >
                          {roleLabel[position.role_type] || position.jabatan}
                          {position.divisi ? ` · ${position.divisi}` : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">Belum ada posisi dicatat</span>
                    )}
                  </div>

                  <p className="mt-3.5 line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {notes || "Belum ada catatan untuk organisasi ini."}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 dark:border-[#1c2d22] pt-3.5">
                  {orgPrograms.length > 0 ? (
                    <div className="space-y-1">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <BriefcaseBusiness size={13} className="text-emerald-600 dark:text-emerald-400" /> {orgPrograms.length} Program Kerja
                      </p>
                      <div className="space-y-1 pt-1">
                        {orgPrograms.slice(0, 2).map((program, idx) => (
                          <p key={idx} className="truncate text-xs font-medium text-slate-900 dark:text-white">
                            • {program.nama_proker} <span className="text-slate-400 dark:text-slate-500">({program.status})</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500">Belum ada proker terdaftar</p>
                  )}

                  <Link
                    href={`/organisasi/${organization.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                  >
                    Kelola organisasi <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 dark:border-[#1c2d22] bg-white dark:bg-[#111914] px-6 py-16 text-center shadow-xs">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Building2 size={28} />
            </div>
            <h2 className="font-display mt-4 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Ruang Kontribusimu Masih Kosong
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Kelola kepengurusan BEM, himpunan mahasiswa, UKM, atau kepanitiaan event kampusmu agar portofolio kepemimpinan tercatat rapi.
            </p>
            <div className="mt-6 flex justify-center">
              <OrganizationForm />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
