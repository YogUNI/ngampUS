import type { NextConfig } from "next";

// ─── Content Security Policy ──────────────────────────────────────────────────
// 'unsafe-eval' is required by Next.js Turbopack and React hydration.
// 'unsafe-inline' is required by Tailwind CSS (inline styles).
// frame-ancestors + object-src 'none' prevents clickjacking and plugin injection.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  script-src-elem 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  style-src-elem 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'none';
  worker-src 'self' blob:;
  manifest-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com;
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  // Prevent browsers from MIME-sniffing the declared Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Block this site from being embedded in any frame (clickjacking defence)
  { key: "X-Frame-Options", value: "DENY" },

  // Don't send the full URL as a Referer to third-party sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Disable browser features that this app doesn't use
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "browsing-topics=()",
      "interest-cohort=()",
      "payment=()",
      "usb=()",
      "autoplay=(self)",
    ].join(", "),
  },

  // Force HTTPS for 2 years, including subdomains, add to preload list
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },

  // Prevent cross-origin window.opener access (tab-napping defence)
  // safe-origin-allow-popups lets links open in new tabs without opener access
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },

  // Block Flash / PDF cross-domain policy files
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },

  // Disable DNS prefetching to prevent information leakage
  { key: "X-DNS-Prefetch-Control", value: "off" },

  // Prevent IE from opening downloads in the same process (legacy)
  { key: "X-Download-Options", value: "noopen" },

  // Strict Content-Security-Policy
  { key: "Content-Security-Policy", value: cspHeader },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  // Disable the X-Powered-By: Next.js header (fingerprint reduction)
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Apply security headers to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Service worker needs broader scope
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        // PWA manifest
        source: "/manifest.json",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
