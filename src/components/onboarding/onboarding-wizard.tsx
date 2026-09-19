"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, addMonths } from "date-fns";
import { BookOpen, Calendar, ChevronRight, GraduationCap, Sparkles, X } from "lucide-react";
import { createSemester } from "@/app/(dashboard)/semester/actions";
import { useToast } from "@/components/ui/toast-provider";
import { SpotlightTour, TourStep } from "./spotlight-tour";

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '[data-tour="mob-nav-jadwal"], [data-tour="nav-jadwal"]',
    title: "Jadwal Kuliah Mingguan 📅",
    description: "Atur jadwal kuliah, ruangan, dosen, link Zoom, dan materi kelas di sini. Mata kuliah yang kamu isi di sini otomatis bisa dikaitkan ke tugas kuliah!",
  },
  {
    targetSelector: '[data-tour="hero-add-kegiatan"], [data-tour="mob-nav-kegiatan"], [data-tour="nav-kegiatan"]',
    title: "Catat Tugas & Deadline 📝",
    description: "Klik tombol ini kapan saja untuk mencatat tugas, reminder ujian, atau agenda kegiatan kampus lainnya agar tidak terlewat.",
  },
  {
    targetSelector: '[data-tour="mob-nav-modul"], [data-tour="nav-modul"]',
    title: "Modul & Catatan Matkul 📂",
    description: "Unggah materi kuliah, rangkum otomatis, atau gunakan Tanya AI & kuis interaktif untuk belajar lebih cepat.",
  },
  {
    targetSelector: '[data-tour="mob-nav-rekap"], [data-tour="nav-rekap"]',
    title: "Rekap & Portofolio CV 🏆",
    description: "Kegiatan organisasi, lomba, dan kepanitiaanmu otomatis dirangkum jadi portofolio siap ekspor ke CV!",
  },
  {
    targetSelector: '[data-tour="nav-organisasi"], [data-tour="nav-semester"]',
    title: "Organisasi & Semester 🏢",
    description: "Kelola jabatan kepengurusan proker, serta pantau kalender akademik dan target IPK dengan mudah lewat menu utama.",
  },
];

