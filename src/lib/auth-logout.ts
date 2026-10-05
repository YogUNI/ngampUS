import { createClient } from "@/lib/supabase/client";

/**
 * Robust global sign out utility for ngampUS.
 * 1. Invokes client-side Supabase signOut() to clear in-memory state & localStorage.
 * 2. Calls POST /api/auth/logout to invalidate session on Supabase server and nuke cookies.
 * 3. Clears local storage session & activity markers.
 * 4. Navigates cleanly using window.location.replace to completely reset Next.js client router cache.
 */
export async function performSignOut(redirectUrl = "/login") {
  try {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  } catch {}

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  } catch {}

  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ngampus_last_active_ts");
      sessionStorage.removeItem("ngampus-splash-shown");
      // Clear any cached Supabase auth tokens in localStorage as well
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") || key.includes("supabase.auth"))) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch {}

  // Hard reload/redirect to ensure router cache is 100% purged
  if (typeof window !== "undefined") {
    window.location.replace(redirectUrl);
  }
}
