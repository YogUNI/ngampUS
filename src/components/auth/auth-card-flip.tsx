"use client";

import { useState, useEffect } from "react";
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
  const [isStandalone, setIsStandalone] = useState(false);

  const isFlipped = mode === "register";

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
    <div className="w-full max-w-[440px] flex flex-col items-center">
      
      {/* ── Top Header: Brand & Segmented Tab Switcher (Compact) ── */}
      <div className="mb-2.5 flex w-full items-center justify-between gap-2 px-1">
        {/* Mobile Brand Link */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href={isStandalone ? "/login" : "/"}
            className="inline-flex items-center gap-2 font-display text-base font-black tracking-tight text-white active:scale-95 transition"
          >
            <Image
              src="/logo_ngampUS.png"
              alt="ngampUS Logo"
              width={26}
              height={26}
              priority
              className="h-6 w-6 object-contain drop-shadow-[0_2px_8px_rgba(200,239,112,0.3)]"
            />
            <span>ngamp<span className="text-[#c8ef70]">US</span></span>
          </Link>
          <span className="rounded-full border border-[#c8ef70]/30 bg-[#c8ef70]/10 px-2 py-0.2 text-[9px] font-black text-[#c8ef70]">
            APPS
          </span>
        </div>

        {/* Segmented iOS-Style Tab Switcher */}
        <div className="grid grid-cols-2 rounded-xl bg-[#071911]/90 p-0.5 border border-[#1b4330] backdrop-blur-xl shadow-inner ml-auto">
          <button
            type="button"
            onClick={() => toggleMode("login")}
            className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-black transition-all cursor-pointer ${
              !isFlipped
                ? "bg-[#c8ef70] text-[#091a12] shadow-sm"
                : "text-[#8cb89f] hover:text-white"
            }`}
          >
            <KeyRound size={12} />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => toggleMode("register")}
            className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-black transition-all cursor-pointer ${
              isFlipped
                ? "bg-[#c8ef70] text-[#091a12] shadow-sm"
                : "text-[#8cb89f] hover:text-white"
            }`}
          >
            <Sparkles size={12} />
            <span>Daftar</span>
          </button>
        </div>
      </div>

      {/* ── 3D CARD FLIP CONTAINER (IDENTICAL EXACT HEIGHT: 535px) ── */}
      <div className="perspective-container w-full h-[535px]">
        <div
          className={`card-flipper h-full w-full ${isFlipped ? "flipped" : ""}`}
        >

          {/* ══════════════════════════════════════════════════
              ══ FRONT: LOGIN (EXACT MATCH HEIGHT: 535px) ══
             ══════════════════════════════════════════════════ */}
          <div
            className={`card-face card-face-front h-full w-full flex flex-col justify-between rounded-3xl border border-[#1b4532] bg-[#0c2419]/95 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div>
              {/* Natural Header & Subtitle */}
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
                  Selamat Datang Kembali
                </span>
                <h2 className="font-display mt-0.5 text-2xl font-black tracking-tight text-white leading-tight">
                  Lanjutkan <span className="text-[#c8ef70]">ritmemu.</span>
                </h2>
                <p className="mt-1 text-[11px] text-[#8caea0] leading-snug">
                  Masuk untuk pantau jadwal kuliah, deadline tugas, dan aktivitas organisasimu.
                </p>
              </div>

              {/* Status Notices */}
              {registeredNotice && !serverError && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-[#1e5c3c] bg-[#113a27] p-2 text-[11px] font-bold text-[#c8ef70]">
                  <CheckCircle2 size={14} className="shrink-0 text-[#c8ef70]" />
                  <span>Akun dibuat! Silakan masuk dengan akun barumu.</span>
                </div>
              )}
              {resetSuccess && !serverError && (
                <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-[#1e5c3c] bg-[#113a27] p-2 text-[11px] font-bold text-[#c8ef70]">
                  <CheckCircle2 size={14} className="shrink-0 text-[#c8ef70]" />
                  <span>Password berhasil diperbarui! Silakan masuk.</span>
                </div>
              )}
              {serverError && (
                <div className="mt-2.5 rounded-xl border border-[#7f231c] bg-[#3a1311] p-2 text-[11px] font-semibold text-[#fca5a5]">
                  {serverError}
                </div>
              )}

              {/* Form Input Fields (Sleek Compact Spacing) */}
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="mt-4 space-y-3" noValidate>
                <div>
                  <label className="block text-[11px] font-extrabold text-[#d2e7dc] mb-1">
                    Email Mahasiswa / Personal
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <Mail size={15} />
                    </span>
                    <input
                      {...loginForm.register("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      className="w-full rounded-xl border border-[#1b4330] bg-[#071911] py-2.5 pl-10 pr-3.5 text-xs sm:text-sm font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-2 focus:ring-[#c8ef70]/20 transition"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <span className="mt-0.5 block text-[10px] font-bold text-[#fca5a5]">
                      {loginForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-extrabold text-[#d2e7dc]">Kata Sandi</label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-black text-[#c8ef70] hover:underline"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <Lock size={15} />
                    </span>
                    <input
                      {...loginForm.register("password")}
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Minimal 8 karakter"
                      className="w-full rounded-xl border border-[#1b4330] bg-[#071911] py-2.5 pl-10 pr-10 text-xs sm:text-sm font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-2 focus:ring-[#c8ef70]/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#648c79] hover:text-white p-1 transition cursor-pointer"
                      aria-label={showLoginPassword ? "Sembunyikan password" : "Lihat password"}
                    >
                      {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <span className="mt-0.5 block text-[10px] font-bold text-[#fca5a5]">
                      {loginForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c8ef70] py-3 text-xs sm:text-sm font-black text-[#091a12] shadow-md shadow-[#c8ef70]/20 transition hover:bg-[#d5fa80] active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin text-[#091a12]" />
                      <span>Menghubungkan ke Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Workspace</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Switcher & Feature Badges */}
            <div className="border-t border-white/10 pt-3">
              <p className="text-center text-[11px] text-[#8caea0]">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => toggleMode("register")}
                  className="font-black text-[#c8ef70] hover:underline cursor-pointer"
                >
                  Daftar Sekarang →
                </button>
              </p>

              <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                <div className="flex items-center justify-center gap-1 rounded-lg bg-white/[0.04] border border-white/10 py-1.5 px-1 text-center">
                  <Calendar size={11} className="text-[#c8ef70] shrink-0" />
                  <span className="text-[9.5px] font-bold text-[#c6ded3] truncate">Jadwal Kuliah</span>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-lg bg-white/[0.04] border border-white/10 py-1.5 px-1 text-center">
                  <GraduationCap size={11} className="text-[#c8ef70] shrink-0" />
                  <span className="text-[9.5px] font-bold text-[#c6ded3] truncate">Tugas & Deadlines</span>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-lg bg-white/[0.04] border border-white/10 py-1.5 px-1 text-center">
                  <Users size={11} className="text-[#c8ef70] shrink-0" />
                  <span className="text-[9.5px] font-bold text-[#c6ded3] truncate">Organisasi</span>
                </div>
              </div>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════
              ══ BACK: REGISTER (EXACT MATCH HEIGHT: 535px) ══
             ══════════════════════════════════════════════════ */}
          <div
            className={`card-face card-face-back h-full w-full flex flex-col justify-between rounded-3xl border border-[#1b4532] bg-[#0c2419]/95 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div>
              {/* Header */}
              <div>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#c8ef70]">
                  Akun Mahasiswa Baru
                </span>
                <h2 className="font-display mt-0.5 text-2xl font-black tracking-tight text-white leading-tight">
                  Mulai lebih <span className="text-[#c8ef70]">terarah.</span>
                </h2>
                <p className="mt-1 text-[11px] text-[#8caea0] leading-snug">
                  Workspace cerdas untuk jadwal kelas, tugas, dan portofolio CV-mu.
                </p>
              </div>

              {serverError && (
                <div className="mt-2 rounded-xl border border-[#7f231c] bg-[#3a1311] p-2 text-[11px] font-semibold text-[#fca5a5]">
                  {serverError}
                </div>
              )}

              {/* Form Input Fields (Compact, Zero-Scroll Fit) */}
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="mt-3 space-y-2.5" noValidate>
                <div>
                  <label className="block text-[10.5px] font-extrabold text-[#d2e7dc] mb-0.5">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#648c79]">
                      <User size={14} />
                    </span>
                    <input
                      {...registerForm.register("fullName")}
                      type="text"
                      autoComplete="name"
                      placeholder="Contoh: Raditya Pratama"
                      className="w-full rounded-xl border border-[#1b4330] bg-[#071911] py-2 pl-9 pr-3 text-xs font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-2 focus:ring-[#c8ef70]/20 transition"
                    />
                  </div>
                  {registerForm.formState.errors.fullName && (
                    <span className="mt-0.5 block text-[9.5px] font-bold text-[#fca5a5]">
                      {registerForm.formState.errors.fullName.message}
                    </span>
                  )}
                </div>

                {/* Campus Information (Compact) */}
                <div className="rounded-xl border border-[#1b4330] bg-[#071911]/80 p-2 space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] font-black text-[#c8ef70]">
                    <Building2 size={11} />
                    <span>Info Kampus & Jurusan (Opsional)</span>
                  </div>
                  <div className="space-y-1.5">
                    <UniversityCombobox
                      value={registerForm.watch("university") || ""}
                      onChange={(val) => registerForm.setValue("university", val, { shouldValidate: true })}
                      placeholder="Pilih universitas / ketik nama kampus..."
                      dark={true}
                    />
                    <input
                      {...registerForm.register("major")}
                      type="text"
                      placeholder="Program Studi (Contoh: Sistem Informasi)"
                      className="w-full rounded-lg border border-[#1b4330] bg-[#0b2419] py-1.5 px-2.5 text-[11px] font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:outline-none focus:ring-2 focus:ring-[#c8ef70]/20 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10.5px] font-extrabold text-[#d2e7dc] mb-0.5">Email Aktif</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                        <Mail size={13} />
                      </span>
                      <input
                        {...registerForm.register("email")}
                        type="email"
                        autoComplete="email"
                        placeholder="nama@email.com"
                        className="w-full rounded-xl border border-[#1b4330] bg-[#071911] py-2 pl-8 pr-2.5 text-xs font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-2 focus:ring-[#c8ef70]/20 transition"
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <span className="mt-0.5 block text-[9.5px] font-bold text-[#fca5a5]">
                        {registerForm.formState.errors.email.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-extrabold text-[#d2e7dc] mb-0.5">Kata Sandi</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#648c79]">
                        <Lock size={13} />
                      </span>
                      <input
                        {...registerForm.register("password")}
                        type={showRegisterPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Min 8 karakter"
                        className="w-full rounded-xl border border-[#1b4330] bg-[#071911] py-2 pl-8 pr-7 text-xs font-semibold text-white placeholder:text-[#4d705f] focus:border-[#c8ef70] focus:bg-[#092016] focus:outline-none focus:ring-2 focus:ring-[#c8ef70]/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#648c79] hover:text-white p-0.5 transition cursor-pointer"
                        aria-label={showRegisterPassword ? "Sembunyikan" : "Lihat"}
                      >
                        {showRegisterPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <span className="mt-0.5 block text-[9.5px] font-bold text-[#fca5a5]">
                        {registerForm.formState.errors.password.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#c8ef70] py-2.5 text-xs sm:text-sm font-black text-[#091a12] shadow-md shadow-[#c8ef70]/20 transition hover:bg-[#d5fa80] active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {registerForm.formState.isSubmitting ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin text-[#091a12]" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Akun & Mulai Gratis</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Bottom Footer Switcher (Perfect Comfortable Spacing) */}
            <div className="border-t border-white/10 pt-2.5 pb-1 text-center">
              <p className="text-[11px] text-[#8caea0]">
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
      <div className="mt-2.5 flex items-center justify-center gap-2 text-center text-[10.5px] font-semibold text-[#6e9381]">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-[#c8ef70]" /> Database Terenkripsi RLS
        </span>
        <span>•</span>
        <span>100% Gratis Selamanya</span>
      </div>

    </div>
  );
}
