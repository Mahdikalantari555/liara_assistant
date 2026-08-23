# syntax=docker.io/docker/dockerfile:1

# ---------- base ----------
FROM node:20-alpine AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------- dependencies (full install for build type-check/lint) ----------
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/indexing/package.json ./packages/indexing/
RUN npm ci --no-audit --no-fund

# ---------- build ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM base AS runner
WORKDIR /app

# Production deps only.
COPY --from=deps /app/node_modules ./node_modules

# Built app + workspace sources (kept for transpiled indexing package).
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages/indexing ./packages/indexing

# Committed retrieval index artifact + source corpus (read-only at runtime).
COPY --from=builder /app/data/index ./data/index
COPY --from=builder /app/docs/public/llms ./docs/public/llms

WORKDIR /app/apps/web
ENV PORT=3000 \
    NODE_ENV=production \
    CHROMA_DB_PATH=/app/data/index \
    EMBEDDING_TYPE=api

EXPOSE 3000
# production requires SESSION_SECRET; generate a random one at boot if the
# operator has not set a persistent secret in Liara's environment.
CMD ["sh", "-c", "[ -z \"$SESSION_SECRET\" ] && export SESSION_SECRET=$(head -c 32 /dev/urandom | base64) ; exec npm run start"]
