/**
 * GET /api/session — hand the browser a fresh, server-signed session token.
 *
 * The token is an HMAC-signed JWT (see lib/session). The HMAC secret lives only
 * on the server, so the client can never mint or verify tokens itself — it just
 * holds the opaque string and passes it back on every /api/chat request. This is
 * why ChatContainer fetches the token here instead of building one in the browser.
 */
import { NextResponse } from 'next/server';
import { encodeSession, newSession } from '@/lib/session';
import { budgetState } from '@/lib/context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const session = newSession();
  const budget = budgetState(session);
  return NextResponse.json({
    sessionToken: encodeSession(session),
    budget: { used: budget.used, total: budget.total, exceeded: budget.exceeded },
  });
}
