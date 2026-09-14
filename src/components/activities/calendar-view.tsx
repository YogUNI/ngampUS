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
    type: "course" | "activity";
    course?: CourseOccurrence;
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

  // 3. Map course occurrences into calendar events
  const courseEvents = useMemo(() => {
    return courseOccurrences.map((occ) => ({
      id: `crs-${occ.id}`,
      title: `📚 ${occ.nama_matkul} (${occ.jam_mulai.slice(0, 5)})`,
      date: occ.dateString,
      backgroundColor: occ.warna_label || "#0f6849",
      borderColor: "transparent",
      textColor: "#ffffff",
      classNames: ["cal-event-course"],
      extendedProps: {
        itemType: "course" as const,
        data: occ,
      },
    }));
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
          const { itemType, data } = info.event.extendedProps;
          if (itemType === "course") {
            setActiveItem({ type: "course", course: data });
          } else if (itemType === "activity") {
            setActiveItem({ type: "activity", activity: data });
          }
        }}
        events={allEvents}
      />

      {/* Detail Popover Modal when clicking event */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-white p-6 shadow-2xl">
            {activeItem.type === "course" && activeItem.course && (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
                      <BookOpen size={18} />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[var(--brand)]">
                        MATA KULIAH · {activeItem.course.sks} SKS
                      </span>
                      <h3 className="font-display text-lg font-extrabold text-[var(--ink)] leading-snug">
                        {activeItem.course.nama_matkul}
                      </h3>
                    </div>
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
                    <Clock size={14} className="text-[var(--brand)] shrink-0" />
                    <span>
                      {activeItem.course.jam_mulai.slice(0, 5)} - {activeItem.course.jam_selesai.slice(0, 5)} WIB
                    </span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-[var(--line)]">
                      {activeItem.course.tipe_pertemuan}
                    </span>
                  </div>

                  {activeItem.course.ruangan && (
                    <div className="flex items-center gap-2 text-[var(--muted)] font-semibold">
                      <MapPin size={14} className="shrink-0 text-[var(--brand)]" />
                      <span>{activeItem.course.ruangan}</span>
                    </div>
                  )}

                  {activeItem.course.dosen_pengampu && (
                    <div className="flex items-center gap-2 text-[var(--muted)] font-semibold">
                      <User size={14} className="shrink-0 text-[var(--brand)]" />
                      <span>Dosen: {activeItem.course.dosen_pengampu}</span>
                    </div>
                  )}
                </div>

                {/* Direct Action Links */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {activeItem.course.link_pertemuan && (
                    <a
                      href={activeItem.course.link_pertemuan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#eef2ff] px-4 py-2 text-xs font-bold text-[#4338ca] hover:bg-[#e0e7ff] transition"
                    >
                      <Video size={14} /> Masuk Meet
                    </a>
                  )}
                  {activeItem.course.link_materi && (
                    <a
                      href={activeItem.course.link_materi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#f0fdf4] px-4 py-2 text-xs font-bold text-[#15803d] hover:bg-[#dcfce7] transition"
                    >
                      <FileText size={14} /> Buka Materi
                    </a>
                  )}
                </div>

                <div className="mt-4 text-right">
                  <button
                    onClick={() => setActiveItem(null)}
                    className="rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[#f0f4f1] transition"
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

