import { AuthAnnouncementBanner } from "@/components/auth/auth-announcement-banner";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, BookOpen, UsersRound, Award, CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen max-h-screen flex flex-col justify-between overflow-hidden bg-[#091a12] text-[#eef7f1]">
      {/* ── Ambient Background Lighting & Grid Effects ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Luminous Top Glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 h-[450px] w-[600px] rounded-full opacity-40 blur-[100px]"
          style={{ background: "radial-gradient(circle, #22c55e 0%, #0f6849 50%, transparent 80%)" }}
        />
        {/* Soft Bottom Glow */}
        <div
          className="absolute -bottom-32 right-1/4 h-[380px] w-[500px] rounded-full opacity-25 blur-[90px]"
          style={{ background: "radial-gradient(circle, #c8ef70 0%, #0f6849 60%, transparent 80%)" }}
        />
        {/* Subtle Tech Grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "32px 32px"
          }}
        />
      </div>

      {/* Top Banner (if active) */}
      <div className="relative z-20">
        <AuthAnnouncementBanner />
      </div>

      {/* ── Main Content Grid ── */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-3 py-2 sm:px-6 sm:py-4 overflow-hidden">
        <div className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          
          {/* Left Column: Branding Showcase & Value Props (Visible on Desktop/Tablet) */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 pr-4">
            {/* Brand Logo Header */}
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-3 active:scale-95 transition">
                <Image
                  src="/logo_ngampUS.png"
                  alt="ngampUS Logo"
                  width={42}
                  height={42}
                  priority
                  className="h-10 w-10 object-contain drop-shadow-[0_4px_16px_rgba(200,239,112,0.3)]"
                />
                <span className="font-display text-2xl font-black tracking-tight text-white">
                  ngamp<span className="text-[#c8ef70]">US</span>
                </span>
              </Link>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c8ef70]/25 bg-[#c8ef70]/10 px-3 py-1 text-[11px] font-black tracking-wide text-[#d8f89a]">
                  <Sparkles size={12} className="text-[#c8ef70]" />
                  <span>WORKSPACE TERPADU MAHASISWA INDONESIA</span>
                </div>
              </div>
            </div>

            {/* Powerful Headline */}
            <div>
              <h1 className="font-display text-4xl font-black tracking-tight text-white xl:text-5xl leading-[1.1]">
                Kendali penuh atas <br />
                <span className="text-[#c8ef70]">kuliah & organisasimu.</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm text-[#a3c4b1] leading-relaxed">
                Satu dashboard cerdas untuk jadwal mata kuliah, deadline tugas, rapat BEM/himpunan, hingga otomatisasi rekap portofolio CV.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-3.5 max-w-lg">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition hover:bg-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0f6849] text-[#c8ef70]">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold text-white">Jadwal Cerdas</h2>
                    <p className="text-[11px] text-[#8fa899]">Sinkron ke kalender HP</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition hover:bg-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0f6849] text-[#c8ef70]">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold text-white">Modul & Tugas</h2>
                    <p className="text-[11px] text-[#8fa899]">Bebas deadline terlewat</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition hover:bg-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0f6849] text-[#c8ef70]">
                    <UsersRound size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold text-white">Ritme Organisasi</h2>
                    <p className="text-[11px] text-[#8fa899]">Proker & rapat rapi</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md transition hover:bg-white/[0.07]">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#0f6849] text-[#c8ef70]">
                    <Award size={16} />
                  </div>
                  <div>
                    <h2 className="text-xs font-extrabold text-white">Export CV & Rekap</h2>
                    <p className="text-[11px] text-[#8fa899]">Portofolio siap pakai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Trust */}
            <div className="flex items-center gap-3 pt-2 text-xs font-semibold text-[#8ba896]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#c8ef70]" /> 100% Gratis
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#c8ef70]" /> Supabase Security
              </span>
              <span>•</span>
              <span>PWA Mobile Ready</span>
            </div>
          </div>

          {/* Right Column: Interactive Flip Card (Login / Register) */}
          <div className="flex w-full justify-center">
            {children}
          </div>

        </div>
      </main>

      {/* ── Clean Footer ── */}
      <footer className="relative z-10 py-4 text-center text-xs text-[#6e8a79]">
        <p>© 2026 ngampUS • Dirancang dengan penuh fokus untuk mahasiswa Indonesia.</p>
      </footer>
    </div>
  );
}
