import Link from "next/link";
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

  const { data: { user } } = await supabase.auth.getUser();

  // Auto sync activity progress status when scheduled time arrives
  if (user) {
    await syncActivityProgressStatuses(supabase, user.id);
  }
  const [
    { data: profile },
    { data: activeSemester },
    { data: allSemesters },
    { data: organizations },
    { data: programs },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").single(),
    supabase.from("semesters").select("id,nama_semester,tanggal_mulai,tanggal_selesai").eq("is_active", true).maybeSingle(),
    supabase.from("semesters").select("id").order("created_at", { ascending: false }),
    supabase.from("organizations").select("id,nama_organisasi,tipe").order("created_at", { ascending: false }).limit(3),
    supabase.from("programs").select("organization_id,status").order("created_at", { ascending: false }),
  ]);

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

      {/* ── Hero Header ── */}
      <header className="relative overflow-hidden rounded-3xl border border-[#d6e2d8] bg-gradient-to-br from-white via-[#fbfdfa] to-[#edf5ee] p-5 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Subtle Ambient Decorative Glow */}
        <div 
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-35 blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(200,239,112,.6), transparent 70%)" }}
        />
        <div 
          className="pointer-events-none absolute right-32 -bottom-16 h-40 w-40 rounded-full opacity-20 blur-xl"
          style={{ background: "radial-gradient(circle, rgba(15,104,73,.5), transparent 70%)" }}
        />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#0f6849]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse" />
                {dateHeading}
              </span>
              {activeSemester && (
                <span className="hidden sm:inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#55675b] border border-[#d8e2da]">
                  {activeSemester.nama_semester}
                </span>
              )}
            </div>

            <h1 className="font-display mt-2.5 text-2xl sm:text-4xl font-black tracking-tight text-[#10261b]">
              {greeting}, <span className="text-[#0f6849]">{firstName}.</span> 👋
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#55675b] max-w-2xl">
              {(overdueCount ?? 0) > 0
                ? `⚠️ Ada ${overdueCount} item lewat deadline — yuk diselesaikan dulu agar ritmemu tenang.`
                : todaySchedule.length > 0
                ? `Kamu punya ${todaySchedule.length} agenda hari ini. Terus jaga momentum belajarmu! 💪`
                : activeSemester
                ? `Semua tugas terkontrol rapi di ${activeSemester.nama_semester}. Hari ini bebas jadwal, waktu yang baik untuk proaktif.`
                : "Pilih semester aktif agar seluruh jadwal dan deadline terpetakan optimal."}
            </p>
          </div>

          {/* Quick Action Button */}
          <Link
            href="/kegiatan"
            data-tour="hero-add-kegiatan"
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-[#103626] px-5 py-3 text-xs sm:text-sm font-black text-[#c8ef70] shadow-md shadow-[#103626]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1a4a34] hover:shadow-lg active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} /> Tambah Kegiatan
          </Link>
        </div>
      </header>

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
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[#ebdcb2] bg-[#fffaf0] p-4 text-xs sm:text-sm text-[#7a5b03] shadow-xs transition hover:border-[#dfc98c]"
        >
          <span className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#faedd0] text-[#7a5b03] shrink-0 font-black">!</span>
            <span><b>Belum ada semester aktif.</b> Hubungkan semester agar agenda dan mata kuliahmu terfokus rapi.</span>
          </span>
          <span className="shrink-0 font-bold underline">Pilih Semester →</span>
        </Link>
      )}

      {/* ── Overdue Alert ── */}
      {(overdueCount ?? 0) > 0 && (
        <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-[#f7c8be] bg-[#fff6f4] p-4 shadow-xs">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#feece7] text-[#c53e1c]">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </span>
          <p className="min-w-0 flex-1 text-xs sm:text-sm font-semibold text-[#a33218]">
            <b>{overdueCount} kegiatan</b> sudah melewati batas waktu deadline tanpa ditandai selesai.
          </p>
          <Link 
            href={`/kegiatan${semesterFilter}`} 
            className="shrink-0 rounded-xl bg-[#c53e1c] px-3.5 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#a93012] transition"
          >
            Tinjau Sekarang →
          </Link>
        </div>
      )}

      {/* ── Quick Action Hub ── */}
      <ScrollEntrance delay={100} direction="up">
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              icon: <CalendarPlus size={20} strokeWidth={2.2} />,
              label: "Jadwalkan Rapat",
              sub: "Agenda & kelas",
              href: "/kegiatan",
              color: "bg-[#dff3e5] text-[#0f6849]",
              borderHover: "hover:border-[#0f6849]/40",
            },
            {
              icon: <FileText size={20} strokeWidth={2.2} />,
              label: "Catat Tugas",
              sub: "Deadline & matkul",
              href: "/kegiatan",
              color: "bg-[#feece7] text-[#c53e1c]",
              borderHover: "hover:border-[#c53e1c]/40",
            },
            {
              icon: <Building2 size={20} strokeWidth={2.2} />,
              label: "Ruang Organisasi",
              sub: "Proker & tim divisi",
              href: "/organisasi",
              color: "bg-[#e8e1fa] text-[#5c3a9c]",
              borderHover: "hover:border-[#5c3a9c]/40",
            },
            {
              icon: <BarChart3 size={20} strokeWidth={2.2} />,
              label: "Rekap & Portofolio",
              sub: "Progress & resume",
              href: "/rekap",
              color: "bg-[#fff0cc] text-[#8a5d00]",
              borderHover: "hover:border-[#8a5d00]/40",
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#d8e3da] bg-white p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${action.borderHover}`}
            >
              <div className="flex items-center justify-between">
                <span className={`grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${action.color}`}>
                  {action.icon}
                </span>
                <span className="text-[11px] font-bold text-[#8ba091] group-hover:text-[#103626] transition">
                  →
                </span>
              </div>
              <div className="min-w-0 mt-4">
                <p className="truncate text-xs sm:text-sm font-black text-[#10261b] tracking-tight">{action.label}</p>
                <p className="truncate text-[11px] font-medium text-[#65746a] mt-0.5">{action.sub}</p>
              </div>
            </Link>
          ))}
        </section>
      </ScrollEntrance>

      {/* ── Stats Row ── */}
      <ScrollEntrance delay={180} direction="scale">
        <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <StatCard
            icon={<CalendarDays size={18} />}
            label="Kegiatan aktif"
            value={activeCount ?? 0}
            color="bg-[#dcefe4] text-[#17613e]"
            href={`/kegiatan${semesterFilter}`}
          />
          <StatCard
            icon={<CheckCircle2 size={18} />}
            label="Sudah selesai"
            value={completeCount ?? 0}
            color="bg-[#e8e1fa] text-[#744bb1]"
            href={`/rekap${semesterFilter}`}
          />
          <StatCard
            icon={<Clock3 size={18} />}
            label="Penyelesaian"
            value={completionRate}
            suffix="%"
            color="bg-[#fff0cc] text-[#9a6900]"
            href={`/rekap${semesterFilter}`}
          />
        </section>
      </ScrollEntrance>

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
