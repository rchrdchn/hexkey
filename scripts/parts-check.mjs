// Parts checklist checks: no horizontal overflow, grid can't be dragged sideways, tapping a tile checks it, disclaimer shown, no console errors.
// Usage: node scripts/parts-check.mjs [baseUrl] [outDir] [pieces]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/parts';
const slugs = (process.argv[4] || 'kallax,kallax-4x4,hemnes-8-drawer,lack').split(',');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fail = 0; const errors = [];
const ok = (c, msg) => { console.log(`${c ? 'PASS' : 'FAIL'} ${msg}`); if (!c) fail++; };
for (const eng of ['webkit', 'chromium']) {
  const browser = await (eng === 'webkit' ? webkit : chromium).launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  const profiles = [['iphone', { ...devices['iPhone 15'], deviceScaleFactor: 2 }], ['desktop', { viewport: { width: 1440, height: 900 } }]];
  for (const [name, o] of profiles) {
    if (eng === 'chromium') delete o.defaultBrowserType;
    const ctx = await browser.newContext(o);
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${eng}/${name}] ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`[${eng}/${name}] pageerror: ${e.message}`));
    const cdp = eng === 'chromium' && name === 'iphone' ? await ctx.newCDPSession(page) : null;
    for (const slug of slugs) {
      const tag = `${eng}/${name}/${slug}`;
      await page.goto(`${base}/#/${slug}`); await page.waitForSelector('.tile'); await sleep(1800);
      const m = await page.evaluate(() => {
        const sh = document.querySelector('.sheet.parts'), g = document.querySelector('.parts .grid');
        const rects = [...g.querySelectorAll('.tile')].map((t) => t.getBoundingClientRect());
        const sr = sh.getBoundingClientRect();
        sh.scrollLeft = 80; g.scrollLeft = 80;
        return { gOver: g.scrollWidth - g.clientWidth, sOver: sh.scrollWidth - sh.clientWidth, dOver: document.documentElement.scrollWidth - innerWidth,
          sl: sh.scrollLeft, gl: g.scrollLeft, inside: rects.every((r) => r.left >= sr.left - 0.5 && r.right <= sr.right + 0.5),
          cols: getComputedStyle(g).gridTemplateColumns.split(' ').length, ta: getComputedStyle(g).touchAction,
          disc: !!document.querySelector('.parts .disclaim')?.textContent.includes('best estimate'),
          legal: !!document.querySelector('.parts .legal')?.textContent.includes('Not affiliated'),
          approx: /approx|~\s?\d/i.test(sh.textContent) };
      });
      ok(m.gOver <= 0 && m.sOver <= 0 && m.dOver <= 0 && m.sl === 0 && m.gl === 0 && m.inside, `${tag} no horizontal overflow/scroll (cols=${m.cols}, touch-action=${m.ta})`);
      ok(m.disc && m.legal && !m.approx, `${tag} disclaimer + not-affiliated line, no "approx"`);
      const first = page.locator('.tile').first();
      const before = await first.boundingBox();
      if (cdp) { // real touch drag sideways across the grid
        const y = before.y + before.height / 2, x0 = before.x + before.width + 40;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
        for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * 20, y }] }); await sleep(16); }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await sleep(500);
      } else { await page.mouse.move(before.x + 30, before.y + 20); await page.mouse.down(); await page.mouse.move(before.x - 150, before.y + 20, { steps: 8 }); await page.mouse.up(); await sleep(400); }
      const after = await first.boundingBox();
      ok(Math.abs(after.x - before.x) < 1 && Math.abs(after.y - before.y) < 1, `${tag} sideways drag doesn't move tiles (dx=${(after.x - before.x).toFixed(1)})`);
      // tap/click checks a tile
      const t = page.locator('.tile').nth(1); await t.scrollIntoViewIfNeeded();
      if (name === 'iphone') await t.tap(); else await t.click();
      await sleep(300);
      ok(await t.evaluate((e) => e.classList.contains('ok')), `${tag} tapping a tile checks it off`);
      if (slug === 'kallax' || slug === 'kallax-4x4' || slug === 'hemnes-8-drawer') await page.screenshot({ path: `${out}/${eng}-${name}-${slug}.png` });
      if (slug === 'kallax-4x4') { await page.evaluate(() => { document.querySelector('.sheet.parts').scrollTop = 9999; }); await sleep(300); await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-bottom.png` }); }
      if (slug === 'hemnes-8-drawer') { // vertical scroll of the sheet still works for long lists
        const v = await page.evaluate(() => { const s = document.querySelector('.sheet.parts'); s.scrollTop = 9999; return { st: s.scrollTop, need: s.scrollHeight > s.clientHeight }; });
        ok(!v.need || v.st > 0, `${tag} long list scrolls vertically (needs scroll=${v.need})`);
        if (v.need) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-scrolled.png` });
      }
    }
    await ctx.close();
  }
  await browser.close();
}
console.log(errors.length ? `console errors:\n${errors.join('\n')}` : 'no console errors');
console.log(fail || errors.length ? `FAILED (${fail})` : 'ALL PASS');
process.exit(fail || errors.length ? 1 : 0);
