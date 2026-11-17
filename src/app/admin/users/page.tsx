import Link from "next/link";
import { 
  Users, 
  Search, 
  GraduationCap, 
  Building2, 
  RotateCcw
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminUserTableClient } from "./admin-user-table-client";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  campus?: string;
  page?: string;
};

const PAGE_SIZE = 20;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, campus, page } = await searchParams;
  const pageNumber = Math.max(1, parseInt(page || "1", 10) || 1);
  const from = (pageNumber - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, university, major, student_id, angkatan, phone, created_at, role", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,student_id.ilike.%${q}%`);
  }

  if (campus) {
    query = query.eq("university", campus);
  }

  // Server-side pagination range
  query = query.range(from, to);

  const [{ data: users, count }, { data: campusesList }] = await Promise.all([
    query,
    supabase
      .from("profiles")
      .select("university")
      .not("university", "is", null)
      .limit(300),
  ]);

  const totalCount = count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Distinct university filter options
  const uniqueCampuses = Array.from(
    new Set((campusesList || []).map((c) => c.university).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6">
      {/* ── Executive Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Direktori Mahasiswa
            </h1>
            <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-300">
              {totalCount} Akun
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Daftar seluruh akun mahasiswa dan metadata akademik tanpa mengakses berkas tugas privat mahasiswa.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-right">
            <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Jangkauan Kampus
            </span>
            <span className="font-mono text-sm font-bold text-emerald-400">
              {uniqueCampuses.length} Universitas
            </span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <form className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Cari nama mahasiswa, email, atau NIM..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-4 text-xs font-medium text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
          />
        </div>

        <select
          name="campus"
          defaultValue={campus || ""}
          className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none transition max-w-[240px]"
        >
          <option value="">Semua Perguruan Tinggi</option>
          {uniqueCampuses.map((cName, idx) => (
            <option key={idx} value={cName} className="bg-slate-900 text-white">
              {cName}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition active:scale-[0.98] cursor-pointer"
        >
          Terapkan
        </button>

        {(q || campus) && (
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </Link>
        )}
      </form>

      {/* ── Users Table with Role Management & Pagination ── */}
      <AdminUserTableClient 
        initialUsers={users || []} 
        pagination={{
          currentPage: pageNumber,
          totalPages,
          totalCount,
          pageSize: PAGE_SIZE,
          q,
          campus,
        }}
      />
    </div>
  );
}
