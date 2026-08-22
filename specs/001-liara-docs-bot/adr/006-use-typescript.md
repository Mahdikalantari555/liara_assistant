# ADR-006: Use TypeScript as Primary Language

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to choose a programming language for the Liara Docs Bot. Options evaluated based on:
- Team expertise
- Ecosystem support for AI/ML libraries
- Deployment compatibility
- Performance

## Decision

We will use **TypeScript** as the primary language.

## Rationale

- **Ecosystem**: Strong support for AI/ML libraries (LangChain, Vercel AI SDK, etc.)
- **Performance**: Node.js runtime is lightweight and fast enough for RAG workloads
- **Deployment**: Easy to containerize and deploy on Liara
- **Type safety**: TypeScript catches errors early and improves maintainability
- **Consistency**: Aligns with the existing Liara documentation site (Next.js/TypeScript)

## Consequences

- All libraries must have TypeScript support or type definitions
- Build step required (transpilation)
- Node.js runtime dependency

## Alternatives Considered

- **Python**: Strong AI ecosystem but heavier deployment footprint
- **Go**: Fast and lightweight but smaller AI/ML ecosystem
