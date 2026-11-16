import Link from "next/link";
import Image from "next/image";
import {
  addDays,
  differenceInCalendarDays,
  format,
  parseISO,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  MapPin,
  Video,
  FileText,
  Clock3,
  Calendar,
  Layers,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  GraduationCap,
  UsersRound,
  Plus,
  ArrowRight,
  ExternalLink,
  Award,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncActivityProgressStatuses } from "@/lib/activity-status-sync";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { DismissableAnnouncements, BroadcastItem } from "@/components/dashboard/dismissable-announcements";
import { QuickCompleteButton } from "@/components/dashboard/quick-complete-button";

function deadlineLabel(deadline: string) {
  const days = differenceInCalendarDays(parseISO(deadline), new Date());
  if (days < 0) return `${Math.abs(days)} hari lewat`;
  if (days === 0) return "Hari Ini";
  if (days === 1) return "Besok";
  return `${days} hari lagi`;
}

function greetingByHour(hour: number) {
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const threeDaysFromNow = format(addDays(new Date(), 3), "yyyy-MM-dd");
  const jakartaHour = new Date().getUTCHours() + 7; // WIB offset

  // Fetch user, profile, active semester, counts, and active announcements in parallel
  const [
    { data: { user } },
    { data: profile },
    { data: activeSemester },
    { data: allSemesters },
    { data: organizations },
    { data: broadcastAnnouncements },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("full_name,avatar_url,university").single(),
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai").eq("is_active", true).maybeSingle(),
    supabase.from("semesters").select("id").order("created_at", { ascending: false }),
    supabase.from("organizations").select("id,nama_organisasi,tipe,jabatan").order("created_at", { ascending: false }).limit(2),
    supabase.from("broadcast_announcements").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(3),
  ]);

  if (user) {
    syncActivityProgressStatuses(supabase, user.id).catch((err) =>
      console.error("Background sync error:", err)
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Mahasiswa";
  const semesterId = activeSemester?.id;
  const semesterFilter = semesterId ? `?semester_id=${semesterId}` : "";
  const greeting = greetingByHour(jakartaHour % 24);

  // Queries scoped to active semester
  let upcomingQuery = supabase
    .from("activities")
    .select("id,judul,deadline,jam_deadline,prioritas,kategori,jenis_item")
    .neq("status", "selesai")
    .eq("deadline_status", "terjadwal")
    .lte("deadline", threeDaysFromNow)
    .order("deadline", { ascending: true })
    .limit(5);

  let activeCountQuery = supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .neq("status", "selesai");

  let completeCountQuery = supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("status", "selesai");

  let overdueCountQuery = supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .neq("status", "selesai")
    .lt("deadline", today);

  if (semesterId) {
    upcomingQuery = upcomingQuery.eq("semester_id", semesterId);
    activeCountQuery = activeCountQuery.eq("semester_id", semesterId);
    completeCountQuery = completeCountQuery.eq("semester_id", semesterId);
    overdueCountQuery = overdueCountQuery.eq("semester_id", semesterId);
  }

  // Day of week calculation (UTC+7)
  const nowUtc = new Date();
  const jktTime = new Date(nowUtc.getTime() + 7 * 60 * 60 * 1000);
  const jsDay = jktTime.getUTCDay();
  const todayDayNumber = jsDay === 0 ? 7 : jsDay;

  let todayCoursesQuery = supabase
    .from("courses")
    .select("id,nama_matkul,kode_matkul,sks,jam_mulai,jam_selesai,ruangan,tipe_pertemuan,link_pertemuan,link_materi,dosen_pengampu,warna_label")
    .eq("hari", todayDayNumber)
    .order("jam_mulai", { ascending: true });

  if (semesterId) todayCoursesQuery = todayCoursesQuery.eq("semester_id", semesterId);

  const [
    { data: upcomingActivities },
    { data: todayCourses },
    { count: activeCount },
    { count: completeCount },
    { count: overdueCount },
  ] = await Promise.all([
    upcomingQuery,
    todayCoursesQuery,
    activeCountQuery,
    completeCountQuery,
    overdueCountQuery,
  ]);

  const upcomingItems = upcomingActivities ?? [];
  const todayClasses = todayCourses ?? [];
  const totalItems = (activeCount ?? 0) + (completeCount ?? 0);
  const completionRate = totalItems > 0 ? Math.round(((completeCount ?? 0) / totalItems) * 100) : 0;

  // Semester progress calculation
  let semesterProgress = 0;
  if (activeSemester?.tanggal_mulai && activeSemester?.tanggal_selesai) {
    const start = differenceInCalendarDays(parseISO(activeSemester.tanggal_mulai), new Date());
    const total = differenceInCalendarDays(parseISO(activeSemester.tanggal_selesai), parseISO(activeSemester.tanggal_mulai));
    if (total > 0) {
      semesterProgress = Math.min(100, Math.max(0, Math.round(((total + start) / total) * 100)));
    }
  }

  const dateHeading = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10">

      {/* ── BROADCAST ANNOUNCEMENTS ── */}
      {broadcastAnnouncements && broadcastAnnouncements.length > 0 && (
        <DismissableAnnouncements
          announcements={broadcastAnnouncements as unknown as BroadcastItem[]}
          userUniversity={profile?.university}
        />
      )}

      {/* ── 01 // WELCOME & COCKPIT HEADER ── */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-5 sm:p-7 shadow-xs transition-colors">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Identity & Status */}
          <div className="flex items-center gap-4 min-w-0">
            {profile?.avatar_url ? (
              <div className="relative shrink-0">
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || firstName}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 dark:ring-emerald-400/30 shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-[#111914] ring-2 ring-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>
            ) : (
              <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-xs">
                {firstName.slice(0, 1).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-[#111914] ring-2 ring-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <span>{greeting}</span>
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                  {dateHeading}
                </span>
              </div>
              <h1 className="font-display mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {profile?.full_name || firstName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 truncate">
                <span>{profile?.university || "Mahasiswa Indonesia"}</span>
                <span>•</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {activeSemester ? activeSemester.nama_semester : "Semester Belum Diatur"}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/jadwal${semesterFilter}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-[#1d3527] bg-slate-50 hover:bg-slate-100 dark:bg-[#15231c] dark:hover:bg-[#1b2e25] px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 transition"
            >
              <BookOpen size={14} className="text-slate-500 dark:text-slate-400" />
              <span>Jadwal Kuliah</span>
            </Link>

            <Link
              href="/kegiatan?new=1"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Catat Tugas</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 02 // KEY METRIC PILLARS (4 Crisp Cards) ── */}
      <section className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Jadwal Kuliah Hari Ini */}
        <Link
          href={`/jadwal${semesterFilter}`}
          className="group rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 shadow-xs hover:border-emerald-500/50 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Kuliah Hari Ini
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BookOpen size={15} />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {todayClasses.length} Kelas
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {todayClasses.length > 0 ? todayClasses[0].nama_matkul : "Tidak ada kelas hari ini"}
            </p>
          </div>
        </Link>

        {/* Card 2: Tugas & Deadline */}
        <Link
          href={`/kegiatan${semesterFilter}`}
          className="group rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 shadow-xs hover:border-emerald-500/50 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tugas & Deadline
            </span>
            <span className={`grid h-7 w-7 place-items-center rounded-lg ${
              (overdueCount ?? 0) > 0
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
            }`}>
              <CalendarDays size={15} />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {activeCount ?? 0} Aktif
            </span>
            <p className="text-xs mt-1 truncate">
              {(overdueCount ?? 0) > 0 ? (
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {overdueCount} perlu ditinjau
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  {upcomingItems.length > 0 ? "Deadline terdekat aman" : "Semua tugas tuntas ✨"}
                </span>
              )}
            </p>
          </div>
        </Link>

        {/* Card 3: Progres Semester */}
        <Link
          href="/semester"
          className="group rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 shadow-xs hover:border-emerald-500/50 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Progres Semester
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <GraduationCap size={15} />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {semesterProgress}%
            </span>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${semesterProgress}%` }} 
              />
            </div>
          </div>
        </Link>

        {/* Card 4: Kesiapan Portofolio */}
        <Link
          href={`/rekap/portfolio${semesterFilter}`}
          className="group rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-4 shadow-xs hover:border-emerald-500/50 hover:shadow-sm transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Portofolio & ATS
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Award size={15} />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Skor 96/100
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {completeCount ?? 0} Proyek terverifikasi
            </p>
          </div>
        </Link>

      </section>

      {/* ── Onboarding Wizard (Modal Tour) ── */}
      <OnboardingWizard
        hasSemesters={(allSemesters?.length ?? 0) > 0}
        userId={user?.id || ""}
        userName={firstName}
      />

      {/* ── Overdue Warning Banner ── */}
      {(overdueCount ?? 0) > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 px-4 py-3 text-xs text-rose-900 dark:text-rose-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <p className="font-medium truncate">
              Ada <b>{overdueCount} kegiatan</b> yang melewati batas tenggat.
            </p>
          </div>
          <Link
            href={`/kegiatan${semesterFilter}`}
            className="shrink-0 font-bold text-rose-700 dark:text-rose-300 hover:underline inline-flex items-center gap-1"
          >
            <span>Tinjau Sekarang</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* ── 03 // PRIMARY WORKSPACE COCKPIT (2 COLUMNS: 65% / 35%) ── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_.6fr]">

        {/* ── LEFT COLUMN: JADWAL KULIAH & RADAR DEADLINE ── */}
        <div className="flex flex-col gap-6 min-w-0">
          
          {/* Section: Jadwal Kuliah Hari Ini */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#18271e] pb-3 mb-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Jadwal Kuliah Hari Ini
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar kelas dan tautan ruang kuliah yang sinkron
                </p>
              </div>
              <Link
                href={`/jadwal${semesterFilter}`}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {todayClasses.length > 0 ? (
                todayClasses.map((c) => (
                  <article
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/70 dark:border-[#1c2d22] bg-slate-50/50 dark:bg-[#15221a] p-3.5 transition hover:border-emerald-500/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                          {c.kode_matkul ? `${c.kode_matkul} • ` : ""}{c.sks} SKS
                        </span>
                        <span className="rounded-md bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 uppercase">
                          {c.tipe_pertemuan || "Tatap Muka"}
                        </span>
                      </div>
                      <h3 className="font-display mt-1 text-sm font-bold text-slate-900 dark:text-white truncate">
                        {c.nama_matkul}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Clock3 size={13} className="text-emerald-600 dark:text-emerald-400" />
                          {c.jam_mulai.slice(0, 5)} - {c.jam_selesai.slice(0, 5)} WIB
                        </span>
                        {c.ruangan && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} /> {c.ruangan}
                          </span>
                        )}
                        {c.dosen_pengampu && (
                          <span className="truncate">· {c.dosen_pengampu}</span>
                        )}
                      </div>
                    </div>

                    {/* Class Action Links */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-200/50 dark:border-slate-800 sm:border-t-0">
                      {c.link_pertemuan && (
                        <a
                          href={c.link_pertemuan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black px-3 py-1.5 text-xs font-bold transition"
                        >
                          <Video size={13} />
                          <span>Masuk Kelas</span>
                        </a>
                      )}
                      {c.link_materi && (
                        <a
                          href={c.link_materi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                        >
                          <FileText size={13} />
                          <span>Materi</span>
                        </a>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#1d3527] p-6 text-center">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Sparkles size={20} />
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                    Bebas dari jadwal perkuliahan hari ini
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Gunakan waktu untuk mencicil modul praktikum atau agenda organisasi.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Section: Radar Deadline & Prioritas Tugas */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#18271e] pb-3 mb-4">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Radar Deadline & Prioritas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tugas mendesak dalam 3 hari ke depan
                </p>
              </div>
              <Link
                href={`/kegiatan${semesterFilter}`}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Semua Tugas</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-2.5">
              {upcomingItems.length > 0 ? (
                upcomingItems.map((item) => {
                  const days = differenceInCalendarDays(parseISO(item.deadline!), new Date());
                  const isOverdue = days < 0;
                  const isUrgent = days <= 1;

                  return (
                    <article
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 dark:border-[#1c2d22] bg-slate-50/40 dark:bg-[#15221a] p-3 transition hover:border-emerald-500/40"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <QuickCompleteButton activityId={item.id} activityTitle={item.judul} />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.judul}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            <span className="font-medium text-emerald-700 dark:text-emerald-400 uppercase">
                              {item.kategori}
                            </span>
                            {item.jam_deadline ? ` • Pukul ${item.jam_deadline.slice(0, 5)} WIB` : ""}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          isOverdue
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                            : isUrgent
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {deadlineLabel(item.deadline!)}
                      </span>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#1d3527] p-6 text-center">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Radar tugas bersih! ✨
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tidak ada deadline menumpuk dalam 3 hari ke depan.
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ── RIGHT COLUMN: PINTASAN, ORGANISASI & PORTOFOLIO ── */}
        <div className="flex flex-col gap-6 min-w-0">

          {/* Card: Pintasan Aksi Cepat */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-5 shadow-xs">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              Pusat Aksi Cepat
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href={`/jadwal${semesterFilter}`}
                className="flex flex-col gap-1 rounded-xl border border-slate-200/70 dark:border-[#1c2d22] bg-slate-50/60 dark:bg-[#15221a] p-3 hover:bg-slate-100 dark:hover:bg-[#1a2b20] transition"
              >
                <BookOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Jadwal</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Atur kelas</span>
              </Link>

              <Link
                href={`/modul${semesterFilter}`}
                className="flex flex-col gap-1 rounded-xl border border-slate-200/70 dark:border-[#1c2d22] bg-slate-50/60 dark:bg-[#15221a] p-3 hover:bg-slate-100 dark:hover:bg-[#1a2b20] transition"
              >
                <FileText size={16} className="text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Modul AI</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Rangkum PDF</span>
              </Link>

              <Link
                href="/organisasi"
                className="flex flex-col gap-1 rounded-xl border border-slate-200/70 dark:border-[#1c2d22] bg-slate-50/60 dark:bg-[#15221a] p-3 hover:bg-slate-100 dark:hover:bg-[#1a2b20] transition"
              >
                <UsersRound size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Organisasi</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Proker kampus</span>
              </Link>

              <Link
                href={`/rekap/portfolio${semesterFilter}`}
                className="flex flex-col gap-1 rounded-xl border border-slate-200/70 dark:border-[#1c2d22] bg-slate-50/60 dark:bg-[#15221a] p-3 hover:bg-slate-100 dark:hover:bg-[#1a2b20] transition"
              >
                <Award size={16} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Resume ATS</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Ekspor 1-klik</span>
              </Link>
            </div>
          </section>

          {/* Card: Organisasi & Kontribusi Kampus */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-[#1c2d22] bg-white dark:bg-[#111914] p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#18271e] pb-2.5 mb-3">
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                Organisasi Aktif
              </h2>
              <Link
                href="/organisasi"
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Kelola
              </Link>
            </div>

            {organizations && organizations.length > 0 ? (
              <div className="space-y-2.5">
                {organizations.map((org) => (
                  <Link
                    key={org.id}
                    href={`/organisasi/${org.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/70 dark:border-[#1c2d22] bg-slate-50/40 dark:bg-[#15221a] p-3 hover:border-emerald-500/40 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {org.nama_organisasi}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {org.jabatan || org.tipe || "Anggota"}
                      </p>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-400 shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-[#1d3527] p-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Belum ada organisasi tercatat.
                </p>
                <Link
                  href="/organisasi"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <Plus size={12} />
                  <span>Tambah Organisasi</span>
                </Link>
              </div>
            )}
          </section>

          {/* Card: Standar Harvard ATS Portofolio Banner */}
          <section className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 dark:text-emerald-300">
                KESIAPAN MAGANG
              </span>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white">
                ATS SCORE 96
              </span>
            </div>
            <h3 className="font-display mt-2 text-sm font-bold text-slate-900 dark:text-white leading-snug">
              Semua tugas & proker terekam otomatis jadi poin resume Harvard.
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Siap dikirim ke pendaftaran Kampus Merdeka & magang industri.
            </p>
            <Link
              href={`/rekap/portfolio${semesterFilter}`}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black px-3.5 py-2 text-xs font-bold transition active:scale-95 shadow-xs"
            >
              <span>Lihat Portofolio</span>
              <ArrowRight size={13} />
            </Link>
          </section>

        </div>

      </div>

    </div>
  );
}
