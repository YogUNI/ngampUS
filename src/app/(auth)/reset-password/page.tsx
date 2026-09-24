import Link from "next/link";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Atur Ulang Password | ngampUS",
  description: "Buat kata sandi baru untuk akun ngampUS kamu.",
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initialHasSession = !!user;

  return (
    <div className="w-full max-w-[460px] rounded-[2rem] border border-[#1b4532] bg-[#0c2419]/95 px-6 pt-7 pb-8 sm:px-8 sm:pt-8 sm:pb-9 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
      {/* Mobile Brand Link */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-display text-lg font-black tracking-tight text-white active:scale-95 transition"
        >
          <Image
            src="/logo_ngampUS.png"
            alt="ngampUS Logo"
            width={28}
            height={28}
            className="h-7 w-7 object-contain drop-shadow-[0_2px_8px_rgba(200,239,112,0.3)]"
          />
          <span>ngamp<span className="text-[#c8ef70]">US</span></span>
        </Link>
        <span className="rounded-full bg-[#c8ef70]/10 border border-[#c8ef70]/30 px-2.5 py-0.5 text-[10px] font-black text-[#c8ef70]">
          PASSWORD
        </span>
      </div>

      <div className="mt-1">
        <span className="inline-block text-[11px] font-black uppercase tracking-wider text-[#c8ef70]">
          Sandi Baru
        </span>
        <h1 className="font-display mt-1 text-2xl sm:text-3xl font-black tracking-tight text-white">
          Atur ulang password.
        </h1>
        <p className="mt-1.5 text-xs text-[#8caea0] leading-relaxed">
          Buat kata sandi baru yang kuat (minimal 8 karakter) untuk melindungi akun ngampUS kamu.
        </p>
      </div>

      <ResetPasswordForm initialHasSession={initialHasSession} />
    </div>
  );
}
