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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

  const [
    { data: upcomingActivities },
    { data: todayActivities },
    { count: activeCount },
    { count: completeCount },
    { count: overdueCount },
  ] = await Promise.all([
    upcomingQuery,
    todayQuery,
    activeCountQuery,
    completeCountQuery,
    overdueCountQuery,
  ]);

  const upcomingItems = upcomingActivities ?? [];
  const todaySchedule = todayActivities ?? [];
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
      <header className="dashboard-hero">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--brand)] opacity-70">{dateHeading}</p>
            <h1 className="font-display mt-2 text-2xl font-black tracking-tight sm:text-4xl">
              {greeting}, <span className="text-[var(--brand)]">{firstName}.</span> 👋
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
              {(overdueCount ?? 0) > 0
                ? `⚠️ Ada ${overdueCount} item lewat deadline — yuk diselesaikan dulu.`
                : todaySchedule.length > 0
                ? `Kamu punya ${todaySchedule.length} agenda hari ini. Semangat! 💪`
                : activeSemester
                ? `Fokus di ${activeSemester.nama_semester}. Tidak ada agenda hari ini, waktu yang baik untuk proaktif.`
                : "Pilih semester aktif agar dashboard lebih fokus."}
            </p>
          </div>

          {/* Quick add button */}
          <Link
            href="/kegiatan"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#1f6a48]/15 hover:bg-[var(--brand-dark)] transition active:scale-95"
          >
            <Plus size={16} /> Tambah kegiatan
          </Link>
        </div>
      </header>

      {/* ── No Active Semester Banner ── */}
      {!activeSemester && (
        <Link
          href="/semester"
          className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[#ead8a3] bg-[#fff9e6] p-4 text-xs sm:text-sm text-[#765800]"
        >
          <span><b>Belum ada semester aktif.</b> Semua kegiatanmu ditampilkan bersama.</span>
          <span className="shrink-0 font-bold">Pilih semester →</span>
        </Link>
      )}

      {/* ── Overdue Alert ── */}
      {(overdueCount ?? 0) > 0 && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#f8c6b9] bg-[#fff4f2] p-4">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#feece7] text-[#c53e1c]">
            <AlertTriangle size={16} strokeWidth={2.5} />
          </span>
          <p className="min-w-0 flex-1 text-xs sm:text-sm font-semibold text-[#a33218]">
            <b>{overdueCount} kegiatan</b> sudah melewati deadline tanpa ditandai selesai.
          </p>
          <Link href={`/kegiatan${semesterFilter}`} className="shrink-0 text-xs font-black text-[#b93c21] hover:underline">
            Lihat →
          </Link>
        </div>
      )}

      {/* ── Quick Action Hub ── */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            icon: <CalendarPlus size={20} strokeWidth={2} />,
            label: "Jadwalkan Rapat",
            sub: "Tambah agenda",
            href: "/kegiatan",
            color: "bg-[#dff3e5] text-[#0f6849] group-hover:bg-[#c8ebd6]",
          },
          {
            icon: <FileText size={20} strokeWidth={2} />,
            label: "Catat Tugas",
            sub: "Tambah deadline",
            href: "/kegiatan",
            color: "bg-[#feece7] text-[#c53e1c] group-hover:bg-[#fcddd6]",
          },
          {
            icon: <Building2 size={20} strokeWidth={2} />,
            label: "Organisasi",
            sub: "Ruang kontribusi",
            href: "/organisasi",
            color: "bg-[#e8e1fa] text-[#5c3a9c] group-hover:bg-[#ddd4f7]",
          },
          {
            icon: <BarChart3 size={20} strokeWidth={2} />,
            label: "Lihat Rekap",
            sub: "Progress & grafik",
            href: "/rekap",
            color: "bg-[#fff0cc] text-[#8a5d00] group-hover:bg-[#ffe8a8]",
          },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group surface-lift flex flex-col gap-2.5 rounded-2xl border border-[var(--line)] bg-white p-3.5 sm:p-4 transition hover:border-[#b9ddc6]"
          >
            <span className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl transition ${action.color}`}>
              {action.icon}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-black text-[var(--ink)]">{action.label}</p>
              <p className="truncate text-[11px] sm:text-xs text-[var(--muted)]">{action.sub}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* ── Stats Row ── */}
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

      {/* ── Main Content Grid ── */}
      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_.6fr]">

        {/* Left Column */}
        <div className="flex flex-col min-w-0 gap-5">

          {/* Today's Schedule */}
          <div className="surface-lift min-w-0 rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--brand)]">HARI INI</p>
                <h2 className="font-display mt-0.5 text-base sm:text-xl font-extrabold text-[var(--ink)] truncate">
                  Agenda & jadwal hari ini
                </h2>
              </div>
              <Link href={`/kegiatan?view=calendar${semesterId ? `&semester_id=${semesterId}` : ""}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-[var(--brand)] hover:underline">
                Kalender <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {todaySchedule.length ? (
                todaySchedule.map((item) => (
                  <article key={item.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3 transition hover:border-[#b9ddc6]">
                    <span className="text-lg shrink-0">{categoryEmoji[item.kategori] ?? "📎"}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-xs sm:text-sm font-bold text-[var(--ink)]">{item.judul}</h3>
                      <p className="text-[11px] sm:text-xs text-[var(--muted)] truncate">
                        {item.jam_pelaksanaan ? `🕐 ${item.jam_pelaksanaan}` : "Sepanjang hari"} · {item.kategori}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide ${jenisColor[item.jenis_item] ?? "bg-[#f7f8f5] text-[var(--muted)]"}`}>
                      {item.jenis_item}
                    </span>
                  </article>
                ))
              ) : (
                <div className="rounded-xl bg-[#f7f8f5] px-4 py-7 text-center">
                  <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#dcefe4] text-[var(--brand)]">
                    <Sparkles size={17} />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-bold">Tidak ada agenda hari ini</p>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[var(--muted)]">Waktu yang baik untuk merencanakan ke depan.</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="surface-lift min-w-0 rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--brand)]">PERLU PERHATIAN</p>
                <h2 className="font-display mt-0.5 text-base sm:text-xl font-extrabold text-[var(--ink)] truncate">
                  Deadline & komitmen mendesak
                </h2>
              </div>
              <Link href={`/kegiatan${semesterFilter}`} className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-[var(--brand)] hover:underline">
                Lihat semua <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="mt-3.5 space-y-2.5">
              {upcomingItems.length ? (
                upcomingItems.map((item) => {
                  const days = differenceInCalendarDays(parseISO(item.deadline!), new Date());
                  const isOverdue = days < 0;
                  const isUrgent = days <= 1;
                  return (
                    <article
                      key={item.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        isOverdue
                          ? "border-[#f8c6b9] bg-[#fff9f8]"
                          : isUrgent
                          ? "border-[#fde8b3] bg-[#fffdf6]"
                          : "border-[var(--line)]"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          isOverdue ? "bg-[#e87152]" : days === 0 ? "bg-[#e87152]" : days === 1 ? "bg-[#f3c84b]" : "bg-[var(--brand)]"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-xs sm:text-sm font-bold text-[var(--ink)]">{item.judul}</h3>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-[var(--muted)] truncate">
                          {categoryEmoji[item.kategori] ?? "📎"} {item.kategori} · {item.deadline}
                          {item.jam_deadline ? ` · ${item.jam_deadline}` : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-black ${
                          isOverdue
                            ? "bg-[#feece7] text-[#b93c21]"
                            : days === 0
                            ? "bg-[#feece7] text-[#b93c21]"
                            : days === 1
                            ? "bg-[#fff6dd] text-[#9a6900]"
                            : "bg-[#f7f8f5] text-[var(--ink)]"
                        }`}
                      >
                        {deadlineLabel(item.deadline!)}
                      </span>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-xl bg-[#f7f8f5] px-4 py-7 text-center">
                  <div className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-[#dcefe4] text-[var(--brand)]">
                    <Target size={17} />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm font-bold">Tidak ada deadline dalam 3 hari ke depan</p>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[var(--muted)]">Great job! Kamu sudah on track.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col min-w-0 gap-5">

          {/* Weekly Pulse / Motivation */}
          <aside className="surface-lift min-w-0 flex flex-col justify-between rounded-2xl bg-[#173f2c] p-5 sm:p-6 text-white">
            <div>
              <Zap className="text-[#c8ef70]" size={22} />
              <p className="mt-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#b4d8c1]">Weekly Pulse</p>
              <h2 className="font-display mt-1.5 text-lg sm:text-xl font-extrabold leading-snug">
                {(overdueCount ?? 0) > 0
                  ? `${overdueCount} tugas lewat tenggat — butuh perhatianmu sekarang.`
                  : (activeCount ?? 0) > 0
                  ? "Ritme akademikmu berjalan baik. Pertahankan momentum! 🔥"
                  : "Semua ambisi besar dimulai dari langkah kecil pertama."}
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#c7dbce]">
                {(overdueCount ?? 0) > 0
                  ? "Selesaikan atau jadwalkan ulang agar beban pikiranmu lebih ringan."
                  : "Pilih satu kegiatan yang paling penting dan selesaikan hari ini."}
              </p>

              {/* Completion mini bar */}
              {totalItems > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold text-[#b4d8c1]">
                    <span>Progress semester ini</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-[#c8ef70] transition-all duration-700"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-white/50">{completeCount} dari {totalItems} item selesai</p>
                </div>
              )}
            </div>
            <Link
              href={`/kegiatan${semesterFilter}`}
              className="mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#c8ef70] hover:underline"
            >
              Atur fokusmu <ArrowUpRight size={15} />
            </Link>
          </aside>

          {/* Semester Progress */}
          {activeSemester && (
            <div className="surface-lift min-w-0 rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2.5 border-b border-[var(--line)] pb-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#dff3e5] text-[var(--brand)] shrink-0">
                  <BookOpen size={16} strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">Semester Aktif</p>
                  <p className="text-xs sm:text-sm font-extrabold text-[var(--ink)] truncate">{activeSemester.nama_semester}</p>
                </div>
              </div>
              {activeSemester.tanggal_mulai && activeSemester.tanggal_selesai && (
                <div className="mt-3.5">
                  <div className="flex justify-between text-xs font-bold text-[var(--muted)]">
                    <span>Sudah berjalan</span>
                    <span className="text-[var(--brand)]">{semesterProgress}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eff2eb]">
                    <div
                      className="h-full rounded-full bg-[var(--brand)] transition-all duration-700"
                      style={{ width: `${semesterProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] sm:text-[11px] text-[var(--muted)] truncate">
                    {format(parseISO(activeSemester.tanggal_mulai), "d MMM", { locale: id })} –{" "}
                    {format(parseISO(activeSemester.tanggal_selesai), "d MMM yyyy", { locale: id })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Organization Snapshot */}
          {(organizations?.length ?? 0) > 0 && (
            <div className="surface-lift min-w-0 rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#e8e1fa] text-[#5c3a9c] shrink-0">
                    <Building2 size={16} strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[var(--muted)]">Organisasi</p>
                    <p className="text-xs sm:text-sm font-extrabold text-[var(--ink)] truncate">Ruang Kontribusi</p>
                  </div>
                </div>
                <Link href="/organisasi" className="shrink-0 text-xs font-black text-[var(--brand)] hover:underline">
                  Semua →
                </Link>
              </div>

              <div className="mt-3 space-y-2">
                {organizations!.map((org) => {
                  const activeProker = (programs ?? []).filter(
                    (p) => p.organization_id === org.id && p.status === "berjalan"
                  ).length;
                  return (
                    <Link
                      key={org.id}
                      href={`/organisasi/${org.id}`}
                      className="flex items-center justify-between gap-2.5 rounded-xl border border-[var(--line)] p-2.5 transition hover:border-[#b9ddc6]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-bold text-[var(--ink)]">{org.nama_organisasi}</p>
                        <p className="text-[10px] sm:text-xs text-[var(--muted)] truncate">
                          {activeProker > 0 ? `${activeProker} proker aktif` : org.tipe}
                        </p>
                      </div>
                      <ArrowUpRight size={14} className="shrink-0 text-[var(--muted)]" />
                    </Link>
                  );
                })}
              </div>
            </div>
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
    <Link href={href} className="console-stat surface-lift block min-w-0 rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5 transition hover:border-[#b9ddc6]">
      <div className={`grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-xl ${color}`}>{icon}</div>
      <p className="mt-4 text-xs sm:text-sm font-semibold text-[var(--muted)]">{label}</p>
      <p className="font-display mt-0.5 text-2xl sm:text-3xl font-extrabold">
        {value.toString().padStart(2, "0")}{suffix}
      </p>
      {value === 0 && <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-[var(--muted)]">Belum ada</p>}
    </Link>
  );
}
