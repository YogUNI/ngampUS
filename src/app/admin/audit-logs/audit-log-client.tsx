"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
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
  Download,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  Hash
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
    bg: "bg-amber-500/15", 
    text: "text-amber-400", 
    border: "border-amber-500/30" 
  },
  UPDATE_USER_ROLE: { 
    label: "Hak Akses Role",
    icon: UserCheck, 
    bg: "bg-purple-500/15", 
    text: "text-purple-300", 
    border: "border-purple-500/30" 
  },
  CREATE_ANNOUNCEMENT: { 
    label: "Buat Broadcast",
    icon: Megaphone, 
    bg: "bg-emerald-500/15", 
    text: "text-emerald-400", 
    border: "border-emerald-500/30" 
  },
  TOGGLE_ANNOUNCEMENT: { 
    label: "Status Broadcast",
    icon: Layers, 
    bg: "bg-sky-500/15", 
    text: "text-sky-300", 
    border: "border-sky-500/30" 
  },
  DELETE_ANNOUNCEMENT: { 
    label: "Hapus Broadcast",
    icon: ShieldAlert, 
    bg: "bg-rose-500/15", 
    text: "text-rose-400", 
    border: "border-rose-500/30" 
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

          // Mark as recently added for pulse glow animation
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
        <div className="flex items-center gap-2 pt-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-[#789a84]">Pengaturan:</span>
          <code className="text-[10px] font-mono bg-black/40 text-white px-2 py-0.5 rounded border border-white/5 font-bold">
            {details.setting_key}
          </code>
          <ArrowRight size={12} className="text-[#557763]" />
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
              isTrue
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-300 border-rose-500/30"
            }`}
          >
            {isTrue ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
            <span>{isTrue ? "AKTIF (TRUE)" : "NONAKTIF (FALSE)"}</span>
          </span>
        </div>
      );
    }

    // Check if role promotion
    if ("new_role" in details) {
      return (
        <div className="flex items-center gap-2 pt-1.5 flex-wrap">
          <span className="font-mono text-[10px] text-[#789a84]">Role Baru:</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 text-[10px] font-mono font-bold uppercase">
            <Shield size={11} />
            <span>{details.new_role}</span>
          </span>
          {details.target_email && (
            <span className="text-[10px] text-white/70">
              untuk <strong className="text-white">{details.target_email}</strong>
            </span>
          )}
        </div>
      );
    }

    // Default JSON preview
    return (
      <div className="pt-1.5">
        <code className="text-[10px] font-mono bg-black/40 text-[#c8ef70] px-2.5 py-1 rounded-lg border border-white/5 inline-block">
          {JSON.stringify(details)}
        </code>
      </div>
    );
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

        {/* Live Socket Status & Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <div className="flex items-center gap-2 rounded-2xl border border-[#204c37] bg-[#0c2419] px-3.5 py-2 text-xs font-bold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              {connectionStatus === "connected" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  connectionStatus === "connected"
                    ? "bg-emerald-400"
                    : connectionStatus === "connecting"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-rose-400"
                }`}
              ></span>
            </span>
            <span className="font-mono text-[11px] font-black text-white">
              {connectionStatus === "connected"
                ? "REALTIME LIVE STREAM"
                : connectionStatus === "connecting"
                ? "CONNECTING SOCKET..."
                : "STREAM PAUSED"}
            </span>
          </div>

          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            title={isLiveActive ? "Jeda Realtime Stream" : "Lanjutkan Realtime Stream"}
            className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 p-2.5 text-[#c8ef70] transition active:scale-95 cursor-pointer"
          >
            {isLiveActive ? <Pause size={15} /> : <Play size={15} />}
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            title="Download CSV Audit Trail"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#c8ef70] px-3.5 py-2 text-xs font-black text-[#103626] hover:bg-[#d9f788] transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Summary Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#1b4332] bg-[#0c2419]/80 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#789a84] mb-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider">Total Entri Log</span>
            <Hash size={16} className="text-[#c8ef70]" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <p className="text-[10px] text-[#557763] mt-0.5">Dari {stats.uniqueActors} Superadmin aktif</p>
        </div>

        <div className="rounded-2xl border border-[#1b4332] bg-[#0c2419]/80 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#789a84] mb-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider">Saklar Sistem</span>
            <SlidersHorizontal size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.settingsChanges}</div>
          <p className="text-[10px] text-[#557763] mt-0.5">Maintenance & killswitch</p>
        </div>

        <div className="rounded-2xl border border-[#1b4332] bg-[#0c2419]/80 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#789a84] mb-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider">Eskalasi Role</span>
            <UserCheck size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.roleEscalations}</div>
          <p className="text-[10px] text-[#557763] mt-0.5">Perubahan hak Superadmin</p>
        </div>

        <div className="rounded-2xl border border-[#1b4332] bg-[#0c2419]/80 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#789a84] mb-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider">Broadcast Siaran</span>
            <Megaphone size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.broadcasts}</div>
          <p className="text-[10px] text-[#557763] mt-0.5">Buat, toggle & hapus banner</p>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#638870]" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan email superadmin, deskripsi, atau rincian aksi..."
            className="w-full rounded-2xl border border-[#1b4332] bg-[#0c2419] py-2.5 pl-10 pr-4 text-xs font-bold text-white placeholder:text-[#52775f] focus:border-[#c8ef70] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7da88c] hover:text-white"
            >
              Reset
            </button>
          )}
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full rounded-2xl border border-[#1b4332] bg-[#0c2419] px-3 py-2.5 text-xs font-bold text-white focus:border-[#c8ef70] focus:outline-none cursor-pointer"
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

      {/* ── Audit Logs Live Stream Container ── */}
      <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 bg-black/20 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#8ca393]">
          <div className="flex items-center gap-2">
            <span>STREAM AKTIVITAS AUDIT TRAIL</span>
            {isLiveActive && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                Live
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-[#c8ef70]">
            Menampilkan {filteredLogs.length} dari {logs.length} entri
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-[#789a84]">
              <Database size={24} />
            </div>
            <p className="text-sm font-bold text-[#8ca393]">
              {dbError
                ? "Tabel admin_audit_logs belum dibuat di database Supabase."
                : searchQuery || selectedType !== "ALL"
                ? "Tidak ada aktivitas yang sesuai dengan filter pencarian."
                : "Belum ada riwayat aktivitas yang tercatat."}
            </p>
            {dbError && (
              <p className="text-xs text-[#5f7d69] max-w-md mx-auto">
                Silakan jalankan file SQL migrasi <code>20260922_audit_logs_and_security_hardening.sql</code> di Supabase SQL Editor.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredLogs.map((log) => {
              const meta = ACTION_META[log.action_type] || {
                label: log.action_type,
                icon: Activity,
                bg: "bg-white/10",
                text: "text-white",
                border: "border-white/20",
              };
              const Icon = meta.icon;
              const isNewlyAdded = recentNewIds.has(log.id);

              return (
                <div
                  key={log.id}
                  className={`p-4 sm:p-5 transition-all duration-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isNewlyAdded
                      ? "bg-[#c8ef70]/10 ring-1 ring-[#c8ef70]/40"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border ${meta.bg} ${meta.text} ${meta.border}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-white">
                          {log.actor_email}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${meta.bg} ${meta.text} ${meta.border}`}
                        >
                          {meta.label}
                        </span>
                        {isNewlyAdded && (
                          <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider animate-pulse">
                            BARU SAJA
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#9dc5aa] leading-relaxed">
                        {log.description}
                      </p>

                      {renderPayloadDetails(log.details)}
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right font-mono text-[11px] text-[#6e917b] flex items-center gap-1.5 sm:flex-col sm:items-end">
                    <span className="text-white/90 font-bold">
                      {new Date(log.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                    <span>
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
