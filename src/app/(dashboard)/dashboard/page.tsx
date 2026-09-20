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
  CalendarDays,
  CheckCircle2,
  Clock3,
  BookOpen,
  Building2,
  BarChart3,
  Plus,
  Sparkles,
  AlertTriangle,
  Target,
  Zap,
  CalendarPlus,
  FileText,
  MapPin,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncActivityProgressStatuses } from "@/lib/activity-status-sync";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ScrollEntrance } from "@/components/dashboard/scroll-entrance";

function deadlineLabel(deadline: string) {
  const days = differenceInCalendarDays(parseISO(deadline), new Date());
  if (days < 0) return `${Math.abs(days)} hari lewat`;
  if (days === 0) return "Hari ini!";
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

  // Fetch user, profile, active semester, and counts in parallel
  const [
    { data: { user } },
    { data: profile },
    { data: activeSemester },
    { data: allSemesters },
    { data: organizations },
    { data: programs },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("full_name,avatar_url").single(),
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai").eq("is_active", true).maybeSingle(),
    supabase.from("semesters").select("id").order("created_at", { ascending: false }),
    supabase.from("organizations").select("id,nama_organisasi,tipe").order("created_at", { ascending: false }).limit(3),
    supabase.from("programs").select("organization_id,status").order("created_at", { ascending: false }),
  ]);

  // Non-blocking background sync so user does not wait for database updates
  if (user) {
    syncActivityProgressStatuses(supabase, user.id).catch((err) =>
      console.error("Background sync error:", err)
    );
  }

  const firstName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Mahasiswa";
  const semesterId = activeSemester?.id;
  const semesterFilter = semesterId ? `?semester_id=${semesterId}` : "";
  const greeting = greetingByHour(jakartaHour % 24);

  // Queries scoped to active semester if available
  let upcomingQuery = supabase
    .from("activities")
    .select("id,judul,deadline,jam_deadline,prioritas,kategori,jenis_item")
    .neq("status", "selesai")
    .eq("deadline_status", "terjadwal")
    .lte("deadline", threeDaysFromNow)
    .order("deadline", { ascending: true })
    .limit(4);

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

  // Today's schedule
  let todayQuery = supabase
    .from("activities")
    .select("id,judul,kategori,jenis_item,jam_pelaksanaan,deadline,prioritas")
    .neq("status", "selesai")
    .or(`deadline.eq.${today},tanggal_mulai.eq.${today}`)
    .order("jam_pelaksanaan", { ascending: true })
    .limit(4);

  if (semesterId) todayQuery = todayQuery.eq("semester_id", semesterId);

  // Calculate day of week (1: Senin, ..., 7: Minggu) based on Jakarta timezone (UTC+7)
  const nowUtc = new Date();
  const jktTime = new Date(nowUtc.getTime() + 7 * 60 * 60 * 1000);
  const jsDay = jktTime.getUTCDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  const todayDayNumber = jsDay === 0 ? 7 : jsDay;

  let todayCoursesQuery = supabase
    .from("courses")
    .select("id,nama_matkul,kode_matkul,sks,jam_mulai,jam_selesai,ruangan,tipe_pertemuan,link_pertemuan,link_materi,dosen_pengampu,warna_label")
    .eq("hari", todayDayNumber)
    .order("jam_mulai", { ascending: true });

  if (semesterId) todayCoursesQuery = todayCoursesQuery.eq("semester_id", semesterId);

  const [
    { data: upcomingActivities },
    { data: todayActivities },
    { data: todayCourses },
    { count: activeCount },
    { count: completeCount },
    { count: overdueCount },
  ] = await Promise.all([
    upcomingQuery,
    todayQuery,
    todayCoursesQuery,
    activeCountQuery,
    completeCountQuery,
    overdueCountQuery,
  ]);

  const upcomingItems = upcomingActivities ?? [];
  const todaySchedule = todayActivities ?? [];
  const todayClasses = todayCourses ?? [];
  const totalItems = (activeCount ?? 0) + (completeCount ?? 0);
  const completionRate = totalItems > 0 ? Math.round(((completeCount ?? 0) / totalItems) * 100) : 0;

  // Semester progress calculation
  let semesterProgress = 0;
  if (activeSemester?.tanggal_mulai && activeSemester?.tanggal_selesai) {
    const start = differenceInCalendarDays(parseISO(activeSemester.tanggal_mulai), new Date());
    const end = differenceInCalendarDays(parseISO(activeSemester.tanggal_selesai), new Date());
    const total = differenceInCalendarDays(parseISO(activeSemester.tanggal_selesai), parseISO(activeSemester.tanggal_mulai));
    if (total > 0) {
      semesterProgress = Math.min(100, Math.max(0, Math.round(((total + start) / total) * 100)));
    }
  }

  const dateHeading = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });

  const categoryEmoji: Record<string, string> = {
    kuliah: "📚",
    organisasi: "🏢",
    lomba: "🏆",
    event: "🎯",
    lainnya: "📎",
  };

  const jenisColor: Record<string, string> = {
    agenda: "bg-[#dff3e5] text-[#0f6849]",
    tugas: "bg-[#feece7] text-[#b93c21]",
    catatan: "bg-[#fffbe6] text-[#8a6400]",
    reminder: "bg-[#e8e1fa] text-[#5c3a9c]",
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10">

      {/* ── EXECUTIVE DARK HEADER (Native App Aesthetic) ── */}
      <header
        className="relative -mx-4 -mt-6 overflow-hidden rounded-b-[2.5rem] px-5 pt-6 text-white shadow-xl sm:-mx-8 sm:px-8 sm:pt-8 lg:-mx-10 lg:px-10"
        style={{
          background: "linear-gradient(180deg, #092015 0%, #0f3524 55%, #13422e 100%)",
          paddingBottom: "54px",
        }}
      >
        {/* Subtle Ambient Radial Glows */}
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(200,239,112,0.6), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full opacity-20 blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.5), transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* User Profile Thumbnail & Info (Full name & subtitle without clipping) */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || firstName}
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-2xl object-cover ring-2 ring-white/25 shadow-md"
              />
            ) : (
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-base font-black text-[#c8ef70] ring-1 ring-white/20 shadow-inner">
                {firstName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#a8d3b8]">
                  {greeting}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#c8ef70] animate-pulse" />
              </div>
              <h1 className="font-display text-base sm:text-xl font-black text-white tracking-tight leading-snug">
                {profile?.full_name || firstName}
              </h1>
              <p className="text-[11px] font-medium text-[#8ca393] leading-tight">
                {activeSemester ? `${activeSemester.nama_semester} • Mahasiswa` : "Personal Workspace"}
              </p>
            </div>
          </div>

          {/* Quick Header Date Pill (Full date with year, clean compact badge) */}
          <div className="shrink-0 flex flex-col items-end">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-bold text-[#c8ef70] backdrop-blur-md border border-white/10">
              📅 {format(new Date(), "d MMM yyyy", { locale: id })}
            </span>
          </div>
        </div>

        {/* Hero Quick Stat Highlight (Large Crisp Typography like POS Rp 5.477.136) */}
        <div className="relative z-10 mt-5 pt-3.5 border-t border-white/10 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#a8d3b8]">
              STATUS AKADEMIK
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                {activeSemester ? activeSemester.nama_semester : "Semester Baru"}
              </span>
              <span className="rounded-md bg-[#c8ef70]/20 px-2 py-0.5 text-[10px] font-black text-[#c8ef70]">
                {activeSemester ? "Berjalan" : "Siap"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a8d3b8] block">Hari Ini</span>
            <span className="font-display text-base sm:text-xl font-black text-[#c8ef70] leading-none">
              {todayClasses.length > 0 ? `${todayClasses.length} Kelas` : "Bebas Kuliah"}
            </span>
          </div>
        </div>
      </header>

      {/* ── FLOATING OVERLAPPING STAT CARD (3-Column Native Metric Pill matching reference) ── */}
      <div className="relative z-20" style={{ marginTop: "-26px" }}>
        <div className="grid grid-cols-3 divide-x divide-[#e8eee9] rounded-2xl sm:rounded-3xl border border-[#d2e2d5] bg-white p-3.5 sm:p-5 shadow-[0_10px_25px_rgba(0,0,0,0.06)]">
          {/* Col 1: Tugas Aktif */}
          <Link
            href={`/kegiatan${semesterFilter}`}
            prefetch={true}
            className="flex flex-col items-center text-center px-1 group transition active:scale-95"
          >
            <div className="flex items-center gap-1.5 text-[#55675b]">
              {/* Custom SVG Icon: Tugas */}
              <svg className="h-4 w-4 text-[#0f6849]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#697c6f]">Tugas Aktif</span>
            </div>
            <p className="font-display mt-1 text-lg sm:text-2xl font-black text-[#10261b] tracking-tight group-hover:text-[#0f6849] transition">
              {activeCount ?? 0}
            </p>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-[#0f6849] mt-0.5">Komitmen</span>
          </Link>

          {/* Col 2: Deadline Dekat */}
          <Link
            href={`/kegiatan${semesterFilter}`}
            prefetch={true}
            className="flex flex-col items-center text-center px-1 group transition active:scale-95"
          >
            <div className="flex items-center gap-1.5 text-[#55675b]">
              {/* Custom SVG Icon: Tenggat */}
              <svg className={`h-4 w-4 ${(overdueCount ?? 0) > 0 ? "text-[#c53e1c]" : "text-[#8a5d00]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
              </svg>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#697c6f]">Tenggat</span>
            </div>
            <p className={`font-display mt-1 text-lg sm:text-2xl font-black tracking-tight transition ${
              (overdueCount ?? 0) > 0 ? "text-[#c53e1c]" : "text-[#10261b] group-hover:text-[#8a5d00]"
            }`}>
              {(overdueCount ?? 0) > 0 ? `${overdueCount} Lewat` : `${upcomingItems.length} Dekat`}
            </p>
            <span className={`text-[9px] sm:text-[10px] font-extrabold mt-0.5 ${
              (overdueCount ?? 0) > 0 ? "text-[#c53e1c]" : "text-[#8a5d00]"
            }`}>
              {(overdueCount ?? 0) > 0 ? "Butuh Tinjau" : "3 Hari Depan"}
            </span>
          </Link>

          {/* Col 3: Selesai / Progress */}
          <Link
            href={`/rekap${semesterFilter}`}
            prefetch={true}
            className="flex flex-col items-center text-center px-1 group transition active:scale-95"
          >
            <div className="flex items-center gap-1.5 text-[#55675b]">
              {/* Custom SVG Icon: Progress Selesai */}
              <svg className="h-4 w-4 text-[#5c3a9c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#697c6f]">Progress</span>
            </div>
            <p className="font-display mt-1 text-lg sm:text-2xl font-black text-[#10261b] tracking-tight group-hover:text-[#5c3a9c] transition">
              {completionRate}%
            </p>
            <span className="text-[9px] sm:text-[10px] font-extrabold text-[#5c3a9c] mt-0.5">
              {completeCount ?? 0} Selesai
            </span>
          </Link>
        </div>
      </div>

      {/* ── Onboarding Modal & Guided Tour ── */}
      <OnboardingWizard
        hasSemesters={(allSemesters?.length ?? 0) > 0}
        userId={user?.id || ""}
        userName={firstName}
      />

      {/* ── No Active Semester Banner ── */}
      {!activeSemester && (
        <Link
          href="/semester"
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#ebdcb2] bg-[#fffaf0] p-3 sm:p-4 text-xs sm:text-sm text-[#7a5b03] shadow-xs transition hover:border-[#dfc98c]"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#faedd0] text-[#7a5b03] shrink-0 font-black text-xs">!</span>
            <span><b>Belum ada semester aktif.</b> Hubungkan semester agar agenda dan mata kuliah terfokus.</span>
          </span>
          <span className="shrink-0 font-bold underline text-xs">Pilih Semester →</span>
        </Link>
      )}

      {/* ── Overdue Alert (Clean subtle notification pill) ── */}
      {(overdueCount ?? 0) > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#f7c8be] bg-[#fff6f4] px-4 py-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#feece7] text-[#c53e1c]">
              <AlertTriangle size={13} strokeWidth={2.5} />
            </span>
            <p className="min-w-0 text-xs font-semibold text-[#a33218] leading-tight truncate">
              <b>{overdueCount} kegiatan</b> lewat batas deadline
            </p>
          </div>
          <Link 
            href={`/kegiatan${semesterFilter}`} 
            className="shrink-0 rounded-xl bg-[#c53e1c] px-3 py-1 text-[11px] font-black text-white shadow-2xs hover:bg-[#a93012] transition"
          >
            Tinjau →
          </Link>
        </div>
      )}

      {/* ── LAYANAN UTAMA (Clean 4x2 App Grid with custom app-grade outline icons) ── */}
      <section className="mt-5 rounded-3xl border border-[#d8e3da] bg-white p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#f0f4f0]">
          <h2 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-[#10261b]">
            Layanan Utama
          </h2>
          <span className="text-[11px] font-bold text-[#697c6f]">Pintasan Kampus</span>
        </div>

        <div className="grid grid-cols-4 gap-y-4 gap-x-2 sm:gap-6">
          {[
            {
              id: "jadwal",
              label: "JADWAL",
              href: `/jadwal${semesterFilter}`,
              badge: todayClasses.length > 0 ? `${todayClasses.length}` : null,
              badgeColor: "bg-[#0f6849] text-[#c8ef70]",
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              ),
            },
            {
              id: "catat",
              label: "CATAT",
              href: "/kegiatan?new=1",
              badge: null,
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ),
            },
            {
              id: "kegiatan",
              label: "KEGIATAN",
              href: `/kegiatan${semesterFilter}`,
              badge: (overdueCount ?? 0) > 0 ? "!" : null,
              badgeColor: "bg-[#c53e1c] text-white",
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              id: "modul",
              label: "MODUL",
              href: `/modul${semesterFilter}`,
              badge: null,
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                </svg>
              ),
            },
            {
              id: "organisasi",
              label: "ORGANISASI",
              href: "/organisasi",
              badge: organizations?.length ? `${organizations.length}` : null,
              badgeColor: "bg-[#5c3a9c] text-white",
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              ),
            },
            {
              id: "semester",
              label: "SEMESTER",
              href: "/semester",
              badge: null,
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
            {
              id: "portofolio",
              label: "PORTOFOLIO",
              href: `/rekap/portfolio${semesterFilter}`,
              badge: null,
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              ),
            },
            {
              id: "rekap",
              label: "REKAP AI",
              href: `/rekap${semesterFilter}`,
              badge: "PRO",
              badgeColor: "bg-[#c8ef70] text-[#0f3524]",
              svg: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.9">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              ),
            },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch={true}
              className="group flex flex-col items-center text-center transition active:scale-95"
            >
              <div className="relative grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-[#f4f7f4] text-[#0f6849] transition-all duration-200 group-hover:bg-[#0f6849] group-hover:text-[#c8ef70] group-hover:shadow-md group-hover:-translate-y-0.5">
                {item.svg}
                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-black shadow-xs ${
                      item.badgeColor || "bg-[#0f6849] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-2 block text-[10.5px] sm:text-xs font-black tracking-tight text-[#2b3a30] group-hover:text-[#0f6849] transition">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Main Content Grid ── */}
      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_.6fr]">

        {/* Left Column */}
        <div className="flex flex-col min-w-0 gap-5">

          {/* Today's Classes Widget */}
          <ScrollEntrance delay={240} direction="up">
            <div className="min-w-0 rounded-3xl border border-[#d8e3da] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#a9cdb2]">
              <div className="flex items-center justify-between gap-2 border-b border-[#edf2ee] pb-3.5">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#dff3e5] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0f6849]">
                    <BookOpen size={12} /> KULIAH HARI INI
                  </span>
                  <h2 className="font-display mt-1 text-base sm:text-xl font-black text-[#10261b] tracking-tight truncate">
                    Jadwal Kelas Perkuliahan
                  </h2>
                </div>
                <Link
                  href={`/jadwal${semesterFilter}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#f0f4f0] px-2.5 py-1 text-xs font-bold text-[#0f6849] hover:bg-[#dff3e5] transition"
                >
                  Semua Jadwal <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {todayClasses.length ? (
                  todayClasses.map((c) => (
                    <article
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-[#e5ebe5] bg-[#fafbfa] p-4 transition-all duration-200 hover:bg-white hover:border-[#0f6849]/30 hover:shadow-sm"
                      style={{ borderLeftColor: c.warna_label || "#0f6849", borderLeftWidth: "4px" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#697c6f]">
                            {c.kode_matkul ? `${c.kode_matkul} · ` : ""}{c.sks} SKS
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                              c.tipe_pertemuan === "online"
                                ? "bg-[#e0e7ff] text-[#3730a3]"
                                : c.tipe_pertemuan === "hybrid"
                                ? "bg-[#fef3c7] text-[#92400e]"
                                : "bg-[#dcfce7] text-[#166534]"
                            }`}
                          >
                            {c.tipe_pertemuan}
                          </span>
                        </div>
                        <h3 className="font-display mt-1 font-bold text-sm sm:text-base text-[#10261b] truncate">{c.nama_matkul}</h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#697c6f]">
                          <span className="font-bold text-[#0f6849] flex items-center gap-1">
                            <Clock3 size={13} /> {c.jam_mulai.slice(0, 5)} - {c.jam_selesai.slice(0, 5)} WIB
                          </span>
                          {c.ruangan && (
                            <span className="flex items-center gap-1 font-medium">
                              <MapPin size={13} /> {c.ruangan}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons (Zoom / Drive) */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-[#edf2ee] sm:border-t-0">
                        {c.link_pertemuan && (
                          <a
                            href={c.link_pertemuan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-3 py-2 text-xs font-black text-[#c8ef70] shadow-xs hover:bg-[#1a4a34] transition active:scale-95"
                          >
                            <Video size={13} /> Masuk Kelas
                          </a>
                        )}
                        {c.link_materi && (
                          <a
                            href={c.link_materi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8e3da] bg-white px-3 py-2 text-xs font-bold text-[#10261b] hover:bg-[#f4faf6] transition"
                          >
                            <FileText size={13} /> Materi
                          </a>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#fafbfa] px-4 py-6 text-center border border-dashed border-[#cfe0d3]">
                    <p className="text-xs font-black text-[#0f6849]">🎉 Tidak ada kelas kuliah hari ini</p>
                    <p className="mt-1 text-[11px] text-[#697c6f]">Hari ini bebas dari jadwal tatap muka. Waktu pas untuk istirahat atau cicil tugas!</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollEntrance>

          {/* Today's Schedule */}
          <ScrollEntrance delay={280} direction="up">
            <div className="min-w-0 rounded-3xl border border-[#d8e3da] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#a9cdb2]">
              <div className="flex items-center justify-between gap-2 border-b border-[#edf2ee] pb-3.5">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#eaf3eb] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0f6849]">
                    AGENDA HARI INI
                  </span>
                  <h2 className="font-display mt-1 text-base sm:text-xl font-black text-[#10261b] tracking-tight truncate">
                    Komitmen & Kegiatan
                  </h2>
                </div>
                <Link 
                  href={`/kegiatan?view=calendar${semesterId ? `&semester_id=${semesterId}` : ""}`} 
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#f0f4f0] px-2.5 py-1 text-xs font-bold text-[#0f6849] hover:bg-[#dff3e5] transition"
                >
                  Kalender <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {todaySchedule.length ? (
                  todaySchedule.map((item) => (
                    <article 
                      key={item.id} 
                      className="flex items-center gap-3.5 rounded-2xl border border-[#e8eee8] bg-[#fafbfa] p-3.5 transition-all duration-200 hover:bg-white hover:border-[#0f6849]/30 hover:shadow-xs"
                    >
                      <span className="text-xl shrink-0 p-1.5 rounded-xl bg-white border border-[#e2eae2] shadow-xs">
                        {categoryEmoji[item.kategori] ?? "📎"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display truncate text-xs sm:text-sm font-bold text-[#10261b]">{item.judul}</h3>
                        <p className="text-[11px] sm:text-xs text-[#697c6f] truncate mt-0.5">
                          {item.jam_pelaksanaan ? `🕐 ${item.jam_pelaksanaan}` : "Sepanjang hari"} · <span className="capitalize">{item.kategori}</span>
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${jenisColor[item.jenis_item] ?? "bg-[#f0f4f0] text-[#697c6f]"}`}>
                        {item.jenis_item}
                      </span>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#fafbfa] px-4 py-7 text-center border border-dashed border-[#cfe0d3]">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
                      <Sparkles size={18} />
                    </div>
                    <p className="mt-2.5 text-xs sm:text-sm font-bold text-[#10261b]">Tidak ada agenda terjadwal hari ini</p>
                    <p className="mt-0.5 text-[11px] text-[#697c6f]">Waktu yang ideal untuk beristirahat atau merencanakan ke depan.</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollEntrance>

          {/* Upcoming Deadlines */}
          <ScrollEntrance delay={320} direction="up">
            <div className="min-w-0 rounded-3xl border border-[#d8e3da] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#a9cdb2]">
              <div className="flex items-center justify-between gap-2 border-b border-[#edf2ee] pb-3.5">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#feece7] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#c53e1c]">
                    DEADLINE RADAR
                  </span>
                  <h2 className="font-display mt-1 text-base sm:text-xl font-black text-[#10261b] tracking-tight truncate">
                    Tenggat Waktu Mendesak
                  </h2>
                </div>
                <Link 
                  href={`/kegiatan${semesterFilter}`} 
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#f0f4f0] px-2.5 py-1 text-xs font-bold text-[#0f6849] hover:bg-[#dff3e5] transition"
                >
                  Lihat Semua <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {upcomingItems.length ? (
                  upcomingItems.map((item) => {
                    const days = differenceInCalendarDays(parseISO(item.deadline!), new Date());
                    const isOverdue = days < 0;
                    const isUrgent = days <= 1;
                    return (
                      <article
                        key={item.id}
                        className={`flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-xs ${
                          isOverdue
                            ? "border-[#f8c6b9] bg-[#fff8f7]"
                            : isUrgent
                            ? "border-[#fde8b3] bg-[#fffdf6]"
                            : "border-[#e8eee8] bg-[#fafbfa] hover:bg-white hover:border-[#a9cdb2]"
                        }`}
                      >
                        <span
                          className={`h-3 w-3 shrink-0 rounded-full ring-2 ring-white shadow-xs ${
                            isOverdue ? "bg-[#e87152]" : days === 0 ? "bg-[#e87152] animate-ping" : days === 1 ? "bg-[#f3c84b]" : "bg-[#0f6849]"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display truncate text-xs sm:text-sm font-bold text-[#10261b]">{item.judul}</h3>
                          <p className="mt-0.5 text-[11px] sm:text-xs text-[#697c6f] truncate">
                            {categoryEmoji[item.kategori] ?? "📎"} <span className="capitalize">{item.kategori}</span> · {item.deadline}
                            {item.jam_deadline ? ` · ${item.jam_deadline}` : ""}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-black ${
                            isOverdue
                              ? "bg-[#feece7] text-[#b93c21]"
                              : days === 0
                              ? "bg-[#feece7] text-[#b93c21]"
                              : days === 1
                              ? "bg-[#fff6dd] text-[#9a6900]"
                              : "bg-white text-[#10261b] border border-[#d8e3da]"
                          }`}
                        >
                          {deadlineLabel(item.deadline!)}
                        </span>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-[#fafbfa] px-4 py-7 text-center border border-dashed border-[#cfe0d3]">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
                      <Target size={18} />
                    </div>
                    <p className="mt-2.5 text-xs sm:text-sm font-bold text-[#10261b]">Tidak ada deadline dalam 3 hari ke depan</p>
                    <p className="mt-0.5 text-[11px] text-[#697c6f]">Luar biasa! Seluruh komitmenmu terkontrol on-track.</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollEntrance>
        </div>

        {/* Right Column */}
        <div className="flex flex-col min-w-0 gap-5">

          {/* Weekly Pulse / Motivation */}
          <ScrollEntrance delay={260} direction="scale">
            <aside className="relative overflow-hidden rounded-3xl bg-[#103626] p-6 text-white shadow-md">
              {/* Subtle ambient decorative circle */}
              <div 
                className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full opacity-20 blur-xl"
                style={{ background: "radial-gradient(circle, #c8ef70, transparent 70%)" }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-[#c8ef70]">
                      <Zap size={18} />
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#b4d8c1]">WEEKLY PULSE</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-pulse" />
                </div>

                <h2 className="font-display mt-4 text-lg sm:text-xl font-black leading-snug tracking-tight">
                  {(overdueCount ?? 0) > 0
                    ? `${overdueCount} tugas lewat tenggat — butuh perhatianmu sekarang.`
                    : (activeCount ?? 0) > 0
                    ? "Ritme akademikmu berjalan baik. Pertahankan momentum! 🔥"
                    : "Semua ambisi besar dimulai dari langkah kecil pertama."}
                </h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#c7dbce]">
                  {(overdueCount ?? 0) > 0
                    ? "Selesaikan atau jadwalkan ulang agar beban pikiranmu lebih ringan."
                    : "Pilih satu kegiatan yang paling penting dan selesaikan hari ini."}
                </p>

                {/* Completion mini bar */}
                {totalItems > 0 && (
                  <div className="mt-5 pt-3.5 border-t border-white/15">
                    <div className="flex justify-between text-xs font-bold text-[#b4d8c1]">
                      <span>Progress semester ini</span>
                      <span className="text-[#c8ef70] font-black">{completionRate}% Selesai</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-[#c8ef70] transition-all duration-700"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-white/60 font-medium">{completeCount} dari {totalItems} komitmen terpenuhi</p>
                  </div>
                )}

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-white/50">Navigasi Langsung:</span>
                  <Link
                    href={`/kegiatan${semesterFilter}`}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#c8ef70] hover:underline"
                  >
                    Atur Fokusmu <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </aside>
          </ScrollEntrance>

          {/* Semester Progress */}
          {activeSemester && (
            <ScrollEntrance delay={300} direction="scale">
              <div className="min-w-0 rounded-3xl border border-[#d8e3da] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#a9cdb2]">
                <div className="flex items-center gap-3 border-b border-[#edf2ee] pb-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849] shrink-0">
                    <BookOpen size={16} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[#697c6f]">SEMESTER AKTIF</span>
                    <p className="font-display text-sm sm:text-base font-black text-[#10261b] truncate">{activeSemester.nama_semester}</p>
                  </div>
                </div>

                {activeSemester.tanggal_mulai && activeSemester.tanggal_selesai && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-[#55675b]">
                      <span>Perjalanan Semester</span>
                      <span className="font-black text-[#0f6849]">{semesterProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eff4ef]">
                      <div
                        className="h-full rounded-full bg-[#0f6849] transition-all duration-700"
                        style={{ width: `${semesterProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-[#697c6f] font-medium truncate">
                      {format(parseISO(activeSemester.tanggal_mulai), "d MMM", { locale: id })} –{" "}
                      {format(parseISO(activeSemester.tanggal_selesai), "d MMM yyyy", { locale: id })}
                    </p>
                  </div>
                )}
              </div>
            </ScrollEntrance>
          )}

          {/* Organization Snapshot */}
          {(organizations?.length ?? 0) > 0 && (
            <ScrollEntrance delay={340} direction="scale">
              <div className="min-w-0 rounded-3xl border border-[#d8e3da] bg-white p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[#a9cdb2]">
                <div className="flex items-center justify-between border-b border-[#edf2ee] pb-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#e8e1fa] text-[#5c3a9c] shrink-0">
                      <Building2 size={16} strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[#697c6f]">ORGANISASI</span>
                      <p className="font-display text-sm sm:text-base font-black text-[#10261b] truncate">Ruang Kontribusi</p>
                    </div>
                  </div>
                  <Link 
                    href="/organisasi" 
                    className="inline-flex items-center gap-1 rounded-xl bg-[#f0f4f0] px-2.5 py-1 text-xs font-bold text-[#0f6849] hover:bg-[#dff3e5] transition"
                  >
                    Semua <ArrowUpRight size={13} />
                  </Link>
                </div>

                <div className="mt-4 space-y-2.5">
                  {organizations!.map((org) => {
                    const activeProker = (programs ?? []).filter(
                      (p) => p.organization_id === org.id && p.status === "berjalan"
                    ).length;
                    return (
                      <Link
                        key={org.id}
                        href={`/organisasi/${org.id}`}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8eee8] bg-[#fafbfa] p-3 transition-all duration-200 hover:bg-white hover:border-[#5c3a9c]/30 hover:shadow-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-display truncate text-xs sm:text-sm font-bold text-[#10261b]">{org.nama_organisasi}</p>
                          <p className="text-[10px] sm:text-[11px] text-[#697c6f] truncate mt-0.5">
                            {activeProker > 0 ? `${activeProker} proker aktif` : org.tipe}
                          </p>
                        </div>
                        <ArrowUpRight size={14} className="shrink-0 text-[#8ba091]" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </ScrollEntrance>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = "",
  color,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  href: string;
}) {
  return (
    <Link 
      href={href} 
      prefetch={true}
      className="group relative overflow-hidden rounded-3xl border border-[#d8e3da] bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-[#103626]/30 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-105 ${color}`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-[#8ba091] group-hover:text-[#103626] transition flex items-center gap-0.5">
          Detail ↗
        </span>
      </div>

      <p className="mt-4 text-xs sm:text-sm font-bold text-[#55675b]">{label}</p>
      
      <div className="mt-1 flex items-baseline gap-1">
        <p className="font-display text-3xl sm:text-4xl font-black text-[#10261b] tracking-tight">
          {value.toString().padStart(2, "0")}
        </p>
        {suffix && (
          <span className="font-display text-lg font-bold text-[#55675b]">
            {suffix}
          </span>
        )}
      </div>

      {value === 0 ? (
        <p className="mt-1 text-[10px] sm:text-[11px] font-medium text-[#7d9083]">Belum ada item tercatat</p>
      ) : (
        <div className="mt-2 h-1 w-full rounded-full bg-[#f0f4f0] overflow-hidden">
          <div className="h-full rounded-full bg-[#103626]/30 group-hover:bg-[#0f6849] transition-all duration-500" style={{ width: "100%" }} />
        </div>
      )}
    </Link>
  );
}
