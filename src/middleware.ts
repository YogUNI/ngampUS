import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, authLimiter, apiLimiter, otpLimiter } from "@/lib/rate-limiter";
import { getClientIP, isMaliciousBot } from "@/lib/security";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/kegiatan",
  "/jadwal",
  "/modul",
  "/organisasi",
  "/semester",
  "/rekap",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

// Rate-limited paths with their limiter configs
const RATE_LIMITED_AUTH = ["/login", "/register", "/forgot-password", "/reset-password"];
const RATE_LIMITED_OTP = ["/forgot-password", "/reset-password"];

/** Attach security response headers (belt-and-suspenders on top of next.config.ts) */
function attachSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("X-DNS-Prefetch-Control", "off");
  res.headers.set("X-Download-Options", "noopen");
  return res;
}

/** Build a 429 Too Many Requests response */
function tooManyRequests(retryAfter: number): NextResponse {
  const res = NextResponse.json(
    { error: "Terlalu banyak permintaan. Coba lagi nanti.", retryAfter },
    { status: 429 }
  );
  res.headers.set("Retry-After", String(retryAfter));
  return attachSecurityHeaders(res);
}

/** Build a 403 Forbidden response */
function forbidden(reason = "Akses ditolak."): NextResponse {
  return attachSecurityHeaders(
    NextResponse.json({ error: reason }, { status: 403 })
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request.headers);
  const ua = request.headers.get("user-agent") || "";

  // ── 0. Block known malicious bots / scanners ───────────────────────────────
  if (isMaliciousBot(ua)) {
    return forbidden("Bot tidak diizinkan.");
  }

  // ── 1. Rate-limit auth pages (HTML page loads AND POST submissions) ─────────
  const isAuthPath = RATE_LIMITED_AUTH.some((p) => pathname.startsWith(p));
  if (isAuthPath) {
    const limiter = RATE_LIMITED_OTP.some((p) => pathname.startsWith(p))
      ? otpLimiter
      : authLimiter;
    const result = rateLimit(ip, limiter);
    if (!result.success) {
      // For HTML page routes, redirect to login with an error param
      if (!pathname.startsWith("/api")) {
        const url = new URL("/login", request.url);
        url.searchParams.set("error", "rate_limited");
        const res = NextResponse.redirect(url);
        res.headers.set("Retry-After", String(result.retryAfter));
        return attachSecurityHeaders(res);
      }
      return tooManyRequests(result.retryAfter);
    }
  }

  // ── 2. Rate-limit API routes ────────────────────────────────────────────────
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/health-check")) {
    const result = rateLimit(`api:${ip}`, apiLimiter);
    if (!result.success) {
      return tooManyRequests(result.retryAfter);
    }
  }

  // ── 3. Build Supabase client and refresh session ────────────────────────────
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return attachSecurityHeaders(response);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
          })
        );
      },
    },
  });

  // Always use getUser() — never getSession() — for server-side auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch user profile once (reduces DB roundtrips from 3-4x down to 1x per request)
  let userProfile: { role?: string; is_suspended?: boolean } | null = null;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role, is_suspended")
      .eq("id", user.id)
      .maybeSingle();
    userProfile = prof;

    // ── 3b. Account Suspension Check ──────────────────────────────────────────
    // If account has been suspended by superadmin, reject access & redirect to login
    const isSuspended = userProfile?.is_suspended === true || userProfile?.role === "suspended";
    if (isSuspended && !pathname.startsWith("/login")) {
      const suspUrl = new URL("/login", request.url);
      suspUrl.searchParams.set("error", "suspended");
      return attachSecurityHeaders(NextResponse.redirect(suspUrl));
    }
  }

  const isSuperadmin = userProfile?.role === "superadmin";

  // ── 4. Maintenance Mode Check ───────────────────────────────────────────────
  const isMaintenanceExempt =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/api/health-check");

  if (!isMaintenanceExempt) {
    const { data: settingData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (settingData?.value === true && !isSuperadmin) {
      return attachSecurityHeaders(
        NextResponse.redirect(new URL("/maintenance", request.url))
      );
    }
  }

  // ── 5. Protected Routes: require authentication ─────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return attachSecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  // ── 6. Admin Routes: superadmin only ───────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return attachSecurityHeaders(NextResponse.redirect(redirectUrl));
    }

    if (!isSuperadmin) {
      return attachSecurityHeaders(
        NextResponse.redirect(new URL("/dashboard", request.url))
      );
    }
  }

  // ── 7. Strict Isolation: superadmin → redirect out of student workspace ─────
  if (user && isProtected && isSuperadmin) {
    return attachSecurityHeaders(
      NextResponse.redirect(new URL("/admin", request.url))
    );
  }

  // ── 8. Root redirect for superadmin ────────────────────────────────────────
  if (user && pathname === "/" && isSuperadmin) {
    return attachSecurityHeaders(
      NextResponse.redirect(new URL("/admin", request.url))
    );
  }

  // ── 9. Auth routes: redirect logged-in users away ──────────────────────────
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && user) {
    if (isSuperadmin) {
      return attachSecurityHeaders(
        NextResponse.redirect(new URL("/admin", request.url))
      );
    }
    return attachSecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url))
    );
  }

  return attachSecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$).*)",
  ],
};
