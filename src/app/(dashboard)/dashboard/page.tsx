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
  Zap,
  MapPin,
  Video,
  FileText,
  Clock3,
  Calendar,
  Layers,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncActivityProgressStatuses } from "@/lib/activity-status-sync";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { ScrollEntrance } from "@/components/dashboard/scroll-entrance";

function deadlineLabel(deadline: string) {
  const days = differenceInCalendarDays(parseISO(deadline), new Date());
  if (days < 0) return `${Math.abs(days)}d lewat`;
  if (days === 0) return "Hari Ini!";
  if (days === 1) return "Besok";
  return `${days} hari`;
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
    const total = differenceInCalendarDays(parseISO(activeSemester.tanggal_selesai), parseISO(activeSemester.tanggal_mulai));
    if (total > 0) {
      semesterProgress = Math.min(100, Math.max(0, Math.round(((total + start) / total) * 100)));
    }
  }

  const dateHeading = format(new Date(), "EEEE, d MMMM yyyy", { locale: id });
  const dayNameShort = format(new Date(), "EEE", { locale: id }).toUpperCase();
  const dayNumber = format(new Date(), "dd");
  const monthYearShort = format(new Date(), "MMM yyyy", { locale: id }).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-8 lg:px-10">

      {/* ── 00 // HERO BANNER: CAMPUS ATELIER & COMMAND DECK ── */}
      <header className="relative overflow-hidden rounded-[2rem] border border-[#1b4332] bg-[#0c2419] p-5 sm:p-7 md:p-8 text-white shadow-xl">
        {/* Archival Texture & Subtle Ledger Grid Lines */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#c8ef70 1px, transparent 1px), linear-gradient(90deg, #c8ef70 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />

        {/* Ambient Radial Accent Orbs */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #c8ef70 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -left-12 bottom-0 h-48 w-48 rounded-full opacity-15 blur-2xl"
          style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
        />

        {/* Top Header Row */}
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          
          {/* User Profile & Identity */}
          <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0">
            {profile?.avatar_url ? (
              <div className="relative shrink-0">
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || firstName}
                  width={58}
                  height={58}
                  className="h-13 w-13 sm:h-14 sm:w-14 rounded-2xl object-cover ring-2 ring-[#c8ef70]/40 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#103626] ring-2 ring-[#0c2419]">
                  <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-pulse" />
                </span>
              </div>
            ) : (
              <div className="relative grid h-13 w-13 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-xl font-black text-[#c8ef70] ring-1 ring-white/20 shadow-inner">
                {firstName.slice(0, 1).toUpperCase()}
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#103626] ring-2 ring-[#0c2419]">
                  <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-pulse" />
                </span>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="stamp-badge border-[#c8ef70]/30 bg-[#c8ef70]/10 text-[#d6f792]">
                  {greeting}
                </span>
                <span className="tag-mono text-[10px] text-[#7ea38b]">
                  // {activeSemester ? activeSemester.nama_semester : "WORKSPACE"}
                </span>
              </div>
              <h1 className="font-display mt-1 text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight truncate">
                {profile?.full_name || firstName}
              </h1>
              <p className="tag-mono text-[11px] text-[#a0beaa] mt-0.5 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                {activeSemester ? "Academic Terminal Active" : "Setup Semester Anda"}
              </p>
            </div>
          </div>

          {/* Date Stamp Block (Physical Ledger Ticket Style) */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-2.5 sm:px-4 sm:py-2.5 shadow-inner">
              <div className="border-r border-white/15 pr-3 text-center">
                <span className="tag-mono block text-[9px] font-black text-[#a0beaa]">{dayNameShort}</span>
                <span className="font-display block text-2xl font-black text-[#c8ef70] leading-none mt-0.5">{dayNumber}</span>
              </div>
              <div className="pl-3">
                <span className="tag-mono block text-[9px] font-bold text-[#86a892]">{monthYearShort}</span>
                <span className="block text-xs font-bold text-white">
                  {todayClasses.length > 0 ? `${todayClasses.length} Kuliah Hari Ini` : "Bebas Kuliah 🎉"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom Focus Strip */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Tile 1: Fokus Kuliah Hari Ini */}
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5">
            <div className="min-w-0">
              <span className="tag-mono text-[9px] font-bold uppercase text-[#88ab94] block">KULIAH HARI INI</span>
              <span className="font-display text-sm font-bold text-white truncate block">
                {todayClasses.length > 0 ? todayClasses[0].nama_matkul : "Tidak ada jadwal kelas"}
              </span>
            </div>
            <Link
              href={`/jadwal${semesterFilter}`}
              className="shrink-0 ml-2 rounded-lg bg-white/10 p-1.5 text-[#c8ef70] hover:bg-white/20 transition"
              title="Buka Jadwal"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Tile 2: Deadline Terdekat */}
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5">
            <div className="min-w-0">
              <span className="tag-mono text-[9px] font-bold uppercase text-[#e59887] block">TENGGAT TERDEKAT</span>
              <span className="font-display text-sm font-bold text-white truncate block">
                {upcomingItems.length > 0 ? upcomingItems[0].judul : "Semua tugas beres ✨"}
              </span>
            </div>
            <Link
              href={`/kegiatan${semesterFilter}`}
              className="shrink-0 ml-2 rounded-lg bg-white/10 p-1.5 text-[#e57255] hover:bg-white/20 transition"
              title="Buka Kegiatan"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Tile 3: Progress Capaian */}
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5">
            <div className="min-w-0 flex-1 mr-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-[#88ab94]">
                <span className="tag-mono uppercase">SELESAI</span>
                <span className="text-[#c8ef70] font-black">{completionRate}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[#c8ef70] rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <Link
              href={`/rekap${semesterFilter}`}
              className="shrink-0 rounded-lg bg-white/10 p-1.5 text-[#c8ef70] hover:bg-white/20 transition"
              title="Buka Rekap"
            >
              <ArrowUpRight size={14} />
            </Link>
          </div>

        </div>
      </header>

      {/* ── 01 // METRIC DISK / ARCHIVAL STAT DOCKET ── */}
      <div className="relative z-20 -mt-3 sm:-mt-4 px-2 sm:px-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          
          {/* Card 1: Komitmen Aktif */}
          <Link
            href={`/kegiatan${semesterFilter}`}
            prefetch={true}
            className="group flex flex-col justify-between rounded-2xl border border-[#d6e2d8] bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:border-[#0f6849] hover:shadow-md active:scale-98"
          >
            <div className="flex items-center justify-between">
              <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849]">
                [ACT-01]
              </span>
              <span className="tag-mono text-[10px] font-bold text-[#697c6f] group-hover:text-[#0f6849] transition">
                TUGAS ↗
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <span className="font-display text-2xl sm:text-4xl font-black text-[#10261b] tracking-tight group-hover:text-[#0f6849] transition leading-none">
                {activeCount ?? 0}
              </span>
              <p className="tag-mono text-[10px] sm:text-xs font-bold text-[#455c4e] mt-1 truncate">
                Komitmen Aktif
              </p>
            </div>
          </Link>

          {/* Card 2: Tenggat Kritis */}
          <Link
            href={`/kegiatan${semesterFilter}`}
            prefetch={true}
            className={`group flex flex-col justify-between rounded-2xl border p-3 sm:p-4 shadow-sm transition-all duration-200 active:scale-98 ${
              (overdueCount ?? 0) > 0 
                ? "border-[#f7c5ba] bg-[#fffbfb] hover:border-[#c53e1c] hover:shadow-md" 
                : "border-[#d6e2d8] bg-white hover:border-[#d97706] hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`stamp-badge ${
                (overdueCount ?? 0) > 0
                  ? "border-[#f7c5ba] bg-[#feece7] text-[#c53e1c]"
                  : "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
              }`}>
                {(overdueCount ?? 0) > 0 ? "! ALERT" : "[DLN-02]"}
              </span>
              <span className={`tag-mono text-[10px] font-bold transition ${
                (overdueCount ?? 0) > 0 ? "text-[#c53e1c]" : "text-[#697c6f] group-hover:text-[#92400e]"
              }`}>
                URGEN ↗
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <span className={`font-display text-2xl sm:text-4xl font-black tracking-tight leading-none ${
                (overdueCount ?? 0) > 0 ? "text-[#c53e1c]" : "text-[#10261b] group-hover:text-[#92400e]"
              }`}>
                {(overdueCount ?? 0) > 0 ? overdueCount : upcomingItems.length}
              </span>
              <p className={`tag-mono text-[10px] sm:text-xs font-bold mt-1 truncate ${
                (overdueCount ?? 0) > 0 ? "text-[#c53e1c]" : "text-[#78350f]"
              }`}>
                {(overdueCount ?? 0) > 0 ? "Perlu Ditinjau" : "Deadline Dekat"}
              </p>
            </div>
          </Link>

          {/* Card 3: Penyelesaian */}
          <Link
            href={`/rekap${semesterFilter}`}
            prefetch={true}
            className="group flex flex-col justify-between rounded-2xl border border-[#d6e2d8] bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:border-[#5c3a9c] hover:shadow-md active:scale-98"
          >
            <div className="flex items-center justify-between">
              <span className="stamp-badge border-[#d8b4fe] bg-[#f3e8ff] text-[#6b21a8]">
                [RKP-03]
              </span>
              <span className="tag-mono text-[10px] font-bold text-[#697c6f] group-hover:text-[#6b21a8] transition">
                REKAP ↗
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3">
              <span className="font-display text-2xl sm:text-4xl font-black text-[#10261b] tracking-tight group-hover:text-[#6b21a8] transition leading-none">
                {completeCount ?? 0}
              </span>
              <p className="tag-mono text-[10px] sm:text-xs font-bold text-[#5c3a9c] mt-1 truncate">
                Target Terpenuhi
              </p>
            </div>
          </Link>

        </div>
      </div>

      {/* ── Onboarding Modal & Guided Tour ── */}
      <OnboardingWizard
        hasSemesters={(allSemesters?.length ?? 0) > 0}
        userId={user?.id || ""}
        userName={firstName}
      />

      {/* ── No Active Semester Alert ── */}
      {!activeSemester && (
        <Link
          href="/semester"
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#ebdcb2] bg-[#fffaf0] p-3.5 sm:p-4 text-xs sm:text-sm text-[#7a5b03] shadow-xs transition hover:border-[#dfc98c]"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#faedd0] text-[#7a5b03] shrink-0 font-black text-xs">!</span>
            <span><b>Belum ada semester aktif.</b> Hubungkan semester agar agenda dan mata kuliah terfokus rapi.</span>
          </span>
          <span className="tag-mono shrink-0 font-bold underline text-xs">SET TANGGAL →</span>
        </Link>
      )}

      {/* ── Overdue Banner Alert ── */}
      {(overdueCount ?? 0) > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#f7c8be] bg-[#fff6f4] px-4 py-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#feece7] text-[#c53e1c]">
              <AlertTriangle size={13} strokeWidth={2.5} />
            </span>
            <p className="min-w-0 text-xs font-semibold text-[#a33218] leading-tight truncate">
              <b>{overdueCount} kegiatan</b> melewati batas deadline yang ditentukan
            </p>
          </div>
          <Link 
            href={`/kegiatan${semesterFilter}`} 
            className="tag-mono shrink-0 rounded-xl bg-[#c53e1c] px-3 py-1.5 text-[11px] font-black text-white shadow-2xs hover:bg-[#a93012] transition"
          >
            TINJAU SEKARANG →
          </Link>
        </div>
      )}

      {/* ── 02 // PUSAT AKSI & PINTASAN TERMINAL (Physical Index Card Switchboard) ── */}
      <section className="mt-6 rounded-3xl border border-[#d6e1d8] bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#edf2ee]">
          <div className="flex items-center gap-2">
            <span className="tag-mono text-xs font-black text-[#0f6849]">02 //</span>
            <h2 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-[#10261b]">
              Pusat Aksi & Layanan Mahasiswa
            </h2>
          </div>
          <span className="tag-mono text-[10px] font-bold text-[#697c6f]">CAMPUS DOCKET</span>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
          {[
            {
              id: "jadwal",
              label: "Jadwal",
              sub: "Kelas",
              href: `/jadwal${semesterFilter}`,
              badge: todayClasses.length > 0 ? `${todayClasses.length}` : null,
              badgeColor: "bg-[#0f6849] text-[#c8ef70]",
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )
            },
            {
              id: "catat",
              label: "Catat",
              sub: "+ Baru",
              href: "/kegiatan?new=1",
              badge: null,
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              )
            },
            {
              id: "kegiatan",
              label: "Kegiatan",
              sub: "Tugas",
              href: `/kegiatan${semesterFilter}`,
              badge: (overdueCount ?? 0) > 0 ? "!" : null,
              badgeColor: "bg-[#c53e1c] text-white",
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
              )
            },
            {
              id: "modul",
              label: "Modul",
              sub: "Materi",
              href: `/modul${semesterFilter}`,
              badge: null,
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )
            },
            {
              id: "organisasi",
              label: "Organisasi",
              sub: "Ormawa",
              href: "/organisasi",
              badge: organizations?.length ? `${organizations.length}` : null,
              badgeColor: "bg-[#5c3a9c] text-white",
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              )
            },
            {
              id: "semester",
              label: "Semester",
              sub: "Kurikulum",
              href: "/semester",
              badge: null,
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              )
            },
            {
              id: "portofolio",
              label: "Portofolio",
              sub: "Karier & CV",
              href: `/rekap/portfolio${semesterFilter}`,
              badge: null,
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                </svg>
              )
            },
            {
              id: "rekap",
              label: "Rekap AI",
              sub: "Analitik",
              href: `/rekap${semesterFilter}`,
              badge: "PRO",
              badgeColor: "bg-[#c8ef70] text-[#0f3524]",
              customSvg: (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.143 2.143L15 7.5" />
                </svg>
              )
            },
          ].map((item) => (
            <Link
              key={item.id}
              href={item.href}
              prefetch={true}
              className="group flex flex-col items-center justify-center rounded-2xl border border-[#e2eae3] bg-[#fafbfa] p-2.5 sm:p-3 text-center transition-all duration-200 hover:bg-white hover:border-[#0f6849]/40 hover:shadow-xs active:scale-95"
            >
              <div className="relative grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl bg-white border border-[#d6e1d8] text-[#0f6849] transition-all duration-200 group-hover:bg-[#103626] group-hover:text-[#c8ef70] group-hover:border-[#103626] shadow-2xs">
                {item.customSvg}
                {item.badge && (
                  <span
                    className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[8.5px] font-black shadow-xs ${
                      item.badgeColor || "bg-[#0f6849] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-2 block text-[11px] sm:text-xs font-black tracking-tight text-[#173022] group-hover:text-[#0f6849] transition leading-tight">
                {item.label}
              </span>
              <span className="tag-mono block text-[9px] text-[#718778] truncate mt-0.5">
                {item.sub}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 03 // WORKSPACE MAIN COLUMNS: ATELIER SCHEDULE & RADAR ── */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.38fr_.62fr]">

        {/* Left Column: Lecture Hall & Daily Commitments */}
        <div className="flex flex-col min-w-0 gap-6">

          {/* Today's Classes: Lecture Timetable */}
          <ScrollEntrance delay={120} direction="up">
            <div className="rounded-3xl border border-[#d6e1d8] bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-[#edf2ee] pb-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="tag-mono text-xs font-black text-[#0f6849]">03 //</span>
                    <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849]">
                      TIMETABLE HARI INI
                    </span>
                  </div>
                  <h2 className="font-display mt-1 text-base sm:text-xl font-black text-[#10261b] tracking-tight truncate">
                    Jadwal Kuliah & Tatap Muka
                  </h2>
                </div>
                <Link
                  href={`/jadwal${semesterFilter}`}
                  className="tag-mono inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#f0f4f0] px-3 py-1.5 text-xs font-black text-[#0f6849] hover:bg-[#dff3e5] transition"
                >
                  SELEKSI HARI <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {todayClasses.length ? (
                  todayClasses.map((c, idx) => (
                    <article
                      key={c.id}
                      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-[#e1eae2] bg-[#fcfdfc] p-4 transition-all duration-200 hover:bg-white hover:border-[#0f6849]/40 hover:shadow-xs"
                      style={{ borderLeftColor: c.warna_label || "#0f6849", borderLeftWidth: "4px" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="tag-mono text-[10px] font-black uppercase text-[#526a5b]">
                            [KUL-0{idx + 1}] {c.kode_matkul ? `${c.kode_matkul} · ` : ""}{c.sks} SKS
                          </span>
                          <span
                            className={`stamp-badge ${
                              c.tipe_pertemuan === "online"
                                ? "border-[#c7d2fe] bg-[#e0e7ff] text-[#3730a3]"
                                : c.tipe_pertemuan === "hybrid"
                                ? "border-[#fde68a] bg-[#fef3c7] text-[#92400e]"
                                : "border-[#bbf7d0] bg-[#dcfce7] text-[#166534]"
                            }`}
                          >
                            {c.tipe_pertemuan}
                          </span>
                        </div>
                        <h3 className="font-display mt-1 font-black text-sm sm:text-base text-[#10261b] truncate group-hover:text-[#0f6849] transition">
                          {c.nama_matkul}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[#697c6f]">
                          <span className="tag-mono font-bold text-[#0f6849] flex items-center gap-1">
                            <Clock3 size={13} /> {c.jam_mulai.slice(0, 5)} - {c.jam_selesai.slice(0, 5)} WIB
                          </span>
                          {c.ruangan && (
                            <span className="flex items-center gap-1 font-medium text-[#465c4e]">
                              <MapPin size={13} /> {c.ruangan}
                            </span>
                          )}
                          {c.dosen_pengampu && (
                            <span className="tag-mono text-[11px] text-[#718778]">
                              · {c.dosen_pengampu}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons (Zoom / Classroom / Drive) */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-[#edf2ee] sm:border-t-0">
                        {c.link_pertemuan && (
                          <a
                            href={c.link_pertemuan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tag-mono inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-3.5 py-2 text-xs font-black text-[#c8ef70] shadow-xs hover:bg-[#1a4a34] transition active:scale-95"
                          >
                            <Video size={13} /> MASUK KELAS
                          </a>
                        )}
                        {c.link_materi && (
                          <a
                            href={c.link_materi}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tag-mono inline-flex items-center gap-1.5 rounded-xl border border-[#d8e3da] bg-white px-3 py-2 text-xs font-bold text-[#10261b] hover:bg-[#f4faf6] transition"
                          >
                            <FileText size={13} /> MATERI
                          </a>
                        )}
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#fafbfa] px-4 py-8 text-center border border-dashed border-[#c5d8cb]">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
                      <Sparkles size={20} />
                    </div>
                    <p className="font-display mt-2.5 text-sm font-black text-[#10261b]">Bebas dari jadwal perkuliahan hari ini</p>
                    <p className="tag-mono mt-1 text-xs text-[#697c6f]">Gunakan waktu luang untuk mencicil modul kuliah atau agenda organisasi.</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollEntrance>

          {/* Today's Agenda & Commitments */}
          <ScrollEntrance delay={160} direction="up">
            <div className="rounded-3xl border border-[#d6e1d8] bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-[#edf2ee] pb-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="tag-mono text-xs font-black text-[#0f6849]">04 //</span>
                    <span className="stamp-badge border-[#d6e2d8] bg-[#f4f7f4] text-[#425a4c]">
                      AGENDA & DEADLINE HARI INI
                    </span>
                  </div>
                  <h2 className="font-display mt-1 text-base sm:text-xl font-black text-[#10261b] tracking-tight truncate">
                    Buku Log Kegiatan Harian
                  </h2>
                </div>
                <Link 
                  href={`/kegiatan?view=calendar${semesterId ? `&semester_id=${semesterId}` : ""}`} 
                  className="tag-mono inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#f0f4f0] px-3 py-1.5 text-xs font-black text-[#0f6849] hover:bg-[#dff3e5] transition"
                >
                  KALENDER <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-4 space-y-2.5">
                {todaySchedule.length ? (
                  todaySchedule.map((item) => (
                    <article 
                      key={item.id} 
                      className="flex items-center gap-3.5 rounded-2xl border border-[#e5ece5] bg-[#fafbfa] p-3.5 transition-all duration-200 hover:bg-white hover:border-[#0f6849]/30 hover:shadow-xs"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white border border-[#d8e3da] text-[#0f6849] shadow-2xs">
                        <Calendar size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display truncate text-xs sm:text-sm font-black text-[#10261b]">{item.judul}</h3>
                        <p className="tag-mono text-[11px] text-[#697c6f] truncate mt-0.5">
                          {item.jam_pelaksanaan ? `🕐 ${item.jam_pelaksanaan} WIB` : "Sepanjang hari"} · <span className="uppercase">{item.kategori}</span>
                        </p>
                      </div>
                      <span className="stamp-badge border-[#d8e3da] bg-white text-[#425a4c]">
                        {item.jenis_item}
                      </span>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#fafbfa] px-4 py-7 text-center border border-dashed border-[#c5d8cb]">
                    <p className="tag-mono text-xs font-bold text-[#10261b]">Tidak ada agenda tercatat hari ini</p>
                    <p className="text-[11px] text-[#697c6f] mt-0.5">Jaga fokusmu tetap prima atau istirahat sejenak.</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollEntrance>

          {/* Urgent Deadline Radar */}
          <ScrollEntrance delay={200} direction="up">
            <div className="rounded-3xl border border-[#d6e1d8] bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-[#edf2ee] pb-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="tag-mono text-xs font-black text-[#c53e1c]">05 //</span>
                    <span className="stamp-badge border-[#f8c6b9] bg-[#fff8f7] text-[#c53e1c]">
                      RADAR TENGGAT
                    </span>
                  </div>
                  <h2 className="font-display mt-1 text-base sm:text-xl font-black text-[#10261b] tracking-tight truncate">
                    Deadline 3 Hari Mendatang
                  </h2>
                </div>
                <Link 
                  href={`/kegiatan${semesterFilter}`} 
                  className="tag-mono inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#f0f4f0] px-3 py-1.5 text-xs font-black text-[#0f6849] hover:bg-[#dff3e5] transition"
                >
                  SEMUA TUGAS <ArrowUpRight size={13} />
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
                        className={`flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 ${
                          isOverdue
                            ? "border-[#f8c6b9] bg-[#fff8f7]"
                            : isUrgent
                            ? "border-[#fde8b3] bg-[#fffdf6]"
                            : "border-[#e5ece5] bg-[#fafbfa] hover:bg-white hover:border-[#a9cdb2]"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white shadow-xs ${
                            isOverdue ? "bg-[#e87152]" : days === 0 ? "bg-[#e87152] animate-ping" : days === 1 ? "bg-[#f3c84b]" : "bg-[#0f6849]"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display truncate text-xs sm:text-sm font-black text-[#10261b]">{item.judul}</h3>
                          <p className="tag-mono mt-0.5 text-[11px] text-[#697c6f] truncate">
                            {item.kategori.toUpperCase()} · {item.deadline}
                            {item.jam_deadline ? ` @ ${item.jam_deadline}` : ""}
                          </p>
                        </div>
                        <span
                          className={`stamp-badge ${
                            isOverdue
                              ? "border-[#f8c6b9] bg-[#feece7] text-[#b93c21]"
                              : days === 0
                              ? "border-[#f8c6b9] bg-[#feece7] text-[#b93c21]"
                              : days === 1
                              ? "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]"
                              : "border-[#d8e3da] bg-white text-[#10261b]"
                          }`}
                        >
                          {deadlineLabel(item.deadline!)}
                        </span>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-[#fafbfa] px-4 py-7 text-center border border-dashed border-[#c5d8cb]">
                    <p className="tag-mono text-xs font-bold text-[#10261b]">Radar bersih ✨</p>
                    <p className="text-[11px] text-[#697c6f] mt-0.5">Tidak ada deadline yang menanti dalam 3 hari ke depan.</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollEntrance>
        </div>

        {/* Right Column: Weekly Insight, Semester Arc, & Ormawa */}
        <div className="flex flex-col min-w-0 gap-6">

          {/* Weekly Pulse Atelier Card */}
          <ScrollEntrance delay={140} direction="scale">
            <aside className="relative overflow-hidden rounded-3xl bg-[#0e2c1e] p-6 text-white shadow-md border border-[#1d4734]">
              <div 
                className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full opacity-20 blur-xl"
                style={{ background: "radial-gradient(circle, #c8ef70, transparent 70%)" }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-white/10 text-[#c8ef70]">
                      <Zap size={15} />
                    </span>
                    <span className="tag-mono text-[10px] font-black uppercase text-[#b4d8c1]">WEEKLY PULSE</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#c8ef70] animate-pulse" />
                </div>

                <h3 className="font-display mt-4 text-base sm:text-lg font-black leading-snug tracking-tight text-white">
                  {(overdueCount ?? 0) > 0
                    ? `${overdueCount} tugas melewati deadline.`
                    : (activeCount ?? 0) > 0
                    ? "Ritme perkuliahanmu berjalan solid. Pertahankan fokus! 🔥"
                    : "Ruang kerja rapi. Siap memulai komitmen baru."}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#bad1c2]">
                  {(overdueCount ?? 0) > 0
                    ? "Segera tuntaskan atau jadwalkan ulang agar beban tugas tidak menumpuk."
                    : "Fokus pada 1 tugas prioritas utama hari ini untuk hasil maksimal."}
                </p>

                {totalItems > 0 && (
                  <div className="mt-5 pt-3.5 border-t border-white/15">
                    <div className="flex justify-between tag-mono text-[11px] font-bold text-[#b4d8c1]">
                      <span>SEMESTER PROGRES</span>
                      <span className="text-[#c8ef70] font-black">{completionRate}% TUNTAS</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                      <div
                        className="h-full rounded-full bg-[#c8ef70] transition-all duration-700"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                    <p className="tag-mono mt-1.5 text-[10px] text-white/60">{completeCount} dari {totalItems} target akademik tercapai</p>
                  </div>
                )}

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="tag-mono text-[10px] text-white/50">FOKUS PRIORITAS:</span>
                  <Link
                    href={`/kegiatan${semesterFilter}`}
                    className="tag-mono inline-flex items-center gap-1 text-xs font-black text-[#c8ef70] hover:underline"
                  >
                    ATUR TUGAS <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </aside>
          </ScrollEntrance>

          {/* Semester Progress Card */}
          {activeSemester && (
            <ScrollEntrance delay={180} direction="scale">
              <div className="rounded-3xl border border-[#d6e1d8] bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#edf2ee] pb-3.5">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849] shrink-0 font-black tag-mono text-xs">
                    06
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="tag-mono block text-[10px] font-black uppercase text-[#697c6f]">SEMESTER AKTIF</span>
                    <p className="font-display text-sm sm:text-base font-black text-[#10261b] truncate">{activeSemester.nama_semester}</p>
                  </div>
                </div>

                {activeSemester.tanggal_mulai && activeSemester.tanggal_selesai && (
                  <div className="mt-4">
                    <div className="flex justify-between tag-mono text-xs font-bold text-[#55675b]">
                      <span>Jejak Kalender</span>
                      <span className="font-black text-[#0f6849]">{semesterProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eff4ef]">
                      <div
                        className="h-full rounded-full bg-[#0f6849] transition-all duration-700"
                        style={{ width: `${semesterProgress}%` }}
                      />
                    </div>
                    <p className="tag-mono mt-2 text-[10.5px] text-[#697c6f] truncate">
                      {format(parseISO(activeSemester.tanggal_mulai), "d MMM", { locale: id })} –{" "}
                      {format(parseISO(activeSemester.tanggal_selesai), "d MMM yyyy", { locale: id })}
                    </p>
                  </div>
                )}
              </div>
            </ScrollEntrance>
          )}

          {/* Ormawa Snapshot */}
          {(organizations?.length ?? 0) > 0 && (
            <ScrollEntrance delay={220} direction="scale">
              <div className="rounded-3xl border border-[#d6e1d8] bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#edf2ee] pb-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f3e8ff] text-[#7e22ce] shrink-0 font-black tag-mono text-xs">
                      07
                    </span>
                    <div className="min-w-0">
                      <span className="tag-mono block text-[10px] font-black uppercase text-[#697c6f]">ORMAWA & PROKER</span>
                      <p className="font-display text-sm sm:text-base font-black text-[#10261b] truncate">Kepanitiaan & Tim</p>
                    </div>
                  </div>
                  <Link 
                    href="/organisasi" 
                    className="tag-mono inline-flex items-center gap-1 rounded-xl bg-[#f0f4f0] px-2.5 py-1 text-xs font-bold text-[#0f6849] hover:bg-[#dff3e5] transition"
                  >
                    SEMUA <ArrowUpRight size={12} />
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
                        className="group flex items-center justify-between gap-3 rounded-2xl border border-[#e5ece5] bg-[#fafbfa] p-3 transition-all duration-200 hover:bg-white hover:border-[#7e22ce]/30 hover:shadow-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-display truncate text-xs sm:text-sm font-black text-[#10261b] group-hover:text-[#7e22ce] transition">{org.nama_organisasi}</p>
                          <p className="tag-mono text-[10px] text-[#697c6f] truncate mt-0.5">
                            {activeProker > 0 ? `${activeProker} proker aktif` : org.tipe.toUpperCase()}
                          </p>
                        </div>
                        <ArrowUpRight size={14} className="shrink-0 text-[#8ba091] group-hover:text-[#7e22ce] transition" />
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
