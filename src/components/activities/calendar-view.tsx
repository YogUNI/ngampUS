"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

type Activity = { id: string; judul: string; deadline: string | null; prioritas: string; status: string };

export function CalendarView({ activities }: { activities: Activity[] }) {
  return <div className="ngampus-calendar rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5"><FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: "prev,next today", center: "title", right: "" }} height="auto" events={activities.filter((item) => item.deadline && item.status !== "selesai").map((item) => ({ id: item.id, title: item.judul, date: item.deadline!, backgroundColor: item.prioritas === "tinggi" ? "#e87152" : item.prioritas === "rendah" ? "#8aa99b" : "#1f6a48", borderColor: "transparent" }))}/></div>;
}
