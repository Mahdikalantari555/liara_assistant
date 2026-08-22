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

  // The llms corpus carries an auto-generated "all links" appendix per page
  // (a navigation link dump, 1139 chunks in the current index). It matches
  // almost any query and makes useless citations. Filter it at query time;
  // ponytail: drop the section during chunking on the next full reindex.
  const isLinkDump = (c: { sectionTitle?: string }) =>
    (c.sectionTitle ?? '').trim().toLowerCase() === 'all links';
  const keep = <T extends { score: number; sectionTitle?: string }>(chunks: T[], minScore = 0): T[] =>
    chunks.filter((c) => c.score >= Math.max(minScore, Number.EPSILON) && !isLinkDump(c));

  // BM25 fallback path: no embedding service needed.
  if (retrieval.mode === 'bm25' || retrieval.mode === 'bm25-graph') {
    try {
      const version = await readCurrent(index.root);
      if (!version) throw new Error('no bm25 index');
      const { readBm25Artifact } = await import('@liara-docs-bot/indexing');
      const { buildBm25Index } = await import('@liara-docs-bot/indexing');
      const artifact = await readBm25Artifact(index.root, version);
      const bm25 = buildBm25Index(artifact.chunks.map((c) => ({ chunkId: c.chunkId, content: c.content, tokenCount: c.tokenCount })));
      const hits = await bm25.search(query, retrieval.topK);
      const byId = new Map(artifact.chunks.map((c) => [c.chunkId, c]));
      const chunks = hits.map((h) => ({ ...(byId.get(h.chunkId) ?? { chunkId: h.chunkId, content: '', sourceUrl: '', pageTitle: '', sectionTitle: '', tokenCount: 0 }), score: h.score }));
      const relevant = keep(chunks);
      return {
        chunks,
        relevant,
        topScore: chunks[0]?.score ?? 0,
        miss: relevant.length === 0,
      };
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
  } catch {
    // Last resort: BM25 if embedding failed.
    try {
      const version = await readCurrent(index.root);
      if (!version) throw new Error('no index');
      const { readBm25Artifact } = await import('@liara-docs-bot/indexing');
      const { buildBm25Index } = await import('@liara-docs-bot/indexing');
      const artifact = await readBm25Artifact(index.root, version);
      const bm25 = buildBm25Index(artifact.chunks.map((c) => ({ chunkId: c.chunkId, content: c.content, tokenCount: c.tokenCount })));
      const hits = await bm25.search(query, retrieval.topK);
      const byId = new Map(artifact.chunks.map((c) => [c.chunkId, c]));
      const chunks = hits.map((h) => ({ ...(byId.get(h.chunkId) ?? { chunkId: h.chunkId, content: '', sourceUrl: '', pageTitle: '', sectionTitle: '', tokenCount: 0 }), score: h.score }));
      const relevant = keep(chunks);
      return {
        chunks,
        relevant,
        topScore: chunks[0]?.score ?? 0,
        miss: relevant.length === 0,
      };
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
