"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  RotateCw,
  Sparkles,
  X,
} from "lucide-react";
import { generateModuleSummary } from "@/app/(dashboard)/modul/ai-actions";
import { useToast } from "@/components/ui/toast-provider";

export function ModuleSummaryModal({
  moduleId,
  moduleTopik,
  pertemuan,
  courseName,
  initialSummary,
  initialKeyPoints,
  initialExamTips,
  isOpen,
  onClose,
}: {
  moduleId: string;
  moduleTopik: string;
  pertemuan: number;
  courseName?: string;
  initialSummary?: string | null;
  initialKeyPoints?: string[] | null;
  initialExamTips?: string[] | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(initialSummary || "");
  const [keyPoints, setKeyPoints] = useState<string[]>(initialKeyPoints || []);
  const [examTips, setExamTips] = useState<string[]>(initialExamTips || []);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateModuleSummary(moduleId);
      setSummary(res.summary);
      setKeyPoints(res.key_points);
      setExamTips(res.exam_tips);
      showToast("Rangkuman AI berhasil dibuat!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat rangkuman.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#d6e2d8] bg-white p-5 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#edf2ee] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#103626] text-[#c8ef70] shadow-sm">
              <Sparkles size={20} strokeWidth={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849]">
                  RANGKUMAN AI · P-{pertemuan < 10 ? `0${pertemuan}` : pertemuan}
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
        {!summary && !loading ? (
          /* Empty / Trigger State */
          <div className="py-12 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-[#dff3e5] text-[#0f6849] shadow-xs">
              <BookOpen size={28} />
            </div>
            <h3 className="font-display mt-4 text-lg font-black text-[#10261b]">
              Belum Ada Rangkuman AI
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-[#697c6f] leading-relaxed">
              Biarkan AI menganalisis materi pertemuan ini dan merangkum poin esensial, konsep kunci, dan kisi-kisi ujian.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#103626] px-6 py-3 text-xs font-black text-[#c8ef70] shadow-md hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
              >
                <Sparkles size={16} /> Rangkum Sekarang dengan AI
              </button>
            </div>
          </div>
        ) : loading ? (
          /* Loading State */
          <div className="py-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#0f6849]/20 border-t-[#0f6849] animate-spin" />
            <h4 className="font-display mt-4 text-sm font-black text-[#10261b]">
              Sedang Membaca &amp; Merangkum Dokumen...
            </h4>
            <p className="tag-mono mt-1 text-xs text-[#697c6f]">
              Mengekstraksi poin penting dan kisi-kisi pemahaman materi.
            </p>
          </div>
        ) : (
          /* Result Summary View */
          <div className="mt-5 space-y-4">
            {/* Esensi Materi */}
            <div className="rounded-2xl border border-[#d6e2d8] bg-[#fcfdfc] p-4 sm:p-5 shadow-2xs">
              <div className="tag-mono flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0f6849] mb-2">
                <BookOpen size={15} />
                <span>Ringkasan Inti Materi</span>
              </div>
              <p className="text-xs sm:text-sm text-[#10261b] leading-relaxed whitespace-pre-line font-sans">
                {summary}
              </p>
            </div>

            {/* Poin Kunci */}
            {keyPoints.length > 0 && (
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--brand)] mb-3">
                  <CheckCircle2 size={15} />
                  <span>Poin Kunci &amp; Konsep Utama</span>
                </div>
                <ul className="space-y-2">
                  {keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[var(--ink)]">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-[10px] font-black mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-semibold">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Kisi-kisi Ujian */}
            {examTips.length > 0 && (
              <div className="rounded-2xl border border-[#fae29c] bg-[#fffaf0] p-4 sm:p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#9a6900] mb-3">
                  <Lightbulb size={15} />
                  <span>Prediksi Kisi-kisi &amp; Hal yang Diwaspadai saat Ujian</span>
                </div>
                <ul className="space-y-2">
                  {examTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#7a5b03]">
                      <span className="text-amber-500 font-bold">💡</span>
                      <span className="leading-relaxed font-medium">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Action */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--brand)] transition"
              >
                <RotateCw size={13} /> Generate Ulang Rangkuman
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[var(--brand)] px-5 py-2 text-xs font-black text-white shadow-xs hover:bg-[var(--brand-dark)] transition"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
