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
}: {
  filters: FilterState;
  semesters: Option[];
  organizations: Option[];
  calendar: boolean;
  totalItems: number;
}) {
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(filters.semester_id || filters.organization_id || filters.prioritas || filters.status)
  );

  const activeAdvancedCount = [
    filters.semester_id,
    filters.organization_id,
    filters.prioritas,
    filters.status,
  ].filter(Boolean).length;

  return (
    <div className="mb-4 rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-3 sm:p-4 shadow-2xs">
      {/* ── Top Bar: Search, View Switcher & Filter Toggle ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <form className="relative flex-1 min-w-[200px] max-w-md">
          {calendar && <input type="hidden" name="view" value="calendar" />}
          {filters.kategori && <input type="hidden" name="kategori" value={filters.kategori} />}
          {filters.semester_id && <input type="hidden" name="semester_id" value={filters.semester_id} />}
          {filters.organization_id && <input type="hidden" name="organization_id" value={filters.organization_id} />}
          {filters.prioritas && <input type="hidden" name="prioritas" value={filters.prioritas} />}
          {filters.status && <input type="hidden" name="status" value={filters.status} />}

          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
          />
          <input
            type="text"
            name="q"
            defaultValue={filters.q || ""}
            placeholder="Cari judul kegiatan, tugas, proker..."
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] py-2 pl-9 pr-3 text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:outline-hidden"
          />
        </form>

        <div className="flex items-center gap-2 shrink-0">
          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              showAdvanced || activeAdvancedCount > 0
                ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]"
                : "border-[var(--line)] bg-[var(--card-subtle)] text-[var(--ink)] hover:bg-[var(--card-bg)]"
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
            {activeAdvancedCount > 0 && (
              <span className="grid h-4.5 w-4.5 place-items-center rounded-full bg-[var(--brand)] text-[10px] font-black text-white">
                {activeAdvancedCount}
              </span>
            )}
          </button>

          {/* List / Calendar View Switcher */}
          <div className="flex rounded-xl bg-[var(--card-subtle)] p-1 border border-[var(--line)]">
            <Link
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                !calendar ? "bg-[var(--card-bg)] text-[var(--brand)] shadow-2xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              href={buildHref(filters, {}, "list")}
            >
              List
            </Link>
            <Link
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                calendar ? "bg-[var(--card-bg)] text-[var(--brand)] shadow-2xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              href={buildHref(filters, {}, "calendar")}
            >
              Kalender
            </Link>
          </div>
        </div>
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
              className={`inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                isActive
                  ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                  : "bg-[var(--card-subtle)] text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] border border-[var(--line)]"
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
