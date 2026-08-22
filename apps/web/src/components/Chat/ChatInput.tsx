'use client';

import { useState, useCallback, useRef, useLayoutEffect, type KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Mirrors SERVICE_GROUPS labels in src/lib/intent.ts.
 * ponytail: list synced manually until an API serves the groups. */
const TOPICS = ['دیتابیس', 'پلتفرم برنامه', 'نوع ذخیره‌سازی'];

const MAX_HEIGHT = 160;

export default function ChatInput({
  onSubmit,
  busy,
  disabled,
}: {
  onSubmit: (text: string, topic?: string) => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const [topic, setTopic] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  const resize = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, []);

  useLayoutEffect(() => {
    resize();
  }, [value, resize]);

  const send = useCallback(() => {
    const text = value.trim();
    if (!text || busy || disabled) return;
    onSubmit(text, topic || undefined);
    setValue('');
  }, [value, topic, busy, disabled, onSubmit]);

  const onKey = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  return (
    <div className="border-t border-border bg-background/70 px-4 py-3 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl">
        {/* Topic picker — optional; selection rides along as request `topic` hint */}
        <div className="mb-2 flex items-center gap-2">
          <Select dir="rtl" value={topic || undefined} onValueChange={setTopic}>
            <SelectTrigger
              aria-label="موضوع سؤال"
              className={topic ? 'w-auto border-primary/50 bg-primary/10 text-primary' : 'w-auto'}
            >
              <SelectValue placeholder="همه موضوعات" />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {topic && (
            <button
              type="button"
              onClick={() => setTopic('')}
              className="inline-flex h-6 items-center gap-1 rounded-pill border border-border px-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              aria-label={`حذف موضوع ${topic}`}
            >
              {topic}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-end gap-2 rounded-lg border border-input bg-card/80 px-3 py-2 transition-colors duration-150 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/30">
          <Textarea
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            placeholder="سؤال خود را از مستندات لیارا بپرسید…"
            dir="rtl"
            lang="fa"
            disabled={busy || disabled}
            rows={1}
            className="max-h-40 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-0 py-1 text-sm leading-relaxed focus-visible:ring-0"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={busy || disabled || !value.trim()}
            className="mb-0.5 h-9 w-9 shrink-0 rounded-full"
            aria-label="ارسال"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2 11 13M22 2 15 22 11 13 2 9z" />
            </svg>
          </Button>
        </div>
      </div>
      <p className="mt-1.5 text-center text-xs text-muted-foreground">
        پاسخ‌ها بر اساس مستندات رسمی لیارا تولید می‌شوند. در صورت نیاز به پشتیبانی از{' '}
        <a
          href="https://console.liara.ir"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          پشتیبانی لیارا
        </a>{' '}
        استفاده کنید.
      </p>
    </div>
  );
}
