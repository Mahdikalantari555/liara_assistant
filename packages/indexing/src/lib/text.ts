/**
 * Token counting + text utilities shared by chunker and runtime budgeting.
 *
 * ponytail: heuristic tokenizer (no tiktoken/transformers dependency — they are
 * tens of MB and wrong for bge-m3 anyway). Calibrated for mixed Persian/English
 * technical prose. Upgrade path: swap `countTokens` for a real bge-m3 tokenizer
 * call if chunk-size drift ever exceeds ~15%.
 */

/** Approximate token count for mixed Persian/Latin text. */
export function countTokens(text: string): number {
  if (!text) return 0;
  // Persian/Arabic script: ~1 token per 2.5 chars. Latin/other: ~1 per 4 chars.
  let persian = 0;
  let other = 0;
  for (const ch of text) {
    if (ch >= '\u0600' && ch <= '\u06FF') persian++;
    else other++;
  }
  return Math.max(1, Math.ceil(persian / 2.5 + other / 4));
}

/** Split text into sentence-ish units so chunks never cut mid-sentence. */
export function splitUnits(text: string): string[] {
  const units: string[] = [];
  for (const line of text.split('\n')) {
    if (!line.trim()) {
      units.push('\n');
      continue;
    }
    // Keep code-fence lines and list items intact; split prose on sentence ends.
    const parts = line.split(/(?<=[.!؟?:])\s+/);
    for (const part of parts) if (part.trim()) units.push(part.trim());
    units.push('\n');
  }
  return units;
}

/** Collapse whitespace, strip zero-width/BOM noise common in the corpus. */
export function normalize(text: string): string {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
