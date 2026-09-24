/**
 * Edge-compatible in-memory rate limiter.
 *
 * Uses a sliding-window counter per (key, route) pair.
 * Works in Node.js and Next.js Edge Runtime (no external dependencies).
 *
 * Limitations:
 * - State lives in process memory — resets on cold starts / serverless invocations.
 * - For multi-instance production deployments, swap the Map for an external store
 *   (e.g. Upstash Redis with @upstash/ratelimit) without changing call sites.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number; // ms timestamp
}

// Global store — survives across requests within the same process
const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
function maybeCleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60 * 1000) {
    lastCleanup = now;
    for (const [k, v] of store.entries()) {
      if (now - v.windowStart > windowMs * 2) {
        store.delete(k);
      }
    }
  }
}

export interface RateLimitOptions {
  /** Unique string identifying this limiter (e.g. "auth_login", "telemetry") */
  id: string;
  /** Max allowed requests in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Remaining requests in the current window */
  remaining: number;
  /** Seconds until the window resets */
  retryAfter: number;
}

/**
 * Check and increment the rate limit counter for a given identifier.
 *
 * @param key   Caller identity — use IP address or a composite key.
 * @param opts  Limiter configuration.
 */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  maybeCleanup(opts.windowMs);

  const storeKey = `${opts.id}:${key}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now - entry.windowStart >= opts.windowMs) {
    // Start a fresh window
    store.set(storeKey, { count: 1, windowStart: now });
    return { success: true, remaining: opts.limit - 1, retryAfter: 0 };
  }

  entry.count++;

  if (entry.count > opts.limit) {
    const retryAfter = Math.ceil((entry.windowStart + opts.windowMs - now) / 1000);
    return { success: false, remaining: 0, retryAfter };
  }

  return { success: true, remaining: opts.limit - entry.count, retryAfter: 0 };
}

// ─── Pre-configured limiters ─────────────────────────────────────────────────

/** Auth endpoints: 10 attempts per 15 minutes */
export const authLimiter: RateLimitOptions = {
  id: "auth",
  limit: 10,
  windowMs: 15 * 60 * 1000,
};

/** General API endpoints: 60 requests per minute */
export const apiLimiter: RateLimitOptions = {
  id: "api",
  limit: 60,
  windowMs: 60 * 1000,
};

/** Telemetry POST: 120 pings per minute per origin */
export const telemetryLimiter: RateLimitOptions = {
  id: "telemetry",
  limit: 120,
  windowMs: 60 * 1000,
};

/** Admin actions: 30 mutations per 5 minutes */
export const adminLimiter: RateLimitOptions = {
  id: "admin",
  limit: 30,
  windowMs: 5 * 60 * 1000,
};

/** Password reset / OTP: 5 attempts per hour */
export const otpLimiter: RateLimitOptions = {
  id: "otp",
  limit: 5,
  windowMs: 60 * 60 * 1000,
};
