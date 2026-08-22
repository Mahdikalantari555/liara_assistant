'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { ChatMessage, ChatResponse, ApiError, DocLink } from '@/types';
import { nextTopic, hasContext, isSummaryRequest } from '@/lib/context';
import ChatInput from './ChatInput';
import Message from './Message';
import Suggestions from './Suggestions';
import EvaluationPrompts from './EvaluationPrompts';
import { Card, CardContent } from '@/components/ui/card';
import Sidebar from '../Sidebar/Sidebar';

/** RFC4122 v4 UUID, using the Web Crypto global when available (secure
 * contexts) and falling back to Math.random so it never throws. */
function uuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through to the fallback below */
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Uppercase hex UUID for visibility; no auth semantics. */
function sessionLabel(): string {
  return uuid().toUpperCase();
}

export default function ChatContainer() {
  const [sessionToken, setSessionToken] = useState<string>('');
  const [label] = useState<string>(sessionLabel());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState<{ used: number; total: number; exceeded: boolean }>({
    used: 0,
    total: 8000,
    exceeded: false,
  });
  const [sidebarLinks, setSidebarLinks] = useState<DocLink[]>([]);
  const [sidebarFallback, setSidebarFallback] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Create a fresh session on mount. The token is signed server-side (HMAC with a
  // secret the browser must never see), so we fetch it instead of building it here.
  useEffect(() => {
    let active = true;
    fetch('/api/session')
      .then((r) => r.json())
      .then((data: { sessionToken: string; budget: { used: number; total: number; exceeded: boolean } }) => {
        if (!active) return;
        setSessionToken(data.sessionToken);
        setBudget(data.budget);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Load starter questions.
  const [questions, setQuestions] = useState<Array<{ id: string; text: string }>>([]);
  useEffect(() => {
    if (!sessionToken) return;
    fetch('/api/questions')
      .then((r) => r.json())
      .then((j: { questions: Array<{ id: string; text: string }> }) => setQuestions(j.questions))
      .catch(() => {});
  }, [sessionToken]);

  const updateSidebar = useCallback(
    async (context?: string) => {
      try {
        const q = context ?? messages.filter((m) => m.role === 'user').slice(-2).map((m) => m.content).join('\n');
        const res = await fetch(`/api/sidebar?context=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const json = (await res.json()) as { links: DocLink[]; fallback: boolean };
        setSidebarLinks(json.links);
        setSidebarFallback(json.fallback);
      } catch {
        /* sidebar must never break the chat */
      }
    },
    [messages],
  );

  const submit = useCallback(
    async (text: string, topic?: string) => {
      if (!sessionToken || loading) return;
      const userMessage: ChatMessage = {
        id: uuid(),
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMessage]);
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // No topic picked → no `topic` field in the request at all (spec scenario).
          body: JSON.stringify({ sessionToken, message: text, ...(topic ? { topic } : {}) }),
        });
        const json = (await res.json()) as ChatResponse | ApiError;
        if (!res.ok) {
          const err = json as ApiError;
          const assistant: ChatMessage = {
            id: uuid(),
            role: 'assistant',
            content: err.message || 'خطایی رخ داد. دوباره تلاش کنید.',
            clarifying: false,
            fallback: true,
            createdAt: new Date().toISOString(),
          };
          setMessages((m) => [...m, assistant]);
          setLoading(false);
          return;
        }
        const data = json as ChatResponse;
        const assistant: ChatMessage = {
          id: data.responseId,
          role: 'assistant',
          content: data.reply,
          citations: data.citations,
          suggestions: data.suggestions,
          clarifying: data.clarifying,
          fallback: data.fallback,
          createdAt: new Date().toISOString(),
        };
        setMessages((m) => [...m, assistant]);
        setSessionToken(data.sessionToken);
        setBudget({ used: data.budget.used, total: data.budget.total, exceeded: data.budget.exceeded });
        setSidebarLinks(data.links);
        setSidebarFallback(false);
        updateSidebar(data.reply);
      } catch {
        const assistant: ChatMessage = {
          id: uuid(),
          role: 'assistant',
          content: 'ارتباط با سرور قطع است. لطفاً اتصال اینترنت را بررسی کنید.',
          clarifying: false,
          fallback: true,
          createdAt: new Date().toISOString(),
        };
        setMessages((m) => [...m, assistant]);
      } finally {
        setLoading(false);
      }
    },
    [sessionToken, loading, updateSidebar],
  );

  const RobotIcon = ({ className }: { className?: string }) => (
    <span
      className={`robot-icon inline-flex h-8 w-8 shrink-0 items-center justify-center ${className ?? ''}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="18" width="36" height="30" rx="8" stroke="currentColor" strokeWidth="3" />
        <circle cx="26" cy="33" r="3" className="robot-eye" fill="currentColor" />
        <circle cx="38" cy="33" r="3" className="robot-eye" fill="currentColor" />
        <line x1="32" y1="10" x2="32" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="8" r="2.5" fill="currentColor" />
      </svg>
    </span>
  );

  const startNewConversation = useCallback(async () => {
    try {
      const res = await fetch('/api/session');
      const data = (await res.json()) as { sessionToken: string; budget: { used: number; total: number; exceeded: boolean } };
      setSessionToken(data.sessionToken);
      setBudget(data.budget);
    } catch {
      /* keep current token; retry possible */
    }
    setMessages([]);
    setSidebarLinks([]);
  }, []);

  const onFeedback = useCallback(
    async (responseId: string, type: 'positive' | 'negative') => {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, responseId, type }),
      });
    },
    [sessionToken],
  );

  const lastUser = messages.filter((m) => m.role === 'user').slice(-1)[0];
  const context = lastUser ? nextTopic({ messages } as any, lastUser.content) : '';

  return (
    <div className="chat-shell flex w-full overflow-hidden">
      <Sidebar
        links={sidebarLinks}
        fallback={sidebarFallback}
        contextLabel={context}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col border-e border-border">
        <header className="flex items-center justify-between border-b border-border bg-card/70 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-primary">
            <RobotIcon />
            <div>
              <h1 className="text-section font-semibold text-foreground">دستیار هوش مصنوعی لیارا</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">پاسخ از مستندات رسمی لیارا با ذکر منبع</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {budget.exceeded && <span className="font-semibold text-red-400">سهمیه به پایان رسید</span>}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="relative mx-auto mb-6 flex w-full max-w-3xl flex-col items-center gap-2 pt-10 text-center">
              {/* Empty-state decoration — gated to before the first message (spec) */}
              <div aria-hidden="true" className="absolute -top-2 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
              <RobotIcon className="h-14 w-14 text-primary [&_svg]:h-12 [&_svg]:w-12" />
              <h2 className="text-section font-semibold text-foreground">سلام! چطور می‌تونم کمکت کنم؟</h2>
              <p className="text-sm text-muted-foreground">سؤالت را درباره سرویس‌های لیارا بپرس.</p>
            </div>
          )}
          {messages.length === 0 && (
            <EvaluationPrompts
              questions={questions}
              busy={loading}
              onSelect={(q) => submit(q)}
            />
          )}
          {messages.map((m) => (
            <Message
              key={m.id}
              message={m}
              busy={loading}
              onFeedback={onFeedback}
              onSuggestion={(s) => submit(s)}
            />
          ))}
          {loading && (
            <div className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="mr-2">در حال نوشتن پاسخ…</span>
            </div>
          )}
          {budget.exceeded && messages.length > 0 && (
            <Card className="mx-auto mt-4 w-full max-w-3xl">
              <CardContent className="text-sm text-muted-foreground">
                <p className="mb-1 font-semibold text-foreground">سهمیه این گفتگو تمام شد.</p>
                <p>
                  می‌توانی خلاصه‌ای از گفتگو تا این لحظه ببینی، یا گفتگوی جدیدی شروع کنی.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => submit('خلاصه')}
                    disabled={loading}
                    className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    نمایش خلاصه گفتگو
                  </button>
                  <button
                    type="button"
                    onClick={startNewConversation}
                    disabled={loading}
                    className="rounded-md border border-border px-4 py-2 font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    شروع گفتگوی جدید
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
          <div ref={endRef} />
        </div>

        {!budget.exceeded && (
          <ChatInput busy={loading} onSubmit={submit} disabled={!sessionToken} />
        )}
      </main>
    </div>
  );
}
