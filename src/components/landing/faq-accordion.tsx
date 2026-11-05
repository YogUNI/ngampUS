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
    answer: "Ya, 100% gratis untuk seluruh mahasiswa Indonesia! Semua fitur esensial seperti manajemen semester, jadwal kuliah, radar deadline, struktur organisasi, hingga generator rekap portofolio CV dapat kamu gunakan tanpa biaya langganan atau ikatan kartu kredit.",
  },
  {
    question: "Bagaimana nGampUS menjaga keamanan dan privasi data saya?",
    answer: "Keamanan adalah pondasi utama nGampUS. Kami menerapkan PostgreSQL Row Level Security (RLS) di mana hanya akunmu yang memiliki akses ke data pribadimu. Selain itu, web dilindungi Content Security Policy (CSP) ketat, anti-IDOR validation di setiap server action, dan kami tidak pernah menjual data atau memasang pelacak iklan.",
  },
  {
    question: "Apa bedanya nGampUS dengan Notion, Google Calendar, atau Todoist?",
    answer: "Notion butuh waktu berjam-jam untuk merancang template rumit, dan Google Calendar tidak memahami konteks proker organisasi atau SKS. nGampUS didesain khusus (opinionated workspace) untuk mahasiswa Indonesia: dari struktur semester, relasi dosen & ruang kelas, hingga pembagian divisi organisasi dan konversi rekap proker menjadi poin resume CV siap pakai.",
  },
  {
    question: "Apakah data semester lalu akan hilang saat berganti semester baru?",
    answer: "Tentu tidak! nGampUS memiliki sistem arsip semester historis. Ketika kamu mengaktifkan semester baru, data mata kuliah, nilai, dan rekap semester sebelumnya tersimpan rapi sebagai arsip dan dapat dibuka kapan saja sebagai jejak portofolio akademikmu.",
  },
  {
    question: "Apakah bisa digunakan bersama tim divisi di organisasi kampus?",
    answer: "Bisa! Kamu dapat mencatat struktur bagan organisasi, anggota divisi, dan mendelegasikan progres proker kegiatan sehingga seluruh ritme kerja organisasi terpantau jelas dalam satu papan fokus.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-3.5">
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
                <p className="text-sm leading-relaxed text-[#55675b] border-t border-[#edf2ee] pt-3.5">
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
            className="font-bold text-[#0f6849] underline hover:text-[#0b4d36]"
          >
            @gusrchmd_
          </a>
        </p>
      </div>
    </div>
  );
}
