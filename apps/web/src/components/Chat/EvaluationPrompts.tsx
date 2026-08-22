'use client';

import { motion, useReducedMotion } from 'motion/react';

export default function EvaluationPrompts({
  questions,
  busy,
  onSelect,
}: {
  questions: Array<{ id: string; text: string }>;
  busy?: boolean;
  onSelect: (text: string) => void;
}) {
  const reduce = useReducedMotion();
  if (!questions.length) return null;
  return (
    <div className="mx-auto mb-6 w-full max-w-3xl">
      <p className="mb-2 text-xs text-muted-foreground">سوالات پرتکرار از مستندات (کلیک کن تا ارسال شود):</p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <motion.button
            key={q.id}
            type="button"
            disabled={busy}
            onClick={() => onSelect(q.text)}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: reduce ? 0 : i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-card border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors duration-150 hover:border-primary/60 hover:bg-primary/5 disabled:opacity-40"
          >
            {q.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
