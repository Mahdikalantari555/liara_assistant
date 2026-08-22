/**
 * Chunker (T024) — 512-token chunks, 50-token overlap, section-aware (FR-043).
 *
 * Splits each page on Markdown headings first so `sectionTitle` is accurate for
 * citations (FR-002/FR-044), then packs sentence-level units up to the token
 * budget. Code fences are never split: a fenced block is one indivisible unit,
 * because half a `liara deploy` command is worse than a long chunk.
 */
import type { CrawledPage, DocumentationChunk } from './types/index';
import { countTokens, splitUnits } from './lib/text';

export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
  /** Optional progress callback: (chunkedPages, totalPages). */
  onProgress?: (chunkedPages: number, totalPages: number) => void;
}

interface Section {
  title: string;
  body: string;
}

/** Split a page body into heading-delimited sections. */
function splitSections(page: CrawledPage): Section[] {
  const lines = page.content.split('\n');
  const sections: Section[] = [];
  let title = page.pageTitle;
  let buf: string[] = [];
  let inFence = false;

  const flush = (): void => {
    const body = buf.join('\n').trim();
    if (body) sections.push({ title, body });
    buf = [];
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const heading = !inFence ? line.match(/^(#{1,4})\s+(.+)$/) : null;
    if (heading) {
      flush();
      title = heading[2]!.trim();
      continue;
    }
    buf.push(line);
  }
  flush();
  return sections.length > 0 ? sections : [{ title: page.pageTitle, body: page.content }];
}

/** Group units so fenced code blocks stay atomic. */
function atomicUnits(body: string): string[] {
  const out: string[] = [];
  const lines = body.split('\n');
  let fence: string[] | null = null;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      if (fence) {
        fence.push(line);
        out.push(fence.join('\n'));
        fence = null;
      } else {
        fence = [line];
      }
      continue;
    }
    if (fence) fence.push(line);
    else out.push(...splitUnits(line));
  }
  if (fence) out.push(fence.join('\n')); // unterminated fence — keep as-is
  return out.filter((u) => u.trim() !== '' || u === '\n');
}

/** Chunk one page. Chunk ids are stable: <relative-slug>#<section>-<n>. */
export function chunkPage(page: CrawledPage, opts: ChunkOptions = {}): DocumentationChunk[] {
  const chunkSize = opts.chunkSize ?? 512;
  const overlap = Math.min(opts.overlap ?? 50, chunkSize - 1);
  const slug = page.sourceUrl.replace(/^https?:\/\/docs\.liara\.ir\//, '').replace(/\/+$/, '');
  const chunks: DocumentationChunk[] = [];
  let n = 0; // page-wide: per-section numbering would collide across sections

  for (const section of splitSections(page)) {
    const units = atomicUnits(section.body);
    let current: string[] = [];
    let tokens = 0;

    const emit = (): void => {
      const content = current.join(' ').replace(/\s*\n\s*/g, '\n').trim();
      if (!content) return;
      chunks.push({
        chunkId: `${slug}#${n}`,
        content: `${page.pageTitle} — ${section.title}\n\n${content}`,
        sourceUrl: page.sourceUrl,
        pageTitle: page.pageTitle,
        sectionTitle: section.title,
        tokenCount: countTokens(content),
      });
      n++;
    };

    for (const unit of units) {
      const unitTokens = countTokens(unit);
      // A single oversized unit (long code block) is still emitted as its own
      // chunk, but we must not exceed the physical embedding batch size. Cap it
      // defensively so llama-server (default ubatch 512) never rejects it.
      const MAX_PHYSICAL_BATCH = 512;
      if (unitTokens >= chunkSize) {
        if (current.length) {
          emit();
          current = [];
          tokens = 0;
        }
        current = [unit];
        tokens = unitTokens;
        // Hard cap: truncate trailing lines until we fit. This keeps the most
        // important top-of-block content (commands / headers) and avoids a
        // hard failure of the entire indexing run.
        while (tokens > MAX_PHYSICAL_BATCH && current.length) {
          const removed = current.pop()!;
          tokens -= countTokens(removed);
        }
        emit();
        current = [];
        tokens = 0;
        continue;
      }
      if (tokens + unitTokens > chunkSize && current.length > 0) {
        emit();
        // Carry the tail back for `overlap` tokens of context.
        const tail: string[] = [];
        let tailTokens = 0;
        for (let i = current.length - 1; i >= 0 && tailTokens < overlap; i--) {
          tail.unshift(current[i]!);
          tailTokens += countTokens(current[i]!);
        }
        current = tail;
        tokens = tailTokens;
      }
      current.push(unit);
      tokens += unitTokens;
    }
    if (current.length) emit();
  }
  return chunks;
}

/** Chunk every page. */
export function chunkPages(pages: CrawledPage[], opts: ChunkOptions = {}): DocumentationChunk[] {
  const out: DocumentationChunk[] = [];
  for (let i = 0; i < pages.length; i++) {
    out.push(...chunkPage(pages[i]!, opts));
    opts.onProgress?.(i + 1, pages.length);
  }
  return out;
}
