import Link from "next/link";
import { CheckCircle2, Circle, ListTodo, SlidersHorizontal, Clock, PlayCircle } from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { id } from "date-fns/locale";
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

  // Queries for tab counts (respecting current semester filter)
  let countBase = supabase.from("activities").select("status", { count: "exact" });
  if (filters.semester_id) countBase = countBase.eq("semester_id", filters.semester_id);

  const [
    { data: { user } },
    { data: activities },
    { data: semesters },
    { data: organizations },
    { data: programs },
    { data: courses },
    { data: allUserActivities },
  ] = await Promise.all([
    supabase.auth.getUser(),
    activitiesQuery,
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai,is_active").order("tanggal_mulai", { ascending: false }),
    supabase.from("organizations").select("id,nama_organisasi").order("nama_organisasi"),
    supabase.from("programs").select("id,nama_proker,organization_id").order("nama_proker"),
    supabase.from("courses").select("*").order("hari", { ascending: true }).order("jam_mulai", { ascending: true }),
    supabase.from("activities").select("status,semester_id"),
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

  // Tab count calculations
  const scopedActivities = (allUserActivities ?? []).filter((a) =>
    filters.semester_id ? a.semester_id === filters.semester_id : true
  );
  const counts = {
    total: scopedActivities.length,
    active: scopedActivities.filter((a) => a.status === "belum_mulai").length,
    onProgress: scopedActivities.filter((a) => a.status === "on_progress").length,
    completed: scopedActivities.filter((a) => a.status === "selesai").length,
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      {/* ── Executive Header for Kegiatan (Consistent with App Identity) ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#0f6849]">
              MANAJEMEN TUGAS & AGENDA
            </span>
            {activeSemester && (
              <span className="inline-flex rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0f6849] border border-[#b9ddc6]">
                {activeSemester.nama_semester}
              </span>
            )}
          </div>
          <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#10261b]">
            Daftar Kegiatan
          </h1>
          <p className="mt-0.5 text-xs text-[#697c6f]">
            Kelola tugas kuliah, organisasi, lomba, dan komitmen semester dalam satu tempat.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2.5">
          <ActivityForm
            semesters={(semesters ?? []).map((semester) => ({ id: semester.id, name: semester.nama_semester, active: semester.is_active }))}
            organizations={(organizations ?? []).map((organization) => ({ id: organization.id, name: organization.nama_organisasi }))}
            programs={mappedPrograms}
            courses={mappedCourses}
            triggerClass="inline-flex items-center gap-1.5 rounded-2xl bg-[#103626] px-4 py-2.5 text-xs sm:text-sm font-black text-[#c8ef70] shadow-md hover:bg-[#1a4a34] transition active:scale-95"
            triggerText="+ Buat Kegiatan Baru"
          />
        </div>
      </header>

      {/* ── Filter & Search Section (Segmented Tabs + Quick Chips) ── */}
      <section className="mt-5">
        <ActivityFilterBar
          filters={filters}
          semesters={(semesters ?? []).map((s) => ({ id: s.id, name: s.nama_semester }))}
          organizations={(organizations ?? []).map((o) => ({ id: o.id, name: o.nama_organisasi }))}
          calendar={calendar}
          totalItems={activities?.length || 0}
          counts={counts}
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
          <div className="rounded-3xl border border-[#d8e3da] bg-white p-4 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#f0f4f0] pb-3.5">
              <div>
                <h2 className="font-display text-base sm:text-lg font-black text-[#10261b]">
                  Daftar Tugas & Komitmen
                </h2>
                <p className="mt-0.5 text-xs text-[#697c6f]">
                  Klik lingkaran centang untuk menyelesaikan tugas secara instan.
                </p>
              </div>
              <span className="rounded-full bg-[#f4f7f4] border border-[#d8e3da] px-3 py-1 text-xs font-black text-[#33463a]">
                {activities?.length || 0} Item
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {activities?.length ? (
                activities.map((activity) => {
                  const isSelesai = activity.status === "selesai";
                  const isOnProgress = activity.status === "on_progress";

                  // Urgency calculation for deadline
                  let urgencyBadge = null;
                  if (activity.deadline && !isSelesai) {
                    const daysDiff = differenceInCalendarDays(parseISO(activity.deadline), new Date());
                    if (daysDiff < 0) {
                      urgencyBadge = (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#feece7] px-2 py-0.5 text-[10px] font-black text-[#c53e1c]">
                          ⚠️ Lewat {Math.abs(daysDiff)} Hari
                        </span>
                      );
                    } else if (daysDiff === 0) {
                      urgencyBadge = (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#feece7] px-2 py-0.5 text-[10px] font-black text-[#c53e1c] animate-pulse">
                          🔥 Hari Ini!
                        </span>
                      );
                    } else if (daysDiff === 1) {
                      urgencyBadge = (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#fffbe6] px-2 py-0.5 text-[10px] font-black text-[#8a5d00]">
                          ⏳ Besok
                        </span>
                      );
                    } else if (daysDiff <= 3) {
                      urgencyBadge = (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#f4fbe8] px-2 py-0.5 text-[10px] font-black text-[#456a1e]">
                          {daysDiff} Hari Lagi
                        </span>
                      );
                    }
                  }

                  const matchedCourse = courses?.find((c) => c.id === activity.course_id);

                  return (
                    <article
                      key={activity.id}
                      className={`group flex items-start sm:items-center justify-between gap-3.5 rounded-2xl border p-3.5 sm:p-4 transition-all duration-200 ${
                        isSelesai
                          ? "border-[#e5ebe5] bg-[#fafbfa] opacity-75"
                          : isOnProgress
                          ? "border-[#a9cdb2] bg-[#f7fcf9] shadow-xs hover:border-[#0f6849]"
                          : "border-[#e5ebe5] bg-white hover:border-[#a9cdb2] hover:shadow-xs"
                      }`}
                    >
                      {/* Left: Quick Completion Checkbox & Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <form action={completeActivity} className="mt-0.5 shrink-0">
                          <input name="id" type="hidden" value={activity.id} />
                          <button
                            type="submit"
                            title={isSelesai ? "Tandai belum selesai" : "Tandai selesai"}
                            className="transition transform active:scale-90 text-[#8b9e91] hover:text-[#0f6849] p-0.5"
                          >
                            {isSelesai ? (
                              <CheckCircle2 className="text-[#0f6849] fill-[#dff3e5]" size={24} strokeWidth={2.2} />
                            ) : (
                              <Circle size={24} strokeWidth={1.8} className="group-hover:text-[#0f6849] transition" />
                            )}
                          </button>
                        </form>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-display text-sm sm:text-base font-bold leading-snug break-words ${
                                isSelesai ? "text-[#7d9284] line-through" : "text-[#10261b]"
                              }`}
                            >
                              {activity.judul}
                            </h3>

                            {/* Urgency Badge */}
                            {urgencyBadge}

                            {/* Status Sedang Berjalan Badge */}
                            {isOnProgress && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#dff3e5] px-2 py-0.5 text-[10px] font-black text-[#0f6849]">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0f6849]" />
                                Berjalan
                              </span>
                            )}
                          </div>

                          {/* Subtitle Details: Matkul / Kategori / Tanggal Deadline */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#697c6f]">
                            {matchedCourse && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-[#eef2ff] px-2 py-0.5 text-[10.5px] font-bold text-[#4338ca]">
                                📚 {matchedCourse.nama_matkul}
                              </span>
                            )}

                            <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${categoryClass(activity.kategori)}`}>
                              {activity.kategori}
                            </span>

                            {activity.deadline ? (
                              <span className="font-medium text-[#55675b] flex items-center gap-1">
                                📅 {format(parseISO(activity.deadline), "d MMM yyyy", { locale: id })}
                                {activity.jam_deadline ? ` (${activity.jam_deadline.slice(0, 5)})` : ""}
                              </span>
                            ) : (
                              <span className="text-[#8b9e91] italic text-[11px]">Tanpa tenggat waktu</span>
                            )}

                            {activity.is_portfolio && (
                              <span className="inline-flex items-center rounded-md bg-[#f4fbe8] px-1.5 py-0.5 text-[10px] font-black text-[#456a1e] border border-[#c8ef70]">
                                ⭐ Portofolio
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Controls (Edit & Delete without heavy dropdowns) */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
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
                    </article>
                  );
                })
              ) : (
                <div className="py-14 px-4 text-center rounded-2xl bg-[#fafbfa] border border-dashed border-[#c5d8cb] my-2">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
                    <ListTodo size={28} />
                  </div>
                  <h3 className="mt-3.5 font-display text-base sm:text-lg font-black text-[#10261b]">
                    Belum Ada Kegiatan atau Tugas
                  </h3>
                  <p className="mt-1 text-xs text-[#697c6f] max-w-sm mx-auto leading-relaxed">
                    Catat tugas kuliah, jadwal kuis, agenda rapat organisasi, atau pengingat lainnya agar progres semestermu terpantau rapi.
                  </p>
                  <div className="mt-5 flex justify-center">
                    <ActivityForm
                      semesters={(semesters ?? []).map((semester) => ({ id: semester.id, name: semester.nama_semester, active: semester.is_active }))}
                      organizations={(organizations ?? []).map((organization) => ({ id: organization.id, name: organization.nama_organisasi }))}
                      programs={mappedPrograms}
                      courses={mappedCourses}
                      triggerClass="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-4 py-2 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
                      triggerText="Catat Kegiatan / Tugas Pertama"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
