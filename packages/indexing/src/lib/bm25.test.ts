import assert from 'assert/strict';
import { buildBm25Index } from './bm25';

function chunkOf(content: string, id = 'c1') {
  return { chunkId: id, content, tokenCount: content.split(/\s+/).length };
}

(async () => {
  const idx = buildBm25Index([
    chunkOf('liara deploy --platform node', 'a'),
    chunkOf('liara logs --follow', 'b'),
    chunkOf('liara scale --app myapp', 'c'),
    chunkOf('kubernetes deployment guide', 'd'),
  ]);

  const r1 = await idx.search('liara deploy', 2);
  assert.equal(r1[0]!.chunkId, 'a');
  assert.ok(r1[0]!.score > r1[1]!.score);

  const r2 = await idx.search('logs', 1);
  assert.equal(r2[0]!.chunkId, 'b');

  const empty = await buildBm25Index([]).search('anything', 3);
  assert.equal(empty.length, 0);

  console.log('bm25 tests passed');
})();
