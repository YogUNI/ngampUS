import { createClient } from "@/lib/supabase/server";

export type AuditActionType =
  | "TOGGLE_SYSTEM_SETTING"
  | "UPDATE_USER_ROLE"
  | "CREATE_ANNOUNCEMENT"
  | "TOGGLE_ANNOUNCEMENT"
  | "DELETE_ANNOUNCEMENT";

export async function logAdminActivity(params: {
  actionType: AuditActionType;
  description: string;
  details?: Record<string, any>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Async record into admin_audit_logs table (safe fallback if table doesn't exist yet)
    await supabase.from("admin_audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email || "unknown_superadmin",
      action_type: params.actionType,
      description: params.description,
      details: params.details || {},
    });
  } catch (err) {
    // Non-blocking log to ensure admin action never fails because of logger
    console.warn("Failed to log admin activity:", err);
  }
}
