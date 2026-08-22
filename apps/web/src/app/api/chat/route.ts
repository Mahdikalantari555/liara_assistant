/**
 * POST /api/chat (T028, T036, T052) — the whole RAG turn.
 *
 * Order matters and each step has a reason:
 *   rate limit -> sanitize -> budget -> cache -> clarify -> retrieve -> LLM
 * Cheap rejections come first so an abusive or empty request never reaches a
 * paid provider, and the cache is checked before retrieval so a repeat question
 * costs zero tokens and zero embedding calls (FR-026).
 *
 * Contract: specs/001-liara-docs-bot/contracts/api.md
 */
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getConfig } from '@/lib/config';
import { checkRateLimit, clientKey, rateLimitHeaders } from '@/lib/rate-limit';
import { sanitizeInput, detectAmbiguity } from '@/lib/intent';
import { appendTurn, decodeSession, encodeSession, newSession } from '@/lib/session';
import { budgetState, hasContext, isSummaryRequest, nextTopic } from '@/lib/context';
import { checkEscalation, currentStreak, registerTurn } from '@/lib/escalation';
import { retrieve, toCitations, toDocLinks } from '@/lib/retrieval';
import {
  buildAnswerPrompt,
  buildClarificationPrompt,
  buildSuggestionsPrompt,
  buildSummaryPrompt,
  parseSuggestions,
} from '@/lib/prompts';
import { complete } from '@/lib/llm';
import { logError, logMetric } from '@/lib/metrics';
import { cacheGet, cacheKey, cacheSet } from '@/lib/cache';
import {
  DEFAULT_LINKS,
  SUPPORT_LINE,
  budgetExceededResponse,
  emptyInputResponse,
  ensureCitationBlock,
  DOCS_MISS_MARKER,
  indexDownResponse,
  withSupportReferral,
  linkifyDocMarkers,
  noResultsResponse,
  providerDownResponse,
  rateLimitedResponse,
} from '@/lib/fallback';
import type { ChatResponse, Citation, DocLink } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Body of a cached answer (everything session-independent). */
interface CachedAnswer {
  reply: string;
  citations: Citation[];
  suggestions: string[];
  links: DocLink[];
  tokensIn: number;
  tokensOut: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();
  const cfg = getConfig();

