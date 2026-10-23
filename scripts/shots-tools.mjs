// "Tools for this build" checks + screenshots: parts card (closed and open) and the finish screen's "Need tools?".
// Every link: Amazon, tag=hexkey-20, rel="sponsored noopener nofollow", target=_blank. Disclosure verbatim near links.
// No product images or prices. No sideways scroll at 320/375/393 (WebKit) or desktop (Chromium).
// Usage: node scripts/shots-tools.mjs [baseUrl] [outDir] [pieces]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/tools';
const slugs = (process.argv[4] || 'lack,malm-6,nj-theo-5-shelf').split(',');
const DISC = 'As an Amazon Associate, Hexkey earns from qualifying purchases.';
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0; const errors = [];
const ok = (c, msg) => { console.log(`${c ? 'PASS' : 'FAIL'} ${msg}`); if (!c) fail++; };
const iphone = { ...devices['iPhone 15'], deviceScaleFactor: 2 };
const runs = [
  ['webkit', 'iphone15', iphone, true],
  ['webkit', 'w320', { ...iphone, viewport: { width: 320, height: 640 } }, false],
  ['webkit', 'w375', { ...iphone, viewport: { width: 375, height: 667 } }, false],
  ['chromium', 'desktop', { viewport: { width: 1440, height: 900 } }, true],
];
const linkCheck = (sel) => [...document.querySelectorAll(sel)].map((a) => ({ href: a.href, rel: a.getAttribute('rel'), target: a.target }));
for (const [eng, name, o, shots] of runs) {
  const browser = await (eng === 'webkit' ? webkit : chromium).launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  const opts = { ...o }; if (eng === 'chromium') delete opts.defaultBrowserType;
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${eng}/${name}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${eng}/${name}] pageerror: ${e.message}`));
  for (const slug of slugs) {
    const tag = `${eng}/${name}/${slug}`;
    await page.goto(`${base}/#/${slug}`); await page.waitForSelector('.tile'); await sleep(1500);
    const tiles0 = await page.locator('.tile').first().boundingBox();
    const closed = await page.evaluate(() => ({ open: document.querySelector('.tools').open, dOver: document.documentElement.scrollWidth - innerWidth }));
    ok(!closed.open && closed.dOver <= 0, `${tag} tools card closed by default, no sideways scroll`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-parts.png` });
    await page.locator('.tools summary').click(); await sleep(400);
    await page.evaluate(() => document.querySelector('.tools').scrollIntoView({ block: 'end' })); await sleep(300);
    const m = await page.evaluate(() => {
      const sh = document.querySelector('.sheet.parts'), card = document.querySelector('.tools');
      const sr = sh.getBoundingClientRect(), cr = card.getBoundingClientRect();
      const cta = document.querySelector('.parts .cta').getBoundingClientRect();
      return { n: card.querySelectorAll('a').length, disc: card.querySelector('.aff-note')?.textContent, img: card.querySelectorAll('img').length, price: /\$\s?\d|★|stars?\b/i.test(card.textContent),
        dOver: document.documentElement.scrollWidth - innerWidth, sOver: sh.scrollWidth - sh.clientWidth, inside: cr.left >= sr.left - 0.5 && cr.right <= sr.right + 0.5, belowCta: cr.top >= cta.bottom - 0.5 };
    });
    const links = await page.evaluate(linkCheck, '.tools a');
    ok(m.n >= 2 && links.every((l) => l.href.startsWith('https://www.amazon.com/s?k=') && l.href.includes('tag=hexkey-20') && l.rel === 'sponsored noopener nofollow' && l.target === '_blank'), `${tag} ${m.n} tool links: amazon search, tag=hexkey-20, rel sponsored, new tab`);
    ok(m.disc === DISC && !m.img && !m.price, `${tag} disclosure verbatim, no images/prices/ratings`);
    ok(m.dOver <= 0 && m.sOver <= 0 && m.inside && m.belowCta, `${tag} open card: no sideways scroll, inside sheet, below the Start button`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-parts-tools-open.png` });
    await page.evaluate(() => { document.querySelector('.sheet.parts').scrollTop = 0; }); await sleep(200);
    const tiles1 = await page.locator('.tile').first().boundingBox();
    ok(Math.abs(tiles1.x - tiles0.x) < 1, `${tag} parts grid didn't move sideways`);
    await page.goto(`${base}/#/${slug}/done`); await page.waitForSelector('.need-tools'); await sleep(2500);
    const d = await page.evaluate(() => {
      const nt = document.querySelector('.need-tools'), r = nt.getBoundingClientRect(), share = document.querySelector('.done .next').getBoundingClientRect();
      return { disc: nt.querySelector('.aff-note')?.textContent, anchor: /Anchor it/.test(nt.textContent), dOver: document.documentElement.scrollWidth - innerWidth, belowShare: r.top >= share.bottom, visible: r.bottom <= innerHeight + 1 };
    });
    const dl = await page.evaluate(linkCheck, '.need-tools a');
    ok(dl.length >= 1 && dl.every((l) => l.href.includes('tag=hexkey-20') && l.rel === 'sponsored noopener nofollow' && l.target === '_blank'), `${tag} finish: ${dl.length} Need-tools links tagged, sponsored, new tab`);
    ok(d.disc === DISC && d.dOver <= 0 && d.belowShare && d.visible, `${tag} finish: disclosure verbatim, no sideways scroll, below Share, on screen (anchor line=${d.anchor})`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-finish.png` });
  }
  await ctx.close(); await browser.close();
}
console.log(errors.length ? `console errors:\n${errors.join('\n')}` : 'no console errors');
console.log(fail || errors.length ? `FAILED (${fail})` : 'ALL PASS');
process.exit(fail || errors.length ? 1 : 0);
