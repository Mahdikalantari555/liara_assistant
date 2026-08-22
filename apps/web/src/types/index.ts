/** Frontend + API shared types. Mirrors contracts/api.md. */

export interface Citation {
  title: string;
  url: string;
  section: string;
  score: number;
}

export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  citations?: Citation[];
  suggestions?: string[];
  /** Set when the assistant asked for clarification instead of answering. */
  clarifying?: boolean;
  /** Set when the answer came from the fallback path (no usable docs). */
  fallback?: boolean;
  createdAt: string;
}

export interface DocLink {
  title: string;
  url: string;
  section: string;
}

/** POST /api/chat request body. */
export interface ChatRequest {
  sessionToken?: string;
  message: string;
  /** Optional client-supplied topic hint (e.g. from a pre-question picker). */
  topic?: string;
}

/** POST /api/chat 200 response. */
export interface ChatResponse {
  reply: string;
  citations: Citation[];
  suggestions: string[];
  links: DocLink[];
  sessionToken: string;
  responseId: string;
  clarifying: boolean;
  fallback: boolean;
  cached: boolean;
  /** True when a support-referral block was appended to the reply. */
  escalated?: boolean;
  tokenUsage: { input: number; output: number };
  budget: { used: number; total: number; exceeded: boolean };
}

/** Any non-200 from the API. */
export interface ApiError {
  error: string;
  message: string;
  retryAfterMs?: number;
}
