"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  ShieldAlert, 
  Search, 
  SlidersHorizontal, 
  UserCheck, 
  Megaphone, 
  Layers, 
  Database,
  Download,
  Pause,
  Play,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Hash,
  Shield,
  RotateCcw
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface AuditLogItem {
  id: string;
  actor_id?: string | null;
  actor_email: string;
  action_type: string;
  description: string;
  details?: Record<string, any> | null;
  ip_address?: string | null;
  created_at: string;
}

interface AuditLogClientProps {
  initialLogs: AuditLogItem[];
  dbError?: boolean;
}

const ACTION_META: Record<string, { label: string; icon: any; bg: string; text: string; border: string }> = {
  TOGGLE_SYSTEM_SETTING: { 
    label: "Saklar Sistem",
    icon: SlidersHorizontal, 
    bg: "bg-amber-500/10", 
    text: "text-amber-400", 
    border: "border-amber-500/20" 
  },
  UPDATE_USER_ROLE: { 
    label: "Manajemen Role",
    icon: UserCheck, 
    bg: "bg-purple-500/10", 
    text: "text-purple-300", 
    border: "border-purple-500/20" 
  },
  CREATE_ANNOUNCEMENT: { 
    label: "Buat Broadcast",
    icon: Megaphone, 
    bg: "bg-emerald-500/10", 
    text: "text-emerald-400", 
    border: "border-emerald-500/20" 
  },
  TOGGLE_ANNOUNCEMENT: { 
    label: "Status Broadcast",
    icon: Layers, 
    bg: "bg-blue-500/10", 
    text: "text-blue-300", 
    border: "border-blue-500/20" 
  },
  DELETE_ANNOUNCEMENT: { 
    label: "Hapus Broadcast",
    icon: ShieldAlert, 
    bg: "bg-rose-500/10", 
    text: "text-rose-400", 
    border: "border-rose-500/20" 
  },
};

