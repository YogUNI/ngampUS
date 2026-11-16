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
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      {/* ── Executive Header for Modul & Arsip Materi ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              ARSIP & RUANG BELAJAR
            </span>
            {currentSemester && (
              <span className="inline-flex rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                {currentSemester.nama_semester}
              </span>
            )}
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Modul & Arsip Materi
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Pusat berkas kuliah, slide presentasi dosen, resume catatan, serta tutor AI pendamping belajar.
          </p>
        </div>

        {/* Archival Semester Selector Form */}
        <form className="flex items-center gap-2 shrink-0">
          <label className="sr-only" htmlFor="semester-selector">
            Pilih Semester
          </label>
          <div className="flex items-center rounded-xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-1.5 shadow-xs">
            <span className="text-[10.5px] font-bold tracking-wider text-slate-500 dark:text-slate-400 px-2 hidden xs:inline-block">
              SEMESTER:
            </span>
            <div className="relative inline-block">
              <select
                id="semester-selector"
                name="semester_id"
                defaultValue={targetSemesterId ?? ""}
                aria-label="Pilih semester akademik"
                className="appearance-none rounded-lg border border-slate-200/80 dark:border-[#1c2d22] bg-slate-50/70 dark:bg-[#16221a] py-1 pl-2.5 pr-7 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {semesters?.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-[#111914] text-slate-900 dark:text-white">
                    {s.nama_semester} {s.is_active ? "★ (Aktif)" : ""}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                ▼
              </span>
            </div>
            <button
              type="submit"
              className="ml-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-3 py-1 text-xs font-bold transition active:scale-95 cursor-pointer shadow-xs"
              title="Pindah semester"
            >
              PILIH
            </button>
          </div>
        </form>
      </header>

      {/* ── Main Module List with Modern Codex Aesthetics ── */}
      <ModuleList
        modules={modules}
        courses={courses}
        selectedSemesterName={currentSemester?.nama_semester}
      />
    </div>
  );
}
