"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  RotateCw,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

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

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const isFlipped = mode === "register";

  // Form states
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  // Switch mode with smooth pushState URL update without page reload
  const toggleMode = (newMode: "login" | "register") => {
    setServerError("");
    setMode(newMode);
    if (typeof window !== "undefined") {
      const url = newMode === "register" ? "/register" : "/login";
      window.history.pushState(null, "", url);
    }
  };

  // Sync mode if user presses browser Back/Forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.includes("register")) {
        setMode("register");
      } else {
        setMode("login");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Submit Login
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

  // Submit Register
  const onRegisterSubmit = async (values: RegisterValues) => {
    setServerError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          university: values.university,
          major: values.major,
        },
      },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    if (!data.session) {
      setServerError("Akun berhasil dibuat! Silakan konfirmasi email sebelum masuk.");
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ── Top Brand Bar & Mode Switcher ── */}
      <div className="mb-4 flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-black tracking-tight text-[#10261b] hover:opacity-80 transition"
        >
          <Image
            src="/logo_ngampUS.png"
            alt="ngampUS Logo"
            width={28}
            height={28}
            className="h-7 w-7 object-contain drop-shadow-xs"
          />
          <span>
            ngamp<span className="text-[#0f6849]">US</span>
          </span>
        </Link>

        {/* Quick Flip Button */}
        <button
          type="button"
          onClick={() => toggleMode(mode === "login" ? "register" : "login")}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#d8e3da] bg-white px-3 py-1 text-xs font-black text-[#103626] shadow-2xs hover:bg-[#eff5ef] hover:border-[#b9ddc6] transition active:scale-95 cursor-pointer"
        >
          <RotateCw size={12} className="text-[#0f6849] transition-transform duration-500 hover:rotate-180" />
          <span>{mode === "login" ? "Buka Form Daftar" : "Buka Form Masuk"}</span>
        </button>
      </div>

      {/* ── 3D FLIP CONTAINER ── */}
      <div
        className="w-full"
        style={{ perspective: "1400px" }}
      >
        <div
          className="relative w-full transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ══════════════════════════════════════════════════════════
              CARD FRONT: LOGIN SIDE
             ══════════════════════════════════════════════════════════ */}
          <div
            className={`w-full rounded-[2rem] border border-[#d5dfd6] bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(16,38,27,0.08)] ${
              isFlipped ? "pointer-events-none" : "relative z-10"
            }`}
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#103626] text-[#c8ef70] text-[11px] font-black shadow-2xs">
                  01
                </span>
                <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#0f6849]">
                  ACCESS POINT / LOGIN
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#dff3e5] px-2.5 py-0.5 text-[10px] font-black text-[#0f6849] border border-[#b9ddc6]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse"></span>
                AMAN
              </span>
            </div>

            {/* Title */}
            <div className="mt-4">
              <h1 className="font-display text-3xl font-black tracking-tight text-[#10261b] leading-tight">
                Lanjutkan<br />
                <span className="text-[#0f6849]">ritmemu.</span>
              </h1>
              <p className="mt-1.5 text-xs text-[#5a6d61] leading-relaxed">
                Masuk untuk pantau jadwal kuliah, deadline tugas terdekat, dan proker aktifmu.
              </p>
            </div>

            {/* Notice / Errors */}
            {registeredNotice && !serverError && (
              <p className="mt-3.5 rounded-xl border border-[#b9ddc6] bg-[#eaf6ee] px-3 py-2 text-xs font-semibold text-[#17613e]">
                Akun berhasil dibuat! Silakan masuk dengan email kamu.
              </p>
            )}
            {serverError && (
              <p className="mt-3.5 rounded-xl border border-[#f5b8a9] bg-[#fff0ec] px-3 py-2 text-xs font-semibold text-[#b93c21]">
                {serverError}
              </p>
            )}

            {/* Login Form */}
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="mt-5 space-y-4"
              noValidate
            >
              {/* Email */}
              <div>
                <label className="block text-xs font-extrabold text-[#10261b] mb-1.5">
                  Email Kampus / Personal
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                    <Mail size={16} />
                  </span>
                  <input
                    {...loginForm.register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#dff3e5] transition"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <span className="mt-1 block text-[11px] font-bold text-[#b93c21]">
                    {loginForm.formState.errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-extrabold text-[#10261b]">
                    Kata Sandi
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-black text-[#0f6849] hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                    <Lock size={16} />
                  </span>
                  <input
                    {...loginForm.register("password")}
                    type={showLoginPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2.5 pl-10 pr-10 text-xs sm:text-sm font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#dff3e5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91] hover:text-[#10261b] transition"
                    aria-label={showLoginPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <span className="mt-1 block text-[11px] font-bold text-[#b93c21]">
                    {loginForm.formState.errors.password.message}
                  </span>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#103626] py-3.5 text-xs sm:text-sm font-black text-[#c8ef70] shadow-[0_6px_0_#0a2318] hover:bg-[#164330] hover:shadow-[0_4px_0_#0a2318] active:translate-y-0.5 active:shadow-[0_2px_0_#0a2318] disabled:opacity-70 transition-all cursor-pointer"
              >
                {loginForm.formState.isSubmitting ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>Masuk ke Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Flip Trigger to Register */}
            <div className="mt-5 border-t border-[#f0f4f1] pt-3.5 text-center">
              <p className="text-xs text-[#65746a]">
                Belum punya akun nGampUS?
              </p>
              <button
                type="button"
                onClick={() => toggleMode("register")}
                className="mt-1 inline-flex items-center gap-1.5 font-display text-xs sm:text-sm font-black text-[#0f6849] hover:text-[#103626] transition hover:underline active:scale-95 cursor-pointer"
              >
                <span>Daftar Sekarang (Gratis)</span>
                <RotateCw size={13} className="text-[#0f6849]" />
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              CARD BACK: REGISTER SIDE (Absolute Overlay, 180deg)
             ══════════════════════════════════════════════════════════ */}
          <div
            className={`w-full rounded-[2rem] border border-[#d5dfd6] bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(16,38,27,0.08)] ${
              !isFlipped ? "pointer-events-none" : "relative z-10"
            }`}
            style={{
              position: !isFlipped ? "absolute" : "relative",
              top: 0,
              left: 0,
              right: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-3.5">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#0f6849] text-white text-[11px] font-black shadow-2xs">
                  02
                </span>
                <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#0f6849]">
                  CREATE ATLAS / REGISTER
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0c9] px-2.5 py-0.5 text-[10px] font-black text-[#8a5d00] border border-[#fae5a8]">
                ✦ 100% GRATIS
              </span>
            </div>

            {/* Title */}
            <div className="mt-4">
              <h2 className="font-display text-3xl font-black tracking-tight text-[#10261b] leading-tight">
                Mulai lebih<br />
                <span className="text-[#0f6849]">terarah.</span>
              </h2>
              <p className="mt-1.5 text-xs text-[#5a6d61] leading-relaxed">
                Buat satu workspace terpadu untuk kelas, organisasi, dan portofolio CV-mu.
              </p>
            </div>

            {/* Server Error */}
            {serverError && (
              <p className="mt-3.5 rounded-xl border border-[#f5b8a9] bg-[#fff0ec] px-3 py-2 text-xs font-semibold text-[#b93c21]">
                {serverError}
              </p>
            )}

            {/* Register Form */}
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="mt-4 space-y-3"
              noValidate
            >
              {/* Full Name */}
              <div>
                <label className="block text-xs font-extrabold text-[#10261b] mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                    <User size={15} />
                  </span>
                  <input
                    {...registerForm.register("fullName")}
                    type="text"
                    autoComplete="name"
                    placeholder="Contoh: Raditya Pratama"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#dff3e5] transition"
                  />
                </div>
                {registerForm.formState.errors.fullName && (
                  <span className="mt-0.5 block text-[11px] font-bold text-[#b93c21]">
                    {registerForm.formState.errors.fullName.message}
                  </span>
                )}
              </div>

              {/* Campus Info Box (Optional) */}
              <div className="rounded-xl border border-[#b9ddc6] bg-[#dff3e5]/40 p-2.5 space-y-2">
                <div className="flex items-center gap-1.5 text-[10.5px] font-black text-[#0f6849]">
                  <Building2 size={13} />
                  <span>Info Kampus (Opsional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    {...registerForm.register("university")}
                    type="text"
                    placeholder="Universitas / Institut"
                    className="w-full rounded-lg border border-[#c7decb] bg-white py-1 px-2.5 text-xs font-medium text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:outline-none"
                  />
                  <input
                    {...registerForm.register("major")}
                    type="text"
                    placeholder="Jurusan / Prodi"
                    className="w-full rounded-lg border border-[#c7decb] bg-white py-1 px-2.5 text-xs font-medium text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-extrabold text-[#10261b] mb-1">
                  Email Mahasiswa / Pribadi
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                    <Mail size={15} />
                  </span>
                  <input
                    {...registerForm.register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="kamu@email.com"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#dff3e5] transition"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <span className="mt-0.5 block text-[11px] font-bold text-[#b93c21]">
                    {registerForm.formState.errors.email.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-extrabold text-[#10261b] mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                    <Lock size={15} />
                  </span>
                  <input
                    {...registerForm.register("password")}
                    type={showRegisterPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-9 text-xs sm:text-sm font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#dff3e5] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9d91] hover:text-[#10261b] transition"
                    aria-label={showRegisterPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <span className="mt-0.5 block text-[11px] font-bold text-[#b93c21]">
                    {registerForm.formState.errors.password.message}
                  </span>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f6849] py-3.5 text-xs sm:text-sm font-black text-white shadow-[0_6px_0_#0a3726] hover:bg-[#103626] hover:shadow-[0_4px_0_#0a3726] active:translate-y-0.5 active:shadow-[0_2px_0_#0a3726] disabled:opacity-70 transition-all cursor-pointer"
              >
                {registerForm.formState.isSubmitting ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>Buat Workspace Sekarang</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Flip Trigger back to Login */}
            <div className="mt-4 border-t border-[#f0f4f1] pt-3 text-center">
              <p className="text-xs text-[#65746a]">
                Sudah memiliki akun?
              </p>
              <button
                type="button"
                onClick={() => toggleMode("login")}
                className="mt-1 inline-flex items-center gap-1.5 font-display text-xs sm:text-sm font-black text-[#0f6849] hover:text-[#103626] transition hover:underline active:scale-95 cursor-pointer"
              >
                <span>Masuk ke Workspace</span>
                <RotateCw size={13} className="text-[#0f6849]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Micro Trust Proof Badge at the Bottom ── */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] font-bold text-[#718578]">
        <span className="flex items-center gap-1">
          <Shield size={13} className="text-[#0f6849]" /> Terenkripsi Supabase RLS
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Sparkles size={13} className="text-[#0f6849]" /> Akses 100% Gratis
        </span>
      </div>
    </div>
  );
}
