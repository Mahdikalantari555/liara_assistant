/**
 * GET /api/questions — random starter questions (T037/US1, FR-048).
 * Server route so the dataset stays in the indexing package and is not shipped
 * to the browser in full.
 */
import { NextResponse } from 'next/server';
import { randomQuestions } from '@liara-docs-bot/indexing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  const raw = Number(new URL(request.url).searchParams.get('count') ?? 4);
  const count = Math.min(5, Math.max(3, Number.isFinite(raw) ? raw : 4));
  return NextResponse.json(
    { questions: randomQuestions(count).map((q) => ({ id: q.questionId, text: q.text })) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
