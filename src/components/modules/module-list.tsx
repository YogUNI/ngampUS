"use client";

import { useState, useRef, useEffect } from "react";
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, FolderOpen, Plus, Search, Sparkles } from "lucide-react";
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
  const [selectedCourseTab, setSelectedCourseTab] = useState<string>("all");
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>(() => {
    // Default: expand only first course if multiple courses exist to save vertical space
    const init: Record<string, boolean> = {};
    courses.forEach((c, idx) => {
      init[c.id] = idx === 0 || courses.length === 1;
    });
    return init;
  });

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    courses.forEach((c) => {
      next[c.id] = true;
    });
    setExpandedCourses(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    courses.forEach((c) => {
      next[c.id] = false;
    });
    setExpandedCourses(next);
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

    const matchesCourse = selectedCourseTab === "all" || m.course_id === selectedCourseTab;

    return matchesSearch && matchesCourse;
  });

  // Calculate stats
  const totalModules = modules.length;
  const readModules = modules.filter((m) => m.status === "sudah_baca" || m.status === "dipelajari").length;
  const completedRate = totalModules > 0 ? Math.round((readModules / totalModules) * 100) : 0;

  const coursesToRender = courses.filter(
    (c) => selectedCourseTab === "all" || c.id === selectedCourseTab
  );

  const scrollTabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollTabsRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [courses]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = scrollTabsRef.current;
    if (el) {
      const scrollAmount = direction === "left" ? -180 : 180;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="mt-5 space-y-4 sm:space-y-6">
      {/* ── STREAMLINED STAT STRIP (Aligned Metrics & Progress Bar) ── */}
      <div className="rounded-3xl border border-[#d8e3da] bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Quick Metrics (Strict Vertical Alignment) */}
          <div className="grid grid-cols-3 divide-x divide-[#e8eee9] sm:divide-x-0 sm:flex sm:items-center sm:gap-6 flex-1">
            {/* Total Modul */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left px-1 sm:px-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#697c6f] block min-h-[26px] sm:min-h-[16px] flex items-center justify-center sm:justify-start">
                Total Modul
              </span>
              <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-1">
                <span className="font-display text-xl sm:text-2xl font-black text-[#10261b] leading-none">
                  {totalModules}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#697c6f]">Materi</span>
              </div>
            </div>

            {/* Sudah Dibaca */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left px-1 sm:px-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0f6849] block min-h-[26px] sm:min-h-[16px] flex items-center justify-center sm:justify-start">
                Selesai Dibaca
              </span>
              <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-1">
                <span className="font-display text-xl sm:text-2xl font-black text-[#0f6849] leading-none">
                  {readModules}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#0f6849]">Modul</span>
              </div>
            </div>

            {/* Progress Rate */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left px-1 sm:px-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5c3a9c] block min-h-[26px] sm:min-h-[16px] flex items-center justify-center sm:justify-start">
                Pemahaman
              </span>
              <div className="mt-1 flex items-baseline justify-center sm:justify-start gap-1">
                <span className="font-display text-xl sm:text-2xl font-black text-[#5c3a9c] leading-none">
                  {completedRate}%
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#5c3a9c]">Tuntas</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Semester Context */}
          <div className="sm:max-w-xs w-full pt-3 sm:pt-0 border-t border-[#f0f4f0] sm:border-0 flex flex-col justify-center">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#697c6f] mb-1.5">
              <span>Progress Belajar</span>
              <span className="font-black text-[#0f6849]">{readModules} dari {totalModules} materi</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f0f4f0] border border-[#d8e3da]">
              <div
                className="h-full rounded-full bg-[#0f6849] transition-all duration-500"
                style={{ width: `${completedRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & ACTION BAR ── */}
      <div className="rounded-3xl border border-[#d8e3da] bg-white p-3.5 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d9284] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi, slide, atau topik..."
              className="w-full rounded-2xl border border-[#d8e3da] bg-[#f7f9f7] py-2 sm:py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-[#10261b] placeholder:text-[#8b9e91] focus:border-[#0f6849] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {courses.length > 0 && (
              <ModuleFormModal
                courses={courses}
                triggerClass="inline-flex items-center gap-1.5 rounded-2xl bg-[#103626] px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-[#c8ef70] shadow-md hover:bg-[#1a4a34] transition active:scale-95"
                triggerText="+ Tambah Modul Baru"
              />
            )}
          </div>
        </div>

        {/* ── SUBJECT HORIZONTAL TAB SWITCHER WITH FLOATING SCROLL ARROWS ── */}
        <div className="relative border-t border-[#f0f4f0] pt-3">
          {/* Floating Left Arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#0f6849] shadow-md border border-[#d8e3da] hover:bg-[#dff3e5] transition active:scale-90"
              aria-label="Geser tab ke kiri"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* Floating Right Arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#0f6849] shadow-md border border-[#d8e3da] hover:bg-[#dff3e5] transition active:scale-90"
              aria-label="Geser tab ke kanan"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* Horizontal Scroll Track */}
          <div
            ref={scrollTabsRef}
            onScroll={checkScroll}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            <button
              type="button"
              onClick={() => setSelectedCourseTab("all")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                selectedCourseTab === "all"
                  ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                  : "bg-[#f4f7f4] text-[#55675b] hover:bg-[#eaf1ec] hover:text-[#10261b]"
              }`}
            >
              <span>Semua Matkul</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                selectedCourseTab === "all" ? "bg-[#c8ef70]/20 text-[#c8ef70]" : "bg-[#e2eae4] text-[#55675b]"
              }`}>
                {courses.length}
              </span>
            </button>

            {courses.map((c) => {
              const courseModCount = modules.filter((m) => m.course_id === c.id).length;
              const isTabActive = selectedCourseTab === c.id;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCourseTab(c.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                    isTabActive
                      ? "bg-[#103626] text-[#c8ef70] shadow-2xs"
                      : "bg-[#f4f7f4] text-[#55675b] hover:bg-[#eaf1ec] hover:text-[#10261b]"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white/60"
                    style={{ backgroundColor: c.warna_label || "#0f6849" }}
                  />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{c.nama_matkul}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isTabActive ? "bg-[#c8ef70]/20 text-[#c8ef70]" : "bg-[#e2eae4] text-[#55675b]"
                  }`}>
                    {courseModCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion Expand / Collapse All Controls */}
        {selectedCourseTab === "all" && courses.length > 1 && (
          <div className="flex items-center justify-between text-[11px] font-bold text-[#697c6f] pt-1">
            <span>Daftar Mata Kuliah Semester Ini</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="text-[#0f6849] hover:underline"
              >
                Buka Semua
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-[#697c6f] hover:underline"
              >
                Tutup Semua
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── COURSES GROUPED ACCORDION / LIST CONTENT ── */}
      {courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8e3da] bg-white p-8 sm:p-12 text-center shadow-xs">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f0f4f0] text-[#0f6849]">
            <BookOpen size={28} />
          </div>
          <h3 className="font-display mt-3 text-base sm:text-lg font-black text-[#10261b]">
            Belum ada Mata Kuliah di semester ini
          </h3>
          <p className="mt-1 text-xs text-[#697c6f] max-w-md mx-auto">
            Tambahkan mata kuliah terlebih dahulu di menu Jadwal Kuliah agar materi perkuliahan bisa diarsipkan dengan rapi per mata kuliah.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {coursesToRender.map((course) => {
            const courseModules = filteredModules
              .filter((m) => m.course_id === course.id)
              .sort((a, b) => a.pertemuan - b.pertemuan);

            // In specific course tab, always expand
            const isExpanded = selectedCourseTab !== "all" ? true : (expandedCourses[course.id] ?? true);
            const nextPertemuan =
              courseModules.length > 0
                ? Math.max(...courseModules.map((m) => m.pertemuan)) + 1
                : 1;

            const courseReadCount = courseModules.filter(
              (m) => m.status === "sudah_baca" || m.status === "dipelajari"
            ).length;

            return (
              <section
                key={course.id}
                className="rounded-3xl border border-[#d8e3da] bg-white shadow-xs overflow-hidden transition"
              >
                {/* Course Group Accordion Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-5 bg-[#fafbfa] border-b border-[#f0f4f0]">
                  <button
                    type="button"
                    onClick={() => toggleCourseExpand(course.id)}
                    className="flex items-start sm:items-center gap-2.5 sm:gap-3 text-left min-w-0 flex-1 group transition active:scale-[0.99]"
                  >
                    <span className="text-[#697c6f] group-hover:text-[#10261b] mt-0.5 sm:mt-0 shrink-0 transition">
                      {isExpanded ? <ChevronDown size={19} /> : <ChevronRight size={19} />}
                    </span>

                    <span
                      className="h-3.5 w-3.5 rounded-full shrink-0 ring-2 ring-white shadow-xs mt-1 sm:mt-0"
                      style={{ backgroundColor: course.warna_label || "#0f6849" }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display text-sm sm:text-base font-black text-[#10261b] leading-snug break-words group-hover:text-[#0f6849] transition">
                          {course.nama_matkul}
                        </h2>
                        {course.kode_matkul && (
                          <span className="rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-black uppercase text-[#697c6f] border border-[#d8e3da] shrink-0">
                            {course.kode_matkul}
                          </span>
                        )}
                        {course.sks && (
                          <span className="text-[10px] sm:text-xs font-bold text-[#697c6f] shrink-0">
                            · {course.sks} SKS
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t border-[#f0f4f0] pt-2.5 sm:border-0 sm:pt-0">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10.5px] font-black text-[#0f6849] border border-[#d8e3da]">
                      {courseReadCount}/{courseModules.length} Modul Selesai
                    </span>

                    <ModuleFormModal
                      courses={courses}
                      defaultCourseId={course.id}
                      defaultPertemuan={nextPertemuan}
                      triggerText={`+ Pertemuan ${nextPertemuan}`}
                      triggerClass="inline-flex items-center gap-1 rounded-xl bg-[#0f6849] px-3 py-1.5 text-[11px] sm:text-xs font-black text-white hover:bg-[#0c4e37] transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* ── PERTEMUAN QUICK JUMP CHIPS (When many modules exist) ── */}
                {isExpanded && courseModules.length > 0 && (
                  <div className="px-4 pt-3 pb-1 border-b border-[#f0f4f0] bg-white">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#697c6f] shrink-0 mr-1">
                        Pertemuan:
                      </span>
                      {courseModules.map((m) => {
                        const isDone = m.status === "sudah_baca" || m.status === "dipelajari";
                        return (
                          <a
                            key={m.id}
                            href={`#module-${m.id}`}
                            className={`grid h-6 min-w-[24px] px-1.5 place-items-center rounded-lg text-[10px] font-black transition active:scale-95 shrink-0 border ${
                              isDone
                                ? "bg-[#dff3e5] text-[#0f6849] border-[#b9ddc6]"
                                : "bg-[#f4f7f4] text-[#697c6f] border-[#d8e3da] hover:bg-white"
                            }`}
                            title={`Lompat ke Pertemuan ${m.pertemuan}: ${m.topik}`}
                          >
                            P{m.pertemuan}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Modules Cards Grid */}
                {isExpanded && (
                  <div className="p-4 sm:p-5">
                    {courseModules.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#d8e3da] bg-[#fafbfa] p-6 text-center">
                        <p className="text-xs font-bold text-[#697c6f]">
                          Belum ada modul perkuliahan yang disimpan.
                        </p>
                        <p className="mt-1 text-[11px] text-[#8b9e91]">
                          Simpan slide dosen, link materi, atau rangkuman pertemuan kuliah ini.
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
                          <div key={m.id} id={`module-${m.id}`}>
                            <ModuleCard
                              module={m}
                              courses={courses}
                              courseName={course.nama_matkul}
                              courseColor={course.warna_label}
                            />
                          </div>
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
