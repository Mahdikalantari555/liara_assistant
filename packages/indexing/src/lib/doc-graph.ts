/**
 * Parse local Markdown links into a doc-to-doc adjacency list.
 *
 * The corpus is `docs/public/llms/**.md`. Internal links are typically:
 *  - Markdown links: `[text](https://docs.liara.ir/paas/nodejs/)`
 *  - Wiki-style links: `[[paas/nodejs]]`
 *
 * Output: a small adjacency list for 1-hop graph expansion.
 */

export interface DocGraph {
  /** Source page URL -> set of target page URLs. */
  edges: Map<string, Set<string>>;
  /** Reverse edges: target -> sources. */
  reverse: Map<string, Set<string>>;

  /** Return 1-hop neighbors of `url` (outgoing). */
  neighbors(url: string): Set<string>;

  /** Return 1-hop neighbors of `url` (incoming). */
  reverseNeighbors(url: string): Set<string>;

  /** Return docs within `hops` hops from `url`. */
  expand(url: string, hops: number): Set<string>;
}

const MARKDOWN_LINK = /\[[^\]]+\]\((https?:\/\/docs\.liara\.ir\/[^)]+)\)/g;
const WIKI_LINK = /\[\[([^\]]+)\]\]/g;

function normalizeUrl(raw: string): string {
  return raw.replace(/\/+$/, '').replace(/^https?:\/\/docs\.liara\.ir\//, '');
}

export function buildDocGraph(pages: { sourceUrl: string; content: string }[]): DocGraph {
  const edges = new Map<string, Set<string>>();
  const reverse = new Map<string, Set<string>>();

  const ensure = (m: Map<string, Set<string>>, k: string): Set<string> => {
    let set = m.get(k);
    if (!set) { set = new Set(); m.set(k, set); }
    return set;
  };

  for (const page of pages) {
    const src = normalizeUrl(page.sourceUrl);
    const body = page.content;

    // Markdown links
    const mdLinks = [...body.matchAll(MARKDOWN_LINK)];
    for (const m of mdLinks) {
      const tgt = normalizeUrl(m[1]!);
      if (tgt && tgt !== src) {
        ensure(edges, src).add(tgt);
        ensure(reverse, tgt).add(src);
      }
    }

    // Wiki-style links (relative slugs)
    const wikiLinks = [...body.matchAll(WIKI_LINK)];
    for (const m of wikiLinks) {
      const tgt = normalizeUrl(m[1]!);
      if (tgt && tgt !== src) {
        ensure(edges, src).add(tgt);
        ensure(reverse, tgt).add(src);
      }
    }
  }

  return {
    edges,
    reverse,
    neighbors(url) {
      return this.edges.get(normalizeUrl(url)) ?? new Set();
    },
    reverseNeighbors(url) {
      return this.reverse.get(normalizeUrl(url)) ?? new Set();
    },
    expand(url, hops = 1) {
      const root = normalizeUrl(url);
      const visited = new Set<string>([root]);
      const queue: { url: string; depth: number }[] = [{ url: root, depth: 0 }];
      while (queue.length > 0) {
        const { url: cur, depth } = queue.shift()!;
        if (depth >= hops) continue;
        for (const next of this.edges.get(cur) ?? []) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push({ url: next, depth: depth + 1 });
          }
        }
      }
      visited.delete(root);
      return visited;
    },
  };
}
