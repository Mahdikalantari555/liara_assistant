/**
 * Evaluation harness (T060, T069, FR-045/FR-046) — retrieval quality only.
 *
 * Measures what the retriever controls, with no LLM calls (free, deterministic,
 * repeatable):
 *  - hit@k       : a retrieved chunk matches at least one expectedAnswerTrait
 *  - miss rate   : no chunk cleared RETRIEVAL_MIN_SCORE          (target < 15%)
 *  - fallback    : miss OR trait-miss => the bot would fall back (target < 10%)
 *  - mrr / score : ranking sanity
 *
 *   npm run eval                    # whole dataset
 *   npm run eval -- --limit 10      # quick pass
 *   npm run eval -- --json out.json # machine-readable report
 */
import { writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { providerFromEnv } from './lib/embedding';
import { FileVectorStore, ChromaVectorStore, readCurrent } from './lib/vector-store';
import { EVALUATION_QUESTIONS } from './data/evaluation-questions';
import { buildBm25Index } from './lib/bm25';
import { buildDocGraph } from './lib/doc-graph';
import { expandWithGraph } from './retrieval/graph-expander';
import { readBm25Artifact } from './retrieval/bm25-retriever';
import type { EvaluationQuestion, RetrievedChunk, VectorStore } from './types/index';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '../../..');
// Workspace scripts run with cwd = packages/indexing; the real .env lives at the repo root.
dotenv.config({ path: path.resolve(REPO_ROOT, '.env') });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

/** Does any retrieved chunk mention an expected trait? */
function traitHitRank(hits: RetrievedChunk[], q: EvaluationQuestion): number {
  const traits = q.expectedAnswerTraits.map((t) => t.toLowerCase());
  for (let i = 0; i < hits.length; i++) {
    const hay = `${hits[i]!.content} ${hits[i]!.sourceUrl} ${hits[i]!.sectionTitle}`.toLowerCase();
    if (traits.some((t) => hay.includes(t))) return i + 1;
  }
  return 0;
}

interface Row {
  questionId: string;
  text: string;
  topScore: number;
  traitRank: number;
  retrievalMiss: boolean;
  wouldFallback: boolean;
  topSource: string;
}

