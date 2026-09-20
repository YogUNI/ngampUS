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

      {/* ── Header Banner ── */}
      <header
        className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-7 shadow-xs relative overflow-hidden"
        style={{
          borderLeftColor: module.courses?.warna_label || "var(--brand)",
          borderLeftWidth: "6px",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-[var(--card-subtle)] px-2.5 py-0.5 text-xs font-black tracking-wide text-[var(--brand)] border border-[var(--line)]">
                Pertemuan {module.pertemuan}
              </span>
              <span className="text-xs font-bold text-[var(--muted)]">
                {module.courses?.nama_matkul}
                {module.courses?.kode_matkul ? ` (${module.courses.kode_matkul})` : ""}
              </span>
              {module.tanggal_pertemuan && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)] font-medium">
                  <Calendar size={13} /> {module.tanggal_pertemuan}
                </span>
              )}
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              {module.topik}
            </h1>

            {module.deskripsi && (
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                {module.deskripsi}
              </p>
            )}
          </div>

          {/* Document Indicator Badge */}
          {module.file_url && (
            <div className="flex items-center gap-2 rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/40 p-3 shrink-0">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-white shadow-2xs">
                <FileCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  RAG Document Grounded
                </p>
                <p className="text-xs font-bold text-[var(--ink)] truncate max-w-[180px] sm:max-w-xs">
                  {module.file_name}
                </p>
                <a
                  href={module.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={module.file_name}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline mt-0.5"
                >
                  <Download size={11} /> Unduh File ({formatBytes(module.file_size)})
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Modern Navigation Tabs (Clean, Spacious, Sticky-Friendly) ── */}
      <div className="border-b border-[var(--line)]">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("materi")}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap ${
              activeTab === "materi"
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line)]"
            }`}
          >
            <Paperclip size={15} />
            <span>Materi &amp; Dokumen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rangkuman")}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap ${
              activeTab === "rangkuman"
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line)]"
            }`}
          >
            <BookOpen size={15} />
            <span>Rangkuman AI</span>
            {summary && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="Rangkuman tersedia" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tanya")}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap ${
              activeTab === "tanya"
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line)]"
            }`}
          >
            <Bot size={15} />
            <span>Tanya Dosen AI</span>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300">
              Gemini 3.6
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("kuis")}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-black border-b-2 transition whitespace-nowrap ${
              activeTab === "kuis"
                ? "border-[var(--brand)] text-[var(--brand)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line)]"
            }`}
          >
            <Trophy size={15} />
            <span>Kuis Evaluasi</span>
            {quizData && (
              <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
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
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-xs">
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--brand)] mb-3 flex items-center gap-2">
                <FileText size={16} /> Berkas Dokumen Perkuliahan
              </h2>

              {module.file_url ? (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] text-white shadow-2xs">
                      <FileCheck size={24} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[var(--ink)]">
                        {module.file_name}
                      </p>
                      <p className="text-xs text-[var(--muted)] font-medium">
                        Ukuran: {formatBytes(module.file_size)} · Tipe: {module.file_type || "Dokumen"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={module.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--card-subtle)] transition"
                    >
                      <ExternalLink size={13} /> Buka Tab Baru
                    </a>
                    <a
                      href={module.file_url}
                      download={module.file_name}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-[var(--brand-dark)] transition active:scale-95"
                    >
                      <Download size={13} /> Unduh Dokumen
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center bg-[var(--card-subtle)]">
                  <p className="text-xs text-[var(--muted)]">Belum ada file dokumen yang diunggah untuk modul ini.</p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline"
                  >
                    + Unggah Dokumen Materi Sekarang
                  </button>
                </div>
              )}
            </div>

            {/* Catatan & Resume Kuliah */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-xs">
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--brand)] mb-3 flex items-center gap-2">
                📝 Catatan &amp; Catatan Khusus Mahasiswa
              </h2>
              {module.catatan ? (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-4 sm:p-5 text-xs sm:text-sm text-[var(--ink)] leading-relaxed whitespace-pre-wrap font-mono">
                  {module.catatan}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--line)] p-8 text-center bg-[var(--card-subtle)]">
                  <p className="text-xs text-[var(--muted)]">Belum ada catatan kuliah yang kamu tulis.</p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline"
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
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-xs">
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--brand)] mb-4 flex items-center gap-2">
                <Link2 size={16} /> Tautan Pendukung
              </h2>

              <div className="space-y-3">
                {module.link_modul ? (
                  <a
                    href={module.link_modul}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-3.5 text-xs font-bold text-[var(--ink)] hover:border-[var(--brand)] transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#103626] text-[#c8ef70]">
                        <Link2 size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-[var(--ink)]">Tautan Modul / Drive</p>
                        <p className="truncate text-[10px] text-[var(--muted)]">{module.link_modul}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-[var(--muted)] group-hover:text-[var(--brand)] shrink-0" />
                  </a>
                ) : null}

                {module.link_tugas ? (
                  <a
                    href={module.link_tugas}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-3.5 text-xs font-bold text-[var(--ink)] hover:border-[var(--brand)] transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
                        <ExternalLink size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-[var(--ink)]">Pengumpulan Tugas Kuliah</p>
                        <p className="truncate text-[10px] text-[var(--muted)]">{module.link_tugas}</p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-[var(--muted)] group-hover:text-[var(--brand)] shrink-0" />
                  </a>
                ) : null}

                {!module.link_modul && !module.link_tugas && (
                  <p className="text-xs text-[var(--muted)] italic">Tidak ada tautan eksternal.</p>
                )}
              </div>
            </div>

            {/* AI Companion Quick Card */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--brand)]">
                <Sparkles size={16} />
                <span>ngampUS AI Companion</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Manfaatkan ngampUS AI Engine untuk membedah dokumen materi pertemuan ini, merangkum poin esensial, dan melatih pemahamanmu dengan kuis interaktif.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("rangkuman")}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] hover:border-[var(--brand)] transition text-center"
                >
                  <BookOpen size={18} className="text-[var(--brand)] mb-1" />
                  <span className="text-xs font-black text-[var(--ink)]">Rangkuman AI</span>
                  <span className="text-[10px] text-[var(--muted)]">Ekstrak konsep inti</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("kuis")}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] hover:border-[var(--brand)] transition text-center"
                >
                  <Trophy size={18} className="text-amber-500 mb-1" />
                  <span className="text-xs font-black text-[var(--ink)]">Kuis Modul</span>
                  <span className="text-[10px] text-[var(--muted)]">Uji pemahaman</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT 2: RANGKUMAN AI ── */}
      {activeTab === "rangkuman" && (
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-8 shadow-xs">
          {!summary && !summaryLoading ? (
            <div className="py-14 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#dff3e5] dark:bg-[#103626] text-[var(--brand)] shadow-xs">
                <BookOpen size={30} />
              </div>
              <h2 className="font-display mt-4 text-xl font-extrabold text-[var(--ink)]">
                Belum Ada Rangkuman AI
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Biarkan ngampUS AI Engine membaca dokumen materi perkuliahan ini dan menyusun rangkuman esensi, poin kunci, serta prediksi kisi-kisi ujian.
              </p>
              <button
                type="button"
                onClick={handleGenerateSummary}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3 text-xs font-black text-white shadow-md hover:bg-[var(--brand-dark)] transition active:scale-95"
              >
                <Sparkles size={16} /> Rangkum Sekarang dengan AI
              </button>
            </div>
          ) : summaryLoading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-[var(--brand)]/20 border-t-[var(--brand)] animate-spin" />
              <h3 className="font-display mt-4 text-base font-black text-[var(--ink)]">
                Sedang Membaca &amp; Merangkum Materi...
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Mengekstrak poin penting, rumus, dan kisi-kisi ujian dari dokumen modul.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-black text-[var(--ink)]">
                    Rangkuman Esensi Materi Pertemuan {module.pertemuan}
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Dihasilkan secara cerdas berbasis dokumen dan silabus kuliah.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition"
                >
                  <RotateCw size={13} /> Generate Ulang
                </button>
              </div>

              {/* Ringkasan Inti */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-5 sm:p-6 shadow-2xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--brand)] mb-3">
                  <BookOpen size={16} />
                  <span>Ringkasan Inti Konsep</span>
                </div>
                <FormattedMarkdown content={summary} />
              </div>

              {/* Poin Kunci */}
              {keyPoints.length > 0 && (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--brand)] mb-4">
                    <CheckCircle2 size={16} />
                    <span>Poin Kunci &amp; Definisi Penting</span>
                  </div>
                  <ul className="space-y-3">
                    {keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--ink)]">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] text-xs font-black mt-0.5">
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
                <div className="rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-3">
                    <Lightbulb size={16} />
                    <span>Prediksi Kisi-kisi &amp; Hal yang Perlu Diwaspadai saat Ujian</span>
                  </div>
                  <ul className="space-y-2.5">
                    {examTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
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
        <div className="flex h-[720px] max-h-[80vh] flex-col rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3.5 bg-[var(--card-subtle)] shrink-0">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand)] text-white shadow-xs">
                <Bot size={20} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm sm:text-base font-black text-[var(--ink)]">
                    Tanya Dosen AI · Pertemuan {module.pertemuan}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[9.5px] font-black text-emerald-800 dark:text-emerald-300 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ngampUS AI Engine
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted)]">
                  {module.topik} {module.courses?.nama_matkul ? `· ${module.courses.nama_matkul}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearChat}
              disabled={chatClearing || chatLoading}
              title="Reset / Bersihkan percakapan"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3 py-1.5 text-xs font-bold text-[var(--muted)] hover:text-rose-500 transition disabled:opacity-50"
            >
              <RotateCcw size={14} /> Reset Obrolan
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                        : "bg-[var(--brand-soft)] text-[var(--brand)]"
                    }`}
                  >
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                  </span>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isUser
                        ? "bg-[#103626] text-white rounded-tr-xs whitespace-pre-wrap"
                        : "bg-[var(--card-subtle)] text-[var(--ink)] border border-[var(--line)] rounded-tl-xs"
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
          <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 py-2 bg-[var(--card-bg)] border-t border-[var(--line)] scrollbar-none">
            <span className="text-[10px] font-bold text-[var(--muted)] shrink-0">Cepat tanya:</span>
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
                className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--card-subtle)] px-3 py-1 text-[11px] font-bold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition disabled:opacity-50"
              >
                {pText}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSendChat}
            className="border-t border-[var(--line)] p-4 bg-[var(--card-subtle)] flex items-center gap-2.5 shrink-0"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
              placeholder="Tanyakan konsep, minta contoh soal, atau rumus dari materi ini..."
              className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-4 py-3 text-xs sm:text-sm text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand)] text-white shadow-xs transition hover:bg-[var(--brand-dark)] active:scale-95 disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ── TAB CONTENT 4: KUIS EVALUASI ── */}
      {activeTab === "kuis" && (
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--card-bg)] p-5 sm:p-8 shadow-xs">
          {!quizData && !quizLoading ? (
            <div className="py-14 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#dff3e5] dark:bg-[#103626] text-[var(--brand)] shadow-xs">
                <Trophy size={30} />
              </div>
              <h2 className="font-display mt-4 text-xl font-extrabold text-[var(--ink)]">
                Uji Pemahaman Pertemuan {module.pertemuan}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Gemini AI akan meracik 5 soal pilihan ganda berkualitas tinggi berdasarkan dokumen modul pertemuan ini lengkap dengan pembahasan kunci jawaban.
              </p>
              <button
                type="button"
                onClick={handleStartQuiz}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-3 text-xs font-black text-white shadow-md hover:bg-[var(--brand-dark)] transition active:scale-95"
              >
                <Sparkles size={16} /> Mulai Racik Kuis AI
              </button>
            </div>
          ) : quizLoading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 rounded-full border-4 border-[var(--brand)]/20 border-t-[var(--brand)] animate-spin" />
              <h3 className="font-display mt-4 text-base font-black text-[var(--ink)]">
                Sedang Meracik 5 Soal Kuis...
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Menganalisis konsep dan menyusun opsi jawaban serta pembahasan.
              </p>
            </div>
          ) : quizFinished ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <div
                className={`mx-auto grid h-20 w-20 place-items-center rounded-3xl text-white shadow-lg ${
                  quizScore >= 80 ? "bg-[var(--brand)]" : quizScore >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}
              >
                <Trophy size={38} />
              </div>

              <h2 className="font-display mt-5 text-3xl font-black text-[var(--ink)]">
                Skor Kamu: {quizScore} / 100
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
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
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--card-subtle)] px-5 py-2.5 text-xs font-bold text-[var(--ink)] hover:border-[var(--brand)] transition"
                >
                  <RotateCcw size={14} /> Coba Kuis Baru
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("rangkuman")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-2.5 text-xs font-black text-white shadow-xs hover:bg-[var(--brand-dark)] transition"
                >
                  Baca Rangkuman
                </button>
              </div>
            </div>
          ) : quizData?.questions ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
                  <span>Soal {currentQIdx + 1} dari {quizData.questions.length}</span>
                  <span className="text-[var(--brand)]">
                    {Math.round(((currentQIdx + 1) / quizData.questions.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--card-subtle)] border border-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand)] transition-all duration-300"
                    style={{ width: `${((currentQIdx + 1) / quizData.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-subtle)] p-5">
                <p className="text-sm sm:text-base font-black text-[var(--ink)] leading-relaxed">
                  {quizData.questions[currentQIdx]?.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {quizData.questions[currentQIdx]?.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQIdx] === oIdx;
                  const isCorrect = oIdx === quizData.questions[currentQIdx]?.correct_index;
                  const isAnswered = selectedAnswers[currentQIdx] !== undefined;

                  let optClass = "border-[var(--line)] bg-[var(--card-bg)] text-[var(--ink)] hover:border-[var(--brand)]";
                  if (isAnswered) {
                    if (isCorrect) {
                      optClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20";
                    } else if (isSelected && !isCorrect) {
                      optClass = "border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200 ring-2 ring-red-500/20";
                    } else {
                      optClass = "border-[var(--line)] opacity-50 bg-[var(--card-bg)]";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectQuizOption(oIdx)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs sm:text-sm font-bold transition ${optClass}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[var(--card-subtle)] text-xs font-black">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswered && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : isSelected ? (
                            <span className="text-red-500 font-bold">✕</span>
                          ) : null}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand-soft)] p-4 text-xs sm:text-sm text-[var(--ink)] animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-black text-[var(--brand)] mb-1">
                    <Lightbulb size={16} />
                    <span>Pembahasan Dosen AI:</span>
                  </div>
                  <p className="leading-relaxed">{quizData.questions[currentQIdx]?.explanation}</p>
                </div>
              )}

              {/* Next Button */}
              {selectedAnswers[currentQIdx] !== undefined && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3 text-xs sm:text-sm font-black text-white shadow-xs hover:bg-[var(--brand-dark)] transition active:scale-95"
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
