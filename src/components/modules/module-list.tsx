"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, FolderOpen, Plus, Search, Sparkles } from "lucide-react";
import { CourseModuleData, CourseOption, ModuleFormModal } from "./module-form-modal";
import { ModuleCard } from "./module-card";

export function ModuleList({
  modules,
  courses,
  selectedSemesterName,
}: {
  modules: (CourseModuleData & { id: string })[];
  courses: CourseOption[];
  selectedSemesterName?: string;
}) {
  const [search, setSearch] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(() => {
    // Default expand all
    const init: Record<string, boolean> = {};
    courses.forEach((c) => {
      init[c.id] = true;
    });
    return init;
  });

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // Filter modules
  const filteredModules = modules.filter((m) => {
    const course = courses.find((c) => c.id === m.course_id);
    const courseName = course?.nama_matkul || "";
    const matchesSearch =
      m.topik.toLowerCase().includes(search.toLowerCase()) ||
      (m.deskripsi && m.deskripsi.toLowerCase().includes(search.toLowerCase())) ||
      (m.catatan && m.catatan.toLowerCase().includes(search.toLowerCase())) ||
      courseName.toLowerCase().includes(search.toLowerCase());

    const matchesCourse = selectedCourseFilter === "all" || m.course_id === selectedCourseFilter;

    return matchesSearch && matchesCourse;
  });

  // Calculate stats
  const totalModules = modules.length;
  const readModules = modules.filter((m) => m.status === "sudah_baca" || m.status === "dipelajari").length;
  const completedRate = totalModules > 0 ? Math.round((readModules / totalModules) * 100) : 0;

  return (
    <div className="mt-6 space-y-6">
      {/* Top Stat Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-2xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">TOTAL MODUL</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-[var(--ink)]">
              {totalModules.toString().padStart(2, "0")}
            </span>
            <span className="text-xs font-bold text-[var(--muted)]">pertemuan tersimpan</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-2xs">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">SUDAH DIBACA / DIPELAJARI</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-[var(--brand)]">
              {readModules.toString().padStart(2, "0")}
            </span>
            <span className="text-xs font-bold text-[var(--muted)]">dari {totalModules} materi</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">PROGRESS MATERI</p>
            <span className="text-xs font-black text-[var(--brand)]">{completedRate}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--card-subtle)] border border-[var(--line)]">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
              style={{ width: `${completedRate}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-[var(--muted)] font-semibold">
            {selectedSemesterName ? `Konteks: ${selectedSemesterName}` : "Seluruh semester"}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-3 sm:p-4">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari materi kuliah, topik, atau kata kunci catatan..."
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] py-2 pl-9 pr-3 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-[var(--muted)]">Filter Matkul:</label>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-3 py-2 text-xs font-bold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
          >
            <option value="all">Semua Mata Kuliah ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama_matkul}
              </option>
            ))}
          </select>

          {courses.length > 0 && (
            <ModuleFormModal
              courses={courses}
              triggerText="Tambah Modul"
            />
          )}
        </div>
      </div>

      {/* Courses Grouped Content */}
      {courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--card-bg)] p-8 sm:p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3e5] text-[var(--brand)]">
            <BookOpen size={24} />
          </div>
          <h3 className="font-display mt-3 text-base sm:text-lg font-black text-[var(--ink)]">
            Belum ada Mata Kuliah di semester ini
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)] max-w-md mx-auto">
            Tambahkan mata kuliah terlebih dahulu di menu Jadwal Kuliah agar modul perkuliahan bisa dikelompokkan dengan rapi.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses
            .filter((c) => selectedCourseFilter === "all" || c.id === selectedCourseFilter)
            .map((course) => {
              const courseModules = filteredModules
                .filter((m) => m.course_id === course.id)
                .sort((a, b) => a.pertemuan - b.pertemuan);

              const isExpanded = expandedCourses[course.id] ?? true;
              const nextPertemuan =
                courseModules.length > 0
                  ? Math.max(...courseModules.map((m) => m.pertemuan)) + 1
                  : 1;

              return (
                <section
                  key={course.id}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] shadow-2xs overflow-hidden"
                >
                  {/* Course Group Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-[var(--card-subtle)] border-b border-[var(--line)]">
                    <button
                      type="button"
                      onClick={() => toggleCourseExpand(course.id)}
                      className="flex items-center gap-3 text-left min-w-0 flex-1 hover:opacity-80 transition"
                    >
                      <span className="text-[var(--muted)]">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </span>

                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-white shadow-2xs"
                        style={{ backgroundColor: course.warna_label || "var(--brand)" }}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-display text-sm sm:text-base font-black text-[var(--ink)] truncate">
                            {course.nama_matkul}
                          </h2>
                          {course.kode_matkul && (
                            <span className="rounded-md bg-[var(--card-bg)] px-2 py-0.5 text-[10px] font-black uppercase text-[var(--muted)] border border-[var(--line)]">
                              {course.kode_matkul}
                            </span>
                          )}
                          {course.sks && (
                            <span className="text-[10px] font-bold text-[var(--muted)]">
                              · {course.sks} SKS
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2.5">
                      <span className="rounded-full bg-[var(--card-bg)] px-3 py-1 text-[11px] font-black text-[var(--brand)] border border-[var(--line)]">
                        {courseModules.length} Modul
                      </span>

                      <ModuleFormModal
                        courses={courses}
                        defaultCourseId={course.id}
                        defaultPertemuan={nextPertemuan}
                        triggerText={`+ Pertemuan ${nextPertemuan}`}
                        triggerClass="inline-flex items-center gap-1 rounded-xl bg-[var(--card-bg)] px-3 py-1.5 text-xs font-black text-[var(--brand)] border border-[var(--brand)]/30 hover:bg-[var(--brand)] hover:text-white transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Modules Cards Grid */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5">
                      {courseModules.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--card-subtle)] p-6 text-center">
                          <p className="text-xs font-bold text-[var(--muted)]">
                            Belum ada modul yang dicatat untuk mata kuliah ini.
                          </p>
                          <p className="mt-1 text-[11px] text-[var(--muted)]">
                            Simpan slide, materi PDF, atau link Google Drive dari dosen setiap pertemuan.
                          </p>
                          <div className="mt-3">
                            <ModuleFormModal
                              courses={courses}
                              defaultCourseId={course.id}
                              defaultPertemuan={1}
                              triggerText="Simpan Modul Pertama"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                          {courseModules.map((m) => (
                            <ModuleCard
                              key={m.id}
                              module={m}
                              courses={courses}
                              courseName={course.nama_matkul}
                              courseColor={course.warna_label}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
