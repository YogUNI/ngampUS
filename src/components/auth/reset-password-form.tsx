"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password baru minimal 8 karakter."),
    confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    async function initSession() {
      const supabase = createClient();

      // 1. Check if we already have an active session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
        setCheckingSession(false);
        return;
      }

      // 2. Check if URL contains an authorization code from PKCE redirect
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setHasValidSession(true);
          setCheckingSession(false);
          return;
        }
      }

      // 3. Check if URL hash contains recovery token / access_token (Implicit grant)
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!error) {
            setHasValidSession(true);
            setCheckingSession(false);
            return;
          }
        }
      }

      // 4. Listen for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
        if (event === "PASSWORD_RECOVERY" || (currentSession && event === "SIGNED_IN")) {
          setHasValidSession(true);
          setCheckingSession(false);
        }
      });

      // Give 1.5 seconds grace period for hash or cookies to hydrate
      setTimeout(() => {
        setCheckingSession(false);
      }, 1500);

      return () => {
        subscription.unsubscribe();
      };
    }

    initSession();
  }, []);

  async function onSubmit(values: ResetFormValues) {
    setServerError("");
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("session")) {
        setServerError(
          "Sesi pemulihan tidak ditemukan atau sudah kadaluarsa. Silakan minta tautan baru di halaman Lupa Password."
        );
        setHasValidSession(false);
      } else {
        setServerError(error.message);
      }
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 2000);
  }

  if (checkingSession) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
        <LoaderCircle className="animate-spin text-[var(--brand)]" size={32} />
        <p className="mt-3 text-xs font-bold text-[var(--muted)]">Memverifikasi sesi pemulihan akun...</p>
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="mt-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-[#f5c6cb] bg-[#fff5f5] p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#feece7] text-[#c53e1c]">
            <AlertTriangle size={24} />
          </div>
          <h3 className="mt-3 text-base font-extrabold text-[#721c24]">Sesi Pemulihan Kadaluarsa</h3>
          <p className="mt-1.5 text-xs text-[#842029] leading-relaxed">
            Tautan reset password ini sudah kadaluarsa atau dibuka tanpa token otentikasi yang valid.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/forgot-password"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-xs font-bold text-white transition hover:bg-[var(--brand-dark)]"
          >
            <RefreshCw size={14} /> Minta Tautan Baru
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center py-2 text-xs font-bold text-[var(--muted)] hover:underline"
          >
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="mt-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="mt-3 text-lg font-black text-[#103626]">Password Berhasil Diperbarui!</h3>
          <p className="mt-1.5 text-xs text-[#2c533e] leading-relaxed">
            Kata sandi baru kamu berhasil disimpan. Mengalihkan ke dashboard...
          </p>
        </div>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)]"
        >
          Masuk ke Dashboard Sekarang <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Password Baru</span>
        <div className="relative [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-[#99a39d] [&_input]:focus:border-[var(--brand)] [&_input]:focus:ring-4 [&_input]:focus:ring-[#dcefe4]">
          <input
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            type={showPassword ? "text" : "password"}
            {...register("password")}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <span className="mt-1.5 block text-xs font-medium text-[#b93c21]">
            {errors.password.message}
          </span>
        )}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold">Konfirmasi Password Baru</span>
        <div className="relative [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-[#99a39d] [&_input]:focus:border-[var(--brand)] [&_input]:focus:ring-4 [&_input]:focus:ring-[#dcefe4]">
          <input
            autoComplete="new-password"
            placeholder="Ketik ulang password baru"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="mt-1.5 block text-xs font-medium text-[#b93c21]">
            {errors.confirmPassword.message}
          </span>
        )}
      </label>

      {serverError && (
        <p className="rounded-xl bg-[#fff0ec] px-3.5 py-2.5 text-xs font-medium text-[#b93c21]">
          {serverError}
        </p>
      )}

      <button
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
        type="submit"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" size={18} />
            <span>Menyimpan password baru...</span>
          </>
        ) : (
          <>
            <span>Simpan & Perbarui Password</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        Batal mereset?{" "}
        <Link className="font-bold text-[var(--brand)] hover:underline" href="/login">
          Kembali ke halaman masuk
        </Link>
      </p>
    </form>
  );
}
