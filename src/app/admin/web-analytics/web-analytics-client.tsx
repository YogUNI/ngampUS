"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { 
  Globe, 
  Activity, 
  Users, 
  Eye, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Server, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  ArrowUpRight, 
  Download, 
  Compass, 
  Zap, 
  Wifi, 
  BarChart3, 
  Layers, 
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  Lock,
  Cpu,
  Copy,
  Code,
  AlertTriangle
} from "lucide-react";
import { type WebAnalyticsSummary, type TrafficEvent } from "@/lib/web-telemetry";
import { fetchFreshWebAnalytics } from "../actions";

interface WebAnalyticsClientProps {
  initialAnalytics: WebAnalyticsSummary;
}

export function WebAnalyticsClient({ initialAnalytics }: WebAnalyticsClientProps) {
  const [data, setData] = useState<WebAnalyticsSummary>(initialAnalytics);
  const [periodDays, setPeriodDays] = useState<number>(7);
  const [isPending, startTransition] = useTransition();
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(10);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"pages" | "devices" | "sources">("pages");
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const SQL_MIGRATION = `-- Berikan izin kepada pengunjung publik untuk mencatat traffic
drop policy if exists "Allow anonymous traffic telemetry insert and update" on public.system_settings;
create policy "Allow anonymous traffic telemetry insert and update"
  on public.system_settings
  for all
  using (key like 'web_traffic%')
  with check (key like 'web_traffic%');
alter table public.system_settings replica identity full;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Load fresh data on demand or on period change
  const reloadData = (days: number = periodDays) => {
    startTransition(async () => {
      try {
        const fresh = await fetchFreshWebAnalytics(days);
        if (fresh) {
          setData(fresh);
          setLastRefreshedAt(new Date());
        }
      } catch (err) {
        console.warn("Failed to refresh analytics:", err);
      }
    });
  };

  const handlePeriodChange = (days: number) => {
    setPeriodDays(days);
    reloadData(days);
  };

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshSec <= 0) return;
    const interval = setInterval(() => {
      reloadData(periodDays);
    }, autoRefreshSec * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshSec, periodDays]);

  // Max views in trend for scaling
  const maxTrendViews = useMemo(() => {
    const views = data.trendData.map((d) => d.views);
    return Math.max(...views, 1);
  }, [data.trendData]);

  // Export CSV
  const exportToCsv = () => {
    const headers = ["Tanggal", "Total Pageviews", "Pengunjung Unik (UV)"];
    const rows = data.trendData.map((d) => [d.date, d.views, d.uniques]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ngampus-site-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-7 selection:bg-[#c8ef70] selection:text-[#103626]">
      {/* ── Top Header Banner ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-gradient-to-r from-[#0c2419] via-[#0f2d20] to-[#071710] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle Cyber Grid Texture */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(90deg, #c8ef70 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#c8ef70]">
                [EDGE TELEMETRY // WEB HOSTING & TRAFFIC RADAR]
              </span>
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-ping" />
            </div>
            <h1 className="font-display mt-2 text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Web Traffic & Hosting Analytics
              <span className="text-xs font-mono font-bold bg-[#c8ef70]/20 text-[#c8ef70] border border-[#c8ef70]/30 px-2.5 py-0.5 rounded-full">
                ngampus.site
              </span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#b3d3bd] max-w-2xl leading-relaxed">
              Pemantauan real-time volume kunjungan, perilaku mahasiswa, sebaran perangkat, rute terpopuler, dan status hosting infrastruktur.
            </p>
          </div>

          {/* Action Deck & Time Filter */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Period Switcher */}
            <div className="inline-flex rounded-2xl border border-white/10 bg-[#071710] p-1 text-xs">
              {[
                { label: "Hari Ini", days: 1 },
                { label: "7 Hari", days: 7 },
                { label: "30 Hari", days: 30 },
              ].map((p) => (
                <button
                  key={p.days}
                  onClick={() => handlePeriodChange(p.days)}
                  disabled={isPending}
                  className={`rounded-xl px-3 py-1.5 font-bold transition ${
                    periodDays === p.days
                      ? "bg-[#c8ef70] text-[#103626] shadow-xs"
                      : "text-[#8cb197] hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => reloadData()}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[#1b4332] bg-[#0c2419] px-3.5 py-2 text-xs font-bold text-[#c8ef70] hover:bg-[#153f2c] transition active:scale-95"
              title="Perbarui data sekarang"
            >
              <RefreshCw size={13} className={isPending ? "animate-spin text-[#c8ef70]" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={exportToCsv}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#1b4332] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#235841] transition active:scale-95"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Realtime Status Sub-strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#9dc5aa]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live Ingest: <strong className="text-white">Active</strong>
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="font-mono text-[11px]">
              Auto-Polling: <strong className="text-[#c8ef70]">{autoRefreshSec}s</strong>
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span className="font-mono text-[11px] text-[#789a84]">
              Last Update: {lastRefreshedAt.toLocaleTimeString("id-ID")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#c8ef70]">Edge Server: {data.serverHealth.domain}</span>
          </div>
        </div>
      </div>

      {/* ── Supabase RLS One-Click SQL Setup Helper Banner ── */}
      {data.periodTotals.totalViews === 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-[#1b2b1d] to-[#071710] p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Aktivasi Izin Rekam Traffic di Database Supabase</span>
                  <span className="rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[9px] font-mono font-bold uppercase">
                    PENTING
                  </span>
                </h3>
                <p className="text-xs text-[#b8d6c2] mt-1 max-w-2xl leading-relaxed">
                  Agar setiap orang yang membuka link <code className="text-[#c8ef70] font-bold">ngampus.site</code> dari WhatsApp/Instagram langsung tercatat tanpa error Row-Level Security (RLS), jalankan 1 perintah SQL singkat ini di Supabase SQL Editor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto">
              <button
                onClick={copySqlToClipboard}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#c8ef70] px-4 py-2.5 text-xs font-black text-[#103626] hover:bg-[#d9f788] transition shadow-xs active:scale-95 cursor-pointer"
              >
                {copiedSql ? <CheckCircle2 size={14} className="text-[#103626]" /> : <Copy size={14} />}
                <span>{copiedSql ? "SQL Disalin! ✓" : "Salin SQL"}</span>
              </button>
              <button
                onClick={() => setShowSqlModal(!showSqlModal)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2.5 text-xs font-bold text-white transition cursor-pointer"
              >
                <Code size={14} />
                <span>{showSqlModal ? "Tutup" : "Lihat SQL"}</span>
              </button>
            </div>
          </div>

          {/* Expandable SQL Code Box */}
          {showSqlModal && (
            <div className="mt-4 pt-4 border-t border-amber-500/20 animate-in fade-in duration-200">
              <p className="text-[11px] font-mono text-[#9dc5aa] mb-2">
                Buka <strong>Supabase Dashboard</strong> &gt; <strong>SQL Editor</strong> &gt; <strong>New Query</strong>, paste script di bawah ini lalu klik <strong>Run</strong>:
              </p>
              <div className="relative">
                <pre className="rounded-2xl border border-white/10 bg-[#071710] p-4 text-[11px] font-mono text-[#c8ef70] overflow-x-auto leading-relaxed">
                  {SQL_MIGRATION}
                </pre>
                <button
                  onClick={copySqlToClipboard}
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white transition cursor-pointer"
                >
                  <Copy size={11} />
                  <span>{copiedSql ? "Disalin!" : "Salin"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 4 Key Hosting & Traffic Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pageviews (Filter Dynamic) */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Eye size={20} />
            </span>
            <span className="font-mono text-[10px] text-[#789a84] font-bold uppercase">
              {periodDays === 1 ? "HARI INI (PAGEVIEWS)" : `PAGEVIEWS (${periodDays} HARI)`}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-white">
              {data.periodTotals.totalViews.toLocaleString("id-ID")}
            </p>
            <span className="text-xs text-[#9dc5aa]">Hits</span>
          </div>
          <p className="text-xs text-[#789a84] font-medium mt-1">
            {periodDays === 1 
              ? "Total pembukaan halaman website hari ini" 
              : `Total akumulasi pembukaan halaman dalam ${periodDays} hari terakhir`}
          </p>
        </div>

        {/* Card 2: Unique Visitors (Filter Dynamic) */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Users size={20} />
            </span>
            <span className="font-mono text-[10px] text-[#789a84] font-bold uppercase">
              {periodDays === 1 ? "PENGUNJUNG UNIK (UV)" : `PENGUNJUNG UNIK (${periodDays} HARI)`}
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-[#c8ef70]">
              {data.periodTotals.uniqueVisitors.toLocaleString("id-ID")}
            </p>
            <span className="text-xs text-[#9dc5aa]">Orang</span>
          </div>
          <p className="text-xs text-[#789a84] font-medium mt-1">
            {periodDays === 1
              ? "Browser / user unik berbeda yang masuk hari ini"
              : `Total mahasiswa unik berbeda dalam ${periodDays} hari terakhir`}
          </p>
        </div>

        {/* Card 3: Active Now (5 min) */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Activity size={20} className="animate-pulse" />
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 font-mono text-[9px] font-black text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE REAL-TIME
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-white">{data.today.activeLast5Min}</p>
            <span className="text-xs text-[#9dc5aa]">Sesi Aktif</span>
          </div>
          <p className="text-xs text-[#789a84] font-medium mt-1">
            Aktivitas browsing dalam 5 menit terakhir
          </p>
        </div>

        {/* Card 4: Views / Visitor Ratio */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1b4332] text-[#c8ef70]">
              <Layers size={20} />
            </span>
            <span className="font-mono text-[10px] text-[#789a84] font-bold uppercase">ENGAGEMENT RATIO</span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-white">{data.periodTotals.viewsPerVisitor}</p>
            <span className="text-xs text-[#9dc5aa]">Pages / Visitor</span>
          </div>
          <p className="text-xs text-[#789a84] font-medium mt-1">
            Rata-rata kedalaman navigasi ({periodDays === 1 ? "hari ini" : `${periodDays} hari`})
          </p>
        </div>
      </div>

      {/* ── Main Chart Section: Traffic Dynamics (Daily Curve) ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-[#0c2419]/90 p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8ef70]/10 text-[#c8ef70] border border-[#c8ef70]/20">
              <BarChart3 size={18} />
            </span>
            <div>
              <h2 className="font-display text-base sm:text-lg font-black text-white">
                Kurva Tren Kunjungan Harian ({periodDays} Hari Terakhir)
              </h2>
              <p className="text-xs text-[#9dc5aa]">
                Perbandingan volume total pageviews vs pengunjung unik harian di ngampus.site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-[#c8ef70]" />
              <span className="text-white">Pageviews: {data.periodTotals.totalViews}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-md bg-[#165a39]" />
              <span className="text-[#9dc5aa]">Pengunjung: {data.periodTotals.uniqueVisitors}</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="mt-6">
          <div className="h-56 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-1">
            {data.trendData.map((item, idx) => {
              const viewHeightPct = Math.max(8, Math.round((item.views / maxTrendViews) * 100));
              const uniqueHeightPct = Math.max(5, Math.round((item.uniques / maxTrendViews) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group min-w-0">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 rounded-lg bg-[#071710] border border-white/10 text-[10px] font-mono text-center pointer-events-none whitespace-nowrap z-20 shadow-md">
                    <p className="text-[#c8ef70] font-bold">{item.views} Views</p>
                    <p className="text-white/70">{item.uniques} UV</p>
                  </div>

                  {/* Dual Bar Container */}
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-full">
                    {/* Unique Visitors Bar */}
                    <div
                      className="w-1/2 rounded-t-md bg-[#1e583b] transition-all group-hover:brightness-125"
                      style={{ height: `${uniqueHeightPct}%` }}
                    />
                    {/* Total Views Bar */}
                    <div
                      className="w-1/2 rounded-t-md bg-gradient-to-t from-[#86b539] to-[#c8ef70] transition-all group-hover:brightness-110 shadow-sm"
                      style={{ height: `${viewHeightPct}%` }}
                    />
                  </div>

                  {/* Date Label */}
                  <span className="mt-2 text-[10px] sm:text-xs font-mono text-[#789a84] group-hover:text-white truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Middle Grid: Top Pages Leaderboard & Audience/Device Breakdown ── */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        
        {/* Left Column: Top Visited Pages */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-[#c8ef70]" />
                <h3 className="font-display text-base font-black text-white">
                  Top Pages {periodDays === 1 ? "(Hari Ini)" : `(${periodDays} Hari Terakhir)`}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#789a84] uppercase font-bold">
                {periodDays === 1 ? "HARI INI" : `${periodDays}D LEADERBOARD`}
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {data.topPages.length > 0 ? (
                data.topPages.map((page, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="grid h-5 w-5 place-items-center rounded bg-[#1b4332] text-[10px] font-mono font-black text-[#c8ef70] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                          {page.path === "/" ? "/ (Landing Page Beranda)" : page.path}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[#c8ef70] shrink-0">
                        {page.views} hits ({page.percentage}%)
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#1b4332]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1e583b] to-[#c8ef70]"
                        style={{ width: `${Math.max(page.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#789a84] italic">
                  Belum ada rekaman pageviews dalam periode ini. Kunjungi halaman website untuk mulai melacak.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#9dc5aa]">
            <span>Total Rute Terlacak:</span>
            <span className="font-black text-white">{data.topPages.length} Halaman Unik</span>
          </div>
        </div>

        {/* Right Column: Device & Technology Breakdown */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-[#c8ef70]" />
                <h3 className="font-display text-base font-black text-white">
                  Perangkat & Browser {periodDays === 1 ? "(Hari Ini)" : `(${periodDays} Hari)`}
                </h3>
              </div>
              <span className="font-mono text-[10px] text-[#789a84] uppercase font-bold">CLIENT TECH</span>
            </div>

            {/* Device Bar Segment */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-[#9dc5aa] uppercase tracking-wider block mb-2 font-mono">
                Rasio Perangkat (Mobile vs Desktop)
              </span>

              <div className="h-3 w-full rounded-full bg-[#1b4332] overflow-hidden flex">
                <div 
                  className="bg-[#c8ef70] transition-all"
                  style={{ width: `${data.deviceBreakdown.mobilePct}%` }}
                  title={`Mobile: ${data.deviceBreakdown.mobilePct}%`}
                />
                <div 
                  className="bg-[#3b82f6] transition-all"
                  style={{ width: `${data.deviceBreakdown.desktopPct}%` }}
                  title={`Desktop: ${data.deviceBreakdown.desktopPct}%`}
                />
                <div 
                  className="bg-[#a855f7] transition-all"
                  style={{ width: `${data.deviceBreakdown.tabletPct}%` }}
                  title={`Tablet: ${data.deviceBreakdown.tabletPct}%`}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-white/5 bg-[#071710] p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[#c8ef70] mb-0.5">
                    <Smartphone size={13} />
                    <span className="text-[11px] font-bold">Mobile</span>
                  </div>
                  <p className="text-sm font-black text-white">{data.deviceBreakdown.mobilePct}%</p>
                  <span className="text-[10px] font-mono text-[#789a84]">{data.deviceBreakdown.mobile} hits</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#071710] p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[#60a5fa] mb-0.5">
                    <Laptop size={13} />
                    <span className="text-[11px] font-bold">Desktop</span>
                  </div>
                  <p className="text-sm font-black text-white">{data.deviceBreakdown.desktopPct}%</p>
                  <span className="text-[10px] font-mono text-[#789a84]">{data.deviceBreakdown.desktop} hits</span>
                </div>

                <div className="rounded-xl border border-white/5 bg-[#071710] p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[#c084fc] mb-0.5">
                    <Tablet size={13} />
                    <span className="text-[11px] font-bold">Tablet</span>
                  </div>
                  <p className="text-sm font-black text-white">{data.deviceBreakdown.tabletPct}%</p>
                  <span className="text-[10px] font-mono text-[#789a84]">{data.deviceBreakdown.tablet} hits</span>
                </div>
              </div>
            </div>

            {/* Top Browsers & Referrers List */}
            <div className="mt-5 space-y-3">
              <span className="text-[11px] font-bold text-[#9dc5aa] uppercase tracking-wider block font-mono">
                Top Browser Mahasiswa
              </span>
              <div className="space-y-1.5">
                {data.topBrowsers.length > 0 ? (
                  data.topBrowsers.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                      <span className="text-white font-medium">{b.name}</span>
                      <span className="font-mono text-[#c8ef70] font-bold">{b.count} ({b.percentage}%)</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#789a84] italic">Belum ada data browser.</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Referrers */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <span className="text-[11px] font-bold text-[#9dc5aa] uppercase tracking-wider block font-mono mb-2">
              Sumber Trafik (Traffic Referrers)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.topReferrers.length > 0 ? (
                data.topReferrers.map((ref, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#071710] px-2.5 py-1 text-xs text-[#d6f792]"
                  >
                    <Compass size={11} className="text-[#c8ef70]" />
                    <span>{ref.source}</span>
                    <strong className="text-white font-mono ml-0.5">({ref.count})</strong>
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#789a84] italic">Trafik langsung (Direct / Sosmed).</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Server & Web Hosting Telemetry Deck (cPanel / Cloudflare Style) ── */}
      <div className="rounded-3xl border border-[#1b4332] bg-gradient-to-r from-[#0c2419] via-[#0e2a1d] to-[#081810] p-5 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c8ef70]/10 border border-[#c8ef70]/30 text-[#c8ef70]">
              <Server size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-[#c8ef70]">
                  [HOSTING & EDGE INFRASTRUCTURE HEALTH]
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-ping" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-black text-white mt-0.5">
                Spesifikasi Hosting & Server Platform
              </h3>
              <p className="text-xs text-[#9dc5aa]">
                Status operasional domain utama ngampus.site, SSL/TLS, database latency, dan lokasi edge routing.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 self-start sm:self-auto">
            <ShieldCheck size={14} />
            <span>99.98% System Uptime</span>
          </span>
        </div>

        {/* 4 Cards: Domain SSL, Edge Latency, Next.js Engine, Database Pool */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Domain & SSL */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              PRIMARY DOMAIN & SSL
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-base font-black text-white">{data.serverHealth.domain}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#c8ef70] font-mono">
              <Lock size={12} />
              <span>{data.serverHealth.sslStatus}</span>
            </div>
          </div>

          {/* Database Ping */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              DATABASE LATENCY (PING)
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-black text-[#c8ef70]">{data.serverHealth.dbPingMs} ms</span>
              <span className="font-mono text-[10px] text-[#789a84]">Round-Trip</span>
            </div>
            <p className="text-[11px] text-[#9dc5aa] mt-1 font-mono">
              Supabase PostgreSQL (AWS ap-southeast-1)
            </p>
          </div>

          {/* Framework Engine */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              WEB FRAMEWORK RUNTIME
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-base font-black text-white">{data.serverHealth.framework}</span>
            </div>
            <p className="text-[11px] text-[#9dc5aa] mt-1">
              Mode: <strong className="text-white uppercase font-mono">{data.serverHealth.nodeEnv}</strong> (Serverless Edge)
            </p>
          </div>

          {/* Edge Gateways */}
          <div className="rounded-2xl border border-white/5 bg-[#071710]/80 p-4">
            <span className="font-mono text-[9px] font-black text-[#789a84] uppercase tracking-wider block">
              EDGE CDN LOCATIONS
            </span>
            <div className="flex flex-col gap-1 mt-1.5">
              {data.serverHealth.edgeLocations.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-white">
                  <Wifi size={11} className="text-[#c8ef70]" />
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Real-Time Live Activity Stream ── */}
      <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 sm:p-7 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity size={18} />
            </span>
            <div>
              <h3 className="font-display text-base font-black text-white">
                Live Traffic Feed {periodDays === 1 ? "(Hari Ini)" : `(${periodDays} Hari Terakhir)`} • {data.recentVisits.length} Aktivitas
              </h3>
              <p className="text-xs text-[#9dc5aa]">
                Log interaksi halaman yang terjadi {periodDays === 1 ? "hari ini" : `dalam rentang ${periodDays} hari terakhir`} dari pengunjung dan mahasiswa.
              </p>
            </div>
          </div>
          <span className="tag-mono text-[10px] text-[#789a84]">STREAM LOGS</span>
        </div>

        <div className="mt-4 divide-y divide-white/10 overflow-x-auto">
          {data.recentVisits.length > 0 ? (
            data.recentVisits.map((visit, idx) => {
              const visitTime = new Date(visit.timestamp);
              const timeFormatted = isNaN(visitTime.getTime()) 
                ? "Baru saja" 
                : visitTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#071710] border border-white/10 text-[11px] font-mono text-[#c8ef70] shrink-0">
                      {visit.deviceType === "mobile" ? <Smartphone size={13} /> : visit.deviceType === "tablet" ? <Tablet size={13} /> : <Laptop size={13} />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white truncate">
                          {visit.path === "/" ? "/ (Landing Page)" : visit.path}
                        </span>
                        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-[#9dc5aa]">
                          {visit.browser || "Web"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#789a84] truncate">
                        Sumber: {visit.referrer || "Direct Link"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1b4332] bg-[#071710] px-2.5 py-1 font-mono text-[11px] text-[#c8ef70]">
                      <Clock size={12} className="text-[#8cb197]" />
                      <span>{timeFormatted}</span>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[#789a84] italic py-6 text-center">
              Belum ada log stream kunjungan baru. Buka tab baru di browser Anda untuk melihat feed ini terisi otomatis!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
