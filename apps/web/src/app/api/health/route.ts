/**
 * GET /api/health — liveness + monitoring surface (FR-025, SC-038).
 * Returns booleans, counters and index metadata only: never a secret value.
 */
import { NextResponse } from 'next/server';
import { configHealth } from '@/lib/config';
import { indexHealth } from '@/lib/retrieval';
import { snapshot } from '@/lib/metrics';
import { cacheSize } from '@/lib/cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const index = await indexHealth();
  const ok = index.ok === true;
  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      index,
      config: configHealth(),
      metrics: { ...snapshot(), cacheEntries: cacheSize() },
    },
    { status: ok ? 200 : 503 },
  );
}
