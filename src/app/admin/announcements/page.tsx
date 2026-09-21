import { createClient } from "@/lib/supabase/server";
import { AnnouncementClientManager } from "./announcement-client";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("broadcast_announcements")
    .select("id, judul, pesan, tipe, tautan, is_active, created_at")
    .order("created_at", { ascending: false });

  return <AnnouncementClientManager initialAnnouncements={announcements || []} />;
}
