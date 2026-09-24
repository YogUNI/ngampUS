/**
 * Security utilities: input sanitization and safe helpers.
 *
 * Used server-side (Server Actions, API routes) to harden
 * all untrusted input before it touches the database.
 */

// ─── HTML / XSS Sanitization ─────────────────────────────────────────────────

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape all HTML special characters in a string.
 * Use when rendering user-supplied content in HTML without a framework sanitizer.
 */
export function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"'`=/]/g, (c) => HTML_ESCAPE_MAP[c] ?? c);
}

/**
 * Strip all HTML tags from a string, leaving only text content.
 */
export function stripHtml(str: string): string {
  return String(str).replace(/<[^>]*>/g, "");
}

// ─── SQL Injection Patterns ───────────────────────────────────────────────────

/** Characters / keywords associated with SQL injection */
const SQL_INJECTION_PATTERNS = [
  /(\b)(select|insert|update|delete|drop|create|alter|truncate|exec|execute|union|declare|cast|convert|xp_cmdshell|sp_executesql)(\b)/gi,
  /--\s*$/m,               // SQL comment strip
  /\/\*[\s\S]*?\*\//,     // block comment
  /;\s*(drop|delete|insert|update)/gi,
  /'\s*(or|and)\s*'?\d/gi, // classic OR 1=1 bypass
];

/**
 * Returns true if the string contains SQL injection patterns.
 * This is a belt-and-suspenders check — Supabase parameterized queries already
 * prevent injection, but we reject obvious payloads early at the boundary.
 */
export function containsSQLInjection(str: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(str));
}

// ─── Path Traversal ───────────────────────────────────────────────────────────

/**
 * Returns true if the string contains path traversal sequences.
 */
export function containsPathTraversal(str: string): boolean {
  return /(\.\.[/\\]|%2e%2e[/\\%])/i.test(str);
}

// ─── General String Sanitization ─────────────────────────────────────────────

/**
 * Aggressively sanitize a string for safe storage and display:
 * - Strips HTML
 * - Removes null bytes
 * - Normalizes whitespace
 * - Trims to maxLength
 */
export function sanitizeString(str: unknown, maxLength = 500): string {
  if (typeof str !== "string") return "";
  return stripHtml(str)
    .replace(/\0/g, "")              // null bytes
    .replace(/[\r\n\t]+/g, " ")     // normalize newlines / tabs
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize a URL — allow only http:// and https:// schemes.
 * Returns null if the URL is invalid or uses an unsafe scheme.
 */
export function sanitizeUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  try {
    const parsed = new URL(url.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

// ─── Request Helpers ──────────────────────────────────────────────────────────

/**
 * Extract the real client IP from a Next.js NextRequest.
 * Prefers forwarded headers set by trusted reverse proxies (Vercel, Cloudflare).
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||        // Cloudflare
    headers.get("x-real-ip") ||               // nginx proxy
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() || // load balancers
    "unknown"
  );
}

/**
 * Returns true if the User-Agent string belongs to a known malicious bot
 * or script-kiddie scanner.
 */
export function isMaliciousBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const patterns = [
    "sqlmap",         // SQL injection scanner
    "nikto",          // web vuln scanner
    "masscan",        // port scanner
    "nmap",           // network scanner
    "dirbuster",      // directory brute-force
    "gobuster",       // directory brute-force
    "wfuzz",          // fuzzer
    "burpsuite",      // Burp Suite automated scan
    "zgrab",          // banner grabber
    "python-requests/2.2", // old scripted scanner pattern
    "curl/7.1",       // very old curl (scanner signature)
    "acunetix",       // web app scanner
    "netsparker",     // web app scanner
    "openvas",        // vuln scanner
    "hydra",          // brute-force tool
    "medusa",         // brute-force tool
  ];
  return patterns.some((p) => ua.includes(p));
}

/**
 * Read request body as JSON with a hard size cap (default 64 KB).
 * Returns null if body is missing, not JSON, or exceeds the size limit.
 */
export async function safeReadJson(
  request: Request,
  maxBytes = 65536
): Promise<Record<string, unknown> | null> {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > maxBytes) {
      return null; // Reject oversized payloads before reading body
    }

    const text = await request.text();
    if (text.length > maxBytes) return null;

    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}
