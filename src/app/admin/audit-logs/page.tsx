import { createClient } from "@/lib/supabase/server";
import { AuditLogClient, AuditLogItem } from "./audit-log-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Trail & Log Aktivitas | ngampUS Admin",
  description: "Rekam jejak real-time setiap aksi dan kendali sistem oleh Superadmin.",
};

export default async function AdminAuditLogsPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <AuditLogClient
      initialLogs={(logs as AuditLogItem[]) || []}
      dbError={Boolean(error)}
    />
  );
}

