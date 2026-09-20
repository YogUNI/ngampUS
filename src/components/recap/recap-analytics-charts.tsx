"use client";

import React, { useState } from "react";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Flame,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CalendarDays,
  Target,
  ChevronRight,
  Activity,
} from "lucide-react";

export interface CategoryData {
  category: string;
  label: string;
  count: number;
  color: string;
}

export interface StatusData {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface PriorityData {
  priority: string;
  label: string;
  count: number;
  color: string;
}

export interface RecentItem {
  judul: string;
  kategori: string;
  status: string;
  prioritas: string;
  deadline: string | null;
  created_at: string;
}

export function RecapAnalyticsCharts({
  categories,
  statuses,
  priorities,
  totalItems,
  completionRate,
  recentItems = [],
}: {
  categories: CategoryData[];
  statuses: StatusData[];
  priorities: PriorityData[];
  totalItems: number;
  completionRate: number;
  recentItems?: RecentItem[];
}) {
  const [chartMode, setChartMode] = useState<"bar" | "donut">("bar");
  const [activeDimension, setActiveDimension] = useState<"kategori" | "status" | "prioritas">("kategori");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Active dataset
  const currentDataset =
    activeDimension === "kategori"
      ? categories
      : activeDimension === "status"
      ? statuses
      : priorities;

  const nonZeroDataset = currentDataset.filter((item) => item.count > 0);
  const maxCount = Math.max(...currentDataset.map((d) => d.count), 1);

  // SVG Donut calculation
  const radius = 62;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius; // ~389.55
  let cumulativePercent = 0;

  // Insight calculations
  const topCategory = [...categories].sort((a, b) => b.count - a.count)[0];
  const topCategoryPercent = totalItems > 0 && topCategory ? Math.round((topCategory.count / totalItems) * 100) : 0;
  
  const highPriorityCount = priorities.find((p) => p.priority === "tinggi")?.count || 0;
  const doneCount = statuses.find((s) => s.status === "selesai")?.count || 0;
  const inProgressCount = statuses.find((s) => s.status === "on_progress")?.count || 0;

  return (
    <div className="space-y-6">
      {/* ── Visual Analytics Card ── */}
      <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7 shadow-xs">
        
        {/* Header with Dimension & Mode Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--line)]/70 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#dff3e5] text-[#0f6849]">
                <Activity size={17} strokeWidth={2.5} />
              </span>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-[.18em] text-[#0f6849]">
                  VISUAL PERFORMANCE & WORKLOAD
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-[var(--ink)]">
                  Komposisi & Distribusi Beban
                </h2>
              </div>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Pola distribusi komitmen akademik dan organisasi semester ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Dimension Pills (Kategori / Status / Prioritas) */}
            <div className="flex rounded-xl bg-[#f0f4f1] p-1 text-xs font-black">
              {(
                [
                  { id: "kategori", label: "Kategori" },
                  { id: "status", label: "Status" },
                  { id: "prioritas", label: "Prioritas" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveDimension(tab.id);
                    setHoveredIndex(null);
                  }}
                  className={`rounded-lg px-3 py-1.5 transition text-xs font-black ${
                    activeDimension === tab.id
                      ? "bg-white text-[#0f6849] shadow-xs"
                      : "text-[var(--muted)] hover:text-[#10261b]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chart Mode Switcher: Bar vs Donut */}
            <div className="flex rounded-xl border border-[var(--line)] bg-white p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartMode("bar")}
                title="Diagram Batang Komparasi"
                className={`grid h-7 w-8 place-items-center rounded-lg transition ${
                  chartMode === "bar"
                    ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <BarChart3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setChartMode("donut")}
                title="Diagram Lingkaran Donut"
                className={`grid h-7 w-8 place-items-center rounded-lg transition ${
                  chartMode === "donut"
                    ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                <PieChart size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Chart Content Area */}
        {totalItems === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#eff2eb] text-[var(--muted)]">
              <Layers size={22} />
            </div>
            <p className="mt-3 font-extrabold text-[var(--ink)] text-sm">Belum ada aktivitas di semester ini</p>
            <p className="mt-1 text-xs text-[var(--muted)] max-w-sm mx-auto">
              Tambahkan tugas, jadwal, atau proker untuk melihat visualisasi analitik produktivitasmu.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            {chartMode === "bar" ? (
              /* ── 1. MODERN COLUMN / BAR HISTOGRAM CHART ── */
              <div className="space-y-6">
                {/* Horizontal Bar Chart (Mobile & Desktop Responsive) */}
                <div className="grid gap-3 sm:gap-4">
                  {currentDataset.map((item, idx) => {
                    const pct = totalItems > 0 ? Math.round((item.count / totalItems) * 100) : 0;
                    const barWidth = maxCount > 0 ? Math.max((item.count / maxCount) * 100, 4) : 4;
                    const isHovered = hoveredIndex === idx;

                    return (
                      <div
                        key={item.label}
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`group relative rounded-2xl border p-3.5 transition-all duration-200 ${
                          isHovered
                            ? "border-[var(--line)] bg-[#fafbfa] shadow-xs"
                            : "border-transparent bg-[#f9faf8]/60 hover:border-[var(--line)]/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-xs mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full shadow-2xs ring-2 ring-white"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-extrabold text-[var(--ink)] truncate text-sm">
                              {item.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-display font-black text-sm text-[var(--ink)]">
                              {item.count} <span className="text-[10.5px] font-bold text-[var(--muted)]">item</span>
                            </span>
                            <span className="rounded-lg border border-[#e0ece2] bg-white px-2 py-0.5 text-[10.5px] font-black text-[#264b38]">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar Track */}
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#e8eee9]">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: item.count > 0 ? `${barWidth}%` : "0%",
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footnote Guide */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)]/60 pt-3 text-[11px] font-semibold text-[var(--muted)]">
                  <span>Skala persentase dihitung dari total {totalItems} kegiatan aktif.</span>
                  <span className="text-[10.5px] font-bold text-[#0f6849]">
                    Fokus Terbanyak: <strong>{topCategory?.label} ({topCategoryPercent}%)</strong>
                  </span>
                </div>
              </div>
            ) : (
              /* ── 2. DONUT + METRIC DETAIL SPLIT ── */
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
                {/* SVG Donut */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative h-48 w-48 sm:h-52 sm:w-52">
                    <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                      {/* Background Ring */}
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="#eef2ed"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                      />

                      {/* Slices */}
                      {nonZeroDataset.map((slice) => {
                        const percent = slice.count / totalItems;
                        const strokeDasharray = `${percent * circumference} ${circumference}`;
                        const strokeDashoffset = -cumulativePercent * circumference;
                        cumulativePercent += percent;

                        return (
                          <circle
                            key={slice.label}
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke={slice.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-700 ease-out hover:opacity-85"
                          />
                        );
                      })}
                    </svg>

                    {/* Center Ring Label */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="font-display text-4xl font-black text-[var(--ink)] leading-none">
                        {totalItems}
                      </span>
                      <span className="mt-1 text-[9.5px] font-black uppercase tracking-[.18em] text-[var(--muted)]">
                        TOTAL ITEM
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-[var(--muted)] text-center">
                    {activeDimension === "kategori"
                      ? "Porsi bidang aktivitas semester ini"
                      : activeDimension === "status"
                      ? `Rasio penyelesaian target: ${completionRate}%`
                      : "Porsi tingkat urgensi beban kerja"}
                  </p>
                </div>

                {/* Right: Legend Breakdown with Percentage Bars */}
                <div className="space-y-3.5">
                  {currentDataset.map((item) => {
                    const percentage = totalItems > 0 ? Math.round((item.count / totalItems) * 100) : 0;
                    return (
                      <div key={item.label} className="group rounded-xl p-1.5 transition hover:bg-[#fafbfa]">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="h-3 w-3 rounded-full shadow-2xs"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-extrabold text-[var(--ink)] text-sm">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <span className="text-[var(--ink)] font-extrabold">{item.count}</span>
                            <span className="rounded-md bg-[#f0f4f1] px-2 py-0.5 text-[var(--muted)] font-black text-[10px]">
                              {percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#eff2eb]">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3 SMART INSIGHT CARDS (Health & Workload Metrics) ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Insight 1: Tingkat Kelulusan / Selesai */}
        <div className="rounded-2xl border border-[#b9ddc6] bg-gradient-to-br from-[#f2faf4] to-[#e4f5ea] p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-[.14em] text-[#0f6849]">
              <Target size={14} /> TINGKAT SELESAI
            </span>
            <span className="rounded-full bg-[#0f6849] px-2 py-0.5 text-[10px] font-black text-white">
              {completionRate}%
            </span>
          </div>
          <p className="font-display mt-2 text-2xl sm:text-3xl font-black text-[#103626]">
            {doneCount} <span className="text-sm font-bold text-[#355b46]">/ {totalItems} Beres</span>
          </p>
          <p className="mt-1 text-xs text-[#416952] leading-relaxed">
            {completionRate >= 75
              ? "Ritme kerja luar biasa! Mayoritas target semester ini telah terpenuhi."
              : completionRate >= 40
              ? "Progres seimbang. Pertahankan momentum untuk sisa aktivitas berjalan."
              : "Masih banyak tugas berprogres. Atur prioritas agar tidak menumpuk."}
          </p>
        </div>

        {/* Insight 2: Fokus Utama */}
        <div className="rounded-2xl border border-[#d8e2da] bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-[.14em] text-[var(--muted)]">
              <Flame size={14} className="text-[#d99a20]" /> FOKUS UTAMA
            </span>
            <span className="rounded-full bg-[#fdf5e2] px-2 py-0.5 text-[10px] font-black text-[#8a5d00] border border-[#fae5a8]">
              {topCategoryPercent}% Porsi
            </span>
          </div>
          <p className="font-display mt-2 text-2xl sm:text-3xl font-black text-[var(--ink)] truncate">
            {topCategory?.label || "Belum ada"}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
            Bidang {topCategory?.label?.toLowerCase() || "-"} mendominasi aktivitas semester ini dengan {topCategory?.count || 0} total komitmen.
          </p>
        </div>

        {/* Insight 3: Beban Prioritas Tinggi */}
        <div className="rounded-2xl border border-[#d8e2da] bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-[.14em] text-[var(--muted)]">
              <ShieldCheck size={14} className="text-[#3b82c4]" /> STATUS BEBAN KERJA
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                highPriorityCount > 5
                  ? "bg-[#fff0ec] text-[#b93c21] border border-[#f5b8a9]"
                  : "bg-[#e4efff] text-[#245a9a] border border-[#c3daf9]"
              }`}
            >
              {highPriorityCount > 5 ? "Padat" : "Terkendali"}
            </span>
          </div>
          <p className="font-display mt-2 text-2xl sm:text-3xl font-black text-[var(--ink)]">
            {highPriorityCount} <span className="text-sm font-bold text-[var(--muted)]">Prioritas Tinggi</span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
            {highPriorityCount > 0
              ? `${highPriorityCount} aktivitas butuh perhatian ekstra dan tenggat waktu ketat.`
              : "Tidak ada tugas berisiko tinggi saat ini. Ritme kerja stabil."}
          </p>
        </div>
      </div>

      {/* ── RECENT HIGHLIGHT ACTIVITIES (Breakdown Ringkas) ── */}
      {recentItems.length > 0 && (
        <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--line)]/60">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f0f4f1] text-[#103626]">
                <CalendarDays size={15} />
              </span>
              <div>
                <h3 className="font-display text-base font-black text-[var(--ink)]">
                  Highlight Aktivitas Semester Ini
                </h3>
                <p className="text-[11px] text-[var(--muted)]">
                  Daftar komitmen terakhir yang dicatat dalam sistem
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[var(--muted)]">
              5 Terbaru
            </span>
          </div>

          <div className="divide-y divide-[var(--line)]/50">
            {recentItems.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 first:pt-0 last:pb-0 hover:bg-[#fafbfa] px-2 rounded-xl transition"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        item.status === "selesai"
                          ? "bg-[#0f6849]"
                          : item.status === "on_progress"
                          ? "bg-[#d99a20]"
                          : "bg-[#7b8780]"
                      }`}
                    />
                    <p className="truncate text-sm font-extrabold text-[var(--ink)]">
                      {item.judul}
                    </p>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10.5px] font-bold text-[var(--muted)]">
                    <span className="capitalize">{item.kategori}</span>
                    <span>•</span>
                    <span className="capitalize">{item.prioritas} Prioritas</span>
                    {item.deadline && (
                      <>
                        <span>•</span>
                        <span className="text-[#3a5d48]">Deadline: {item.deadline}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-black capitalize ${
                      item.status === "selesai"
                        ? "bg-[#dff3e5] text-[#0f6849]"
                        : item.status === "on_progress"
                        ? "bg-[#fff0c9] text-[#8a5d00]"
                        : "bg-[#eff2eb] text-[#5e6b63]"
                    }`}
                  >
                    {item.status === "on_progress" ? "Berjalan" : item.status === "selesai" ? "Selesai" : "Belum Mulai"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
