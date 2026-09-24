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

  // Sync card height
  useEffect(() => {
    const updateHeight = () => {
      if (frontRef.current && backRef.current) {
        const frontH = frontRef.current.scrollHeight;
        const backH = backRef.current.scrollHeight;
        const h = Math.max(frontH, backH);
        if (h > 420 && h < 1000) {
          setFlipperHeight(h);
        }
      }
    };
    const t = setTimeout(updateHeight, 60);
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
    <div className="w-full max-w-[450px]">
      
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
              className="h-7 w-7 object-contain drop-shadow-sm"
            />
            <span>ngamp<span className="text-[#c8ef70]">US</span></span>
          </Link>
          <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-0.5 text-[10px] font-black text-[#c8ef70]">
            APPS
          </span>
        </div>

        {/* Segmented iOS-Style Tab Switcher */}
        <div className="w-full sm:w-auto ml-auto grid grid-cols-2 rounded-2xl bg-black/40 p-1 border border-white/15 backdrop-blur-xl shadow-inner">
          <button
            type="button"
            onClick={() => toggleMode("login")}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
              !isFlipped
                ? "bg-[#c8ef70] text-[#103626] shadow-sm"
                : "text-[#a2c2b0] hover:text-white"
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
                ? "bg-[#c8ef70] text-[#103626] shadow-sm"
                : "text-[#a2c2b0] hover:text-white"
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
          style={{ minHeight: flipperHeight || 540, height: flipperHeight }}
        >

          {/* ══════════════════════════════════════════════════
              ══ FRONT: LOGIN ══
             ══════════════════════════════════════════════════ */}
          <div
            ref={frontRef}
            className={`card-face card-face-front flex flex-col justify-between rounded-[2rem] border border-[#d8e3da] bg-white p-6 sm:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.22)] ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div>
              {/* Natural Header & Subtitle */}
              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#0f6849]">
                  Selamat Datang Kembali
                </span>
                <h2 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#10261b]">
                  Lanjutkan <span className="text-[#0f6849]">ritmemu.</span>
                </h2>
                <p className="mt-1.5 text-xs text-[#5a6d61] leading-relaxed">
                  Masuk untuk melihat jadwal kuliah, deadline tugas, dan aktivitas organisasimu.
                </p>
              </div>

              {/* Status Notices */}
              {registeredNotice && !serverError && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] p-3 text-xs font-bold text-[#17613e]">
                  <CheckCircle2 size={16} className="shrink-0 text-[#0f6849]" />
                  <span>Akun berhasil dibuat! Silakan masuk dengan akun barumu.</span>
                </div>
              )}
              {resetSuccess && !serverError && (
                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] p-3 text-xs font-bold text-[#17613e]">
                  <CheckCircle2 size={16} className="shrink-0 text-[#0f6849]" />
                  <span>Password berhasil diperbarui! Silakan masuk kembali.</span>
                </div>
              )}
              {serverError && (
                <div className="mt-4 rounded-2xl border border-[#f5b8a9] bg-[#fff0ec] p-3 text-xs font-semibold text-[#b93c21]">
                  {serverError}
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-5 space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-extrabold text-[#10261b] mb-1.5">
                    Email Mahasiswa / Personal
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
                      className="w-full rounded-2xl border border-[#d8e3da] bg-[#fafbfa] py-3 pl-11 pr-4 text-sm font-semibold text-[#10261b] placeholder:text-[#9aa99e] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff3e5] transition"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <span className="mt-1 block text-[11px] font-bold text-[#b93c21]">
                      {loginForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-[#10261b]">Kata Sandi</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-black text-[#0f6849] hover:underline"
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
                      className="w-full rounded-2xl border border-[#d8e3da] bg-[#fafbfa] py-3 pl-11 pr-11 text-sm font-semibold text-[#10261b] placeholder:text-[#9aa99e] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff3e5] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91] hover:text-[#10261b] p-1 transition cursor-pointer"
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

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#103626] py-3.5 text-sm font-black text-[#c8ef70] shadow-md shadow-[#103626]/25 transition hover:bg-[#164733] hover:shadow-lg active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin text-[#c8ef70]" />
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
            <div className="mt-6 border-t border-[#f0f4f1] pt-4">
              <p className="text-center text-xs text-[#5a6d61]">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("register")}
                  className="font-black text-[#0f6849] hover:underline cursor-pointer"
                >
                  Daftar Sekarang — Gratis →
                </button>
              </p>

              <div className="mt-3.5 grid grid-cols-3 gap-2">
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f4faf6] border border-[#e2efe6] py-2 px-1 text-center">
                  <Calendar size={13} className="text-[#0f6849] shrink-0" />
                  <span className="text-[10.5px] font-bold text-[#2d5040] truncate">Jadwal Kuliah</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f4faf6] border border-[#e2efe6] py-2 px-1 text-center">
                  <GraduationCap size={13} className="text-[#0f6849] shrink-0" />
                  <span className="text-[10.5px] font-bold text-[#2d5040] truncate">Tugas & Deadline</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f4faf6] border border-[#e2efe6] py-2 px-1 text-center">
                  <Users size={13} className="text-[#0f6849] shrink-0" />
                  <span className="text-[10.5px] font-bold text-[#2d5040] truncate">Organisasi</span>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════
              ══ BACK: REGISTER ══
             ══════════════════════════════════════════════════ */}
          <div
            ref={backRef}
            className={`card-face card-face-back flex flex-col justify-between rounded-[2rem] border border-[#d8e3da] bg-white p-6 sm:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.22)] ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div>
              {/* Header */}
              <div>
                <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#0f6849]">
                  Akun Mahasiswa Baru
                </span>
                <h2 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#10261b]">
                  Mulai lebih <span className="text-[#0f6849]">terarah.</span>
                </h2>
                <p className="mt-1.5 text-xs text-[#5a6d61] leading-relaxed">
                  Workspace cerdas untuk jadwal kelas, tugas kuliah, dan portofolio CV-mu.
                </p>
              </div>

              {serverError && (
                <div className="mt-4 rounded-2xl border border-[#f5b8a9] bg-[#fff0ec] p-3 text-xs font-semibold text-[#b93c21]">
                  {serverError}
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="mt-4 space-y-3" noValidate>
                <div>
                  <label className="block text-xs font-extrabold text-[#10261b] mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                      <User size={15} />
                    </span>
                    <input
                      {...registerForm.register("fullName")}
                      type="text"
                      autoComplete="name"
                      placeholder="Contoh: Raditya Pratama"
                      className="w-full rounded-2xl border border-[#d8e3da] bg-[#fafbfa] py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[#10261b] placeholder:text-[#9aa99e] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff3e5] transition"
                    />
                  </div>
                  {registerForm.formState.errors.fullName && (
                    <span className="mt-1 block text-[11px] font-bold text-[#b93c21]">
                      {registerForm.formState.errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Campus Information (Optional) */}
                <div className="rounded-2xl border border-[#b9ddc6] bg-[#f2faf5] p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-[#0f6849]">
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
                      className="w-full rounded-xl border border-[#d8e3da] bg-white py-2 px-3 text-xs font-semibold text-[#10261b] placeholder:text-[#9aa99e] focus:border-[#0f6849] focus:outline-none focus:ring-2 focus:ring-[#dff3e5] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#10261b] mb-1">Email Aktif</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                      <Mail size={15} />
                    </span>
                    <input
                      {...registerForm.register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      className="w-full rounded-2xl border border-[#d8e3da] bg-[#fafbfa] py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[#10261b] placeholder:text-[#9aa99e] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff3e5] transition"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <span className="mt-1 block text-[11px] font-bold text-[#b93c21]">
                      {registerForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#10261b] mb-1">Kata Sandi</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91]">
                      <Lock size={15} />
                    </span>
                    <input
                      {...registerForm.register("password")}
                      type={showRegisterPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimal 8 karakter"
                      className="w-full rounded-2xl border border-[#d8e3da] bg-[#fafbfa] py-2.5 pl-10 pr-10 text-sm font-semibold text-[#10261b] placeholder:text-[#9aa99e] focus:border-[#0f6849] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff3e5] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b9d91] hover:text-[#10261b] p-1 transition cursor-pointer"
                      aria-label={showRegisterPassword ? "Sembunyikan password" : "Lihat password"}
                    >
                      {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <span className="mt-1 block text-[11px] font-bold text-[#b93c21]">
                      {registerForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f6849] py-3.5 text-sm font-black text-white shadow-md shadow-[#0f6849]/25 transition hover:bg-[#0c533a] hover:shadow-lg active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {registerForm.formState.isSubmitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin text-white" />
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

            {/* Bottom Footer Switcher */}
            <div className="mt-5 border-t border-[#f0f4f1] pt-3 text-center">
              <p className="text-xs text-[#5a6d61]">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("login")}
                  className="font-black text-[#0f6849] hover:underline cursor-pointer"
                >
                  Masuk di sini →
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Micro Trust Footer ── */}
      <div className="mt-4 flex items-center justify-center gap-3 text-center text-[11px] font-semibold text-[#8fa899]">
        <span className="flex items-center gap-1">
          <ShieldCheck size={13} className="text-[#c8ef70]" /> Database Terenkripsi RLS
        </span>
        <span>•</span>
        <span>100% Gratis Selamanya</span>
      </div>

    </div>
  );
}
