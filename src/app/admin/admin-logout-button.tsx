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
      title="Keluar dari Superadmin Console"
      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
    >
      <LogOut size={13} />
      <span className="hidden sm:inline">Keluar</span>
    </button>
  );
}