async function main(): Promise<void> {
  const topK = Number(process.env.RETRIEVAL_TOP_K ?? 5);
  const minScore = Number(process.env.RETRIEVAL_MIN_SCORE ?? 0.3);
  const limit = arg('limit') ? Number(arg('limit')) : undefined;
  const indexRoot = path.resolve(REPO_ROOT, process.env.CHROMA_DB_PATH ?? './data/index');
  const retrievalMode = arg('retrieval') ?? 'embedding';

  const chromaHost = process.env.CHROMA_DB_HOST?.trim();
  const store: VectorStore = chromaHost
    ? new ChromaVectorStore(chromaHost, process.env.CHROMA_DB_COLLECTION ?? 'liara-docs')
    : new FileVectorStore(indexRoot);
  if (!chromaHost) {
    const version = await readCurrent(indexRoot);
    if (!version) throw new Error(`eval: no index published under ${indexRoot} — run \`npm run index\` first`);
    console.log(`index: ${indexRoot}/${version} (${await store.count()} chunks)`);
  }

  const provider = providerFromEnv();
  const questions = limit ? EVALUATION_QUESTIONS.slice(0, limit) : EVALUATION_QUESTIONS;
  console.log(`eval: ${questions.length} questions, topK=${topK}, minScore=${minScore}, mode=${retrievalMode}\n`);

  let bm25Index: ReturnType<typeof buildBm25Index> | null = null;
  let graph = buildDocGraph([]);
  if (retrievalMode === 'bm25' || retrievalMode === 'bm25-graph') {
    const version = await readCurrent(indexRoot);
    if (!version) throw new Error(`eval: no index published under ${indexRoot}`);
    const artifact = await readBm25Artifact(indexRoot, version);
    bm25Index = buildBm25Index(artifact.chunks.map((c) => ({ chunkId: c.chunkId, content: c.content, tokenCount: c.tokenCount })));
    if (retrievalMode === 'bm25-graph') {
      // Rebuild graph from pages would require raw pages; for eval we only use BM25 hits.
      console.log('  note: graph expansion skipped in eval (requires raw pages)');
    }
  }

  const rows: Row[] = [];
  for (const q of questions) {
    let hits: RetrievedChunk[] = [];
    if (bm25Index) {
      const probe = await bm25Index.search(q.text, topK);
      const byId = new Map(await readBm25Artifact(indexRoot, (await readCurrent(indexRoot))!).then((a) => a.chunks.map((c) => [c.chunkId, c])));
      hits = probe.map((p) => ({ ...(byId.get(p.chunkId) ?? { chunkId: p.chunkId, content: '', sourceUrl: '', pageTitle: '', sectionTitle: '', tokenCount: 0 }), score: p.score }));
    } else {
      const [vector] = await provider.embed([q.text]);
      hits = await store.search(vector!, topK);
    }
    const relevant = hits.filter((h) => h.score >= minScore);
    const traitRank = traitHitRank(relevant, q);
    const row: Row = {
      questionId: q.questionId,
      text: q.text,
      topScore: hits[0]?.score ?? 0,
      traitRank,
      retrievalMiss: relevant.length === 0,
      wouldFallback: relevant.length === 0 || traitRank === 0,
      topSource: hits[0]?.sourceUrl ?? '',
    };
    rows.push(row);
    const mark = row.retrievalMiss ? 'MISS' : traitRank ? `hit@${traitRank}` : 'off-trait';
    console.log(`  ${q.questionId} ${row.topScore.toFixed(3)} ${mark.padEnd(9)} ${q.text.slice(0, 46)}`);
  }

  const n = rows.length;
  const hits = rows.filter((r) => r.traitRank > 0);
  const summary = {
    questions: n,
    topK,
    minScore,
    hitRate: hits.length / n,
    hitAt1: rows.filter((r) => r.traitRank === 1).length / n,
    mrr: rows.reduce((s, r) => s + (r.traitRank ? 1 / r.traitRank : 0), 0) / n,
    retrievalMissRate: rows.filter((r) => r.retrievalMiss).length / n,
    fallbackRate: rows.filter((r) => r.wouldFallback).length / n,
    avgTopScore: rows.reduce((s, r) => s + r.topScore, 0) / n,
    embeddingProvider: provider.id,
    generatedAt: new Date().toISOString(),
  };

  const pct = (x: number): string => `${(x * 100).toFixed(1)}%`;
  console.log(`\nhit rate           ${pct(summary.hitRate)}`);
  console.log(`hit@1              ${pct(summary.hitAt1)}`);
  console.log(`MRR                ${summary.mrr.toFixed(3)}`);
  console.log(`retrieval miss     ${pct(summary.retrievalMissRate)}  (target < 15%)`);
  console.log(`fallback rate      ${pct(summary.fallbackRate)}  (target < 10%)`);
  console.log(`avg top score      ${summary.avgTopScore.toFixed(3)}`);

  const jsonPath = arg('json');
  if (jsonPath) {
    await writeFile(jsonPath, JSON.stringify({ summary, rows }, null, 2), 'utf8');
    console.log(`\nreport: ${jsonPath}`);
  }

  const failures: string[] = [];
  if (summary.retrievalMissRate >= 0.15) failures.push(`miss rate ${pct(summary.retrievalMissRate)} >= 15%`);
  if (summary.fallbackRate >= 0.1) failures.push(`fallback rate ${pct(summary.fallbackRate)} >= 10%`);
  if (failures.length) {
    console.error(`\nTARGETS NOT MET: ${failures.join('; ')}`);
    if (process.argv.includes('--strict')) process.exit(1);
  } else {
    console.log('\nall retrieval targets met.');
  }
}

main().catch((err) => {
  console.error(`eval failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
