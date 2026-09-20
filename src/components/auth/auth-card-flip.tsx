"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  const [flipperHeight, setFlipperHeight] = useState<number | undefined>(undefined);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const isFlipped = mode === "register";

  // Measure both card heights and lock flipper to the taller one
  useLayoutEffect(() => {
    const measure = () => {
      const frontH = frontRef.current?.scrollHeight ?? 0;
      const backH = backRef.current?.scrollHeight ?? 0;
      const maxH = Math.max(frontH, backH);
      if (maxH > 0) setFlipperHeight(maxH);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (frontRef.current) ro.observe(frontRef.current);
    if (backRef.current) ro.observe(backRef.current);
    return () => ro.disconnect();
  }, []);

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
    <div className="w-full max-w-[420px] mx-auto">
      {/* ── Top Brand Bar & Mode Switcher ── */}
      <div className="mb-3 flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-display text-base font-black tracking-tight text-[#10261b] hover:opacity-80 transition"
        >
          <Image src="/logo_ngampUS.png" alt="ngampUS Logo" width={22} height={22} className="h-[22px] w-[22px] object-contain" />
          <span>ngamp<span className="text-[#0f6849]">US</span></span>
        </Link>
        <button
          type="button"
          onClick={() => toggleMode(mode === "login" ? "register" : "login")}
          className="inline-flex items-center gap-1 rounded-full border border-[#d8e3da] bg-white px-2.5 py-1 text-[11px] font-black text-[#103626] shadow-2xs hover:bg-[#eff5ef] transition active:scale-95 cursor-pointer"
        >
          <RotateCw size={10} className="text-[#0f6849]" />
          <span>{mode === "login" ? "Buka Form Daftar" : "Buka Form Masuk"}</span>
        </button>
      </div>

      {/* ── 3D CARD FLIP CONTAINER ── */}
      <div className="perspective-container w-full">
        <div
          className={`card-flipper ${isFlipped ? "flipped" : ""}`}
          style={flipperHeight ? { height: flipperHeight } : undefined}
        >
          {/* ══ FRONT: LOGIN ══ */}
          <div
            ref={frontRef}
            className={`card-face rounded-[1.75rem] border border-[#d5dfd6] bg-white p-5 shadow-[0_16px_40px_rgba(16,38,27,0.08)] ${
              isFlipped ? "pointer-events-none" : "relative"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-[#103626] text-[#c8ef70] text-[10px] font-black">01</span>
                <span className="text-[9.5px] font-black uppercase tracking-[.17em] text-[#0f6849]">ACCESS POINT / LOGIN</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#dff3e5] px-2 py-0.5 text-[9.5px] font-black text-[#0f6849] border border-[#b9ddc6]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f6849] animate-pulse" />
                AMAN
              </span>
            </div>

            {/* Title */}
            <div className="mt-3">
              <h1 className="font-display text-[1.6rem] font-black tracking-tight text-[#10261b] leading-tight">
                Lanjutkan <span className="text-[#0f6849]">ritmemu.</span>
              </h1>
              <p className="mt-1 text-[11px] text-[#5a6d61] leading-relaxed">
                Pantau jadwal kuliah, deadline tugas, dan proker aktifmu.
              </p>
            </div>

            {/* Notices */}
            {registeredNotice && !serverError && (
              <p className="mt-2.5 rounded-xl border border-[#b9ddc6] bg-[#eaf6ee] px-3 py-1.5 text-[11px] font-semibold text-[#17613e]">
                Akun berhasil dibuat! Silakan masuk.
              </p>
            )}
            {serverError && (
              <p className="mt-2.5 rounded-xl border border-[#f5b8a9] bg-[#fff0ec] px-3 py-1.5 text-[11px] font-semibold text-[#b93c21]">
                {serverError}
              </p>
            )}

            {/* Form */}
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-4 space-y-3" noValidate>
              <div>
                <label className="block text-[11px] font-extrabold text-[#10261b] mb-1">Email Kampus / Personal</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9d91]"><Mail size={14} /></span>
                  <input
                    {...loginForm.register("email")}
                    type="email" autoComplete="email" placeholder="nama@email.com"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-3 text-xs font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dff3e5] transition"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <span className="mt-0.5 block text-[10px] font-bold text-[#b93c21]">{loginForm.formState.errors.email.message}</span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-extrabold text-[#10261b]">Kata Sandi</label>
                  <Link href="/forgot-password" className="text-[10px] font-black text-[#0f6849] hover:underline">Lupa password?</Link>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9d91]"><Lock size={14} /></span>
                  <input
                    {...loginForm.register("password")}
                    type={showLoginPassword ? "text" : "password"} autoComplete="current-password" placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-9 text-xs font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dff3e5] transition"
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9d91] hover:text-[#10261b] transition"
                    aria-label={showLoginPassword ? "Sembunyikan" : "Lihat"}>
                    {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <span className="mt-0.5 block text-[10px] font-bold text-[#b93c21]">{loginForm.formState.errors.password.message}</span>
                )}
              </div>

              <button
                type="submit" disabled={loginForm.formState.isSubmitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#103626] py-3 text-xs font-black text-[#c8ef70] shadow-[0_5px_0_#0a2318] hover:bg-[#164330] hover:shadow-[0_3px_0_#0a2318] active:translate-y-0.5 active:shadow-[0_2px_0_#0a2318] disabled:opacity-70 transition-all cursor-pointer"
              >
                {loginForm.formState.isSubmitting
                  ? <LoaderCircle className="animate-spin" size={16} />
                  : <><span>Masuk ke Workspace</span><ArrowRight size={15} /></>}
              </button>
            </form>

            {/* Flip trigger */}
            <div className="mt-3.5 border-t border-[#f0f4f1] pt-3 flex items-center justify-between">
              <p className="text-[11px] text-[#65746a]">Belum punya akun?</p>
              <button type="button" onClick={() => toggleMode("register")}
                className="inline-flex items-center gap-1 text-[11px] font-black text-[#0f6849] hover:text-[#103626] transition hover:underline active:scale-95 cursor-pointer">
                <span>Daftar Gratis</span>
                <RotateCw size={10} />
              </button>
            </div>
          </div>

          {/* ══ BACK: REGISTER ══ */}
          <div
            ref={backRef}
            className={`card-face card-face-back rounded-[1.75rem] border border-[#d5dfd6] bg-white p-5 shadow-[0_16px_40px_rgba(16,38,27,0.08)] ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#f0f4f1] pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-[#0f6849] text-white text-[10px] font-black">02</span>
                <span className="text-[9.5px] font-black uppercase tracking-[.17em] text-[#0f6849]">CREATE ATLAS / REGISTER</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0c9] px-2 py-0.5 text-[9.5px] font-black text-[#8a5d00] border border-[#fae5a8]">
                ✦ 100% GRATIS
              </span>
            </div>

            {/* Title */}
            <div className="mt-3">
              <h2 className="font-display text-[1.6rem] font-black tracking-tight text-[#10261b] leading-tight">
                Mulai lebih <span className="text-[#0f6849]">terarah.</span>
              </h2>
              <p className="mt-1 text-[11px] text-[#5a6d61] leading-relaxed">
                Workspace terpadu untuk kelas, organisasi, dan portofolio CV-mu.
              </p>
            </div>

            {serverError && (
              <p className="mt-2.5 rounded-xl border border-[#f5b8a9] bg-[#fff0ec] px-3 py-1.5 text-[11px] font-semibold text-[#b93c21]">{serverError}</p>
            )}

            {/* Form */}
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="mt-3.5 space-y-2.5" noValidate>
              <div>
                <label className="block text-[11px] font-extrabold text-[#10261b] mb-1">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9d91]"><User size={14} /></span>
                  <input
                    {...registerForm.register("fullName")}
                    type="text" autoComplete="name" placeholder="Contoh: Raditya Pratama"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-3 text-xs font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dff3e5] transition"
                  />
                </div>
                {registerForm.formState.errors.fullName && (
                  <span className="mt-0.5 block text-[10px] font-bold text-[#b93c21]">{registerForm.formState.errors.fullName.message}</span>
                )}
              </div>

              {/* Campus info — compact */}
              <div className="rounded-xl border border-[#b9ddc6] bg-[#dff3e5]/40 p-2 space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-black text-[#0f6849]">
                  <Building2 size={11} /><span>Info Kampus (Opsional)</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input {...registerForm.register("university")} type="text" placeholder="Universitas / Institut"
                    className="w-full rounded-lg border border-[#c7decb] bg-white py-1 px-2 text-[11px] font-medium text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:outline-none" />
                  <input {...registerForm.register("major")} type="text" placeholder="Jurusan / Prodi"
                    className="w-full rounded-lg border border-[#c7decb] bg-white py-1 px-2 text-[11px] font-medium text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#10261b] mb-1">Email Mahasiswa / Pribadi</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9d91]"><Mail size={14} /></span>
                  <input
                    {...registerForm.register("email")}
                    type="email" autoComplete="email" placeholder="kamu@email.com"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-3 text-xs font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dff3e5] transition"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <span className="mt-0.5 block text-[10px] font-bold text-[#b93c21]">{registerForm.formState.errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-[#10261b] mb-1">Kata Sandi</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9d91]"><Lock size={14} /></span>
                  <input
                    {...registerForm.register("password")}
                    type={showRegisterPassword ? "text" : "password"} autoComplete="new-password" placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-[#d8e3da] bg-[#fafbfa] py-2 pl-9 pr-9 text-xs font-semibold text-[#10261b] placeholder:text-[#99a89d] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#dff3e5] transition"
                  />
                  <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9d91] hover:text-[#10261b] transition"
                    aria-label={showRegisterPassword ? "Sembunyikan" : "Lihat"}>
                    {showRegisterPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <span className="mt-0.5 block text-[10px] font-bold text-[#b93c21]">{registerForm.formState.errors.password.message}</span>
                )}
              </div>

              <button
                type="submit" disabled={registerForm.formState.isSubmitting}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f6849] py-3 text-xs font-black text-white shadow-[0_5px_0_#0a3726] hover:bg-[#103626] hover:shadow-[0_3px_0_#0a3726] active:translate-y-0.5 active:shadow-[0_2px_0_#0a3726] disabled:opacity-70 transition-all cursor-pointer"
              >
                {registerForm.formState.isSubmitting
                  ? <LoaderCircle className="animate-spin" size={16} />
                  : <><span>Buat Workspace Sekarang</span><ArrowRight size={15} /></>}
              </button>
            </form>

            {/* Flip trigger */}
            <div className="mt-3.5 border-t border-[#f0f4f1] pt-3 flex items-center justify-between">
              <p className="text-[11px] text-[#65746a]">Sudah punya akun?</p>
              <button type="button" onClick={() => toggleMode("login")}
                className="inline-flex items-center gap-1 text-[11px] font-black text-[#0f6849] hover:text-[#103626] transition hover:underline active:scale-95 cursor-pointer">
                <span>Masuk ke Workspace</span>
                <RotateCw size={10} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Badges ── */}
      <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-bold text-[#718578]">
        <span className="flex items-center gap-1"><Shield size={11} className="text-[#0f6849]" /> Enkripsi Supabase RLS</span>
        <span>•</span>
        <span className="flex items-center gap-1"><Sparkles size={11} className="text-[#0f6849]" /> 100% Gratis</span>
      </div>
    </div>
  );
}
