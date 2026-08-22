/**
 * BM25 retrieval over documentation chunks (no embedding required).
 *
 * This is a lightweight, offline-capable fallback for when the embedding
 * provider is unavailable. It tokenizes on whitespace/punctuation and
 * computes standard BM25 scores.
 */

export interface Bm25IndexOptions {
  /** BM25 k1 parameter (term frequency saturation). Default 1.5. */
  k1?: number;
  /** BM25 b parameter (length normalization). Default 0.75. */
  b?: number;
}

interface Posting {
  docIndex: number;
  tf: number;
}

const DEFAULT_K1 = 1.5;
const DEFAULT_B = 0.75;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zA-Z0-9\u0600-\u06FF]+/u)
    .filter((w) => w.length > 1);
}

export interface Bm25Index {
  search(query: string, topK: number): Promise<{ chunkId: string; score: number }[]>;
}

export function buildBm25Index(chunks: { chunkId: string; content: string; tokenCount: number }[], opts: Bm25IndexOptions = {}): Bm25Index {
  const k1 = opts.k1 ?? DEFAULT_K1;
  const b = opts.b ?? DEFAULT_B;
  const N = chunks.length;
  const avgdl = N === 0 ? 0 : chunks.reduce((s, c) => s + c.tokenCount, 0) / N;

  // Build inverted index: term -> list of postings
  const df = new Map<string, number>();
  const postings = new Map<string, Posting[]>();

  for (let i = 0; i < N; i++) {
    const terms = tokenize(chunks[i]!.content);
    const seen = new Set<string>();
    for (const t of terms) {
      if (!seen.has(t)) {
        df.set(t, (df.get(t) ?? 0) + 1);
        seen.add(t);
      }
      const list = postings.get(t) ?? [];
      const existing = list.find((p) => p.docIndex === i);
      if (existing) existing.tf++;
      else list.push({ docIndex: i, tf: 1 });
      postings.set(t, list);
    }
  }

  return {
    async search(query, topK) {
      if (N === 0) return [];
      const qTerms = tokenize(query);
      const scores = new Array<number>(N).fill(0);

      for (const qt of qTerms) {
        const idf = Math.log(1 + (N - (df.get(qt) ?? 0) + 0.5) / ((df.get(qt) ?? 0) + 0.5) + 1);
        const list = postings.get(qt);
        if (!list) continue;
        for (const p of list) {
          const c = chunks[p.docIndex]!;
          const tfNorm = (p.tf * (k1 + 1)) / (p.tf + k1 * (1 - b + b * (c.tokenCount / avgdl)));
          scores[p.docIndex]! += idf * tfNorm;
        }
      }

      const order = scores
        .map((score, idx) => ({ chunkId: chunks[idx]!.chunkId, score }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.max(1, topK));
      return order;
    },
  };
}
