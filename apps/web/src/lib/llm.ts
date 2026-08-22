/**
 * LLM provider abstraction (T013, FR-034, SC-025) — primary with one fallback.
 *
 * OpenAI-compatible `/v1/chat/completions` only, which every configured provider
 * speaks (kilo gateway, AvalAI, Liara AI). Failover is triggered by transport
 * errors, timeouts, and 5xx/429 — not by 4xx, since a bad request will fail the
 * same way twice and retrying only burns quota.
 */
import { getConfig, redact, type LlmTarget } from './config';
import { logError } from './metrics';

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  provider: string;
  model: string;
  /** True when the primary failed and the fallback answered. */
  usedFallback: boolean;
}

interface ChatCompletion {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

class RetriableLlmError extends Error {}

async function callOnce(
  target: LlmTarget,
  messages: LlmMessage[],
  opts: { maxTokens: number; temperature: number; timeoutMs: number },
): Promise<Omit<LlmResult, 'usedFallback'>> {
  if (!target.apiKey || !target.apiBase) throw new Error('llm: provider not configured');
  const url = `${target.apiBase.replace(/\/+$/, '').replace(/\/v1$/, '')}/v1/chat/completions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${target.apiKey}`,
      },
      body: JSON.stringify({
        model: target.model,
        messages,
        max_tokens: opts.maxTokens,
        temperature: opts.temperature,
        stream: false,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (res.status === 429 || res.status >= 500) {
      throw new RetriableLlmError(`llm: HTTP ${res.status} from provider`);
    }
    if (!res.ok) {
      throw new Error(`llm: HTTP ${res.status} from provider`);
    }
    const json = (await res.json()) as ChatCompletion;
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new RetriableLlmError('llm: provider returned an empty completion');
    return {
      text: redact(text),
      tokensIn: json.usage?.prompt_tokens ?? 0,
      tokensOut: json.usage?.completion_tokens ?? 0,
      provider: new URL(target.apiBase).host,
      model: target.model,
    };
  } catch (err) {
    if (err instanceof RetriableLlmError) throw err;
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TypeError')) {
      // Timeout or transport failure — worth trying the other provider.
      throw new RetriableLlmError(`llm: ${err.name === 'AbortError' ? 'timeout' : 'network error'}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface CompleteOptions {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

/** Complete a chat, failing over to the secondary provider when appropriate. */
export async function complete(messages: LlmMessage[], opts: CompleteOptions = {}): Promise<LlmResult> {
  const { llm } = getConfig();
  const call = {
    maxTokens: opts.maxTokens ?? 900,
    temperature: opts.temperature ?? 0.2,
    // SC-001 budgets 8s end-to-end; leave room for retrieval and the fallback try.
    timeoutMs: opts.timeoutMs ?? 20_000,
  };

  try {
    return { ...(await callOnce(llm.primary, messages, call)), usedFallback: false };
  } catch (primaryError) {
    const retriable = primaryError instanceof RetriableLlmError;
    logError('llm.primary', primaryError);
    if (!llm.fallback || !retriable) throw primaryError;
    try {
      // Fallback gets a tighter timeout so total latency stays bounded (SC-025).
      return {
        ...(await callOnce(llm.fallback, messages, { ...call, timeoutMs: Math.min(call.timeoutMs, 12_000) })),
        usedFallback: true,
      };
    } catch (fallbackError) {
      logError('llm.fallback', fallbackError);
      throw fallbackError;
    }
  }
}
