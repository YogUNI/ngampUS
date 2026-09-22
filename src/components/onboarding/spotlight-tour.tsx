"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const targetElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentStep = steps[currentStepIndex];

  // Robust target finder: finds first matching element that is actually visible and on screen
  const findTargetElement = useCallback(() => {
    if (!currentStep) return null;
    const selectors = currentStep.targetSelector.split(",").map((s) => s.trim());
    
    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      const visibleEl = elements.find((el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        );
      }) as HTMLElement | undefined;

      if (visibleEl) return visibleEl;
    }
    return null;
  }, [currentStep]);

  const updateTargetRect = useCallback((shouldScroll = false) => {
    const visibleEl = findTargetElement();
    targetElementRef.current = visibleEl;

    if (visibleEl) {
      if (shouldScroll) {
        visibleEl.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
      const rect = visibleEl.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [findTargetElement]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      targetElementRef.current = null;
      return;
    }

    // Scroll and update immediately
    updateTargetRect(true);

    // Re-check after smooth scrolling finishes
    const timer1 = setTimeout(() => updateTargetRect(false), 200);
    const timer2 = setTimeout(() => updateTargetRect(false), 450);

    const handleUpdate = () => updateTargetRect(false);
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
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
    const margin = 16;
    const tooltipWidth = Math.min(340, window.innerWidth - 32);
    const tooltipEstimatedHeight = 220;

    // Check if target is near bottom of screen
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;

    let top: number;
    if (spaceBelow < tooltipEstimatedHeight + margin && spaceAbove > tooltipEstimatedHeight) {
      // Place ABOVE the target button
      top = targetRect.top - tooltipEstimatedHeight - margin;
    } else {
      // Place BELOW the target button
      top = targetRect.bottom + margin;
    }

    // Horizontal placement centered or clamped to screen
    let left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    if (left < 16) left = 16;

    tooltipStyle = {
      ...tooltipStyle,
      top: `${Math.max(16, Math.min(window.innerHeight - tooltipEstimatedHeight - 16, top))}px`,
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
                rx="14"
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
          fill="rgba(0, 0, 0, 0.68)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Target pulsing border highlight */}
      {targetRect && (
        <div
          className="pointer-events-none fixed rounded-2xl ring-4 ring-[#22c55e] ring-offset-2 ring-offset-black/50 transition-all duration-300 animate-pulse shadow-lg"
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
        className="pointer-events-auto rounded-3xl border border-[#d6e2d8] dark:border-[#1a3827] bg-white dark:bg-[#0d1e15] p-5 sm:p-6 shadow-2xl transition-all duration-200"
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5eb] dark:bg-[#123422] px-2.5 py-0.5 text-[10px] font-black tracking-wide text-[#0f6849] dark:text-[#4ade80] uppercase">
            <Sparkles size={11} />
            Panduan ({currentStepIndex + 1}/{steps.length})
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[#f2f4f1] dark:hover:bg-[#152d20] transition cursor-pointer"
            title="Tutup Panduan"
          >
            <X size={15} />
          </button>
        </div>

        <h3 className="font-display mt-1 text-base font-extrabold text-[#111827] dark:text-[#f0f7f2]">
          {currentStep.title}
        </h3>
        <p className="mt-1.5 text-xs text-[#55675b] dark:text-[#9ab3a2] leading-relaxed font-medium">
          {currentStep.description}
        </p>

        <div className="mt-5 flex items-center justify-between gap-2 pt-3 border-t border-[#edf2ee] dark:border-[#1a3827]">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-bold text-[var(--muted)] hover:text-black dark:hover:text-white transition cursor-pointer"
          >
            Lewati
          </button>

          <div className="flex items-center gap-1.5">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-xl border border-[#d6e2d8] dark:border-[#1a3827] px-2.5 py-1.5 text-xs font-bold text-[#374151] dark:text-[#9ab3a2] hover:bg-[#f7f8f5] dark:hover:bg-[#152d20] transition cursor-pointer"
              >
                <ChevronLeft size={13} />
                Kembali
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 rounded-xl bg-[#0f6849] dark:bg-[#165a39] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#0a432f] dark:hover:bg-[#1d6f46] transition shadow-xs cursor-pointer active:scale-95"
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
