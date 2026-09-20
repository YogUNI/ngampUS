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
    <div className="mx-auto max-w-6xl px-3.5 py-6 sm:px-8 sm:py-8 lg:px-10">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[.18em] text-[var(--brand)]">
            AKADEMIK &amp; PERKULIAHAN
          </p>
          <h1 className="font-display mt-0.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
            Jadwal Kuliah
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Atur mata kuliah mingguan, pantau ruang kelas, dan akses link kuliah virtual dengan cepat.
          </p>
        </div>

        {/* Semester Filter */}
        <form className="flex items-end gap-2 shrink-0">
          <label className="block text-xs font-bold text-[var(--ink)]">
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">Semester</span>
            <select
              name="semester_id"
              defaultValue={targetSemesterId ?? ""}
              className="mt-1 block min-w-[170px] sm:min-w-[190px] rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs font-bold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
            >
              {semesters?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_semester} {s.is_active ? " (Aktif)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[#103626] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#1d5034] transition shrink-0"
          >
            Pilih
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
