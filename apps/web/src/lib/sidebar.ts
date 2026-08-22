/**
 * Sidebar relevance (T046, US6, SC-032).
 *
 * Ranks documentation links for the current conversation. Two sources:
 *  - retrieval hits from the last answer (already scored)
 *  - a lightweight keyword search when there is no conversation yet
 * No LLM call, so the sidebar cannot add latency or cost to a turn.
 */
import { retrieve, toDocLinks } from './retrieval';
import { DEFAULT_LINKS } from './fallback';
import type { DocLink } from '@/types';

/** Context-relevant links, falling back to the docs entry points. */
export async function sidebarLinks(context: string): Promise<{ links: DocLink[]; fallback: boolean }> {
  const query = context.trim();
  if (!query) return { links: DEFAULT_LINKS, fallback: true };
  try {
    const { chunks } = await retrieve(query);
    const links = toDocLinks(chunks, 8);
    return links.length > 0 ? { links, fallback: false } : { links: DEFAULT_LINKS, fallback: true };
  } catch {
    // Index or embedding provider down — the sidebar must never break the page.
    return { links: DEFAULT_LINKS, fallback: true };
  }
}
