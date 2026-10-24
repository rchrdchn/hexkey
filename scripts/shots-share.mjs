// Share links: /p/<slug>/ opens the app at /#/<slug> (Chromium + WebKit iPhone 15), its meta matches the piece, and the
// header Share button hands /p/<slug>/ to the share sheet. Usage: node scripts/shots-share.mjs [baseUrl] [outDir] [slugs]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/share';
const slugs = (process.argv[4] || 'malm-6,kallax,floyd-bed-queen').split(',');
fs.mkdirSync(out, { recursive: true });
let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.error('FAIL', m); } else console.log('ok  ', m); };
const runs = [
  { name: 'webkit-iphone15', type: webkit, dev: devices['iPhone 15'] },
  { name: 'webkit-iphonese', type: webkit, dev: devices['iPhone SE'] },
  { name: 'chromium-desktop', type: chromium, dev: { viewport: { width: 1280, height: 800 } } },
];
for (const r of runs) {
  const b = await r.type.launch(r.type === chromium ? { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] } : {});
  const ctx = await b.newContext(r.dev);
  await ctx.addInitScript(() => { window.__shared = []; navigator.share = async (d) => { window.__shared.push(d); }; });
  const page = await ctx.newPage();
  for (const s of slugs) {
    const res = await page.goto(`${base}/p/${s}/`);
    ok(res.status() === 200, `${r.name} /p/${s}/ 200`);
    await page.waitForSelector('.sheet.parts', { timeout: 30000 });
    const u = new URL(page.url());
    ok(u.pathname === '/' && u.hash === `#/${s}`, `${r.name} /p/${s}/ -> ${u.pathname}${u.hash}`);
    const btn = page.locator('header.top button[aria-label^="Share the"]');
    ok(await btn.isVisible(), `${r.name} ${s} share button visible`);
    const box = await btn.boundingBox(); const vw = page.viewportSize().width;
    ok(box && box.x >= 0 && box.x + box.width <= vw, `${r.name} ${s} share button inside the screen`);
    await btn.click();
    const shared = await page.evaluate(() => window.__shared.at(-1));
    ok(shared?.url === `${new URL(base).origin}/p/${s}/`, `${r.name} ${s} shares ${shared?.url}`);
    await page.screenshot({ path: `${out}/${r.name}-${s}.png` });
  }
  // back/forward: the hash route still works after the swap
  await page.goto(`${base}/p/${slugs[0]}/#/${slugs[1]}`);
  await page.waitForSelector('.sheet.parts');
  ok(new URL(page.url()).hash === `#/${slugs[1]}`, `${r.name} an explicit hash wins`);
  await b.close();
}
console.log(fail ? `shots-share: ${fail} failure(s)` : 'shots-share: all ok');
process.exit(fail ? 1 : 0);
