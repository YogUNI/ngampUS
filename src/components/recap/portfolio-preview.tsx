"use client";

import { useRef } from "react";
import { Award, BookOpen, Building2, CalendarDays, Download, FileText, Printer, Star, Trophy, Users } from "lucide-react";

type Activity = {
  id: string;
  judul: string;
  deskripsi?: string | null;
  kategori: string;
  jenis_item: string;
  status: string;
  prioritas: string;
  deadline?: string | null;
  tanggal_mulai?: string | null;
  peran_portfolio?: string | null;
  is_portfolio: boolean;
  organization_id?: string | null;
  program_id?: string | null;
};

type Profile = {
  full_name: string;
  university: string;
  major: string;
  student_id?: string | null;
  email: string;
};

type SemesterInfo = {
  nama: string;
  mulai: string;
  selesai: string;
} | null;

export function PortfolioPreview({
  activities,
  orgMap,
  programMap = {},
  profile,
  semester,
}: {
  activities: Activity[];
  orgMap: Record<string, string>;
  programMap?: Record<string, string>;
  profile: Profile;
  semester: SemesterInfo;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  // Categorize activities for display sections
  const org = activities.filter((a) => a.kategori === "organisasi");
  const lomba = activities.filter((a) => a.kategori === "lomba");
  const event = activities.filter((a) => a.kategori === "event");
  const kuliah = activities.filter((a) => a.kategori === "kuliah");
  const lainnya = activities.filter((a) => a.kategori === "lainnya");

  const today = new Date();
  const generatedDate = today.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function formatDate(dateStr?: string | null) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  }

  const priorityBadge: Record<string, string> = {
    tinggi: "bg-[#feece7] text-[#c53e1c]",
    sedang: "bg-[#dfeeff] text-[#1a5ea8]",
    rendah: "bg-[#eef1ee] text-[#5e6b63]",
  };

  return (
    <>
      {/* Print / Export Toolbar — hidden on print */}
      <div className="no-print mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white p-4">
        <div>
          <p className="text-sm font-extrabold text-[var(--ink)]">
            {activities.length} pencapaian siap ditampilkan
          </p>
          <p className="text-xs text-[var(--muted)]">
            Kamu dapat mencetak atau menyimpan sebagai PDF menggunakan tombol di bawah ini.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[#f7f8f5] px-4 py-2.5 text-xs font-bold text-[var(--ink)] hover:bg-[#eaf5eb] hover:text-[var(--brand)] transition"
          >
            <Printer size={15} /> Cetak / Save PDF
          </button>
        </div>
      </div>

      {/* Portfolio Document */}
      <div
        ref={printRef}
        className="portfolio-doc mt-5 rounded-3xl border border-[var(--line)] bg-white overflow-hidden shadow-sm print:shadow-none print:rounded-none print:border-none print:mt-0"
      >
        {/* Header Section */}
        <div className="bg-[#103626] px-8 py-7 text-white print:px-6 print:py-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-[#c8ef70] text-[10px] font-black tracking-[.2em] uppercase">
                <Star size={12} /> Portofolio Akademik & Non-Akademik
              </div>
              <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight print:text-2xl">
                {profile.full_name}
              </h1>
              <p className="mt-1 text-[#c7dbce] text-sm">
                {profile.major} · {profile.university}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#8fb69b]">
                {profile.student_id && <span>NIM: {profile.student_id}</span>}
                <span>{profile.email}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black tracking-[.14em] text-[#c8ef70] uppercase">
                {semester ? semester.nama : "Semua Semester"}
              </p>
              {semester && (
                <p className="mt-0.5 text-[11px] text-[#8fb69b]">
                  {formatDate(semester.mulai)} — {formatDate(semester.selesai)}
                </p>
              )}
              <p className="mt-2 text-[10px] text-[#5f8f72]">Dibuat: {generatedDate}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Pencapaian", value: activities.length, color: "#c8ef70" },
              { label: "Kepemimpinan", value: org.length, color: "#82d6a1" },
              { label: "Prestasi / Lomba", value: lomba.length, color: "#fde68a" },
              { label: "Event / Kepanitiaan", value: event.length, color: "#bfb4f8" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 px-3 py-2.5">
                <p className="text-xs font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[10px] text-[#9dbfab] mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="p-6 sm:p-8 print:p-6 space-y-7">

          {/* Kepemimpinan & Organisasi */}
          {org.length > 0 && (
            <Section
              icon={<Users size={16} />}
              title="Kepemimpinan & Organisasi"
              color="bg-[#dff3e5] text-[#0f6849]"
            >
              {org.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  orgName={a.organization_id ? orgMap[a.organization_id] : null}
                  programName={a.program_id ? programMap[a.program_id] : null}
                  formatDate={formatDate}
                  priorityBadge={priorityBadge}
                />
              ))}
            </Section>
          )}

          {/* Prestasi & Kompetisi */}
          {lomba.length > 0 && (
            <Section
              icon={<Trophy size={16} />}
              title="Prestasi & Kompetisi"
              color="bg-[#fef3c7] text-[#92400e]"
            >
              {lomba.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  orgName={null}
                  formatDate={formatDate}
                  priorityBadge={priorityBadge}
                />
              ))}
            </Section>
          )}

          {/* Event & Kepanitiaan */}
          {event.length > 0 && (
            <Section
              icon={<Award size={16} />}
              title="Event & Kepanitiaan"
              color="bg-[#ede9fe] text-[#5b21b6]"
            >
              {event.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  orgName={a.organization_id ? orgMap[a.organization_id] : null}
                  formatDate={formatDate}
                  priorityBadge={priorityBadge}
                />
              ))}
            </Section>
          )}

          {/* Project Akademik Unggulan */}
          {kuliah.length > 0 && (
            <Section
              icon={<BookOpen size={16} />}
              title="Project & Prestasi Akademik"
              color="bg-[#dbeafe] text-[#1e40af]"
            >
              {kuliah.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  orgName={null}
                  formatDate={formatDate}
                  priorityBadge={priorityBadge}
                />
              ))}
            </Section>
          )}

          {/* Lainnya */}
          {lainnya.length > 0 && (
            <Section
              icon={<FileText size={16} />}
              title="Kegiatan Lainnya"
              color="bg-[#f1f5f9] text-[#475569]"
            >
              {lainnya.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  orgName={null}
                  formatDate={formatDate}
                  priorityBadge={priorityBadge}
                />
              ))}
            </Section>
          )}

          {/* Footer */}
          <div className="border-t border-[var(--line)] pt-5 text-center">
            <p className="text-[10px] text-[var(--muted)] font-semibold">
              Dokumen ini dibuat secara otomatis oleh <span className="font-black text-[var(--brand)]">ngampUS</span> · Campus Console · {generatedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .dashboard-sidebar, .dashboard-content > *:not(.portfolio-doc) { display: none !important; }
          .portfolio-doc { page-break-inside: avoid; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}

function Section({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <span className={`grid h-8 w-8 place-items-center rounded-xl text-sm font-bold shrink-0 ${color}`}>
          {icon}
        </span>
        <h2 className="font-display text-base font-extrabold text-[var(--ink)]">{title}</h2>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function ActivityCard({
  activity,
  orgName,
  programName,
  formatDate,
  priorityBadge,
}: {
  activity: Activity;
  orgName?: string | null;
  programName?: string | null;
  formatDate: (d?: string | null) => string;
  priorityBadge: Record<string, string>;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[#fafbf9] px-4 py-3 print:px-3 print:py-2 print:border-[#ddd]">
      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)] opacity-70" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-[var(--ink)] leading-snug">{activity.judul}</p>
            {activity.peran_portfolio && (
              <p className="mt-0.5 text-xs font-bold text-[var(--brand)]">
                🎖 {activity.peran_portfolio}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--muted)]">
              {orgName && (
                <span className="flex items-center gap-1 font-semibold text-[var(--ink)]">
                  <Building2 size={12} className="text-[var(--brand)]" /> {orgName}
                </span>
              )}
              {programName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-[#eaf5eb] px-1.5 py-0.5 font-bold text-[#0f6849]">
                  📌 Proker: {programName}
                </span>
              )}
              {(activity.deadline || activity.tanggal_mulai) && (
                <span className="flex items-center gap-1">
                  <CalendarDays size={11} /> {formatDate(activity.deadline ?? activity.tanggal_mulai)}
                </span>
              )}
            </div>
            {activity.deskripsi && (
              <p className="mt-1 text-[10.5px] text-[var(--muted)] line-clamp-2 leading-relaxed">
                {activity.deskripsi}
              </p>
            )}
          </div>
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${priorityBadge[activity.prioritas] ?? "bg-[#f1f5f9] text-[#475569]"}`}>
            {activity.prioritas === "tinggi" ? "Prioritas Tinggi" : activity.prioritas === "sedang" ? "Sedang" : "Rendah"}
          </span>
        </div>
      </div>
    </div>
  );
}
