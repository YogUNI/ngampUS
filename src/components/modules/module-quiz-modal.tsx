"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { generateModuleQuiz, submitQuizScore, QuizQuestion } from "@/app/(dashboard)/modul/ai-actions";
import { useToast } from "@/components/ui/toast-provider";

export function ModuleQuizModal({
  moduleId,
  moduleTopik,
  pertemuan,
  courseName,
  isOpen,
  onClose,
}: {
  moduleId: string;
  moduleTopik: string;
  pertemuan: number;
  courseName?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<{ id: string; questions: QuizQuestion[] } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { showToast } = useToast();

  const handleStartGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateModuleQuiz(moduleId);
      setQuizData({
        id: res.id,
        questions: res.questions as QuizQuestion[],
      });
      setCurrentIdx(0);
      setSelectedAnswers({});
      setShowExplanation(false);
      setIsFinished(false);
      setFinalScore(0);
      showToast("Kuis AI berhasil disiapkan! Selamat mengerjakan.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat kuis.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (selectedAnswers[currentIdx] !== undefined) return; // already answered
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx,
    }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (!quizData) return;
    setShowExplanation(false);
    if (currentIdx < quizData.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Calculate Score
      let correct = 0;
      quizData.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correct_index) {
          correct += 1;
        }
      });
      const score = Math.round((correct / quizData.questions.length) * 100);
      setFinalScore(score);
      setIsFinished(true);
      submitQuizScore(quizData.id, score);
    }
  };

  if (!isOpen) return null;

  const currentQ = quizData?.questions[currentIdx];
  const answeredChoice = selectedAnswers[currentIdx];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--background)] p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#fff0cc] text-[#9a6900]">
              <Sparkles size={20} strokeWidth={2.2} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[var(--card-subtle)] px-2 py-0.5 text-[10px] font-black uppercase text-[var(--brand)] border border-[var(--line)]">
                  Kuis AI · Pertemuan {pertemuan}
                </span>
                {courseName && <span className="text-xs font-bold text-[var(--muted)]">· {courseName}</span>}
              </div>
              <h2 className="font-display mt-0.5 text-base sm:text-lg font-black tracking-tight text-[var(--ink)]">
                {moduleTopik}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--card-subtle)] hover:text-[var(--ink)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!quizData && !loading ? (
          /* Start Screen */
          <div className="py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-[#dff3e5] text-[var(--brand)] shadow-xs">
              <Trophy size={28} />
            </div>
            <h3 className="font-display mt-4 text-lg font-black text-[var(--ink)]">
              Uji Pemahaman Pertemuan {pertemuan}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-[var(--muted)] leading-relaxed">
              AI akan menganalisis materi pertemuan ini dan meracik 5 soal pilihan ganda interaktif lengkap dengan penjelasan kunci jawaban.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleStartGenerate}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3 text-xs font-black text-white shadow-md hover:bg-[var(--brand-dark)] transition active:scale-95"
              >
                <Sparkles size={16} /> Mulai Racik Kuis AI
              </button>
            </div>
          </div>
        ) : loading ? (
          /* Loading Screen */
          <div className="py-14 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-[var(--brand)]/20 border-t-[var(--brand)] animate-spin" />
            <h4 className="font-display mt-4 text-sm font-black text-[var(--ink)]">
              Sedang Menganalisis Modul &amp; Meracik Soal...
            </h4>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Gemini AI sedang menyusun opsi jawaban dan penjelasan mendalam.
            </p>
          </div>
        ) : isFinished ? (
          /* Result Screen */
          <div className="py-8 text-center">
            <div
              className={`mx-auto grid h-16 w-16 place-items-center rounded-3xl text-white shadow-lg ${
                finalScore >= 80 ? "bg-[var(--brand)]" : finalScore >= 60 ? "bg-amber-500" : "bg-red-500"
              }`}
            >
              <Trophy size={32} />
            </div>

            <h3 className="font-display mt-4 text-2xl font-black text-[var(--ink)]">
              Skor Kamu: {finalScore} / 100
            </h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {finalScore >= 80
                ? "Luar biasa! Pemahamanmu pada modul pertemuan ini sangat matang. 🌟"
                : finalScore >= 60
                ? "Cukup baik! Masih ada beberapa konsep yang bisa diperdalam lagi. 💪"
                : "Yuk ulas kembali rangkuman dan slide dosen agar persiapan ujian makin mantap! 📖"}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleStartGenerate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-4 py-2.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--card-subtle)] transition"
              >
                <RotateCcw size={14} /> Coba Kuis Baru
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-xs font-black text-white shadow-xs hover:bg-[var(--brand-dark)] transition"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Playing Screen */
          <div className="mt-5 space-y-4">
            {/* Progress Counter */}
            <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
              <span>Soal {currentIdx + 1} dari {quizData.questions.length}</span>
              <span className="text-[var(--brand)]">
                {Math.round(((currentIdx + 1) / quizData.questions.length) * 100)}%
              </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--card-subtle)] border border-[var(--line)]">
              <div
                className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / quizData.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-4">
              <p className="text-xs sm:text-sm font-black text-[var(--ink)] leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = answeredChoice === oIdx;
                const isCorrect = oIdx === currentQ.correct_index;
                const isAnswered = answeredChoice !== undefined;

                let optClass = "border-[var(--line)] bg-[var(--card-bg)] text-[var(--ink)] hover:border-[var(--brand)]";

                if (isAnswered) {
                  if (isCorrect) {
                    optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                  } else if (isSelected && !isCorrect) {
                    optClass = "border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/20";
                  } else {
                    optClass = "border-[var(--line)] opacity-50 bg-[var(--card-bg)]";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-bold transition ${optClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[var(--card-subtle)] text-[10px] font-black">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>

                    {isAnswered && (
                      <span className="shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 size={16} className="text-emerald-600" />
                        ) : isSelected ? (
                          <AlertCircle size={16} className="text-red-500" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {showExplanation && (
              <div className="rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand-soft)] p-3.5 text-xs text-[var(--ink)] animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-black text-[var(--brand)] mb-1">
                  <Lightbulb size={14} />
                  <span>Pembahasan Dosen AI:</span>
                </div>
                <p className="leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {answeredChoice !== undefined && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-xs font-black text-white shadow-xs hover:bg-[var(--brand-dark)] transition active:scale-95"
                >
                  {currentIdx < quizData.questions.length - 1 ? "Soal Berikutnya →" : "Lihat Skor Akhir 🏆"}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
