/**
 * Rate limiter (T015, FR-024, SC-016) — fixed-window counter per client key.
 *
 * In-process: on Liara each instance limits its own share, which is the honest
 * tradeoff for a stateless app with no shared store. Combined with the token
 * budget per session it bounds cost adequately for MVP.
 * ponytail: move to Redis / Liara edge rules if instances exceed ~3.
 */
import { getConfig } from './config';
import { logMetric } from './metrics';

interface Window {
  count: number;
  resetAt: number;
}

// Next.js compiles each API route as its own bundle; pin the window map on
// globalThis so all routes share one bucket per client instead of forking.
const g = globalThis as typeof globalThis & {
  __rateLimitWindows?: Map<string, Window>;
  __rateLimitLastSweep?: number;
};
const windows = (g.__rateLimitWindows ??= new Map<string, Window>());
let lastSweep = (g.__rateLimitLastSweep ??= Date.now());

/** Best-effort client identity: proxy header chain, else session id. */
export function clientKey(headers: Headers, sessionId?: string): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const real = headers.get('x-real-ip')?.trim();
  return forwarded || real || sessionId || 'anonymous';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  limit: number;
}

/** Consume one unit for `key`. O(1); sweeps expired windows once a minute. */
export function checkRateLimit(key: string): RateLimitResult {
  const { rateLimit } = getConfig();
  const now = Date.now();

  if (now - lastSweep > 60_000) {
    for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
    lastSweep = now;
  }

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + rateLimit.windowMs });
    return { allowed: true, remaining: rateLimit.max - 1, retryAfterMs: 0, limit: rateLimit.max };
  }
  if (existing.count >= rateLimit.max) {
    logMetric({ kind: 'rate_limit', key: key.slice(0, 40) });
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: existing.resetAt - now,
      limit: rateLimit.max,
    };
  }
  existing.count++;
  return {
    allowed: true,
    remaining: rateLimit.max - existing.count,
    retryAfterMs: 0,
    limit: rateLimit.max,
  };
}

/** Standard rate-limit headers for a response. */
export function rateLimitHeaders(r: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(r.limit),
    'X-RateLimit-Remaining': String(r.remaining),
  };
  if (!r.allowed) headers['Retry-After'] = String(Math.ceil(r.retryAfterMs / 1000));
  return headers;
}
