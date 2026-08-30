"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ActivityForm } from "./activity-form";

type Activity = { id: string; judul: string; deadline: string | null; prioritas: string; status: string; kategori: string };
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
  const colors: Record<string, string> = { kuliah: "#3b82c4", organisasi: "#0f6849", lomba: "#d99a20", event: "#8055b8", lainnya: "#7b8780" };

  return (
    <div className="surface-lift ngampus-calendar rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
        <p className="text-xs font-bold text-[var(--muted)]">
          💡 <span className="font-extrabold text-[var(--ink)]">Tips:</span> Klik salah satu kotak tanggal pada kalender untuk langsung menjadwalkan rapat atau tugas di hari tersebut.
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
        events={activities
          .filter((item) => item.deadline && item.status !== "selesai")
          .map((item) => ({
            id: item.id,
            title: item.judul,
            date: item.deadline!,
            backgroundColor: colors[item.kategori] || colors.lainnya,
            borderColor: "transparent",
          }))}
      />

      {/* Hidden triggered Form when date is clicked */}
      {selectedDate && (
        <div className="mt-4 flex justify-end">
          <ActivityForm
            key={selectedDate}
            semesters={semesters}
            organizations={organizations}
            programs={programs}
            defaultDate={selectedDate}
            triggerText={`Jadwalkan di ${selectedDate}`}
            triggerClass="inline-flex items-center gap-2 rounded-xl bg-[#0f6849] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0a432f]"
          />
        </div>
      )}
    </div>
  );
}
