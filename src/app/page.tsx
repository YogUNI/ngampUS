import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, CircleDotDashed, Clock3, Compass, Layers3, MoveUpRight, Target, Zap, Shield } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export default function Home() {
  // Ticker items duplicated for seamless loop
  const tickerItems = [
    { text: "RUANG UNTUK KULIAH", dot: "#d9684e" },
    { text: "RITME UNTUK ORGANISASI", dot: "#0f6849" },
    { text: "ARAH UNTUK AMBISI", dot: "#d1ae2c" },
    { text: "REKAP YANG BERMAKNA", dot: "#7b6cee" },
    { text: "DEADLINE YANG TERPANTAU", dot: "#e57255" },
  ];

  return (
    <main className="atlas-page min-h-screen overflow-hidden bg-[#eff2eb] text-[#10261b]">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="atlas-hero relative min-h-screen bg-[#103626] px-5 pb-16 pt-5 text-[#f6f8f1] sm:px-8 lg:px-12">

        {/* Grain texture */}
        <div className="atlas-grain absolute inset-0 opacity-25 pointer-events-none"/>

        {/* Floating ambient orbs */}
        <div className="orb-float-1 pointer-events-none absolute right-[8%] top-[14%] h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,239,112,.22), transparent 65%)", filter: "blur(2px)" }}/>
        <div className="orb-float-2 pointer-events-none absolute left-[4%] top-[55%] h-48 w-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(15,104,73,.18), transparent 65%)", filter: "blur(1px)" }}/>
        <div className="orb-float-3 pointer-events-none absolute right-[20%] bottom-[10%] h-36 w-36 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,239,112,.14), transparent 65%)", filter: "blur(2px)" }}/>

        {/* Nav */}
        <nav className="hero-stagger-1 relative z-20 mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/15 bg-white/[.06] px-4 py-3 backdrop-blur-xl sm:px-5">
          <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-black tracking-[-.06em]">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
              priority
            />
            <span>
              ngamp<span className="text-[#c8ef70]">US</span>
            </span>
          </Link>
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <Link href="/login" className="hidden rounded-full px-4 py-2 text-[#c9dbce] hover:bg-white/10 hover:text-white sm:block">
              Masuk
            </Link>
            <Link href="/register" className="rounded-full bg-[#c8ef70] px-4 py-2.5 text-[#103626] shadow-[0_6px_0_#83a936] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_#83a936]">
              Buat ruangmu →
            </Link>
          </div>
        </nav>

        {/* Hero content grid */}
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 pb-8 pt-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pt-28">

          {/* Left — Text */}
          <div className="max-w-3xl">
            <div className="hero-stagger-2 inline-flex items-center gap-2 rounded-full border border-[#c8ef70]/30 bg-[#c8ef70]/10 px-3 py-1.5 text-[11px] font-black tracking-[.16em] text-[#d8f89a]">
              <CircleDotDashed size={14}/> CAMPUS ATLAS / 01
            </div>

            <h1 className="hero-stagger-3 font-display mt-7 text-5xl font-black leading-[.9] tracking-[-.075em] sm:text-6xl lg:text-[5.8rem]">
              Kuliah jalan.<br/>
              <span className="atlas-accent">Ambis tetap</span><br/>
              terarah.
            </h1>

            <p className="hero-stagger-4 mt-7 max-w-xl text-lg leading-8 text-[#c8d8ce]">
              Satu ruang yang memetakan tugas, peran, dan deadline—supaya hidup kampusmu tidak lagi terasa seperti puluhan tab yang saling mengejar.
            </p>

            <div className="hero-stagger-5 mt-9 flex flex-wrap items-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-3 rounded-2xl bg-[#f6f8f1] px-5 py-4 font-extrabold text-[#103626] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/25">
                Mulai petakan semester <ArrowRight size={18}/>
              </Link>
              <Link href="#atlas" className="inline-flex items-center gap-2 font-bold text-[#d8f89a] hover:text-white transition">
                Lihat cara kerja ↓
              </Link>
            </div>

            <div className="hero-stagger-6 mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/12 pt-5 text-sm text-[#b9ccc0]">
              <span><b className="text-[#f6f8f1]">01 dashboard</b> untuk semua fokus</span>
              <span><b className="text-[#f6f8f1]">0 tab</b> yang terlupakan</span>
              <span><b className="text-[#f6f8f1]">100%</b> gratis, tanpa kartu kredit</span>
            </div>
          </div>

          {/* Right — Mock-up dashboard card */}
          <div className="hero-stagger-4 relative mx-auto w-full max-w-[540px] pb-8 pt-4 lg:pt-0">
            <div className="atlas-arc absolute -left-20 -top-16 h-[420px] w-[420px] rounded-full"/>

            {/* Board */}
            <div className="atlas-board relative rotate-[2deg] rounded-[2rem] border border-white/15 bg-[#f6f8f1] p-3 text-[#10261b] shadow-2xl shadow-black/35 sm:p-4">
              <div className="rounded-[1.55rem] bg-[#e8eee7] p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[.16em] text-[#6d7b70]">FRIDAY / WEEK 05</p>
                    <h2 className="font-display mt-1 text-2xl font-black tracking-[-.05em]">Your focus map.</h2>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#103626] text-[#c8ef70]">
                    <Compass size={19}/>
                  </span>
                </div>

                {/* Cards row */}
                <div className="mt-5 grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
                  {/* Priority card */}
                  <div className="rounded-2xl bg-[#103626] p-4 text-white">
                    <div className="flex items-center justify-between text-xs font-bold text-[#c1d4c7]">
                      <span>PRIORITAS UTAMA</span>
                      <span className="mockup-badge-pulse rounded-full bg-[#d9684e] px-2 py-1 text-[10px] text-white">BESOK</span>
                    </div>
                    <p className="font-display mt-5 text-xl font-black leading-tight">Finalisasi proposal Pengmas</p>
                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/15">
                      <div className="mockup-bar-grow h-full rounded-full bg-[#c8ef70]"/>
                    </div>
                    <p className="mt-2 text-xs text-[#bdd0c2]">78% siap dikumpulkan</p>
                  </div>

                  {/* Stat card */}
                  <div className="rounded-2xl border border-[#c9d9cc] bg-white p-4">
                    <p className="text-[10px] font-black tracking-[.14em] text-[#6d7b70]">MINGGU INI</p>
                    <p className="font-display mt-2 text-4xl font-black text-[#103626]">04<span className="text-lg text-[#77857b]">/07</span></p>
                    <p className="mt-1 text-xs font-semibold text-[#68766d]">komitmen selesai</p>
                    <div className="mt-4 flex -space-x-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#e7d4ff] text-[10px] font-black text-[#69469a]">K</span>
                      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#dff3e5] text-[10px] font-black text-[#0f6849]">O</span>
                      <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#ffe9bf] text-[10px] font-black text-[#906000]">+</span>
                    </div>
                  </div>
                </div>

                {/* Today row */}
                <div className="mt-3 rounded-2xl border border-[#c9d9cc] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black">HARI INI</p>
                    <p className="text-[10px] font-bold text-[#0f6849]">3 TERPETAKAN</p>
                  </div>
                  <MapRow dot="bg-[#3d84c6]" label="Revisi desain publikasi" label2="Kuliah"/>
                  <MapRow dot="bg-[#0f6849]" label="Rapat divisi acara" label2="Organisasi"/>
                </div>
              </div>
            </div>

            {/* Sticky note */}
            <div className="atlas-note absolute -bottom-1 -left-5 -rotate-[5deg] rounded-xl bg-[#dff3e5] px-4 py-3 text-[#103626] shadow-xl shadow-black/15">
              <p className="text-[10px] font-black tracking-[.14em]">SMALL WIN</p>
              <p className="mt-1 text-sm font-extrabold">8 hal selesai minggu ini ✦</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ────────────────────────────────────────── */}
      <div className="atlas-ticker overflow-hidden border-y border-[#d3ddd4] bg-[#f6f8f1] py-4">
        <div className="flex min-w-max items-center gap-8 text-sm font-black tracking-[.12em] text-[#103626]">
          {/* Duplicated for seamless loop */}
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              <span>{item.text}</span>
              <i className="h-2 w-2 rounded-full shrink-0" style={{ background: item.dot }}/>
            </span>
          ))}
        </div>
      </div>

      {/* ── ATLAS METHOD ─────────────────────────────────── */}
      <section id="atlas" className="mx-auto max-w-7xl px-5 py-28 sm:px-8 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[.82fr_1.18fr]">

          {/* Left — copy */}
          <Reveal>
            <p className="text-xs font-black tracking-[.16em] text-[#0f6849]">THE ATLAS METHOD</p>
            <h2 className="font-display mt-4 text-4xl font-black leading-[.95] tracking-[-.06em] sm:text-5xl">
              Bukan cuma to-do list.<br/>Ini peta hidup kampusmu.
            </h2>
            <p className="mt-6 max-w-sm leading-7 text-[#64746a]">
              Kamu tidak perlu mengingat semuanya. Cukup beri konteks, lalu ngampUS membantu memperlihatkan arah berikutnya.
            </p>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl border border-[#c0d9c7] bg-[#f0f9f2] px-4 py-3 font-extrabold text-[#0f6849] transition hover:bg-[#dff3e5] hover:border-[#0f6849]">
              Bangun peta pertamamu <MoveUpRight size={17}/>
            </Link>
          </Reveal>

          {/* Right — cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal delay={1}><AtlasCard number="01" title="Tangkap" text="Catat tugas, reminder, atau ide sebelum hilang dari kepala." icon={<Target size={22}/>} tone="bg-[#e2efff]"/></Reveal>
            <Reveal delay={2}><AtlasCard number="02" title="Hubungkan" text="Tempatkan setiap komitmen di semester, organisasi, atau proker yang tepat." icon={<Layers3 size={22}/>} tone="bg-[#dff3e5]"/></Reveal>
            <Reveal delay={3}><AtlasCard number="03" title="Jalankan" text="Lihat mana yang mendesak, lalu ubah fokus menjadi progres kecil yang nyata." icon={<Clock3 size={22}/>} tone="bg-[#fff0c9]"/></Reveal>
            <Reveal delay={4}><AtlasCard number="04" title="Refleksikan" text="Tutup minggu dengan rekap yang membuat ritmemu terlihat." icon={<Check size={22}/>} tone="bg-[#eee3ff]"/></Reveal>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-12">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            <ProofCard icon={<Zap size={20}/>} title="Setup 2 menit" text="Dari daftar ke dashboard pertama, tidak sampai 2 menit."/>
            <ProofCard icon={<Shield size={20}/>} title="Data kamu, privasi kamu" text="Tidak ada iklan. Tidak ada tracking. Data kamu tetap milikmu."/>
            <ProofCard icon={<Check size={20}/>} title="Gratis selamanya" text="Semua fitur inti tersedia gratis, tanpa batas waktu."/>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-8 sm:px-8 lg:px-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#103626] px-6 py-12 text-white sm:px-10 sm:py-16">
            {/* Decorative ambient ring (pushed to corners with lower opacity and pointer-events-none) */}
            <div className="cta-ring-spin pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full border-[32px] border-[#c8ef70]/10 opacity-70"/>
            <div className="pointer-events-none absolute -left-28 -bottom-32 h-64 w-64 rounded-full border-[24px] border-[#c8ef70]/05 opacity-50"/>

            {/* Shimmer badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c8ef70]/25 bg-white/5 px-4 py-1.5 text-[11px] font-black tracking-[.15em]">
              <span className="cta-badge-shimmer h-1.5 w-8 rounded-full"/>
              YOUR CAMPUS, YOUR SYSTEM
            </div>

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
              <div>
                <h2 className="font-display max-w-xl text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.05] tracking-[-.05em]">
                  Kamu punya banyak hal untuk dituju. Jangan jalan tanpa peta.
                </h2>
              </div>
              <div className="lg:justify-self-end">
                <p className="max-w-md text-base leading-7 text-[#c5d6ca]">
                  Buat workspace pribadi, mulai dari satu kegiatan, lalu biarkan gambaran besarnya terbentuk pelan-pelan.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link href="/register" className="inline-flex items-center gap-3 rounded-2xl bg-[#c8ef70] px-6 py-4 font-extrabold text-[#103626] shadow-[0_7px_0_#82a737] transition hover:-translate-y-0.5 hover:shadow-[0_9px_0_#82a737]">
                    Mulai sekarang, gratis <ArrowRight size={18}/>
                  </Link>
                  <span className="text-sm font-bold text-[#8ab09a]">Tidak perlu kartu kredit ✦</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[#d3ddd4] bg-[#f6f8f1]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[#65746a] sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-black tracking-[-.06em] text-[#103626]">
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span>
              ngamp<span className="text-[#0f6849]">US</span>
            </span>
          </Link>
          <span>Personal workspace for campus life.</span>
          <div className="flex gap-4 font-bold">
            <Link href="/login" className="hover:text-[#0f6849] transition">Masuk</Link>
            <Link href="/register" className="hover:text-[#0f6849] transition">Daftar</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function MapRow({ dot, label, label2 }: { dot: string; label: string; label2: string }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f4f7f3] px-3 py-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`}/>
      <span className="min-w-0 flex-1 truncate text-sm font-bold">{label}</span>
      <span className="text-[10px] font-bold text-[#718076]">{label2}</span>
    </div>
  );
}

function AtlasCard({ number, title, text, icon, tone }: {
  number: string; title: string; text: string; icon: React.ReactNode; tone: string;
}) {
  return (
    <article className={`${tone} atlas-card relative flex flex-col justify-between overflow-hidden rounded-[1.6rem] border border-[#d5dfd6] p-6 sm:p-7 min-h-[240px]`}>
      <div className="flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/90 text-[#103626] shadow-sm ring-1 ring-[#103626]/5">
          {icon}
        </span>
        <span className="font-display text-3xl font-black tracking-tight text-[#103626]/20 select-none">
          {number}
        </span>
      </div>
      <div className="mt-6">
        <h3 className="font-display text-2xl font-black tracking-[-.04em] text-[#103626]">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[#536359]">{text}</p>
      </div>
    </article>
  );
}

function ProofCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-[#d8e5da] bg-white p-5 shadow-sm transition hover:shadow-md hover:border-[#c0d9c7]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#dff3e5] text-[#0f6849]">{icon}</span>
      <div>
        <p className="font-extrabold text-[#10261b]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#64746a]">{text}</p>
      </div>
    </div>
  );
}
