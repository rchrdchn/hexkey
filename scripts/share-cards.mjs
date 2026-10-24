// Renders the 1200x630 link-preview cards with our own 3D scene: public/og.jpg (site) and public/share/<slug>.jpg (one per piece),
// plus public/share/cards.json (what each card was made from, so scripts/share-check.mjs can spot a stale card).
// Usage: node scripts/share-cards.mjs [baseUrl=http://localhost:4173] [slugs=stale|all|a,b,c]   (needs a running `vite preview` of a fresh build)
// Cloudflare's build has no browser, so the cards are committed like public/thumbs/, and `npm run build` only checks them.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { root, catalog, pieceText, siteText, pieceKey, siteKey, SITE_HERO, CARD, MAX_BYTES } from './share/lib.mjs';
import { pieceCard, siteCard } from './share/card.mjs';

const base = process.argv[2] || 'http://localhost:4173';
const which = process.argv[3] || 'stale';
const cat = catalog();
const out = `${root}public/share`;
fs.mkdirSync(out, { recursive: true });
const manPath = `${out}/cards.json`;
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { site: null, pieces: {} };
const texts = Object.fromEntries(cat.map((e) => [e.slug, pieceText(e.slug, cat)]));
const all = cat.map((e) => e.slug);
const slugs = which === 'all' ? all : which === 'stale' ? all.filter((s) => man.pieces[s] !== pieceKey(texts[s]) || !fs.existsSync(`${out}/${s}.jpg`)) : which.split(',');
const site = siteText(cat);
const doSite = which === 'all' || man.site !== siteKey(site) || !fs.existsSync(`${root}public/og.jpg`) || which.split(',').some((s) => SITE_HERO.includes(s));

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const ctx3d = await browser.newContext({ viewport: { width: 580, height: 630 }, deviceScaleFactor: 2 });
const ctxCard = await browser.newContext({ viewport: { width: CARD.w, height: CARD.h }, deviceScaleFactor: 1 });

async function render(page, slug, q = 'explode=0.32&zoom=0.9') {
  await page.goto(`${base}/?thumb=${slug}&${q}&bg=none&dpr=2`);
  await page.waitForSelector('body[data-ready]', { timeout: 60000 });
  const png = await page.screenshot({ omitBackground: true });
  return `data:image/png;base64,${png.toString('base64')}`;
}
async function shoot(page, html, file) {
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  for (const q of [84, 78, 70, 62]) {
    const buf = await page.screenshot({ type: 'jpeg', quality: q, clip: { x: 0, y: 0, width: CARD.w, height: CARD.h } });
    if (buf.length <= MAX_BYTES || q === 62) { fs.writeFileSync(file, buf); return buf.length; }
  }
}

const t0 = Date.now();
let total = 0;
const queue = [...slugs];
const worker = async () => {
  const p3 = await ctx3d.newPage(), pc = await ctxCard.newPage();
  for (let s; (s = queue.shift()); ) {
    const n = await shoot(pc, pieceCard(texts[s], await render(p3, s)), `${out}/${s}.jpg`);
    man.pieces[s] = pieceKey(texts[s]); total += n;
    console.log(s, Math.round(n / 1024) + 'KB');
  }
};
await Promise.all([worker(), worker(), worker()]);
if (doSite) {
  const p3 = await ctx3d.newPage(), pc = await ctxCard.newPage();
  const heroes = [];
  for (const s of SITE_HERO) heroes.push(await render(p3, s, 'explode=0.3&zoom=0.95'));
  const n = await shoot(pc, siteCard(site, heroes), `${root}public/og.jpg`);
  man.site = siteKey(site);
  console.log('og.jpg', Math.round(n / 1024) + 'KB');
}
for (const s of Object.keys(man.pieces)) if (!texts[s]) { delete man.pieces[s]; fs.rmSync(`${out}/${s}.jpg`, { force: true }); }
man.pieces = Object.fromEntries(Object.entries(man.pieces).sort());
fs.writeFileSync(manPath, JSON.stringify(man, null, 1) + '\n');
console.log(`${slugs.length} piece cards${doSite ? ' + site card' : ''} in ${Math.round((Date.now() - t0) / 1000)}s`);
await browser.close();
