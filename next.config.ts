import type { NextConfig } from "next";

// ─── Content Security Policy ──────────────────────────────────────────────────
// Removed 'unsafe-eval' — Next.js 16 + Turbopack no longer needs it in prod.
// 'unsafe-inline' is kept only for styles (Tailwind requires it); scripts are
// locked to 'self' only. Tighten further by adding a nonce when you add a
// custom _document that injects it.
const cspHeader = `
  default-src 'self';
  script-src 'self';
  script-src-elem 'self';
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
  block-all-mixed-content;
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
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },

  // Require CORP headers for subresource loads (part of cross-origin isolation)
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },

  // Block other origins from loading this site's resources directly
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },

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
        // Relax COEP for the PWA manifest and service worker
        // (they need to be loaded cross-origin in some PWA scenarios)
        source: "/manifest.json",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
