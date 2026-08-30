import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <div className="auth-atlas-card w-full max-w-md">
      <Link className="flex items-center gap-2 font-display text-xl font-black tracking-[-.06em] lg:hidden" href="/">
        <Image
          src="/logo_ngampUS.png"
          alt="ngampUS Logo"
          width={30}
          height={30}
          className="h-7 w-7 object-contain"
        />
        <span>
          ngamp<span className="text-[var(--brand)]">US</span>
        </span>
      </Link>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--brand)]">Create your atlas / 02</p>
        <span className="rounded-full bg-[#fff0c9] px-2.5 py-1 text-[10px] font-black text-[#8a5d00]">GRATIS</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-black tracking-[-.06em] text-[#103626]">
        Mulai lebih<br/>terarah.
      </h1>
      <p className="mt-3 max-w-sm text-[var(--muted)]">
        Bikin satu ruang untuk setiap kelas, organisasi, dan ambisi yang sedang kamu jalankan.
      </p>

      <AuthForm mode="register"/>

      <p className="mt-8 border-t border-[#dce5dd] pt-5 text-center text-xs leading-5 text-[var(--muted)]">
        Dengan mendaftar, kamu menyetujui penggunaan data untuk menyediakan workspace pribadimu.
      </p>
    </div>
  );
}
