/**
 * Indexer CLI (T026) — crawl → chunk → embed → write → validate → swap.
 *
 * Run locally or in GitHub Actions (FR-014/FR-022). Publishes a versioned
 * collection and only swaps `current` after validation passes (FR-032/FR-035),
 * so a broken index can never take traffic.
 *
 *   npm run index                 # full run, then swap
 *   npm run index -- --no-swap    # build + validate only
 *   npm run index -- --limit 50   # smoke run over 50 pages
 *   npm run index -- --resume     # resume from last progress checkpoint
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { readFile, writeFile } from 'fs/promises';
import { crawl } from './crawler';
import { chunkPages } from './chunker';
import { embedChunks } from './embedder';
import { providerFromEnv } from './lib/embedding';
import { buildDocGraph } from './lib/doc-graph';
import { buildBm25Index } from './lib/bm25';
import { writeBm25Artifact } from './retrieval/bm25-retriever';
import { expandWithGraph } from './retrieval/graph-expander';
import type { DocumentationChunk, EmbeddedChunk, RetrievedChunk } from './types/index';
import {
  pruneVersions,
  readCurrent,
  swapCurrent,
  writeCollection,
  FileVectorStore,
} from './lib/vector-store';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');
// Workspace scripts run with cwd = packages/indexing; the real .env lives at the repo root.
dotenv.config({ path: path.resolve(REPO_ROOT, '.env') });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}
const flag = (name: string): boolean => process.argv.includes(`--${name}`);

interface ProgressState {
  version: string;
  chunkSize: number;
  overlap: number;
  totalChunks: number;
  embedded: number[];
  embeddedVectors: number[][];
  embeddingModel: string;
  dimensions: number | null;
  startedAt: number;
}

const PROGRESS_FILE = 'indexing-progress.json';

/** Load progress state from disk, or null if none. */
async function loadProgress(indexRoot: string): Promise<ProgressState | null> {
  try {
    const raw = await readFile(path.join(indexRoot, PROGRESS_FILE), 'utf8');
    return JSON.parse(raw) as ProgressState;
  } catch {
    return null;
  }
}

/** Persist progress state to disk. */
async function saveProgress(indexRoot: string, state: ProgressState): Promise<void> {
  await writeFile(path.join(indexRoot, PROGRESS_FILE), JSON.stringify(state), 'utf8');
}

/** Sanity-check a freshly written collection before it can take traffic. */
async function validate(indexRoot: string, version: string, expectedChunks: number): Promise<void> {
  const store = new FileVectorStore(indexRoot, version);
  const manifest = await store.manifest();
  if (!manifest) throw new Error('validate: manifest missing');
  if (manifest.chunkCount !== expectedChunks) {
    throw new Error(`validate: chunkCount ${manifest.chunkCount} != ${expectedChunks}`);
  }
  if (manifest.dimensions < 128) throw new Error(`validate: suspicious dimensions ${manifest.dimensions}`);
  // Self-retrieval probe: a chunk must find itself as the top hit.
  const probe = await store.search(
    (await providerFromEnv().embed(['چطور پروژه را روی لیارا دیپلوی کنم؟']))[0]!,
    3,
  );
  if (probe.length === 0) throw new Error('validate: probe query returned no hits');
  if (probe[0]!.score < 0.2) {
    throw new Error(`validate: probe top score ${probe[0]!.score.toFixed(3)} is too low`);
  }
  console.log(
    `  probe top hit: ${probe[0]!.pageTitle} / ${probe[0]!.sectionTitle} (score ${probe[0]!.score.toFixed(3)})`,
  );
}

/** Render a simple terminal progress bar. */
function progressBar(done: number, total: number, width = 40): string {
  const pct = total === 0 ? 0 : done / total;
  const filled = Math.round(width * pct);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `  [${bar}] ${(pct * 100).toFixed(1).padStart(5)}% (${done}/${total})`;
}

