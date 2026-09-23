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
    targetSelector: '[data-tour="action-card-jadwal"], [data-tour="nav-jadwal"], [data-tour="mob-nav-jadwal"]',
    title: "Jadwal Kuliah Mingguan 📅",
    description: "Atur jadwal kuliah, ruangan, dosen, link kelas, dan materi mingguan di sini. Mata kuliah yang kamu atur akan terhubung langsung ke tugasmu!",
  },
  {
    targetSelector: '[data-tour="action-card-catat"], [data-tour="nav-catat"], [data-tour="mob-nav-fab"], [data-tour="mob-nav-kegiatan"]',
    title: "Pusat Catat Tugas & Agenda 📝",
    description: "Klik tombol cepat ini untuk mencatat tugas baru, deadline ujian, hingga agenda kampus penting agar tidak terlewat.",
  },
  {
    targetSelector: '[data-tour="action-card-modul"], [data-tour="nav-modul"], [data-tour="mob-nav-modul"]',
    title: "Modul & Catatan AI 📂",
    description: "Unggah modul PDF materi kuliah, rangkum otomatis dalam hitungan detik, atau buat kuis interaktif dengan AI!",
  },
  {
    targetSelector: '[data-tour="action-card-organisasi"], [data-tour="nav-organisasi"]',
    title: "Organisasi & Proker Kampus 🏢",
    description: "Kelola jabatan kepengurusan, pantau program kerja, dan koordinasi divisi organisasi kampusmu di satu wadah.",
  },
  {
    targetSelector: '[data-tour="action-card-rekap"], [data-tour="nav-rekap"], [data-tour="mob-nav-rekap"]',
    title: "Rekap AI & Portofolio Karier 🏆",
    description: "Pantau analitik produktivitas belajar serta ekspor seluruh keikutsertaan organisasi dan prestasimu jadi CV portofolio instan!",
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
          <div className="fixed inset-0 z-[99995] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--line)] bg-white dark:bg-[#0f2017] dark:border-[#1a3827] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              
              {/* Dismiss button */}
              <button
                onClick={handleDismissSetup}
                title="Isi nanti"
                className="absolute top-5 right-5 rounded-lg p-2 text-[var(--muted)] hover:bg-[#f7f8f5] dark:hover:bg-[#152d20] transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf5eb] dark:bg-[#123422] text-[var(--brand)] shadow-xs">
                  <GraduationCap size={26} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#f4fbe8] dark:bg-[#142d1f] px-2.5 py-0.5 text-[10px] font-black tracking-wide text-[#456a1e] dark:text-[#86efac] uppercase">
                    <Sparkles size={11} /> Langkah Awal
                  </span>
                  <h2 className="font-display mt-0.5 text-xl sm:text-2xl font-black text-[#111827] dark:text-[#f0f7f2]">
                    Selamat Datang, {userName}! 👋
                  </h2>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-[var(--muted)] dark:text-[#9ab3a2] leading-relaxed">
                Agar jadwal kuliah, target IPK, dan tugasmu bisa terorganisir dengan rapi, yuk tentukan <b>semester aktif</b> yang sedang kamu jalani saat ini.
              </p>

              <form onSubmit={handleSemesterSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] dark:text-[#f0f7f2]">
                    Nama Semester <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={namaSemester}
                    onChange={(e) => setNamaSemester(e.target.value)}
                    placeholder="Contoh: Semester 1 (2026/2027)"
                    className="mt-1.5 w-full rounded-xl border-2 border-[#94a3b8] dark:border-[#224e35] bg-[#f8fafc] dark:bg-[#07150e] px-3.5 py-2.5 text-sm font-bold text-[#0f172a] dark:text-[#f0f7f2] placeholder:text-[#64748b] dark:placeholder:text-[#557762] placeholder:font-normal outline-none focus:border-[#0f6849] dark:focus:border-[#22c55e] focus:bg-white dark:focus:bg-[#0b1e15] focus:ring-2 focus:ring-[#0f6849]/15 shadow-2xs transition"
                  />
                  <p className="mt-1 text-[11px] font-medium text-[#475569] dark:text-[#8ca393]">
                    Bisa diubah kapan saja di menu Semester.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#111827] dark:text-[#f0f7f2]">
                      Tanggal Mulai
                    </label>
                    <input
                      required
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border-2 border-[#94a3b8] dark:border-[#224e35] bg-[#f8fafc] dark:bg-[#07150e] px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f0f7f2] outline-none focus:border-[#0f6849] dark:focus:border-[#22c55e] focus:bg-white dark:focus:bg-[#0b1e15] shadow-2xs transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111827] dark:text-[#f0f7f2]">
                      Perkiraan Selesai
                    </label>
                    <input
                      required
                      type="date"
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border-2 border-[#94a3b8] dark:border-[#224e35] bg-[#f8fafc] dark:bg-[#07150e] px-3 py-2 text-xs font-bold text-[#0f172a] dark:text-[#f0f7f2] outline-none focus:border-[#0f6849] dark:focus:border-[#22c55e] focus:bg-white dark:focus:bg-[#0b1e15] shadow-2xs transition"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-[#e2e8f0] dark:border-[#1a3827]">
                  <button
                    type="button"
                    onClick={handleDismissSetup}
                    className="text-xs font-bold text-[#64748b] dark:text-[#8ca393] hover:text-[#0f172a] dark:hover:text-[#f0f7f2] transition cursor-pointer"
                  >
                    Atur Nanti Saja
                  </button>

                  <button
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0f6849] dark:bg-[#165a39] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#0f6849]/20 hover:bg-[#0a432f] dark:hover:bg-[#1d6f46] transition active:scale-95 disabled:opacity-50 cursor-pointer"
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
          <div className="fixed inset-0 z-[99995] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line)] bg-white dark:bg-[#0f2017] dark:border-[#1a3827] p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
              
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf5eb] dark:bg-[#123422] text-[var(--brand)] shadow-xs">
                <Sparkles size={30} />
              </div>

              <h2 className="font-display mt-4 text-xl sm:text-2xl font-black text-[#111827] dark:text-[#f0f7f2]">
                Kenalan Singkat dengan Fitur?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] dark:text-[#9ab3a2] leading-relaxed">
                Hanya butuh <b>1 menit</b>! Kami akan tunjukkan letak fitur penting seperti Jadwal Kuliah, Tugas, dan Rekap Portofolio.
              </p>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleStartTour}
                  className="w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white shadow-md shadow-[#1f6a48]/20 hover:bg-[var(--brand-dark)] transition active:scale-95 cursor-pointer"
                >
                  🚀 Ya, Mulai Panduan Singkat
                </button>
                <button
                  type="button"
                  onClick={handleSkipTour}
                  className="w-full rounded-xl py-2.5 text-xs font-bold text-[var(--muted)] dark:text-[#8ca393] hover:bg-[#f7f8f5] dark:hover:bg-[#152d20] hover:text-black dark:hover:text-[#f0f7f2] transition cursor-pointer"
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