export function AuditLogClient({ initialLogs, dbError }: AuditLogClientProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "paused">("connected");
  const [recentNewIds, setRecentNewIds] = useState<Set<string>>(new Set());

  // Setup Supabase Realtime listener
  useEffect(() => {
    if (!isLiveActive) {
      setConnectionStatus("paused");
      return;
    }

    setConnectionStatus("connecting");
    const supabase = createClient();

    const channel = supabase
      .channel("realtime-admin-audit-logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_audit_logs",
        },
        (payload) => {
          const newLog = payload.new as AuditLogItem;
          if (!newLog || !newLog.id) return;

          setLogs((prev) => {
            if (prev.some((item) => item.id === newLog.id)) return prev;
            return [newLog, ...prev];
          });

          // Mark as recently added for highlight
          setRecentNewIds((prev) => {
            const next = new Set(prev);
            next.add(newLog.id);
            return next;
          });

          // Remove pulse highlight after 4 seconds
          setTimeout(() => {
            setRecentNewIds((prev) => {
              const next = new Set(prev);
              next.delete(newLog.id);
              return next;
            });
          }, 4000);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnectionStatus("paused");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLiveActive]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logs.length;
    const settingsChanges = logs.filter((l) => l.action_type === "TOGGLE_SYSTEM_SETTING").length;
    const roleEscalations = logs.filter((l) => l.action_type === "UPDATE_USER_ROLE").length;
    const broadcasts = logs.filter((l) => l.action_type.includes("ANNOUNCEMENT")).length;

    // Unique superadmins
    const actors = new Set(logs.map((l) => l.actor_email));

    return {
      total,
      settingsChanges,
      roleEscalations,
      broadcasts,
      uniqueActors: actors.size,
    };
  }, [logs]);

  // Filter logs by search query and type
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesType = selectedType === "ALL" || log.action_type === selectedType;
      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchEmail = log.actor_email?.toLowerCase().includes(q);
      const matchDesc = log.description?.toLowerCase().includes(q);
      const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);

      return matchEmail || matchDesc || matchDetails;
    });
  }, [logs, searchQuery, selectedType]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Waktu (UTC)", "Waktu (WIB)", "Superadmin", "Tipe Aksi", "Deskripsi", "Detail JSON", "IP Address"];
    const rows = filteredLogs.map((log) => {
      const date = new Date(log.created_at);
      const wibString = `${date.toLocaleDateString("id-ID")} ${date.toLocaleTimeString("id-ID")}`;
      return [
        `"${log.created_at}"`,
        `"${wibString}"`,
        `"${log.actor_email || ""}"`,
        `"${log.action_type}"`,
        `"${(log.description || "").replace(/"/g, '""')}"`,
        `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`,
        `"${log.ip_address || "-"}"`,
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ngampus_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format payload nicely
  const renderPayloadDetails = (details?: Record<string, any> | null) => {
    if (!details || Object.keys(details).length === 0) return null;

    // Check if it's a toggle switch
    if ("next_value" in details && "setting_key" in details) {
      const isTrue = details.next_value === true;
      return (
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="font-mono text-[10px] text-slate-500">Kunci:</span>
          <code className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
            {details.setting_key}
          </code>
          <ArrowRight size={11} className="text-slate-600" />
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-medium border ${
              isTrue
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {isTrue ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            <span>{isTrue ? "TRUE" : "FALSE"}</span>
          </span>
        </div>
      );
    }

    // Check if role promotion
    if ("new_role" in details) {
      return (
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="font-mono text-[10px] text-slate-500">Role:</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-medium uppercase">
            <Shield size={10} />
            <span>{details.new_role}</span>
          </span>
          {details.target_email && (
            <span className="text-[11px] text-slate-400 font-mono">
              target: <strong className="text-slate-200">{details.target_email}</strong>
            </span>
          )}
        </div>
      );
    }

    // Default JSON preview
    return (
      <div className="pt-1">
        <code className="text-[10px] font-mono bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-slate-800 inline-block">
          {JSON.stringify(details)}
        </code>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Executive Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Audit Trail & Log Aktivitas
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-mono font-medium text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${connectionStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {connectionStatus === "connected" ? "Live Realtime" : "Stream Paused"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Riwayat transparansi setiap aksi operasional: pergantian saklar maintenance, killswitch, promosi role akun, dan siaran pengumuman.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            title={isLiveActive ? "Jeda Realtime Stream" : "Lanjutkan Realtime Stream"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-[0.98]"
          >
            {isLiveActive ? <Pause size={13} /> : <Play size={13} />}
            <span className="hidden sm:inline">{isLiveActive ? "Jeda Stream" : "Mulai Stream"}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition active:scale-[0.98] disabled:opacity-50"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Entri Log</span>
            <Hash size={15} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.total}</div>
          <p className="text-xs text-slate-500 mt-0.5">Dari {stats.uniqueActors} Superadmin aktif</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Saklar Sistem</span>
            <SlidersHorizontal size={15} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.settingsChanges}</div>
          <p className="text-xs text-slate-500 mt-0.5">Maintenance & killswitch</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Manajemen Role</span>
            <UserCheck size={15} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.roleEscalations}</div>
          <p className="text-xs text-slate-500 mt-0.5">Perubahan hak akses user</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Broadcast Siaran</span>
            <Megaphone size={15} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{stats.broadcasts}</div>
          <p className="text-xs text-slate-500 mt-0.5">Buat, toggle & hapus banner</p>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan email superadmin, deskripsi, atau rincian aksi..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-14 text-xs font-medium text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none transition cursor-pointer"
          >
            <option value="ALL">Semua Tipe Aksi ({logs.length})</option>
            <option value="TOGGLE_SYSTEM_SETTING">Saklar Sistem ({stats.settingsChanges})</option>
            <option value="UPDATE_USER_ROLE">Manajemen Role ({stats.roleEscalations})</option>
            <option value="CREATE_ANNOUNCEMENT">Buat Broadcast</option>
            <option value="TOGGLE_ANNOUNCEMENT">Status Broadcast</option>
            <option value="DELETE_ANNOUNCEMENT">Hapus Broadcast</option>
          </select>
        </div>
      </div>

      {/* ── Audit Logs Stream Container ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xs">
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">
            Stream Aktivitas Audit Trail
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Menampilkan <strong className="text-white">{filteredLogs.length}</strong> dari {logs.length} entri
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-slate-400">
              <Database size={20} />
            </div>
            <p className="text-sm font-medium text-slate-400">
              {dbError
                ? "Tabel admin_audit_logs belum dibuat di database Supabase."
                : searchQuery || selectedType !== "ALL"
                ? "Tidak ada aktivitas yang sesuai dengan filter pencarian."
                : "Belum ada riwayat aktivitas yang tercatat."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 font-sans">
            {filteredLogs.map((log) => {
              const meta = ACTION_META[log.action_type] || {
                label: log.action_type,
                icon: Activity,
                bg: "bg-slate-800",
                text: "text-slate-300",
                border: "border-slate-700",
              };
              const Icon = meta.icon;
              const isNewlyAdded = recentNewIds.has(log.id);

              return (
                <div
                  key={log.id}
                  className={`p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isNewlyAdded
                      ? "bg-emerald-500/10"
                      : "hover:bg-slate-800/20"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${meta.bg} ${meta.text} ${meta.border}`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-slate-100">
                          {log.actor_email}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.2 text-[9px] font-mono font-medium uppercase border ${meta.bg} ${meta.text} ${meta.border}`}
                        >
                          {meta.label}
                        </span>
                        {isNewlyAdded && (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-mono font-semibold uppercase animate-pulse">
                            Baru
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {log.description}
                      </p>

                      {renderPayloadDetails(log.details)}
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right font-mono text-[11px] text-slate-400 flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className="text-slate-200 font-medium">
                      {new Date(log.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                    <span className="text-slate-500">
                      {new Date(log.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
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