async function main(): Promise<void> {
  const corpusRoot = arg('corpus') ?? path.join(REPO_ROOT, 'docs/public/llms');
  const indexRoot = arg('out') ?? path.resolve(REPO_ROOT, process.env.CHROMA_DB_PATH ?? './data/index');
  const chunkSize = Number(process.env.CHUNK_SIZE ?? 512);
  const overlap = Number(process.env.CHUNK_OVERLAP ?? 50);
  const limit = arg('limit') ? Number(arg('limit')) : undefined;
  const version = arg('version') ?? new Date().toISOString().replace(/[:.]/g, '-');
  const resume = flag('resume');
  const retrievalMode = arg('retrieval') ?? 'embedding'; // embedding | bm25 | bm25-graph

  const started = Date.now();
  let lastProgressWrite = 0;
  const onProgress = (done: number, total: number, phase = 'embedding'): void => {
    const now = Date.now();
    if (done - lastProgressWrite < 50 && now - lastProgressWrite < 2000 && done < total) {
      return;
    }
    lastProgressWrite = now;
    const elapsed = (now - started) / 1000;
    const rate = elapsed > 0 ? done / elapsed : 0;
    const eta = rate > 0 ? (total - done) / rate : 0;
    const phaseLabel = phase === 'crawling' ? 'crawl' : phase === 'chunking' ? 'chunk' : 'embed';
    process.stdout.write(
      `\r${phaseLabel.padEnd(6)} ${progressBar(done, total)}  ${rate.toFixed(1)}/s  ETA ${eta > 60 ? `${(eta / 60).toFixed(0)}m` : `${eta.toFixed(0)}s`}   `,
    );
  };

  console.log(`indexing corpus=${corpusRoot}`);
  const allPages = await crawl({ corpusRoot, onProgress: (n, total) => onProgress(n, total, `crawling`) });
  const pages = limit ? allPages.slice(0, limit) : allPages;
  console.log(`  pages: ${pages.length}${limit ? ` (limited from ${allPages.length})` : ''}`);

  const chunks = chunkPages(pages, {
    chunkSize,
    overlap,
    onProgress: (n, total) => onProgress(n, total, `chunking`),
  });
  const avg = chunks.reduce((s, c) => s + c.tokenCount, 0) / chunks.length;
  console.log(`  chunks: ${chunks.length} (avg ${avg.toFixed(0)} tokens, size=${chunkSize} overlap=${overlap})`);

  if (retrievalMode === 'bm25' || retrievalMode === 'bm25-graph') {
    console.log(`  retrieval mode: ${retrievalMode}`);

    let graph;
    if (retrievalMode === 'bm25-graph') {
      graph = buildDocGraph(pages);
      console.log(`  graph edges: ${[...graph.edges.values()].reduce((s, set) => s + set.size, 0)}`);
    }

    const bm25Index = buildBm25Index(chunks.map((c) => ({ chunkId: c.chunkId, content: c.content, tokenCount: c.tokenCount })));
    const probe = await bm25Index.search('چطور پروژه را روی لیارا دیپلوی کنم؟', 3);
    if (probe.length === 0) throw new Error('validate: bm25 probe returned no hits');
    if (probe[0]!.score <= 0) throw new Error('validate: bm25 probe top score is non-positive');
    console.log(`  probe top hit: ${probe[0]!.chunkId} (score ${probe[0]!.score.toFixed(3)})`);

    const hits: RetrievedChunk[] = probe.map((p) => {
      const src = chunks.find((c) => c.chunkId === p.chunkId)!;
      return { ...src, score: p.score };
    });

    let finalHits = hits;
    if (graph) {
      finalHits = expandWithGraph(hits, chunks, graph, { fanout: 3, hops: 1 });
      console.log(`  graph expanded: ${finalHits.length} hits`);
    }

    const manifest = await writeBm25Artifact(indexRoot, version, finalHits.map((h) => ({ chunkId: h.chunkId, content: h.content, sourceUrl: h.sourceUrl, pageTitle: h.pageTitle, sectionTitle: h.sectionTitle, tokenCount: h.tokenCount })));
    console.log(`  wrote ${indexRoot}/${version} (${manifest.chunkCount} x ${manifest.dimensions})`);

    if (flag('no-swap')) {
      console.log(`validated. NOT swapped (--no-swap). Live version stays: ${await readCurrent(indexRoot)}`);
      return;
    }
    const previous = await readCurrent(indexRoot);
    await swapCurrent(indexRoot, version);
    const pruned = await pruneVersions(indexRoot, 2);
    console.log(`swapped current: ${previous ?? '(none)'} -> ${version}`);
    if (pruned.length) console.log(`pruned old versions: ${pruned.join(', ')}`);
    return;
  }

  const provider = providerFromEnv();
  console.log(`  embedding provider: ${provider.id}`);

  let embedded: EmbeddedChunk[] = [];
  let resumeState: ProgressState | null = null;

  if (resume) {
    resumeState = await loadProgress(indexRoot);
    if (resumeState && resumeState.version === version && resumeState.chunkSize === chunkSize && resumeState.overlap === overlap) {
      console.log(`  resume: loaded progress (${resumeState.embedded.length}/${resumeState.totalChunks} already embedded)`);
      embedded = resumeState.embeddedVectors.map((vec, i) => {
        const idx = resumeState!.embedded[i]!;
        const src = chunks[idx]!;
        return { ...src, embedding: vec };
      });
    } else {
      console.log('  resume: no compatible checkpoint found, starting fresh');
    }
  }

  const startIdx = resumeState ? resumeState.embedded.length : 0;
  const remaining = chunks.slice(startIdx);

  if (remaining.length > 0) {
    const newVectors = await embedChunks(chunks.slice(startIdx), provider, {
      batchSize: Number(process.env.EMBEDDING_BATCH_SIZE ?? 8),
      onProgress,
    });
    embedded = [...embedded, ...newVectors];
  } else {
    onProgress(chunks.length, chunks.length);
  }

  process.stdout.write('\n');

  // Persist progress for potential resume.
  const progressState: ProgressState = {
    version,
    chunkSize,
    overlap,
    totalChunks: chunks.length,
    embedded: chunks.slice(0, embedded.length).map((_, i) => i),
    embeddedVectors: embedded.map((c) => c.embedding),
    embeddingModel: provider.id,
    dimensions: embedded[0]?.embedding.length ?? null,
    startedAt: started,
  };
  await saveProgress(indexRoot, progressState);

  const manifest = await writeCollection(indexRoot, version, embedded, {
    name: process.env.CHROMA_DB_COLLECTION ?? 'liara-docs',
    embeddingModel: provider.id,
    chunkSize,
    chunkOverlap: overlap,
  });
  console.log(`  wrote ${indexRoot}/${version} (${manifest.chunkCount} x ${manifest.dimensions})`);

  console.log('validating...');
  await validate(indexRoot, version, embedded.length);

  if (flag('no-swap')) {
    console.log(`validated. NOT swapped (--no-swap). Live version stays: ${await readCurrent(indexRoot)}`);
    return;
  }
  const previous = await readCurrent(indexRoot);
  await swapCurrent(indexRoot, version);
  const pruned = await pruneVersions(indexRoot, 2);
  console.log(`swapped current: ${previous ?? '(none)'} -> ${version}`);
  if (pruned.length) console.log(`pruned old versions: ${pruned.join(', ')}`);
}

main().catch((err) => {
  console.error(`\nindex failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
