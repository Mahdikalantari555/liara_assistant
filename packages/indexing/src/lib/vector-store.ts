/**
 * Vector store abstraction (FR-012, FR-013, FR-016, FR-030, FR-032).
 *
 * Two backends behind one `VectorStore` contract:
 *
 *  1. `file` (MVP default) — a committed, precomputed index artifact under
 *     `data/index/<version>/`, read-only at runtime, brute-force cosine search.
 *     Zero services, works fully offline, and every app instance reads the same
 *     versioned artifact baked into the image (FR-029/FR-030 by immutability).
 *  2. `chroma` — a ChromaDB HTTP server, enabled by setting CHROMA_DB_HOST.
 *     Same contract, so nothing above this file changes.
 *
 * DEVIATION from FR-012 for MVP: the `chromadb` npm package is an HTTP client
 * for a separate Chroma server process; there is no embedded JS mode. Shipping
 * one would add a second always-on service, contradicting FR-016 (offline core
 * RAG), FR-020 (frugal, minimum external dependencies) and the "upload the
 * embeddings, reindex in CI" delivery model. The file backend is the default and
 * the Chroma adapter stays available for scale-out. See ADR 002/003.
 *
 * Artifact layout (versioned collection swap, FR-032):
 *   data/index/current              -> text file naming the live version dir
 *   data/index/<version>/manifest.json
 *   data/index/<version>/chunks.json   metadata + text, order matches vectors
 *   data/index/<version>/vectors.f32   float32 LE, chunkCount * dimensions
 *
 * Vectors are L2-normalized at write time, so cosine similarity is a dot
 * product and search needs no per-query normalization of stored rows.
 */
