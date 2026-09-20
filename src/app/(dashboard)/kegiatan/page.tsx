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

import { ActivityFilterBar } from "@/components/activities/activity-filter-bar";

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

  let activitiesQuery = supabase.from("activities").select("*").order("deadline", { ascending: true });
  if (filters.q) activitiesQuery = activitiesQuery.ilike("judul", `%${filters.q}%`);
  if (filters.kategori) activitiesQuery = activitiesQuery.eq("kategori", filters.kategori);
  if (filters.status) activitiesQuery = activitiesQuery.eq("status", filters.status);
  if (filters.semester_id) activitiesQuery = activitiesQuery.eq("semester_id", filters.semester_id);
  if (filters.organization_id) activitiesQuery = activitiesQuery.eq("organization_id", filters.organization_id);
  if (filters.prioritas) activitiesQuery = activitiesQuery.eq("prioritas", filters.prioritas);

  const [
    { data: { user } },
    { data: activities },
    { data: semesters },
    { data: organizations },
    { data: programs },
    { data: courses },
  ] = await Promise.all([
    supabase.auth.getUser(),
    activitiesQuery,
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai,is_active").order("tanggal_mulai", { ascending: false }),
    supabase.from("organizations").select("id,nama_organisasi").order("nama_organisasi"),
    supabase.from("programs").select("id,nama_proker,organization_id").order("nama_proker"),
    supabase.from("courses").select("*").order("hari", { ascending: true }).order("jam_mulai", { ascending: true }),
  ]);

  // Non-blocking auto sync so the user does not experience page lag
  if (user) {
    syncActivityProgressStatuses(supabase, user.id).catch((err) =>
      console.error("Background sync error in activities:", err)
    );
  }
  const calendar = filters.view === "calendar";
  const mappedPrograms = (programs ?? []).map((program) => ({ id: program.id, name: program.nama_proker, organization_id: program.organization_id }));
  const mappedCourses = (courses ?? []).map((course) => ({
    id: course.id,
    name: course.nama_matkul,
    semester_id: course.semester_id,
    sks: course.sks,
  }));

  const activeSemester = semesters?.find((s) => s.is_active) ?? semesters?.[0];

  return (
    <div className="mx-auto max-w-6xl px-3.5 py-6 sm:px-8 sm:py-8 lg:px-10">
      {/* ── Compact Header ── */}
      <header className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[var(--brand)]">
              SEMUA KOMITMEN
            </span>
            {activeSemester && (
              <span className="hidden sm:inline-flex rounded-md bg-[var(--card-subtle)] px-2 py-0.5 text-[10px] font-bold text-[var(--muted)] border border-[var(--line)]">
                {activeSemester.nama_semester}
              </span>
            )}
          </div>
          <h1 className="font-display mt-0.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
            Kegiatan kamu
          </h1>
        </div>

        <div className="shrink-0">
          <ActivityForm
            semesters={(semesters ?? []).map((semester) => ({ id: semester.id, name: semester.nama_semester, active: semester.is_active }))}
            organizations={(organizations ?? []).map((organization) => ({ id: organization.id, name: organization.nama_organisasi }))}
            programs={mappedPrograms}
            courses={mappedCourses}
            triggerClass="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-[#c8ef70] shadow-2xs hover:bg-[#1a4a34] transition active:scale-95"
            triggerText="Tambah Kegiatan"
          />
        </div>
      </header>

      {/* ── Filter & Search Section (Modern & Collapsible) ── */}
      <section className="mt-5">
        <ActivityFilterBar
          filters={filters}
          semesters={(semesters ?? []).map((s) => ({ id: s.id, name: s.nama_semester }))}
          organizations={(organizations ?? []).map((o) => ({ id: o.id, name: o.nama_organisasi }))}
          calendar={calendar}
          totalItems={activities?.length || 0}
        />

          {calendar ? (
            <CalendarView
              activities={activities ?? []}
              courses={courses ?? []}
              tanggalMulai={activeSemester?.tanggal_mulai}
              tanggalSelesai={activeSemester?.tanggal_selesai}
              semesters={(semesters ?? []).map((s) => ({ id: s.id, name: s.nama_semester, active: s.is_active }))}
              organizations={(organizations ?? []).map((o) => ({ id: o.id, name: o.nama_organisasi }))}
              programs={mappedPrograms}
            />
          ) : (
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-[var(--line)]/60 pb-3">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-extrabold text-[var(--ink)]">Daftar kegiatan</h2>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">Status berjalan otomatis aktif saat waktu jadwal tiba. Centang untuk tandai selesai.</p>
                </div>
                <span className="rounded-full bg-[var(--card-subtle)] border border-[var(--line)] px-2.5 py-1 text-xs font-bold text-[var(--muted)]">{activities?.length || 0} item</span>
              </div>
              <div className="mt-4 space-y-3">
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
                              {activity.course_id && (
                                <>
                                  <span className="inline-flex items-center gap-1 rounded-md bg-[#eef2ff] px-2 py-0.5 text-[11px] font-bold text-[#4338ca]">
                                    📚 {courses?.find((c) => c.id === activity.course_id)?.nama_matkul || "Mata Kuliah"}
                                  </span>
                                  <span>·</span>
                                </>
                              )}
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
                              courses={mappedCourses}
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
                            {activity.is_portfolio && (
                              <span className="rounded-lg bg-[#f4fbe8] px-2 py-1 text-[10px] font-black text-[#456a1e] border border-[#c8ef70]">
                                ⭐ Portfolio
                              </span>
                            )}
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
                                courses={mappedCourses}
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
      </section>
    </div>
  );
}
