import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const { registered } = await searchParams;
  return <div className="w-full max-w-md"><Link className="font-display text-xl font-extrabold lg:hidden" href="/">nGamp<span className="text-[var(--brand)]">US</span></Link><p className="mt-10 text-sm font-bold uppercase tracking-[.14em] text-[var(--brand)]">Welcome back</p><h1 className="font-display mt-3 text-4xl font-extrabold tracking-[-.045em]">Lanjutkan ritmemu.</h1><p className="mt-3 text-[var(--muted)]">Masuk untuk melihat apa yang perlu kamu taklukkan hari ini.</p>{registered && <p className="mt-5 rounded-xl bg-[#eaf6ee] px-3 py-2.5 text-sm font-medium text-[#17613e]">Akun berhasil dibuat. Cek email bila konfirmasi akun diaktifkan, lalu masuk.</p>}<AuthForm mode="login"/></div>;
}
