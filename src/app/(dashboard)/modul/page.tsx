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
      {/* ── Executive Header for Modul ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#0f6849]">
              ARSIP AKADEMIK & PERKULIAHAN
            </span>
            {currentSemester && (
              <span className="inline-flex rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0f6849] border border-[#b9ddc6]">
                {currentSemester.nama_semester}
              </span>
            )}
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#10261b]">
            Modul & Materi Kuliah
          </h1>
          <p className="mt-0.5 text-xs text-[#697c6f]">
            Koleksi slide dosen, berkas PDF, link Google Drive, dan catatan resume perkuliahan.
          </p>
        </div>

        {/* Instant Semester Selector Form */}
        <form className="flex items-center gap-2 shrink-0">
          <label className="sr-only" htmlFor="semester-selector">
            Pilih Semester
          </label>
          <div className="relative">
            <select
              id="semester-selector"
              name="semester_id"
              defaultValue={targetSemesterId ?? ""}
              aria-label="Pilih semester akademik"
              className="appearance-none rounded-2xl border border-[#d8e3da] bg-white py-2 pl-3.5 pr-8 text-xs font-bold text-[#10261b] focus:border-[#0f6849] focus:outline-none transition shadow-2xs"
            >
              {semesters?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama_semester} {s.is_active ? " (Aktif)" : ""}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#697c6f]">
              ▼
            </span>
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-[#f0f4f0] px-3.5 py-2 text-xs font-black text-[#0f6849] border border-[#d8e3da] hover:bg-[#dff3e5] transition active:scale-95"
          >
            Terapkan
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
