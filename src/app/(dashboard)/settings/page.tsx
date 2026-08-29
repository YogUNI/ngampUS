import { GraduationCap, Mail, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { updateProfile } from "./actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const [{ data: profile }, { data: { user } }] = await Promise.all([
    supabase.from("profiles").select("*").single(),
    supabase.auth.getUser(),
  ]);

  return <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
    <p className="text-sm font-bold text-[var(--brand)]">PERSONAL WORKSPACE</p>
    <h1 className="font-display mt-1 text-4xl font-extrabold tracking-[-.045em]">Profil & pengaturan</h1>
    <p className="mt-2 text-[var(--muted)]">Data ini membuat workspace nGampUS benar-benar terasa milikmu.</p>

    <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[#173f32] p-6 text-white">
      <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-lg font-extrabold">{(profile?.full_name || user?.email || "M").slice(0, 1).toUpperCase()}</div><div className="min-w-0"><h2 className="font-display text-xl font-extrabold">{profile?.full_name || "Mahasiswa nGampUS"}</h2><p className="mt-1 truncate text-sm text-white/70">{user?.email || profile?.email || "Email belum tersedia"}</p><p className="mt-2 text-sm text-white/80">{profile?.major || "Program studi belum diisi"} · {profile?.university || "Universitas belum diisi"}</p></div></div>
    </section>

    <form action={updateProfile} className="mt-5 rounded-2xl border border-[var(--line)] bg-white p-6">
      <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#dcefe4] text-[var(--brand)]"><UserRound size={20}/></div><div><h2 className="font-display text-xl font-extrabold">Identitas mahasiswa</h2><p className="text-sm text-[var(--muted)]">Lengkapi sekali, lalu informasi ini siap dipakai di seluruh aplikasi.</p></div></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 [&_input]:mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-[var(--line)] [&_input]:px-3 [&_input]:py-3 [&_input]:outline-none [&_input]:focus:border-[var(--brand)] [&_textarea]:mt-2 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-[var(--line)] [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:outline-none [&_textarea]:focus:border-[var(--brand)]">
        <label className="block text-sm font-bold sm:col-span-2">Nama lengkap<input required name="full_name" defaultValue={profile?.full_name || ""} placeholder="Nama kamu"/></label>
        <label className="block text-sm font-bold sm:col-span-2">Email akun<div className="relative"><Mail className="pointer-events-none absolute left-3 top-5 text-[var(--muted)]" size={16}/><input disabled value={user?.email || profile?.email || ""} className="pl-9 !bg-[#f7f8f5] !text-[var(--muted)]"/></div><span className="mt-1.5 block text-xs font-normal text-[var(--muted)]">Email dikelola oleh akun login Supabase agar tetap aman.</span></label>
        <label className="block text-sm font-bold">Universitas<input required name="university" defaultValue={profile?.university || ""} placeholder="Nama universitas"/></label>
        <label className="block text-sm font-bold">Program studi<input required name="major" defaultValue={profile?.major || ""} placeholder="Program studi"/></label>
        <label className="block text-sm font-bold">NIM<input name="student_id" defaultValue={profile?.student_id || ""} placeholder="Contoh: 41523110001"/></label>
        <label className="block text-sm font-bold">Nomor WhatsApp<input name="phone" inputMode="tel" defaultValue={profile?.phone || ""} placeholder="Contoh: 0812..."/></label>
        <label className="block text-sm font-bold sm:col-span-2">Bio singkat<textarea name="bio" rows={4} defaultValue={profile?.bio || ""} placeholder="Contoh: Mahasiswa aktif yang sedang menyeimbangkan kuliah, organisasi, dan proyek."/><span className="mt-1.5 block text-xs font-normal text-[var(--muted)]">Maksimal 280 karakter.</span></label>
      </div>
      <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white hover:bg-[var(--brand-dark)]"><GraduationCap size={17}/> Simpan profil</button>
    </form>
  </div>;
}
