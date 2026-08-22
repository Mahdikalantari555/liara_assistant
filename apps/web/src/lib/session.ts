/**
 * Stateless JWT sessions (T014, T038, FR-031, SC-022).
 *
 * The whole conversation lives in the client-held token: no server store, so any
 * instance can serve any request (FR-029) and a restart loses nothing it owned.
 * HS256 via crypto — a JWT library would add a dependency for ~30 lines.
 *
 * Not a security boundary for content: the payload is signed, not encrypted, and
 * the client can read it. It carries only the user's own conversation, so that is
 * acceptable; the signature is what stops tampering with the token budget.
 */
import { createHmac, timingSafeEqual, randomUUID } from 'crypto';
import { getConfig } from './config';
import type { Citation } from '@/types';

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Citations are kept out of the token to save size; UI holds them. */
  at: number;
}

export interface SessionState {
  sessionId: string;
  createdAt: number;
  messages: SessionMessage[];
  usedTokens: number;
  /** Set once the budget is spent; only a summary request is allowed after. */
  exceeded: boolean;
  /** Last topic keywords, used to keep the sidebar and retrieval on-context. */
  topic?: string;
}

const b64url = (buf: Buffer): string => buf.toString('base64url');

function sign(data: string, secret: string): string {
  return b64url(createHmac('sha256', secret).update(data).digest());
}

/** Fresh anonymous session (no auth by design — FR: anonymous sessions). */
export function newSession(): SessionState {
  return {
    sessionId: randomUUID(),
    createdAt: Date.now(),
    messages: [],
    usedTokens: 0,
    exceeded: false,
  };
}

/** Sign a session into a compact JWT. */
export function encodeSession(state: SessionState): string {
  const { session } = getConfig();
  const header = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        ...state,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + session.ttlSeconds,
      }),
    ),
  );
  const body = `${header}.${payload}`;
  return `${body}.${sign(body, session.secret)}`;
}

/**
 * Verify and decode a session token. Returns null for anything not provably
 * ours — malformed, wrong signature, or expired — and the caller starts fresh.
 */
export function decodeSession(token: string | undefined | null): SessionState | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts as [string, string, string];
  const { session } = getConfig();

  const expected = Buffer.from(sign(`${header}.${payload}`, session.secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionState & {
      exp?: number;
    };
    if (json.exp && json.exp * 1000 < Date.now()) return null;
    if (!Array.isArray(json.messages) || typeof json.sessionId !== 'string') return null;
    return {
      sessionId: json.sessionId,
      createdAt: json.createdAt ?? Date.now(),
      messages: json.messages.slice(-20),
      usedTokens: Number(json.usedTokens) || 0,
      exceeded: Boolean(json.exceeded),
      topic: typeof json.topic === 'string' ? json.topic : undefined,
    };
  } catch {
    return null;
  }
}

/** Append a turn and roll the token counter. */
export function appendTurn(
  state: SessionState,
  user: string,
  assistant: string,
  tokens: number,
): SessionState {
  const now = Date.now();
  const messages = [
    ...state.messages,
    { role: 'user' as const, content: user, at: now },
    { role: 'assistant' as const, content: assistant, at: now },
  ].slice(-20); // keep the token small; the prompt builder trims further
  const usedTokens = state.usedTokens + tokens;
  return {
    ...state,
    messages,
    usedTokens,
    exceeded: usedTokens >= getConfig().session.tokenBudget,
  };
}

/** Citations are not persisted in the token; helper kept for API symmetry. */
export function stripCitations(citations: Citation[]): Citation[] {
  return citations.map((c) => ({ ...c, score: Math.round(c.score * 1000) / 1000 }));
}
