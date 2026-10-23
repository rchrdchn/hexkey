// "Tools for this build" checks + screenshots: the top-bar Tools button (parts screen and build steps), the Tools window,
// and the finish screen's "Need tools?" line.
// Button: next to the sound button, >=44px, never overlaps the name/progress/mic/sound, count badge = rows in the window.
// Window: role=dialog + aria-modal, title + piece name, must-haves first (hex key, Phillips #2), a reason on every row,
// tip-over line when it can tip, every link Amazon search + tag=hexkey-20 + rel="sponsored noopener nofollow" + target=_blank,
// disclosure verbatim, no images/prices/ratings, focus trapped, body scroll locked, Esc / backdrop / X close, focus returns.
// Also: the old parts-panel card is gone, the parts grid doesn't move, no sideways scroll at 320/375/393 (WebKit) or desktop (Chromium).
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
const goodLinks = (ls) => ls.every((l) => l.href.startsWith('https://www.amazon.com/s?k=') && l.href.includes('tag=hexkey-20') && l.rel === 'sponsored noopener nofollow' && l.target === '_blank');
// top-bar geometry: the Tools button vs everything else in the bar
const barCheck = () => {
  const r = (el) => el && el.getBoundingClientRect();
  const btn = document.querySelector('.top .tools-btn'), b = r(btn);
  const icons = [...document.querySelectorAll('.top .icon')], sound = icons[icons.length - 1];
  const others = [...document.querySelectorAll('.top > *')].filter((el) => el !== btn && !el.classList.contains('spacer')).map((el) => ({ c: el.className, r: r(el) }));
  const hit = (a, o) => !!a && a.left < o.right - 0.5 && a.right > o.left + 0.5 && a.top < o.bottom - 0.5 && a.bottom > o.top + 0.5;
  const ttl = document.querySelector('.top .ttl');
  return { has: !!btn, w: b?.width, h: b?.height, overlap: others.filter((o) => hit(b, o.r)).map((o) => o.c), nextToSound: b && sound ? r(sound).left - b.right : -1,
    onScreen: b && b.left >= 0 && b.right <= innerWidth, n: +btn?.querySelector('.tb-n')?.textContent, label: btn?.getAttribute('aria-label'),
    ttlClipped: ttl ? ttl.scrollWidth > ttl.clientWidth : false, dOver: document.documentElement.scrollWidth - innerWidth,
    progress: r(document.querySelector('.top .progress'))?.width ?? null };
};
for (const [eng, name, o, shots] of runs) {
  const browser = await (eng === 'webkit' ? webkit : chromium).launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  const opts = { ...o }; if (eng === 'chromium') delete opts.defaultBrowserType;
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${eng}/${name}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${eng}/${name}] pageerror: ${e.message}`));
  const tap = (sel) => (o.hasTouch ? page.locator(sel).first().tap() : page.locator(sel).first().click());
  for (const slug of slugs) {
    const tag = `${eng}/${name}/${slug}`;
    await page.goto(`${base}/#/${slug}`); await page.waitForSelector('.tile'); await sleep(1500);
    const tiles0 = await page.locator('.tile').first().boundingBox();
    const bar = await page.evaluate(barCheck);
    ok(bar.has && bar.w >= 44 && bar.h >= 44 && bar.onScreen && !bar.overlap.length && bar.nextToSound >= 0 && bar.nextToSound <= 14 && bar.dOver <= 0,
      `${tag} parts: Tools button ${Math.round(bar.w)}x${Math.round(bar.h)}, next to sound (${Math.round(bar.nextToSound)}px), no overlap${bar.overlap.length ? ` [${bar.overlap}]` : ''}, no sideways scroll`);
    ok(await page.locator('.sheet.parts .tools, .sheet.parts .t-list').count() === 0, `${tag} parts: old Tools card is gone from the panel`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-topbar.png` });

    // open
    await tap('.top .tools-btn'); await page.waitForSelector('[role=dialog].tools-d'); await sleep(500);
    const m = await page.evaluate((nameExpected) => {
      const d = document.querySelector('[role=dialog].tools-d'), r = d.getBoundingClientRect();
      const rows = [...d.querySelectorAll('.td-list li')];
      return { modal: d.getAttribute('aria-modal'), title: d.querySelector('h2')?.textContent, sub: d.querySelector('.cm-sub')?.textContent, subOk: d.querySelector('.cm-sub')?.textContent === nameExpected,
        labelled: document.getElementById(d.getAttribute('aria-labelledby'))?.textContent, ids: rows.map((li) => li.querySelector('b').textContent),
        reasons: rows.every((li) => (li.querySelector('small')?.textContent || '').length >= 8), buy: rows.every((li) => /Find on Amazon/.test(li.querySelector('a')?.textContent || '')),
        n: rows.length, disc: d.querySelector('.aff-note')?.textContent, img: d.querySelectorAll('img').length, price: /\$\s?\d|★|stars?\b|rating/i.test(d.textContent),
        warn: d.querySelector('.td-warn')?.textContent || '', warnFirst: d.querySelector('.cm-body')?.firstElementChild?.classList.contains('td-warn'),
        focusIn: d.contains(document.activeElement), locked: getComputedStyle(document.body).overflow === 'hidden',
        inView: r.left >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5 && r.top >= 0, sheet: r.bottom >= innerHeight - 1 && r.width >= innerWidth - 1,
        dOver: document.documentElement.scrollWidth - innerWidth, bOver: d.querySelector('.cm-body').scrollWidth - d.querySelector('.cm-body').clientWidth };
    }, await page.evaluate(() => document.querySelector('.top .ttl')?.textContent));
    const links = await page.evaluate(linkCheck, '.tools-d a');
    const anchored = m.ids.includes('Wall-anchor kit') && slug !== 'lack-wall-shelf';
    ok(m.modal === 'true' && m.title === 'Tools for this build' && m.labelled === m.title && m.subOk, `${tag} window: role=dialog aria-modal, titled "${m.title}" / "${m.sub}"`);
    ok(m.ids[0] === 'Hex key set' && m.ids[1] === 'Phillips #2 screwdriver' && m.reasons && m.buy && m.n === bar.n, `${tag} window: ${m.n} rows (badge ${bar.n}), must-haves first, a reason + Find on Amazon on each`);
    ok(links.length === m.n && goodLinks(links), `${tag} window: ${links.length} links amazon search, tag=hexkey-20, rel sponsored noopener nofollow, new tab`);
    ok(m.disc === DISC && !m.img && !m.price, `${tag} window: disclosure verbatim, no images/prices/ratings`);
    ok(anchored ? /tip over/.test(m.warn) && m.warnFirst : !m.warn, `${tag} window: tip-over line ${anchored ? 'at the top' : 'not shown (no anchor)'}`);
    ok(m.focusIn && m.locked && m.inView && m.dOver <= 0 && m.bOver <= 0 && (eng === 'webkit' ? m.sheet : !m.sheet), `${tag} window: focus inside, body locked, on screen, ${eng === 'webkit' ? 'bottom sheet' : 'centered dialog'}, no sideways scroll`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-tools-open.png` });
    if (!o.hasTouch) {
      for (let i = 0; i < m.n + 3; i++) await page.keyboard.press('Tab');
      const trapped = await page.evaluate(() => document.querySelector('.tools-d').contains(document.activeElement));
      await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab');
      ok(trapped && await page.evaluate(() => document.querySelector('.tools-d').contains(document.activeElement)), `${tag} window: Tab / Shift+Tab stay inside`);
    }
    // Esc closes and focus returns to the button
    await page.keyboard.press('Escape'); await sleep(300);
    const esc = await page.evaluate(() => ({ gone: !document.querySelector('.tools-d'), back: document.activeElement?.classList.contains('tools-btn'), unlocked: getComputedStyle(document.body).overflow !== 'hidden', mode: location.hash }));
    ok(esc.gone && esc.back && esc.unlocked && esc.mode === `#/${slug}`, `${tag} Esc closes, focus back on Tools, scroll unlocked, still on parts`);
    // backdrop closes
    await tap('.top .tools-btn'); await page.waitForSelector('.tools-d'); await sleep(450);
    if (o.hasTouch) await page.touchscreen.tap(Math.round(innerW(o) / 2), 12); else await page.mouse.click(12, 12);
    await sleep(300);
    ok(await page.locator('.tools-d').count() === 0, `${tag} backdrop tap closes`);
    // X closes
    await tap('.top .tools-btn'); await page.waitForSelector('.tools-d'); await sleep(450);
    await tap('.tools-d .cm-x'); await sleep(300);
    ok(await page.locator('.tools-d').count() === 0 && await page.evaluate(() => document.activeElement?.classList.contains('tools-btn')), `${tag} X closes, focus back on Tools`);
    const tiles1 = await page.locator('.tile').first().boundingBox();
    ok(Math.abs(tiles1.x - tiles0.x) < 1 && Math.abs(tiles1.y - tiles0.y) < 1, `${tag} parts grid didn't move`);

    // build step: the button is still there and doesn't squeeze progress / mic / sound
    await page.goto(`${base}/#/${slug}/1`); await page.waitForSelector('.sheet.build'); await sleep(1500);
    const bb = await page.evaluate(barCheck);
    ok(bb.has && bb.w >= 44 && bb.h >= 44 && bb.onScreen && !bb.overlap.length && bb.nextToSound >= 0 && bb.dOver <= 0 && bb.progress >= 60,
      `${tag} build: Tools button ${Math.round(bb.w)}x${Math.round(bb.h)}, no overlap${bb.overlap.length ? ` [${bb.overlap}]` : ''}, progress ${Math.round(bb.progress)}px wide`);
    await tap('.top .tools-btn'); await page.waitForSelector('.tools-d'); await sleep(450);
    ok(await page.locator('.tools-d .td-list li').count() === bb.n, `${tag} build: window opens from a step`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-build-tools-open.png` });
    await page.keyboard.press('Escape'); await sleep(300);
    ok(await page.locator('.tools-d').count() === 0 && (await page.evaluate(() => location.hash)) === `#/${slug}/1`, `${tag} build: Esc closes and stays on step 1 (no step skip)`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-build-topbar.png` });

    // finish screen: unchanged "Need tools?" line
    await page.goto(`${base}/#/${slug}/done`); await page.waitForSelector('.need-tools'); await sleep(2500);
    const d = await page.evaluate(() => {
      const nt = document.querySelector('.need-tools'), r = nt.getBoundingClientRect(), share = document.querySelector('.done .next').getBoundingClientRect();
      return { disc: nt.querySelector('.aff-note')?.textContent, anchor: /Anchor it/.test(nt.textContent), dOver: document.documentElement.scrollWidth - innerWidth, belowShare: r.top >= share.bottom, visible: r.bottom <= innerHeight + 1, btn: !!document.querySelector('.top .tools-btn') };
    });
    const dl = await page.evaluate(linkCheck, '.need-tools a');
    ok(dl.length >= 1 && goodLinks(dl), `${tag} finish: ${dl.length} Need-tools links tagged, sponsored, new tab`);
    ok(d.disc === DISC && d.dOver <= 0 && d.belowShare && d.visible && !d.btn, `${tag} finish: disclosure verbatim, no sideways scroll, below Share, on screen, no top-bar Tools (anchor line=${d.anchor})`);
    if (shots) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-finish.png` });
  }
  await ctx.close(); await browser.close();
}
function innerW(o) { return o.viewport.width; }
console.log(errors.length ? `console errors:\n${errors.join('\n')}` : 'no console errors');
console.log(fail || errors.length ? `FAILED (${fail})` : 'ALL PASS');
process.exit(fail || errors.length ? 1 : 0);
