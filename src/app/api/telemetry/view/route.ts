import { NextResponse, type NextRequest } from "next/server";
import { recordPageView } from "@/lib/web-telemetry";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.path) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // Do not record internal admin route traffic to avoid skewed stats
    if (body.path.startsWith("/admin") || body.path.startsWith("/api")) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // Determine device type
    const userAgent = request.headers.get("user-agent") || "";
    let deviceType: "mobile" | "tablet" | "desktop" = "desktop";
    if (body.deviceType) {
      deviceType = body.deviceType;
    } else {
      if (/tablet|ipad/i.test(userAgent)) {
        deviceType = "tablet";
      } else if (/mobile|android|iphone/i.test(userAgent)) {
        deviceType = "mobile";
      }
    }

    // Parse friendly browser name
    let browser = body.browser || "Other";
    if (!body.browser) {
      if (/edg/i.test(userAgent)) browser = "Microsoft Edge";
      else if (/chrome|crios/i.test(userAgent)) browser = "Google Chrome";
      else if (/firefox|fxios/i.test(userAgent)) browser = "Mozilla Firefox";
      else if (/safari/i.test(userAgent)) browser = "Apple Safari";
      else if (/opera|opr/i.test(userAgent)) browser = "Opera";
    }

    // Clean Referrer
    let referrer = body.referrer || "";
    if (referrer) {
      try {
        const refUrl = new URL(referrer);
        if (refUrl.hostname.includes("instagram")) referrer = "Instagram";
        else if (refUrl.hostname.includes("whatsapp") || refUrl.hostname.includes("wa.me")) referrer = "WhatsApp";
        else if (refUrl.hostname.includes("tiktok")) referrer = "TikTok";
        else if (refUrl.hostname.includes("google")) referrer = "Google Search";
        else if (refUrl.hostname.includes("ngampus.site") || refUrl.hostname.includes("localhost")) referrer = "Internal";
        else referrer = refUrl.hostname;
      } catch {
        referrer = "External Link";
      }
    } else {
      referrer = "Direct / Link Sosmed";
    }

    // Run non-blocking record
    await recordPageView({
      path: body.path,
      deviceType,
      browser,
      referrer,
      visitorId: body.visitorId || "anon_guest",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
