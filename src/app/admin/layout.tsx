import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "./admin-logout-button";
import { AdminNav } from "./admin-nav";

export const metadata = {
  title: "Superadmin Portal | ngampUS",
  description: "Pusat kontrol dan pemantauan platform ngampUS.",
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
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ── Top Executive Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between gap-4">
            
            {/* Left: Brand Identity & Environment Tag */}
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2.5 group">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20 transition">
                  <ShieldCheck size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-black tracking-tight text-white">
                      ngamp<span className="text-emerald-400">US</span>
                    </span>
                    <span className="rounded-md border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase text-slate-300">
                      Admin
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Middle: Primary Navigation Tabs */}
            <div className="hidden lg:flex items-center">
              <AdminNav />
            </div>

            {/* Right: Quick Status & User Profile */}
            <div className="flex items-center gap-3">
              {/* System Health Indicator */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Production</span>
              </div>

              {/* User Dropdown / Meta */}
              <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-white leading-tight">
                    {profile?.full_name || "Super Administrator"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                    {user.email}
                  </p>
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400">
                  {profile?.full_name ? profile.full_name[0].toUpperCase() : "A"}
                </div>
                <AdminLogoutButton />
              </div>

            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="lg:hidden border-t border-slate-800/60 py-2">
            <AdminNav />
          </div>
        </div>
      </header>

      {/* ── Main Dashboard Canvas ── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* ── Executive Footer ── */}
      <footer className="border-t border-slate-800/80 bg-[#070A0F] px-4 py-4 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] text-slate-400">PostgreSQL RLS Protected • Zero-Student-Access Enforced</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500">
            ngampUS Executive Control Center • v1.0 Production
          </p>
        </div>
      </footer>
    </div>
  );
}
