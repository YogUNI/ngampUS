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
  Download, 
  Compass, 
  Zap, 
  Wifi, 
  BarChart3, 
  Layers, 
  Lock, 
  Copy, 
  Code, 
  AlertTriangle,
  CheckCircle2
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
    <div className="space-y-6">
      {/* ── Executive Header Banner ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Web Traffic & Hosting Analytics
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400">
              ngampus.site
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Pemantauan volume kunjungan, perilaku navigasi mahasiswa, sebaran perangkat, dan kesehatan edge hosting.
          </p>
        </div>

        {/* Action Controls & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Period Switcher */}
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 text-xs">
            {[
              { label: "Hari Ini", days: 1 },
              { label: "7 Hari", days: 7 },
              { label: "30 Hari", days: 30 },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => handlePeriodChange(p.days)}
                disabled={isPending}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  periodDays === p.days
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Auto Refresh */}
          <button
            onClick={() => reloadData()}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-[0.98]"
            title="Perbarui data"
          >
            <RefreshCw size={13} className={isPending ? "animate-spin text-emerald-400" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={exportToCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-[0.98]"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Realtime Ingest Status Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-900/30 px-4 py-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ingest: <strong className="text-white font-medium">Aktif</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-[11px]">
            Interval: <strong className="text-slate-300 font-medium">{autoRefreshSec}s</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-[11px] text-slate-500">
            Terakhir: {lastRefreshedAt.toLocaleTimeString("id-ID")}
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-400">
          Edge Server: <span className="text-emerald-400 font-medium">{data.serverHealth.domain}</span>
        </div>
      </div>

      {/* ── Supabase RLS SQL Helper (Only Shown if 0 Views) ── */}
      {data.periodTotals.totalViews === 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>Aktivasi Kebijakan RLS Telemetry Supabase</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Jalankan SQL policy di bawah jika kunjungan publik belum otomatis terekam ke tabel <code className="text-emerald-400">system_settings</code>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copySqlToClipboard}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition"
              >
                {copiedSql ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                <span>{copiedSql ? "Disalin!" : "Salin SQL"}</span>
              </button>
              <button
                onClick={() => setShowSqlModal(!showSqlModal)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
              >
                <Code size={13} />
                <span>{showSqlModal ? "Tutup" : "Lihat SQL"}</span>
              </button>
            </div>
          </div>

          {showSqlModal && (
            <div className="mt-3 pt-3 border-t border-amber-500/20">
              <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                {SQL_MIGRATION}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ── 4 Key Performance Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {periodDays === 1 ? "Pageviews Hari Ini" : `Pageviews (${periodDays} Hari)`}
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Eye size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {data.periodTotals.totalViews.toLocaleString("id-ID")}
            </span>
            <span className="text-xs text-slate-400 font-medium">Hits</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {periodDays === 1 ? "Total tayangan hari ini" : `Akumulasi tayangan ${periodDays} hari`}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {periodDays === 1 ? "Pengunjung Unik (UV)" : `Pengunjung Unik (${periodDays} Hari)`}
            </span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10 text-blue-400">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-emerald-400">
              {data.periodTotals.uniqueVisitors.toLocaleString("id-ID")}
            </span>
            <span className="text-xs text-slate-400 font-medium">Orang</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {periodDays === 1 ? "Visitor unik hari ini" : `Mahasiswa unik dalam ${periodDays} hari`}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Sesi Aktif (5 Menit)</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {data.today.activeLast5Min}
            </span>
            <span className="text-xs text-slate-400 font-medium">Sesi</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Browsing dalam 5 menit terakhir
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Kedalaman Navigasi</span>
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white">
              {data.periodTotals.viewsPerVisitor}
            </span>
            <span className="text-xs text-slate-400 font-medium">Pages / UV</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Rata-rata halaman dilihat per visitor
          </p>
        </div>
      </div>

      {/* ── Main Daily Traffic Curve Chart ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={18} className="text-emerald-400" />
            <div>
              <h2 className="text-base font-semibold text-white">
                Kurva Tren Kunjungan Harian ({periodDays} Hari)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Perbandingan volume total pageviews vs pengunjung unik harian di ngampus.site.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-300">Views: <strong className="text-white">{data.periodTotals.totalViews}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-700" />
              <span className="text-slate-400">UV: <strong className="text-slate-300">{data.periodTotals.uniqueVisitors}</strong></span>
            </div>
          </div>
        </div>

        {/* Visual Dual Bar Chart */}
        <div className="mt-6">
          <div className="h-52 w-full flex items-end gap-2 sm:gap-4 pt-4 pb-2 px-1 border-b border-slate-800/80">
            {data.trendData.map((item, idx) => {
              const viewHeightPct = Math.max(8, Math.round((item.views / maxTrendViews) * 100));
              const uniqueHeightPct = Math.max(5, Math.round((item.uniques / maxTrendViews) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group min-w-0">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[10px] font-mono text-center pointer-events-none whitespace-nowrap z-20 shadow-md">
                    <p className="text-emerald-400 font-semibold">{item.views} Views</p>
                    <p className="text-slate-400">{item.uniques} UV</p>
                  </div>

                  {/* Dual Bar Container */}
                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-full">
                    {/* Unique Visitors Bar */}
                    <div
                      className="w-1/2 rounded-t-md bg-slate-700 hover:bg-slate-600 transition-all"
                      style={{ height: `${uniqueHeightPct}%` }}
                    />
                    {/* Total Views Bar */}
                    <div
                      className="w-1/2 rounded-t-md bg-emerald-500 hover:bg-emerald-400 transition-all"
                      style={{ height: `${viewHeightPct}%` }}
                    />
                  </div>

                  {/* Date Label */}
                  <span className="mt-2 text-[10px] font-mono text-slate-400 group-hover:text-white truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Two-Column Grid: Top Pages & Audience Breakdown ── */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left Column: Top Visited Pages */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Halaman Terpopuler {periodDays === 1 ? "(Hari Ini)" : `(${periodDays} Hari)`}
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Top Rute
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {data.topPages.length > 0 ? (
                data.topPages.map((page, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-slate-400 text-[11px] shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-mono text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                          {page.path === "/" ? "/ (Landing Page)" : page.path}
                        </span>
                      </div>
                      <span className="font-mono text-slate-400 shrink-0">
                        <strong className="text-emerald-400 font-semibold">{page.views}</strong> ({page.percentage}%)
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(page.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 italic">
                  Belum ada rekaman pageviews dalam periode ini.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Total Rute Terlacak:</span>
            <span className="font-mono font-semibold text-white">{data.topPages.length} Halaman Unik</span>
          </div>
        </div>

        {/* Right Column: Devices & Technology Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">
                  Perangkat & Browser
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Client Tech</span>
            </div>

            {/* Device Bar Segment */}
            <div className="mt-4">
              <span className="text-xs font-medium text-slate-400 block mb-2">
                Rasio Perangkat (Mobile vs Desktop)
              </span>

              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                <div 
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${data.deviceBreakdown.mobilePct}%` }}
                  title={`Mobile: ${data.deviceBreakdown.mobilePct}%`}
                />
                <div 
                  className="bg-blue-500 transition-all"
                  style={{ width: `${data.deviceBreakdown.desktopPct}%` }}
                  title={`Desktop: ${data.deviceBreakdown.desktopPct}%`}
                />
                <div 
                  className="bg-purple-500 transition-all"
                  style={{ width: `${data.deviceBreakdown.tabletPct}%` }}
                  title={`Tablet: ${data.deviceBreakdown.tabletPct}%`}
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                    <Smartphone size={12} />
                    <span className="text-[11px] font-medium">Mobile</span>
                  </div>
                  <p className="text-sm font-bold text-white">{data.deviceBreakdown.mobilePct}%</p>
                  <span className="text-[10px] font-mono text-slate-400">{data.deviceBreakdown.mobile} hits</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-blue-400 mb-0.5">
                    <Laptop size={12} />
                    <span className="text-[11px] font-medium">Desktop</span>
                  </div>
                  <p className="text-sm font-bold text-white">{data.deviceBreakdown.desktopPct}%</p>
                  <span className="text-[10px] font-mono text-slate-400">{data.deviceBreakdown.desktop} hits</span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="flex items-center justify-center gap-1 text-purple-400 mb-0.5">
                    <Tablet size={12} />
                    <span className="text-[11px] font-medium">Tablet</span>
                  </div>
                  <p className="text-sm font-bold text-white">{data.deviceBreakdown.tabletPct}%</p>
                  <span className="text-[10px] font-mono text-slate-400">{data.deviceBreakdown.tablet} hits</span>
                </div>
              </div>
            </div>

            {/* Top Browsers */}
            <div className="mt-5 space-y-2">
              <span className="text-xs font-medium text-slate-400 block">
                Top Browser Mahasiswa
              </span>
              <div className="space-y-1">
                {data.topBrowsers.length > 0 ? (
                  data.topBrowsers.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-200">{b.name}</span>
                      <span className="font-mono text-slate-400">
                        <strong className="text-emerald-400 font-semibold">{b.count}</strong> ({b.percentage}%)
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Belum ada data browser.</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Referrers */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/80">
            <span className="text-xs font-medium text-slate-400 block mb-2">
              Sumber Trafik (Referrers)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.topReferrers.length > 0 ? (
                data.topReferrers.map((ref, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 px-2 py-1 text-xs text-slate-300"
                  >
                    <Compass size={11} className="text-emerald-400" />
                    <span>{ref.source}</span>
                    <strong className="font-mono text-white text-[11px]">({ref.count})</strong>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Trafik langsung (Direct / Sosmed).</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Server & Edge Infrastructure Telemetry ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <Server size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Spesifikasi Hosting & Infrastruktur Edge
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Status domain ngampus.site, SSL/TLS, database latency, dan routing edge.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 self-start sm:self-auto">
            <ShieldCheck size={14} />
            <span>99.98% System Uptime</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Primary Domain & SSL</span>
            <p className="text-sm font-bold text-white mt-1">{data.serverHealth.domain}</p>
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <Lock size={11} />
              <span>{data.serverHealth.sslStatus}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Database Ping (RTT)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-mono text-xl font-bold text-emerald-400">{data.serverHealth.dbPingMs}</span>
              <span className="text-xs text-slate-400 font-mono">ms</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supabase PostgreSQL (AWS ap-southeast-1)
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Framework Runtime</span>
            <p className="text-sm font-bold text-white mt-1">{data.serverHealth.framework}</p>
            <p className="text-xs text-slate-400 mt-1">
              Environment: <span className="font-mono text-slate-300 font-semibold uppercase">{data.serverHealth.nodeEnv}</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
            <span className="text-[11px] font-medium text-slate-400 block">Edge Locations</span>
            <div className="flex flex-col gap-1 mt-1.5">
              {data.serverHealth.edgeLocations.map((loc, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-200">
                  <Wifi size={11} className="text-emerald-400" />
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Real-Time Live Activity Stream ── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Activity size={16} className="text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">
                Live Traffic Feed ({data.recentVisits.length} Aktivitas)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Log stream interaksi halaman yang terjadi dari pengunjung dan mahasiswa.
              </p>
            </div>
          </div>
          <span className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-0.5 text-[10px] font-mono text-slate-400">
            Realtime
          </span>
        </div>

        <div className="mt-2 divide-y divide-slate-800/60 overflow-x-auto">
          {data.recentVisits.length > 0 ? (
            data.recentVisits.map((visit, idx) => {
              const visitTime = new Date(visit.timestamp);
              const timeFormatted = isNaN(visitTime.getTime()) 
                ? "Baru saja" 
                : visitTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/20 px-2 rounded-lg transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                      {visit.deviceType === "mobile" ? <Smartphone size={13} /> : visit.deviceType === "tablet" ? <Tablet size={13} /> : <Laptop size={13} />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-100 truncate">
                          {visit.path === "/" ? "/ (Landing Page)" : visit.path}
                        </span>
                        <span className="rounded border border-slate-800 bg-slate-800/80 px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
                          {visit.browser || "Web"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Sumber: {visit.referrer || "Direct Link"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                      <Clock size={11} className="text-slate-500" />
                      <span>{timeFormatted}</span>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              Belum ada log stream kunjungan baru. Buka halaman di browser untuk melihat feed ini terisi otomatis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
