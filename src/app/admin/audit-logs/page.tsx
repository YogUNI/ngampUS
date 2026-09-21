import { createClient } from "@/lib/supabase/server";
import { 
  Activity, 
  ShieldAlert, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  UserCheck, 
  Megaphone, 
  Layers, 
  Database,
  Calendar
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Trail & Activity Log | ngampUS Admin",
  description: "Rekam jejak setiap aksi dan kendali sistem oleh Superadmin.",
};

type SearchParams = {
  q?: string;
  type?: string;
};

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, type } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`actor_email.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (type) {
    query = query.eq("action_type", type);
  }

  const { data: logs, error } = await query;

  const actionIcons: Record<string, any> = {
    TOGGLE_SYSTEM_SETTING: SlidersHorizontal,
    UPDATE_USER_ROLE: UserCheck,
    CREATE_ANNOUNCEMENT: Megaphone,
    TOGGLE_ANNOUNCEMENT: Layers,
    DELETE_ANNOUNCEMENT: ShieldAlert,
  };

  const actionColors: Record<string, { bg: string; text: string; border: string }> = {
    TOGGLE_SYSTEM_SETTING: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
    UPDATE_USER_ROLE: { bg: "bg-purple-500/15", text: "text-purple-300", border: "border-purple-500/30" },
    CREATE_ANNOUNCEMENT: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    TOGGLE_ANNOUNCEMENT: { bg: "bg-sky-500/15", text: "text-sky-300", border: "border-sky-500/30" },
    DELETE_ANNOUNCEMENT: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30" },
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
              [SECURITY LOGS // COMPLIANCE & AUDIT TRAIL]
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Activity className="text-[#c8ef70]" size={28} />
            <span>Audit Trail & Log Aktivitas Superadmin</span>
          </h1>
          <p className="mt-1 text-xs text-[#9dc5aa] max-w-2xl leading-relaxed">
            Riwayat transparansi setiap aksi operasional: pergantian saklar maintenance, killswitch, promosi hak akses, dan siaran pengumuman.
          </p>
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl border border-[#204c37] bg-[#0c2419] px-4 py-2 text-xs font-bold text-[#c8ef70] shadow-sm">
          <Clock size={15} />
          <span>REAL-TIME AUDIT RECORDER</span>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <form method="GET" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#638870]" size={16} />
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Cari berdasarkan email superadmin atau deskripsi aksi..."
            className="w-full rounded-2xl border border-[#1b4332] bg-[#0c2419] py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder:text-[#52775f] focus:border-[#c8ef70] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-4 flex gap-2">
          <select
            name="type"
            defaultValue={type || ""}
            className="flex-1 rounded-2xl border border-[#1b4332] bg-[#0c2419] px-3 py-2.5 text-xs font-bold text-white focus:border-[#c8ef70] focus:outline-none cursor-pointer"
          >
            <option value="">Semua Tipe Aksi</option>
            <option value="TOGGLE_SYSTEM_SETTING">Saklar Sistem (Settings)</option>
            <option value="UPDATE_USER_ROLE">Manajemen Role (Access)</option>
            <option value="CREATE_ANNOUNCEMENT">Buat Broadcast</option>
            <option value="TOGGLE_ANNOUNCEMENT">Status Broadcast</option>
            <option value="DELETE_ANNOUNCEMENT">Hapus Broadcast</option>
          </select>

          <button
            type="submit"
            className="rounded-2xl bg-[#c8ef70] px-4 py-2.5 text-xs font-black text-[#103626] hover:bg-[#d8faa1] transition active:scale-95 cursor-pointer"
          >
            Filter
          </button>
        </div>
      </form>

      {/* ── Audit Logs Stream ── */}
      <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between text-xs font-bold text-[#8ca393]">
          <span>STREAM AKTIVITAS TERBARU (100 EVENT TERAKHIR)</span>
          <span className="font-mono text-[11px] text-[#c8ef70]">{logs?.length || 0} Entri Tercatat</span>
        </div>

        {(!logs || logs.length === 0) ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-[#789a84]">
              <Database size={24} />
            </div>
            <p className="text-sm font-bold text-[#8ca393]">
              {error ? "Tabel admin_audit_logs belum dibuat di database Supabase." : "Belum ada riwayat aktivitas yang tercatat."}
            </p>
            {error && (
              <p className="text-xs text-[#5f7d69] max-w-md mx-auto">
                Silakan jalankan file SQL migrasi <code>20260922_audit_logs_and_security_hardening.sql</code> di Supabase SQL Editor.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log: any) => {
              const Icon = actionIcons[log.action_type] || Activity;
              const color = actionColors[log.action_type] || { bg: "bg-white/10", text: "text-white", border: "border-white/20" };

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-white/[0.02] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border ${color.bg} ${color.text} ${color.border}`}>
                      <Icon size={18} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-white">
                          {log.actor_email}
                        </span>
                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${color.bg} ${color.text} ${color.border}`}>
                          {log.action_type}
                        </span>
                      </div>

                      <p className="text-xs text-[#9dc5aa] leading-relaxed">
                        {log.description}
                      </p>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="pt-1">
                          <code className="text-[10px] font-mono bg-black/40 text-[#c8ef70] px-2 py-0.5 rounded border border-white/5">
                            {JSON.stringify(log.details)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right font-mono text-[11px] text-[#6e917b] flex items-center gap-1.5 sm:flex-col sm:items-end">
                    <span className="text-white/80 font-bold">
                      {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB
                    </span>
                    <span>
                      {new Date(log.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
