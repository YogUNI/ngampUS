"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";

export type TourStep = {
  targetSelector: string;
  title: string;
  description: string;
  position?: "bottom" | "top" | "left" | "right";
};

export function SpotlightTour({
  steps,
  isOpen,
  onClose,
  onComplete,
}: {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentStep = steps[currentStepIndex];

  const updateTargetRect = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    // Delay slight bit to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      updateTargetRect();
    }, 150);

    const handleResize = () => updateTargetRect();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  if (!mounted || !isOpen || !currentStep) return null;

  function handleNext() {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  // Calculate tooltip position relative to target
  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 99999,
  };

  if (targetRect) {
    const margin = 14;
    const tooltipWidth = 320;

    let top = targetRect.bottom + margin;
    let left = targetRect.left;

    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    if (left < 16) left = 16;

    if (top + 190 > window.innerHeight && targetRect.top > 200) {
      top = targetRect.top - 190 - margin;
    }

    tooltipStyle = {
      ...tooltipStyle,
      top: `${Math.max(16, top)}px`,
      left: `${Math.max(16, left)}px`,
      width: `${tooltipWidth}px`,
    };
  } else {
    tooltipStyle = {
      ...tooltipStyle,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "320px",
    };
  }

  return createPortal(
    <div className="fixed inset-0 z-[99990] select-none">
      {/* Dark overlay backdrop with cutout */}
      <svg className="absolute inset-0 h-full w-full pointer-events-auto">
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.65)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Target pulsing border highlight */}
      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-xl ring-4 ring-[#339464] ring-offset-2 ring-offset-black/40 transition-all duration-300 animate-pulse"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        style={tooltipStyle}
        className="pointer-events-auto rounded-2xl border border-[var(--line)] bg-white p-5 shadow-2xl transition-all duration-200"
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5eb] px-2.5 py-0.5 text-[10px] font-black tracking-wide text-[#1f6a48] uppercase">
            <Sparkles size={11} />
            Panduan ({currentStepIndex + 1}/{steps.length})
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[#f2f4f1] transition"
            title="Tutup Panduan"
          >
            <X size={15} />
          </button>
        </div>

        <h3 className="font-display mt-1 text-base font-extrabold text-[#111827]">
          {currentStep.title}
        </h3>
        <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
          {currentStep.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-bold text-[var(--muted)] hover:text-black transition"
          >
            Lewati
          </button>

          <div className="flex items-center gap-1.5">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs font-bold text-[#374151] hover:bg-[#f7f8f5] transition"
              >
                <ChevronLeft size={13} />
                Kembali
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-dark)] transition shadow-xs"
            >
              {currentStepIndex === steps.length - 1 ? "Selesai 🎉" : "Lanjut"}
              {currentStepIndex < steps.length - 1 && <ChevronRight size={13} />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
