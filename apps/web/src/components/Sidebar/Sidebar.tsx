'use client';

import type { DocLink } from '@/types';

export default function Sidebar({
  links,
  fallback,
  contextLabel,
}: {
  links: DocLink[];
  fallback?: boolean;
  contextLabel?: string;
}) {
  return (
    <aside className="hidden min-h-0 w-[300px] shrink-0 flex-col border-e border-border bg-card/60 backdrop-blur md:flex">
      <div className="px-4 py-3">
        <h2 className="text-subsection font-semibold text-accent">مستندات مرتبط</h2>
        <div className="mt-2 h-px bg-border" />
        {contextLabel && (
          <p className="mt-2 text-[11px] text-muted-foreground">محور: {contextLabel}</p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {links.length === 0 && (
          <p className="text-xs text-muted-foreground">سوالی بپرسید تا لینک‌های مرتبط نمایش داده شوند.</p>
        )}
        <ul className="flex flex-col gap-2">
          {links.map((l, i) => (
            <li key={`${l.url}-${i}`}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                title={l.url}
                className="group block rounded-md border border-border bg-background/60 px-3 py-3 transition-colors duration-150 hover:border-primary/50 hover:bg-muted"
              >
                <span className="block text-xs font-semibold text-foreground line-clamp-2">{l.title}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground line-clamp-1">بخش: {l.section}</span>
              </a>
            </li>
          ))}
        </ul>
        {fallback && (
          <a
            href="https://docs.liara.ir/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-center text-xs text-primary hover:text-accent hover:underline"
          >
            مشاهده همه مستندات ←
          </a>
        )}
      </div>
    </aside>
  );
}
