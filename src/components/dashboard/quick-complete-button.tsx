"use client";

import { useState, useTransition } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { completeActivity } from "@/app/(dashboard)/kegiatan/actions";
import { useToast } from "@/components/ui/toast-provider";

export function QuickCompleteButton({
  activityId,
  activityTitle,
}: {
  activityId: string;
  activityTitle: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isDone, setIsDone] = useState(false);
  const { showToast } = useToast();

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending || isDone) return;

    // Optimistic state
    setIsDone(true);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", activityId);
        await completeActivity(formData);
        showToast(`Tugas "${activityTitle}" berhasil diselesaikan! 🎉`, "success");
      } catch (err: any) {
        setIsDone(false);
        showToast(err.message || "Gagal menyelesaikan tugas.", "error");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={isPending || isDone}
      title="Tandai tugas ini selesai langsung dari dashboard"
      aria-label={`Tandai tugas ${activityTitle} selesai`}
      className={`group/btn relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer active:scale-90 ${
        isDone
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-[#d8e3da] bg-white text-transparent hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50"
      }`}
    >
      {isPending ? (
        <Loader2 size={12} className="animate-spin text-emerald-600" />
      ) : isDone ? (
        <Check size={13} strokeWidth={3} className="text-white" />
      ) : (
        <Check
          size={13}
          strokeWidth={2.5}
          className="text-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"
        />
      )}
    </button>
  );
}
