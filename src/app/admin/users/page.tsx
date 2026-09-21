import Link from "next/link";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Building2, 
  Calendar,
  GraduationCap
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminUserTableClient } from "./admin-user-table-client";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  campus?: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, campus } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, university, major, student_id, angkatan, phone, created_at, role")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,student_id.ilike.%${q}%`);
  }

  if (campus) {
    query = query.eq("university", campus);
  }

  const [{ data: users }, { data: campusesList }] = await Promise.all([
    query,
    supabase.from("profiles").select("university"),
  ]);

  // Distinct university filter options
  const uniqueCampuses = Array.from(
    new Set((campusesList || []).map((c) => c.university).filter(Boolean))
  ) as string[];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
              [DIRECTORY // STUDENT ACCOUNTS]
            </span>
            <span className="rounded-full bg-[#1b4332] px-2 py-0.5 text-[10px] font-bold text-[#c8ef70]">
              {users?.length || 0} Akun Terfilter
            </span>
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
            Direktori Mahasiswa
          </h1>
          <p className="mt-1 text-xs text-[#9dc5aa]">
            Daftar seluruh akun mahasiswa yang terdaftar di platform ngampUS beserta metadata universitas (tanpa mengakses tugas atau catatan privat).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-white/10 bg-[#0c2419] px-4 py-2 text-right">
            <span className="block font-mono text-[9px] font-bold text-[#789a84]">KAMPUS TERJANGKAU</span>
            <span className="font-display text-sm font-black text-[#c8ef70]">
              {uniqueCampuses.length} Universitas
            </span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <form className="rounded-2xl border border-[#183929] bg-[#0c2419]/80 p-3 sm:p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#789a84]" />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Cari nama mahasiswa, email, atau NIM..."
            className="w-full rounded-xl border border-white/10 bg-[#071710] py-2 pl-10 pr-4 text-xs font-bold text-white placeholder:text-[#557763] focus:border-[#c8ef70] focus:outline-none transition"
          />
        </div>

        <select
          name="campus"
          defaultValue={campus || ""}
          className="rounded-xl border border-white/10 bg-[#071710] px-3 py-2 text-xs font-bold text-[#b3d3bd] focus:border-[#c8ef70] focus:outline-none transition"
        >
          <option value="">Semua Universitas / Kampus</option>
          {uniqueCampuses.map((cName, idx) => (
            <option key={idx} value={cName} className="bg-[#0c2419] text-white">
              {cName}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-[#c8ef70] px-4 py-2 text-xs font-black text-[#103626] hover:bg-[#d9f788] transition active:scale-95 cursor-pointer shadow-xs"
        >
          Terapkan
        </button>

        {(q || campus) && (
          <Link
            href="/admin/users"
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-[#b4d8c1] hover:bg-white/15 transition"
          >
            Reset
          </Link>
        )}
      </form>

      {/* ── Users Table with Role Switcher ── */}
      <AdminUserTableClient initialUsers={users || []} />
    </div>
  );
}
