"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";
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
    async function checkUserSession() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidSession(true);
      } else {
        // Also listen to auth state changes (e.g., when Supabase parses hash from URL)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || session) {
            setHasValidSession(true);
          }
        });
        return () => subscription.unsubscribe();
      }
      setCheckingSession(false);
    }
    checkUserSession();
  }, []);

  async function onSubmit(values: ResetFormValues) {
    setServerError("");
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 2500);
  }

  if (isSuccess) {
    return (
      <div className="mt-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="mt-3 text-lg font-black text-[#103626]">Password Diperbarui!</h3>
          <p className="mt-1.5 text-xs text-[#2c533e] leading-relaxed">
            Kata sandi baru kamu berhasil disimpan. Kamu akan dialihkan ke dashboard dalam beberapa detik...
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
