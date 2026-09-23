import Link from "next/link";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Atur Ulang Password | ngampUS",
  description: "Buat kata sandi baru untuk akun ngampUS kamu.",
};

export default async function ResetPasswordPage() {
  // Check session server-side so the form skips the unreliable client-side
  // cookie-hydration race that causes false "Sesi Pemulihan Kadaluarsa" errors.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initialHasSession = !!user;

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
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--brand)]">SECURITY / 02</p>
        <span className="rounded-full bg-[#dff3e5] px-2.5 py-1 text-[10px] font-black text-[#0f6849]">PASSWORD BARU</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-black tracking-[-.06em] text-[#103626]">
        Atur ulang kata sandi.
      </h1>
      <p className="mt-3 max-w-sm text-sm text-[var(--muted)] leading-relaxed">
        Buat kata sandi baru yang kuat (minimal 8 karakter) untuk melindungi akun ngampUS kamu.
      </p>

      <ResetPasswordForm initialHasSession={initialHasSession} />
    </div>
  );
}
