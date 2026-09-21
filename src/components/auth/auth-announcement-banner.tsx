import { createClient } from "@/lib/supabase/server";
import { AlertTriangle, Wrench, Megaphone, Info } from "lucide-react";

export async function AuthAnnouncementBanner() {
  const supabase = await createClient();

  // Query active public broadcast announcements (warning or maintenance) that are either global or critical
  const { data: announcements } = await supabase
    .from("broadcast_announcements")
    .select("id, judul, pesan, tipe, is_emergency_sticky, expires_at")
    .eq("is_active", true)
    .in("tipe", ["warning", "maintenance"])
    .order("created_at", { ascending: false })
    .limit(1);

  const announcement = announcements?.[0];

  if (!announcement) return null;

  // Check expiration if present
  if (announcement.expires_at && new Date(announcement.expires_at) < new Date()) {
    return null;
  }

  const isMaintenance = announcement.tipe === "maintenance";

  return (
    <div
      role="alert"
      className={`w-full border-b px-4 py-3 text-xs sm:text-sm font-medium transition-all ${
        isMaintenance
          ? "border-rose-500/30 bg-rose-950/80 text-rose-200"
          : "border-amber-500/30 bg-amber-950/80 text-amber-200"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {isMaintenance ? (
            <Wrench size={16} className="shrink-0 text-rose-400" />
          ) : (
            <AlertTriangle size={16} className="shrink-0 text-amber-400" />
          )}
          <div className="truncate">
            <span className="font-black uppercase tracking-wider font-mono mr-2 text-[10px] px-1.5 py-0.5 rounded bg-white/10">
              {isMaintenance ? "MAINTENANCE NOTICE" : "SYSTEM ADVISORY"}
            </span>
            <strong className="font-bold text-white mr-1.5">{announcement.judul}:</strong>
            <span className="opacity-90">{announcement.pesan}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
