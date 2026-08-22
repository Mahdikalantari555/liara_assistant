/**
 * Fallback responses (T030, FR-006, FR-028, SC-006/SC-027).
 *
 * Every failure path returns a useful Persian message instead of an error, and
 * each one is deterministic (no LLM call), so it answers within milliseconds even
 * when the provider or the index is down.
 */
import type { DocLink } from '@/types';

export const SUPPORT_LINE =
  'اگر پاسخ سؤالت را پیدا نکردی، می‌توانی از طریق تیکت پشتیبانی لیارا در [کنسول لیارا](https://console.liara.ir) با تیم پشتیبانی در تماس باشی.';

/** Marker the system prompt makes the model emit when docs lack the answer. */
export const DOCS_MISS_MARKER = 'پاسخ این سؤال در مستندات موجود نیست';

/** When the model signals a docs miss, append the support referral deterministically. */
export function withSupportReferral(reply: string): string {
  if (!reply.includes(DOCS_MISS_MARKER) || reply.includes('تیکت پشتیبانی')) return reply;
  return `${reply}\n\n${SUPPORT_LINE}`;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function markerIndex(digits: string): number {
  return [...digits].reduce((acc, ch) => {
    const fa = FA_DIGITS.indexOf(ch);
    return acc * 10 + (fa >= 0 ? fa : Number(ch));
  }, 0);
}

/**
 * Convert numbered source markers ([۱] / [2]) into real links over the exact
 * chunk list that was rendered into the prompt (سند n → urls[n-1]). Markers
 * without a matching document are removed; fenced ``` code is untouched; the
 * (?!\() guard leaves already-linked text alone.
 */
export function linkifyDocMarkers(reply: string, urls: string[]): string {
  return reply
    .split(/(```[\s\S]*?```)/g)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part.replace(/\[([0-9۰-۹]{1,2})\](?!\()/g, (m, digits: string) => {
            const url = urls[markerIndex(digits) - 1];
            return url ? `[${digits}](${url})` : '';
          }),
    )
    .join('');
}

/** Suggested entry points shown when nothing relevant was retrieved. */
export const DEFAULT_LINKS: DocLink[] = [
  { title: 'مستندات لیارا', url: 'https://docs.liara.ir/', section: 'شروع' },
  { title: 'سرویس پلتفرم (PaaS)', url: 'https://docs.liara.ir/paas/about/', section: 'معرفی' },
  { title: 'سرویس دیتابیس (DBaaS)', url: 'https://docs.liara.ir/dbaas/about/', section: 'معرفی' },
  { title: 'فضای ذخیره‌سازی ابری', url: 'https://docs.liara.ir/object-storage/about/', section: 'معرفی' },
  { title: 'سرویس هوش مصنوعی', url: 'https://docs.liara.ir/ai/about/', section: 'معرفی' },
];

/** No documentation matched the question (retrieval miss). */
export function noResultsResponse(): string {
  return [
    'در مستندات لیارا مطلبی که به این سؤال پاسخ دهد پیدا نکردم.',
    '',
    'چند نکته که ممکن است کمک کند:',
    '- سؤال را با نام دقیق سرویس بپرس (مثلاً «PostgreSQL» یا «Node.js» به جای «دیتابیس» یا «برنامه»).',
    '- اگر سؤال درباره لیارا نیست، من فقط به مستندات لیارا دسترسی دارم.',
    '',
    SUPPORT_LINE,
  ].join('\n');
}

/** The question is outside the Liara documentation scope. */
export function outOfScopeResponse(): string {
  return [
    'من دستیار مستندات لیارا هستم و فقط به سؤال‌های مربوط به سرویس‌ها و مستندات لیارا پاسخ می‌دهم.',
    '',
    'اگر سؤالی درباره استقرار برنامه، دیتابیس، فضای ذخیره‌سازی، دامنه، سرویس ایمیل یا هوش مصنوعی لیارا داری، بپرس.',
    '',
    SUPPORT_LINE,
  ].join('\n');
}

/** The LLM provider (primary and fallback) is unavailable. */
export function providerDownResponse(links: DocLink[]): string {
  const list = links.slice(0, 3).map((l) => `- [${l.title}](${l.url})`);
  return [
    'در حال حاضر ارتباط با مدل زبانی برقرار نشد، بنابراین نمی‌توانم پاسخ کامل تولید کنم.',
    '',
    ...(list.length
      ? ['اما این صفحه‌های مستندات به سؤال تو نزدیک هستند:', ...list, '']
      : []),
    'لطفاً چند لحظه بعد دوباره تلاش کن.',
  ].join('\n');
}

/** The vector index is missing or corrupt. */
export function indexDownResponse(): string {
  return [
    'در حال حاضر جست‌وجو در مستندات در دسترس نیست و نمی‌توانم پاسخ مستند ارائه دهم.',
    '',
    'می‌توانی مستندات را به صورت مستقیم در [docs.liara.ir](https://docs.liara.ir/) ببینی یا چند دقیقه بعد دوباره تلاش کنی.',
  ].join('\n');
}

/** Empty or whitespace-only message. */
export function emptyInputResponse(): string {
  return 'پیام خالی است. سؤالت را درباره سرویس‌های لیارا بنویس تا در مستندات جست‌وجو کنم.';
}

/** Token budget exhausted (FR-009, SC-009). */
export function budgetExceededResponse(): string {
  return [
    'سهمیه این گفتگو به پایان رسیده است و نمی‌توانم پیام جدیدی پردازش کنم.',
    '',
    'می‌توانم خلاصه‌ای از گفتگوی تا این لحظه برایت بنویسم، یا با شروع گفتگوی جدید ادامه بدهیم.',
  ].join('\n');
}

/** Rate limited (FR-024). */
export function rateLimitedResponse(retryAfterMs: number): string {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `تعداد درخواست‌ها بیش از حد مجاز است. لطفاً ${seconds} ثانیه بعد دوباره تلاش کن.`;
}

/**
 * Enforce the citation contract deterministically (FR-002, SC-011): the model
 * is unreliable about link placement, so links are stripped from the answer
 * body and the منابع block is always rebuilt from structured citations.
 */
const CITATION_MARKER = 'برای اطلاعات بیشتر به مستندات مراجعه کنید';

/** ponytail: protects fenced ``` blocks only — inline-code URLs still stripped. */
function stripBodyLinks(text: string): string {
  return text
    .split(/(```[\s\S]*?```)/g)
    .map((part, i) =>
      i % 2 === 1
        ? part
        : part
            .replace(/\[[^\]]+\]\([^)]*\)/g, (m) => m.slice(1, m.indexOf(']')))
            .replace(/https?:\/\/[^\s)]+/g, '')
            .replace(/[ \t]{2,}/g, ' '),
    )
    .join('')
    .trim();
}

export function ensureCitationBlock(
  answer: string,
  citations: Array<{ title: string; url: string; section: string }>,
): string {
  // Discard whatever citation block the model wrote; ours is canonical.
  const body = stripBodyLinks(answer.split(CITATION_MARKER)[0] ?? answer);
  if (citations.length === 0) return body;
  const lines = citations.map(
    (c) => `${CITATION_MARKER}: [${c.title}](${c.url}) - بخش: "${c.section}"`,
  );
  return `${body}\n\n${lines.join('\n')}`;
}
