/**
 * Centralized runtime config (FR-027, FR-033, SC-017/SC-026).
 *
 * Every secret is read here, server-side only. Nothing in this module is
 * importable from a client component: `assertServer()` throws if bundled into
 * the browser, and the redaction helpers keep keys out of logs and responses.
 */
import path from 'path';

function assertServer(): void {
  // Next.js defines `window` only in the browser bundle.
  if (typeof window !== 'undefined') {
    throw new Error('config: server-only module imported from client code');
  }
}

function str(name: string, fallback = ''): string {
  return (process.env[name] ?? fallback).trim();
}
function num(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw === undefined || raw.trim() === '' ? NaN : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}
function bool(name: string, fallback: boolean): boolean {
  const raw = str(name);
  if (raw === '') return fallback;
  return raw === 'true' || raw === '1' || raw === 'yes';
}

export interface LlmTarget {
  apiBase: string;
  apiKey: string;
  model: string;
}

export interface AppConfig {
  llm: { primary: LlmTarget; fallback: LlmTarget | null };
  embedding: {
    type: 'local' | 'api';
    baseUrl: string;
    model: string;
    apiKey: string;
    batchSize: number;
  };
  index: { root: string; collection: string; chromaHost: string };
  retrieval: { topK: number; minScore: number; clarifyEnabled: boolean; mode: 'embedding' | 'bm25' | 'bm25-graph' };
  session: { secret: string; tokenBudget: number; ttlSeconds: number };
  cache: { ttlMs: number; maxEntries: number };
  rateLimit: { windowMs: number; max: number };
  metrics: { logPath: string };
  /** Support escalation (conversation-flow): streak threshold + ticket link. */
  escalation: { threshold: number; ticketUrl: string };
  isProd: boolean;
}

let cached: AppConfig | null = null;

/** Read and validate config once per process. */
export function getConfig(): AppConfig {
  assertServer();
  if (cached) return cached;

  const embeddingType = str('EMBEDDING_TYPE', 'local') === 'api' ? 'api' : 'local';
  const repoRoot = path.resolve(process.cwd(), process.cwd().includes('apps/web') ? '../..' : '.');

  const cfg: AppConfig = {
    llm: {
      primary: {
        apiBase: str('LLM_API_BASE'),
        apiKey: str('LLM_API_KEY'),
        model: str('LLM_MODEL', 'kilo-auto/free'),
      },
      fallback: str('LLM_FALLBACK_API_KEY')
        ? {
            apiBase: str('LLM_FALLBACK_API_BASE'),
            apiKey: str('LLM_FALLBACK_API_KEY'),
            model: str('LLM_FALLBACK_MODEL', 'gpt-4o-mini'),
          }
        : null,
    },
    embedding: {
      type: embeddingType,
      baseUrl: embeddingType === 'local' ? str('LLAMA_SERVER_URL', 'http://127.0.0.1:8089') : str('EMBEDDING_API_BASE'),
      model:
        embeddingType === 'local'
          ? (str('EMBEDDING_MODEL_PATH').split('/').pop() || 'bge-m3')
          : str('EMBEDDING_API_MODEL', 'text-embedding-3-large'),
      apiKey: embeddingType === 'api' ? str('EMBEDDING_API_KEY') : '',
      batchSize: num('EMBEDDING_BATCH_SIZE', 8),
    },
    index: {
      root: path.resolve(repoRoot, str('CHROMA_DB_PATH', './data/index')),
      collection: str('CHROMA_DB_COLLECTION', 'liara-docs'),
      chromaHost: str('CHROMA_DB_HOST'),
    },
    retrieval: {
      topK: num('RETRIEVAL_TOP_K', 5),
      minScore: num('RETRIEVAL_MIN_SCORE', 0.3),
      clarifyEnabled: bool('CLARIFY_ENABLED', true),
      mode: (str('RETRIEVAL_MODE', 'embedding') as AppConfig['retrieval']['mode']),
    },
    session: {
      // Falling back to a derived secret keeps dev frictionless but is refused in
      // production: a guessable secret means forgeable sessions.
      secret: str('SESSION_SECRET') || (str('NODE_ENV') === 'production' ? '' : 'dev-insecure-secret'),
      tokenBudget: num('TOKEN_BUDGET', 8000),
      ttlSeconds: num('SESSION_TTL_SECONDS', 60 * 60 * 6),
    },
    cache: { ttlMs: num('CACHE_TTL_MS', 600_000), maxEntries: num('CACHE_MAX_ENTRIES', 200) },
    rateLimit: { windowMs: num('RATE_LIMIT_WINDOW_MS', 60_000), max: num('RATE_LIMIT_MAX', 30) },
    metrics: { logPath: str('METRICS_LOG_PATH', './data/logs/metrics.jsonl') },
    escalation: {
      threshold: num('ESCALATION_THRESHOLD', 2),
      ticketUrl: str('SUPPORT_TICKET_URL'),
    },
    isProd: str('NODE_ENV') === 'production',
  };

  if (cfg.isProd && !cfg.session.secret) {
    throw new Error('config: SESSION_SECRET is required in production');
  }
  return (cached = cfg);
}

/** Config health for /api/health — booleans only, never values (SC-026). */
export function configHealth(): Record<string, unknown> {
  const c = getConfig();
  return {
    llmPrimaryConfigured: Boolean(c.llm.primary.apiKey && c.llm.primary.apiBase),
    llmFallbackConfigured: Boolean(c.llm.fallback),
    llmModel: c.llm.primary.model,
    embeddingType: c.embedding.type,
    embeddingModel: c.embedding.model,
    indexRoot: c.index.root,
    chromaHost: c.index.chromaHost ? 'set' : 'unset',
    topK: c.retrieval.topK,
    minScore: c.retrieval.minScore,
    escalationConfigured: c.escalation.threshold > 0,
    supportTicketUrlSet: Boolean(c.escalation.ticketUrl),
  };
}

/** Strip anything key-shaped from a string before it reaches a log or client. */
export function redact(text: string): string {
  const c = getConfig();
  let out = text;
  for (const secret of [
    c.llm.primary.apiKey,
    c.llm.fallback?.apiKey,
    c.embedding.apiKey,
    c.session.secret,
    process.env.LIARA_API_TOKEN,
  ]) {
    if (secret && secret.length > 8) out = out.split(secret).join('[redacted]');
  }
  return out
    .replace(/\b(sk|aa)-[A-Za-z0-9_-]{16,}\b/g, '[redacted]')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[redacted]')
    .replace(/(Bearer\s+)\S+/gi, '$1[redacted]');
}
