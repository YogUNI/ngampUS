"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function StandaloneRedirectGuard() {
  const router = useRouter();

  useEffect(() => {
    // Check if the current context is running as an installed PWA (Standalone app mode)
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
       (window.navigator as unknown as { standalone?: boolean }).standalone === true);

    if (isStandalone) {
      // Check if user already has an active session
      const checkAndRedirect = async () => {
        try {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            router.replace("/dashboard");
          } else {
            router.replace("/login");
          }
        } catch {
          router.replace("/login");
        }
      };

      checkAndRedirect();
    }
  }, [router]);

  return null;
}
