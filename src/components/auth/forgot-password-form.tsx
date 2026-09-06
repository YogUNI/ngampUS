"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const forgotSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(values: ForgotFormValues) {
    setServerError("");
    const supabase = createClient();

    // Redirect to /auth/callback with next=/reset-password so server exchanges code and creates authenticated session
    const redirectUrl = `${window.location.origin}/auth/callback?next=/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setSuccessEmail(values.email);
  }

  if (successEmail) {
    return (
      <div className="mt-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] p-5 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff3e5] text-[#0f6849]">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="mt-3 text-lg font-black text-[#103626]">Tautan Terkirim!</h3>
          <p className="mt-1.5 text-xs text-[#2c533e] leading-relaxed">
            Kami telah mengirim instruksi pemulihan kata sandi ke:
            <br />
            <b className="font-bold text-[#0f6849]">{successEmail}</b>
          </p>
          <p className="mt-3 text-[11px] text-[#557e67]">
            Cek kotak masuk atau folder spam kamu, lalu klik tautan di dalamnya untuk membuat kata sandi baru.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setSuccessEmail("")}
            className="w-full rounded-xl border border-[var(--line)] bg-white py-2.5 text-xs font-bold text-[var(--muted)] hover:bg-[#f7f8f5] transition"
          >
            Kirim ulang ke email lain
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[var(--brand)] hover:underline"
          >
            <ArrowLeft size={14} /> Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="block">
        <span className="mb-2 block text-sm font-bold">Email terdaftar</span>
        <div className="relative [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:text-sm [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-[#99a39d] [&_input]:focus:border-[var(--brand)] [&_input]:focus:ring-4 [&_input]:focus:ring-[#dcefe4]">
          <input
            autoComplete="email"
            placeholder="kamu@email.com"
            type="email"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <span className="mt-1.5 block text-xs font-medium text-[#b93c21]">
            {errors.email.message}
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
            <span>Mengirim tautan...</span>
          </>
        ) : (
          <>
            <span>Kirim Tautan Pemulihan</span>
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
