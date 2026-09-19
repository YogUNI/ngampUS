"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  FileCheck,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  sendModuleChatMessage,
  getModuleChatHistory,
  clearModuleChatHistory,
} from "@/app/(dashboard)/modul/ai-actions";
import { useToast } from "@/components/ui/toast-provider";

export function ModuleChatModal({
  moduleId,
  moduleTopik,
  pertemuan,
  courseName,
  fileName,
  isOpen,
  onClose,
}: {
  moduleId: string;
  moduleTopik: string;
  pertemuan: number;
  courseName?: string;
  fileName?: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const initialGreeting = {
    role: "assistant" as const,
    content: `Halo! Saya asisten studi AI untuk mata kuliah ${courseName || "ini"}, pertemuan ke-${pertemuan} (${moduleTopik}).${
      fileName ? ` Dokumen modul **"${fileName}"** telah dibaca.` : ""
    } Ada bagian materi, konsep, atau rumus yang ingin kamu tanyakan?`,
  };

  useEffect(() => {
    if (isOpen) {
      setFetchingHistory(true);
      getModuleChatHistory(moduleId)
        .then((hist) => {
          if (hist && hist.length > 0) {
            setMessages(hist.map((h: any) => ({ role: h.role, content: h.content })));
          } else {
            setMessages([initialGreeting]);
          }
        })
        .catch(() => {})
        .finally(() => setFetchingHistory(false));
    }
  }, [isOpen, moduleId, pertemuan, moduleTopik, courseName, fileName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleClearHistory = async () => {
    if (clearing || loading) return;
    if (!confirm("Hapus seluruh percakapan obrolan AI untuk modul ini?")) return;

    setClearing(true);
    try {
      await clearModuleChatHistory(moduleId);
      setMessages([initialGreeting]);
      showToast("Percakapan berhasil direset.", "success");
    } catch {
      showToast("Gagal mereset percakapan.", "error");
    } finally {
      setClearing(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const reply = await sendModuleChatMessage(moduleId, userText);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim pesan.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 flex h-[88vh] max-h-[700px] w-full max-w-xl flex-col rounded-3xl border border-[var(--line)] bg-[var(--background)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] p-4 bg-[var(--card-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand)] text-white shadow-xs">
              <Bot size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-black text-[var(--ink)]">
                  Tanya Dosen AI
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9.5px] font-black text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini 3.6
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-[var(--muted)] truncate max-w-[200px] sm:max-w-xs">
                  P{pertemuan}: {moduleTopik} {courseName ? `· ${courseName}` : ""}
                </p>
                {fileName && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 px-1.5 py-0.5 text-[9.5px] font-bold text-sky-700 dark:text-sky-300 shrink-0" title={`RAG Grounded: Membaca dokumen ${fileName}`}>
                    <FileCheck size={10} />
                    Dokumen Siap
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={clearing || loading}
              title="Reset / Bersihkan percakapan"
              className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-rose-500 transition disabled:opacity-50"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {fetchingHistory ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-8 w-8 rounded-full border-2 border-[var(--brand)]/20 border-t-[var(--brand)] animate-spin" />
              <p className="mt-2 text-xs text-[var(--muted)]">Memuat percakapan...</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                      isUser
                        ? "bg-[#103626] text-[#c8ef70]"
                        : "bg-[var(--brand-soft)] text-[var(--brand)]"
                    }`}
                  >
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </span>

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-[#103626] text-white rounded-tr-xs"
                        : "bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--line)] shadow-2xs rounded-tl-xs"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-start gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Bot size={14} />
              </span>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--card-bg)] p-3 text-xs text-[var(--muted)] shadow-2xs flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce delay-100" />
                <div className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce delay-200" />
                <span className="text-[11px] font-semibold ml-1">AI sedang menganalisis materi...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-[var(--card-bg)] border-t border-[var(--line)] scrollbar-none">
          <span className="text-[10px] font-bold text-[var(--muted)] shrink-0">Cepat tanya:</span>
          {[
            "Jelaskan dengan bahasa sederhana dong",
            "Beri 1 contoh kasus nyata",
            "Apa rumus / aturan pentingnya?",
            "Bagian mana yang sering keluar di ujian?",
          ].map((promptText, pIdx) => (
            <button
              key={pIdx}
              type="button"
              disabled={loading}
              onClick={() => {
                setInputMessage(promptText);
              }}
              className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--card-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)] transition disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="border-t border-[var(--line)] p-3 bg-[var(--card-subtle)] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder="Tanyakan konsep, minta contoh soal, atau penjelasan materi ini..."
            className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--card-bg)] px-3.5 py-2.5 text-xs text-[var(--ink)] focus:border-[var(--brand)] focus:outline-hidden disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand)] text-white shadow-xs transition hover:bg-[var(--brand-dark)] active:scale-95 disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
