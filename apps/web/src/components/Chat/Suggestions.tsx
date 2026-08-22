'use client';

export default function Suggestions({
  suggestions,
  busy,
  onSelect,
}: {
  suggestions: string[];
  busy?: boolean;
  onSelect: (text: string) => void;
}) {
  if (!suggestions?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          disabled={busy}
          onClick={() => onSelect(s)}
          className="rounded-pill border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/60 hover:bg-primary/10 disabled:opacity-40"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
