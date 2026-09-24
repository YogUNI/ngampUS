"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { UniversityCombobox } from "@/components/ui/university-combobox";

// Form schemas
const loginSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter.").max(100),
  university: z.string().trim().max(140).optional(),
  major: z.string().trim().max(140).optional(),
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthCardFlip({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registeredNotice = searchParams.get("registered");
  const resetSuccess = searchParams.get("reset") === "success";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [flipperHeight, setFlipperHeight] = useState<number | undefined>(undefined);
  const [isStandalone, setIsStandalone] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const isFlipped = mode === "register";

  // Sync card height with safe breathing room padding
  useEffect(() => {
    const updateHeight = () => {
      if (frontRef.current && backRef.current) {
        const frontH = frontRef.current.scrollHeight;
        const backH = backRef.current.scrollHeight;
        const h = Math.max(frontH, backH);
        if (h > 420 && h < 1100) {
          // Extra 24px buffer so bottom text never touches the lower border
          setFlipperHeight(h + 24);
        }
      }
    };
    const t = setTimeout(updateHeight, 80);
    return () => clearTimeout(t);
  }, [mode, serverError]);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const toggleMode = (newMode: "login" | "register") => {
    setServerError("");
    setMode(newMode);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", newMode === "register" ? "/register" : "/login");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);
    }

    const handlePopState = () => {
      setMode(window.location.pathname.includes("register") ? "register" : "login");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const onLoginSubmit = async (values: LoginValues) => {
    setServerError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error || !data.session) {
      setServerError(error?.message || "Sesi login tidak berhasil dibuat. Periksa email & kata sandi.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    setServerError("");
    const supabase = createClient();

    // Check registration gatekeeper
    const { data: regFlag } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "registration_active")
      .maybeSingle();

    if (regFlag && regFlag.value === false) {
      setServerError("Pendaftaran akun mahasiswa baru sedang ditutup sementara oleh pengelola platform.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName, university: values.university, major: values.major } },
    });
    if (error) { setServerError(error.message); return; }
    if (!data.session) { setServerError("Akun berhasil dibuat! Silakan konfirmasi email sebelum masuk."); return; }
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-[460px]">
      
      {/* ── Top Header: Brand & Segmented Tab Switcher ── */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        {/* Mobile Brand Link */}
        <div className="flex items-center justify-between lg:hidden">
          <Link
            href={isStandalone ? "/login" : "/"}
            className="inline-flex items-center gap-2.5 font-display text-lg font-black tracking-tight text-white active:scale-95 transition"
          >
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={30}
              height={30}
              priority
              className="h-7 w-7 object-contain drop-shadow-[0_2px_8px_rgba(200,239,112,0.3)]"
            />
            <span>ngamp<span className="text-[#c8ef70]">US</span></span>
          </Link>
          <span className="rounded-full border border-[#c8ef70]/30 bg-[#c8ef70]/10 px-2.5 py-0.5 text-[10px] font-black text-[#c8ef70]">
            APPS
          </span>
        </div>

        {/* Segmented iOS-Style Tab Switcher */}
        <div className="w-full sm:w-auto ml-auto grid grid-cols-2 rounded-2xl bg-[#071911]/90 p-1 border border-[#1b4330] backdrop-blur-xl shadow-inner">
          <button
            type="button"
            onClick={() => toggleMode("login")}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
              !isFlipped
                ? "bg-[#c8ef70] text-[#091a12] shadow-md shadow-[#c8ef70]/20"
                : "text-[#8cb89f] hover:text-white"
            }`}
          >
            <KeyRound size={13} />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => toggleMode("register")}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
              isFlipped
                ? "bg-[#c8ef70] text-[#091a12] shadow-md shadow-[#c8ef70]/20"
                : "text-[#8cb89f] hover:text-white"
            }`}
          >
            <Sparkles size={13} />
            <span>Daftar</span>
          </button>
        </div>
      </div>

      {/* ── 3D CARD FLIP CONTAINER ── */}
      <div className="perspective-container w-full">
        <div
          className={`card-flipper ${isFlipped ? "flipped" : ""}`}
          style={{ minHeight: flipperHeight || 560, height: flipperHeight }}
        >

          {/* ══════════════════════════════════════════════════
              ══ FRONT: LOGIN (DARK THEME) ══
             ══════════════════════════════════════════════════ */}
          <div
            ref={frontRef}
            className={`card-face card-face-front flex flex-col justify-between rounded-[2rem] border border-[#1b4532] bg-[#0c2419]/95 px-6 pt-7 pb-8 sm:px-8 sm:pt-8 sm:pb-9 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div>
              {/* Natural Header & Subtitle */}
              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#c8ef70]">
                  Selamat Datang Kembali
                </span>
                <h2 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Lanjutkan <span className="text-[#c8ef70]">ritmemu.</span>
                </h2>
                <p className="mt-1.5 text-xs text-[#8caea0] leading-relaxed">
                  Masuk untuk melihat jadwal kuliah, deadline tugas, dan aktivitas organisasimu.
                </p>
              </div>

              {/* Status Notices */}
              {registeredNotice && !serverError && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#1e5c3c] bg-[#113a27] p-3 text-xs font-bold text-[#c8ef70]">
                  <CheckCircle2 size={16} className="shrink-0 text-[#c8ef70]" />
                  <span>Akun berhasil dibuat! Silakan masuk dengan akun barumu.</span>
                </div>
              )}
              {resetSuccess && !serverError && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#1e5c3c] bg-[#113a27] p-3 text-xs font-bold text-[#c8ef70]">
                  <CheckCircle2 size={16} className="shrink-0 text-[#c8ef70]" />
                  <span>Password berhasil diperbarui! Silakan masuk kembali.</span>
                </div>
              )}
              {serverError && (
                <div className="mt-4 rounded-2xl border border-[#7f231c] bg-[#3a1311] p-3 text-xs font-semibold text-[#fca5a5]">
                  {serverError}
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-5 space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-extrabold text-[#d2e7dc] mb-1.5">
                    Email Mahasiswa / Personal
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <Mail size={16} />
                    </span>
                    <input
                      {...loginForm.register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      className="w-full rounded-2xl border border-[#1b4330] bg-[#071911] py-3 pl-11 pr-4 text-sm font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-4 focus:ring-[#c8ef70]/15 transition"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <span className="mt-1 block text-[11px] font-bold text-[#fca5a5]">
                      {loginForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-[#d2e7dc]">Kata Sandi</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-black text-[#c8ef70] hover:underline"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <Lock size={16} />
                    </span>
                    <input
                      {...loginForm.register("password")}
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Minimal 8 karakter"
                      className="w-full rounded-2xl border border-[#1b4330] bg-[#071911] py-3 pl-11 pr-11 text-sm font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-4 focus:ring-[#c8ef70]/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#648c79] hover:text-white p-1 transition cursor-pointer"
                      aria-label={showLoginPassword ? "Sembunyikan password" : "Lihat password"}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <span className="mt-1 block text-[11px] font-bold text-[#fca5a5]">
                      {loginForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c8ef70] py-3.5 text-sm font-black text-[#091a12] shadow-lg shadow-[#c8ef70]/20 transition hover:bg-[#d5fa80] hover:shadow-xl active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin text-[#091a12]" />
                      <span>Menghubungkan ke Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Workspace</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Switcher & Feature Badges */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-center text-xs text-[#8caea0]">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("register")}
                  className="font-black text-[#c8ef70] hover:underline cursor-pointer"
                >
                  Daftar Sekarang — Gratis →
                </button>
              </p>

              <div className="mt-3.5 grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 py-2 px-1 text-center">
                  <Calendar size={13} className="text-[#c8ef70] shrink-0" />
                  <span className="text-[10.5px] font-bold text-[#c6ded3] truncate">Jadwal Kuliah</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 py-2 px-1 text-center">
                  <GraduationCap size={13} className="text-[#c8ef70] shrink-0" />
                  <span className="text-[10.5px] font-bold text-[#c6ded3] truncate">Tugas & Deadline</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 py-2 px-1 text-center">
                  <Users size={13} className="text-[#c8ef70] shrink-0" />
                  <span className="text-[10.5px] font-bold text-[#c6ded3] truncate">Organisasi</span>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════
              ══ BACK: REGISTER (DARK THEME) ══
             ══════════════════════════════════════════════════ */}
          <div
            ref={backRef}
            className={`card-face card-face-back flex flex-col justify-between rounded-[2rem] border border-[#1b4532] bg-[#0c2419]/95 px-6 pt-7 pb-8 sm:px-8 sm:pt-8 sm:pb-9 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div>
              {/* Header */}
              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#c8ef70]">
                  Akun Mahasiswa Baru
                </span>
                <h2 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Mulai lebih <span className="text-[#c8ef70]">terarah.</span>
                </h2>
                <p className="mt-1.5 text-xs text-[#8caea0] leading-relaxed">
                  Workspace cerdas untuk jadwal kelas, tugas kuliah, dan portofolio CV-mu.
                </p>
              </div>

              {serverError && (
                <div className="mt-4 rounded-2xl border border-[#7f231c] bg-[#3a1311] p-3 text-xs font-semibold text-[#fca5a5]">
                  {serverError}
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="mt-4 space-y-3" noValidate>
                <div>
                  <label className="block text-xs font-extrabold text-[#d2e7dc] mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <User size={15} />
                    </span>
                    <input
                      {...registerForm.register("fullName")}
                      type="text"
                      autoComplete="name"
                      placeholder="Contoh: Raditya Pratama"
                      className="w-full rounded-2xl border border-[#1b4330] bg-[#071911] py-2.5 pl-10 pr-3.5 text-sm font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-4 focus:ring-[#c8ef70]/15 transition"
                    />
                  </div>
                  {registerForm.formState.errors.fullName && (
                    <span className="mt-1 block text-[11px] font-bold text-[#fca5a5]">
                      {registerForm.formState.errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Campus Information (Optional) */}
                <div className="rounded-2xl border border-[#1b4330] bg-[#071911]/90 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-[#c8ef70]">
                    <Building2 size={13} />
                    <span>Info Kampus & Jurusan (Opsional)</span>
                  </div>
                  <div className="space-y-2">
                    <UniversityCombobox
                      value={registerForm.watch("university") || ""}
                      onChange={(val) => registerForm.setValue("university", val, { shouldValidate: true })}
                      placeholder="Pilih universitas / ketik nama kampus..."
                    />
                    <input
                      {...registerForm.register("major")}
                      type="text"
                      placeholder="Program Studi / Jurusan (Contoh: Sistem Informasi)"
                      className="w-full rounded-xl border border-[#1b4330] bg-[#0b2419] py-2 px-3 text-xs font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:outline-none focus:ring-2 focus:ring-[#c8ef70]/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#d2e7dc] mb-1">Email Aktif</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <Mail size={15} />
                    </span>
                    <input
                      {...registerForm.register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      className="w-full rounded-2xl border border-[#1b4330] bg-[#071911] py-2.5 pl-10 pr-3.5 text-sm font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-4 focus:ring-[#c8ef70]/15 transition"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <span className="mt-1 block text-[11px] font-bold text-[#fca5a5]">
                      {registerForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#d2e7dc] mb-1">Kata Sandi</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <Lock size={15} />
                    </span>
                    <input
                      {...registerForm.register("password")}
                      type={showRegisterPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter"
                      className="w-full rounded-2xl border border-[#1b4330] bg-[#071911] py-2.5 pl-10 pr-10 text-sm font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-4 focus:ring-[#c8ef70]/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#648c79] hover:text-white p-1 transition cursor-pointer"
                      aria-label={showRegisterPassword ? "Sembunyikan password" : "Lihat password"}
                    >
                      {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <span className="mt-1 block text-[11px] font-bold text-[#fca5a5]">
                      {registerForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c8ef70] py-3.5 text-sm font-black text-[#091a12] shadow-lg shadow-[#c8ef70]/20 transition hover:bg-[#d5fa80] hover:shadow-xl active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {registerForm.formState.isSubmitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin text-[#091a12]" />
                      <span>Mendaftarkan akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Akun & Mulai Gratis</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Switcher with Proper Breathing Room */}
            <div className="mt-6 border-t border-white/10 pt-4 pb-2 text-center">
              <p className="text-xs text-[#8caea0]">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("login")}
                  className="font-black text-[#c8ef70] hover:underline cursor-pointer"
                >
                  Masuk di sini →
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Micro Trust Footer ── */}
      <div className="mt-5 mb-2 flex items-center justify-center gap-3 text-center text-[11px] font-semibold text-[#6e9381]">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#c8ef70]" /> Database Terenkripsi RLS
        </span>
        <span>•</span>
        <span>100% Gratis Selamanya</span>
      </div>

    </div>
  );
}
