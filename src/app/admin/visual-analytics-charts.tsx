"use client";

import { useMemo, useState } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Calendar 
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
    <div className="space-y-4">
      {/* ── Graphic Header with Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              Visualisasi Analitik Platform
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis kurva pertumbuhan registrasi mahasiswa dan rasio penyelesaian komitmen akademik.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950/80 p-1 text-xs">
          <button
            onClick={() => setChartTab("growth")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              chartTab === "growth"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp size={14} className={chartTab === "growth" ? "text-emerald-400" : ""} />
            <span>Tren Mahasiswa</span>
          </button>
          <button
            onClick={() => setChartTab("campuses")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
              chartTab === "campuses"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PieChartIcon size={14} className={chartTab === "campuses" ? "text-emerald-400" : ""} />
            <span>Sebaran Kampus</span>
          </button>
        </div>
      </div>

      {/* ── Main Chart Area ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Bar / Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
          {chartTab === "growth" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Registrasi Mahasiswa (6 Bulan Terakhir)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data diambil langsung dari timestamps akun tabel profiles
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] font-mono text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Live DB</span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-6 pb-2">
                <div className="flex h-44 items-end gap-2 sm:gap-4 border-b border-slate-800/80 px-2 sm:px-6">
                  {monthlyRegistration.map((m, idx) => {
                    const heightPercent = Math.max(Math.round((m.users / maxMonthly) * 100), 10);
                    const isLatest = idx === monthlyRegistration.length - 1;

                    return (
                      <div key={idx} className="group relative flex-1 flex flex-col items-center h-full justify-end">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none rounded-lg bg-slate-950 border border-slate-700 px-2 py-1 text-[10px] font-medium text-slate-200 whitespace-nowrap z-20 shadow-md">
                          {m.users} Akun
                        </div>

                        {/* Bar Body */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all duration-300 relative ${
                            isLatest
                              ? "bg-emerald-500 hover:bg-emerald-400"
                              : "bg-slate-700 hover:bg-slate-600"
                          }`}
                        >
                          <div className="absolute -top-5 inset-x-0 text-center font-mono text-[10px] font-semibold text-slate-300">
                            {m.users > 0 ? m.users : ""}
                          </div>
                        </div>

                        {/* Month Label */}
                        <span className="mt-3 font-mono text-[11px] text-slate-400 truncate">
                          {m.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                    <span>Bulan Berjalan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-slate-700" />
                    <span>Bulan Sebelumnya</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Sinkronisasi Otomatis
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Komparasi Populasi Kampus Terdaftar
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proporsi mahasiswa terdistribusi antar universitas
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {topCampuses.length > 0 ? (
                  topCampuses.map((c, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-slate-400">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-md">
                            {c.name}
                          </span>
                        </div>
                        <span className="font-mono text-slate-400">
                          <strong className="text-emerald-400 font-semibold">{c.count}</strong> ({c.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.max(c.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Belum ada kampus yang terdaftar.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Platform Activity Health Meter */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Rasio Komitmen Mahasiswa
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Status agregat tugas kuliah & program organisasi di ekosistem.
            </p>

            {/* Segmented Progress Bar */}
            <div className="mt-5 space-y-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800 flex">
                <div
                  title={`Selesai: ${selesaiPct}%`}
                  style={{ width: `${selesaiPct}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                />
                <div
                  title={`Sedang Berjalan: ${berlangsungPct}%`}
                  style={{ width: `${berlangsungPct}%` }}
                  className="bg-amber-400 h-full transition-all duration-500"
                />
                <div
                  title={`Terjadwal: ${belumMulaiPct}%`}
                  style={{ width: `${belumMulaiPct}%` }}
                  className="bg-slate-600 h-full transition-all duration-500"
                />
              </div>

              {/* Stats Legend Breakdown */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-slate-200">Selesai / Selesai</span>
                  </div>
                  <span className="font-mono font-semibold text-emerald-400">
                    {activityHealth.selesai} ({selesaiPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="font-medium text-slate-200">Sedang Dikerjakan</span>
                  </div>
                  <span className="font-mono font-semibold text-amber-400">
                    {activityHealth.berlangsung} ({berlangsungPct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="font-medium text-slate-200">Terjadwal Mendatang</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-400">
                    {activityHealth.belumMulai} ({belumMulaiPct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Total Komitmen Aktif:</span>
            <span className="font-mono font-semibold text-white">{totalActivities} Item</span>
          </div>
        </div>
      </div>
    </div>
  );
}
