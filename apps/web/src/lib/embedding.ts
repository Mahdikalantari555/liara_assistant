/**
 * Query embedding at serve time (T012 runtime half).
 *
 * Documents are embedded offline by `packages/indexing` (FR-013). This module
 * embeds only the user's question, through the same OpenAI-compatible contract,
 * so the provider can be local llama-server or a hosted API without code change.
 */
import { getConfig } from './config';

/** Embed one query string. Throws with a redacted message on failure. */
export async function embedQuery(text: string, timeoutMs = 15_000): Promise<number[]> {
  const { embedding } = getConfig();
  if (!embedding.baseUrl) {
    throw new Error(`embedding: no baseUrl configured for EMBEDDING_TYPE=${embedding.type}`);
  }
  const url = `${embedding.baseUrl.replace(/\/+$/, '').replace(/\/v1$/, '')}/v1/embeddings`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(embedding.apiKey ? { Authorization: `Bearer ${embedding.apiKey}` } : {}),
      },
      body: JSON.stringify({ model: embedding.model, input: [text] }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`embedding provider returned HTTP ${res.status}`);
    const json = (await res.json()) as { data?: Array<{ embedding: number[] }> };
    const vector = json.data?.[0]?.embedding;
    if (!vector?.length) throw new Error('embedding provider returned no vector');
    return vector;
  } finally {
    clearTimeout(timer);
  }
}
