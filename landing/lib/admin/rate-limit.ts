// ── Login rate limiting ──────────────────────────────────────────────────────
// Sliding-window counter kept in module memory. On serverless this protects
// each warm instance (best-effort brute-force slowdown); a shared store
// (Upstash/Redis) can replace `hit` later without touching callers. The scrypt
// cost itself is the second layer of brute-force resistance.

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 8;

export function hit(key: string): { allowed: boolean; retryAfterS: number } {
  const now = Date.now();
  // Opportunistic cleanup so the map never grows unbounded.
  if (buckets.size > 5000) {
    for (const [k, w] of buckets) if (w.resetAt < now) buckets.delete(k);
  }
  const w = buckets.get(key);
  if (!w || w.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterS: 0 };
  }
  w.count += 1;
  if (w.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfterS: Math.ceil((w.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfterS: 0 };
}

export function clear(key: string): void {
  buckets.delete(key);
}
