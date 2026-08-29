import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Compass, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="noise-overlay min-h-screen overflow-hidden text-[var(--ink)]">
      <section className="grid-paper relative min-h-screen px-5 pb-12 pt-5 sm:px-8 lg:px-12">
        <nav className="surface-lift mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-[var(--line)] bg-white/80 px-4 py-3 backdrop-blur sm:px-5">
          <span className="font-display text-xl font-extrabold tracking-tight">nGamp<span className="text-[var(--brand)]">US</span></span>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Link className="hidden px-3 py-2 text-[var(--muted)] sm:block" href="/login">Masuk</Link>
            <Link className="rounded-xl bg-[var(--brand)] px-4 py-2.5 text-white transition hover:bg-[var(--brand-dark)]" href="/register">Mulai sekarang</Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-12 pb-10 pt-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pt-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#b9ddc6] bg-[#eaf6ee] px-3 py-1.5 text-sm font-semibold text-[var(--brand-dark)]"><Sparkles size={15}/> Ruang kendali untuk hidup kampusmu</div>
            <h1 className="font-display max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">Kuliah jalan.<br/><span className="text-[var(--brand)]">Ambis tetap</span> terarah.</h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">Satukan tugas, organisasi, dan deadline dalam satu workspace yang tenang, visual, dan dibuat mengikuti ritme mahasiswa aktif.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3.5 font-bold text-white shadow-lg shadow-[#1f6a48]/20 transition hover:-translate-y-0.5 hover:bg-[var(--brand-dark)]" href="/register">Bikin workspace <ArrowRight size={18}/></Link>
              <a className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-5 py-3.5 font-bold transition hover:border-[var(--brand)]" href="#fitur">Lihat cara kerja</a>
            </div>
            <div className="mt-12 flex gap-8 text-sm text-[var(--muted)]"><span><b className="block font-display text-2xl text-[var(--ink)]">1 tempat</b>semua komitmen</span><span><b className="block font-display text-2xl text-[var(--ink)]">0 drama</b>deadline tercecer</span></div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="hero-orb absolute -right-10 -top-12 h-44 w-44 rounded-full"/>
            <div className="surface-lift relative rounded-[2rem] border border-[#cbd8cf] bg-[#183c2a] p-4 shadow-2xl shadow-[#183c2a]/20 sm:p-5">
              <div className="rounded-[1.4rem] bg-[#f7f8f5] p-5">
                <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]">Jumat, 29 Agustus</p><h2 className="font-display mt-1 text-2xl font-extrabold">Good morning, Axi!</h2></div><div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"><Compass size={19}/></div></div>
                <div className="mt-5 rounded-2xl bg-[var(--brand)] p-4 text-white"><div className="flex items-center justify-between text-sm text-[#d8eddf]"><span>Deadline terdekat</span><span>Besok</span></div><p className="mt-3 font-display text-lg font-bold">Finalisasi proposal Pengmas</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25"><div className="h-full w-4/5 rounded-full bg-[var(--yellow)]"/></div></div>
                <div className="mt-4 grid grid-cols-3 gap-2"><Metric value="12" label="Aktif"/><Metric value="08" label="Selesai"/><Metric value="03" label="Mendesak" urgent/></div>
                <div className="mt-5"><p className="mb-3 text-sm font-bold">Hari ini</p><Task label="Revisi desain publikasi" tone="bg-[#f6e5c5]"/><Task label="Rapat divisi acara" tone="bg-[#dcefe4]"/></div>
              </div>
            </div>
            <div className="absolute -bottom-7 -left-7 rounded-2xl border border-[#eadbc0] bg-[#fff7e8] px-4 py-3 shadow-lg"><div className="flex items-center gap-2 text-sm font-bold"><CheckCircle2 size={17} className="text-[var(--brand)]"/> Kamu on track!</div><p className="mt-0.5 text-xs text-[var(--muted)]">8 aktivitas selesai minggu ini</p></div>
          </div>
        </div>
      </section>
      <section id="fitur" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><p className="font-semibold text-[var(--brand)]">SATU SISTEM, BUKAN SEKADAR TO-DO LIST</p><h2 className="font-display mt-3 max-w-2xl text-4xl font-extrabold tracking-[-.04em]">Ruang bernapas untuk semua ambisimu.</h2><div className="mt-10 grid gap-4 md:grid-cols-3"><Feature icon={<CalendarDays/>} title="Deadline yang terbaca" text="Prioritas dan urgensi terlihat sekilas, bukan tersembunyi di spreadsheet."/><Feature icon={<Compass/>} title="Organisasi terstruktur" text="Pisahkan peran, proker, dan aktivitas tanpa kehilangan konteks."/><Feature icon={<CheckCircle2/>} title="Progress yang nyata" text="Pantau apa yang selesai, apa yang tertunda, lalu lanjut dengan tenang."/></div></section>
    </main>
  );
}

function Metric({ value, label, urgent = false }: { value: string; label: string; urgent?: boolean }) { return <div className={`rounded-xl p-3 ${urgent ? "bg-[#fff0ec]" : "bg-white"}`}><b className={`font-display text-xl ${urgent ? "text-[#c94e32]" : "text-[var(--ink)]"}`}>{value}</b><p className="mt-0.5 text-xs text-[var(--muted)]">{label}</p></div>; }
function Task({ label, tone }: { label: string; tone: string }) { return <div className="mb-2 flex items-center gap-3 rounded-xl bg-white p-3"><span className={`h-2.5 w-2.5 rounded-full ${tone}`}/><span className="text-sm font-semibold">{label}</span></div>; }
function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <article className="surface-lift rounded-2xl border border-[var(--line)] bg-white p-6"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">{icon}</div><h3 className="font-display mt-5 text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-[var(--muted)]">{text}</p></article>; }
