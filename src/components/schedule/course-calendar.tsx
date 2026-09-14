"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Video,
  FileText,
  Calendar as CalendarIcon,
} from "lucide-react";
import { CourseData } from "./course-form-modal";
import {
  CourseOccurrence,
  generateCourseOccurrences,
} from "@/lib/calendar-utils";

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function CourseCalendar({
  courses,
  tanggalMulai,
  tanggalSelesai,
}: {
  courses: (CourseData & { id: string })[];
  tanggalMulai?: string | null;
  tanggalSelesai?: string | null;
}) {
  const occurrences = useMemo(
    () => generateCourseOccurrences(courses, tanggalMulai, tanggalSelesai),
    [courses, tanggalMulai, tanggalSelesai]
  );

  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (tanggalMulai) {
      const s = new Date(`${tanggalMulai}T00:00:00`);
      const e = tanggalSelesai ? new Date(`${tanggalSelesai}T23:59:59`) : s;
      if (today >= s && today <= e) return today.getFullYear();
      return s.getFullYear();
    }
    return today.getFullYear();
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (tanggalMulai) {
      const s = new Date(`${tanggalMulai}T00:00:00`);
      const e = tanggalSelesai ? new Date(`${tanggalSelesai}T23:59:59`) : s;
      if (today >= s && today <= e) return today.getMonth();
      return s.getMonth();
    }
    return today.getMonth();
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isInSemester: boolean;
    }[] = [];

    const pad = (n: number) => String(n).padStart(2, "0");

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${pad(prevMonth + 1)}-${pad(d)}`;
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: false,
        isInSemester: false,
      });
    }

    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const semStart = tanggalMulai ? `${tanggalMulai}` : "";
    const semEnd = tanggalSelesai ? `${tanggalSelesai}` : "";

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(i)}`;
      const inSemester =
        (!semStart || dateStr >= semStart) && (!semEnd || dateStr <= semEnd);

      days.push({
        dayNumber: i,
        dateString: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isInSemester: inSemester,
      });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const dateStr = `${nextYear}-${pad(nextMonth + 1)}-${pad(i)}`;
        days.push({
          dayNumber: i,
          dateString: dateStr,
          isCurrentMonth: false,
          isToday: false,
          isInSemester: false,
        });
      }
    }

    return days;
  }, [currentYear, currentMonth, tanggalMulai, tanggalSelesai, today]);

  const occurrencesByDate = useMemo(() => {
    const map = new Map<string, CourseOccurrence[]>();
    for (const occ of occurrences) {
      const list = map.get(occ.dateString) || [];
      list.push(occ);
      map.set(occ.dateString, list);
    }
    return map;
  }, [occurrences]);

  const selectedCourses = selectedDate
    ? occurrencesByDate.get(selectedDate) || []
    : [];

  const selectedFormattedDate = selectedDate
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${selectedDate}T00:00:00`))
    : "";

  return (
    <div className="mt-6 space-y-6">
      {/* Calendar Header / Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--line)] bg-white p-5 shadow-xs">
        <div>
          <h3 className="font-display text-lg sm:text-xl font-extrabold text-[var(--ink)] flex items-center gap-2">
            <span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
            <span className="rounded-full bg-[#f0f4f1] px-2.5 py-0.5 text-[11px] font-bold text-[var(--brand)]">
              {occurrences.length} Total Pertemuan
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {tanggalMulai && tanggalSelesai
              ? `Jadwal aktif tergenerate otomatis: ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${tanggalMulai}T00:00:00`))} — ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${tanggalSelesai}T00:00:00`))}`
              : "Atur tanggal mulai & selesai semester untuk mengaktifkan rentang kalender."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentYear(today.getFullYear());
              setCurrentMonth(today.getMonth());
            }}
            className="rounded-xl border border-[var(--line)] bg-[#fafbf9] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-white hover:border-[#a9cdb2] transition"
          >
            Bulan Ini
          </button>
          <div className="flex items-center rounded-xl border border-[var(--line)] bg-white p-0.5">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#f0f4f1] hover:text-[var(--ink)] transition"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#f0f4f1] hover:text-[var(--ink)] transition"
              title="Bulan Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Grid */}
      <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white shadow-xs">
        {/* Day name headers */}
        <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[#fafbf9] text-center">
          {DAY_NAMES.map((name, i) => (
            <div
              key={name}
              className={`py-2.5 text-xs font-black uppercase tracking-wider ${
                i === 0 ? "text-rose-500" : i === 6 ? "text-amber-600" : "text-[var(--muted)]"
              }`}
            >
              {name}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#f0f4f1]">
          {calendarDays.map((cell) => {
            const dayOccurrences = occurrencesByDate.get(cell.dateString) || [];
            const hasCourses = dayOccurrences.length > 0;
            const isSelected = selectedDate === cell.dateString;

            return (
              <button
                key={cell.dateString}
                onClick={() => {
                  if (hasCourses) {
                    setSelectedDate(isSelected ? null : cell.dateString);
                  }
                }}
                disabled={!hasCourses}
                className={`group relative flex min-h-[72px] sm:min-h-[105px] flex-col p-1.5 sm:p-2.5 text-left transition ${
                  !cell.isCurrentMonth
                    ? "bg-[#fafaf9] opacity-40"
                    : !cell.isInSemester
                    ? "bg-[#fbfbfb] opacity-60"
                    : "bg-white hover:bg-[#f5faf6]"
                } ${isSelected ? "ring-2 ring-inset ring-[var(--brand)] bg-[#eef7f1]" : ""} ${
                  hasCourses ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black transition ${
                      cell.isToday
                        ? "bg-[var(--brand)] text-white shadow-xs"
                        : cell.isCurrentMonth
                        ? "text-[var(--ink)] group-hover:text-[var(--brand)]"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {hasCourses && (
                    <span className="hidden sm:inline-block rounded-md bg-[#eef5ee] px-1.5 py-0.5 text-[9.5px] font-black text-[var(--brand)]">
                      {dayOccurrences.length} kls
                    </span>
                  )}
                </div>

                {/* Courses in this day */}
                <div className="mt-1 sm:mt-1.5 flex flex-col gap-1 w-full overflow-hidden">
                  {/* Desktop: Colored pill with title & time */}
                  <div className="hidden sm:flex flex-col gap-1 w-full">
                    {dayOccurrences.slice(0, 3).map((occ) => (
                      <div
                        key={occ.id}
                        className="flex items-center justify-between rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs truncate transition group-hover:opacity-90"
                        style={{ backgroundColor: occ.warna_label }}
                        title={`${occ.nama_matkul} (${occ.jam_mulai.slice(0, 5)} - ${occ.jam_selesai.slice(0, 5)})`}
                      >
                        <span className="truncate">{occ.nama_matkul}</span>
                        <span className="shrink-0 text-[9px] font-mono opacity-90 pl-1">
                          {occ.jam_mulai.slice(0, 5)}
                        </span>
                      </div>
                    ))}
                    {dayOccurrences.length > 3 && (
                      <span className="text-[9px] font-black text-[var(--muted)] pl-0.5">
                        +{dayOccurrences.length - 3} lagi...
                      </span>
                    )}
                  </div>

                  {/* Mobile: Dots indication */}
                  <div className="flex sm:hidden flex-wrap items-center gap-1 mt-1">
                    {dayOccurrences.slice(0, 4).map((occ) => (
                      <span
                        key={occ.id}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: occ.warna_label }}
                        title={occ.nama_matkul}
                      />
                    ))}
                    {dayOccurrences.length > 4 && (
                      <span className="text-[8px] font-black text-[var(--muted)]">
                        +{dayOccurrences.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDate && selectedCourses.length > 0 && (
        <div className="rounded-3xl border border-[var(--brand)]/30 bg-[#f5faf6] p-5 sm:p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d8ecd9] pb-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--brand)] text-white">
                <CalendarIcon size={16} />
              </span>
              <div>
                <h4 className="font-display text-base font-extrabold text-[var(--ink)]">
                  {selectedFormattedDate}
                </h4>
                <p className="text-xs font-bold text-[var(--brand)]">
                  {selectedCourses.length} Mata Kuliah Terjadwal
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] shadow-2xs transition"
            >
              Tutup Rincian ✕
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedCourses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-4 shadow-xs"
                style={{ borderLeftColor: c.warna_label, borderLeftWidth: "4px" }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">
                      {c.kode_matkul || "MATKUL"} · {c.sks} SKS
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider ${
                        c.tipe_pertemuan === "online"
                          ? "bg-[#e0e7ff] text-[#3730a3]"
                          : c.tipe_pertemuan === "hybrid"
                          ? "bg-[#fef3c7] text-[#92400e]"
                          : "bg-[#dcfce7] text-[#166534]"
                      }`}
                    >
                      {c.tipe_pertemuan}
                    </span>
                  </div>

                  <h5 className="mt-2 text-sm font-black text-[var(--ink)] leading-snug">
                    {c.nama_matkul}
                  </h5>

                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[var(--brand)]">
                    <Clock size={13} />
                    <span>
                      {c.jam_mulai.slice(0, 5)} - {c.jam_selesai.slice(0, 5)} WIB
                    </span>
                  </div>

                  {c.ruangan && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <MapPin size={13} className="shrink-0" />
                      <span className="truncate">{c.ruangan}</span>
                    </div>
                  )}

                  {c.dosen_pengampu && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <User size={13} className="shrink-0" />
                      <span className="truncate">{c.dosen_pengampu}</span>
                    </div>
                  )}
                </div>

                {(c.link_pertemuan || c.link_materi) && (
                  <div className="mt-4 flex items-center gap-2 border-t border-[#f0f4f1] pt-3">
                    {c.link_pertemuan && (
                      <a
                        href={c.link_pertemuan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#4338ca] hover:bg-[#e0e7ff] transition"
                      >
                        <Video size={12} /> Masuk Meet
                      </a>
                    )}
                    {c.link_materi && (
                      <a
                        href={c.link_materi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#f0fdf4] px-2.5 py-1 text-[11px] font-bold text-[#15803d] hover:bg-[#dcfce7] transition"
                      >
                        <FileText size={12} /> Materi
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

