// Brand picker checks on WebKit iPhone 15 + Chromium desktop: brand chips filter the list, search finds brands,
// cards show the brand, the guide's legal line names the right brand and links its own instructions, no console errors, no sideways overflow.
// Usage: node scripts/shots-brands.mjs [baseUrl] [outDir] [chipBrands=walker-edison,zinus] [searchBrand=tribesigns] [pieces=slug|Brand word|instructions host;...]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/brands';
const chipBrands = (process.argv[4] || 'walker-edison,zinus').split(',');
const searchBrand = process.argv[5] || 'tribesigns';
const openPieces = process.argv[6]
  ? process.argv[6].split(';').map((x) => x.split('|'))
  : [['zinus-mia-queen', 'Zinus', 'cdn.shopify.com'], ['we-holmes-bookcase-wide', 'Walker Edison', 'images.salsify.com'], ['flexispot-e7', 'FlexiSpot', 'flexispot.com']];
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cat = JSON.parse(fs.readFileSync(new URL('../public/pieces/catalog.json', import.meta.url)));
const errors = [], fails = [];
const ok = (c, m) => { console.log(`${c ? '✓' : '✗'} ${m}`); if (!c) fails.push(m); };
const runs = [
  ['webkit', 'iphone', webkit, { ...devices['iPhone 15'], deviceScaleFactor: 2 }],
  ['chromium', 'desktop', chromium, { viewport: { width: 1440, height: 900 } }],
];
for (const [eng, name, bt, opts] of runs) {
  const browser = await bt.launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  const o = { ...opts }; delete o.defaultBrowserType;
  const ctx = await browser.newContext(o);
  const page = await ctx.newPage();
  const tag = `[${eng}/${name}]`;
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag} ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`${tag} pageerror: ${e.message}`));
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  const shot = (l) => page.screenshot({ path: `${out}/${eng}-${name}-${l}.png` });
  await page.goto(base + '/#/');
  if (name === 'iphone') { await page.waitForSelector('.start-cta'); await page.locator('.start-cta').tap(); }
  await page.waitForSelector('.cats.brands button');
  await sleep(1200);
  const chips = await page.locator('.cats.brands button').count();
  const nBrands = new Set(cat.map((e) => e.brandId)).size;
  ok(chips === nBrands + 1, `${tag} ${chips} brand chips (All + ${nBrands} brands)`);
  ok(await overflow() <= 0, `${tag} no sideways overflow with brand row`);
  await shot('01-picker');
  for (const id of chipBrands) {
    await page.locator(`.cats.brands button[data-brand="${id}"]`).click();
    await sleep(500);
    const want = cat.filter((e) => e.brandId === id).length;
    const got = await page.locator('.cards .card').count();
    ok(got === want, `${tag} brand ${id}: ${got} cards (want ${want})`);
    ok(await page.locator('.card small .by').first().isVisible(), `${tag} cards show the brand name`);
    await shot(`02-brand-${id}`);
  }
  await page.locator('.cats.brands button[data-brand="all"]').click();
  await page.locator('.search input').fill('standing desk');
  await sleep(500);
  const sd = await page.locator('.cards .card').evaluateAll((els) => els.map((e) => e.getAttribute('data-slug')));
  ok(sd.includes('flexispot-e7') && sd.includes('uplift-v2'), `${tag} search "standing desk" finds ${sd.join(', ')}`);
  await page.locator('.search input').fill(searchBrand);
  await sleep(500);
  ok(await page.locator('.cards .card').count() === cat.filter((e) => e.brandId === searchBrand).length, `${tag} search by brand name "${searchBrand}"`);
  await shot('03-search');
  ok(await overflow() <= 0, `${tag} no sideways overflow after search`);
  // open a piece and check its legal line
  await page.locator('.search input').fill('');
  for (const [slug, brandWord, host] of openPieces) {
    await page.goto(`${base}/#pieces`);
    await page.waitForSelector(`.card[data-slug="${slug}"]`);
    await page.locator(`.card[data-slug="${slug}"]`).click();
    await page.waitForSelector('.cta:not([disabled])');
    await sleep(1500);
    const legal = page.locator('.legal').last();
    const text = await legal.innerText();
    const href = await legal.locator('a').first().getAttribute('href');
    ok(text.includes(`${brandWord}®`) && /Not affiliated/.test(text) && !/Inter IKEA/.test(text), `${tag} ${slug} legal names ${brandWord}® and its own disclaimer`);
    ok((href || '').includes(host), `${tag} ${slug} official instructions → ${host}`);
    ok(await overflow() <= 0, `${tag} ${slug} no sideways overflow`);
    await shot(`04-${slug}`);
  }
  await ctx.close(); await browser.close();
}
console.log(errors.length ? `\n${errors.length} console error(s):\n${errors.join('\n')}` : '\nno console errors');
console.log(fails.length ? `${fails.length} check(s) failed` : 'all checks passed');
process.exit(errors.length || fails.length ? 1 : 0);
