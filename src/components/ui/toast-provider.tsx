"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Check, AlertCircle, X, Trash2 } from "lucide-react";

type ToastType = "success" | "error" | "delete";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2, 9);

    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);

    // Start exit animation just before removing
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
    }, 2600);

    // Remove from DOM after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2950);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toasts.length > 0 && (
        // Bottom-right corner stack — industry standard UX
        <div
          className="fixed bottom-5 right-5 z-[300] flex flex-col-reverse gap-2.5 pointer-events-none"
          style={{ maxWidth: "min(380px, calc(100vw - 2.5rem))" }}
          aria-live="polite"
        >
          {toasts.map((toast) => {
            const isSuccess = toast.type === "success";
            const isDelete  = toast.type === "delete";

            return (
              <div
                key={toast.id}
                className={`pointer-events-auto relative flex items-center gap-4 px-6 py-5 rounded-3xl text-white shadow-2xl select-none
                  ${toast.exiting ? "toast-animate-out" : "toast-animate-in"}
                `}
                style={{
                  background: isDelete
                    ? "linear-gradient(135deg, #2a0c08 0%, #4a1a0f 100%)"
                    : isSuccess
                    ? "linear-gradient(135deg, #0a2318 0%, #103a24 100%)"
                    : "linear-gradient(135deg, #2a0c08 0%, #4a1a0f 100%)",
                  border: `1px solid ${isDelete ? "rgba(229,114,85,.35)" : isSuccess ? "rgba(200,239,112,.3)" : "rgba(229,114,85,.35)"}`,
                  boxShadow: isSuccess
                    ? "0 20px 50px -8px rgba(10,35,22,.7), 0 0 0 1px rgba(200,239,112,.12), 0 0 40px -10px rgba(200,239,112,.2)"
                    : "0 20px 50px -8px rgba(40,10,5,.7), 0 0 0 1px rgba(229,114,85,.12), 0 0 40px -10px rgba(229,114,85,.2)",
                  width: "100%",
                }}
              >
                {/* Ambient glow blob */}
                <div
                  className="toast-glow pointer-events-none absolute rounded-full"
                  style={{
                    width: 120, height: 120,
                    top: -20, left: -20,
                    background: isSuccess ? "radial-gradient(circle, rgba(200,239,112,.45), transparent 65%)" : "radial-gradient(circle, rgba(229,114,85,.45), transparent 65%)",
                    filter: "blur(18px)",
                  }}
                />

                {/* Icon */}
                <div
                  className="toast-icon-pop relative z-10 grid shrink-0 place-items-center rounded-2xl"
                  style={{
                    width: 54, height: 54,
                    background: isSuccess
                      ? "linear-gradient(135deg, #c8ef70 0%, #8dd448 100%)"
                      : "linear-gradient(135deg, #e57255 0%, #c94926 100%)",
                    boxShadow: isSuccess
                      ? "0 8px 20px rgba(200,239,112,.4), inset 0 1px 0 rgba(255,255,255,.3)"
                      : "0 8px 20px rgba(229,114,85,.4), inset 0 1px 0 rgba(255,255,255,.3)",
                    color: isSuccess ? "#0a2318" : "#fff",
                  }}
                >
                  {isDelete ? <Trash2 size={24} strokeWidth={2.5} /> : isSuccess ? <Check size={26} strokeWidth={3} /> : <AlertCircle size={24} strokeWidth={2.5} />}
                </div>

                {/* Text */}
                <div className="relative z-10 min-w-0 flex-1">
                  <p
                    className="text-[11px] font-black uppercase tracking-[.14em] mb-0.5"
                    style={{ color: isSuccess ? "#c8ef70" : "#e57255" }}
                  >
                    {isDelete ? "✦ Terhapus" : isSuccess ? "✦ Berhasil" : "✦ Peringatan"}
                  </p>
                  <p className="text-[15px] font-bold leading-snug text-white/95">
                    {toast.message}
                  </p>
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="relative z-10 rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white/90 transition-colors"
                  title="Tutup"
                >
                  <X size={17} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
