"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  fullName: z.string().trim().min(2, "Masukkan nama lengkap minimal 2 karakter.").max(100).optional(),
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
      const { error } = await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { full_name: values.fullName } } });
      if (error) return setServerError(error.message);
      router.push("/login?registered=1");
      router.refresh();
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) return setServerError("Email atau password belum tepat. Coba lagi.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {isRegister && <Field label="Nama lengkap" error={errors.fullName?.message}><input autoComplete="name" placeholder="Contoh: Axi Pratama" {...register("fullName")} /></Field>}
      <Field label="Email kampus atau personal" error={errors.email?.message}><input autoComplete="email" placeholder="kamu@email.com" type="email" {...register("email")} /></Field>
      <Field label="Password" error={errors.password?.message}><div className="relative"><input autoComplete={isRegister ? "new-password" : "current-password"} placeholder="Minimal 8 karakter" type={showPassword ? "text" : "password"} {...register("password")} /><button className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></Field>
      {serverError && <p className="rounded-xl bg-[#fff0ec] px-3 py-2.5 text-sm font-medium text-[#b93c21]">{serverError}</p>}
      <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3.5 font-bold text-white transition hover:bg-[var(--brand-dark)] disabled:cursor-not-allowed disabled:opacity-70" type="submit">{isSubmitting ? <LoaderCircle className="animate-spin" size={18}/> : <>{isRegister ? "Buat workspace" : "Masuk ke workspace"} <ArrowRight size={18}/></>}</button>
      <p className="text-center text-sm text-[var(--muted)]">{isRegister ? "Sudah punya akun?" : "Belum punya akun?"} <Link className="font-bold text-[var(--brand)] hover:underline" href={isRegister ? "/login" : "/register"}>{isRegister ? "Masuk" : "Daftar sekarang"}</Link></p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:bg-white [&_input]:px-3.5 [&_input]:py-3 [&_input]:outline-none [&_input]:transition [&_input]:placeholder:text-[#99a39d] [&_input]:focus:border-[var(--brand)] [&_input]:focus:ring-4 [&_input]:focus:ring-[#dcefe4]">{children}</div>{error && <span className="mt-1.5 block text-xs font-medium text-[#b93c21]">{error}</span>}</label>;
}

export function AuthAside() {
  return <aside className="hidden bg-[#173f2c] p-10 text-white lg:flex lg:flex-col"><Link className="font-display text-2xl font-extrabold" href="/">nGamp<span className="text-[#a6dabb]">US</span></Link><div className="my-auto"><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#c8ef70] text-[#173f2c]"><Sparkles/></div><h2 className="font-display max-w-md text-5xl font-extrabold leading-[1.03] tracking-[-.05em]">Lebih hadir untuk hal yang benar-benar penting.</h2><p className="mt-6 max-w-sm leading-7 text-[#c7dbce]">Biarkan nGampUS menjaga struktur, supaya energimu tetap untuk berproses.</p></div><p className="text-sm text-[#9eb9a7]">Personal workspace for campus life.</p></aside>;
}
