import { NextResponse, type NextRequest } from "next/server";
import { recordPageView } from "@/lib/web-telemetry";
import { rateLimit, telemetryLimiter } from "@/lib/rate-limiter";
import { getClientIP, safeReadJson, sanitizeString, sanitizeUrl } from "@/lib/security";

export const dynamic = "force-dynamic";

/** Allowed origins for the telemetry endpoint */
const ALLOWED_ORIGINS = [
  "https://ngampus.site",
  "https://www.ngampus.site",
  ...(process.env.NODE_ENV === "development"
    ? ["http://localhost:3000", "http://localhost:3001"]
    : []),
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

/** Handle CORS preflight */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const ip = getClientIP(request.headers);

  // ── 1. Origin validation ────────────────────────────────────────────────────
  // Allow requests from same-origin (no Origin header) or known origins only
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { ok: false, error: "Origin tidak diizinkan." },
      { status: 403, headers: corsHeaders(origin) }
    );
  }

  // ── 2. Rate limiting ────────────────────────────────────────────────────────
  const limited = rateLimit(ip, telemetryLimiter);
  if (!limited.success) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded." },
      {
        status: 429,
        headers: {
          ...corsHeaders(origin),
          "Retry-After": String(limited.retryAfter),
        },
      }
    );
  }

  // ── 3. Parse + validate body (max 8 KB) ────────────────────────────────────
  const body = await safeReadJson(request, 8192);
  if (!body || typeof body.path !== "string" || !body.path.trim()) {
    return NextResponse.json(
      { ok: false, error: "Payload tidak valid." },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // ── 4. Sanitize path — must start with / and be reasonable length ──────────
  const rawPath = sanitizeString(body.path, 300);
  if (!rawPath.startsWith("/") || rawPath.length < 1) {
    return NextResponse.json(
      { ok: false, error: "Path tidak valid." },
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Do not record admin/api traffic
  if (rawPath.startsWith("/admin") || rawPath.startsWith("/api")) {
    return NextResponse.json({ ok: true, ignored: true }, { headers: corsHeaders(origin) });
  }

  // ── 5. Device type detection ────────────────────────────────────────────────
  const userAgent = request.headers.get("user-agent") || "";
  const allowedDeviceTypes = ["mobile", "tablet", "desktop"];
  let deviceType: "mobile" | "tablet" | "desktop" = "desktop";

  if (body.deviceType && allowedDeviceTypes.includes(String(body.deviceType))) {
    deviceType = body.deviceType as "mobile" | "tablet" | "desktop";
  } else {
    if (/tablet|ipad/i.test(userAgent)) deviceType = "tablet";
    else if (/mobile|android|iphone/i.test(userAgent)) deviceType = "mobile";
  }

  // ── 6. Browser name (sanitized) ─────────────────────────────────────────────
  const allowedBrowsers = [
    "Google Chrome", "Mozilla Firefox", "Apple Safari",
    "Microsoft Edge", "Opera", "Samsung Internet", "Other",
  ];
  let browser = "Other";
  if (body.browser && allowedBrowsers.includes(String(body.browser))) {
    browser = String(body.browser);
  } else {
    if (/edg/i.test(userAgent)) browser = "Microsoft Edge";
    else if (/chrome|crios/i.test(userAgent)) browser = "Google Chrome";
    else if (/firefox|fxios/i.test(userAgent)) browser = "Mozilla Firefox";
    else if (/safari/i.test(userAgent)) browser = "Apple Safari";
    else if (/opera|opr/i.test(userAgent)) browser = "Opera";
    else if (/samsungbrowser/i.test(userAgent)) browser = "Samsung Internet";
  }

  // ── 7. Referrer (sanitized + normalized) ────────────────────────────────────
  let referrer = "Direct / Link Sosmed";
  const rawReferrer = typeof body.referrer === "string" ? body.referrer.trim() : "";
  if (rawReferrer) {
    const safeRef = sanitizeUrl(rawReferrer);
    if (safeRef) {
      try {
        const refUrl = new URL(safeRef);
        const h = refUrl.hostname;
        if (h.includes("instagram")) referrer = "Instagram";
        else if (h.includes("whatsapp") || h.includes("wa.me")) referrer = "WhatsApp";
        else if (h.includes("tiktok")) referrer = "TikTok";
        else if (h.includes("google")) referrer = "Google Search";
        else if (h.includes("ngampus.site") || h === "localhost") referrer = "Internal";
        else referrer = h.slice(0, 80); // cap hostname length
      } catch {
        referrer = "External Link";
      }
    }
  }

  // ── 8. Visitor ID (sanitized) ───────────────────────────────────────────────
  const rawVisitorId = typeof body.visitorId === "string" ? body.visitorId : "";
  // Allow alphanumeric + hyphen + underscore only, max 64 chars
  const visitorId = rawVisitorId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "anon_guest";

  // ── 9. Record ───────────────────────────────────────────────────────────────
  try {
    await recordPageView({ path: rawPath, deviceType, browser, referrer, visitorId });
    return NextResponse.json({ ok: true }, { headers: corsHeaders(origin) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
