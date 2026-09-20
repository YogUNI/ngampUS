"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";

type Option = { id: string; name: string };
type FilterState = {
  q?: string;
  view?: string;
  kategori?: string;
  status?: string;
  semester_id?: string;
  organization_id?: string;
  prioritas?: string;
};

const CATEGORIES = [
  { id: "", label: "Semua Kategori" },
  { id: "kuliah", label: "📚 Kuliah" },
  { id: "organisasi", label: "🏢 Organisasi" },
  { id: "lomba", label: "🏆 Lomba" },
  { id: "event", label: "🎯 Event" },
  { id: "lainnya", label: "📎 Lainnya" },
];

function buildHref(filters: FilterState, updates: Partial<FilterState> = {}, view?: "list" | "calendar") {
  const merged = { ...filters, ...updates };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value && key !== "view") params.set(key, value);
  }
  if (view === "calendar" || (!view && merged.view === "calendar")) {
    params.set("view", "calendar");
  }
  const query = params.toString();
  return `/kegiatan${query ? `?${query}` : ""}`;
}

export function ActivityFilterBar({
  filters,
  semesters,
  organizations,
  calendar,
  totalItems,
  counts,
}: {
  filters: FilterState;
  semesters: Option[];
  organizations: Option[];
  calendar: boolean;
  totalItems: number;
  counts?: {
    total: number;
    active: number;
    onProgress: number;
    completed: number;
  };
}) {
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(filters.semester_id || filters.organization_id || filters.prioritas)
  );

  const activeAdvancedCount = [
    filters.semester_id,
    filters.organization_id,
    filters.prioritas,
  ].filter(Boolean).length;

  const currentStatusTab = filters.status || "";

  return (
    <div className="mb-4 rounded-3xl border border-[#d8e3da] bg-white p-3.5 sm:p-5 shadow-xs">
      {/* ── Top Bar: Search + Quick Action Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <form className="relative flex-1 min-w-[200px] max-w-md">
          {calendar && <input type="hidden" name="view" value="calendar" />}
          {filters.kategori && <input type="hidden" name="kategori" value={filters.kategori} />}
          {filters.semester_id && <input type="hidden" name="semester_id" value={filters.semester_id} />}
          {filters.organization_id && <input type="hidden" name="organization_id" value={filters.organization_id} />}
          {filters.prioritas && <input type="hidden" name="prioritas" value={filters.prioritas} />}
          {filters.status && <input type="hidden" name="status" value={filters.status} />}

          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d9284] pointer-events-none"
          />
          <input
            type="text"
            name="q"
            defaultValue={filters.q || ""}
            placeholder="Cari kegiatan, tugas, modul..."
            className="w-full rounded-2xl border border-[#d8e3da] bg-[#f7f9f7] py-2 sm:py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-[#10261b] placeholder:text-[#8b9e91] focus:border-[#0f6849] focus:bg-white focus:outline-none transition"
          />
        </form>

        <div className="flex items-center gap-2 shrink-0">
          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition active:scale-95 ${
              showAdvanced || activeAdvancedCount > 0
                ? "border-[#0f6849] bg-[#dff3e5] text-[#0f6849]"
                : "border-[#d8e3da] bg-[#f7f9f7] text-[#33463a] hover:bg-white"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filter Tambahan</span>
            <span className="sm:hidden">Filter</span>
            {activeAdvancedCount > 0 && (
              <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-[#0f6849] text-[10px] font-black text-[#c8ef70]">
                {activeAdvancedCount}
              </span>
            )}
          </button>

          {/* List / Calendar View Switcher */}
          <div className="flex rounded-2xl bg-[#f0f4f0] p-1 border border-[#d8e3da]">
            <Link
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                !calendar ? "bg-white text-[#0f6849] shadow-2xs" : "text-[#697c6f] hover:text-[#10261b]"
              }`}
              href={buildHref(filters, {}, "list")}
            >
              Daftar
            </Link>
            <Link
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                calendar ? "bg-white text-[#0f6849] shadow-2xs" : "text-[#697c6f] hover:text-[#10261b]"
              }`}
              href={buildHref(filters, {}, "calendar")}
            >
              Kalender
            </Link>
          </div>
        </div>
      </div>

      {/* ── Segmented Quick Status Tabs (One-Tap Thumb Friendly on Mobile) ── */}
      <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden border-t border-[#f0f4f0] pt-3">
        {[
          { id: "", label: "Semua", count: counts?.total ?? totalItems },
          { id: "belum_mulai", label: "Belum Mulai", count: counts?.active },
          { id: "on_progress", label: "Sedang Berjalan", count: counts?.onProgress },
          { id: "selesai", label: "Selesai", count: counts?.completed },
        ].map((tab) => {
          const isActive = currentStatusTab === tab.id;
          const href = buildHref(
            filters,
            { status: tab.id || undefined },
            calendar ? "calendar" : "list"
          );

          return (
            <Link
              key={tab.id}
              href={href}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                isActive
                  ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                  : "bg-[#f4f7f4] text-[#55675b] hover:bg-[#eaf1ec] hover:text-[#10261b]"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive
                      ? "bg-[#c8ef70]/20 text-[#c8ef70]"
                      : "bg-[#e2eae4] text-[#55675b]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Category Quick Chips (Horizontal Scrollable on Mobile) ── */}
      <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => {
          const isActive = (filters.kategori || "") === cat.id;
          const href = buildHref(
            filters,
            { kategori: cat.id || undefined },
            calendar ? "calendar" : "list"
          );
          return (
            <Link
              key={cat.id}
              href={href}
              className={`inline-flex shrink-0 items-center rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                isActive
                  ? "bg-[#0f6849] text-white shadow-2xs"
                  : "bg-white text-[#697c6f] hover:bg-[#f4f7f4] hover:text-[#10261b] border border-[#d8e3da]"
              }`}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* ── Collapsible Advanced Filters ── */}
      {showAdvanced && (
        <form className="mt-3 pt-3 border-t border-[var(--line)] grid gap-2 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-150">
          {calendar && <input type="hidden" name="view" value="calendar" />}
          {filters.q && <input type="hidden" name="q" value={filters.q} />}
          {filters.kategori && <input type="hidden" name="kategori" value={filters.kategori} />}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
              Semester
            </label>
            <select
              name="semester_id"
              defaultValue={filters.semester_id || ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
            >
              <option value="">Semua semester</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
              Organisasi
            </label>
            <select
              name="organization_id"
              defaultValue={filters.organization_id || ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
            >
              <option value="">Semua organisasi</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
              Prioritas
            </label>
            <select
              name="prioritas"
              defaultValue={filters.prioritas || ""}
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
            >
              <option value="">Semua prioritas</option>
              <option value="tinggi">Tinggi</option>
              <option value="sedang">Sedang</option>
              <option value="rendah">Rendah</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">
              Status Kegiatan
            </label>
            <div className="flex gap-2">
              <select
                name="status"
                defaultValue={filters.status || ""}
                className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
              >
                <option value="">Semua status</option>
                <option value="belum_mulai">Belum mulai</option>
                <option value="on_progress">Sedang berjalan</option>
                <option value="selesai">Selesai</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-[var(--brand)] px-3 py-1.5 text-xs font-black text-white hover:bg-[var(--brand-dark)] transition active:scale-95 shrink-0"
              >
                Terapkan
              </button>
            </div>
          </div>

          {activeAdvancedCount > 0 && (
            <div className="col-span-full pt-1 flex justify-end">
              <Link
                href={`/kegiatan${calendar ? "?view=calendar" : ""}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)] hover:text-rose-600 transition"
              >
                <X size={12} /> Reset Semua Filter
              </Link>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
