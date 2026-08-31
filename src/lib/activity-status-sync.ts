import { format } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Automatically transitions activities from "belum_mulai" to "on_progress"
 * when their scheduled date (tanggal_mulai or deadline) and time have arrived.
 * Status "selesai" is NEVER set automatically — it is only updated when the user explicitly completes it.
 */
export async function syncActivityProgressStatuses(supabase: SupabaseClient, userId: string) {
  try {
    const now = new Date();
    const currentDate = format(now, "yyyy-MM-dd");
    const currentTime = format(now, "HH:mm");

    // 1. Kegiatan with tanggal_mulai in the past OR (today and jam_deadline <= current time or no time)
    // 2. Kegiatan with deadline in the past OR (today and jam_deadline <= current time or no time)
    // Query activities that are still "belum_mulai"
    const { data: pendingActivities, error } = await supabase
      .from("activities")
      .select("id, tanggal_mulai, deadline, jam_deadline, status")
      .eq("user_id", userId)
      .eq("status", "belum_mulai");

    if (error || !pendingActivities || pendingActivities.length === 0) {
      return;
    }

    const idsToStart: string[] = [];

    for (const item of pendingActivities) {
      const scheduleDate = item.tanggal_mulai || item.deadline;
      if (!scheduleDate) continue;

      if (scheduleDate < currentDate) {
        // Date has already passed
        idsToStart.push(item.id);
      } else if (scheduleDate === currentDate) {
        // Date is today
        if (!item.jam_deadline) {
          // If no specific hour, it's today so mark as running/on_progress
          idsToStart.push(item.id);
        } else if (item.jam_deadline <= currentTime) {
          // Time has arrived or passed
          idsToStart.push(item.id);
        }
      }
    }

    if (idsToStart.length > 0) {
      await supabase
        .from("activities")
        .update({ status: "on_progress" })
        .in("id", idsToStart)
        .eq("user_id", userId);
    }
  } catch (err) {
    console.error("Error auto-syncing activity statuses:", err);
  }
}
