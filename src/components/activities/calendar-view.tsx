"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { ActivityForm } from "./activity-form";

type Activity = {
  id: string;
  judul: string;
  deadline: string | null;
  jam_deadline?: string | null;
  prioritas: string;
  status: string;
  kategori: string;
  jenis_item: string;
};

type Option = { id: string; name: string; active?: boolean };
type ProgramOption = { id: string; name: string; organization_id?: string | null };

export function CalendarView({
  activities,
  semesters = [],
  organizations = [],
  programs = [],
}: {
  activities: Activity[];
  semesters?: Option[];
  organizations?: Option[];
  programs?: ProgramOption[];
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const colors: Record<string, string> = {
    kuliah: "#3b82c4",
    organisasi: "#0f6849",
    lomba: "#d99a20",
    event: "#8055b8",
    lainnya: "#5e6b63",
  };

  // Map all activities with deadlines into events (including completed ones with muted styling)
  const calendarEvents = activities
    .filter((item) => !!item.deadline)
    .map((item) => {
      const isSelesai = item.status === "selesai";
      const isOnProgress = item.status === "on_progress";

      return {
        id: item.id,
        title: isSelesai ? `✓ ${item.judul}` : item.judul,
        date: item.deadline!,
        backgroundColor: isSelesai
          ? "#c5cfc8" // Abu-abu pudar untuk kegiatan yang sudah selesai
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
          status: item.status,
          kategori: item.kategori,
          jam: item.jam_deadline,
        },
      };
    });

  return (
    <div className="surface-lift ngampus-calendar rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5">
      {/* Legend & Guidance Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-extrabold text-[var(--ink)]">Keterangan:</span>
          <span className="flex items-center gap-1 font-semibold text-[var(--muted)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#3b82c4]" /> Kuliah
          </span>
          <span className="flex items-center gap-1 font-semibold text-[var(--muted)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0f6849]" /> Organisasi
          </span>
          <span className="flex items-center gap-1 font-semibold text-[var(--muted)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d99a20]" /> Lomba
          </span>
          <span className="flex items-center gap-1 font-semibold text-[var(--muted)]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#8055b8]" /> Event
          </span>
          <span className="flex items-center gap-1 font-bold text-[#627067] bg-[#eef2ee] px-2 py-0.5 rounded-md">
            <span className="h-2.5 w-2.5 rounded-full bg-[#a8b5ac]" /> Selesai (Abu-abu Pudar)
          </span>
        </div>

        <p className="text-[11px] text-[var(--muted)] hidden md:block">
          💡 Klik kotak tanggal untuk menambah agenda/tugas di hari itu.
        </p>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        height="auto"
        selectable={true}
        dateClick={(info) => {
          setSelectedDate(info.dateStr);
        }}
        events={calendarEvents}
      />

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
