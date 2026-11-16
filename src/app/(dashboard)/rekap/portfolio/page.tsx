import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PortfolioPreview } from "@/components/recap/portfolio-preview";
import { ArrowLeft, Sparkles } from "lucide-react";

type Search = { semester_id?: string };

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const supabase = await createClient();

  const [
    { data: { user } },
    { data: semesters },
    { data: profile },
    { data: organizations },
    { data: positions },
    { data: programs },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai,is_active").order("tanggal_mulai", { ascending: false }),
    supabase.from("profiles").select("full_name,university,major,student_id,email,phone,bio,angkatan,linkedin,github").single(),
    supabase.from("organizations").select("id,nama_organisasi,tipe"),
    supabase.from("organization_positions").select("organization_id,jabatan,role_type,divisi"),
    supabase.from("programs").select("id,nama_proker,organization_id,peran,status"),
  ]);

  const targetSemesterId = filters.semester_id ?? semesters?.find((s) => s.is_active)?.id ?? semesters?.[0]?.id ?? null;
  const selectedSemester = semesters?.find((s) => s.id === targetSemesterId);

  // Ambil kegiatan portfolio
  let activityQuery = supabase
    .from("activities")
    .select("id,judul,deskripsi,kategori,jenis_item,status,prioritas,deadline,peran_portfolio,is_portfolio,tanggal_mulai,organization_id,program_id")
    .eq("is_portfolio", true)
    .eq("status", "selesai")
    .order("deadline", { ascending: false });

  if (targetSemesterId) {
    activityQuery = activityQuery.eq("semester_id", targetSemesterId);
  }

  const { data: portfolioActivities } = await activityQuery;

  const items = portfolioActivities ?? [];
  const orgMap = new Map((organizations ?? []).map((o) => [o.id, o.nama_organisasi]));
  const programMap = new Map((programs ?? []).map((p) => [p.id, p.nama_proker]));

  return (
    <div className="portfolio-page-wrapper mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/rekap"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft size={14} /> Kembali ke Rekap
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Sparkles size={18} />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">DOKUMEN RESMI</span>
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Curriculum Vitae & Rekap Portofolio</h1>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Format resume formal standar industri dan ATS-friendly dari seluruh jejak pencapaianmu.
          </p>
        </div>

        {/* Semester Selector */}
        <form className="flex items-end gap-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Lingkup Semester
            <select
              name="semester_id"
              defaultValue={targetSemesterId ?? ""}
              className="mt-1 block min-w-[200px] rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#16221a] text-slate-900 dark:text-white px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none"
            >
              <option value="">Semua Semester (Kumulatif)</option>
              {semesters?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_semester} {s.is_active ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-4 py-2 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs">
            Tampilkan
          </button>
        </form>
      </header>

      {items.length === 0 ? (
        <div className="no-print mt-12 rounded-2xl border border-dashed border-slate-200 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-10 text-center shadow-xs">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Sparkles size={28} />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">Belum Ada Kegiatan Portofolio</h2>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Kegiatan atau tugas yang sudah selesai dan ditandai bintang ⭐ portofolio akan otomatis terkompilasi ke dalam resume profesional ini.
          </p>
          <Link
            href="/kegiatan"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-5 py-2.5 text-xs font-bold transition active:scale-95 shadow-xs"
          >
            Catat & Tandai Kegiatan Portofolio
          </Link>
        </div>
      ) : (
        <PortfolioPreview
          activities={items}
          orgMap={Object.fromEntries(orgMap)}
          programMap={Object.fromEntries(programMap)}
          positions={positions ?? []}
          programs={programs ?? []}
          profile={{
            full_name: profile?.full_name ?? user?.email?.split("@")[0] ?? "Mahasiswa",
            university: profile?.university ?? "Universitas",
            major: profile?.major ?? "Program Studi",
            student_id: profile?.student_id ?? null,
            email: profile?.email ?? user?.email ?? "",
            phone: profile?.phone ?? null,
            bio: profile?.bio ?? null,
            angkatan: profile?.angkatan ?? null,
            linkedin: profile?.linkedin ?? null,
            github: profile?.github ?? null,
          }}
          semester={selectedSemester ? {
            nama: selectedSemester.nama_semester,
            mulai: selectedSemester.tanggal_mulai,
            selesai: selectedSemester.tanggal_selesai,
          } : null}
        />
      )}
    </div>
  );
}
