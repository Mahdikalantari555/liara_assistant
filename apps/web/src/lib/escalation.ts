/**
 * Support escalation (conversation-flow change).
 *
 * Tracks consecutive unhelpful outcomes per session: explicit 👎 feedback and
 * near-duplicate question repeats. Sessions are stateless JWTs, so the streak
 * lives in an in-memory map keyed by sessionId — same trade-off as the rate
 * limiter: a restart loses counters, never conversation content.
 */
import { getConfig } from './config';

interface StreakState {
  count: number;
  /** Normalized previous user question, for duplicate detection. */
  lastQuestion?: string;
  at: number;
}

const TTL_MS = 6 * 60 * 60 * 1000; // matches default session TTL
// Next.js compiles each API route as its own bundle, so a bare module-level
// Map would fork into per-route copies. Pin one instance on globalThis.
const g = globalThis as typeof globalThis & {
  __escalationStore?: Map<string, StreakState>;
};
const store = (g.__escalationStore ??= new Map<string, StreakState>());

function sweep(): void {
  const now = Date.now();
  for (const [k, v] of store) if (now - v.at > TTL_MS) store.delete(k);
}

export function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A near-duplicate is a normalized re-ask of the immediately previous question. */
export function isDuplicate(previous: string | undefined, next: string): boolean {
  if (!previous) return false;
  const p = normalizeQuestion(previous);
  const n = normalizeQuestion(next);
  // Very short questions ("چرا؟") are too generic to count as a meaningful re-ask.
  if (p.split(' ').length < 3 || n.split(' ').length < 3) return false;
  return p === n;
}

/**
 * Record this turn's question and report whether it duplicates the previous
 * one. A duplicate bumps the streak (unhelpful loop signal); a fresh,
 * substantive question resets it.
 */
export function registerTurn(sessionId: string, question: string): boolean {
  sweep();
  const s = store.get(sessionId) ?? { count: 0, at: Date.now() };
  const duplicate = isDuplicate(s.lastQuestion, question);
  s.lastQuestion = question;
  s.at = Date.now();
  s.count = duplicate ? s.count + 1 : 0;
  store.set(sessionId, s);
  return duplicate;
}

export function bumpStreak(sessionId: string): number {
  sweep();
  const s = store.get(sessionId) ?? { count: 0, at: Date.now() };
  s.count += 1;
  s.at = Date.now();
  store.set(sessionId, s);
  return s.count;
}

export function resetStreak(sessionId: string): void {
  const s = store.get(sessionId);
  if (s) {
    s.count = 0;
    s.at = Date.now();
  }
}

export interface EscalationOutcome {
  escalated: boolean;
  referral?: string;
}

function buildReferral(): string {
  const { ticketUrl } = getConfig().escalation;
  let text =
    'پاسخ‌های قبلی مشکل شما را حل نکرد. برای پیگیری دقیق‌تر لطفاً با تیم پشتیبانی لیارا در تماس باشید';
  if (ticketUrl) text += ` و از طریق این لینک تیکت ثبت کنید: [ثبت تیکت پشتیبانی](${ticketUrl})`;
  return `${text}.`;
}

/** Streak value as seen BEFORE this turn's duplicate-bump/reset happens. */
export function currentStreak(sessionId: string): number {
  sweep();
  return store.get(sessionId)?.count ?? 0;
}

/**
 * Check-and-fire: when the streak reaches the threshold, return the referral
 * block and reset the counter so the link is not repeated forever.
 *
 * `enteringStreak` is the count observed before this turn's registerTurn —
 * a fresh (non-duplicate) question resets the counter by design, but that must
 * not erase 👎 evidence gathered on earlier turns; the larger of the two wins.
 */
export function checkEscalation(sessionId: string, enteringStreak = 0): EscalationOutcome {
  sweep();
  const { threshold } = getConfig().escalation;
  const s = store.get(sessionId);
  const effective = Math.max(s?.count ?? 0, enteringStreak);
  if (!s || effective < threshold || threshold <= 0) return { escalated: false };
  s.count = 0;
  s.at = Date.now();
  return { escalated: true, referral: buildReferral() };
}
