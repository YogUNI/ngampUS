"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, Eye, EyeOff, LoaderCircle, ScanFace, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  fullName: z.string().trim().min(2, "Masukkan nama lengkap minimal 2 karakter.").max(100).optional(),
  university: z.string().trim().max(140).optional(),
  major: z.string().trim().max(140).optional(),
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(8, "Password minimal terdiri dari 8 karakter."),
});
type FormValues = z.infer<typeof schema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const supabase = createClient();
    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { full_name: values.fullName, university: values.university, major: values.major } }
      });
      if (error) return setServerError(error.message);
      if (!data.session) return setServerError("Akun dibuat. Konfirmasi email dulu sebelum masuk.");
      router.replace("/dashboard");
      router.refresh();
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error || !data.session) return setServerError(error?.message || "Sesi login tidak berhasil dibuat. Coba lagi.");
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {isRegister && (
        <Field label="Nama lengkap" error={errors.fullName?.message}>
          <input autoComplete="name" placeholder="Contoh: Axi Pratama" {...register("fullName")} />
        </Field>
      )}

      {isRegister && (
        <div className="rounded-2xl border border-[#b9ddc6] bg-[var(--brand-soft)]/55 p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/80 text-[var(--brand)]">
              <Building2 size={16}/>
            </span>
            <div>
              <p className="text-sm font-extrabold">Info kampus</p>
              <p className="text-xs text-[var(--muted)]">Opsional, tapi direkomendasikan untuk profil yang lebih lengkap.</p>
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <Field label="Universitas">
              <input autoComplete="organization" placeholder="Contoh: Universitas Mercu Buana" {...register("university")} />
            </Field>
            <Field label="Jurusan / Program studi">
              <input autoComplete="organization-title" placeholder="Contoh: Teknik Informatika" {...register("major")} />
            </Field>
          </div>
        </div>
      )}

      <Field label="Email kampus atau personal" error={errors.email?.message}>
        <input autoComplete="email" placeholder="kamu@email.com" type="email" {...register("email")} />
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <div className="relative">
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
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
            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
      </Field>

      {serverError && (
        <p className="rounded-xl bg-[#fff0ec] px-3 py-2.5 text-sm font-medium text-[#b93c21]">
          {serverError}
        </p>
      )}

      <button
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3.5 font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
      >
        {isSubmitting ? (
          <LoaderCircle className="animate-spin" size={18}/>
        ) : (
          <>
            {isRegister ? "Buat workspace" : "Masuk ke workspace"} <ArrowRight size={18}/>
          </>
        )}
      </button>

      <p className="text-center text-sm text-[var(--muted)]">
        {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <Link className="font-bold text-[var(--brand)] hover:underline" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Masuk" : "Daftar sekarang"}
        </Link>
      </p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-[#99a39d] [&_input]:focus:border-[var(--brand)] [&_input]:focus:ring-4 [&_input]:focus:ring-[#dcefe4]">
        {children}
      </div>
      {error && <span className="mt-1.5 block text-xs font-medium text-[#b93c21]">{error}</span>}
    </label>
  );
}

export function AuthAside() {
  return (
    <aside className="relative hidden overflow-x-hidden overflow-y-auto bg-[#173f2c] p-10 text-white lg:flex lg:flex-col">
      <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#c8ef70]/10 blur-3xl"/>
      <Link className="relative flex items-center gap-2.5 font-display text-2xl font-extrabold" href="/">
        <Image
          src="/logo_ngampUS.png"
          alt="ngampUS Logo"
          width={36}
          height={36}
          className="h-9 w-9 object-contain"
        />
        <span>
          ngamp<span className="text-[#a6dabb]">US</span>
        </span>
      </Link>
      <div className="relative my-12">
        <div className="mb-7 flex items-center gap-2 text-sm font-bold uppercase tracking-[.14em] text-[#b4d8c1]">
          <Sparkles size={16} className="text-[#c8ef70]"/> Campus identity, reimagined
        </div>
        <div className="relative mx-auto mb-10 w-[280px] rotate-[-4deg] rounded-2xl border border-[#b4d8c1]/35 bg-[#26563f] p-4 shadow-2xl shadow-black/20">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#dcefe4]/20 text-[#c8ef70]">
              <ScanFace size={24}/>
            </div>
            <div className="space-y-1.5 text-[10px] font-bold tracking-[.14em] text-[#dcefe4]">
              <p>NAMA MAHASISWA</p>
              <p>PROGRAM STUDI</p>
              <p className="text-[#c8ef70]">STATUS: AKTIF</p>
            </div>
          </div>
          <div className="mt-7 flex h-7 items-end gap-1 opacity-70">
            {Array.from({ length: 28 }, (_, index) => (
              <span key={index} className="w-1 rounded-t bg-[#dcefe4]" style={{ height: `${8 + (index * 17) % 18}px` }}/>
            ))}
          </div>
        </div>
        <h2 className="font-display max-w-md text-5xl font-extrabold leading-[1.03] tracking-[-.05em]">
          Lebih hadir untuk hal yang benar-benar penting.
        </h2>
        <p className="mt-6 max-w-sm leading-7 text-[#c7dbce]">
          Biarkan ngampUS menjaga struktur, supaya energimu tetap untuk berproses.
        </p>
      </div>
      <p className="relative pb-2 text-sm text-[#9eb9a7]">Personal workspace for campus life.</p>
    </aside>
  );
}
