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
    supabase.from("semesters").select("id,nama_semester,is_active").order("tanggal_mulai", { ascending: false }),
  ]);

  const activeSemester = semesters?.find((s) => s.is_active);
  const targetSemesterId = filters.semester_id ?? activeSemester?.id ?? semesters?.[0]?.id ?? null;
  const currentSemester = semesters?.find((s) => s.id === targetSemesterId);

  let courses: (CourseData & { id: string })[] = [];
  if (targetSemesterId) {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("semester_id", targetSemesterId)
      .order("hari", { ascending: true })
      .order("jam_mulai", { ascending: true });
    courses = (data as (CourseData & { id: string })[]) ?? [];
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      {/* Page Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand)]">
            AKADEMIK &amp; PERKULIAHAN
          </p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
            Jadwal Kuliah
          </h1>
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Atur mata kuliah mingguan, pantau ruang kelas, dan akses link kuliah virtual dengan cepat.
          </p>
        </div>

        {/* Semester Filter */}
        <form className="flex items-end gap-2">
          <label className="block text-xs font-bold text-[var(--ink)]">
            Semester
            <select
              name="semester_id"
              defaultValue={targetSemesterId ?? ""}
              className="mt-1 block min-w-[190px] rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold"
            >
              {semesters?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_semester} {s.is_active ? "(Aktif)" : ""}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-xl bg-[#103626] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d5034] transition"
          >
            Pilih
          </button>
        </form>
      </header>

      {/* Main Schedule Content */}
      <ScheduleClientView
        courses={courses}
        semesters={semesters ?? []}
        activeSemesterId={targetSemesterId ?? undefined}
      />
    </div>
  );
}
