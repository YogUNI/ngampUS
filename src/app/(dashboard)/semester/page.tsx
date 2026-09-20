import { CalendarDays, CheckCircle2 } from "lucide-react";
import { deleteSemester, setActiveSemester } from "./actions";
import { SemesterForm } from "@/components/semester/semester-form";
import { createClient } from "@/lib/supabase/server";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";

export default async function SemesterPage() {
  const supabase = await createClient();
  const { data: semesters } = await supabase.from("semesters").select("*").order("tanggal_mulai", { ascending: false });
  return (
    <div className="mx-auto max-w-5xl px-3.5 py-6 sm:px-8 sm:py-8 lg:px-10">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[var(--brand)]">
            KONTEKS AKADEMIK
          </p>
          <h1 className="font-display mt-0.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--ink)]">
            Semester kamu
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Tandai satu semester aktif untuk menjaga dashboard tetap fokus.
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
              className={`surface-lift flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-5 transition ${
                semester.is_active
                  ? "border-[var(--brand)] bg-[#f5fbf7] ring-2 ring-[var(--brand)]/10"
                  : "border-[var(--line)] bg-white"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                    semester.is_active
                      ? "bg-[var(--brand)] text-white shadow-md shadow-[#0f6849]/20"
                      : "bg-[#f4f0e7] text-[#8b7242]"
                  }`}
                >
                  <CalendarDays size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display text-base sm:text-lg font-extrabold text-[var(--ink)]">
                      {semester.nama_semester}
                    </h2>
                    {semester.is_active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-black text-[var(--brand-dark)]">
                        ● Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#f7f8f5] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)]">
                        Arsip
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
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

              <div className="flex items-center justify-end gap-2 border-t border-[var(--line)]/50 pt-2.5 sm:border-0 sm:pt-0 shrink-0">
                {!semester.is_active && (
                  <form action={setActiveSemester}>
                    <input type="hidden" name="id" value={semester.id} />
                    <button className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] ring-1 ring-[var(--line)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand-dark)] hover:ring-[var(--brand)]/30 active:scale-95">
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
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white px-6 py-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#dcefe4] text-[var(--brand)]">
              <CalendarDays />
            </div>
            <h2 className="font-display mt-4 text-lg font-extrabold">Mulai dari satu semester</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[var(--muted)]">
              Buat semester pertamamu agar aktivitas memiliki konteks yang jelas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
