"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
  Video,
  FileText,
  FolderOpen,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { CourseData, CourseFormModal } from "./course-form-modal";
import { CourseCalendar } from "./course-calendar";
import { generateIcsCalendar } from "@/lib/calendar-utils";
import { deleteCourse } from "@/app/(dashboard)/jadwal/actions";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";
import { CourseModuleData } from "@/components/modules/module-form-modal";

const DAYS = [
  { value: 1, name: "Senin", short: "Sen" },
  { value: 2, name: "Selasa", short: "Sel" },
  { value: 3, name: "Rabu", short: "Rab" },
  { value: 4, name: "Kamis", short: "Kam" },
  { value: 5, name: "Jumat", short: "Jum" },
  { value: 6, name: "Sabtu", short: "Sab" },
];

export function ScheduleClientView({
  courses,
  modules = [],
  semesters,
  activeSemesterId,
  semesterDates,
  semesterName,
}: {
  courses: (CourseData & { id: string })[];
  modules?: (CourseModuleData & { id: string })[];
  semesters: { id: string; nama_semester: string; is_active: boolean }[];
  activeSemesterId?: string;
  semesterDates?: { tanggal_mulai: string; tanggal_selesai: string };
  semesterName?: string;
}) {
  const [viewMode, setViewMode] = useState<"list" | "grid" | "calendar">("list");
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | "all">("all");
  const [showEmptyDays, setShowEmptyDays] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Compute Today in WIB (UTC+7)
  const todayDayNumber = useMemo(() => {
    const now = new Date();
    // WIB offset is UTC+7
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const wibDate = new Date(utcTime + 7 * 3600000);
    const day = wibDate.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    return day === 0 ? 7 : day; // 1-7 (Senin-Minggu)
  }, []);

  const toggleCourseModules = (courseId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // Group courses by day
  const coursesByDay = DAYS.map((d) => ({
    ...d,
    isToday: d.value === todayDayNumber,
    items: courses.filter((c) => c.hari === d.value).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai)),
  }));

  const totalSks = courses.reduce((acc, c) => acc + (c.sks || 0), 0);
  const todayCourses = courses.filter((c) => c.hari === todayDayNumber);

  // Filtered days based on day tab
  const displayedDays = coursesByDay.filter((day) => {
    if (selectedDayFilter !== "all") {
      return day.value === selectedDayFilter;
    }
    // In "all" mode, hide empty days unless showEmptyDays is toggled on
    if (!showEmptyDays && day.items.length === 0) {
      return false;
    }
    return true;
  });

  const handleExportIcs = () => {
    if (!courses.length) return;
    const icsContent = generateIcsCalendar(
      courses,
      semesterDates?.tanggal_mulai,
      semesterDates?.tanggal_selesai,
      semesterName || "Semester"
    );
    if (!icsContent) {
      alert("Rentang tanggal semester belum ditentukan atau tidak ada jadwal mata kuliah.");
      return;
    }
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `jadwal-kuliah-${(semesterName || "semester").toLowerCase().replace(/\s+/g, "-")}.ics`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* ── Top Bar: Quick Stats & View Switcher ── */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-3.5 sm:p-4 shadow-2xs">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#103626] text-[#c8ef70] shrink-0 shadow-2xs">
              <BookOpen size={17} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">TOTAL BEBAN</p>
                {todayCourses.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#c8ef70]/25 px-2 py-0.2 text-[9px] font-black text-[#0f6849]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse"></span>
                    Hari Ini: {todayCourses.length} Kelas
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm font-black text-[var(--ink)] leading-tight">
                {courses.length} Mata Kuliah <span className="text-[#0f6849] font-black">({totalSks} SKS)</span>
              </p>
            </div>
          </div>

          {/* Quick .ICS download on mobile */}
          {courses.length > 0 && (
            <button
              onClick={handleExportIcs}
              className="inline-flex sm:hidden items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-2.5 py-1.5 text-[11px] font-black text-[var(--ink)] hover:bg-[var(--card-bg)] transition active:scale-95"
              title="Export .ics"
            >
              <Download size={13} className="text-[#0f6849]" />
              <span>.ICS</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap border-t border-[var(--line)]/50 pt-2.5 sm:border-0 sm:pt-0">
          {/* Export to Calendar (Desktop) */}
          {courses.length > 0 && (
            <button
              onClick={handleExportIcs}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--card-bg)] hover:border-[#a9cdb2] transition active:scale-95"
              title="Download file .ics untuk Google Calendar / Apple Calendar"
            >
              <Download size={14} className="text-[#0f6849]" />
              <span>Export ke Kalender</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-[var(--card-subtle)] p-1 border border-[var(--line)]">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-[var(--card-bg)] text-[var(--ink)] shadow-2xs font-black"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Daftar Hari
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold transition ${
                viewMode === "grid"
                  ? "bg-[var(--card-bg)] text-[var(--ink)] shadow-2xs font-black"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Tabel
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold transition ${
                viewMode === "calendar"
                  ? "bg-[var(--card-bg)] text-[#0f6849] shadow-2xs font-black"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Kalender
            </button>
          </div>

          <CourseFormModal
            semesters={semesters}
            activeSemesterId={activeSemesterId}
            triggerClass="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-3.5 py-1.5 text-[11px] sm:text-xs font-black text-[#c8ef70] shadow-2xs hover:bg-[#1a4a34] transition active:scale-95"
            triggerText="Tambah Matkul"
          />
        </div>
      </div>

      {/* ── Day Pill Selector (List View Only) ── */}
      {viewMode === "list" && courses.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Scrollable Day Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedDayFilter("all")}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                selectedDayFilter === "all"
                  ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                  : "border border-[var(--line)] bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--card-subtle)]"
              }`}
            >
              <span>Semua Hari</span>
              <span
                className={`rounded-md px-1.5 py-0.2 text-[10px] font-black ${
                  selectedDayFilter === "all" ? "bg-white/20 text-white" : "bg-[var(--card-subtle)] text-[var(--muted)]"
                }`}
              >
                {courses.length}
              </span>
            </button>

            {coursesByDay.map((d) => {
              const isActive = selectedDayFilter === d.value;
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDayFilter(d.value)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                    isActive
                      ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                      : d.isToday
                      ? "border-2 border-[#0f6849] bg-[#dff3e5]/60 text-[#0f6849] hover:bg-[#dff3e5]"
                      : "border border-[var(--line)] bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--card-subtle)]"
                  }`}
                >
                  <span>{d.name}</span>
                  {d.isToday && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "bg-[#c8ef70]" : "bg-[#0f6849]"
                      } animate-ping`}
                    />
                  )}
                  {d.items.length > 0 ? (
                    <span
                      className={`rounded-md px-1.5 py-0.2 text-[10px] font-black ${
                        isActive
                          ? "bg-white/20 text-white"
                          : d.isToday
                          ? "bg-[#0f6849] text-white"
                          : "bg-[var(--card-subtle)] text-[var(--muted)]"
                      }`}
                    >
                      {d.items.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Toggle empty days when in "all" view */}
          {selectedDayFilter === "all" && (
            <button
              type="button"
              onClick={() => setShowEmptyDays(!showEmptyDays)}
              className="inline-flex self-start sm:self-auto items-center gap-1.5 text-[11px] font-bold text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              {showEmptyDays ? (
                <>
                  <EyeOff size={13} />
                  <span>Sembunyikan Hari Kosong</span>
                </>
              ) : (
                <>
                  <Eye size={13} />
                  <span>Tampilkan Hari Kosong</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Edit modal controller */}
      {editingCourse && (
        <CourseFormModal
          course={editingCourse}
          semesters={semesters}
          activeSemesterId={activeSemesterId}
          isOpen={true}
          onClose={() => setEditingCourse(null)}
        />
      )}

      {/* ── Main View Content ── */}
      {courses.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-[var(--line)] bg-[var(--card-bg)] p-8 sm:p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
            <BookOpen size={28} />
          </div>
          <h3 className="mt-4 font-display text-xl font-black text-[var(--ink)]">Belum Ada Jadwal Kuliah</h3>
          <p className="mt-1.5 text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            Mata kuliah yang kamu tambahkan akan terorganisir per hari, lengkap dengan ruang kelas, link virtual meet, dan modul perkuliahan.
          </p>
          <div className="mt-5 flex justify-center">
            <CourseFormModal
              semesters={semesters}
              activeSemesterId={activeSemesterId}
              triggerClass="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-4 py-2 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95"
              triggerText="Tambah Mata Kuliah Pertama"
            />
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* ── LIST VIEW ACCORDING TO SELECTED DAY ── */
        <div className="space-y-5">
          {displayedDays.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--card-bg)] p-8 text-center">
              <p className="text-xs font-bold text-[var(--muted)]">Tidak ada jadwal untuk filter yang dipilih.</p>
              <button
                onClick={() => setSelectedDayFilter("all")}
                className="mt-2 text-xs font-black text-[#0f6849] hover:underline"
              >
                Lihat Semua Hari
              </button>
            </div>
          ) : (
            displayedDays.map((day) => {
              const isToday = day.value === todayDayNumber;
              return (
                <div
                  key={day.value}
                  className={`rounded-3xl border transition shadow-2xs ${
                    isToday
                      ? "border-[#0f6849] bg-[var(--card-bg)] ring-2 ring-[#0f6849]/15"
                      : "border-[var(--line)] bg-[var(--card-bg)]"
                  } p-4 sm:p-6`}
                >
                  {/* Day Header Row */}
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-black transition ${
                          isToday
                            ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                            : "bg-[var(--card-subtle)] text-[var(--ink)] border border-[var(--line)]"
                        }`}
                      >
                        {day.short}
                      </span>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base sm:text-lg font-black text-[var(--ink)]">
                          {day.name}
                        </h3>
                        {isToday && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#103626] px-2.5 py-0.5 text-[9.5px] font-black text-[#c8ef70]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] animate-pulse"></span>
                            HARI INI
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[var(--muted)]">
                      {day.items.length === 0
                        ? "Libur"
                        : `${day.items.length} Kelas · ${day.items.reduce((acc, i) => acc + i.sks, 0)} SKS`}
                    </span>
                  </div>

                  {/* Day Courses List / Empty state */}
                  {day.items.length === 0 ? (
                    <div className="py-6 text-center">
                      <p className="text-xs font-bold text-[var(--muted)] italic">
                        Libur / Tidak ada jadwal perkuliahan di hari {day.name}.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                      {day.items.map((course) => (
                        <div
                          key={course.id}
                          className="group relative flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-4 transition-all duration-200 hover:border-[#a9cdb2] hover:bg-[var(--card-bg)] hover:shadow-sm"
                          style={{
                            borderLeftColor: course.warna_label || "#0f6849",
                            borderLeftWidth: "4px",
                          }}
                        >
                          <div>
                            {/* Top row: Code + SKS + Format Badge */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                                {course.kode_matkul || "MATKUL"} · {course.sks} SKS
                              </span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider ${
                                  course.tipe_pertemuan === "online"
                                    ? "bg-[#e0e7ff] text-[#3730a3]"
                                    : course.tipe_pertemuan === "hybrid"
                                    ? "bg-[#fef3c7] text-[#92400e]"
                                    : "bg-[#dcfce7] text-[#166534]"
                                }`}
                              >
                                {course.tipe_pertemuan}
                              </span>
                            </div>

                            {/* Course Title */}
                            <h4 className="mt-2 text-sm font-black text-[var(--ink)] leading-snug">
                              {course.nama_matkul}
                            </h4>

                            {/* Time Pill */}
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--card-bg)] px-2 py-1 text-xs font-extrabold text-[#0f6849] border border-[var(--line)]">
                              <Clock size={12} />
                              <span>
                                {course.jam_mulai.slice(0, 5)} - {course.jam_selesai.slice(0, 5)} WIB
                              </span>
                            </div>

                            {/* Location / Ruangan */}
                            {course.ruangan && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]">
                                <MapPin size={13} className="shrink-0 text-[var(--muted)]" />
                                <span className="truncate">{course.ruangan}</span>
                              </div>
                            )}

                            {/* Lecturer */}
                            {course.dosen_pengampu && (
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                <User size={13} className="shrink-0" />
                                <span className="truncate">{course.dosen_pengampu}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Row */}
                          <div className="mt-4 flex flex-wrap items-center justify-between border-t border-[var(--line)] pt-3 gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Meet Button */}
                              {course.link_pertemuan && (
                                <a
                                  href={course.link_pertemuan}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#103626] px-2.5 py-1 text-[11px] font-black text-[#c8ef70] hover:bg-[#1a4a34] transition active:scale-95 shadow-2xs"
                                  title="Masuk Kelas Virtual"
                                >
                                  <Video size={12} />
                                  <span>Masuk Kelas</span>
                                </a>
                              )}

                              {/* Materi Button */}
                              {course.link_materi && (
                                <a
                                  href={course.link_materi}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#dff3e5] px-2 py-1 text-[11px] font-black text-[#0f6849] hover:bg-[#c8ef70]/30 transition"
                                  title="Buka Materi Kuliah"
                                >
                                  <FileText size={12} />
                                  <span>Materi</span>
                                </a>
                              )}

                              {/* Modul Drawer Toggle */}
                              <button
                                type="button"
                                onClick={() => toggleCourseModules(course.id)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                                  expandedModules[course.id]
                                    ? "bg-[#0f6849] text-white"
                                    : "bg-[var(--card-bg)] text-[var(--brand)] border border-[var(--line)] hover:bg-[#dff3e5]"
                                }`}
                                title="Tampilkan modul pertemuan"
                              >
                                <FolderOpen size={12} />
                                <span>
                                  {modules.filter((m) => m.course_id === course.id).length} Modul
                                </span>
                              </button>
                            </div>

                            {/* Edit & Delete Controls */}
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => setEditingCourse(course)}
                                title="Edit Mata Kuliah"
                                className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[#0f6849] transition"
                              >
                                <Pencil size={13} />
                              </button>
                              <ConfirmDeleteForm
                                action={deleteCourse}
                                id={course.id}
                                itemName={`mata kuliah ${course.nama_matkul}`}
                              />
                            </div>
                          </div>

                          {/* Expandable Course Modules Drawer */}
                          {expandedModules[course.id] && (
                            <div className="mt-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--card-bg)] p-3 text-left animate-in fade-in duration-150 shadow-2xs">
                              <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
                                <span className="text-[10.5px] font-black uppercase tracking-wider text-[#0f6849]">
                                  Modul Perkuliahan
                                </span>
                                <Link
                                  href="/modul"
                                  className="text-[10px] font-bold text-[#0f6849] hover:underline"
                                >
                                  Buka Semua Modul →
                                </Link>
                              </div>

                              {modules.filter((m) => m.course_id === course.id).length === 0 ? (
                                <div className="py-3 text-center">
                                  <p className="text-[11px] text-[var(--muted)]">
                                    Belum ada modul yang dicatat untuk matkul ini.
                                  </p>
                                  <Link
                                    href="/modul"
                                    className="mt-1.5 inline-block text-[11px] font-black text-[#0f6849] hover:underline"
                                  >
                                    + Catat Modul di Menu Modul Kuliah
                                  </Link>
                                </div>
                              ) : (
                                <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                  {modules
                                    .filter((m) => m.course_id === course.id)
                                    .sort((a, b) => a.pertemuan - b.pertemuan)
                                    .map((m) => (
                                      <div
                                        key={m.id}
                                        className="flex items-center justify-between gap-2 rounded-lg border border-[var(--line)] bg-[var(--card-subtle)] px-2.5 py-1.5 text-xs"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="shrink-0 font-black text-[10px] text-[#0f6849]">
                                              P{m.pertemuan}:
                                            </span>
                                            <span className="truncate font-semibold text-[11px] text-[var(--ink)]">
                                              {m.topik}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          {m.file_url && (
                                            <a
                                              href={m.file_url}
                                              download={m.file_name || `modul-pertemuan-${m.pertemuan}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="rounded-md bg-[#0f6849] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs hover:bg-[#103626] transition"
                                              title={`Unduh file ${m.file_name || ""}`}
                                            >
                                              Unduh
                                            </a>
                                          )}
                                          {m.link_modul && (
                                            <a
                                              href={m.link_modul}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="rounded-md bg-[#103626] px-1.5 py-0.5 text-[10px] font-bold text-[#c8ef70]"
                                              title="Buka Link Eksternal"
                                            >
                                              Link
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID TIMETABLE VIEW (Desktop / Tablet Friendly) ── */
        <div className="overflow-x-auto rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-5 shadow-2xs">
          <div className="grid min-w-[750px] grid-cols-6 gap-3">
            {coursesByDay.map((day) => {
              const isToday = day.value === todayDayNumber;
              return (
                <div
                  key={day.value}
                  className={`rounded-2xl border p-3 ${
                    isToday
                      ? "border-[#0f6849] bg-[#dff3e5]/20 ring-1 ring-[#0f6849]/30"
                      : "border-[var(--line)] bg-[var(--card-subtle)]"
                  }`}
                >
                  <div className="border-b border-[var(--line)] pb-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <p className="font-display text-xs font-black uppercase tracking-wider text-[var(--ink)]">
                        {day.name}
                      </p>
                      {isToday && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--muted)] font-bold">{day.items.length} kelas</p>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {day.items.length === 0 ? (
                      <p className="py-6 text-center text-[11px] text-[var(--muted)] italic">
                        Kosong
                      </p>
                    ) : (
                      day.items.map((course) => (
                        <div
                          key={course.id}
                          className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-2.5 text-left shadow-2xs transition hover:shadow-xs hover:border-[#a9cdb2]"
                          style={{ borderTopColor: course.warna_label || "#0f6849", borderTopWidth: "3px" }}
                        >
                          <p className="text-xs font-black text-[var(--ink)] leading-snug line-clamp-2">
                            {course.nama_matkul}
                          </p>
                          <p className="mt-1 text-[10px] font-extrabold text-[#0f6849]">
                            {course.jam_mulai.slice(0, 5)} - {course.jam_selesai.slice(0, 5)}
                          </p>
                          {course.ruangan && (
                            <p className="mt-0.5 text-[9.5px] text-[var(--muted)] truncate">
                              📍 {course.ruangan}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between border-t border-[var(--line)] pt-1.5">
                            <span className="text-[9px] font-black text-[var(--muted)]">{course.sks} SKS</span>
                            <div className="flex items-center gap-1">
                              {course.link_pertemuan && (
                                <a
                                  href={course.link_pertemuan}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded bg-[#103626] p-1 text-[#c8ef70] hover:bg-[#1a4a34]"
                                  title="Masuk Meet"
                                >
                                  <Video size={10} />
                                </a>
                              )}
                              <button
                                onClick={() => setEditingCourse(course)}
                                className="text-[10px] font-bold text-[#0f6849] hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── MONTHLY CALENDAR VIEW ── */
        <CourseCalendar
          courses={courses}
          tanggalMulai={semesterDates?.tanggal_mulai}
          tanggalSelesai={semesterDates?.tanggal_selesai}
        />
      )}
    </div>
  );
}
