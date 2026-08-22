/** Public surface of the indexing package (consumed by apps/web). */
export * from './types/index';
export { crawl } from './crawler';
export { chunkPage, chunkPages } from './chunker';
export { embedChunks } from './embedder';
export { createEmbeddingProvider, providerFromEnv, normalizeVector } from './lib/embedding';
export {
  FileVectorStore,
  ChromaVectorStore,
  storeFromEnv,
  writeCollection,
  swapCurrent,
  readCurrent,
  pruneVersions,
} from './lib/vector-store';
export { countTokens, normalize, splitUnits } from './lib/text';
export { EVALUATION_QUESTIONS, randomQuestions } from './data/evaluation-questions';
export { buildBm25Index, type Bm25Index } from './lib/bm25';
export { buildDocGraph, type DocGraph } from './lib/doc-graph';
export { Bm25VectorStore, writeBm25Artifact, readBm25Artifact, type Bm25Artifact } from './retrieval/bm25-retriever';
export { expandWithGraph } from './retrieval/graph-expander';
