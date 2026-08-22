# ADR-005: Deploy on Liara Infrastructure

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to deploy the Liara Docs Bot. Options include:
1. Deploy on Liara infrastructure
2. Deploy on other cloud providers (Vercel, AWS, etc.)
3. Self-hosted deployment

## Decision

We will deploy on **Liara infrastructure**.

## Rationale

- **Requirement**: Deployment on Liara is an explicit MVP requirement
- **Consistency**: The agent serves Liara documentation; hosting on Liara demonstrates the platform
- **Integration**: Easier to integrate with Liara's ecosystem in the future
- **Cost**: Liara's pricing model aligns with the frugal, lightweight design goals

## Consequences

- Application must be compatible with Liara's deployment model (Docker-based)
- Resource constraints (RAM, CPU) must be respected
- Must use Liara's environment configuration and secrets management

## Alternatives Considered

- **Other cloud providers**: Rejected due to explicit requirement and higher cost
