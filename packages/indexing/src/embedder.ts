/**
 * Embedder (T025) — turns chunks into vectors with progress + retry.
 *
 * Retries are deliberate: a 1142-page corpus is ~15-20 min of embedding, and a
 * single transient 500 should not throw the whole run away.
 */
import type { DocumentationChunk, EmbeddedChunk, EmbeddingProvider } from './types/index';

export interface EmbedOptions {
  batchSize?: number;
  maxRetries?: number;
  onProgress?: (done: number, total: number) => void;
}

async function withRetry<T>(fn: () => Promise<T>, attempts: number, label: string): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i === attempts - 1) break;
      const backoff = 500 * 2 ** i;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${String(lastError)}`);
}

/** Embed every chunk, preserving input order. */
export async function embedChunks(
  chunks: DocumentationChunk[],
  provider: EmbeddingProvider,
  opts: EmbedOptions = {},
): Promise<EmbeddedChunk[]> {
  const batchSize = Math.max(1, opts.batchSize ?? 8);
  const maxRetries = Math.max(1, opts.maxRetries ?? 3);
  const out: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    let vectors: number[][];
    try {
      vectors = await withRetry(
        () => provider.embed(batch.map((c) => c.content)),
        maxRetries,
        `embed batch ${i}-${i + batch.length}`,
      );
    } catch (err) {
      // Isolate: when a batch keeps failing, retry each item alone so the
      // culprit chunk id and the provider's error text surface instead of a
      // generic batch failure.
      if (batch.length === 1) throw err;
      vectors = [];
      for (const chunk of batch) {
        try {
          const single = await withRetry(
            () => provider.embed([chunk.content]),
            maxRetries,
            `embed single ${chunk.chunkId}`,
          );
          vectors.push(single[0]!);
        } catch (singleErr) {
          throw new Error(
            `embed ${chunk.chunkId} failed after ${maxRetries} attempts: ${String(singleErr)}`,
          );
        }
      }
    }
    batch.forEach((chunk, j) => out.push({ ...chunk, embedding: vectors[j]! }));
    opts.onProgress?.(Math.min(i + batchSize, chunks.length), chunks.length);
  }
  return out;
}
