"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bot,
  MessageSquare,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { sendModuleChatMessage, getModuleChatHistory } from "@/app/(dashboard)/modul/ai-actions";
import { useToast } from "@/components/ui/toast-provider";

export function ModuleChatModal({
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
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setFetchingHistory(true);
      getModuleChatHistory(moduleId)
        .then((hist) => {
          if (hist && hist.length > 0) {
            setMessages(hist.map((h: any) => ({ role: h.role, content: h.content })));
          } else {
            // Initial greeting message
            setMessages([
              {
                role: "assistant",
                content: `Halo! Saya asisten studi AI untuk mata kuliah ${courseName || "ini"}, pertemuan ke-${pertemuan} (${moduleTopik}). Ada bagian konsep, rumus, atau materi yang ingin kamu tanyakan atau minta contoh penjelasannya?`,
              },
            ]);
          }
        })
        .catch(() => {})
        .finally(() => setFetchingHistory(false));
    }
  }, [isOpen, moduleId, pertemuan, moduleTopik, courseName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
              <p className="text-[11px] text-[var(--muted)] truncate max-w-xs sm:max-w-sm">
                P{pertemuan}: {moduleTopik} {courseName ? `· ${courseName}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-[var(--ink)] transition"
          >
            <X size={18} />
          </button>
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
