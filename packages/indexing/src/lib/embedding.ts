/**
 * Embedding provider abstraction (FR-015).
 *
 * Two implementations behind one contract:
 *  - `local`: llama-server (llama.cpp) OpenAI-compatible /v1/embeddings, model
 *    bge-m3-Q4_K_M.gguf. MVP default; no API key, works offline.
 *  - `api`:   any OpenAI-compatible /v1/embeddings endpoint.
 *
 * Only the indexing pipeline uses this. The runtime never embeds documents
 * (FR-013) — it embeds only the user query, and in MVP the query embedding also
 * comes from the same local provider during indexing-time evaluation. At serve
 * time the runtime uses `apps/web/src/lib/embedding.ts`, which talks to the same
 * OpenAI-compatible endpoint but keeps zero indexing dependencies.
 */
import type { EmbeddingProvider } from '../types/index';

interface EmbeddingResponse {
  data?: Array<{ embedding: number[]; index?: number }>;
  error?: unknown;
}

/** POST texts to an OpenAI-compatible /v1/embeddings endpoint. */
async function postEmbeddings(
  baseUrl: string,
  model: string,
  texts: string[],
  apiKey?: string,
  timeoutMs = 120_000,
): Promise<number[][]> {
  const url = `${baseUrl.replace(/\/+$/, '').replace(/\/v1$/, '')}/v1/embeddings`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ model, input: texts }),
      signal: controller.signal,
    });
    if (!res.ok) {
      // Never echo the request body or auth header — it may carry secrets.
      // Keep a short error snippet so a provider rejection is actionable.
      const detail = await res.text().catch(() => '');
      const snippet = detail.replace(/\s+/g, ' ').slice(0, 180);
      throw new Error(`embeddings HTTP ${res.status} from ${url}${snippet ? `: ${snippet}` : ''}`);
    }
    const json = (await res.json()) as EmbeddingResponse;
    if (!json.data?.length) throw new Error(`embeddings response had no data`);
    // Endpoints may reorder; sort by index when present.
    const rows = [...json.data].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    return rows.map((r) => r.embedding);
  } finally {
    clearTimeout(timer);
  }
}

export interface EmbeddingConfig {
  type: 'local' | 'api';
  /** local: llama-server base URL. api: provider base URL. */
  baseUrl: string;
  model: string;
  apiKey?: string;
  /** Texts per HTTP request. llama-server handles small batches best. */
  batchSize?: number;
}

/** Build a provider from config; validates required fields loudly. */
export function createEmbeddingProvider(cfg: EmbeddingConfig): EmbeddingProvider {
  if (!cfg.baseUrl) throw new Error(`embedding: baseUrl is required for type=${cfg.type}`);
  if (cfg.type === 'api' && !cfg.apiKey) {
    throw new Error('embedding: EMBEDDING_API_KEY is required when EMBEDDING_TYPE=api');
  }
  const batchSize = Math.max(1, cfg.batchSize ?? 8);
  let dimensions: number | null = null;

  return {
    id: `${cfg.type}:${cfg.model}`,
    get dimensions() {
      return dimensions;
    },
    async embed(texts: string[]): Promise<number[][]> {
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const vectors = await postEmbeddings(cfg.baseUrl, cfg.model, batch, cfg.apiKey);
        if (vectors.length !== batch.length) {
          throw new Error(`embedding: expected ${batch.length} vectors, got ${vectors.length}`);
        }
        for (const v of vectors) {
          if (dimensions === null) dimensions = v.length;
          else if (v.length !== dimensions) {
            throw new Error(`embedding: dimension drift ${v.length} != ${dimensions}`);
          }
          out.push(v);
        }
      }
      return out;
    },
  };
}

/** Provider from process.env (used by the indexing CLI). */
export function providerFromEnv(): EmbeddingProvider {
  const type = (process.env.EMBEDDING_TYPE ?? 'local') === 'api' ? 'api' : 'local';
  if (type === 'local') {
    const modelPath = process.env.EMBEDDING_MODEL_PATH ?? '';
    return createEmbeddingProvider({
      type: 'local',
      baseUrl: process.env.LLAMA_SERVER_URL ?? 'http://127.0.0.1:8089',
      // llama-server ignores `model`; keep the file name for provenance.
      model: modelPath.split('/').pop() ?? 'bge-m3',
      batchSize: Number(process.env.EMBEDDING_BATCH_SIZE ?? 8),
    });
  }
  return createEmbeddingProvider({
    type: 'api',
    baseUrl: process.env.EMBEDDING_API_BASE ?? '',
    model: process.env.EMBEDDING_API_MODEL ?? '',
    apiKey: process.env.EMBEDDING_API_KEY,
    batchSize: Number(process.env.EMBEDDING_BATCH_SIZE ?? 32),
  });
}

/** L2-normalize in place so cosine similarity reduces to a dot product. */
export function normalizeVector(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum);
  if (norm === 0) return v;
  for (let i = 0; i < v.length; i++) v[i] = v[i]! / norm;
  return v;
}
