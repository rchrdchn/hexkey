// Click through EVERY catalog piece (parts check-off, every step, done) in Chromium + WebKit at iPhone 15 and 1440x900.
// Fails on any console error. Saves the picker, a parts screen, one mid-build step and the done screen per piece.
// Usage: node scripts/shots-catalog.mjs [baseUrl] [outDir] [engines=chromium,webkit] [slugs=all]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/catalog';
const engines = (process.argv[4] || 'chromium,webkit').split(',');
const all = JSON.parse(fs.readFileSync(new URL('../public/pieces/index.json', import.meta.url)));
const slugs = process.argv[5] ? process.argv[5].split(',') : all;
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const report = {};
for (const eng of engines) {
  const bt = eng === 'webkit' ? webkit : chromium;
  const browser = await bt.launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  const profiles = [
    ['iphone', { ...devices['iPhone 15'], deviceScaleFactor: 2, ...(eng === 'chromium' ? { isMobile: true } : {}) }],
    ['desktop', { viewport: { width: 1440, height: 900 } }],
  ];
  for (const [name, opts] of profiles) {
    if (eng === 'chromium') delete opts.defaultBrowserType;
    // Fresh context every RECYCLE pieces: headless WebKit (software GL) runs out of memory after ~10 pieces in one tab.
    const RECYCLE = Number(process.env.RECYCLE || 6);
    let ctx, page, cur = '';
    const open = async () => {
      if (ctx) await ctx.close();
      ctx = await browser.newContext({ ...opts });
      page = await ctx.newPage();
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${eng}/${name}/${cur}] ${m.text()}`); });
      page.on('crash', () => errors.push(`[${eng}/${name}/${cur}] page crashed`));
      page.on('pageerror', (e) => errors.push(`[${eng}/${name}/${cur}] pageerror: ${e.message}`));
    };
    await open();
    const shot = (label) => page.screenshot({ path: `${out}/${eng}-${name}-${label}.png` });
    await page.goto(base + '/#/');
    await page.waitForSelector('.card[data-slug]');
    await sleep(2500);
    await shot('00-pick');
    let done = 0;
    for (const slug of slugs) {
      if (done++ && done % RECYCLE === 1) await open();
      cur = slug;
      const t0 = Date.now();
      await page.goto(`${base}/#/`);
      await page.waitForSelector(`.card[data-slug="${slug}"]`);
      await page.locator(`.card[data-slug="${slug}"]`).click();
      await page.waitForSelector('.cta:not([disabled])');
      await page.locator('.cta').first().click();
      await page.waitForSelector('.tile');
      await sleep(1200);
      const tiles = page.locator('.tile');
      const n = await tiles.count();
      if (name === 'iphone') await shot(`${slug}-1-parts`);
      for (let i = 0; i < n; i++) await tiles.nth(i).click();
      await sleep(1200);
      await page.locator('.cta').click({ force: true });
      await page.waitForSelector('.cap');
      const steps = await page.locator('.progress button').count();
      const mid = Math.floor(steps / 2);
      let safety = 0, hw = 0;
      for (let i = 0; i < steps; i++) {
        await sleep(i === mid ? 2600 : 700);
        safety += await page.locator('.safety').count();
        hw += await page.locator('.chip.hw').count();
        if (i === mid) await shot(`${slug}-2-step${i + 1}`);
        await page.locator('.next').click({ force: true });
      }
      await sleep(2200);
      await shot(`${slug}-3-done`);
      const confetti = await page.locator('canvas').count();
      report[`${eng}/${name}/${slug}`] = { steps, parts: n, safety, hwChips: hw, canvases: confetti, ms: Date.now() - t0 };
      console.log(eng, name, slug, JSON.stringify(report[`${eng}/${name}/${slug}`]), errors.length ? `errors so far: ${errors.length}` : '');
    }
    await ctx.close();
  }
  await browser.close();
}
fs.writeFileSync(`${out}/report-${engines.join("-")}.json`, JSON.stringify({ errors, report }, null, 1));
console.log(errors.length ? `\n${errors.length} console error(s):\n${errors.join('\n')}` : '\nno console errors');
process.exit(errors.length ? 1 : 0);
