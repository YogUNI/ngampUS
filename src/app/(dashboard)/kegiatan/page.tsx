import Link from "next/link";
import { CheckCircle2, Circle, ListTodo, SlidersHorizontal, Clock, PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ConfirmDeleteForm } from "@/components/ui/confirm-delete-form";
import { completeActivity, deleteActivity, updateActivityStatus } from "./actions";
import { CalendarView } from "@/components/activities/calendar-view";
import { ActivityForm } from "@/components/activities/activity-form";
import { ActivityEditForm } from "@/components/activities/activity-edit-form";
import { categoryClass, statusClass } from "@/lib/activity-styles";
import { syncActivityProgressStatuses } from "@/lib/activity-status-sync";

type ActivityFilters = {
  q?: string;
  view?: string;
  kategori?: string;
  status?: string;
  semester_id?: string;
  organization_id?: string;
  prioritas?: string;
};

function makeHref(filters: ActivityFilters, view?: "list" | "calendar") {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && key !== "view") params.set(key, value);
  }
  if (view === "calendar") params.set("view", "calendar");
  const query = params.toString();
  return `/kegiatan${query ? `?${query}` : ""}`;
}

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<ActivityFilters> }) {
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Auto sync activities to "on_progress" if their scheduled date & time has arrived
  if (user) {
    await syncActivityProgressStatuses(supabase, user.id);
  }

  let activitiesQuery = supabase.from("activities").select("*").order("deadline", { ascending: true });
  if (filters.q) activitiesQuery = activitiesQuery.ilike("judul", `%${filters.q}%`);
  if (filters.kategori) activitiesQuery = activitiesQuery.eq("kategori", filters.kategori);
  if (filters.status) activitiesQuery = activitiesQuery.eq("status", filters.status);
  if (filters.semester_id) activitiesQuery = activitiesQuery.eq("semester_id", filters.semester_id);
  if (filters.organization_id) activitiesQuery = activitiesQuery.eq("organization_id", filters.organization_id);
  if (filters.prioritas) activitiesQuery = activitiesQuery.eq("prioritas", filters.prioritas);

  const [{ data: activities }, { data: semesters }, { data: organizations }, { data: programs }] = await Promise.all([
    activitiesQuery,
    supabase.from("semesters").select("id,nama_semester,is_active").order("tanggal_mulai", { ascending: false }),
    supabase.from("organizations").select("id,nama_organisasi").order("nama_organisasi"),
    supabase.from("programs").select("id,nama_proker,organization_id").order("nama_proker"),
  ]);
  const calendar = filters.view === "calendar";
  const mappedPrograms = (programs ?? []).map((program) => ({ id: program.id, name: program.nama_proker, organization_id: program.organization_id }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[var(--brand)]">SEMUA KOMITMEN</p>
          <h1 className="font-display mt-1 text-4xl font-extrabold tracking-[-.045em]">Kegiatan kamu</h1>
          <p className="mt-2 text-[var(--muted)]">Satu ruang untuk tugas, tanggung jawab organisasi, lomba, dan event.</p>
        </div>
        <ActivityForm
          semesters={(semesters ?? []).map((semester) => ({ id: semester.id, name: semester.nama_semester, active: semester.is_active }))}
          organizations={(organizations ?? []).map((organization) => ({ id: organization.id, name: organization.nama_organisasi }))}
          programs={mappedPrograms}
        />
      </header>

      <section className="mt-8">
        <div>
          <div className="mb-4 rounded-2xl border border-[var(--line)] bg-white p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-[var(--brand)]" size={17}/>
                <h2 className="font-display text-lg font-extrabold">Saring kegiatan</h2>
              </div>
              <div className="flex rounded-xl bg-[#f7f8f5] p-1">
                <Link
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold ${!calendar ? "bg-white text-[var(--brand)] shadow-sm" : "text-[var(--muted)]"}`}
                  href={makeHref(filters, "list")}
                >
                  List
                </Link>
                <Link
                  className={`rounded-lg px-3 py-1.5 text-sm font-bold ${calendar ? "bg-white text-[var(--brand)] shadow-sm" : "text-[var(--muted)]"}`}
                  href={makeHref(filters, "calendar")}
                >
                  Kalender
                </Link>
              </div>
            </div>
            <form className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {calendar && <input type="hidden" name="view" value="calendar"/>}
              <input
                type="text"
                name="q"
                defaultValue={filters.q || ""}
                placeholder="Cari judul..."
                className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
              />
              <select name="semester_id" defaultValue={filters.semester_id || ""} className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm">
                <option value="">Semua semester</option>
                {semesters?.map((semester) => <option key={semester.id} value={semester.id}>{semester.nama_semester}</option>)}
              </select>
              <select name="organization_id" defaultValue={filters.organization_id || ""} className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm">
                <option value="">Semua organisasi</option>
                {organizations?.map((organization) => <option key={organization.id} value={organization.id}>{organization.nama_organisasi}</option>)}
              </select>
              <select name="kategori" defaultValue={filters.kategori || ""} className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm">
                <option value="">Semua kategori</option>
                <option value="kuliah">Kuliah</option>
                <option value="organisasi">Organisasi</option>
                <option value="lomba">Lomba</option>
                <option value="event">Event</option>
                <option value="lainnya">Lainnya</option>
              </select>
              <select name="prioritas" defaultValue={filters.prioritas || ""} className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm">
                <option value="">Semua prioritas</option>
                <option value="tinggi">Tinggi</option>
                <option value="sedang">Sedang</option>
                <option value="rendah">Rendah</option>
              </select>
              <div className="flex gap-2">
                <select name="status" defaultValue={filters.status || ""} className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm">
                  <option value="">Semua status</option>
                  <option value="belum_mulai">Belum mulai</option>
                  <option value="on_progress">Berjalan</option>
                  <option value="selesai">Selesai</option>
                </select>
                <button className="rounded-xl bg-[var(--brand)] px-3 py-2 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]">
                  Terapkan
                </button>
              </div>
            </form>
          </div>

          {calendar ? (
            <CalendarView
              activities={activities ?? []}
              semesters={(semesters ?? []).map((s) => ({ id: s.id, name: s.nama_semester, active: s.is_active }))}
              organizations={(organizations ?? []).map((o) => ({ id: o.id, name: o.nama_organisasi }))}
              programs={mappedPrograms}
            />
          ) : (
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-extrabold">Daftar kegiatan</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Status berjalan otomatis aktif saat waktu jadwal tiba. Centang untuk tandai selesai.</p>
                </div>
                <span className="rounded-full bg-[#f7f8f5] px-2.5 py-1 text-xs font-bold">{activities?.length || 0} item</span>
              </div>
              <div className="mt-5 space-y-3">
                {activities?.length ? (
                  activities.map((activity) => {
                    const isSelesai = activity.status === "selesai";
                    const isOnProgress = activity.status === "on_progress";

                    return (
                      <article
                        key={activity.id}
                        className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                          isSelesai
                            ? "border-[var(--line)] bg-[#fafbf9] opacity-80"
                            : isOnProgress
                            ? "border-[#b9ddc6] bg-[#f8fcf9] hover:border-[var(--brand)]"
                            : "border-[var(--line)] bg-white hover:border-[#b9ddc6]"
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <form action={completeActivity} className="mt-0.5 shrink-0">
                            <input name="id" type="hidden" value={activity.id} />
                            <button
                              type="submit"
                              title={isSelesai ? "Tandai belum selesai" : "Tandai selesai"}
                              className={`transition ${isSelesai ? "text-[var(--brand)] hover:scale-105" : "text-[var(--muted)] hover:text-[var(--brand)] hover:scale-105"}`}
                            >
                              {isSelesai ? (
                                <CheckCircle2 className="text-[var(--brand)]" size={22} />
                              ) : (
                                <Circle size={22} />
                              )}
                            </button>
                          </form>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-bold text-sm sm:text-base leading-snug break-words ${
                                  isSelesai ? "text-[var(--muted)] line-through" : "text-[var(--ink)]"
                                }`}
                              >
                                {activity.judul}
                              </p>
                              {isOnProgress && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#dff3e5] px-2 py-0.5 text-[10px] font-black text-[#0f6849]">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0f6849]" />
                                  Sedang Berjalan
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[var(--muted)] flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold">{activity.kategori}</span>
                              <span>·</span>
                              <span>{activity.deadline ? `Deadline: ${activity.deadline}` : "Tanpa deadline"}</span>
                              {activity.jam_deadline && (
                                <>
                                  <span>·</span>
                                  <span>🕐 {activity.jam_deadline}</span>
                                </>
                              )}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 sm:hidden">
                            <ActivityEditForm
                              activity={activity}
                              semesters={(semesters ?? []).map((semester) => ({
                                id: semester.id,
                                name: semester.nama_semester,
                              }))}
                              organizations={(organizations ?? []).map((organization) => ({
                                id: organization.id,
                                name: organization.nama_organisasi,
                              }))}
                              programs={mappedPrograms}
                            />
                            <ConfirmDeleteForm
                              action={deleteActivity}
                              id={activity.id}
                              itemName={`kegiatan “${activity.judul}”`}
                            />
                          </div>
                        </div>

                        {/* Badges & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f4f1] pt-2.5 sm:border-t-0 sm:pt-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${categoryClass(activity.kategori)}`}>
                              {activity.kategori}
                            </span>
                            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${statusClass(activity.status)}`}>
                              {activity.status === "on_progress" ? "Berjalan" : activity.status === "belum_mulai" ? "Belum mulai" : "Selesai"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <form action={updateActivityStatus} className="flex items-center gap-1.5">
                              <input name="id" type="hidden" value={activity.id} />
                              <select
                                aria-label={`Status ${activity.judul}`}
                                name="status"
                                defaultValue={activity.status}
                                className="rounded-lg border border-[var(--line)] bg-white px-2 py-1 text-xs font-semibold outline-none"
                              >
                                <option value="belum_mulai">Belum mulai</option>
                                <option value="on_progress">Berjalan</option>
                                <option value="selesai">Selesai</option>
                              </select>
                              <button className="rounded-lg px-2 py-1 text-xs font-bold text-[var(--brand)] hover:bg-[#dcefe4] transition">
                                Simpan
                              </button>
                            </form>

                            <div className="hidden sm:flex sm:items-center sm:gap-1">
                              <ActivityEditForm
                                activity={activity}
                                semesters={(semesters ?? []).map((semester) => ({
                                  id: semester.id,
                                  name: semester.nama_semester,
                                }))}
                                organizations={(organizations ?? []).map((organization) => ({
                                  id: organization.id,
                                  name: organization.nama_organisasi,
                                }))}
                                programs={mappedPrograms}
                              />
                              <ConfirmDeleteForm
                                action={deleteActivity}
                                id={activity.id}
                                itemName={`kegiatan “${activity.judul}”`}
                              />
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="py-14 text-center">
                    <ListTodo className="mx-auto text-[var(--brand)]" />
                    <p className="mt-3 font-bold">Belum ada kegiatan sesuai filter</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">Tambah kegiatan baru atau ubah filter pencarian.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
