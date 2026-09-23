import Link from "next/link";
import Image from "next/image";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Lupa Password | ngampUS",
  description: "Pulihkan kata sandi akun ngampUS kamu.",
};

export default function ForgotPasswordPage() {
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
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--brand)]">RECOVERY / 01</p>
        <span className="rounded-full bg-[#dff3e5] px-2.5 py-1 text-[10px] font-black text-[#0f6849]">PEMULIHAN</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-black tracking-[-.06em] text-[#103626]">
        Lupa kata sandi?
      </h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--muted)] leading-relaxed">
        Masukkan alamat email yang terdaftar di akun ngampUS. Kami akan mengirimkan <strong>kode OTP 6 digit</strong> ke email kamu untuk verifikasi identitas.
      </p>

      <ForgotPasswordForm />
    </div>
  );
}
