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

      <div className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#d6e2d8] bg-white p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#edf2ee] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#103626] text-[#c8ef70] shadow-sm">
              <Trophy size={20} strokeWidth={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849]">
                  KUIS AI · P-{pertemuan < 10 ? `0${pertemuan}` : pertemuan}
                </span>
                {courseName && <span className="tag-mono text-xs font-bold text-[#697c6f]">· {courseName}</span>}
              </div>
              <h2 className="font-display mt-1 text-base sm:text-lg font-black tracking-tight text-[#10261b]">
                {moduleTopik}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#697c6f] hover:bg-[#f0f4f0] hover:text-[#10261b] transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!quizData && !loading ? (
          /* Start Screen */
          <div className="py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-[#dff3e5] text-[#0f6849] shadow-xs">
              <Trophy size={28} />
            </div>
            <h3 className="font-display mt-4 text-lg font-black text-[#10261b]">
              Uji Pemahaman Pertemuan {pertemuan}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-[#697c6f] leading-relaxed">
              AI akan menganalisis materi pertemuan ini dan meracik 5 soal pilihan ganda interaktif lengkap dengan penjelasan kunci jawaban.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleStartGenerate}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#103626] px-6 py-3 text-xs font-black text-[#c8ef70] shadow-md hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
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
                finalScore >= 80 ? "bg-[#103626] text-[#c8ef70]" : finalScore >= 60 ? "bg-amber-600 text-amber-50" : "bg-red-600 text-red-50"
              }`}
            >
              <Trophy size={32} />
            </div>

            <span className="mt-4 inline-block font-mono text-[11px] font-black uppercase tracking-widest text-[#0f6849]">
              [EVALUATION REPORT // SCORE CARD]
            </span>

            <h3 className="font-display mt-1 text-3xl font-black text-[#10261b]">
              {finalScore} <span className="text-lg font-bold text-[#697c6f]">/ 100</span>
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs font-medium text-[#425a4c] leading-relaxed">
              {finalScore >= 80
                ? "Luar biasa! Pemahaman konsep modul ini sudah sangat matang dan siap menghadapi ujian. 🌟"
                : finalScore >= 60
                ? "Cukup baik! Masih ada celah konsep yang bisa diperkuat dengan membaca ulang rangkuman. 💪"
                : "Yuk ulas kembali rangkuman dan slide kuliah agar penguasaan materi makin maksimal! 📖"}
            </p>

            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleStartGenerate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8e2dc] bg-white px-4 py-2.5 text-xs font-bold text-[#10261b] hover:bg-[#f0f4f0] transition cursor-pointer"
              >
                <RotateCcw size={14} /> Coba Kuis Baru
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-5 py-2.5 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        ) : currentQ ? (
          /* Question Playing Screen */
          <div className="mt-5 space-y-4">
            {/* Progress Counter */}
            <div className="flex items-center justify-between text-xs font-bold text-[#425a4c]">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#0f6849]">
                SOAL {currentIdx + 1} / {quizData.questions.length}
              </span>
              <span className="font-mono text-xs font-black text-[#10261b]">
                {Math.round(((currentIdx + 1) / quizData.questions.length) * 100)}%
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8efe9] border border-[#d8e2dc]">
              <div
                className="h-full rounded-full bg-[#103626] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / quizData.questions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <div className="rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] p-4">
              <p className="text-xs sm:text-sm font-black text-[#10261b] leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = answeredChoice === oIdx;
                const isCorrect = oIdx === currentQ.correct_index;
                const isAnswered = answeredChoice !== undefined;

                let optClass = "border-[#d8e2dc] bg-white text-[#10261b] hover:border-[#103626] hover:bg-[#f0f4f0]";

                if (isAnswered) {
                  if (isCorrect) {
                    optClass = "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-600/30";
                  } else if (isSelected && !isCorrect) {
                    optClass = "border-red-500 bg-red-50 text-red-950 ring-2 ring-red-500/30";
                  } else {
                    optClass = "border-[#d8e2dc] opacity-40 bg-white text-[#697c6f]";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs font-bold transition cursor-pointer ${optClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-black ${
                        isAnswered && isCorrect ? "bg-emerald-600 text-white" : isAnswered && isSelected ? "bg-red-500 text-white" : "bg-[#e8efe9] text-[#10261b]"
                      }`}>
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
              <div className="rounded-2xl border border-[#0f6849]/30 bg-[#dff3e5] p-3.5 text-xs text-[#10261b] animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 font-black text-[#0f6849] mb-1">
                  <Lightbulb size={14} />
                  <span className="font-mono text-[11px] uppercase tracking-wider">PEMBAHASAN DOSEN AI:</span>
                </div>
                <p className="leading-relaxed font-medium text-[#10261b]">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            {answeredChoice !== undefined && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-5 py-2.5 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
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
