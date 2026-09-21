import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  Cpu,
  SlidersHorizontal,
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "./admin-logout-button";

export const metadata = {
  title: "Superadmin Command Console | ngampUS",
  description: "Pusat komando dan pemantauan platform ngampUS.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  // Strict Server Guard
  if (profile?.role !== "superadmin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#071710] text-[#edf4ef] flex flex-col selection:bg-[#c8ef70] selection:text-[#103626]">
      {/* ── Top Command Bar ── */}
      <header className="sticky top-0 z-50 border-b border-[#183929] bg-[#0c2419]/90 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Mode Tag */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#c8ef70] text-[#103626] font-black shadow-xs">
                <ShieldAlert size={20} strokeWidth={2.5} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-base sm:text-lg font-black tracking-tight text-white">
                    ngamp<span className="text-[#c8ef70]">US</span> Admin
                  </span>
                  <span className="rounded-md border border-[#c8ef70]/40 bg-[#c8ef70]/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#d6f792]">
                    ROOT CONSOLE
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition"
            >
              <LayoutDashboard size={15} className="text-[#c8ef70]" />
              <span>Overview</span>
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition"
            >
              <Users size={15} className="text-[#c8ef70]" />
              <span>Mahasiswa</span>
            </Link>
            <Link
              href="/admin/ai-gateway"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition"
            >
              <Cpu size={15} className="text-[#c8ef70]" />
              <span>AI Engine</span>
            </Link>
            <Link
              href="/admin/announcements"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition"
            >
              <Megaphone size={15} className="text-[#c8ef70]" />
              <span>Broadcast</span>
            </Link>
            <Link
              href="/admin/system-controls"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition"
            >
              <SlidersHorizontal size={15} className="text-[#c8ef70]" />
              <span>Controls</span>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#edf4ef] hover:bg-white/10 transition"
            >
              <Activity size={15} className="text-[#c8ef70]" />
              <span>Audit Log</span>
            </Link>
          </nav>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 border-l border-white/15 pl-3">
            <div className="text-right hidden md:block">
              <p className="text-xs font-extrabold text-white leading-tight">
                {profile?.full_name || "Super Administrator"}
              </p>
              <p className="text-[10px] text-[#9dc5aa] font-mono">
                {user.email}
              </p>
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#1b4332] text-xs font-black text-[#c8ef70] ring-1 ring-white/20">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : "A"}
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {/* ── Main Content Shell ── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#183929] bg-[#091b13] px-4 py-4 text-center text-xs text-[#789a84]">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="font-mono text-[11px]">System Status: All Engines Operational</span>
          </div>
          <p className="text-[11px]">
            ngampUS Platform Control Center • Internal Use Only
          </p>
        </div>
      </footer>
    </div>
  );
}
