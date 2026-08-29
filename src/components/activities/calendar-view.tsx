"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type Activity = { id: string; judul: string; deadline: string | null; prioritas: string; status: string; kategori: string };

export function CalendarView({ activities }: { activities: Activity[] }) {
  const colors: Record<string, string> = { kuliah: "#3b82c4", organisasi: "#0f6849", lomba: "#d99a20", event: "#8055b8", lainnya: "#7b8780" };
  return <div className="surface-lift ngampus-calendar rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5"><FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: "prev,next today", center: "title", right: "" }} height="auto" events={activities.filter((item) => item.deadline && item.status !== "selesai").map((item) => ({ id: item.id, title: item.judul, date: item.deadline!, backgroundColor: colors[item.kategori] || colors.lainnya, borderColor: "transparent" }))}/></div>;
}
