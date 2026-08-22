/**
 * BM25-backed retriever compatible with the `VectorStore` interface.
 *
 * Writes a `bm25.json` artifact next to the vector store so runtime can load
 * it without any embedding service.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import type { CollectionManifest, DocumentationChunk, RetrievedChunk, VectorStore } from '../types/index';
import { buildBm25Index } from '../lib/bm25';

export interface Bm25Artifact {
  manifest: CollectionManifest;
  chunks: DocumentationChunk[];
}

export async function writeBm25Artifact(indexRoot: string, version: string, chunks: DocumentationChunk[]): Promise<CollectionManifest> {
  const dir = path.join(indexRoot, version);
  await mkdir(dir, { recursive: true });
  const manifest: CollectionManifest = {
    name: 'liara-docs-bm25',
    version,
    createdAt: new Date().toISOString(),
    embeddingModel: 'bm25',
    dimensions: 0,
    chunkCount: chunks.length,
    chunkSize: 0,
    chunkOverlap: 0,
  };
  await writeFile(path.join(dir, 'bm25.json'), JSON.stringify({ manifest, chunks }), 'utf8');
  return manifest;
}

export async function readBm25Artifact(indexRoot: string, version: string): Promise<Bm25Artifact> {
  const raw = await readFile(path.join(indexRoot, version, 'bm25.json'), 'utf8');
  return JSON.parse(raw) as Bm25Artifact;
}

export class Bm25VectorStore implements VectorStore {
  private index: ReturnType<typeof buildBm25Index> | null = null;
  private chunks: DocumentationChunk[] = [];
  private meta: CollectionManifest | null = null;
  private loading: Promise<void> | null = null;

  constructor(private readonly indexRoot: string, private readonly version?: string) {}

  private async load(): Promise<void> {
    if (this.index) return;
    this.loading ??= (async () => {
      const v = this.version ?? (await readCurrent(this.indexRoot));
      if (!v) throw new Error('bm25 store: no index published');
      const { manifest, chunks } = await readBm25Artifact(this.indexRoot, v);
      this.meta = manifest;
      this.chunks = chunks;
      this.index = buildBm25Index(chunks);
    })();
    await this.loading;
  }

  async search(vector: number[], topK: number): Promise<RetrievedChunk[]> {
    await this.load();
    const results = await this.index!.search('', topK);
    const byId = new Map(this.chunks.map((c) => [c.chunkId, c]));
    return results.map((r) => ({ ...(byId.get(r.chunkId) ?? { chunkId: r.chunkId, content: '', sourceUrl: '', pageTitle: '', sectionTitle: '', tokenCount: 0 }), score: r.score }));
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

/** Read the live version name, or null when no index has been published. */
async function readCurrent(indexRoot: string): Promise<string | null> {
  try {
    const fs = await import('fs/promises');
    const raw = await fs.readFile(path.join(indexRoot, 'current'), 'utf8');
    return raw.trim() || null;
  } catch {
    return null;
  }
}