export function OnboardingWizard({
  hasSemesters,
  userId,
  userName,
}: {
  hasSemesters: boolean;
  userId: string;
  userName: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"idle" | "semester_setup" | "tour_prompt" | "tour_active">("idle");
  const [submitting, setSubmitting] = useState(false);

  // Form states with smart defaults
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const sixMonthsLaterStr = format(addMonths(new Date(), 6), "yyyy-MM-dd");
  const currentYear = new Date().getFullYear();
  const defaultSemesterName = `Semester 1 (${currentYear}/${currentYear + 1})`;

  const [namaSemester, setNamaSemester] = useState(defaultSemesterName);
  const [tanggalMulai, setTanggalMulai] = useState(todayStr);
  const [tanggalSelesai, setTanggalSelesai] = useState(sixMonthsLaterStr);

  const { showToast } = useToast();

  const tourStorageKey = `ngampus_tour_completed_${userId}`;
  const setupDismissedKey = `ngampus_setup_dismissed_${userId}`;

  useEffect(() => {
    setMounted(true);

    const isTourDone = localStorage.getItem(tourStorageKey);
    const isDismissed = sessionStorage.getItem(setupDismissedKey);

    if (!hasSemesters && !isDismissed) {
      setStep("semester_setup");
    } else if (!isTourDone) {
      // User already has semester but never toured
      setStep("tour_prompt");
    }

    // Listen to manual restart tour trigger from sidebar
    const handleStartTour = () => {
      setStep("tour_active");
    };

    window.addEventListener("start-ngampus-tour", handleStartTour);
    return () => {
      window.removeEventListener("start-ngampus-tour", handleStartTour);
    };
  }, [hasSemesters, tourStorageKey, setupDismissedKey]);

  async function handleSemesterSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("nama_semester", namaSemester.trim());
      formData.set("tanggal_mulai", tanggalMulai);
      formData.set("tanggal_selesai", tanggalSelesai);
      formData.set("is_active", "on");

      await createSemester(formData);
      showToast("Semester berhasil dibuat!", "success");
      // Transition to tour prompt
      setStep("tour_prompt");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat semester.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDismissSetup() {
    sessionStorage.setItem(setupDismissedKey, "true");
    setStep("idle");
  }

  function handleStartTour() {
    setStep("tour_active");
  }

  function handleSkipTour() {
    localStorage.setItem(tourStorageKey, "true");
    setStep("idle");
  }

  function handleCompleteTour() {
    localStorage.setItem(tourStorageKey, "true");
    setStep("idle");
    showToast("Selamat menggunakan nGampUS! 🎉", "success");
  }

  if (!mounted) return null;

  return (
    <>
      {/* ── STEP 1: Modal Setup Semester Awal ── */}
      {step === "semester_setup" &&
        createPortal(
          <div className="fixed inset-0 z-[99995] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              
              {/* Dismiss button */}
              <button
                onClick={handleDismissSetup}
                title="Isi nanti"
                className="absolute top-5 right-5 rounded-lg p-2 text-[var(--muted)] hover:bg-[#f7f8f5] transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf5eb] text-[var(--brand)] shadow-xs">
                  <GraduationCap size={26} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f4fbe8] px-2.5 py-0.5 text-[10px] font-black tracking-wide text-[#456a1e] uppercase">
                    <Sparkles size={11} /> Langkah Awal
                  </span>
                  <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-black text-[#111827]">
                    Selamat Datang, {userName}! 👋
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Agar jadwal kuliah, target IPK, dan tugasmu bisa terorganisir dengan rapi, yuk tentukan <b>semester aktif</b> yang sedang kamu jalani saat ini.
              </p>

              <form onSubmit={handleSemesterSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#374151]">
                    Nama Semester <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={namaSemester}
                    onChange={(e) => setNamaSemester(e.target.value)}
                    placeholder="Contoh: Semester 1 (2026/2027)"
                    className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10"
                  />
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    Bisa diubah kapan saja di menu Semester.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#374151]">
                      Tanggal Mulai
                    </label>
                    <input
                      required
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#374151]">
                      Perkiraan Selesai
                    </label>
                    <input
                      required
                      type="date"
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium outline-none focus:border-[var(--brand)]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={handleDismissSetup}
                    className="text-xs font-bold text-[var(--muted)] hover:text-black transition"
                  >
                    Atur Nanti Saja
                  </button>

                  <button
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#1f6a48]/20 hover:bg-[var(--brand-dark)] transition active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Simpan & Lanjut"}
                    <ChevronRight size={15} />
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── STEP 2: Tawaran Tour Interaktif ── */}
      {step === "tour_prompt" &&
        createPortal(
          <div className="fixed inset-0 z-[99995] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
              
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf5eb] text-[var(--brand)] shadow-xs">
                <Sparkles size={30} />
              </div>

              <h2 className="font-display mt-4 text-xl sm:text-2xl font-black text-[#111827]">
                Kenalan Singkat dengan Fitur?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Hanya butuh <b>1 menit</b>! Kami akan tunjukkan letak fitur penting seperti Jadwal Kuliah, Tugas, dan Rekap Portofolio.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleStartTour}
                  className="w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white shadow-md shadow-[#1f6a48]/20 hover:bg-[var(--brand-dark)] transition active:scale-95"
                >
                  🚀 Ya, Mulai Panduan Singkat
                </button>
                <button
                  type="button"
                  onClick={handleSkipTour}
                  className="w-full rounded-xl py-2.5 text-xs font-bold text-[var(--muted)] hover:bg-[#f7f8f5] hover:text-black transition"
                >
                  Lewati, Saya Mau Langsung Eksplor
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── STEP 3: Spotlight Guided Tour ── */}
      <SpotlightTour
        steps={TOUR_STEPS}
        isOpen={step === "tour_active"}
        onClose={handleSkipTour}
        onComplete={handleCompleteTour}
      />
    </>
  );
}
