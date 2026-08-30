import { GraduationCap, Mail, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").single(),
    supabase.auth.getUser(),
  ]);

  const initial = (profile?.full_name || user?.email || "M").slice(0, 1).toUpperCase();

  return <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
    <header>
      <p className="text-sm font-bold text-[var(--brand)]">PERSONAL WORKSPACE</p>
      <h1 className="font-display mt-1 text-4xl font-extrabold tracking-[-.045em]">Profil & pengaturan</h1>
      <p className="mt-2 text-[var(--muted)]">Data ini membuat workspace nGampUS benar-benar terasa milikmu.</p>
    </header>

    <section className="relative mt-8 overflow-hidden rounded-3xl border border-[#0f6849]/30 bg-gradient-to-br from-[#103828] via-[#174633] to-[#0a291d] p-7 text-white shadow-xl shadow-[#0a291d]/20">
      <div className="absolute right-0 top-0 h-48 w-48 -translate-y-12 translate-x-12 rounded-full bg-[#d9ee72]/10 blur-2xl pointer-events-none"/>
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-black text-[#d9ee72] ring-1 ring-white/20">
            {initial}
          </div>
          <div>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#d9ee72]">Campus Passport</span>
            <h2 className="font-display mt-1.5 text-2xl font-extrabold">{profile?.full_name || "Mahasiswa nGampUS"}</h2>
            <p className="mt-1 truncate text-xs text-white/70">{user?.email || profile?.email || "Email belum tersedia"}</p>
            <p className="mt-2 text-sm font-semibold text-white/90">
              {profile?.major || "Program studi belum diisi"} · {profile?.university || "Universitas belum diisi"}
            </p>
          </div>
        </div>
        {profile?.student_id && (
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-right backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">NIM / ID</p>
            <p className="font-mono text-xs font-bold text-white">{profile.student_id}</p>
          </div>
        )}
      </div>
    </section>

    <form action={updateProfile} className="mt-6 rounded-3xl border border-[var(--line)] bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dcefe4] text-[var(--brand)]">
          <UserRound size={20}/>
        </div>
        <div>
          <h2 className="font-display text-xl font-extrabold">Identitas mahasiswa</h2>
          <p className="text-sm text-[var(--muted)]">Lengkapi sekali, lalu informasi ini siap dipakai di seluruh aplikasi.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 [&_input]:mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3.5 [&_input]:py-2.5 [&_input]:outline-none [&_input]:transition [&_input]:focus:border-[var(--brand)] [&_textarea]:mt-2 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3.5 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:transition [&_textarea]:focus:border-[var(--brand)]">
        <label className="block text-sm font-bold sm:col-span-2">
          Nama lengkap
          <input required name="full_name" defaultValue={profile?.full_name || ""} placeholder="Nama kamu"/>
        </label>
        <label className="block text-sm font-bold sm:col-span-2">
          Email akun
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-5 text-[var(--muted)]" size={16}/>
            <input disabled value={user?.email || profile?.email || ""} className="pl-10 !bg-[#f7f8f5] !text-[var(--muted)]"/>
          </div>
          <span className="mt-1.5 block text-xs font-normal text-[var(--muted)]">Email dikelola oleh akun autentikasi Supabase agar tetap aman.</span>
        </label>
        <label className="block text-sm font-bold">
          Universitas
          <input required name="university" defaultValue={profile?.university || ""} placeholder="Nama universitas"/>
        </label>
        <label className="block text-sm font-bold">
          Program studi
          <input required name="major" defaultValue={profile?.major || ""} placeholder="Program studi"/>
        </label>
        <label className="block text-sm font-bold">
          NIM
          <input name="student_id" defaultValue={profile?.student_id || ""} placeholder="Contoh: 41523110001"/>
        </label>
        <label className="block text-sm font-bold">
          Nomor WhatsApp
          <input name="phone" inputMode="tel" defaultValue={profile?.phone || ""} placeholder="Contoh: 081234567890"/>
        </label>
        <label className="block text-sm font-bold sm:col-span-2">
          Bio singkat
          <textarea maxLength={280} name="bio" rows={3} defaultValue={profile?.bio || ""} placeholder="Contoh: Mahasiswa aktif yang sedang menyeimbangkan kuliah, organisasi, dan riset."/>
          <span className="mt-1.5 block text-xs font-normal text-[var(--muted)]">Maksimal 280 karakter untuk ringkasan profilmu.</span>
        </label>
      </div>

      <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-dark)] shadow-md shadow-[#0f6849]/20">
        <GraduationCap size={18}/> Simpan profil
      </button>
    </form>
  </div>;
}
