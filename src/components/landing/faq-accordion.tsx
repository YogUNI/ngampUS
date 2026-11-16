"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, MessageCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apakah nGampUS benar-benar gratis?",
    answer: "Ya, 100% gratis untuk seluruh mahasiswa Indonesia. Semua fitur esensial seperti jadwal kuliah, radar deadline, manajemen proker organisasi, hingga ekspor resume ATS dapat kamu gunakan tanpa biaya langganan apa pun.",
  },
  {
    question: "Bagaimana nGampUS menjaga keamanan dan privasi data saya?",
    answer: "Keamanan adalah pondasi utama kami. Kami menerapkan PostgreSQL Row Level Security (RLS) di mana hanya akunmu yang memiliki akses ke data pribadimu. Data tidak pernah dijual atau diserahkan ke pihak ketiga.",
  },
  {
    question: "Apa bedanya nGampUS dengan Notion atau Google Calendar?",
    answer: "Notion memerlukan setup berjam-jam dengan template rumit, sedangkan Google Calendar tidak memahami konteks SKS atau organisasi kampus. nGampUS langsung siap pakai dalam 2 menit dan dirancang khusus untuk ritme perkuliahan mahasiswa Indonesia.",
  },
  {
    question: "Apakah data semester lalu akan hilang saat berganti semester baru?",
    answer: "Tidak akan hilang. nGampUS menyediakan sistem arsip semester historis. Ketika mengaktifkan semester baru, data matkul, nilai, dan rekap semester sebelumnya tersimpan rapi dan dapat dibuka kembali kapan saja.",
  },
  {
    question: "Apakah bisa digunakan bersama teman di organisasi kampus?",
    answer: "Bisa. Kamu bisa mencatat struktur kepengurusan organisasi, divisi, dan memantau timeline progres proker bersama agar tidak bentrok dengan jadwal ujian atau praktikum lab.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="w-full space-y-3.5">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isOpen
                ? "border-[#C6F432]/40 bg-[#12332a] shadow-lg shadow-black/20"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
            }`}
          >
            <button
              onClick={() => toggleFaq(index)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C6F432] focus-visible:outline-hidden"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
            >
              <span className={`font-display text-base sm:text-lg font-bold tracking-tight transition-colors ${
                isOpen ? "text-[#C6F432]" : "text-white"
              }`}>
                {item.question}
              </span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-300 ${
                  isOpen
                    ? "bg-[#C6F432] text-[#0a1f16] rotate-180 shadow-xs"
                    : "bg-white/10 text-white/70"
                }`}
              >
                <ChevronDown size={18} />
              </span>
            </button>

            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-5 px-5" : "grid-rows-[0fr] opacity-0 px-5"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-sm leading-relaxed text-[#F4F1EA]/75 border-t border-white/10 pt-3.5 font-normal">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Still have questions banner */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-[#F4F1EA]/80 font-mono">
          <Sparkles size={14} className="text-[#C6F432]" />
          <span>Punya pertanyaan spesifik seputar kampusmu?</span>
        </div>
        <a
          href="https://www.instagram.com/gusrchmd_/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-[#C6F432] hover:bg-[#C6F432] hover:text-[#0a1f16] transition"
        >
          <MessageCircle size={13} />
          <span>DM @gusrchmd_</span>
        </a>
      </div>
    </div>
  );
}