import { readFile, writeFile, mkdir, rm, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type {
  CollectionManifest,
  DocumentationChunk,
  EmbeddedChunk,
  RetrievedChunk,
  VectorStore,
} from '../types/index';
import { normalizeVector } from './embedding';

const CURRENT_POINTER = 'current';

/* ------------------------------------------------------------------ writing */

/**
 * Write a new version directory. Does NOT swap it live — call `swapCurrent`
 * after validation so a bad index can never take traffic (FR-035).
 */
export async function writeCollection(
  indexRoot: string,
  version: string,
  chunks: EmbeddedChunk[],
  meta: Omit<CollectionManifest, 'createdAt' | 'chunkCount' | 'dimensions' | 'version'>,
): Promise<CollectionManifest> {
  if (chunks.length === 0) throw new Error('writeCollection: refusing to write an empty index');
  const dimensions = chunks[0]!.embedding.length;
  const dir = path.join(indexRoot, version);
  await mkdir(dir, { recursive: true });

  const buf = Buffer.allocUnsafe(chunks.length * dimensions * 4);
  const metaRows: DocumentationChunk[] = [];
  let offset = 0;
  for (const c of chunks) {
    if (c.embedding.length !== dimensions) {
      throw new Error(`writeCollection: dimension drift on ${c.chunkId}`);
    }
    for (const value of normalizeVector(c.embedding)) {
      buf.writeFloatLE(value, offset);
      offset += 4;
    }
    metaRows.push({
      chunkId: c.chunkId,
      content: c.content,
      sourceUrl: c.sourceUrl,
      pageTitle: c.pageTitle,
      sectionTitle: c.sectionTitle,
      tokenCount: c.tokenCount,
    });
  }

  const manifest: CollectionManifest = {
    ...meta,
    version,
    createdAt: new Date().toISOString(),
    dimensions,
    chunkCount: chunks.length,
  };

  await writeFile(path.join(dir, 'vectors.f32'), buf);
  await writeFile(path.join(dir, 'chunks.json'), JSON.stringify(metaRows), 'utf8');
  await writeFile(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}

/** Point `current` at a version. Atomic enough: single small file write. */
export async function swapCurrent(indexRoot: string, version: string): Promise<void> {
  const dir = path.join(indexRoot, version);
  if (!existsSync(path.join(dir, 'manifest.json'))) {
    throw new Error(`swapCurrent: version ${version} is not a complete collection`);
  }
  await writeFile(path.join(indexRoot, CURRENT_POINTER), version, 'utf8');
}

/** Read the live version name, or null when no index has been published. */
export async function readCurrent(indexRoot: string): Promise<string | null> {
  try {
    const v = (await readFile(path.join(indexRoot, CURRENT_POINTER), 'utf8')).trim();
    return v || null;
  } catch {
    return null;
  }
}

/** Keep the newest `keep` versions plus the live one; delete the rest. */
export async function pruneVersions(indexRoot: string, keep = 2): Promise<string[]> {
  const current = await readCurrent(indexRoot);
  const entries = (await readdir(indexRoot, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse();
  const survivors = new Set(entries.slice(0, keep));
  if (current) survivors.add(current);
  const removed: string[] = [];
  for (const name of entries) {
    if (survivors.has(name)) continue;
    await rm(path.join(indexRoot, name), { recursive: true, force: true });
    removed.push(name);
  }
  return removed;
}

/* ------------------------------------------------------------------ reading */

/** File-backed store. Loads the artifact once, then searches in memory. */
export class FileVectorStore implements VectorStore {
  private vectors: Float32Array | null = null;
  private chunks: DocumentationChunk[] = [];
  private meta: CollectionManifest | null = null;
  private loading: Promise<void> | null = null;

  constructor(
    private readonly indexRoot: string,
    /** Pin a version; default follows the `current` pointer. */
    private readonly version?: string,
  ) {}

  private async load(): Promise<void> {
    if (this.vectors) return;
    this.loading ??= (async () => {
      const version = this.version ?? (await readCurrent(this.indexRoot));
      if (!version) {
        throw new Error(
          `vector store: no index published under ${this.indexRoot}. ` +
            `Run \`npm run index\` or fetch the CI artifact.`,
        );
      }
      const dir = path.join(this.indexRoot, version);
      const [manifestRaw, chunksRaw, vectorsRaw] = await Promise.all([
        readFile(path.join(dir, 'manifest.json'), 'utf8'),
        readFile(path.join(dir, 'chunks.json'), 'utf8'),
        readFile(path.join(dir, 'vectors.f32')),
      ]);
      this.meta = JSON.parse(manifestRaw) as CollectionManifest;
      this.chunks = JSON.parse(chunksRaw) as DocumentationChunk[];
      const expected = this.meta.chunkCount * this.meta.dimensions * 4;
      if (vectorsRaw.byteLength !== expected) {
        throw new Error(
          `vector store: ${version} corrupt — vectors.f32 is ${vectorsRaw.byteLength}B, expected ${expected}B`,
        );
      }
      if (this.chunks.length !== this.meta.chunkCount) {
        throw new Error(`vector store: ${version} corrupt — chunks.json length mismatch`);
      }
      this.vectors = new Float32Array(
        vectorsRaw.buffer,
        vectorsRaw.byteOffset,
        vectorsRaw.byteLength / 4,
      );
    })();
    await this.loading;
  }

  async search(vector: number[], topK: number): Promise<RetrievedChunk[]> {
    await this.load();
    const dims = this.meta!.dimensions;
    if (vector.length !== dims) {
      throw new Error(`vector store: query has ${vector.length} dims, index has ${dims}`);
    }
    const query = normalizeVector([...vector]);
    const vectors = this.vectors!;
    const count = this.meta!.chunkCount;

    // Bounded max-heap would be tidier; for ~10k chunks a scan + partial sort is
    // faster than the bookkeeping. ponytail: revisit past ~200k chunks (HNSW).
    const scores = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      const base = i * dims;
      let dot = 0;
      for (let d = 0; d < dims; d++) dot += vectors[base + d]! * query[d]!;
      scores[i] = dot;
    }
    const order = Array.from({ length: count }, (_, i) => i)
      .sort((a, b) => scores[b]! - scores[a]!)
      .slice(0, Math.max(1, topK));
    return order.map((i) => ({ ...this.chunks[i]!, score: scores[i]! }));
  }

  async count(): Promise<number> {
    await this.load();
    return this.meta!.chunkCount;
  }

  async manifest(): Promise<CollectionManifest | null> {
    await this.load();
    return this.meta;
  }
}

/** ChromaDB HTTP adapter — enabled when CHROMA_DB_HOST is set. */
export class ChromaVectorStore implements VectorStore {
  constructor(
    private readonly host: string,
    private readonly collection: string,
  ) {}

  private async collectionId(): Promise<string> {
    const res = await fetch(
      `${this.host.replace(/\/+$/, '')}/api/v1/collections/${encodeURIComponent(this.collection)}`,
    );
    if (!res.ok) throw new Error(`chroma: collection lookup HTTP ${res.status}`);
    const json = (await res.json()) as { id?: string };
    if (!json.id) throw new Error('chroma: collection has no id');
    return json.id;
  }

  async search(vector: number[], topK: number): Promise<RetrievedChunk[]> {
    const id = await this.collectionId();
    const res = await fetch(`${this.host.replace(/\/+$/, '')}/api/v1/collections/${id}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_embeddings: [vector],
        n_results: topK,
        include: ['documents', 'metadatas', 'distances'],
      }),
    });
    if (!res.ok) throw new Error(`chroma: query HTTP ${res.status}`);
    const json = (await res.json()) as {
      ids: string[][];
      documents: string[][];
      metadatas: Array<Array<Record<string, unknown>>>;
      distances: number[][];
    };
    const ids = json.ids[0] ?? [];
    return ids.map((chunkId, i) => {
      const m = json.metadatas[0]?.[i] ?? {};
      return {
        chunkId,
        content: json.documents[0]?.[i] ?? '',
        sourceUrl: String(m.source_url ?? ''),
        pageTitle: String(m.page_title ?? ''),
        sectionTitle: String(m.section_title ?? ''),
        tokenCount: Number(m.token_count ?? 0),
        // Chroma returns squared L2 on normalized vectors: cos = 1 - d/2.
        score: 1 - (json.distances[0]?.[i] ?? 2) / 2,
      };
    });
  }

  async count(): Promise<number> {
    const id = await this.collectionId();
    const res = await fetch(`${this.host.replace(/\/+$/, '')}/api/v1/collections/${id}/count`);
    if (!res.ok) throw new Error(`chroma: count HTTP ${res.status}`);
    return (await res.json()) as number;
  }

  async manifest(): Promise<CollectionManifest | null> {
    return null;
  }
}

/** Pick a backend from env: CHROMA_DB_HOST wins, else the file artifact. */
export function storeFromEnv(indexRoot?: string): VectorStore {
  const host = process.env.CHROMA_DB_HOST?.trim();
  if (host) {
    return new ChromaVectorStore(host, process.env.CHROMA_DB_COLLECTION ?? 'liara-docs');
  }
  return new FileVectorStore(indexRoot ?? process.env.CHROMA_DB_PATH ?? './data/index');
}
