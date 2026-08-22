/**
 * Conversation context management (T037, T041, T042, FR-003/FR-009).
 *
 * Owns two things the chat route should not re-derive: how much of the token
 * budget is left, and what "the current topic" is for context-aware retrieval.
 */
import { getConfig } from './config';
import { extractTopic } from './intent';
import type { SessionState } from './session';

export interface BudgetState {
  used: number;
  total: number;
  remaining: number;
  exceeded: boolean;
  /** Warn the UI before the hard stop so the user is not surprised. */
  nearLimit: boolean;
}

export function budgetState(session: SessionState): BudgetState {
  const total = getConfig().session.tokenBudget;
  const used = session.usedTokens;
  return {
    used,
    total,
    remaining: Math.max(0, total - used),
    exceeded: used >= total,
    nearLimit: used >= total * 0.8,
  };
}

/** Is this a follow-up inside an existing conversation? */
export function hasContext(session: SessionState): boolean {
  return session.messages.length > 0;
}

/** Update the tracked topic from the newest question (US2 continuity). */
export function nextTopic(session: SessionState, question: string): string {
  return extractTopic(question, session.topic);
}

/** Does the user want the summary offered after the budget ran out? */
export function isSummaryRequest(text: string): boolean {
  return /خلاصه|summary|جمع\s*بندی/i.test(text);
}
