/**
 * Graph expansion for retrieval results.
 *
 * Given a set of BM25 hits, expand each hit with related docs from the
 * doc-to-doc graph (1-hop). The expanded docs are merged back into the
 * result set, deduplicated, and re-ranked by BM25 score.
 */

import type { DocumentationChunk, RetrievedChunk } from '../types/index';
import type { DocGraph } from '../lib/doc-graph';

export interface GraphExpanderOptions {
  /** Max extra docs to add per hit. */
  fanout?: number;
  /** Graph hops to expand. */
  hops?: number;
}

export function expandWithGraph(
  hits: RetrievedChunk[],
  chunks: DocumentationChunk[],
  graph: DocGraph,
  opts: GraphExpanderOptions = {},
): RetrievedChunk[] {
  const fanout = opts.fanout ?? 3;
  const byId = new Map(chunks.map((c) => [c.chunkId, c]));
  const seen = new Set<string>();
  const out: RetrievedChunk[] = [];

  const add = (chunkId: string, score: number) => {
    if (seen.has(chunkId)) return;
    seen.add(chunkId);
    const src = byId.get(chunkId);
    if (!src) return;
    out.push({ ...src, score });
  };

  for (const hit of hits) {
    add(hit.chunkId, hit.score);
    const related = graph.expand(hit.sourceUrl, opts.hops ?? 1);
    let added = 0;
    for (const url of related) {
      if (added >= fanout) break;
      // Find chunks from this URL
      for (const c of chunks) {
        if (c.sourceUrl === url || c.sourceUrl.endsWith(url)) {
          add(c.chunkId, hit.score * 0.8); // dampened score for graph expansion
          added++;
          if (added >= fanout) break;
        }
      }
    }
  }

  return out.sort((a, b) => b.score - a.score);
}
