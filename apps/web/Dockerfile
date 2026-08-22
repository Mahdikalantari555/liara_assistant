# syntax=docker.io/docker/dockerfile:1
FROM docker.io/node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# ---------- dependencies ----------
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY packages/indexing/package.json ./packages/indexing/
RUN npm ci --omit=dev

# ---------- build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/indexing/node_modules ./packages/indexing/node_modules
COPY . .
RUN npm run build

# ---------- runtime ----------
FROM base AS runner
# Copy committed index artifact + corpus (read-only at runtime).
COPY --from=builder /app/data/index /app/data/index
COPY --from=builder /app/docs/public/llms /app/docs/public/llms

# Next.js standalone output.
COPY --from=builder /app/apps/web/.next/standalone/. /app/
COPY --from=builder /app/apps/web/.next/static /app/.next/static
COPY --from=builder /app/apps/web/public /app/public

# Transpile-package sources (kept alongside in case runtime needs them).
COPY --from=builder /app/packages/indexing/src /app/packages/indexing/src

# Non-root for Liara Node platform.
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
ENV PORT=3000 \
    CHROMA_DB_PATH=/app/data/index \
    LLAMA_SERVER_URL=http://127.0.0.1:8089

CMD ["node", "server.js"]
