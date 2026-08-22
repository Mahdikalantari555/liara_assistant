/**
 * Crawler (T023) — reads the local docs corpus from `docs/public/llms`.
 *
 * The corpus is LLM-optimized Markdown generated from the docs site MDX. Each
 * file starts with `Original link: <canonical docs.liara.ir URL>`, which is the
 * citation URL (FR-002). Nothing here touches the network (FR-023): docs are
 * versioned in this repo, so the bot never crawls docs.liara.ir per question.
 */
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import type { CrawledPage } from './types/index';
import { normalize } from './lib/text';

const ORIGINAL_LINK = /^\s*Original link:\s*(\S+)\s*$/m;

/** Recursively list every .md file under a directory. */
async function listMarkdown(root: string): Promise<string[]> {
  const out: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.isFile() && e.name.endsWith('.md')) out.push(full);
    }
  };
  await walk(root);
  return out.sort();
}

/** First `# ` heading, else the file name humanized. */
function extractTitle(body: string, filePath: string): string {
  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1?.[1]) return h1[1].trim();
  const base = path.basename(filePath, '.md');
  return base.replace(/[-_]/g, ' ');
}

/**
 * Derive the canonical URL when the `Original link:` header is missing, using
 * the corpus path: docs/public/llms/paas/about.md -> .../paas/about/
 */
function urlFromPath(filePath: string, corpusRoot: string): string {
  const rel = path.relative(corpusRoot, filePath).replace(/\.md$/, '');
  return `https://docs.liara.ir/${rel.replace(/\\/g, '/')}/`;
}

export interface CrawlOptions {
  /** Corpus root, e.g. `<repo>/docs/public/llms`. */
  corpusRoot: string;
  /** Skip pages shorter than this many characters (nav stubs). */
  minChars?: number;
  /** Optional progress callback: (loaded, total). */
  onProgress?: (loaded: number, total: number) => void;
}

/** Read every documentation page from the local corpus. */
export async function crawl(opts: CrawlOptions): Promise<CrawledPage[]> {
  const { corpusRoot, minChars = 200, onProgress } = opts;
  const files = await listMarkdown(corpusRoot);
  if (files.length === 0) throw new Error(`crawler: no .md files under ${corpusRoot}`);

  const pages: CrawledPage[] = [];
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i]!;
    const raw = await readFile(filePath, 'utf8');
    const link = raw.match(ORIGINAL_LINK)?.[1];
    const body = normalize(raw.replace(ORIGINAL_LINK, ''));
    if (body.length < minChars) {
      onProgress?.(i + 1, files.length);
      continue;
    }
    const rel = path.relative(corpusRoot, filePath).replace(/\\/g, '/');
    pages.push({
      filePath,
      sourceUrl: link ?? urlFromPath(filePath, corpusRoot),
      pageTitle: extractTitle(body, filePath),
      content: body,
      category: rel.split('/')[0] ?? 'overview',
    });
    onProgress?.(i + 1, files.length);
  }
  if (pages.length === 0) throw new Error(`crawler: every page under ${corpusRoot} was filtered out`);
  return pages;
}
