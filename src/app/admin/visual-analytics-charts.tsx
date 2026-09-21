"use client";

import { useMemo, useState } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Layers, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";

type MonthlyData = {
  month: string;
  users: number;
};

type ModuleDistribution = {
  category: string;
  count: number;
  color: string;
};

interface VisualAnalyticsChartsProps {
  monthlyRegistration: MonthlyData[];
  moduleDistribution: ModuleDistribution[];
  activityHealth: {
    selesai: number;
    berlangsung: number;
    belumMulai: number;
  };
  topCampuses: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export function VisualAnalyticsCharts({
  monthlyRegistration,
  moduleDistribution,
  activityHealth,
  topCampuses,
}: VisualAnalyticsChartsProps) {
  const [chartTab, setChartTab] = useState<"growth" | "campuses">("growth");

  // Calculate max registration for scaling bars
  const maxMonthly = useMemo(() => {
    return Math.max(...monthlyRegistration.map((m) => m.users), 1);
  }, [monthlyRegistration]);

  const totalActivities =
    activityHealth.selesai + activityHealth.berlangsung + activityHealth.belumMulai;

  const selesaiPct = totalActivities ? Math.round((activityHealth.selesai / totalActivities) * 100) : 0;
  const berlangsungPct = totalActivities ? Math.round((activityHealth.berlangsung / totalActivities) * 100) : 0;
  const belumMulaiPct = totalActivities ? Math.max(0, 100 - selesaiPct - berlangsungPct) : 0;

  return (
    <div className="space-y-6">
      {/* ── Graphic Deck Header with Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#c8ef70]" />
            <h2 className="font-display text-lg sm:text-xl font-black text-white">
              Visual Telemetry & Analitik Grafik
            </h2>
          </div>
          <p className="text-xs text-[#9dc5aa] mt-0.5">
            Visualisasi tren pertumbuhan mahasiswa, distribusi kampus, dan rasio komitmen akademik.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-[#071710] p-1 text-xs">
          <button
            onClick={() => setChartTab("growth")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
              chartTab === "growth"
                ? "bg-[#c8ef70] text-[#103626] shadow-xs"
                : "text-[#8cb197] hover:text-white"
            }`}
          >
            <TrendingUp size={14} />
            <span>Tren Mahasiswa</span>
          </button>
          <button
            onClick={() => setChartTab("campuses")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition ${
              chartTab === "campuses"
                ? "bg-[#c8ef70] text-[#103626] shadow-xs"
                : "text-[#8cb197] hover:text-white"
            }`}
          >
            <PieChartIcon size={14} />
            <span>Sebaran Kampus</span>
          </button>
        </div>
      </div>

      {/* ── Main Chart Area ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Bar / Trend Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 sm:p-6 shadow-xs">
          {chartTab === "growth" ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
                    [TREND // REGISTRATION CURVE]
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Pertumbuhan Registrasi Mahasiswa (6 Bulan Terakhir)
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-[#1b4332] px-2.5 py-1 text-[11px] font-bold text-[#c8ef70]">
                  <Activity size={12} className="animate-pulse" />
                  <span>Real Time DB</span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-6 pb-2">
                <div className="flex h-44 items-end gap-2 sm:gap-4 border-b border-white/10 px-2 sm:px-6">
                  {monthlyRegistration.map((m, idx) => {
                    const heightPercent = Math.max(Math.round((m.users / maxMonthly) * 100), 8);
                    const isLatest = idx === monthlyRegistration.length - 1;

                    return (
                      <div key={idx} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none rounded-lg bg-[#071710] border border-white/20 px-2 py-1 text-[10px] font-bold text-[#c8ef70] whitespace-nowrap z-20 shadow-lg scale-90 group-hover:scale-100">
                          {m.users} Mahasiswa
                        </div>

                        {/* Bar Body */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-xl transition-all duration-500 relative ${
                            isLatest
                              ? "bg-gradient-to-t from-[#20553c] to-[#c8ef70] shadow-[0_0_15px_rgba(200,239,112,0.3)]"
                              : "bg-gradient-to-t from-[#153a27] to-[#429367] hover:to-[#65be8f]"
                          }`}
                        >
                          <div className="absolute -top-5 inset-x-0 text-center font-mono text-[10px] font-bold text-white/80">
                            {m.users > 0 ? m.users : ""}
                          </div>
                        </div>

                        {/* Month Label */}
                        <span className="mt-3 font-mono text-[10px] font-bold text-[#8cb197] truncate">
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-[#8cb197]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#c8ef70]" />
                    <span>Bulan Berjalan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#429367]" />
                    <span>Bulan Sebelumnya</span>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-[#9dc5aa]">
                  Diperbarui otomatis dari tabel profiles
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
                    [DISTRIBUTION // TOP INSTITUTIONS]
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Komparasi Populasi Kampus Terdaftar
                  </h3>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {topCampuses.length > 0 ? (
                  topCampuses.map((c, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-black text-[#c8ef70]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white truncate max-w-[200px] sm:max-w-md">
                            {c.name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-[#c8ef70]">
                          {c.count} ({c.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#123827]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#20553c] to-[#c8ef70] transition-all duration-700"
                          style={{ width: `${Math.max(c.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#789a84] py-8 text-center">
                    Belum ada kampus yang terdaftar.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Platform Activity Health Meter */}
        <div className="rounded-3xl border border-[#183929] bg-[#0c2419]/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
              [ENGAGEMENT // ACADEMIC HEALTH]
            </span>
            <h3 className="text-base font-black text-white mt-0.5">
              Rasio Komitmen Mahasiswa
            </h3>
            <p className="text-xs text-[#9dc5aa] mt-1">
              Status agregat dari seluruh tugas kuliah & program organisasi di ekosistem.
            </p>

            {/* Circular / Segmented Progress Bar */}
            <div className="mt-6 space-y-4">
              <div className="h-4 w-full overflow-hidden rounded-full bg-[#071710] border border-white/10 flex">
                <div
                  title={`Selesai: ${selesaiPct}%`}
                  style={{ width: `${selesaiPct}%` }}
                  className="bg-emerald-400 h-full transition-all duration-500"
                />
                <div
                  title={`Sedang Berjalan: ${berlangsungPct}%`}
                  style={{ width: `${berlangsungPct}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                />
                <div
                  title={`Terjadwal: ${belumMulaiPct}%`}
                  style={{ width: `${belumMulaiPct}%` }}
                  className="bg-[#24583e] h-full transition-all duration-500"
                />
              </div>

              {/* Stats Legend */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs rounded-xl bg-[#071710]/60 p-2.5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">Tugas & Komitmen Selesai</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">
                    {activityHealth.selesai} ({selesaiPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs rounded-xl bg-[#071710]/60 p-2.5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="font-bold text-white">Sedang Dikerjakan</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {activityHealth.berlangsung} ({berlangsungPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs rounded-xl bg-[#071710]/60 p-2.5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#429367]" />
                    <span className="font-bold text-white">Terjadwal Mendatang</span>
                  </div>
                  <span className="font-mono font-bold text-[#b4d8c1]">
                    {activityHealth.belumMulai} ({belumMulaiPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#9dc5aa]">
            <span>Total Komitmen Aktif:</span>
            <span className="font-mono font-bold text-white">{totalActivities} Item</span>
          </div>
        </div>
      </div>
    </div>
  );
}
