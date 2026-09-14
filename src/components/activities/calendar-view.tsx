"use client";

import { useState, useMemo } from "react";
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
        backgroundColor: "#0f6849", // Brand green ngampUS
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
          <span className="font-extrabold text-[var(--ink)]">Filter Tampilan:</span>

          {/* Toggle Matkul */}
          <button
            onClick={() => setShowCourses((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
              showCourses
                ? "bg-[#0f6849] text-white shadow-2xs"
                : "bg-[#f0f4f1] text-[var(--muted)] opacity-60 line-through"
            }`}
          >
            <span>📚 Jadwal Kuliah ({courses.length})</span>
          </button>

          {/* Toggle Kegiatan/Tugas */}
          <button
            onClick={() => setShowActivities((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition ${
              showActivities
                ? "bg-[#3b82c4] text-white shadow-2xs"
                : "bg-[#f0f4f1] text-[var(--muted)] opacity-60 line-through"
            }`}
          >
            <span>Tugas & Komitmen ({activities.length})</span>
          </button>

          <span className="hidden lg:inline-block h-4 w-px bg-[var(--line)] mx-1" />

          {/* Legend dots */}
          <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-[var(--muted)] font-medium">
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
          💡 Klik event untuk lihat detail · Klik kotak tanggal untuk buat tugas
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

      {/* Detail Popover Modal when clicking event */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {activeItem.type === "course_group" && activeItem.courses && (
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dff3e5] text-[var(--brand)]">
                      <BookOpen size={20} />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand)]">
                        JADWAL KULIAH HARI INI
                      </span>
                      <h3 className="font-display text-lg font-extrabold text-[var(--ink)] leading-snug">
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
                    className="rounded-xl p-1.5 text-[var(--muted)] hover:bg-[#f0f4f1] hover:text-[var(--ink)]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="mt-3 text-xs text-[var(--muted)]">
                  Terdapat <strong className="text-[var(--ink)]">{activeItem.courses.length} mata kuliah</strong> yang berlangsung pada hari ini:
                </p>

                {/* List of courses for this day */}
                <div className="mt-3 space-y-3">
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

                      <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[var(--brand)]">
                        <Clock size={13} />
                        <span>
                          {course.jam_mulai.slice(0, 5)} - {course.jam_selesai.slice(0, 5)} WIB
                        </span>
                      </div>

                      {course.ruangan && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <MapPin size={13} className="shrink-0 text-[var(--brand)]" />
                          <span className="truncate">{course.ruangan}</span>
                        </div>
                      )}

                      {course.dosen_pengampu && (
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <User size={13} className="shrink-0 text-[var(--brand)]" />
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

                <div className="mt-5 text-right border-t border-[var(--line)] pt-3">
                  <button
                    onClick={() => setActiveItem(null)}
                    className="rounded-xl bg-[#103626] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d5034] transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}

            {activeItem.type === "activity" && activeItem.activity && (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand)]">
                      {activeItem.activity.kategori.toUpperCase()} · PRIORITAS {activeItem.activity.prioritas.toUpperCase()}
                    </span>
                    <h3 className="font-display text-lg font-extrabold text-[var(--ink)] leading-snug">
                      {activeItem.activity.judul}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveItem(null)}
                    className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#f0f4f1] hover:text-[var(--ink)]"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl bg-[#fafbf9] p-3.5 border border-[var(--line)] text-xs">
                  <div className="flex items-center gap-2 font-bold text-[var(--ink)]">
                    <CalendarIcon size={14} className="text-[var(--brand)] shrink-0" />
                    <span>
                      Deadline: {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(`${activeItem.activity.deadline}T00:00:00`))}
                      {activeItem.activity.jam_deadline ? ` · ${activeItem.activity.jam_deadline.slice(0, 5)} WIB` : ""}
                    </span>
                  </div>

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

                <div className="mt-4 flex items-center justify-end gap-2">
                  {activeItem.activity.link_terkait && (
                    <a
                      href={activeItem.activity.link_terkait}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl bg-[#eef2ff] px-3.5 py-2 text-xs font-bold text-[#4338ca] hover:bg-[#e0e7ff] transition"
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auto opened Form modal when date is clicked */}
      {selectedDate && (
        <ActivityForm
          key={selectedDate}
          semesters={semesters}
          organizations={organizations}
          programs={programs}
          defaultDate={selectedDate}
          initialOpen={true}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}

