/**
 * POST /api/feedback (T054, T055, FR-007).
 * Transient by design: logged for monitoring, never persisted (spec decision).
 */
import { NextResponse } from 'next/server';
import { decodeSession } from '@/lib/session';
import { bumpStreak, resetStreak } from '@/lib/escalation';
import { logMetric } from '@/lib/metrics';
import { checkRateLimit, clientKey, rateLimitHeaders } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const limit = checkRateLimit(`feedback:${clientKey(request.headers)}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'درخواست بیش از حد مجاز.', retryAfterMs: limit.retryAfterMs },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  let body: { sessionToken?: string; responseId?: unknown; type?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'bad_request', message: 'بدنه درخواست معتبر نیست.' }, { status: 400 });
  }

  const type = body.type === 'positive' || body.type === 'negative' ? body.type : null;
  const responseId = typeof body.responseId === 'string' ? body.responseId.slice(0, 64) : '';
  if (!type || !responseId) {
    return NextResponse.json(
      { error: 'bad_request', message: 'نوع بازخورد یا شناسه پاسخ نامعتبر است.' },
      { status: 400 },
    );
  }

  const sessionState = decodeSession(body.sessionToken);
  if (sessionState) {
    // Negative feedback feeds the escalation streak; positive resets it. (rebuilt)
    if (type === 'negative') bumpStreak(sessionState.sessionId);
    else resetStreak(sessionState.sessionId);
  }
  logMetric({
    kind: 'feedback',
    sessionId: sessionState?.sessionId ?? 'anonymous',
    responseId,
    type,
  });
  return NextResponse.json({ status: 'recorded' }, { headers: rateLimitHeaders(limit) });
}
