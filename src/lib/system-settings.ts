import { createClient } from "@/lib/supabase/server";

export interface SystemFlags {
  maintenance_mode: boolean;
  ai_service_active: boolean;
  registration_active: boolean;
  updated_at?: string;
  updated_by_email?: string;
}

// Default fallback flags if database table is not yet created or unreachable
const DEFAULT_FLAGS: SystemFlags = {
  maintenance_mode: false,
  ai_service_active: true,
  registration_active: true,
};

export async function getSystemFlags(): Promise<SystemFlags> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("system_settings")
      .select("key, value, updated_at, updated_by_email");

    if (error || !data || data.length === 0) {
      return DEFAULT_FLAGS;
    }

    const flags: SystemFlags = { ...DEFAULT_FLAGS };
    let latestUpdatedAt: string | undefined = undefined;
    let latestUpdatedBy: string | undefined = undefined;

    for (const item of data) {
      if (item.key === "maintenance_mode") {
        flags.maintenance_mode = Boolean(item.value);
      } else if (item.key === "ai_service_active") {
        flags.ai_service_active = Boolean(item.value);
      } else if (item.key === "registration_active") {
        flags.registration_active = Boolean(item.value);
      }

      if (item.updated_at && (!latestUpdatedAt || item.updated_at > latestUpdatedAt)) {
        latestUpdatedAt = item.updated_at;
        latestUpdatedBy = item.updated_by_email;
      }
    }

    flags.updated_at = latestUpdatedAt;
    flags.updated_by_email = latestUpdatedBy;

    return flags;
  } catch (err) {
    console.warn("Failed to fetch system_settings, using defaults:", err);
    return DEFAULT_FLAGS;
  }
}
