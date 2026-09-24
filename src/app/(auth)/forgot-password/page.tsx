import Link from "next/link";
import Image from "next/image";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { KeyRound } from "lucide-react";

export const metadata = {
  title: "Lupa Password | ngampUS",
  description: "Pulihkan kata sandi akun ngampUS kamu.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[440px] rounded-[2rem] border border-[#d8e3da] bg-white p-6 sm:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
      {/* Mobile Brand Link */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-black tracking-tight text-[#10261b] active:scale-95 transition"
        >
          <Image
            src="/logo_ngampUS.png"
            alt="ngampUS Logo"
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
          />
          <span>ngamp<span className="text-[#0f6849]">US</span></span>
        </Link>
        <span className="rounded-full bg-[#f2faf5] px-2.5 py-0.5 text-[10px] font-black text-[#0f6849] border border-[#b9ddc6]">
          SECURITY
        </span>
      </div>

      <div className="mt-1">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#0f6849]">
          Pemulihan Akun
        </span>
        <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#10261b]">
          Lupa kata sandi?
        </h1>
        <p className="mt-1.5 text-xs text-[#5a6d61] leading-relaxed">
          Masukkan email terdaftarmu. Kami akan mengirimkan <strong>kode OTP 6 digit</strong> untuk memverifikasi akun kamu.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
