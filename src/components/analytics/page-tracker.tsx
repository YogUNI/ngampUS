"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Generate or retrieve persistent visitor ID per browser session
function getVisitorId(): string {
  if (typeof window === "undefined") return "guest";
  try {
    let vid = localStorage.getItem("ngampus_vid");
    if (!vid) {
      vid = "v_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now().toString(36);
      localStorage.setItem("ngampus_vid", vid);
    }
    return vid;
  } catch {
    return "guest_" + Math.random().toString(36).substring(2, 8);
  }
}

function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function detectBrowser(): string {
  if (typeof window === "undefined") return "Browser";
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return "Microsoft Edge";
  if (/chrome|crios/i.test(ua)) return "Google Chrome";
  if (/firefox|fxios/i.test(ua)) return "Mozilla Firefox";
  if (/safari/i.test(ua)) return "Apple Safari";
  if (/opera|opr/i.test(ua)) return "Opera";
  return "Mobile Web";
}

export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    // Avoid double counting and ignore /admin & internal paths
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return;
    }

    const fullPath = searchParams && searchParams.toString() 
      ? `${pathname}?${searchParams.toString()}` 
      : pathname;

    if (lastTrackedPath.current === fullPath) {
      return;
    }
    lastTrackedPath.current = fullPath;

    const visitorId = getVisitorId();
    const deviceType = detectDevice();
    const browser = detectBrowser();
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    const payload = JSON.stringify({
      path: pathname,
      deviceType,
      browser,
      referrer,
      visitorId,
    });

    // Use sendBeacon if available for zero-lag background sending, fallback to fetch with keepalive
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/telemetry/view", blob);
    } else {
      fetch("/api/telemetry/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname, searchParams]);

  return null;
}
