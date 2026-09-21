import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          })
        );
      },
    },
  });

  // Always use getUser() instead of getSession() to securely authenticate against Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 0. Maintenance Mode Check: redirect non-superadmins if maintenance_mode is enabled
  // Exemptions: /admin, /login, /maintenance, /api/health-check, and static assets
  const isMaintenanceExempt = pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/maintenance") || pathname.startsWith("/api/health-check");
  if (!isMaintenanceExempt) {
    const { data: settingData } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();

    if (settingData && settingData.value === true) {
      // Check if user is superadmin (Zero-Lockout)
      let isSuperadmin = false;
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (prof?.role === "superadmin") isSuperadmin = true;
      }

      if (!isSuperadmin) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  }

  // 1. Redirect unauthenticated users attempting to access protected routes
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Protect /admin routes strictly for superadmins
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verify role in public.profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 3. Strict Isolation: Superadmin has ZERO access to student workspace routes (/dashboard, /jadwal, /kegiatan, etc.)
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "superadmin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 4. Redirect root to /admin for superadmin
  if (user && pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "superadmin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 5. Redirect authenticated users attempting to access auth routes (login, register)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && user) {
    // Check if superadmin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "superadmin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 6. Attach security headers at the middleware response level
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
