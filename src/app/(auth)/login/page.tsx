import Link from "next/link";
import Image from "next/image";
import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const { registered } = await searchParams;
  return (
    <div className="auth-atlas-card w-full max-w-md">
      <Link className="flex items-center gap-2 font-display text-xl font-black tracking-[-.06em] lg:hidden" href="/">
        <div className="relative grid h-7 w-7 place-items-center rounded-lg bg-[#103626] p-1 shadow-[2px_2px_0_#c8ef70]">
          <Image
            src="/logo_ngampUS.png"
            alt="ngampUS Logo"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
        <span>
          ngamp<span className="text-[var(--brand)]">US</span>
        </span>
      </Link>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--brand)]">Access point / 01</p>
        <span className="rounded-full bg-[#dff3e5] px-2.5 py-1 text-[10px] font-black text-[#0f6849]">AMAN</span>
      </div>

      <h1 className="font-display mt-4 text-4xl font-black tracking-[-.06em] text-[#103626]">
        Lanjutkan<br/>ritmemu.
      </h1>
      <p className="mt-3 max-w-sm text-[var(--muted)]">
        Masuk untuk melihat fokus, progres, dan hal yang perlu kamu taklukkan hari ini.
      </p>

      {registered && (
        <p className="mt-5 rounded-2xl border border-[#b9ddc6] bg-[#eaf6ee] px-3 py-2.5 text-sm font-medium text-[#17613e]">
          Akun berhasil dibuat. Cek email bila konfirmasi akun diaktifkan, lalu masuk.
        </p>
      )}

      <AuthForm mode="login"/>
    </div>
  );
}
