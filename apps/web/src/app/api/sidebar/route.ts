/**
 * GET /api/sidebar?context=<query> (T045, US6).
 * Contract: specs/001-liara-docs-bot/contracts/api.md
 */
import { NextResponse } from 'next/server';
import { sidebarLinks } from '@/lib/sidebar';
import { checkRateLimit, clientKey, rateLimitHeaders } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/intent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const limit = checkRateLimit(`sidebar:${clientKey(request.headers)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'درخواست بیش از حد مجاز.', retryAfterMs: limit.retryAfterMs },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }
  const context = sanitizeInput(new URL(request.url).searchParams.get('context') ?? '').text;
  const { links, fallback } = await sidebarLinks(context);
  return NextResponse.json({ links, fallback }, { headers: rateLimitHeaders(limit) });
}
