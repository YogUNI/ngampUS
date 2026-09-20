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
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-7 lg:px-10">
      {/* ── 00 // HERO BANNER: CAMPUS CODEX & ARCHIVAL STUDY DECK ── */}
      <section 
        className="dashboard-atelier-hero relative overflow-hidden rounded-[2rem] p-5 sm:p-7 md:p-8 text-white shadow-xl"
        style={{ backgroundColor: "#0c2419", color: "#ffffff" }}
      >
        {/* Archival Texture & Millimeter Blueprint Grid */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(90deg, #c8ef70 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        {/* Ambient Radial Glowing Orbs */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #c8ef70 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full opacity-15 blur-2xl"
          style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="stamp-badge border-[#c8ef70]/40 text-[#c8ef70]"
                style={{ backgroundColor: "rgba(200, 239, 112, 0.15)", color: "#d6f792" }}
              >
                CAMPUS CODEX // 04
              </span>
              <span className="tag-mono text-[10px] text-[#9dc5aa]">
                // {currentSemester ? currentSemester.nama_semester : "ARSIP SEMESTER"}
              </span>
            </div>
            
            <h1 className="font-display mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-xs">
              Modul & Arsip Materi
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#b3d3bd] max-w-xl leading-relaxed">
              Pusat berkas kuliah, slide presentasi dosen, resume catatan, serta tutor AI pendamping belajar ujian.
            </p>
          </div>

          {/* Archival Semester Ticket Selector Form */}
          <form className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <label className="sr-only" htmlFor="semester-selector">
              Pilih Semester
            </label>
            <div 
              className="flex items-center rounded-2xl border border-white/15 p-1.5 sm:px-3 sm:py-1.5 shadow-inner"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <span className="tag-mono mr-2 text-[10px] font-bold text-[#9dc5aa] hidden xs:inline-block">
                SEMESTER:
              </span>
              <select
                id="semester-selector"
                name="semester_id"
                defaultValue={targetSemesterId ?? ""}
                aria-label="Pilih semester akademik"
                className="rounded-xl border-0 bg-transparent py-1 pl-1 pr-6 text-xs font-black text-white focus:outline-none cursor-pointer [color-scheme:dark]"
              >
                {semesters?.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0c2419] text-white">
                    {s.nama_semester} {s.is_active ? "★" : ""}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="ml-1 rounded-xl bg-[#c8ef70] px-3 py-1 text-xs font-black text-[#103626] hover:bg-[#d9f788] transition active:scale-95 shadow-2xs"
                title="Pindah semester"
              >
                PILIH
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Main Module List with Modern Codex Aesthetics ── */}
      <ModuleList
        modules={modules}
        courses={courses}
        selectedSemesterName={currentSemester?.nama_semester}
      />
    </div>
  );
}
