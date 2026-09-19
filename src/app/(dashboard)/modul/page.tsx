import Link from "next/link";
import { BookOpen, FolderOpen, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleList } from "@/components/modules/module-list";
import { CourseModuleData, CourseOption } from "@/components/modules/module-form-modal";

type SearchParams = {
  semester_id?: string;
};

export default async function ModulPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filters = await searchParams;
  const supabase = await createClient();

  const [
    {
      data: { user },
    },
    { data: semesters },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("semesters")
      .select("id,nama_semester,tanggal_mulai,tanggal_selesai,is_active")
      .order("tanggal_mulai", { ascending: false }),
  ]);

  const activeSemester = semesters?.find((s) => s.is_active);
  const targetSemesterId = filters.semester_id ?? activeSemester?.id ?? semesters?.[0]?.id ?? null;
  const currentSemester = semesters?.find((s) => s.id === targetSemesterId);

  let courses: CourseOption[] = [];
  let modules: (CourseModuleData & { id: string })[] = [];

  if (targetSemesterId) {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id,nama_matkul,kode_matkul,sks,warna_label,semester_id")
      .eq("semester_id", targetSemesterId)
      .order("hari", { ascending: true })
      .order("jam_mulai", { ascending: true });

    courses = coursesData ?? [];

    if (courses.length > 0) {
      const courseIds = courses.map((c) => c.id);
      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("*")
        .in("course_id", courseIds)
        .order("pertemuan", { ascending: true });

      modules = (modulesData as (CourseModuleData & { id: string })[]) ?? [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--brand)]">
            ARSIP AKADEMIK &amp; PERKULIAHAN
          </p>
          <h1 className="font-display mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
            Modul &amp; Materi Kuliah
          </h1>
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            Simpan slide dosen, link Google Drive, materi PDF, dan resume catatan tiap pertemuan kuliah.
          </p>
        </div>

        {/* Semester Selector Form */}
        <form className="flex items-end gap-2">
          <label className="block text-xs font-bold text-[var(--ink)]">
            Semester
            <select
              name="semester_id"
              defaultValue={targetSemesterId ?? ""}
              className="mt-1 block min-w-[190px] rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs font-bold text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden"
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
            className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--card-subtle)] transition"
          >
            Pilih
          </button>
        </form>
      </header>

      {/* Module List with filtering, stats, & course grouping */}
      <ModuleList
        modules={modules}
        courses={courses}
        selectedSemesterName={currentSemester?.nama_semester}
      />
    </div>
  );
}
