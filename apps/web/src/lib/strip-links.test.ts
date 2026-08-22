import { ensureCitationBlock, linkifyDocMarkers } from './fallback';
// body links stripped, fenced code preserved, citations rebuilt from data
const answer = 'مرحله ۵: [دسترسی به برنامه](https://localhost:3100/x) تمام.\n```bash\ndocker push registry2.iran.liara.ir:443/a/b\n```\n\nبرای اطلاعات بیشتر به مستندات مراجعه کنید: [غلط](http://bad) - بخش: "x"';
const out = ensureCitationBlock(answer, [
  { title: 'React', url: 'https://docs.liara.ir/react/start/', section: 'استقرار' },
]);
console.assert(!out.slice(0, out.indexOf('برای اطلاعات بیشتر')).includes('http'), 'body link-free');
console.assert(out.includes('registry2.iran.liara.ir'), 'fence preserved');
console.assert(out.includes('[React](https://docs.liara.ir/react/start/)'), 'canonical sources');
console.assert(!out.includes('bad'), "model block discarded");
const noCite = ensureCitationBlock('بدون منبع [لینک](https://a.ir)', []);
console.assert(noCite === 'بدون منبع لینک', `no-citation case: ${JSON.stringify(noCite)}`);
console.log('strip-links.test: all assertions passed');

// Numbered doc markers linkify over the prompt's chunk order.
{
  const urls = ['https://docs.liara.ir/a/', 'https://docs.liara.ir/b/'];
  const out = linkifyDocMarkers('طبق [۱] و [2] درست است؛ [۳] ناموجود. کد: ```arr[1]```', urls);
  console.assert(out.includes('[۱](https://docs.liara.ir/a/)'), `fa digit linked: ${out}`);
  console.assert(out.includes('[2](https://docs.liara.ir/b/)'), 'latin digit linked');
  console.assert(!out.includes('[۳]') && !out.includes('[3]'), 'out-of-range removed');
  console.assert(out.includes('arr[1]'), 'fence untouched');
}
console.log('strip-links.test: marker assertions passed');
