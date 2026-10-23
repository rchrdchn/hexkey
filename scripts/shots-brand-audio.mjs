// Non-IKEA narration checks. 1) Over HTTP: every non-IKEA piece has an audio index whose step texts match the piece JSON,
// and every clip it lists returns 200. 2) In the browser (WebKit iPhone 15 + Chromium desktop): open 3 non-IKEA pieces,
// step through every step, and confirm the step clips load (no 4xx/5xx on /audio/), no console errors, no sideways overflow.
// Usage: node scripts/shots-brand-audio.mjs [baseUrl] [outDir] [slugs=zinus-mia-queen,tribesigns-55-desk,we-kelm-tv-stand]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/brand-audio';
const pick = (process.argv[4] || 'zinus-mia-queen,tribesigns-55-desk,we-kelm-tv-stand').split(',');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const root = new URL('../public/pieces/', import.meta.url);
const slugs = JSON.parse(fs.readFileSync(new URL('index.json', root)));
const piece = (s) => JSON.parse(fs.readFileSync(new URL(`${s}/piece.json`, root)));
const fails = [], errors = [];
const get = async (u, n = 3) => { for (;;) { try { return await fetch(u); } catch (e) { if (--n <= 0) throw e; await sleep(1000); } } };
const ok = (c, m) => { if (!c) { console.log(`✗ ${m}`); fails.push(m); } return c; };

// (content types are checked too: the SPA fallback answers unknown paths with index.html and a 200)
// 1) HTTP sweep
let clips = 0;
const nonIkea = slugs.filter((s) => (piece(s).brandId || 'ikea') !== 'ikea');
for (const s of nonIkea) {
  const p = piece(s);
  const r = await get(`${base}/audio/${s}/index.json`);
  if (!ok(r.ok, `${s}: audio index ${r.status}`)) continue;
  const idx = await r.json();
  p.steps.forEach((st, i) => {
    ok(idx[`step-${i + 1}`]?.text === st.say, `${s}: step-${i + 1} clip text matches piece JSON`);
    ok(!!idx[`count-${i + 1}`], `${s}: count-${i + 1} clip listed`);
  });
  ok(idx.done?.text === p.done, `${s}: done clip text matches`);
  const files = Object.values(idx).map((v) => v.file);
  const res = [];
  for (const f of files) res.push(await get(`${base}/audio/${s}/${f}`).then((x) => (x.ok && /audio\/mpeg/.test(x.headers.get('content-type') || '') ? 200 : `${x.status} ${x.headers.get('content-type')}`)));
  res.forEach((st, i) => ok(st === 200, `${s}: ${files[i]} → ${st}`));
  clips += files.length;
}
console.log(`HTTP: ${nonIkea.length} non-IKEA pieces, ${clips} clips checked, ${fails.length} failures`);

// 2) Browser step-through
const runs = [
  ['webkit', 'iphone', webkit, { ...devices['iPhone 15'], deviceScaleFactor: 2 }],
  ['chromium', 'desktop', chromium, { viewport: { width: 1440, height: 900 } }],
];
for (const [eng, name, bt, opts] of runs) {
  const browser = await bt.launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] : [] });
  const o = { ...opts }; delete o.defaultBrowserType;
  for (const slug of pick) {
    const ctx = await browser.newContext(o);
    const page = await ctx.newPage();
    const tag = `[${eng}/${name}/${slug}]`;
    const audioOk = new Set(), audioBad = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag} ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`${tag} pageerror: ${e.message}`));
    page.on('response', (r) => {
      const u = r.url();
      if (!u.includes('/audio/')) return;
      // WebKit reports media fetches as status 0 with no headers; the HTTP sweep above checks those files' content types
      const ct = r.headers()['content-type'] || '';
      if (r.status() >= 400 || (u.endsWith('.mp3') && r.status() > 0 && !/audio/.test(ct))) audioBad.push(`${r.status()} ${ct} ${u}`); else if (u.endsWith('.mp3')) audioOk.add(u.split('/').pop().split('-').slice(0, 2).join('-'));
    });
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    await page.goto(`${base}/#pieces`);
    await page.waitForSelector(`.card[data-slug="${slug}"]`);
    await page.locator(`.card[data-slug="${slug}"]`).click();
    await page.waitForSelector('.cta:not([disabled])');
    await page.locator('.cta').first().click();
    await page.waitForSelector('.tile');
    await sleep(800);
    const tiles = page.locator('.tile'); const n = await tiles.count();
    for (let i = 0; i < n; i++) await tiles.nth(i).click();
    await sleep(600);
    await page.locator('.cta').click({ force: true });
    await page.waitForSelector('.cap');
    const steps = await page.locator('.progress button').count();
    const mid = Math.floor(steps / 2);
    for (let i = 0; i < steps; i++) {
      await sleep(i === mid ? 2600 : 1300);
      if (i === mid) await page.screenshot({ path: `${out}/${eng}-${name}-${slug}-step${i + 1}.png` });
      ok(await overflow() <= 0, `${tag} step ${i + 1} no sideways overflow`);
      if (i < steps - 1) await page.locator('.next').click({ force: true });
    }
    const stepClips = [...audioOk].filter((k) => k.startsWith('step-')).length;
    ok(audioBad.length === 0, `${tag} audio 4xx/5xx: ${audioBad.join(', ')}`);
    ok(stepClips === steps, `${tag} ${stepClips}/${steps} step clips loaded`);
    console.log(`${tag} ${steps} steps, ${stepClips} step clips loaded, ${audioBad.length} bad audio responses`);
    await ctx.close();
  }
  await browser.close();
}
console.log(errors.length ? `\n${errors.length} console error(s):\n${errors.join('\n')}` : '\nno console errors');
console.log(fails.length ? `${fails.length} check(s) failed` : 'all checks passed');
process.exit(errors.length || fails.length ? 1 : 0);
