"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Mail, KeyRound, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const emailSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
});
const otpSchema = z.object({
  otp: z.string().length(6, "Kode OTP harus 6 digit.").regex(/^\d+$/, "Kode OTP hanya berisi angka."),
});

type EmailValues = z.infer<typeof emailSchema>;
type OtpValues = z.infer<typeof otpSchema>;

type Step = "email" | "otp" | "verified";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [sentEmail, setSentEmail] = useState("");
  const [serverError, setServerError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // OTP digit refs for auto-focus navigation
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);

  const emailForm = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<OtpValues>({ resolver: zodResolver(otpSchema) });

  // ── Step 1: Send OTP ──────────────────────────────────────────────
  async function onEmailSubmit(values: EmailValues) {
    setServerError("");
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        shouldCreateUser: false, // only allow existing accounts
      },
    });

    if (error) {
      // Supabase returns a generic error for non-existent emails to prevent enumeration
      // We still show success UI to avoid leaking whether an account exists
      if (!error.message.toLowerCase().includes("rate limit")) {
        setSentEmail(values.email);
        setStep("otp");
        startCooldown();
        return;
      }
      setServerError("Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.");
      return;
    }

    setSentEmail(values.email);
    setStep("otp");
    startCooldown();
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────
  async function onOtpSubmit() {
    setServerError("");
    const token = otpDigits.join("");
    if (token.length !== 6) {
      setServerError("Masukkan kode 6 digit dari email kamu.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: sentEmail,
      token,
      type: "email",
    });

    if (error) {
      setServerError("Kode OTP tidak valid atau sudah kadaluarsa. Periksa kembali atau minta kode baru.");
      return;
    }

    // OTP verified → session is now active → go to reset password page
    setStep("verified");
    setTimeout(() => {
      router.replace("/reset-password");
    }, 1000);
  }

  // ── Resend OTP ───────────────────────────────────────────────────
  async function resendOtp() {
    if (resendCooldown > 0) return;
    setServerError("");
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email: sentEmail,
      options: { shouldCreateUser: false },
    });
    setOtpDigits(["", "", "", "", "", ""]);
    otpRefs.current[0]?.focus();
    startCooldown();
  }

  function startCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  // ── OTP digit input handler ──────────────────────────────────────
  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    otpForm.setValue("otp", next.join(""));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") onOtpSubmit();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = [...pasted.split(""), ...Array(6).fill("")].slice(0, 6);
    setOtpDigits(next);
    otpForm.setValue("otp", next.join(""));
    const lastFilled = Math.min(pasted.length, 5);
    otpRefs.current[lastFilled]?.focus();
  }

  // ── Verified state ───────────────────────────────────────────────
  if (step === "verified") {
    return (
      <div className="mt-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="mt-3 text-lg font-black text-[#103626]">Identitas Terverifikasi!</h3>
          <p className="mt-1.5 text-xs text-[#2c533e] leading-relaxed">
            Mengalihkan ke halaman pembuatan password baru...
          </p>
        </div>
      </div>
    );
  }

  // ── OTP input state ──────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="mt-8 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#dff3e5] text-[#0f6849]">
              <Mail size={15} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#103626]">Kode dikirim ke email kamu</p>
              <p className="mt-0.5 text-[11px] text-[#2c533e] break-all">{sentEmail}</p>
              <p className="mt-1 text-[11px] text-[#557e67]">Cek inbox atau folder spam. Masukkan kode 6 digit di bawah.</p>
            </div>
          </div>
        </div>

        {/* 6-digit OTP boxes */}
        <div>
          <label className="mb-3 block text-sm font-bold">Kode OTP (6 digit)</label>
          <div className="flex gap-2 justify-center">
            {otpDigits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className="h-14 w-12 rounded-xl border-2 border-[var(--line)] bg-white text-center text-xl font-black text-[#103626] outline-none transition focus:border-[var(--brand)] focus:ring-4 focus:ring-[#dcefe4]"
              />
            ))}
          </div>
        </div>

        {serverError && (
          <p className="rounded-xl bg-[#fff0ec] px-3.5 py-2.5 text-xs font-medium text-[#b93c21]">
            {serverError}
          </p>
        )}

        <button
          type="button"
          onClick={onOtpSubmit}
          disabled={otpDigits.join("").length !== 6}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
        >
          <KeyRound size={16} />
          Verifikasi Kode OTP
        </button>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setStep("email"); setOtpDigits(["", "", "", "", "", ""]); setServerError(""); }}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:underline"
          >
            <ArrowLeft size={13} /> Ganti email
          </button>
          <button
            type="button"
            onClick={resendOtp}
            disabled={resendCooldown > 0}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand)] hover:underline disabled:opacity-50 disabled:no-underline"
          >
            <RefreshCw size={13} />
            {resendCooldown > 0 ? `Kirim ulang (${resendCooldown}s)` : "Kirim ulang kode"}
          </button>
        </div>
      </div>
    );
  }

  // ── Email input state ────────────────────────────────────────────
  return (
    <form className="mt-8 space-y-5" onSubmit={emailForm.handleSubmit(onEmailSubmit)} noValidate>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Email terdaftar</span>
        <div className="relative [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-[#99a39d] [&_input]:focus:border-[var(--brand)] [&_input]:focus:ring-4 [&_input]:focus:ring-[#dcefe4]">
          <input
            autoComplete="email"
            placeholder="kamu@email.com"
            type="email"
            {...emailForm.register("email")}
          />
        </div>
        {emailForm.formState.errors.email && (
          <span className="mt-1.5 block text-xs font-medium text-[#b93c21]">
            {emailForm.formState.errors.email.message}
          </span>
        )}
      </label>

      {serverError && (
        <p className="rounded-xl bg-[#fff0ec] px-3.5 py-2.5 text-xs font-medium text-[#b93c21]">
          {serverError}
        </p>
      )}

      <button
        disabled={emailForm.formState.isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
        type="submit"
      >
        {emailForm.formState.isSubmitting ? (
          <>
            <LoaderCircle className="animate-spin" size={18} />
            <span>Mengirim kode OTP...</span>
          </>
        ) : (
          <>
            <span>Kirim Kode OTP ke Email</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        Ingat kata sandi kamu?{" "}
        <Link className="font-bold text-[var(--brand)] hover:underline" href="/login">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
