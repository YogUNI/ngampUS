"use client";

import React from "react";
import Image from "next/image";
import { Tv, ExternalLink, Newspaper, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

interface NewsItem {
  outlet: string;
  badgeType: "tv" | "press";
  category: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  imageAlt: string;
  statBadge: string;
  tag: string;
}

const NEWS_ARTICLES: NewsItem[] = [
  {
    outlet: "CNN Indonesia",
    badgeType: "tv",
    category: "Liputan Khusus Edukasi",
    title: "Survei Kampus Nasional: 67% Mahasiswa Mengalami Academic Burnout Akibat Jadwal Padat & Tumpukan Deadline",
    excerpt: "Kurikulum yang padat serta tumpukan tugas tanpa sistem manajemen terpadu memicu stres akademik berkepanjangan pada mahasiswa semester aktif.",
    imageSrc: "/images/news/news-burnout-study.jpg",
    imageAlt: "Mahasiswa belajar bersama di perpustakaan dengan laptop dan tumpukan buku",
    statBadge: "SURVEI NASIONAL • 67% MAHASISWA",
    tag: "Krisis Ritme & Waktu",
  },
  {
    outlet: "Narasi Newsroom",
    badgeType: "tv",
    category: "Investigasi Mahasiswa",
    title: "Hustle Culture di Kampus: Tuntutan Aktif Kepanitiaan Bikin Jadwal Praktikum dan Proker Kerap Bentrok",
    excerpt: "Banyak mahasiswa aktif merasa bersalah jika tidak sibuk berorganisasi. Namun tanpa pembagian fokus, kuliah dan program kerja justru berujung terbengkalai.",
    imageSrc: "/images/news/news-organization.jpg",
    imageAlt: "Mahasiswa berdiskusi dalam rapat kepanitiaan organisasi kampus",
    statBadge: "SOROTAN KHUSUS • BENTROK JADWAL",
    tag: "Organisasi & Kuliah",
  },
  {
    outlet: "Detik Edu",
    badgeType: "press",
    category: "Karir & Magang",
    title: "Seleksi Magang Nasional: Ribuan Berkas CV Mahasiswa Gugur Hanya karena Format Tidak Standar ATS",
    excerpt: "Banyak mahasiswa memiliki pengalaman proyek kuliah dan kepanitiaan luar biasa, namun tersingkir di tahap awal screening karena riwayat tugas tidak terdokumentasi rapi.",
    imageSrc: "/images/news/news-career-internship.jpg",
    imageAlt: "Mahasiswa tersenyum melihat laptop mempersiapkan lamaran magang",
    statBadge: "REKRUTMEN • 80% CV GAGAL SCREENING",
    tag: "Standar CV ATS",
  },
];

export function MediaCoverage() {
  return (
    <section 
      id="media-coverage"
      aria-label="Sorotan Berita dan Liputan Realita Mahasiswa"
      className="relative border-b border-white/10 bg-[#0d261e] py-16 sm:py-20 lg:py-24 px-4 sm:px-8 lg:px-12 text-[#F4F1EA] scroll-mt-20 overflow-hidden"
    >
      {/* Background Radial Glow */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[850px] rounded-full bg-radial from-[#12332a]/60 via-transparent to-transparent blur-3xl opacity-50"
      />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Section Header */}
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#12332a] px-3.5 py-1 text-xs font-mono font-bold text-[#C6F432]">
              <span className="h-2 w-2 rounded-full bg-[#C6F432] animate-pulse" />
              <span>SOROTAN MEDIA & FAKTA LAPANGAN</span>
            </div>

            <h2 className="font-display mt-3 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Krisis nyata di balik bangku kuliah.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#F4F1EA]/70 leading-relaxed font-normal max-w-2xl mx-auto">
              Media nasional dan liputan edukasi terus menyoroti fenomena burnout, jadwal bentrok, hingga ketatnya seleksi magang. Masalah ini nyata, dan ngampUS dibangun untuk menjawabnya.
            </p>
          </div>
        </Reveal>

        {/* ── 3 EDITORIAL NEWS CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {NEWS_ARTICLES.map((article, idx) => {
            const delayValue = (idx + 1) as 1 | 2 | 3;
            return (
              <Reveal key={idx} delay={delayValue}>
              <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#12332a]/80 shadow-xl transition-all duration-300 hover:border-[#C6F432]/40 hover:bg-[#12332a] hover:-translate-y-1">
                
                {/* Real Photo Thumbnail with Broadcast Badge */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#0a1f16]">
                  <Image
                    src={article.imageSrc}
                    alt={article.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12332a] via-[#12332a]/20 to-transparent" />

                  {/* Top Broadcast Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a1f16]/90 border border-white/20 px-2.5 py-1 text-[10.5px] font-mono font-bold text-white backdrop-blur-md">
                      {article.badgeType === "tv" ? (
                        <Tv size={12} className="text-[#C6F432]" />
                      ) : (
                        <Newspaper size={12} className="text-[#C6F432]" />
                      )}
                      <span>{article.outlet}</span>
                    </span>
                  </div>

                  {/* Floating Stat Pill on Photo */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="inline-block rounded-lg bg-[#0a1f16]/95 border border-[#C6F432]/30 px-2.5 py-1 font-mono text-[10px] font-bold text-[#C6F432] backdrop-blur-md shadow-sm">
                      {article.statBadge}
                    </span>
                  </div>
                </div>

                {/* Article Body Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#F4F1EA]/50">
                      <span>{article.category}</span>
                      <span className="text-[#C6F432] font-semibold">{article.tag}</span>
                    </div>

                    <h3 className="font-display mt-2.5 text-base sm:text-lg font-bold text-white leading-snug group-hover:text-[#C6F432] transition-colors">
                      {article.title}
                    </h3>

                    <p className="mt-2 text-xs text-[#F4F1EA]/70 leading-relaxed font-sans font-normal">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between font-mono text-[11px] text-[#F4F1EA]/60">
                    <span className="flex items-center gap-1 text-[#C6F432]">
                      <span>Fakta Lapangan</span>
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:text-white transition-colors">
                      <span>Liputan Terverifikasi</span>
                      <ExternalLink size={11} />
                    </span>
                  </div>
                </div>

              </article>
            </Reveal>
          );
        })}
        </div>

        {/* ── RESOLUTION BANNER: HOW NGAMPUS SOLVES IT ── */}
        <Reveal delay={4}>
          <div className="mt-10 sm:mt-12 rounded-3xl border border-[#C6F432]/25 bg-[#0a1f16] p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#C6F432]/15 text-[#C6F432] border border-[#C6F432]/30">
                <TrendingUp size={20} />
              </span>
              <div>
                <h3 className="font-display text-base sm:text-lg font-black text-white">
                  Jawaban Kami: Satu Ruang Kerja yang Tenang & Terkendali
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-[#F4F1EA]/70 max-w-2xl font-normal leading-relaxed">
                  ngampUS bukan sekadar catatan biasa. Kami menghubungkan jadwal kuliah, tenggat tugas, proker organisasi, hingga resume magang agar kamu bisa fokus tanpa rasa cemas.
                </p>
              </div>
            </div>

            <a
              href="#features"
              className="shrink-0 inline-flex items-center gap-2 rounded-2xl bg-[#C6F432] px-5 py-3 text-xs sm:text-sm font-bold text-[#0a1f16] transition-all hover:brightness-110 active:scale-95 shadow-md shadow-[#C6F432]/20"
            >
              <span>Pelajari Fitur Solusinya</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
