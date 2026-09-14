"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
  User,
  Video,
  X,
} from "lucide-react";
import { ActivityForm } from "./activity-form";
import { CourseData } from "@/components/schedule/course-form-modal";
import { generateCourseOccurrences, CourseOccurrence } from "@/lib/calendar-utils";

type Activity = {
  id: string;
  judul: string;
  deadline: string | null;
  jam_deadline?: string | null;
  prioritas: string;
  status: string;
  kategori: string;
  jenis_item: string;
  catatan?: string | null;
  link_terkait?: string | null;
  course_id?: string | null;
};

type Option = { id: string; name: string; active?: boolean };
type ProgramOption = { id: string; name: string; organization_id?: string | null };

export function CalendarView({
  activities,
  courses = [],
  tanggalMulai,
  tanggalSelesai,
  semesters = [],
  organizations = [],
  programs = [],
}: {
  activities: Activity[];
  courses?: (CourseData & { id: string })[];
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
  semesters?: Option[];
  organizations?: Option[];
  programs?: ProgramOption[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<{
    type: "course_group" | "activity";
    courses?: CourseOccurrence[];
    dateStr?: string;
    activity?: Activity;
  } | null>(null);

  const [showCourses, setShowCourses] = useState(true);
  const [showActivities, setShowActivities] = useState(true);

  const colors: Record<string, string> = {
    kuliah: "#3b82c4",
    organisasi: "#0f6849",
    lomba: "#d99a20",
    event: "#8055b8",
    lainnya: "#5e6b63",
  };

  // 1. Generate Course Occurrences across semester
  const courseOccurrences = useMemo(() => {
    if (!showCourses) return [];
    return generateCourseOccurrences(courses, tanggalMulai, tanggalSelesai);
  }, [courses, tanggalMulai, tanggalSelesai, showCourses]);

  // 2. Map activities with deadlines into events
  const activityEvents = useMemo(() => {
    if (!showActivities) return [];
    return activities
      .filter((item) => !!item.deadline)
      .map((item) => {
        const isSelesai = item.status === "selesai";
        const isOnProgress = item.status === "on_progress";

        return {
          id: `act-${item.id}`,
          title: isSelesai ? `✓ ${item.judul}` : item.judul,
          date: item.deadline!,
          backgroundColor: isSelesai
            ? "#c5cfc8"
            : colors[item.kategori] || colors.lainnya,
          borderColor: isSelesai
            ? "#b0bcb3"
            : isOnProgress
            ? "#c8ef70"
            : "transparent",
          textColor: isSelesai ? "#4f5a53" : "#ffffff",
          classNames: isSelesai
            ? ["cal-event-selesai", "opacity-70", "line-through"]
            : isOnProgress
            ? ["cal-event-progress", "ring-1", "ring-[#0f6849]"]
            : ["cal-event-upcoming"],
          extendedProps: {
            itemType: "activity" as const,
            data: item,
          },
        };
      });
  }, [activities, showActivities]);

  // 3. Group Course Occurrences by Date into single clean summary event
  const courseEvents = useMemo(() => {
    // Kelompokkan occurrence berdasarkan dateString
    const byDate = new Map<string, CourseOccurrence[]>();
    for (const occ of courseOccurrences) {
      const list = byDate.get(occ.dateString) || [];
      list.push(occ);
      byDate.set(occ.dateString, list);
    }

    const events = [];
    for (const [dateStr, dailyCourses] of byDate.entries()) {
      const count = dailyCourses.length;
      const title = count === 1
        ? `🎓 Kuliah (${dailyCourses[0].nama_matkul})`
        : `🎓 Kuliah Kampus (${count} Kelas)`;

      events.push({
        id: `crs-day-${dateStr}`,
        title,
        date: dateStr,
        backgroundColor: "#4f46e5", // Indigo khas perkuliahan akademik agar kontras dengan hijau organisasi & biru tugas
        borderColor: "transparent",
        textColor: "#ffffff",
        classNames: ["cal-event-course", "font-black"],
        extendedProps: {
          itemType: "course_group" as const,
          courses: dailyCourses,
          dateStr,
        },
      });
    }

    return events;
  }, [courseOccurrences]);

  // Combined events
  const allEvents = useMemo(() => {
    return [...activityEvents, ...courseEvents];
  }, [activityEvents, courseEvents]);

  return (
    <div className="surface-lift ngampus-calendar rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5">
      {/* Legend & Filter Switches */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-extrabold text-[var(--ink)]">Filter:</span>

          {/* Toggle Matkul */}
          <button
            onClick={() => setShowCourses((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
              showCourses
                ? "bg-[#4f46e5] text-white shadow-2xs"
                : "bg-[#f0f4f1] text-[var(--muted)] opacity-60 line-through"
            }`}
          >
            <span>🎓 Jadwal Kuliah ({courses.length})</span>
          </button>

          {/* Toggle Kegiatan/Tugas */}
          <button
            onClick={() => setShowActivities((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
              showActivities
                ? "bg-[var(--brand)] text-white shadow-2xs"
                : "bg-[#f0f4f1] text-[var(--muted)] opacity-60 line-through"
            }`}
          >
            <span>Tugas & Komitmen ({activities.length})</span>
          </button>

          <span className="hidden lg:inline-block h-4 w-px bg-[var(--line)] mx-1" />

          {/* Legend dots */}
          <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#4f46e5]" /> Kuliah
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#0f6849]" /> Organisasi
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#d99a20]" /> Lomba
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#8055b8]" /> Event
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#a8b5ac]" /> Selesai
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[var(--muted)] hidden md:block">
          💡 Klik event untuk lihat detail · Klik tanggal untuk buat tugas
        </p>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        height="auto"
        dayMaxEvents={3}
        moreLinkClick="popover"
        selectable={true}
        dateClick={(info) => {
          setSelectedDate(info.dateStr);
        }}
        eventClick={(info) => {
          const { itemType, data, courses: grpCourses, dateStr } = info.event.extendedProps;
          if (itemType === "course_group") {
            setActiveItem({ type: "course_group", courses: grpCourses, dateStr });
          } else if (itemType === "activity") {
            setActiveItem({ type: "activity", activity: data });
          }
        }}
        events={allEvents}
      />

      {/* Detail Popover Modal when clicking event - Portaled to document.body for true fullscreen backdrop */}
      {mounted &&
        activeItem &&
        createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveItem(null);
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm animate-in fade-in duration-150"
          >
            <div className="relative flex flex-col w-full max-w-lg max-h-[85vh] rounded-3xl border border-[var(--line)] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
              {activeItem.type === "course_group" && activeItem.courses && (
                <>
                  {/* Header (Sticky Top) */}
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[#fbfcfa] px-6 py-4 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eef2ff] text-[#4f46e5]">
                        <BookOpen size={20} />
                      </span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#4f46e5]">
                          JADWAL KULIAH HARI INI
                        </span>
                        <h3 className="font-display text-base sm:text-lg font-extrabold text-[var(--ink)] leading-snug">
                          {activeItem.dateStr
                            ? new Intl.DateTimeFormat("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }).format(new Date(`${activeItem.dateStr}T00:00:00`))
                            : "Daftar Kuliah"}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveItem(null)}
                      className="rounded-xl p-2 text-[var(--muted)] hover:bg-[#f0f4f1] hover:text-[var(--ink)] transition"
                      title="Tutup"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Body (Scrollable) */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    <p className="text-xs text-[var(--muted)]">
                      Terdapat <strong className="text-[var(--ink)]">{activeItem.courses.length} mata kuliah</strong> yang berlangsung pada hari ini:
                    </p>

                    {/* List of courses for this day */}
                    {activeItem.courses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-2xl border border-[var(--line)] bg-[#fafbf9] p-4 shadow-2xs transition hover:bg-white"
                        style={{ borderLeftColor: course.warna_label, borderLeftWidth: "4px" }}
                      >
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

                        <h4 className="mt-1.5 text-sm font-black text-[var(--ink)] leading-snug">
                          {course.nama_matkul}
                        </h4>

                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#4f46e5]">
                          <Clock size={13} />
                          <span>
                            {course.jam_mulai.slice(0, 5)} - {course.jam_selesai.slice(0, 5)} WIB
                          </span>
                        </div>

                        {course.ruangan && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <MapPin size={13} className="shrink-0 text-[#4f46e5]" />
                            <span className="truncate">{course.ruangan}</span>
                          </div>
                        )}

                        {course.dosen_pengampu && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <User size={13} className="shrink-0 text-[#4f46e5]" />
                            <span className="truncate">{course.dosen_pengampu}</span>
                          </div>
                        )}

                        {(course.link_pertemuan || course.link_materi) && (
                          <div className="mt-3 flex items-center gap-2 border-t border-[#edf2ee] pt-2.5">
                            {course.link_pertemuan && (
                              <a
                                href={course.link_pertemuan}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#4338ca] hover:bg-[#e0e7ff] transition"
                              >
                                <Video size={12} /> Masuk Meet
                              </a>
                            )}
                            {course.link_materi && (
                              <a
                                href={course.link_materi}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-lg bg-[#f0fdf4] px-2.5 py-1 text-[11px] font-bold text-[#15803d] hover:bg-[#dcfce7] transition"
                              >
                                <FileText size={12} /> Buka Materi
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer (Sticky Bottom) */}
                  <div className="flex items-center justify-end border-t border-[var(--line)] bg-[#fbfcfa] px-6 py-3 shrink-0">
                    <button
                      onClick={() => setActiveItem(null)}
                      className="rounded-xl bg-[#103626] px-5 py-2 text-xs font-bold text-white hover:bg-[#1d5034] transition"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              )}

              {activeItem.type === "activity" && activeItem.activity && (
                <>
                  {/* Header (Sticky Top) */}
                  <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] bg-[#fbfcfa] px-6 py-4 shrink-0">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand)]">
                        {activeItem.activity.kategori.toUpperCase()} · PRIORITAS {activeItem.activity.prioritas.toUpperCase()}
                      </span>
                      <h3 className="font-display text-base sm:text-lg font-extrabold text-[var(--ink)] leading-snug">
                        {activeItem.activity.judul}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveItem(null)}
                      className="rounded-xl p-2 text-[var(--muted)] hover:bg-[#f0f4f1] hover:text-[var(--ink)] transition"
                      title="Tutup"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Body (Scrollable) */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    <div className="space-y-2 rounded-2xl bg-[#fafbf9] p-4 border border-[var(--line)] text-xs">
                      <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
                        <CalendarIcon size={14} className="text-[var(--brand)] shrink-0" />
                        <span>
                          Deadline: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(`${activeItem.activity.deadline}T00:00:00`))}
                          {activeItem.activity.jam_deadline ? ` · ${activeItem.activity.jam_deadline.slice(0, 5)} WIB` : ""}
                        </span>
                      </div>

                      {activeItem.activity.course_id && (
                        <div className="flex items-center gap-2 font-semibold text-[#4338ca]">
                          <BookOpen size={14} className="text-[#4f46e5] shrink-0" />
                          <span>
                            Mata Kuliah: {courses.find((c) => c.id === activeItem.activity?.course_id)?.nama_matkul || "Mata Kuliah"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 font-semibold text-[var(--muted)]">
                        <span>Status:</span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-[var(--line)]">
                          {activeItem.activity.status.replace("_", " ")}
                        </span>
                      </div>

                      {activeItem.activity.catatan && (
                        <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed italic border-t border-[var(--line)] pt-2">
                          “{activeItem.activity.catatan}”
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer (Sticky Bottom) */}
                  <div className="flex items-center justify-end gap-2 border-t border-[var(--line)] bg-[#fbfcfa] px-6 py-3 shrink-0">
                    {activeItem.activity.link_terkait && (
                      <a
                        href={activeItem.activity.link_terkait}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-[#eef2ff] px-4 py-2 text-xs font-bold text-[#4338ca] hover:bg-[#e0e7ff] transition"
                      >
                        <ExternalLink size={13} /> Buka Tautan
                      </a>
                    )}
                    <button
                      onClick={() => setActiveItem(null)}
                      className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[#f0f4f1] transition"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Auto opened Form modal when date is clicked */}
      {selectedDate && (
        <ActivityForm
          key={selectedDate}
          semesters={semesters}
          organizations={organizations}
          programs={programs}
          courses={courses.map((c) => ({
            id: c.id,
            name: c.nama_matkul,
            semester_id: c.semester_id,
            sks: c.sks,
          }))}
          defaultDate={selectedDate}
          initialOpen={true}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

