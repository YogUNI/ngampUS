import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { getClientIP } from "@/lib/security";

export type AuditActionType =
  | "TOGGLE_SYSTEM_SETTING"
  | "UPDATE_USER_ROLE"
  | "CREATE_ANNOUNCEMENT"
  | "TOGGLE_ANNOUNCEMENT"
  | "DELETE_ANNOUNCEMENT"
  | "SUSPICIOUS_ACCESS_ATTEMPT"
  | "RATE_LIMIT_HIT"
  | "UNAUTHORIZED_ADMIN_ATTEMPT";

export async function logAdminActivity(params: {
  actionType: AuditActionType;
  description: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Capture caller IP from server-side request headers
    const reqHeaders = await headers();
    const ip = getClientIP(reqHeaders as unknown as Headers);

    await supabase.from("admin_audit_logs").insert({
      actor_id: user.id,
      actor_email: user.email ?? "unknown_superadmin",
      action_type: params.actionType,
      description: params.description,
      details: {
        ...params.details,
        // Enrich every audit event with call metadata
        _meta: {
          ip,
          user_agent: reqHeaders.get("user-agent") ?? "unknown",
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    // Non-blocking — admin actions must never fail due to logger errors
    console.warn("[audit] Failed to log admin activity:", err);
  }
}
