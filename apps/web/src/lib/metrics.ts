/**
 * Metrics logger (T016, T055, T061, FR-025/FR-046, SC-038).
 *
 * Transient by design (spec: log-only, no database). Two sinks:
 *  - stdout JSON lines, which Liara collects as app logs
 *  - an in-process rolling window that /api/health exposes as counters
 *
 * Every string passes through `redact()` so no key can reach a log (SC-017/026).
 */
import { getConfig, redact } from './config';

export interface QueryMetric {
  kind: 'query';
  sessionId: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  retrievalMiss: boolean;
  fallbackUsed: boolean;
  clarifying: boolean;
  cacheHit: boolean;
  topScore: number;
  provider: string;
}

export interface FeedbackMetric {
  kind: 'feedback';
  sessionId: string;
  responseId: string;
  type: 'positive' | 'negative';
}

export interface ErrorMetric {
  kind: 'error';
  where: string;
  message: string;
}

export interface RateLimitMetric {
  kind: 'rate_limit';
  key: string;
}

type Metric = QueryMetric | FeedbackMetric | ErrorMetric | RateLimitMetric;

const counters = {
  queries: 0,
  cacheHits: 0,
  retrievalMisses: 0,
  fallbacks: 0,
  clarifications: 0,
  errors: 0,
  rateLimited: 0,
  feedbackPositive: 0,
  feedbackNegative: 0,
  tokensIn: 0,
  tokensOut: 0,
  latencySumMs: 0,
  startedAt: Date.now(),
};

/** Write one metric line. Never throws — logging must not break a request. */
export function logMetric(metric: Metric): void {
  try {
    switch (metric.kind) {
      case 'query':
        counters.queries++;
        counters.tokensIn += metric.tokensIn;
        counters.tokensOut += metric.tokensOut;
        counters.latencySumMs += metric.latencyMs;
        if (metric.cacheHit) counters.cacheHits++;
        if (metric.retrievalMiss) counters.retrievalMisses++;
        if (metric.fallbackUsed) counters.fallbacks++;
        if (metric.clarifying) counters.clarifications++;
        break;
      case 'feedback':
        if (metric.type === 'positive') counters.feedbackPositive++;
        else counters.feedbackNegative++;
        break;
      case 'error':
        counters.errors++;
        break;
      case 'rate_limit':
        counters.rateLimited++;
        break;
    }
    const line = JSON.stringify({ ts: new Date().toISOString(), ...metric });
    // eslint-disable-next-line no-console -- stdout is the log sink on Liara
    console.log(redact(line));
  } catch {
    /* metrics must never break a request */
  }
}

/** Log an error with a redacted message (SC-018). */
export function logError(where: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  logMetric({ kind: 'error', where, message: redact(message).slice(0, 500) });
}

/** Aggregated counters + derived rates for /api/health (SC-038). */
export function snapshot(): Record<string, unknown> {
  const q = Math.max(1, counters.queries);
  return {
    uptimeSeconds: Math.round((Date.now() - counters.startedAt) / 1000),
    queryCount: counters.queries,
    tokenUsage: { input: counters.tokensIn, output: counters.tokensOut },
    avgLatencyMs: Math.round(counters.latencySumMs / q),
    cacheHitRate: counters.cacheHits / q,
    retrievalMissRate: counters.retrievalMisses / q,
    fallbackRate: counters.fallbacks / q,
    clarificationRate: counters.clarifications / q,
    rateLimitedCount: counters.rateLimited,
    errorCount: counters.errors,
    feedback: { positive: counters.feedbackPositive, negative: counters.feedbackNegative },
    tokenBudget: getConfig().session.tokenBudget,
  };
}
