// Walk the whole flow in Chromium + WebKit (iPhone viewport and desktop), save screenshots, report console errors.
// Usage: node scripts/shots.mjs [baseUrl] [outDir] [engines=chromium,webkit] [pieces=lack,kallax,billy]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots';
const engines = (process.argv[4] || 'chromium,webkit').split(',');
const only = (process.argv[5] || 'lack,kallax,billy').split(',');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
for (const eng of engines) {
  const bt = eng === 'webkit' ? webkit : chromium;
  const browser = await bt.launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  const profiles = [
    ['iphone', { ...devices['iPhone 15'], deviceScaleFactor: 2, ...(eng === 'chromium' ? { isMobile: true } : {}) }],
    ['desktop', { viewport: { width: 1440, height: 900 } }],
  ];
  for (const [name, ctxOpts] of profiles) {
    if (eng === 'chromium') delete ctxOpts.defaultBrowserType;
    const ctx = await browser.newContext({ ...ctxOpts });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${eng}/${name}] ${m.type()}: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`[${eng}/${name}] pageerror: ${e.message}`));
    const shot = async (label) => { await page.screenshot({ path: `${out}/${eng}-${name}-${label}.png` }); };
    await page.goto(base + '/#/');
    await page.waitForSelector('.card b');
    await sleep(2500);
    await shot('01-pick');
    for (const slug of only) {
      await page.goto(`${base}/#/`);
      await page.waitForSelector('.card b');
      await page.locator('.card', { hasText: slug.toUpperCase() }).click();
      await sleep(1200);
      if (slug === 'billy') await shot('02-pick-billy');
      await page.locator('.cta').first().click();
      await page.waitForSelector('.tile');
      await sleep(2200);
      const tiles = page.locator('.tile');
      const n = await tiles.count();
      for (let i = 0; i < n - 1; i++) await tiles.nth(i).click();
      await sleep(800);
      await shot(`${slug}-03-parts`);
      await tiles.nth(n - 1).click();
      await sleep(2500); // let the all-set confetti settle
      await page.locator('.cta').click({ force: true });
      await page.waitForSelector('.cap');
      const steps = await page.locator('.progress button').count();
      for (let i = 0; i < steps; i++) {
        await sleep(i === 0 ? 1600 : 1400);
        // mid-flight frame for a couple of steps, settled frame for all
        if ([1, 2, 5].includes(i)) await shot(`${slug}-04-step${String(i + 1).padStart(2, '0')}-mid`);
        await sleep(2600);
        await shot(`${slug}-04-step${String(i + 1).padStart(2, '0')}`);
        await page.locator('.next').click({ force: true });
      }
      await sleep(3000);
      await shot(`${slug}-05-done`);
      await page.locator('.next.alt').click();
      await sleep(1500);
      await shot(`${slug}-06-card`);
      await page.locator('.modal').click({ position: { x: 5, y: 5 } });
      if (name === 'desktop') { /* keep desktop runs short */ }
    }
    await ctx.close();
  }
  await browser.close();
}
fs.writeFileSync(`${out}/console.txt`, errors.join('\n') + '\n');
console.log(errors.length ? errors.slice(0, 40).join('\n') : 'no console errors');
