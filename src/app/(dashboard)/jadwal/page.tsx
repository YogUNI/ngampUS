import Link from "next/link";
import { BookOpen, CalendarDays, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ScheduleClientView } from "@/components/schedule/schedule-client-view";
import { CourseData } from "@/components/schedule/course-form-modal";

type Search = { semester_id?: string };

export default async function SchedulePage({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const supabase = await createClient();

  const [
    { data: { user } },
    { data: semesters },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai,is_active").order("tanggal_mulai", { ascending: false }),
  ]);

  const activeSemester = semesters?.find((s) => s.is_active);
  const targetSemesterId = filters.semester_id ?? activeSemester?.id ?? semesters?.[0]?.id ?? null;
  const currentSemester = semesters?.find((s) => s.id === targetSemesterId);

  let courses: (CourseData & { id: string })[] = [];
  let modules: any[] = [];
  if (targetSemesterId) {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("semester_id", targetSemesterId)
      .order("hari", { ascending: true })
      .order("jam_mulai", { ascending: true });
    courses = (data as (CourseData & { id: string })[]) ?? [];

    if (courses.length > 0) {
      const courseIds = courses.map((c) => c.id);
      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("*")
        .in("course_id", courseIds)
        .order("pertemuan", { ascending: true });
      modules = modulesData ?? [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      {/* ── Executive Header for Jadwal ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              AKADEMIK & PERKULIAHAN
            </span>
            {currentSemester && (
              <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                {currentSemester.nama_semester}
              </span>
            )}
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Jadwal Kuliah
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Atur mata kuliah mingguan, pantau ruang kelas, dan akses link kuliah virtual dengan cepat.
          </p>
        </div>

        {/* Instant Semester Filter Form */}
        <form className="flex items-center gap-2 shrink-0">
          <label className="sr-only" htmlFor="jadwal-semester-select">
            Pilih Semester
          </label>
          <div className="relative">
            <select
              id="jadwal-semester-select"
              name="semester_id"
              defaultValue={targetSemesterId ?? ""}
              aria-label="Pilih semester akademik"
              className="appearance-none rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] py-2 pl-3.5 pr-8 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none transition shadow-2xs"
            >
              {semesters?.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-[#111914] text-slate-900 dark:text-slate-100">
                  {s.nama_semester} {s.is_active ? " (Aktif)" : ""}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              ▼
            </span>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-100 dark:bg-[#15231c] px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-[#1c2d22] hover:bg-slate-200 dark:hover:bg-[#1c3026] transition active:scale-95 cursor-pointer"
          >
            Terapkan
          </button>
        </form>
      </header>

      {/* Main Schedule Content */}
      <ScheduleClientView
        courses={courses}
        modules={modules}
        semesters={semesters ?? []}
        activeSemesterId={targetSemesterId ?? undefined}
        semesterDates={
          currentSemester?.tanggal_mulai && currentSemester?.tanggal_selesai
            ? {
                tanggal_mulai: currentSemester.tanggal_mulai,
                tanggal_selesai: currentSemester.tanggal_selesai,
              }
            : undefined
        }
        semesterName={currentSemester?.nama_semester}
      />
    </div>
  );
}
