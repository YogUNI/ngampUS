import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ArrowLeft,
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
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast-provider";
import { FormattedMarkdown } from "@/components/ui/formatted-markdown";

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
  const [userProfile, setUserProfile] = useState<{ avatar_url?: string | null; full_name?: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();

  const initialGreeting = {
    role: "assistant" as const,
    content: `Halo! Saya **ngampUS AI Tutor** untuk mata kuliah ${courseName || "ini"}, pertemuan ke-${pertemuan} (${moduleTopik}).${
      fileName ? ` Dokumen modul **"${fileName}"** sudah terhubung dan siap dibedah.` : ""
    } Apa konsep, rumus, atau soal yang ingin kamu tanyakan?`,
  };

  useEffect(() => {
    if (isOpen) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data) setUserProfile(data);
            });
        }
      });

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
      const msg = typeof err === "object" && err && "message" in err ? String((err as any).message) : "Gagal menghubungi AI Tutor.";
      
      // If error is about killswitch or temporary pause
      if (msg.includes("diistirahatkan sejenak") || msg.includes("optimalisasi kuota")) {
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: "Halo! 🍃 Layanan AI saat ini sedang diistirahatkan sejenak oleh kampus untuk pemeliharaan kuota dan server. Jangan khawatir, catatan dan modulmu tetap tersimpan aman. Silakan coba kembali beberapa saat lagi ya!" 
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ **Maaf, ada kendala saat memproses jawaban:**\n\n${msg}\n\n*Silakan coba kirim ulang pertanyaanmu ya.*`
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative z-10 flex h-[92vh] sm:h-[88vh] max-h-[820px] w-full max-w-2xl flex-col rounded-t-[2rem] sm:rounded-3xl border border-[#d8e3da] bg-white shadow-2xl overflow-hidden">
        {/* Header with Back/Close Button & Engine Badge */}
        <div className="flex items-center justify-between border-b border-[#f0f4f0] p-3.5 sm:p-4 bg-[#fbfdfb] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {/* Back Button for mobile & desktop */}
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0f4f0] text-[#0f6849] hover:bg-[#dff3e5] transition active:scale-95"
              title="Kembali / Tutup Obrolan"
              aria-label="Kembali"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>

            <span className="grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-2xl bg-[#0f6849] text-[#c8ef70] shadow-xs">
              <Bot size={20} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-sm sm:text-base font-black text-[#10261b] leading-tight">
                  Tanya Dosen AI
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#b9ddc6] bg-[#dff3e5] px-2 py-0.5 text-[9px] font-black text-[#0f6849]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse" />
                  ngampUS AI Engine
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-[#697c6f] truncate max-w-[180px] sm:max-w-xs font-medium">
                  P{pertemuan}: {moduleTopik} {courseName ? `· ${courseName}` : ""}
                </p>
                {fileName && (
                  <span className="hidden xs:inline-flex items-center gap-1 rounded-md bg-[#eef2ff] border border-[#c7d2fe] px-1.5 py-0.2 text-[9px] font-bold text-[#4338ca] shrink-0" title={`Membaca dokumen: ${fileName}`}>
                    <FileCheck size={10} />
                    Dokumen Terhubung
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={clearing || loading}
              title="Reset / Bersihkan percakapan"
              className="rounded-xl p-2 text-[#7d9284] hover:bg-[#fff0ec] hover:text-[#c53e1c] transition disabled:opacity-50 active:scale-95"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Tutup Obrolan"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#7d9284] hover:bg-[#f0f4f0] hover:text-[#10261b] transition active:scale-95"
            >
              <X size={18} strokeWidth={2.3} />
            </button>
          </div>
        </div>

        {/* Message Chat Body with Real User Avatar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#fafbfa]">
          {fetchingHistory ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-8 w-8 rounded-full border-2 border-[#0f6849]/20 border-t-[#0f6849] animate-spin" />
              <p className="mt-2 text-xs font-bold text-[#697c6f]">Memuat percakapan...</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* User Profile Avatar / AI Bot Avatar */}
                  {isUser ? (
                    userProfile?.avatar_url ? (
                      <Image
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name || "User"}
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-xl object-cover ring-2 ring-[#0f6849]/20 shadow-xs"
                      />
                    ) : (
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#103626] text-xs font-black text-[#c8ef70] shadow-xs">
                        {userProfile?.full_name ? userProfile.full_name.slice(0, 1).toUpperCase() : <User size={15} />}
                      </span>
                    )
                  ) : (
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#dff3e5] text-[#0f6849] border border-[#b9ddc6] shadow-xs">
                      <Bot size={16} />
                    </span>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                      isUser
                        ? "bg-[#103626] text-white rounded-tr-xs whitespace-pre-wrap"
                        : "bg-white text-[#10261b] border border-[#d8e3da] rounded-tl-xs"
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
            })
          )}

          {loading && (
            <div className="flex items-start gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#dff3e5] text-[#0f6849] border border-[#b9ddc6]">
                <Bot size={16} />
              </span>
              <div className="rounded-2xl border border-[#d8e3da] bg-white p-3 text-xs text-[#425a4c] shadow-xs flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0f6849] animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-[#0f6849] animate-bounce delay-100" />
                <div className="h-2 w-2 rounded-full bg-[#0f6849] animate-bounce delay-200" />
                <span className="text-[11px] font-bold text-[#10261b] ml-1">AI Tutor sedang menganalisis materi modul...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 bg-white border-t border-[#f0f4f0] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[10px] font-bold text-[#697c6f] shrink-0">Cepat tanya:</span>
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
              className="shrink-0 rounded-full border border-[#d8e3da] bg-[#f7f9f7] px-3 py-1 text-[10.5px] font-bold text-[#33463a] hover:border-[#0f6849] hover:bg-[#dff3e5] hover:text-[#0f6849] transition active:scale-95 disabled:opacity-50"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="border-t border-[#f0f4f0] p-3 sm:p-3.5 bg-white flex items-center gap-2 shrink-0 pb-6 sm:pb-3.5"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder="Tanyakan konsep, minta contoh soal, atau penjelasan materi..."
            className="flex-1 rounded-2xl border border-[#d8e3da] bg-[#f7f9f7] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#10261b] placeholder:text-[#8b9e91] focus:border-[#0f6849] focus:bg-white focus:outline-none transition disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#0f6849] text-[#c8ef70] shadow-md transition hover:bg-[#1a4a34] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Kirim pesan"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
