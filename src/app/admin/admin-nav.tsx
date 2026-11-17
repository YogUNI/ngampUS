"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Globe, 
  Users, 
  Cpu, 
  Megaphone, 
  SlidersHorizontal, 
  Activity 
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Web Traffic", href: "/admin/web-analytics", icon: Globe },
  { name: "Mahasiswa", href: "/admin/users", icon: Users },
  { name: "AI Engine", href: "/admin/ai-gateway", icon: Cpu },
  { name: "Broadcast", href: "/admin/announcements", icon: Megaphone },
  { name: "System Controls", href: "/admin/system-controls", icon: SlidersHorizontal },
  { name: "Audit Trail", href: "/admin/audit-logs", icon: Activity },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/admin" 
          ? pathname === "/admin" 
          : pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              isActive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
            }`}
          >
            <Icon size={14} className={isActive ? "text-emerald-400" : "text-slate-400"} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
