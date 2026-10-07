import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { rateLimit, loginIpLimiter, loginAccountLimiter } from "@/lib/rate-limiter";
import { getClientIP, isMaliciousBot } from "@/lib/security";

const loginRequestSchema = z.object({
  email: z.string().trim().email("Format email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export async function POST(request: NextRequest) {
  const ip = getClientIP(request.headers);
  const ua = request.headers.get("user-agent") || "";

  // 1. Bot & Scanner Protection
  if (isMaliciousBot(ua)) {
    return NextResponse.json({ error: "Permintaan ditolak." }, { status: 403 });
  }

  // 2. Parse & Validate Payload
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const parsed = loginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Input tidak valid." },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // 3. Strict Rate Limiting: By IP (Max 5 attempts / 5 mins)
  const ipLimitResult = rateLimit(ip, loginIpLimiter);
  if (!ipLimitResult.success) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan masuk dari perangkat ini. Silakan coba lagi dalam ${ipLimitResult.retryAfter} detik.`,
        retryAfter: ipLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimitResult.retryAfter) },
      }
    );
  }

  // 4. Strict Rate Limiting: By Account Email (Max 5 attempts / 5 mins across all IPs)
  const accountLimitResult = rateLimit(normalizedEmail, loginAccountLimiter);
  if (!accountLimitResult.success) {
    return NextResponse.json(
      {
        error: `Akun ini terkunci sementara karena terlalu banyak percobaan masuk gagal. Silakan coba lagi dalam ${accountLimitResult.retryAfter} detik.`,
        retryAfter: accountLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(accountLimitResult.retryAfter) },
      }
    );
  }

  // 5. Build Server-Side Supabase Client with Session Cookies
  const cookieStore = await cookies();
  let response = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => cookieStore.set(name, value));
          response = NextResponse.json({ success: true });
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
    }
  );

  // 6. Execute Supabase signInWithPassword
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user || !data.session) {
    return NextResponse.json(
      {
        error:
          error?.message === "Email not confirmed"
            ? "Email belum dikonfirmasi. Silakan periksa inbox/spam email Anda untuk memverifikasi akun."
            : error?.message || "Email atau kata sandi salah. Silakan coba lagi.",
      },
      { status: 401 }
    );
  }

  // 7. Check Profile Role for target route
  let role = "student";
  try {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    if (prof?.role) role = prof.role;
  } catch {}

  // 8. Reject suspended account
  if (role === "suspended") {
    // Revoke session immediately
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Akun Anda telah ditangguhkan oleh administrator. Hubungi bantuan untuk pemulihan." },
      { status: 403 }
    );
  }

  // Return success payload and cookie headers
  const targetPath = role === "superadmin" ? "/admin" : "/dashboard";
  const finalResponse = NextResponse.json({
    success: true,
    user: { id: data.user.id, email: data.user.email, role },
    targetPath,
  });

  // Copy updated cookies to finalResponse
  response.cookies.getAll().forEach((c) => {
    finalResponse.cookies.set(c.name, c.value, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  });

  return finalResponse;
}
