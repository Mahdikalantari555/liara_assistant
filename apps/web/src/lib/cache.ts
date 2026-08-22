/**
 * Query cache (T017, T062, FR-026, SC-020) — in-process TTL + LRU.
 *
 * Cost control first: a repeated question costs zero LLM tokens. Per-instance by
 * design; a shared Redis would add a service and a bill for a 30%-hit-rate
 * optimisation. ponytail: swap `Map` for a Redis client if instances exceed ~3
 * and the hit rate matters more than the dependency.
 */
import { createHash } from 'crypto';
import { getConfig } from './config';

interface Entry<T> {
  value: T;
  expiresAt: number;
}

// Pin on globalThis: per-route bundles must not fork the cache (same reason
// as escalation/rate-limit stores).
const g = globalThis as typeof globalThis & { __queryCache?: Map<string, Entry<unknown>> };
const store = (g.__queryCache ??= new Map<string, Entry<unknown>>());

/** Stable cache key: normalized question + conversation topic. */
export function cacheKey(question: string, topic = ''): string {
  const normalized = question.trim().toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha1').update(`${topic}\u0000${normalized}`).digest('hex');
}

export function cacheGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  // Refresh recency for LRU eviction.
  store.delete(key);
  store.set(key, hit);
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T): void {
  const { cache } = getConfig();
  store.set(key, { value, expiresAt: Date.now() + cache.ttlMs });
  while (store.size > cache.maxEntries) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
}

export function cacheSize(): number {
  return store.size;
}

/** Test/ops helper. */
export function cacheClear(): void {
  store.clear();
}
