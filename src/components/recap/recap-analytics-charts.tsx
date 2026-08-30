"use client";

import React, { useState } from "react";
import { PieChart, BarChart2, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";

interface CategoryData {
  category: string;
  label: string;
  count: number;
  color: string;
}

interface StatusData {
  status: string;
  label: string;
  count: number;
  color: string;
}

interface PriorityData {
  priority: string;
  label: string;
  count: number;
  color: string;
}

export function RecapAnalyticsCharts({
  categories,
  statuses,
  priorities,
  totalItems,
  completionRate,
}: {
  categories: CategoryData[];
  statuses: StatusData[];
  priorities: PriorityData[];
  totalItems: number;
  completionRate: number;
}) {
  const [activeTab, setActiveTab] = useState<"kategori" | "status" | "prioritas">("kategori");

  // Calculate SVG Pie/Donut Chart slices
  let cumulativePercent = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12

  const currentDataset =
    activeTab === "kategori"
      ? categories.filter((c) => c.count > 0)
      : activeTab === "status"
      ? statuses.filter((s) => s.count > 0)
      : priorities.filter((p) => p.count > 0);

  return (
    <div className="surface-lift rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-sm">
      {/* Header & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#dff3e5] text-[#0f6849]">
              <TrendingUp size={18} strokeWidth={2.5}/>
            </span>
            <h2 className="font-display text-2xl font-black tracking-tight text-[var(--ink)]">
              Visual Analytics
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Analisis komposisi aktivitas dan ritme produktivitasmu.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex rounded-xl bg-[#f0f4f1] p-1 text-xs font-black">
          <button
            type="button"
            onClick={() => setActiveTab("kategori")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
              activeTab === "kategori"
                ? "bg-white text-[var(--brand)] shadow-sm"
                : "text-[var(--muted)] hover:text-[#103626]"
            }`}
          >
            <PieChart size={14}/> Kategori
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
              activeTab === "status"
                ? "bg-white text-[var(--brand)] shadow-sm"
                : "text-[var(--muted)] hover:text-[#103626]"
            }`}
          >
            <CheckCircle size={14}/> Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prioritas")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 transition ${
              activeTab === "prioritas"
                ? "bg-white text-[var(--brand)] shadow-sm"
                : "text-[var(--muted)] hover:text-[#103626]"
            }`}
          >
            <BarChart2 size={14}/> Prioritas
          </button>
        </div>
      </div>

      {/* Chart Body */}
      {totalItems === 0 ? (
        <div className="py-12 text-center text-[var(--muted)]">
          <p className="font-bold">Belum ada data kegiatan untuk dianalisis</p>
          <p className="mt-1 text-xs">Tambahkan kegiatan pada semester ini untuk melihat grafiknya.</p>
        </div>
      ) : (
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Left: Donut Chart SVG */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="relative h-48 w-48 sm:h-52 sm:w-52">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#eff2eb"
                  strokeWidth="20"
                  fill="transparent"
                />

                {/* Slices */}
                {currentDataset.map((slice) => {
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
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      fill="transparent"
                      className="transition-all duration-700 ease-out hover:opacity-85"
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-4xl font-black text-[var(--ink)]">
                  {totalItems}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                  Total Item
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-[var(--muted)]">
              {activeTab === "kategori"
                ? "Distribusi bidang aktivitas"
                : activeTab === "status"
                ? `Penyelesaian: ${completionRate}%`
                : "Distribusi urgensi kegiatan"}
            </p>
          </div>

          {/* Right: Breakdown Progress Bars */}
          <div className="space-y-4">
            {currentDataset.map((item) => {
              const percentage = Math.round((item.count / totalItems) * 100);
              return (
                <div key={item.label} className="group">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full shadow-xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-extrabold text-[var(--ink)]">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className="text-[var(--ink)]">{item.count} item</span>
                      <span className="rounded-md bg-[#f0f4f1] px-2 py-0.5 text-[var(--muted)] font-black">
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#eff2eb]">
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
  );
}
