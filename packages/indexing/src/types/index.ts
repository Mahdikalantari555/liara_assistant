/**
 * Shared types for the indexing pipeline and the web runtime.
 * Spec: specs/001-liara-docs-bot/data-model.md
 */

/** A chunk of documentation persisted in the vector store. */
export interface DocumentationChunk {
  chunkId: string;
  content: string;
  sourceUrl: string;
  pageTitle: string;
  sectionTitle: string;
  tokenCount: number;
}

/** Chunk plus its embedding vector, as written to a collection. */
export interface EmbeddedChunk extends DocumentationChunk {
  embedding: number[];
}

/** A raw documentation page read from disk before chunking. */
export interface CrawledPage {
  /** Repo-relative path, e.g. docs/public/llms/paas/about.md */
  filePath: string;
  /** Canonical docs.liara.ir URL from the `Original link:` header. */
  sourceUrl: string;
  pageTitle: string;
  /** Markdown body with the `Original link:` header stripped. */
  content: string;
  /** Top-level category derived from the path, e.g. `paas`. */
  category: string;
}

/** One retrieval hit. */
export interface RetrievedChunk extends DocumentationChunk {
  /** Cosine similarity in [-1, 1]; higher is closer. */
  score: number;
}

/** Citation rendered at the end of an answer. */
export interface SourceCitation {
  title: string;
  url: string;
  section: string;
  score: number;
}

/** Serialized collection payload (one JSON file per version). */
export interface CollectionManifest {
  name: string;
  version: string;
  createdAt: string;
  embeddingModel: string;
  dimensions: number;
  chunkCount: number;
  chunkSize: number;
  chunkOverlap: number;
}

/** Embedding provider contract — local (llama-server) or remote API. */
export interface EmbeddingProvider {
  readonly id: string;
  readonly dimensions: number | null;
  embed(texts: string[]): Promise<number[][]>;
}

/** Vector store contract — offline file store or ChromaDB server. */
export interface VectorStore {
  search(vector: number[], topK: number): Promise<RetrievedChunk[]>;
  count(): Promise<number>;
  manifest(): Promise<CollectionManifest | null>;
}

/** An evaluation-dataset question (also used as chat starter chips). */
export interface EvaluationQuestion {
  questionId: string;
  text: string;
  expectedAnswerTraits: string[];
  suggestedFollowUps?: string[];
  category: string;
}
