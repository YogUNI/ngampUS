"use client";

import { useState } from "react";
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
} from "lucide-react";
import { CourseData, CourseFormModal } from "./course-form-modal";
import { CourseCalendar } from "./course-calendar";
import { generateIcsCalendar } from "@/lib/calendar-utils";
import { deleteCourse } from "@/app/(dashboard)/jadwal/actions";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";

const DAYS = [
  { value: 1, name: "Senin" },
  { value: 2, name: "Selasa" },
  { value: 3, name: "Rabu" },
  { value: 4, name: "Kamis" },
  { value: 5, name: "Jumat" },
  { value: 6, name: "Sabtu" },
];

export function ScheduleClientView({
  courses,
  semesters,
  activeSemesterId,
  semesterDates,
  semesterName,
}: {
  courses: (CourseData & { id: string })[];
  semesters: { id: string; nama_semester: string; is_active: boolean }[];
  activeSemesterId?: string;
  semesterDates?: { tanggal_mulai: string; tanggal_selesai: string };
  semesterName?: string;
}) {
  const [viewMode, setViewMode] = useState<"list" | "grid" | "calendar">("list");
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);

  // Group courses by day
  const coursesByDay = DAYS.map((d) => ({
    ...d,
    items: courses.filter((c) => c.hari === d.value).sort((a, b) => a.jam_mulai.localeCompare(b.jam_mulai)),
  }));

  const totalSks = courses.reduce((acc, c) => acc + (c.sks || 0), 0);

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
    <div>
      {/* Top summary & view switcher bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)]">
              <BookOpen size={18} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">TOTAL BEBAN</p>
              <p className="text-sm font-extrabold text-[var(--ink)]">
                {courses.length} Mata Kuliah <span className="text-[var(--brand)] font-black">({totalSks} SKS)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export to Calendar (.ics) */}
          {courses.length > 0 && (
            <button
              onClick={handleExportIcs}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[#fafbf9] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-white hover:border-[#a9cdb2] transition"
              title="Download file .ics untuk Google Calendar / Apple Calendar"
            >
              <Download size={14} className="text-[var(--brand)]" />
              <span>Export ke Kalender</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex rounded-xl bg-[#f0f4f1] p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "list" ? "bg-white text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Daftar Hari
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "grid" ? "bg-white text-[var(--ink)] shadow-xs" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Tabel Mingguan
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "calendar" ? "bg-white text-[var(--brand)] shadow-xs font-extrabold" : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              Kalender
            </button>
          </div>

          <CourseFormModal
            semesters={semesters}
            activeSemesterId={activeSemesterId}
          />
        </div>
      </div>

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

      {courses.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[var(--line)] bg-white p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#dff3e5] text-[var(--brand)]">
            <BookOpen size={28} />
          </div>
          <h3 className="mt-4 font-display text-xl font-extrabold text-[var(--ink)]">Belum Ada Jadwal Kuliah</h3>
          <p className="mt-1.5 text-xs text-[var(--muted)] max-w-sm mx-auto">
            Masukkan mata kuliah semester ini agar kamu tahu ruang kelas, jadwal dosen, dan link materi setiap hari.
          </p>
          <div className="mt-5 flex justify-center">
            <CourseFormModal
              semesters={semesters}
              activeSemesterId={activeSemesterId}
              triggerText="Tambah Mata Kuliah Pertama"
            />
          </div>
        </div>
      ) : viewMode === "list" ? (
        /* LIST VIEW BY DAY */
        <div className="mt-6 space-y-6">
          {coursesByDay.map((day) => (
            <div key={day.value} className="rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#103626] text-white text-xs font-black">
                    {day.name.slice(0, 2).toUpperCase()}
                  </span>
                  <h3 className="font-display text-base font-extrabold text-[var(--ink)]">{day.name}</h3>
                </div>
                <span className="text-xs font-bold text-[var(--muted)]">
                  {day.items.length === 0 ? "Tidak ada kuliah" : `${day.items.length} Kelas · ${day.items.reduce((acc, i) => acc + i.sks, 0)} SKS`}
                </span>
              </div>

              {day.items.length === 0 ? (
                <p className="py-5 text-center text-xs text-[var(--muted)] italic">
                  Libur / Tidak ada jadwal perkuliahan di hari {day.name}.
                </p>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {day.items.map((course) => (
                    <div
                      key={course.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-[#fafbf9] p-4 transition hover:border-[#a9cdb2] hover:bg-white hover:shadow-sm"
                      style={{ borderLeftColor: course.warna_label, borderLeftWidth: "4px" }}
                    >
                      <div>
                        {/* Top row: Code + SKS + Format */}
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

                        {/* Title */}
                        <h4 className="mt-2 text-sm font-black text-[var(--ink)] leading-snug">
                          {course.nama_matkul}
                        </h4>

                        {/* Time */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[var(--brand)]">
                          <Clock size={13} />
                          <span>
                            {course.jam_mulai.slice(0, 5)} - {course.jam_selesai.slice(0, 5)} WIB
                          </span>
                        </div>

                        {/* Location / Virtual */}
                        {course.ruangan && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <MapPin size={13} className="shrink-0" />
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

                      {/* Bottom quick links & action buttons */}
                      <div className="mt-4 flex items-center justify-between border-t border-[#f0f4f1] pt-3">
                        <div className="flex items-center gap-2">
                          {course.link_pertemuan && (
                            <a
                              href={course.link_pertemuan}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-[#eef2ff] px-2.5 py-1 text-[11px] font-bold text-[#4338ca] hover:bg-[#e0e7ff] transition"
                              title="Masuk Kelas Virtual"
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
                              title="Buka Materi Kuliah"
                            >
                              <FileText size={12} /> Materi
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingCourse(course)}
                            title="Edit Mata Kuliah"
                            className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[#eaf5eb] hover:text-[var(--brand)] transition"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID TIMETABLE VIEW */
        <div className="mt-6 overflow-x-auto rounded-3xl border border-[var(--line)] bg-white p-5 shadow-xs">
          <div className="grid min-w-[700px] grid-cols-6 gap-3">
            {coursesByDay.map((day) => (
              <div key={day.value} className="rounded-2xl border border-[var(--line)] bg-[#fafbf9] p-3">
                <div className="border-b border-[var(--line)] pb-2 text-center">
                  <p className="font-display text-xs font-black uppercase tracking-wider text-[var(--ink)]">
                    {day.name}
                  </p>
                  <p className="text-[10px] text-[var(--muted)] font-bold">{day.items.length} kelas</p>
                </div>

                <div className="mt-3 space-y-2.5">
                  {day.items.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-xl border border-[var(--line)] bg-white p-2.5 text-left shadow-xs transition hover:shadow-sm"
                      style={{ borderTopColor: course.warna_label, borderTopWidth: "3px" }}
                    >
                      <p className="text-xs font-black text-[var(--ink)] leading-snug line-clamp-2">
                        {course.nama_matkul}
                      </p>
                      <p className="mt-1 text-[10px] font-bold text-[var(--brand)]">
                        {course.jam_mulai.slice(0, 5)} - {course.jam_selesai.slice(0, 5)}
                      </p>
                      {course.ruangan && (
                        <p className="mt-0.5 text-[9.5px] text-[var(--muted)] truncate">
                          📍 {course.ruangan}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between border-t border-[#f0f4f1] pt-1.5">
                        <span className="text-[9px] font-extrabold text-[var(--muted)]">{course.sks} SKS</span>
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="text-[10px] font-bold text-[var(--brand)] hover:underline"
                        >
                          Ubah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MONTHLY CALENDAR VIEW */
        <CourseCalendar
          courses={courses}
          tanggalMulai={semesterDates?.tanggal_mulai}
          tanggalSelesai={semesterDates?.tanggal_selesai}
        />
      )}
    </div>
  );
}
