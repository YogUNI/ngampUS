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
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai,is_active").order("tanggal_mulai", { ascending: false }),
  ]);

  const [{ data: profile }] = await Promise.all([
    supabase.from("profiles").select("full_name,university,major,student_id,email").single(),
  ]);

  const targetSemesterId = filters.semester_id ?? semesters?.find((s) => s.is_active)?.id ?? semesters?.[0]?.id ?? null;
  const selectedSemester = semesters?.find((s) => s.id === targetSemesterId);

  // Ambil kegiatan portfolio semester ini
  let activityQuery = supabase
    .from("activities")
    .select("id,judul,deskripsi,kategori,jenis_item,status,prioritas,deadline,peran_portfolio,is_portfolio,tanggal_mulai,organization_id,program_id")
    .eq("is_portfolio", true)
    .eq("status", "selesai")
    .order("deadline", { ascending: true });

  if (targetSemesterId) {
    activityQuery = activityQuery.eq("semester_id", targetSemesterId);
  }

  const [{ data: portfolioActivities }, { data: organizations }] = await Promise.all([
    activityQuery,
    supabase.from("organizations").select("id,nama_organisasi,tipe"),
  ]);

  const items = portfolioActivities ?? [];
  const orgMap = new Map((organizations ?? []).map((o) => [o.id, o.nama_organisasi]));

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/rekap"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--brand)] transition"
          >
            <ArrowLeft size={14} /> Kembali ke Rekap
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--brand)]">PORTOFOLIO</p>
              <h1 className="font-display text-2xl font-extrabold tracking-tight">Rekap Prestasi Semester</h1>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Ringkasan pencapaian yang layak masuk CV & portofolio profesionalmu.
          </p>
        </div>

        {/* Semester Selector */}
        <form className="flex items-end gap-2">
          <label className="block text-xs font-bold text-[var(--ink)]">
            Pilih Semester
            <select
              name="semester_id"
              defaultValue={targetSemesterId ?? ""}
              className="mt-1 block min-w-[200px] rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm font-normal"
            >
              <option value="">Semua Semester</option>
              {semesters?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_semester} {s.is_active ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button className="rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--brand-dark)] transition">
            Tampilkan
          </button>
        </form>
      </header>

      {items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-[var(--line)] bg-white p-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f7f8f5] text-[var(--muted)]">
            <Sparkles size={28} />
          </div>
          <h2 className="mt-4 font-display text-xl font-extrabold">Belum Ada Portofolio</h2>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-sm mx-auto">
            Kegiatan yang sudah selesai dan ditandai ⭐ portofolio akan otomatis muncul di sini.
          </p>
          <Link
            href="/kegiatan"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-xs font-bold text-white"
          >
            Catat & Tandai Kegiatan
          </Link>
        </div>
      ) : (
        <PortfolioPreview
          activities={items}
          orgMap={Object.fromEntries(orgMap)}
          profile={{
            full_name: profile?.full_name ?? user?.email?.split("@")[0] ?? "Mahasiswa",
            university: profile?.university ?? "Universitas Mercu Buana",
            major: profile?.major ?? "Teknik Informatika",
            student_id: profile?.student_id ?? null,
            email: profile?.email ?? user?.email ?? "",
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
