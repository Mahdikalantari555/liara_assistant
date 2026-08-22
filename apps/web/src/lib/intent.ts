/**
 * Input sanitization + intent analysis (T035, T049, FR-004, FR-010).
 *
 * Prompt-injection defence is layered, not a single regex: instructions inside
 * user text are neutralized here, the system prompt states that retrieved
 * context is data (see prompts.ts), and the model is asked to refuse anything
 * not grounded in the docs. This function only removes the cheapest attack
 * surface — role markers and explicit override phrasing.
 */

const MAX_INPUT_CHARS = 1200;

/** Phrases whose only purpose is to override instructions. */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/gi,
  /forget\s+(everything|all)\s+(you|above)/gi,
  /you\s+are\s+now\s+a\b/gi,
  /system\s*prompt/gi,
  /reveal\s+(your|the)\s+(system\s+)?(prompt|instructions?|api\s*key)/gi,
  /دستور(ات)?\s*(قبلی|بالا)\s*را\s*(نادیده|فراموش)/gi,
  /تو\s+از\s+این\s+به\s+بعد\s+یک\b/gi,
  /پرامپت\s*سیستم/gi,
];

export interface SanitizeResult {
  text: string;
  /** True when something was stripped — logged, not shown to the user. */
  modified: boolean;
  /** True when the message is unusable (empty/whitespace). */
  empty: boolean;
  truncated: boolean;
}

/** Clean one user message before it reaches the prompt. */
export function sanitizeInput(raw: unknown): SanitizeResult {
  if (typeof raw !== 'string') return { text: '', modified: false, empty: true, truncated: false };

  let text = raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '') // control chars
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width smuggling
    .replace(/\r\n/g, '\n')
    .trim();

  const original = text;

  // Chat-template role markers would let a user forge a turn.
  text = text
    .replace(/<\|[^|>]*\|>/g, ' ')
    .replace(/^\s*(system|assistant|user)\s*:\s*/gim, '')
    .replace(/```+\s*(system|assistant)\b/gi, '```');

  for (const pattern of INJECTION_PATTERNS) text = text.replace(pattern, '[حذف‌شده]');

  const truncated = text.length > MAX_INPUT_CHARS;
  if (truncated) text = `${text.slice(0, MAX_INPUT_CHARS)}…`;

  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return { text, modified: text !== original, empty: text.length === 0, truncated };
}

/* ------------------------------------------------------- ambiguity detection */

/** Service families a bare question could mean; used to offer choices. */
const SERVICE_GROUPS: Record<string, { label: string; options: string[] }> = {
  database: {
    label: 'دیتابیس',
    options: ['PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'MSSQL', 'Elasticsearch'],
  },
  deploy: {
    label: 'پلتفرم برنامه',
    options: ['Node.js', 'Next.js', 'React', 'Django', 'Flask', 'Laravel', 'PHP', 'Go', 'Docker', 'Static'],
  },
  storage: {
    label: 'نوع ذخیره‌سازی',
    options: ['فضای ذخیره‌سازی ابری (Object Storage)', 'دیسک برنامه (Disk)'],
  },
};

/** Signals that a question names a concrete service already. */
const SPECIFIC_TERMS = [
  'postgres', 'postgresql', 'mysql', 'mariadb', 'mongo', 'mongodb', 'redis', 'mssql', 'sql server',
  'elastic', 'rabbit', 'node', 'nodejs', 'next', 'nextjs', 'react', 'vue', 'angular', 'django',
  'flask', 'laravel', 'php', 'python', 'golang', ' go ', 'docker', 'static', 'dotnet', '.net',
  'wordpress', 'n8n', 'object storage', 'bucket', 'باکت', 'دیسک',
];

const AMBIGUOUS_INTENTS: Array<{ group: keyof typeof SERVICE_GROUPS; patterns: RegExp[] }> = [
  {
    group: 'database',
    patterns: [/دیتابیس|دی‌تی‌بیس|بانک\s*اطلاعات|database\b/i],
  },
  {
    group: 'deploy',
    patterns: [/دیپلوی|deploy|استقرار|مستقر|بالا\s*بیاورم|آپلود\s*کد/i],
  },
  {
    group: 'storage',
    patterns: [/ذخیره[\u200c\s]*سازی|storage|فایل.*(آپلود|ذخیره)/i],
  },
];

export interface AmbiguityResult {
  ambiguous: boolean;
  group?: string;
  label?: string;
  options?: string[];
}

/**
 * Decide whether to ask a clarifying question (FR-004, SC-005).
 *
 * Conservative on purpose: only a short question that names a service family
 * without naming a member, and only on the first turn of that topic. A
 * follow-up inside an ongoing conversation inherits context instead.
 */
export function detectAmbiguity(question: string, hasContext: boolean): AmbiguityResult {
  if (hasContext) return { ambiguous: false };
  const lower = ` ${question.toLowerCase()} `;
  if (SPECIFIC_TERMS.some((t) => lower.includes(t))) return { ambiguous: false };
  // A long question usually carries its own qualifiers.
  if (question.split(/\s+/).length > 14) return { ambiguous: false };

  for (const intent of AMBIGUOUS_INTENTS) {
    if (intent.patterns.some((p) => p.test(question))) {
      const group = SERVICE_GROUPS[intent.group]!;
      return { ambiguous: true, group: intent.group, label: group.label, options: group.options };
    }
  }
  return { ambiguous: false };
}

/** Short topic keywords for context-aware retrieval and the sidebar. */
export function extractTopic(question: string, previousTopic?: string): string {
  const lower = question.toLowerCase();
  const found = SPECIFIC_TERMS.filter((t) => lower.includes(t.trim())).map((t) => t.trim());
  if (found.length === 0) return previousTopic ?? '';
  return [...new Set(found)].slice(0, 3).join(' ');
}