  let body: { sessionToken?: string; message?: unknown; topic?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'bad_request', message: 'بدنه درخواست معتبر نیست.' }, { status: 400 });
  }

  const session = decodeSession(body.sessionToken) ?? newSession();

  // 1. Rate limit before any work (FR-024, SC-016).
  const limit = checkRateLimit(clientKey(request.headers, session.sessionId));
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limited',
        message: rateLimitedResponse(limit.retryAfterMs),
        retryAfterMs: limit.retryAfterMs,
      },
      { status: 429, headers: rateLimitHeaders(limit) },
    );
  }

  // 2. Sanitize (FR-010).
  const clean = sanitizeInput(body.message);
  if (clean.empty) {
    return NextResponse.json(
      { error: 'empty_message', message: emptyInputResponse() },
      { status: 400, headers: rateLimitHeaders(limit) },
    );
  }
  const question = clean.text;

  // Client topic hint (conversation-flow): sanitized like any user text, capped.
  let clientTopic = '';
  if (typeof body.topic === 'string' && body.topic.trim()) {
    clientTopic = sanitizeInput(body.topic).text.slice(0, 80);
  }

  // Failure-streak bookkeeping (conversation-flow): a duplicate re-ask bumps,
  // a fresh substantive question resets. Fires referral at the threshold.
  // Snapshot the streak first so 👎s from earlier turns survive this turn's reset.
  const enteringStreak = currentStreak(session.sessionId);
  registerTurn(session.sessionId, question);

  const respond = (
    payload: Omit<ChatResponse, 'sessionToken' | 'responseId' | 'budget'>,
    updated = session,
  ): NextResponse => {
    const esc = checkEscalation(session.sessionId, enteringStreak);
    const withEscalation: typeof payload = esc.escalated
      ? { ...payload, reply: `${payload.reply}\n\n---\n${esc.referral}`, escalated: true }
      : payload;
    const budget = budgetState(updated);
    const full: ChatResponse = {
      ...withEscalation,
      sessionToken: encodeSession(updated),
      responseId: randomUUID(),
      budget: { used: budget.used, total: budget.total, exceeded: budget.exceeded },
    };
    return NextResponse.json(full, { headers: rateLimitHeaders(limit) });
  };

  // 3. Token budget hard stop, with the summary escape hatch (FR-009, SC-009).
  const budget = budgetState(session);
  if (budget.exceeded) {
    if (isSummaryRequest(question) && session.messages.length > 0) {
      try {
        const summary = await complete(buildSummaryPrompt(session.messages), { maxTokens: 350 });
        logMetric({
          kind: 'query',
          sessionId: session.sessionId,
          latencyMs: Date.now() - startedAt,
          tokensIn: summary.tokensIn,
          tokensOut: summary.tokensOut,
          retrievalMiss: false,
          fallbackUsed: false,
          clarifying: false,
          cacheHit: false,
          topScore: 0,
          provider: summary.provider,
        });
        return respond({
          reply: summary.text,
          citations: [],
          suggestions: [],
          links: [],
          clarifying: false,
          fallback: false,
          cached: false,
          tokenUsage: { input: summary.tokensIn, output: summary.tokensOut },
        });
      } catch (err) {
        logError('chat.summary', err);
      }
    }
    return respond({
      reply: budgetExceededResponse(),
      citations: [],
      suggestions: [],
      links: [],
      clarifying: false,
      fallback: true,
      cached: false,
      tokenUsage: { input: 0, output: 0 },
    });
  }

  const topic = clientTopic || nextTopic(session, question);

  // 4. Cache (FR-026, SC-020) — keyed by question + topic, not by session.
  const key = cacheKey(question, topic);
  const cached = cacheGet<CachedAnswer>(key);
  if (cached) {
    const updated = appendTurn(session, question, cached.reply, 0);
    updated.topic = topic;
    logMetric({
      kind: 'query',
      sessionId: session.sessionId,
      latencyMs: Date.now() - startedAt,
      tokensIn: 0,
      tokensOut: 0,
      retrievalMiss: false,
      fallbackUsed: false,
      clarifying: false,
      cacheHit: true,
      topScore: cached.citations[0]?.score ?? 0,
      provider: 'cache',
    });
    return respond(
      {
        reply: cached.reply,
        citations: cached.citations,
        suggestions: cached.suggestions,
        links: cached.links,
        clarifying: false,
        fallback: false,
        cached: true,
        tokenUsage: { input: 0, output: 0 },
      },
      updated,
    );
  }

  // 5. Ambiguity — ask instead of guessing (FR-004, SC-005). A client-supplied
  // topic already disambiguates the turn (conversation-flow), so skip asking.
  const ambiguity = cfg.retrieval.clarifyEnabled && !clientTopic
    ? detectAmbiguity(question, hasContext(session))
    : { ambiguous: false as const };
  if (ambiguity.ambiguous && ambiguity.label && ambiguity.options) {
    try {
      const clarify = await complete(
        buildClarificationPrompt(question, ambiguity.label, ambiguity.options),
        { maxTokens: 220, temperature: 0.3 },
      );
      const updated = appendTurn(session, question, clarify.text, clarify.tokensIn + clarify.tokensOut);
      updated.topic = topic;
      logMetric({
        kind: 'query',
        sessionId: session.sessionId,
        latencyMs: Date.now() - startedAt,
        tokensIn: clarify.tokensIn,
        tokensOut: clarify.tokensOut,
        retrievalMiss: false,
        fallbackUsed: clarify.usedFallback,
        clarifying: true,
        cacheHit: false,
        topScore: 0,
        provider: clarify.provider,
      });
      return respond(
        {
          reply: clarify.text,
          citations: [],
          suggestions: ambiguity.options.slice(0, 4).map((o) => `${o}`),
          links: DEFAULT_LINKS,
          clarifying: true,
          fallback: false,
          cached: false,
          tokenUsage: { input: clarify.tokensIn, output: clarify.tokensOut },
        },
        updated,
      );
    } catch (err) {
      logError('chat.clarify', err);
      // Clarification is a nicety; fall through to a normal answer.
    }
  }

  // 6. Retrieve (FR-041). An index failure is a graceful fallback, not a 500.
  let retrieval;
  try {
    retrieval = await retrieve(question, topic);
  } catch (err) {
    logError('chat.retrieve', err);
    return respond({
      reply: indexDownResponse(),
      citations: [],
      suggestions: [],
      links: DEFAULT_LINKS,
      clarifying: false,
      fallback: true,
      cached: false,
      tokenUsage: { input: 0, output: 0 },
    });
  }

  if (retrieval.miss) {
    const updated = appendTurn(session, question, noResultsResponse(), 0);
    updated.topic = topic;
    logMetric({
      kind: 'query',
      sessionId: session.sessionId,
      latencyMs: Date.now() - startedAt,
      tokensIn: 0,
      tokensOut: 0,
      retrievalMiss: true,
      fallbackUsed: true,
      clarifying: false,
      cacheHit: false,
      topScore: retrieval.topScore,
      provider: 'none',
    });
    return respond(
      {
        reply: noResultsResponse(),
        citations: [],
        suggestions: [],
        links: toDocLinks(retrieval.chunks, 5),
        clarifying: false,
        fallback: true,
        cached: false,
        tokenUsage: { input: 0, output: 0 },
      },
      updated,
    );
  }

  const citations = toCitations(retrieval.relevant);
  const links = toDocLinks(retrieval.chunks, 8);

  // 7. Generate.
  let answer;
  try {
    answer = await complete(buildAnswerPrompt(question, retrieval.relevant, session.messages, topic), {
      maxTokens: 900,
    });
  } catch (err) {
    logError('chat.complete', err);
    logMetric({
      kind: 'query',
      sessionId: session.sessionId,
      latencyMs: Date.now() - startedAt,
      tokensIn: 0,
      tokensOut: 0,
      retrievalMiss: false,
      fallbackUsed: true,
      clarifying: false,
      cacheHit: false,
      topScore: retrieval.topScore,
      provider: 'unavailable',
    });
    return respond({
      reply: providerDownResponse(links),
      citations,
      suggestions: [],
      links,
      clarifying: false,
      fallback: true,
      cached: false,
      tokenUsage: { input: 0, output: 0 },
    });
  }

  // A docs-miss answer carries no citations: the retrieved chunks were not
  // good enough to answer, so listing them would be noise. Support line only.
  const missedDocs = answer.text.includes(DOCS_MISS_MARKER);
  const effectiveCitations = missedDocs ? [] : citations;
  const reply = linkifyDocMarkers(
    withSupportReferral(ensureCitationBlock(answer.text, effectiveCitations)),
    retrieval.relevant.map((c) => c.sourceUrl),
  );

  // 8. Follow-up suggestions (FR-008). Best-effort: never fail the answer.
  let suggestions: string[] = [];
  try {
    const s = await complete(buildSuggestionsPrompt(question, answer.text), {
      maxTokens: 120,
      temperature: 0.6,
      timeoutMs: 8_000,
    });
    suggestions = parseSuggestions(s.text);
  } catch (err) {
    logError('chat.suggestions', err);
  }

  const updated = appendTurn(session, question, reply, answer.tokensIn + answer.tokensOut);
  updated.topic = topic;

  cacheSet<CachedAnswer>(key, {
    reply,
    citations: effectiveCitations,
    suggestions,
    links,
    tokensIn: answer.tokensIn,
    tokensOut: answer.tokensOut,
  });

  logMetric({
    kind: 'query',
    sessionId: session.sessionId,
    latencyMs: Date.now() - startedAt,
    tokensIn: answer.tokensIn,
    tokensOut: answer.tokensOut,
    retrievalMiss: false,
    fallbackUsed: answer.usedFallback,
    clarifying: false,
    cacheHit: false,
    topScore: retrieval.topScore,
    provider: answer.provider,
  });

  return respond(
    {
      reply,
      citations: effectiveCitations,
      suggestions,
      links,
      clarifying: false,
      fallback: false,
      cached: false,
      tokenUsage: { input: answer.tokensIn, output: answer.tokensOut },
    },
    updated,
  );
}
