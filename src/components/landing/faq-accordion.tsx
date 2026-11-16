"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

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
    <div className="mx-auto w-full max-w-3xl space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
              isOpen
                ? "border-[#c3ddcb] bg-white shadow-xs"
                : "border-[#dce5dd] bg-white/80 hover:border-[#b4d2bd] hover:bg-white"
            }`}
          >
            <button
              onClick={() => toggleFaq(index)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0f6849] focus-visible:outline-hidden"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
            >
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#10261b]">
                {item.question}
              </span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-200 ${
                  isOpen
                    ? "bg-[#0f6849] text-white rotate-180 shadow-xs"
                    : "bg-[#f4f7f4] text-[#708075]"
                }`}
              >
                <ChevronDown size={18} />
              </span>
            </button>

            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className={`grid transition-all duration-200 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 pb-5 px-5" : "grid-rows-[0fr] opacity-0 px-5"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-sm leading-relaxed text-[#55675b] border-t border-[#edf2ee] pt-3">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Still have questions banner */}
      <div className="mt-8 rounded-2xl border border-dashed border-[#c3ddcb] bg-[#dff3e5]/30 p-4 text-center">
        <p className="text-xs font-semibold text-[#10261b] flex items-center justify-center gap-1.5">
          <Sparkles size={14} className="text-[#0f6849]" />
          Punya pertanyaan lain seputar sistem nGampUS?
        </p>
        <p className="mt-1 text-xs text-[#708075]">
          DM langsung kreator di Instagram{" "}
          <a
            href="https://www.instagram.com/gusrchmd_/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#0f6849] hover:underline"
          >
            @gusrchmd_
          </a>
        </p>
      </div>
    </div>
  );
}
