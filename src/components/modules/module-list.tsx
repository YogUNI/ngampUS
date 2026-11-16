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
      {/* ── 01 // METRIC DOSSIER STRIP ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Total Modul */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 shadow-xs transition hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
              TOTAL ARSIP
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              ARSIP
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {totalModules}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Materi Tersimpan
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
              {courses.length} mata kuliah semester ini
            </p>
          </div>
        </div>

        {/* Card 2: Sudah Dibaca */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 shadow-xs transition hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50">
              {completedRate}% TUNTAS
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              PROGRES
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">
                {readModules}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Modul Selesai
              </span>
            </div>
            {/* Minimalist Progress Meter */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#1c2d22] overflow-hidden border border-slate-200/60 dark:border-[#223528]">
              <div 
                className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${completedRate}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Card 3: Perlu Ditinjau */}
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 shadow-xs transition hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="inline-flex rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50">
              PERSIAPAN
            </span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              REVIEW
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {Math.max(0, totalModules - readModules)}
              </span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Perlu Dipelajari
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
              Siap diuji lewat Tutor & Kuis AI
            </p>
          </div>
        </div>
      </div>

      {/* ── SEARCH & ACTION BAR ── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-3.5 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="relative min-w-[200px] flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi, slide, atau topik..."
              className="w-full rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-slate-50/70 dark:bg-[#16221a] py-2 sm:py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 dark:focus:border-emerald-400 focus:bg-white dark:focus:bg-[#111914] focus:outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {courses.length > 0 && (
              <ModuleFormModal
                courses={courses}
                triggerClass="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 cursor-pointer"
                triggerText="+ Tambah Modul Baru"
              />
            )}
          </div>
        </div>

        {/* ── SUBJECT HORIZONTAL TAB SWITCHER WITH FLOATING SCROLL ARROWS ── */}
        <div className="relative border-t border-slate-100 dark:border-[#1c2d22] pt-3">
          {/* Floating Left Arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white dark:bg-[#1c2d22] text-slate-700 dark:text-slate-200 shadow-md border border-slate-200/80 dark:border-[#2a4032] hover:bg-slate-50 dark:hover:bg-[#25392d] transition active:scale-90 cursor-pointer"
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
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white dark:bg-[#1c2d22] text-slate-700 dark:text-slate-200 shadow-md border border-slate-200/80 dark:border-[#2a4032] hover:bg-slate-50 dark:hover:bg-[#25392d] transition active:scale-90 cursor-pointer"
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
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                selectedCourseTab === "all"
                  ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-black shadow-2xs"
                  : "bg-slate-100 dark:bg-[#16221a] text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-[#1f3024] hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>Semua Matkul</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                selectedCourseTab === "all" ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" : "bg-slate-200/80 dark:bg-[#223528] text-slate-600 dark:text-slate-300"
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
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isTabActive
                      ? "bg-slate-900 text-white dark:bg-emerald-500 dark:text-black shadow-2xs"
                      : "bg-slate-100 dark:bg-[#16221a] text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-[#1f3024] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white/60"
                    style={{ backgroundColor: c.warna_label || "#0f6849" }}
                  />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{c.nama_matkul}</span>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isTabActive ? "bg-white/20 text-white dark:bg-black/20 dark:text-black" : "bg-slate-200/80 dark:bg-[#223528] text-slate-600 dark:text-slate-300"
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
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-1">
            <span>Daftar Mata Kuliah Semester Ini</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Buka Semua
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
              >
                Tutup Semua
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── COURSES GROUPED ACCORDION / LIST CONTENT ── */}
      {courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-8 sm:p-12 text-center shadow-xs">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <BookOpen size={28} />
          </div>
          <h3 className="font-display mt-3 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Belum ada Mata Kuliah di semester ini
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
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
                className="rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] shadow-xs overflow-hidden transition"
              >
                {/* Course Group Accordion Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-slate-50/50 dark:bg-[#16221a] border-b border-slate-100 dark:border-[#1c2d22]">
                  <button
                    type="button"
                    onClick={() => toggleCourseExpand(course.id)}
                    className="flex items-start sm:items-center gap-3 text-left min-w-0 flex-1 group transition active:scale-[0.99] cursor-pointer"
                  >
                    <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white mt-0.5 sm:mt-0 shrink-0 transition">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </span>

                    <span
                      className="h-4 w-4 rounded-full shrink-0 ring-2 ring-white dark:ring-[#111914] shadow-xs mt-1 sm:mt-0"
                      style={{ backgroundColor: course.warna_label || "#0f6849" }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug break-words group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                          {course.nama_matkul}
                        </h2>
                        {course.kode_matkul && (
                          <span className="rounded-md bg-white dark:bg-[#111914] px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#1c2d22] shrink-0">
                            {course.kode_matkul}
                          </span>
                        )}
                        {course.sks && (
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
                            · {course.sks} SKS
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 border-t border-slate-100 dark:border-[#1c2d22] pt-2.5 sm:border-0 sm:pt-0">
                    <span className="rounded-full bg-white dark:bg-[#111914] border border-slate-200/80 dark:border-[#1c2d22] px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400">
                      {courseReadCount}/{courseModules.length} TUNTAS
                    </span>

                    <ModuleFormModal
                      courses={courses}
                      defaultCourseId={course.id}
                      defaultPertemuan={nextPertemuan}
                      triggerText={`+ Pertemuan ${nextPertemuan}`}
                      triggerClass="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-3.5 py-1.5 text-xs font-bold transition active:scale-95 shadow-2xs cursor-pointer"
                    />
                  </div>
                </div>

                {/* ── PERTEMUAN QUICK JUMP CHIPS (When many modules exist) ── */}
                {isExpanded && courseModules.length > 0 && (
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#1c2d22] bg-slate-50/30 dark:bg-[#142018]">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 shrink-0">
                        PERTEMUAN:
                      </span>
                      {courseModules.map((m) => {
                        const isDone = m.status === "sudah_baca" || m.status === "dipelajari";
                        return (
                          <a
                            key={m.id}
                            href={`#module-${m.id}`}
                            className={`grid h-6.5 min-w-[28px] px-2 place-items-center rounded-lg text-[10px] font-bold transition active:scale-95 shrink-0 border ${
                              isDone
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100"
                                : "bg-white dark:bg-[#16221a] text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-[#1c2d22] hover:border-emerald-500"
                            }`}
                            title={`Lompat ke Pertemuan ${m.pertemuan}: ${m.topik}`}
                          >
                            P-{m.pertemuan < 10 ? `0${m.pertemuan}` : m.pertemuan}
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
                      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#1c2d22] bg-slate-50/50 dark:bg-[#16221a] p-6 text-center">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Belum ada modul perkuliahan yang disimpan.
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
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
