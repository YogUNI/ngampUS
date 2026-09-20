"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Lightbulb,
  Link2,
  Paperclip,
  Pencil,
  RotateCcw,
  RotateCw,
  Send,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import {
  generateModuleSummary,
  generateModuleQuiz,
  submitQuizScore,
  sendModuleChatMessage,
  clearModuleChatHistory,
  QuizQuestion,
} from "@/app/(dashboard)/modul/ai-actions";
import { updateModuleStatus } from "@/app/(dashboard)/modul/actions";
import { useToast } from "@/components/ui/toast-provider";
import { FormattedMarkdown } from "@/components/ui/formatted-markdown";
import { ModuleFormModal, CourseOption } from "@/components/modules/module-form-modal";

export type ModuleDetailData = {
  id: string;
  course_id: string;
  pertemuan: number;
  topik: string;
  deskripsi?: string | null;
  link_modul?: string | null;
  link_tugas?: string | null;
  status: "belum_baca" | "sudah_baca" | "dipelajari";
  tanggal_pertemuan?: string | null;
  catatan?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
  ai_summary?: string | null;
  ai_key_points?: string[] | null;
  ai_exam_tips?: string[] | null;
  courses?: {
    id: string;
    nama_matkul: string;
    kode_matkul?: string | null;
    warna_label?: string | null;
    sks?: number;
  } | null;
};

