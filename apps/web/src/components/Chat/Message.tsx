'use client';

import { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import clsx from 'clsx';
import type { ChatMessage, Citation } from '@/types';

/** Render **bold** spans inside a plain-text segment. */
function withBold(text: string, keyPrefix: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') && p.length > 4 ? (
      <strong key={`${keyPrefix}-${i}`} className="font-bold">{p.slice(2, -2)}</strong>
    ) : (
      p
    ),
  );
}

function RichContent({ text }: { text: string }) {
  const blocks = text.split(/(```[\s\S]*?```|\[[^\]]+\]\([^)]+\))/g);
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
      {blocks.map((b, i) => {
        if (b.startsWith('```')) {
          const code = b.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
          return (
            <pre key={i} dir="ltr" className="mt-2 rounded-md p-3 text-xs text-foreground">
              <code>{code}</code>
            </pre>
          );
        }
        if (b.startsWith('[')) {
          const m = b.match(/^\[([^\]]+)\]\([^)]+\)(.*)$/s);
          if (m) return <a key={i} href={m[2]} target="_blank" rel="noreferrer" className="break-all underline decoration-primary/40 underline-offset-2 hover:text-accent">{m[1]}{m[3]}</a>;
        }
        return <span key={i} className="text-foreground">{b}</span>;
      })}
    </div>
  );
}

function CitationLink({ c }: { c: Citation }) {
  return (
    <a
      key={c.url}
      href={c.url}
      target="_blank"
      rel="noreferrer"
      className="block min-h-[32px] truncate py-1 text-xs text-primary hover:text-accent hover:underline"
      title={c.url}
    >
      [{c.title}] - بخش: &ldquo;{c.section}&rdquo;
    </a>
  );
}

export default function Message({
  message,
  busy,
  onFeedback,
  onSuggestion,
}: {
  message: ChatMessage;
  busy?: boolean;
  onFeedback?: (responseId: string, type: 'positive' | 'negative') => void;
  onSuggestion?: (text: string) => void;
}) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);

  const isUser = message.role === 'user';
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={clsx('mx-auto mb-4 flex w-full max-w-3xl', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={clsx(
          'max-w-[85%] rounded-card border px-4 py-3',
          isUser
            ? 'border-transparent bg-primary text-primary-foreground'
            : 'border-border bg-card text-foreground',
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <>
            {message.clarifying && (
              <span className="mb-2 inline-flex rounded-pill border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                نیاز به شفاف‌سازی
              </span>
            )}
            <RichContent text={message.content} />
            {message.citations && message.citations.length > 0 && (
              <div className="mt-3 border-t border-border pt-2">
                <p className="mb-1 text-xs font-semibold text-accent">منابع:</p>
                <div className="flex flex-col gap-1">
                  {message.citations.map((c) => (
                    <CitationLink key={c.url} c={c} />
                  ))}
                </div>
              </div>
            )}
            {message.suggestions && message.suggestions.length > 0 && (
              <Suggestions suggestions={message.suggestions} busy={busy} onSelect={onSuggestion} />
            )}
            {onFeedback && !message.clarifying && (
              <FeedbackButtons
                responseId={message.id}
                busy={busy}
                selected={feedback}
                onSelect={(t) => {
                  setFeedback(t);
                  onFeedback(message.id, t);
                }}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function Suggestions({
  suggestions,
  busy,
  onSelect,
}: {
  suggestions: string[];
  busy?: boolean;
  onSelect?: (text: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          disabled={busy}
          onClick={() => onSelect?.(s)}
          className="rounded-pill border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/60 hover:bg-primary/20 disabled:opacity-40"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function FeedbackButtons({
  responseId,
  busy,
  selected,
  onSelect,
}: {
  responseId: string;
  busy?: boolean;
  selected: 'positive' | 'negative' | null;
  onSelect: (type: 'positive' | 'negative') => void;
}) {
  const [done, setDone] = useState(false);
  const handle = useCallback(
    async (type: 'positive' | 'negative') => {
      if (done) return;
      setDone(true);
      onSelect(type);
    },
    [done, onSelect],
  );

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-border pt-2">
      <span className="text-[11px] text-muted-foreground">آیا پاسخ مفید بود؟</span>
      <button
        disabled={busy || done}
        onClick={() => handle('positive')}
        className={clsx(
          'inline-flex items-center gap-1 rounded-card border px-2 py-1 text-xs disabled:opacity-40',
          selected === 'positive'
            ? 'border-primary/60 bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/40',
        )}
      >
        👍 مفید
      </button>
      <button
        disabled={busy || done}
        onClick={() => handle('negative')}
        className={clsx(
          'inline-flex items-center gap-1 rounded-card border px-2 py-1 text-xs disabled:opacity-40',
          selected === 'negative'
            ? 'border-red-500/50 bg-red-500/10 text-red-400'
            : 'border-border text-muted-foreground hover:border-red-500/50',
        )}
      >
        👎 نیاز به بهبود
      </button>
      {done && <span className="text-[11px] text-muted-foreground">ثبت شد</span>}
    </div>
  );
}
