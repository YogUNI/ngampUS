import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
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