function formatBytes(bytes?: number | null, decimals = 1) {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const statusConfig = {
  belum_baca: {
    label: "Belum Dibaca",
    badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
    next: "sudah_baca" as const,
  },
  sudah_baca: {
    label: "Sudah Dibaca",
    badge: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    next: "dipelajari" as const,
  },
  dipelajari: {
    label: "Dipelajari",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    next: "belum_baca" as const,
  },
};

export function ModuleDetailClient({
  module: initialModule,
  courses,
  initialQuiz,
  initialChatHistory,
}: {
  module: ModuleDetailData;
  courses: CourseOption[];
  initialQuiz?: { id: string; questions: QuizQuestion[]; skor_terakhir?: number | null } | null;
  initialChatHistory?: { role: "user" | "assistant"; content: string }[];
}) {
  const [module, setModule] = useState<ModuleDetailData>(initialModule);
  const [activeTab, setActiveTab] = useState<"materi" | "rangkuman" | "tanya" | "kuis">("materi");
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  // Status cycling
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const handleCycleStatus = async () => {
    if (isUpdatingStatus) return;
    const nextStatus = statusConfig[module.status].next;
    setIsUpdatingStatus(true);
    try {
      await updateModuleStatus(module.id, nextStatus);
      setModule((prev) => ({ ...prev, status: nextStatus }));
      showToast(`Status modul diperbarui ke "${statusConfig[nextStatus].label}"`, "success");
    } catch {
      showToast("Gagal memperbarui status.", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ── Rangkuman State ──
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(module.ai_summary || "");
  const [keyPoints, setKeyPoints] = useState<string[]>(module.ai_key_points || []);
  const [examTips, setExamTips] = useState<string[]>(module.ai_exam_tips || []);

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await generateModuleSummary(module.id);
      setSummary(res.summary);
      setKeyPoints(res.key_points);
      setExamTips(res.exam_tips);
      setModule((prev) => ({
        ...prev,
        ai_summary: res.summary,
        ai_key_points: res.key_points,
        ai_exam_tips: res.exam_tips,
      }));
      showToast("Rangkuman AI berhasil dibuat!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat rangkuman.";
      showToast(msg, "error");
    } finally {
      setSummaryLoading(false);
    }
  };

  // ── Chat State ──
  const initialGreeting = {
    role: "assistant" as const,
    content: `Halo! Saya **ngampUS AI Tutor** untuk mata kuliah ${
      module.courses?.nama_matkul || "ini"
    }, pertemuan ke-${module.pertemuan} (${module.topik}).${
      module.file_name ? ` Dokumen materi **"${module.file_name}"** telah terhubung ke sistem.` : ""
    } Ada konsep, rumus, atau soal yang ingin kamu diskusikan?`,
  };

  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(
    initialChatHistory && initialChatHistory.length > 0 ? initialChatHistory : [initialGreeting]
  );
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatClearing, setChatClearing] = useState(false);

  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userText }]);
    setChatLoading(true);

    try {
      const reply = await sendModuleChatMessage(module.id, userText);
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim pesan.";
      showToast(msg, "error");
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (chatClearing || chatLoading) return;
    if (!confirm("Hapus seluruh percakapan obrolan AI untuk modul ini?")) return;

    setChatClearing(true);
    try {
      await clearModuleChatHistory(module.id);
      setChatMessages([initialGreeting]);
      showToast("Percakapan berhasil direset.", "success");
    } catch {
      showToast("Gagal mereset percakapan.", "error");
    } finally {
      setChatClearing(false);
    }
  };

  // ── Quiz State ──
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizData, setQuizData] = useState<{ id: string; questions: QuizQuestion[] } | null>(
    initialQuiz?.questions ? { id: initialQuiz.id, questions: initialQuiz.questions } : null
  );
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizScore, setQuizScore] = useState(initialQuiz?.skor_terakhir ?? 0);

  const handleStartQuiz = async () => {
    setQuizLoading(true);
    try {
      const res = await generateModuleQuiz(module.id);
      setQuizData({
        id: res.id,
        questions: res.questions as QuizQuestion[],
      });
      setCurrentQIdx(0);
      setSelectedAnswers({});
      setShowExplanation(false);
      setQuizFinished(false);
      setQuizScore(0);
      showToast("Kuis AI berhasil disiapkan! Selamat mengerjakan.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat kuis.";
      showToast(msg, "error");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizOption = (optIdx: number) => {
    if (selectedAnswers[currentQIdx] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQIdx]: optIdx }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    setShowExplanation(false);
    if (currentQIdx < quizData.questions.length - 1) {
      setCurrentQIdx((prev) => prev + 1);
    } else {
      let correct = 0;
      quizData.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correct_index) correct += 1;
      });
      const score = Math.round((correct / quizData.questions.length) * 100);
      setQuizScore(score);
      setQuizFinished(true);
      submitQuizScore(quizData.id, score);
    }
  };

  const currentStatusObj = statusConfig[module.status];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* ── Top Bar & Back Link ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/modul"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--muted)] transition hover:text-[var(--brand)]"
        >
          <ArrowLeft size={16} /> Kembali ke Semua Modul
        </Link>

        <div className="flex items-center gap-2">
          {/* Cycle Status Button */}
          <button
            type="button"
            onClick={handleCycleStatus}
            disabled={isUpdatingStatus}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 disabled:opacity-50 ${currentStatusObj.badge}`}
            title="Klik untuk mengubah status modul"
          >
            <CheckCircle2 size={13} strokeWidth={2.5} />
            <span>{currentStatusObj.label}</span>
          </button>

          {/* Edit Module Button */}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--card-subtle)] transition shadow-2xs"
          >
            <Pencil size={13} /> Edit Modul
          </button>
        </div>
      </div>

      {/* ── Header Banner: Campus Codex Detail Deck ── */}
      <header
        className="rounded-3xl border border-[#d6e2d8] bg-white p-5 sm:p-7 shadow-sm relative overflow-hidden"
        style={{
          borderLeftColor: module.courses?.warna_label || "#0f6849",
          borderLeftWidth: "6px",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="stamp-badge border-[#0f6849]/20 bg-[#dff3e5] text-[#0f6849]">
                PERTEMUAN {module.pertemuan < 10 ? `0${module.pertemuan}` : module.pertemuan}
              </span>
              <span className="tag-mono text-xs font-bold text-[#455c4e]">
                {module.courses?.nama_matkul}
                {module.courses?.kode_matkul ? ` (${module.courses.kode_matkul})` : ""}
              </span>
              {module.tanggal_pertemuan && (
                <span className="tag-mono inline-flex items-center gap-1 text-xs text-[#697c6f]">
                  <Calendar size={13} className="text-[#0f6849]" /> {module.tanggal_pertemuan}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#10261b]">
              {module.topik}
            </h1>

            {module.deskripsi && (
              <p className="text-xs sm:text-sm text-[#55675b] leading-relaxed">
                {module.deskripsi}
              </p>
            )}
          </div>

          {/* Document Indicator Badge */}
          {module.file_url && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#d8e3da] bg-[#fafbfa] p-3.5 shrink-0 shadow-2xs">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#103626] text-[#c8ef70] shadow-2xs">
                <FileCheck size={20} />
              </div>
              <div>
                <p className="tag-mono text-[10px] font-black uppercase tracking-wider text-[#0f6849]">
                  BERKAS GROUNDING AI
                </p>
                <p className="text-xs font-bold text-[#10261b] truncate max-w-[180px] sm:max-w-xs">
                  {module.file_name}
                </p>
                <a
                  href={module.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={module.file_name}
                  className="tag-mono inline-flex items-center gap-1 text-[11px] font-black text-[#0f6849] hover:underline mt-0.5"
                >
                  <Download size={11} /> Unduh File ({formatBytes(module.file_size)})
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Modern Navigation Tabs (Archival Ledger Tab Dividers) ── */}
      <div className="border-b border-[#d8e2dc]">
        <nav className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveTab("materi")}
            className={`inline-flex items-center gap-2 rounded-t-2xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "materi"
                ? "border-[#103626] bg-white text-[#10261b] shadow-xs"
                : "border-transparent text-[#697c6f] hover:text-[#10261b] hover:bg-white/50"
            }`}
          >
            <Paperclip size={15} />
            <span>Materi &amp; Dokumen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rangkuman")}
            className={`inline-flex items-center gap-2 rounded-t-2xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "rangkuman"
                ? "border-[#103626] bg-white text-[#10261b] shadow-xs"
                : "border-transparent text-[#697c6f] hover:text-[#10261b] hover:bg-white/50"
            }`}
          >
            <BookOpen size={15} />
            <span>Rangkuman AI</span>
            {summary && (
              <span className="h-2 w-2 rounded-full bg-[#0f6849]" title="Rangkuman tersedia" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tanya")}
            className={`inline-flex items-center gap-2 rounded-t-2xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "tanya"
                ? "border-[#103626] bg-white text-[#10261b] shadow-xs"
                : "border-transparent text-[#697c6f] hover:text-[#10261b] hover:bg-white/50"
            }`}
          >
            <Bot size={15} />
            <span>Tanya Dosen AI</span>
            <span className="rounded-full bg-[#dff3e5] border border-[#0f6849]/20 px-2 py-0.5 text-[10px] font-black text-[#0f6849]">
              Gemini 3.6
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kuis")}
            className={`inline-flex items-center gap-2 rounded-t-2xl px-4 sm:px-5 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === "kuis"
                ? "border-[#103626] bg-white text-[#10261b] shadow-xs"
                : "border-transparent text-[#697c6f] hover:text-[#10261b] hover:bg-white/50"
            }`}
          >
            <Trophy size={15} />
            <span>Kuis Evaluasi</span>
            {quizData && (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-900">
                5 Soal
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* ── TAB CONTENT 1: MATERI & DOKUMEN ── */}
      {activeTab === "materi" && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            {/* File Dokumen Utama */}
            <div className="rounded-3xl border border-[#d8e2dc] bg-white p-5 sm:p-6 shadow-xs">
              <h2 className="tag-mono text-xs font-black uppercase tracking-wider text-[#0f6849] mb-3 flex items-center gap-2">
                <FileText size={16} /> Berkas Dokumen Perkuliahan
              </h2>

              {module.file_url ? (
                <div className="rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#103626] text-[#c8ef70] shadow-xs">
                      <FileCheck size={24} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#10261b]">
                        {module.file_name}
                      </p>
                      <p className="tag-mono text-xs text-[#55675b] font-medium">
                        Ukuran: {formatBytes(module.file_size)} · Tipe: {module.file_type || "Dokumen"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={module.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8e2dc] bg-white px-3.5 py-2 text-xs font-bold text-[#10261b] hover:bg-[#f0f4f0] transition cursor-pointer"
                    >
                      <ExternalLink size={13} /> Buka Tab Baru
                    </a>
                    <a
                      href={module.file_url}
                      download={module.file_name}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#103626] px-4 py-2 text-xs font-black text-[#c8ef70] shadow-xs hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
                    >
                      <Download size={13} /> Unduh Dokumen
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8e2dc] p-8 text-center bg-[#f7faf8]">
                  <p className="text-xs font-medium text-[#697c6f]">Belum ada file dokumen yang diunggah untuk modul ini.</p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#0f6849] hover:underline cursor-pointer"
                  >
                    + Unggah Dokumen Materi Sekarang
                  </button>
                </div>
              )}
            </div>

            {/* Catatan & Resume Kuliah */}
            <div className="rounded-3xl border border-[#d8e2dc] bg-white p-5 sm:p-6 shadow-xs">
              <h2 className="tag-mono text-xs font-black uppercase tracking-wider text-[#0f6849] mb-3 flex items-center gap-2">
                📝 Catatan &amp; Catatan Khusus Mahasiswa
              </h2>
              {module.catatan ? (
                <div className="rounded-2xl border border-[#d8e2dc] bg-[#fcfdfc] p-4 sm:p-5 text-xs sm:text-sm text-[#10261b] leading-relaxed whitespace-pre-wrap font-mono">
                  {module.catatan}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#d8e2dc] p-8 text-center bg-[#f7faf8]">
                  <p className="text-xs font-medium text-[#697c6f]">Belum ada catatan kuliah yang kamu tulis.</p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#0f6849] hover:underline cursor-pointer"
                  >
                    + Tambah Catatan Pembelajaran
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Links & Quick AI Gateway */}
          <div className="space-y-6">
            {/* Tautan & Tugas */}
            <div className="rounded-3xl border border-[#d8e2dc] bg-white p-5 sm:p-6 shadow-xs">
              <h2 className="tag-mono text-xs font-black uppercase tracking-wider text-[#0f6849] mb-4 flex items-center gap-2">
                <Link2 size={16} /> Tautan Pendukung
              </h2>

              <div className="space-y-3">
                {module.link_modul ? (
                  <a
                    href={module.link_modul}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] p-3.5 text-xs font-bold text-[#10261b] hover:border-[#103626] transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#103626] text-[#c8ef70]">
                        <Link2 size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-[#10261b]">Tautan Modul / Drive</p>
                        <p className="truncate text-[10px] text-[#697c6f]">{module.link_modul}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-[#697c6f] group-hover:text-[#0f6849] shrink-0" />
                  </a>
                ) : null}

                {module.link_tugas ? (
                  <a
                    href={module.link_tugas}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] p-3.5 text-xs font-bold text-[#10261b] hover:border-[#103626] transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
                        <ExternalLink size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-[#10261b]">Pengumpulan Tugas Kuliah</p>
                        <p className="truncate text-[10px] text-[#697c6f]">{module.link_tugas}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-[#697c6f] group-hover:text-[#0f6849] shrink-0" />
                  </a>
                ) : null}

                {!module.link_modul && !module.link_tugas && (
                  <p className="text-xs text-[#697c6f] italic">Tidak ada tautan eksternal.</p>
                )}
              </div>
            </div>

            {/* AI Companion Quick Card */}
            <div className="rounded-3xl border border-[#d8e2dc] bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0f6849]">
                <Sparkles size={16} />
                <span className="tag-mono">STUDY AI SUITE</span>
              </div>
              <p className="text-xs text-[#55675b] leading-relaxed font-medium">
                Gunakan AI Tutor untuk membedah dokumen materi pertemuan ini, mengekstrak konsep esensial, dan menguji pemahaman dengan kuis instan.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("rangkuman")}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] hover:border-[#103626] hover:bg-[#dff3e5]/50 transition text-center cursor-pointer active:scale-95"
                >
                  <BookOpen size={18} className="text-[#0f6849] mb-1" />
                  <span className="text-xs font-black text-[#10261b]">Rangkuman AI</span>
                  <span className="text-[10px] text-[#697c6f]">Ekstrak konsep inti</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("kuis")}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] hover:border-[#103626] hover:bg-[#dff3e5]/50 transition text-center cursor-pointer active:scale-95"
                >
                  <Trophy size={18} className="text-amber-600 mb-1" />
                  <span className="text-xs font-black text-[#10261b]">Kuis Modul</span>
                  <span className="text-[10px] text-[#697c6f]">Uji pemahaman</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 2: RANGKUMAN AI ── */}
      {activeTab === "rangkuman" && (
        <div className="rounded-3xl border border-[#d8e2dc] bg-white p-5 sm:p-8 shadow-xs">
          {!summary && !summaryLoading ? (
            <div className="py-14 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#dff3e5] text-[#0f6849] shadow-xs">
                <BookOpen size={30} />
              </div>
              <h2 className="font-display mt-4 text-xl font-black text-[#10261b]">
                Belum Ada Rangkuman AI
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[#55675b] leading-relaxed font-medium">
                Biarkan AI Tutor membaca dokumen materi perkuliahan ini dan menyusun rangkuman esensi, poin kunci, serta prediksi kisi-kisi ujian.
              </p>
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#103626] px-6 py-3 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
              >
                <Sparkles size={16} /> Rangkum Sekarang dengan AI
              </button>
            </div>
          ) : summaryLoading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#0f6849]/20 border-t-[#0f6849] animate-spin" />
              <h3 className="font-display mt-4 text-base font-black text-[#10261b]">
                Sedang Membaca &amp; Merangkum Materi...
              </h3>
              <p className="mt-1 text-xs text-[#697c6f]">
                Mengekstrak poin penting, rumus, dan kisi-kisi ujian dari dokumen modul.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e2dc] pb-4">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-[#10261b]">
                    Rangkuman Esensi Materi Pertemuan {module.pertemuan}
                  </h2>
                  <p className="text-xs text-[#55675b]">
                    Dihasilkan secara cerdas berbasis dokumen dan silabus kuliah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8e2dc] bg-white px-3.5 py-2 text-xs font-bold text-[#10261b] hover:border-[#103626] hover:bg-[#f0f4f0] transition cursor-pointer"
                >
                  <RotateCw size={13} /> Generate Ulang
                </button>
              </div>

              {/* Ringkasan Inti */}
              <div className="rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0f6849] mb-3">
                  <BookOpen size={16} />
                  <span className="tag-mono">RINGKASAN INTI KONSEP</span>
                </div>
                <FormattedMarkdown content={summary} />
              </div>

              {/* Poin Kunci */}
              {keyPoints.length > 0 && (
                <div className="rounded-2xl border border-[#d8e2dc] bg-white p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0f6849] mb-4">
                    <CheckCircle2 size={16} />
                    <span className="tag-mono">POIN KUNCI &amp; DEFINISI PENTING</span>
                  </div>
                  <ul className="space-y-3">
                    {keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#10261b]">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#dff3e5] text-[#0f6849] text-xs font-black mt-0.5">
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
                <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 mb-3">
                    <Lightbulb size={16} />
                    <span className="tag-mono">PREDIKSI KISI-KISI &amp; HAL PENTING SAAT UJIAN</span>
                  </div>
                  <ul className="space-y-2.5">
                    {examTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950">
                        <span className="font-bold">💡</span>
                        <span className="leading-relaxed font-medium">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB CONTENT 3: TANYA DOSEN AI (FULL-HEIGHT CHAT WORKSPACE) ── */}
      {activeTab === "tanya" && (
        <div className="flex h-[720px] max-h-[80vh] flex-col rounded-3xl border border-[#d8e2dc] bg-white shadow-xs overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-[#d8e2dc] px-5 py-3.5 bg-[#f7faf8] shrink-0">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#103626] text-[#c8ef70] shadow-xs">
                <Bot size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm sm:text-base font-black text-[#10261b]">
                    Tanya Dosen AI · Pertemuan {module.pertemuan}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0f6849]/20 bg-[#dff3e5] px-2.5 py-0.5 text-[9.5px] font-black text-[#0f6849]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse" />
                    AI Engine
                  </span>
                </div>
                <p className="text-[11px] text-[#55675b]">
                  {module.topik} {module.courses?.nama_matkul ? `· ${module.courses.nama_matkul}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearChat}
              disabled={chatClearing || chatLoading}
              title="Reset / Bersihkan percakapan"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8e2dc] bg-white px-3 py-1.5 text-xs font-bold text-[#697c6f] hover:text-[#c53e1c] hover:bg-[#fff0ec] transition disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw size={14} /> Reset Obrolan
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fcfdfc]">
            {chatMessages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                      isUser
                        ? "bg-[#103626] text-[#c8ef70]"
                        : "bg-[#dff3e5] text-[#0f6849] border border-[#b9ddc6]"
                    }`}
                  >
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </span>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? "bg-[#103626] text-white rounded-tr-xs whitespace-pre-wrap"
                        : "bg-white text-[#10261b] border border-[#d8e2dc] rounded-tl-xs"
                    }`}
                  >
                    {isUser ? (
                      msg.content
                    ) : (
                      <FormattedMarkdown content={msg.content} />
                    )}
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Bot size={16} />
                </span>
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-4 text-xs text-[var(--muted)] shadow-2xs flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce delay-100" />
                  <div className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce delay-200" />
                  <span className="font-semibold ml-1">ngampUS AI sedang menganalisis silabus & materi...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 py-2 bg-white border-t border-[#d8e2dc] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-bold text-[#697c6f] shrink-0">Cepat tanya:</span>
            {[
              "Jelaskan dengan bahasa sederhana dong",
              "Beri 1 contoh kasus nyata",
              "Apa rumus / aturan pentingnya?",
              "Bagian mana yang sering keluar di ujian?",
            ].map((pText, pIdx) => (
              <button
                key={pIdx}
                type="button"
                disabled={chatLoading}
                onClick={() => setChatInput(pText)}
                className="shrink-0 rounded-full border border-[#d8e2dc] bg-[#f7faf8] px-3 py-1 text-[11px] font-bold text-[#10261b] hover:border-[#103626] hover:bg-[#dff3e5] hover:text-[#0f6849] transition disabled:opacity-50 cursor-pointer"
              >
                {pText}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendChat}
            className="border-t border-[#d8e2dc] p-4 bg-white flex items-center gap-2.5 shrink-0"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Tanyakan konsep, minta contoh soal, atau rumus dari materi ini..."
              className="flex-1 rounded-xl border border-[#d8e2dc] bg-[#f7faf8] px-4 py-3 text-xs sm:text-sm text-[#10261b] placeholder:text-[#8b9e91] focus:border-[#103626] focus:bg-white focus:outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="grid h-11 w-11 place-items-center rounded-xl bg-[#103626] text-[#c8ef70] shadow-sm transition hover:bg-[#1a4a34] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ── TAB CONTENT 4: KUIS EVALUASI ── */}
      {activeTab === "kuis" && (
        <div className="rounded-3xl border border-[#d8e2dc] bg-white p-5 sm:p-8 shadow-xs">
          {!quizData && !quizLoading ? (
            <div className="py-14 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#dff3e5] text-[#0f6849] shadow-xs">
                <Trophy size={30} />
              </div>
              <h2 className="font-display mt-4 text-xl font-black text-[#10261b]">
                Uji Pemahaman Pertemuan {module.pertemuan}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[#55675b] leading-relaxed font-medium">
                AI akan meracik 5 soal pilihan ganda berkualitas tinggi berdasarkan dokumen modul pertemuan ini lengkap dengan pembahasan kunci jawaban.
              </p>
              <button
                type="button"
                onClick={handleStartQuiz}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#103626] px-6 py-3 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
              >
                <Sparkles size={16} /> Mulai Racik Kuis AI
              </button>
            </div>
          ) : quizLoading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-[#0f6849]/20 border-t-[#0f6849] animate-spin" />
              <h3 className="font-display mt-4 text-base font-black text-[#10261b]">
                Sedang Meracik 5 Soal Kuis...
              </h3>
              <p className="mt-1 text-xs text-[#697c6f]">
                Menganalisis konsep dan menyusun opsi jawaban serta pembahasan.
              </p>
            </div>
          ) : quizFinished ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <div
                className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl text-white shadow-lg ${
                  quizScore >= 80 ? "bg-[#103626] text-[#c8ef70]" : quizScore >= 60 ? "bg-amber-600 text-amber-50" : "bg-red-600 text-red-50"
                }`}
              >
                <Trophy size={38} />
              </div>

              <span className="mt-4 inline-block font-mono text-[11px] font-black uppercase tracking-widest text-[#0f6849]">
                [EVALUATION REPORT // SCORE CARD]
              </span>

              <h2 className="font-display mt-1 text-3xl font-black text-[#10261b]">
                Skor Kamu: {quizScore} <span className="text-lg font-bold text-[#697c6f]">/ 100</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#55675b] leading-relaxed font-medium">
                {quizScore >= 80
                  ? "Luar biasa! Pemahamanmu pada modul pertemuan ini sangat matang. 🌟"
                  : quizScore >= 60
                  ? "Cukup baik! Masih ada beberapa konsep yang bisa diperdalam lagi. 💪"
                  : "Yuk ulas kembali rangkuman materi dan slide dosen agar persiapan ujian makin mantap! 📖"}
              </p>

              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#d8e2dc] bg-white px-5 py-2.5 text-xs font-bold text-[#10261b] hover:bg-[#f0f4f0] transition cursor-pointer"
                >
                  <RotateCcw size={14} /> Coba Kuis Baru
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("rangkuman")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#103626] px-6 py-2.5 text-xs font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
                >
                  Baca Rangkuman
                </button>
              </div>
            </div>
          ) : quizData?.questions ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#425a4c]">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#0f6849]">
                    SOAL {currentQIdx + 1} / {quizData.questions.length}
                  </span>
                  <span className="font-mono text-xs font-black text-[#10261b]">
                    {Math.round(((currentQIdx + 1) / quizData.questions.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8efe9] border border-[#d8e2dc]">
                  <div
                    className="h-full rounded-full bg-[#103626] transition-all duration-300"
                    style={{ width: `${((currentQIdx + 1) / quizData.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="rounded-2xl border border-[#d8e2dc] bg-[#f7faf8] p-5">
                <p className="text-sm sm:text-base font-black text-[#10261b] leading-relaxed">
                  {quizData.questions[currentQIdx]?.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {quizData.questions[currentQIdx]?.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQIdx] === oIdx;
                  const isCorrect = oIdx === quizData.questions[currentQIdx]?.correct_index;
                  const isAnswered = selectedAnswers[currentQIdx] !== undefined;

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
                      onClick={() => handleSelectQuizOption(oIdx)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-bold transition cursor-pointer ${optClass}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-xs font-black ${
                          isAnswered && isCorrect ? "bg-emerald-600 text-white" : isAnswered && isSelected ? "bg-red-500 text-white" : "bg-[#e8efe9] text-[#10261b]"
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswered && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : isSelected ? (
                            <span className="text-red-600 font-bold">✕</span>
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="rounded-2xl border border-[#0f6849]/30 bg-[#dff3e5] p-4 text-xs sm:text-sm text-[#10261b] animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-black text-[#0f6849] mb-1">
                    <Lightbulb size={16} />
                    <span className="tag-mono">PEMBAHASAN DOSEN AI:</span>
                  </div>
                  <p className="leading-relaxed font-medium text-[#10261b]">{quizData.questions[currentQIdx]?.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {selectedAnswers[currentQIdx] !== undefined && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#103626] px-6 py-3 text-xs sm:text-sm font-black text-[#c8ef70] shadow-sm hover:bg-[#1a4a34] transition active:scale-95 cursor-pointer"
                  >
                    {currentQIdx < quizData.questions.length - 1 ? "Soal Berikutnya →" : "Lihat Skor Akhir 🏆"}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <ModuleFormModal
          module={module}
          courses={courses}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
