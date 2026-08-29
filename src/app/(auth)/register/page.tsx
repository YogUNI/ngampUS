import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return <div className="w-full max-w-md"><Link className="font-display text-xl font-extrabold lg:hidden" href="/">nGamp<span className="text-[var(--brand)]">US</span></Link><p className="mt-10 text-sm font-bold uppercase tracking-[.14em] text-[var(--brand)]">Your campus command center</p><h1 className="font-display mt-3 text-4xl font-extrabold tracking-[-.045em]">Mulai lebih terarah.</h1><p className="mt-3 text-[var(--muted)]">Bikin satu ruang untuk setiap kelas, organisasi, dan ambisi yang sedang kamu jalankan.</p><AuthForm mode="register"/><p className="mt-8 text-center text-xs leading-5 text-[var(--muted)]">Dengan mendaftar, kamu menyetujui penggunaan data untuk menyediakan workspace pribadimu.</p></div>;
}
