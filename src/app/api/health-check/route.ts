import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, apiLimiter } from "@/lib/rate-limiter";
import { getClientIP } from "@/lib/security";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Rate-limit the health-check to prevent enumeration / abuse
  const ip = getClientIP(request.headers);
  const limited = rateLimit(ip, apiLimiter);
  if (!limited.success) {
    return NextResponse.json({ status: "maintenance" }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    const isMaintenance = data?.value === true;

    if (isMaintenance) {
      return NextResponse.json({ status: "maintenance" }, { status: 503 });
    }

    return NextResponse.json({ status: "healthy" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "maintenance" }, { status: 503 });
  }
}
