import { CalendarDays, CheckCircle2 } from "lucide-react";
import { deleteSemester, setActiveSemester } from "./actions";
import { SemesterForm } from "@/components/semester/semester-form";
import { createClient } from "@/lib/supabase/server";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";

export default async function SemesterPage() {
  const supabase = await createClient();
  const { data: semesters } = await supabase.from("semesters").select("*").order("tanggal_mulai", { ascending: false });
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            KONTEKS AKADEMIK
          </span>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Kelola Semester
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Tandai satu semester aktif untuk memfilter jadwal, tugas, dan arsip modul perkuliahanmu.
          </p>
        </div>
        <div className="shrink-0">
          <SemesterForm />
        </div>
      </header>

      <section className="mt-6 space-y-3">
        {semesters?.length ? (
          semesters.map((semester) => (
            <article
              key={semester.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-5 transition shadow-xs ${
                semester.is_active
                  ? "border-emerald-500/50 dark:border-emerald-500/60 bg-emerald-50/40 dark:bg-[#14231b] ring-2 ring-emerald-500/20"
                  : "border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] hover:border-emerald-500/40"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                    semester.is_active
                      ? "bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 dark:bg-[#1c2d22] text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <CalendarDays size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {semester.nama_semester}
                    </h2>
                    {semester.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                        ● Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 dark:bg-[#1c2d22] px-2.5 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-[#2a4032]">
                        Arsip
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
                      new Date(`${semester.tanggal_mulai}T00:00:00`)
                    )}{" "}
                    —{" "}
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
                      new Date(`${semester.tanggal_selesai}T00:00:00`)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#1c2d22] pt-2.5 sm:border-0 sm:pt-0 shrink-0">
                {!semester.is_active && (
                  <form action={setActiveSemester}>
                    <input type="hidden" name="id" value={semester.id} />
                    <button className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-[#16221a] px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-[#1c2d22] transition hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 active:scale-95 cursor-pointer">
                      <CheckCircle2 size={13} /> Jadikan aktif
                    </button>
                  </form>
                )}
                <SemesterForm semester={semester} />
                <ConfirmDeleteForm
                  action={deleteSemester}
                  id={semester.id}
                  itemName={`semester “${semester.nama_semester}”`}
                />
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-[#1c2d22] bg-white dark:bg-[#111914] px-6 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarDays />
            </div>
            <h2 className="font-display mt-4 text-lg font-bold text-slate-900 dark:text-white">Mulai dari satu semester</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
              Buat semester pertamamu agar seluruh perkuliahan dan aktivitas memiliki garis waktu yang jelas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
