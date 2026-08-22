/**
 * Runnable self-check for the pure logic in this package (no network, no index).
 *   npx tsx src/selfcheck.ts
 * Covers: token counting, chunk size/overlap invariants, code-fence atomicity,
 * citation metadata completeness, vector normalization + cosine ranking.
 */
import assert from 'assert/strict';
import { chunkPage } from './chunker';
import { countTokens, normalize } from './lib/text';
import { normalizeVector } from './lib/embedding';
import { randomQuestions, EVALUATION_QUESTIONS } from './data/evaluation-questions';
import type { CrawledPage } from './types/index';

let checks = 0;
const check = (label: string, fn: () => void): void => {
  fn();
  checks++;
  console.log(`  ok  ${label}`);
};

// -------------------------------------------------------------------- text
check('countTokens scales with length and script', () => {
  assert.ok(countTokens('چطور پروژه را دیپلوی کنم') > countTokens('deploy'));
  assert.equal(countTokens(''), 0);
});

check('normalize strips BOM/zero-width and collapses blank runs', () => {
  assert.equal(normalize('\uFEFFa\u200Bb\n\n\n\nc'), 'ab\n\nc');
});

// ------------------------------------------------------------------ chunker
const page: CrawledPage = {
  filePath: 'x.md',
  sourceUrl: 'https://docs.liara.ir/paas/nodejs/getting-started/',
  pageTitle: 'استقرار Node.js',
  category: 'paas',
  content: [
    '# استقرار Node.js',
    '',
    '## پیش‌نیازها',
    'برای شروع باید CLI لیارا را نصب کنید. ' + 'این یک جمله طولانی فارسی است که تکرار می‌شود. '.repeat(40),
    '',
    '## دیپلوی',
    'با دستور زیر پروژه را مستقر کنید:',
    '```bash',
    'liara deploy --platform=node --port 3000',
    'liara logs --follow',
    '```',
    'سپس لاگ‌ها را بررسی کنید.',
  ].join('\n'),
};

const chunks = chunkPage(page, { chunkSize: 120, overlap: 20 });

check('produces multiple chunks with page+section metadata', () => {
  assert.ok(chunks.length >= 2, `expected >=2 chunks, got ${chunks.length}`);
  for (const c of chunks) {
    assert.equal(c.sourceUrl, page.sourceUrl);
    assert.equal(c.pageTitle, page.pageTitle);
    assert.ok(c.sectionTitle.length > 0, 'sectionTitle must be set for citations');
    assert.ok(c.tokenCount > 0);
    assert.ok(c.chunkId.startsWith('paas/nodejs/getting-started#'));
  }
});

check('section titles come from headings', () => {
  const titles = new Set(chunks.map((c) => c.sectionTitle));
  assert.ok(titles.has('پیش‌نیازها'), [...titles].join(' | '));
  assert.ok(titles.has('دیپلوی'), [...titles].join(' | '));
});

check('code fence is never split across chunks', () => {
  const withFence = chunks.filter((c) => c.content.includes('```'));
  assert.equal(withFence.length, 1, 'fence should live in exactly one chunk');
  const body = withFence[0]!.content;
  assert.equal((body.match(/```/g) ?? []).length, 2, 'fence must be balanced');
  assert.ok(body.includes('liara deploy --platform=node --port 3000'));
});

check('chunks respect the size budget (excluding oversized atomic units)', () => {
  const overs = chunks.filter((c) => c.tokenCount > 120 * 1.6);
  assert.equal(overs.length, 0, `oversized chunks: ${overs.map((c) => c.tokenCount).join(',')}`);
});

check('consecutive chunks in a section overlap', () => {
  const pre = chunks.filter((c) => c.sectionTitle === 'پیش‌نیازها');
  if (pre.length >= 2) {
    const a = pre[0]!.content.split(/\s+/).slice(-6).join(' ');
    assert.ok(pre[1]!.content.includes(a.split(' ').slice(-3).join(' ')), 'no overlap carried');
  }
});

check('chunk ids are unique', () => {
  const ids = chunks.map((c) => c.chunkId);
  assert.equal(new Set(ids).size, ids.length);
});

// ------------------------------------------------------------------ vectors
check('normalizeVector yields unit length and preserves ranking', () => {
  const v = normalizeVector([3, 4]);
  assert.ok(Math.abs(Math.hypot(v[0]!, v[1]!) - 1) < 1e-9);
  const q = normalizeVector([1, 0]);
  const near = normalizeVector([0.9, 0.1]);
  const far = normalizeVector([0.1, 0.9]);
  const dot = (a: number[], b: number[]): number => a.reduce((s, x, i) => s + x * b[i]!, 0);
  assert.ok(dot(q, near) > dot(q, far));
  assert.deepEqual(normalizeVector([0, 0]), [0, 0]);
});

// ---------------------------------------------------------------- eval data
check('evaluation dataset meets the 50-100 question requirement', () => {
  assert.ok(
    EVALUATION_QUESTIONS.length >= 50 && EVALUATION_QUESTIONS.length <= 100,
    `dataset has ${EVALUATION_QUESTIONS.length} questions`,
  );
  const ids = EVALUATION_QUESTIONS.map((q) => q.questionId);
  assert.equal(new Set(ids).size, ids.length, 'duplicate questionId');
  for (const q of EVALUATION_QUESTIONS) {
    assert.ok(q.text.trim().length > 5, q.questionId);
    assert.ok(q.expectedAnswerTraits.length > 0, q.questionId);
  }
});

check('randomQuestions returns distinct entries within range', () => {
  const picked = randomQuestions(5);
  assert.equal(picked.length, 5);
  assert.equal(new Set(picked.map((q) => q.questionId)).size, 5);
  assert.equal(randomQuestions(999).length, EVALUATION_QUESTIONS.length);
});

console.log(`\n${checks} checks passed.`);
