/** @type {import('next').NextConfig} */
// DEVIATION from plan.md's `output: "export"`: the chat needs server-side API
// routes (/api/chat holds the LLM key, retrieval, rate limiting). A static export
// cannot run route handlers, so the app is a standalone Node server behind
// Liara's Node platform. `standalone` keeps the runtime image small (~120MB) and
// still satisfies FR-018/FR-019/FR-029. See infra/liara/README.md.
const nextConfig = {
  output: 'standalone',
  // `/media/E` is NTFS (`ntfs3`). Next’s `.next` has thousands of tiny files
  // (webpack chunks, static assets, traces), which is the worst-case I/O
  // pattern for NTFS on Linux: builds crawl and `rm -rf .next` can hang.
  // Route build artifacts to tmpfs for local dev/build; Docker uses its own
  // native overlay FS so `distDir` there stays the default `.next`.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  poweredByHeader: false,
  // The index artifact + corpus live outside apps/web; standalone tracing needs
  // the monorepo root to copy workspace files.
  // The indexing package ships TypeScript sources (no build artifact to keep in
  // sync); Next compiles it together with the app.
  transpilePackages: ['@liara-docs-bot/indexing'],
  eslint: { ignoreDuringBuilds: false },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
