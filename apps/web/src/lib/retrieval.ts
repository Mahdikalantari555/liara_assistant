/**
 * Retrieval service (T027, T040, FR-041) — Top-K=5 vector search, no reranker.
 *
 * Context-aware (US2): the query sent to the embedder is the user's question
 * optionally prefixed with the conversation topic, so "اگر خطا داد چه کنم؟"
 * still lands on Node.js deployment docs rather than generic error pages.
 *
 * Fallback (BM25): when embedding fails or RETRIEVAL_MODE=bm25, use offline
 * BM25 over the chunk corpus.
 */
import { FileVectorStore, ChromaVectorStore, readCurrent } from '@liara-docs-bot/indexing';
import type { RetrievedChunk, VectorStore } from '@liara-docs-bot/indexing';
import { getConfig } from './config';
import { embedQuery } from './embedding';
import type { Citation, DocLink } from '@/types';

let store: VectorStore | null = null;

/** Lazily built singleton so the artifact is memory-mapped once per instance. */
function getStore(): VectorStore {
  if (store) return store;
  const { index } = getConfig();
  store = index.chromaHost
    ? new ChromaVectorStore(index.chromaHost, index.collection)
    : new FileVectorStore(index.root);
  return store;
}

const isLinkDump = (c: { sectionTitle?: string }): boolean =>
  (c.sectionTitle ?? '').trim().toLowerCase() === 'all links';

const keep = <T extends { score: number; sectionTitle?: string }>(chunks: T[], minScore = 0): T[] =>
  chunks.filter((c) => c.score >= Math.max(minScore, Number.EPSILON) && !isLinkDump(c));

/**
 * Offline BM25 search over the committed chunks. Prefers a prebuilt
 * `bm25.json`; if that is missing it builds the index directly from
 * `chunks.json`, so retrieval still works when the embedding provider is
 * unavailable or misconfigured.
 */
async function bm25Search(
  query: string,
  indexRoot: string,
  topK: number,
): Promise<{ chunks: RetrievedChunk[]; topScore: number; miss: boolean }> {
  const version = await readCurrent(indexRoot);
  if (!version) throw new Error('no index published');
  const { readBm25Artifact, buildBm25Index } = await import('@liara-docs-bot/indexing');

  type ChunkRow = {
    chunkId: string;
    content: string;
    tokenCount: number;
    sourceUrl: string;
    pageTitle: string;
    sectionTitle: string;
  };
  let rows: ChunkRow[];
  try {
    const artifact = await readBm25Artifact(indexRoot, version);
    rows = artifact.chunks as ChunkRow[];
  } catch {
    const fs = await import('fs/promises');
    const p = await import('path');
    const raw = await fs.readFile(p.join(indexRoot, version, 'chunks.json'), 'utf8');
    rows = JSON.parse(raw) as ChunkRow[];
  }

  const bm25 = buildBm25Index(
    rows.map((c) => ({ chunkId: c.chunkId, content: c.content, tokenCount: c.tokenCount })),
  );
  const hits = await bm25.search(query, topK);
  const byId = new Map(rows.map((c) => [c.chunkId, c]));
  const chunks = hits.map(
    (h) =>
      ({
        ...(byId.get(h.chunkId) ?? {
          chunkId: h.chunkId,
          content: '',
          sourceUrl: '',
          pageTitle: '',
          sectionTitle: '',
          tokenCount: 0,
        }),
        score: h.score,
      }) as RetrievedChunk,
  );
  const relevant = keep(chunks);
  return { chunks, topScore: chunks[0]?.score ?? 0, miss: relevant.length === 0 };
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  /** Chunks above the similarity threshold; empty means a retrieval miss. */
  relevant: RetrievedChunk[];
  topScore: number;
  miss: boolean;
}

/** Embed the query (with context) and search the live collection. */
export async function retrieve(question: string, topic?: string): Promise<RetrievalResult> {
  const { retrieval, index } = getConfig();
  const query = topic ? `${topic}\n${question}` : question;

  // BM25 fallback path: no embedding service needed.
  if (retrieval.mode === 'bm25' || retrieval.mode === 'bm25-graph') {
    try {
      const r = await bm25Search(query, index.root, retrieval.topK);
      return { chunks: r.chunks, relevant: keep(r.chunks), topScore: r.topScore, miss: r.miss };
    } catch {
      // Fall through to embedding path if BM25 index is missing.
    }
  }

  // Embedding path (default).
  try {
    const vector = await embedQuery(query);
    const chunks = await getStore().search(vector, retrieval.topK);
    const relevant = keep(chunks, retrieval.minScore);
    return {
      chunks,
      relevant,
      topScore: chunks[0]?.score ?? 0,
      miss: relevant.length === 0,
    };
  } catch (err) {
    // Last resort: BM25 if embedding failed.
    console.error('[retrieval] embedding path failed, falling back to BM25:', (err as Error).message);
    try {
      const r = await bm25Search(query, index.root, retrieval.topK);
      return { chunks: r.chunks, relevant: keep(r.chunks), topScore: r.topScore, miss: r.miss };
    } catch {
      return { chunks: [], relevant: [], topScore: 0, miss: true };
    }
  }
}

/** One citation per source page, keeping the best-scoring section (FR-002). */
export function toCitations(chunks: RetrievedChunk[], limit = 3): Citation[] {
  const byUrl = new Map<string, Citation>();
  for (const c of chunks) {
    const existing = byUrl.get(c.sourceUrl);
    if (!existing || c.score > existing.score) {
      byUrl.set(c.sourceUrl, {
        title: c.pageTitle,
        url: c.sourceUrl,
        section: c.sectionTitle,
        score: Math.round(c.score * 1000) / 1000,
      });
    }
  }
  return [...byUrl.values()].sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Sidebar links (US6): deduped pages, wider than the citation list. */
export function toDocLinks(chunks: RetrievedChunk[], limit = 8): DocLink[] {
  const seen = new Set<string>();
  const links: DocLink[] = [];
  for (const c of chunks) {
    if (seen.has(c.sourceUrl)) continue;
    seen.add(c.sourceUrl);
    links.push({ title: c.pageTitle, url: c.sourceUrl, section: c.sectionTitle });
    if (links.length >= limit) break;
  }
  return links;
}

/** Index health for /api/health. */
export async function indexHealth(): Promise<Record<string, unknown>> {
  try {
    const s = getStore();
    const [count, manifest] = await Promise.all([s.count(), s.manifest()]);
    return {
      ok: true,
      chunkCount: count,
      version: manifest?.version ?? 'chroma',
      embeddingModel: manifest?.embeddingModel ?? 'unknown',
      dimensions: manifest?.dimensions ?? null,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
