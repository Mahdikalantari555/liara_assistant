import assert from 'assert/strict';
import { buildDocGraph } from './doc-graph';

(async () => {
  const graph = buildDocGraph([
    { sourceUrl: 'https://docs.liara.ir/paas/nodejs/', content: 'See [nodejs scaling](https://docs.liara.ir/paas/nodejs/scaling/) and [[paas/databases]].' },
    { sourceUrl: 'https://docs.liara.ir/paas/nodejs/scaling/', content: 'Back to [nodejs](https://docs.liara.ir/paas/nodejs/).' },
    { sourceUrl: 'https://docs.liara.ir/paas/databases/', content: 'Standalone page.' },
  ]);

  const out = graph.neighbors('paas/nodejs');
  assert.ok(out.has('paas/nodejs/scaling'));
  assert.ok(out.has('paas/databases'));

  const rev = graph.reverseNeighbors('paas/nodejs/scaling');
  assert.ok(rev.has('paas/nodejs'));

  const hop1 = graph.expand('paas/nodejs', 1);
  assert.ok(hop1.has('paas/nodejs/scaling'));
  assert.ok(hop1.has('paas/databases'));

  const hop2 = graph.expand('paas/nodejs', 2);
  assert.ok(hop2.has('paas/nodejs/scaling'));

  console.log('doc-graph tests passed');
})();
