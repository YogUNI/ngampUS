"use client";

import { LogOut } from "lucide-react";
import { performSignOut } from "@/lib/auth-logout";

export function AdminLogoutButton() {
  async function handleSignOut() {
    await performSignOut("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      title="Keluar dari Superadmin Portal"
      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition cursor-pointer active:scale-[0.98]"
    >
      <LogOut size={13} />
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}
