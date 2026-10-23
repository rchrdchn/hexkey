// Mobile home checks: round nav buttons from first paint, CTA-first view on phones, #pieces picker sheet (open/close/back/build).
// Usage: node scripts/shots-home.mjs [baseUrl] [outDir]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/mobile-home';
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [], errors = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log(`${c ? 'PASS' : 'FAIL'} ${m}`); };
const navRound = (page) => page.evaluate(() => [...document.querySelectorAll('.top .icon, .top .pill.alt')].filter((b) => getComputedStyle(b).display !== 'none' && b.getBoundingClientRect().width < 60).map((b) => {
  const r = b.getBoundingClientRect(); return { label: b.getAttribute('aria-label'), w: +r.width.toFixed(2), h: +r.height.toFixed(2), rad: getComputedStyle(b).borderRadius, right: r.right, vw: innerWidth };
}));
const runs = [
  ['webkit', 'iphone15', { ...devices['iPhone 15'] }],
  ['webkit', 'iphoneSE3-375', { ...devices['iPhone SE (3rd gen)'] }],
  ['webkit', 'iphoneSE1-320', { ...devices['iPhone SE'] }],
  ['chromium', 'desktop', { viewport: { width: 1440, height: 900 } }],
];
for (const [eng, name, opts] of runs) {
  const browser = await (eng === 'webkit' ? webkit : chromium).launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  delete opts.defaultBrowserType;
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${eng}/${name}] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${eng}/${name}] pageerror: ${e.message}`));
  const tag = `${eng}/${name}`;
  const mobile = name !== 'desktop';
  await page.goto(base + '/', { waitUntil: 'commit' });
  await page.waitForSelector('.top .icon');
  const first = await navRound(page);
  await page.waitForLoadState('load'); await sleep(2500);
  const after = await navRound(page);
  for (const [when, list] of [['first paint', first], ['after load', after]]) {
    ok(list.length >= 1 && list.every((b) => Math.abs(b.w - b.h) < 0.6 && b.rad === '50%' && b.right <= b.vw), `${tag} nav round buttons at ${when}: ${JSON.stringify(list.map(({ label, w, h, rad }) => ({ label, w, h, rad })))}`);
  }
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(await overflow() <= 0, `${tag} no sideways overflow on home`);
  if (mobile) {
    ok(await page.locator('.catalog').count() === 0, `${tag} picker hidden at load`);
    const cta = page.locator('.start-cta');
    const box = await cta.boundingBox();
    ok(box && box.y + box.height <= opts.viewport.height, `${tag} CTA visible above the fold (${box && Math.round(box.y + box.height)} <= ${opts.viewport.height})`);
    ok(await page.locator('.sheet.start .legal').isVisible(), `${tag} not-affiliated line visible`);
    await page.locator('.top').screenshot({ path: `${out}/${eng}-${name}-nav.png` });
    await page.screenshot({ path: `${out}/${eng}-${name}-01-first-view.png` });
    await cta.tap();
    await page.waitForSelector('.sheet.pick.open .card b'); await sleep(700);
    ok(page.url().endsWith('#pieces'), `${tag} CTA opens #pieces`);
    await page.screenshot({ path: `${out}/${eng}-${name}-02-picker-open.png` });
    await page.locator('.search input').fill('malm bed');
    await sleep(300);
    const slugs = await page.locator('.card').evaluateAll((els) => els.map((e) => e.dataset.slug));
    ok(slugs.length > 0 && slugs.every((s) => s.startsWith('malm')), `${tag} search works: ${slugs.join(',')}`);
    await page.locator('.card').first().tap();
    await page.waitForSelector('.sheet.pick .cta:not([disabled])'); await sleep(500);
    await page.screenshot({ path: `${out}/${eng}-${name}-03-search-picked.png` });
    ok(await overflow() <= 0, `${tag} no sideways overflow with picker open`);
    // close button
    await page.locator('.pick-head .close').tap(); await sleep(500);
    ok(await page.locator('.catalog').count() === 0 && !page.url().includes('pieces'), `${tag} close button closes picker`);
    // reopen, browser back
    await page.locator('.start-cta').tap(); await page.waitForSelector('.sheet.pick.open');
    await page.goBack(); await sleep(500);
    ok(await page.locator('.catalog').count() === 0, `${tag} browser back closes picker`);
    // reopen, build
    await page.locator('.start-cta').tap(); await page.waitForSelector('.sheet.pick.open .card b'); await sleep(400);
    const btn = page.locator('.sheet.pick .cta');
    const label = await btn.innerText();
    await btn.tap(); await page.waitForSelector('.tile');
    ok(/#\/malm/.test(page.url()), `${tag} Build (“${label.trim()}”) opens ${page.url().split('#')[1]}`);
    await page.goBack(); await sleep(500);
    ok(await page.locator('.sheet.pick.open').count() === 1, `${tag} back from parts returns to open picker`);
    // deep links
    await page.goto(base + '/#pieces'); await page.waitForSelector('.sheet.pick.open .card b');
    ok(true, `${tag} deep link #pieces opens picker`);
    await page.locator('.pick-head .close').tap(); await sleep(400);
    ok(await page.locator('.start-cta').isVisible(), `${tag} close after deep link shows CTA`);
  } else {
    ok(await page.locator('.catalog').isVisible() && await page.locator('.start-cta').count() === 0, `${tag} desktop keeps the picker`);
    await page.screenshot({ path: `${out}/${eng}-${name}-01-home.png` });
    await page.goto(base + '/#pieces'); await sleep(800);
    ok(await page.locator('.catalog').isVisible(), `${tag} #pieces on desktop shows picker`);
  }
  await page.goto(base + '/#/kallax'); await page.waitForSelector('.tile');
  ok(true, `${tag} piece deep link #/kallax opens parts`);
  await page.goto(base + '/#/billy/2'); await page.waitForSelector('.cap');
  ok(true, `${tag} step deep link #/billy/2 opens build`);
  await browser.close();
}
console.log('\nconsole errors:', errors.length ? errors : 'none');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASS');
process.exit(fails.length || errors.length ? 1 : 0);
