// Runs after `vite build`. Writes static pages that link previews (iMessage, X, Slack, Facebook…) can read, since the app's
// own routes are hash routes (#/malm-6) that crawlers never see:
//   dist/p/<slug>/index.html  the app's own index.html with that piece's title, description and card image (public/share/<slug>.jpg).
//                             It IS the app (same scripts), so there is no redirect hop: a tiny inline script swaps the address to /#/<slug>
//                             before the app starts. Crawlers don't run it, and the page stays readable without JS.
//   dist/index.html           site meta + pre-JS text refreshed with the live piece/brand counts.
//   dist/sitemap.xml, dist/llms.txt, dist/404.html
// Any robots meta in index.html is copied as-is (today there is none: the site is indexable), so the /p/ pages always follow the home page's indexing choice.
import fs from 'node:fs';
import { root, SITE, catalog, pieceText, siteText, esc } from './share/lib.mjs';

const dist = `${root}dist`;
const tpl = fs.readFileSync(`${dist}/index.html`, 'utf8');
// link-preview video (og:video on every page): recorded from the live app, committed like og.jpg
if (!fs.existsSync(`${dist}/og-video.mp4`) || fs.statSync(`${dist}/og-video.mp4`).size > 5e6) throw new Error('public/og-video.mp4 missing or over 5 MB');
if (!tpl.includes('<!-- share:start') || !tpl.includes('<!-- prejs:start -->')) throw new Error('index.html lost its share:/prejs: markers');
const cat = catalog();
const site = siteText(cat);

function head({ title, description, url, image, alt }) {
  const d = esc(description), t = esc(title), a = esc(alt);
  return `<!-- share:start -->
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Hexkey" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${a}" />
    <meta property="og:video" content="${SITE}/og-video.mp4" />
    <meta property="og:video:secure_url" content="${SITE}/og-video.mp4" />
    <meta property="og:video:type" content="video/mp4" />
    <meta property="og:video:width" content="1280" />
    <meta property="og:video:height" content="720" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${a}" />
    <!-- share:end -->`;
}
const swap = (html, block, prejs, extra = '') => html
  .replace(/<!-- share:start[\s\S]*?<!-- share:end -->/, block + extra)
  .replace(/<!-- prejs:start -->[\s\S]*?<!-- prejs:end -->/, `<!-- prejs:start -->${prejs}<!-- prejs:end -->`);

// home
const home = swap(tpl, head({ title: site.ogTitle, description: site.ogDescription, url: `${SITE}/`, image: `${SITE}/og.jpg`, alt: site.alt }),
  `\n        <h1>Flat-pack, without the headache</h1>\n        <p>Free step-by-step 3D assembly guides that talk you through every screw. ${site.pieces} pieces from ${site.brands} brands. No account, no install. Open source. Not affiliated with any brand.</p>\n        `);
fs.writeFileSync(`${dist}/index.html`, home);

// one page per piece
let n = 0;
for (const e of cat) {
  const t = pieceText(e.slug, cat);
  if (!fs.existsSync(`${dist}/share/${e.slug}.jpg`)) throw new Error(`missing public/share/${e.slug}.jpg (run npm run share-cards)`);
  const url = `${SITE}/p/${e.slug}/`;
  const go = `\n    <script>if (!location.hash) history.replaceState(null, '', '/#/${e.slug}');</script>`;
  const body = `\n        <h1>${esc(t.ogTitle)}</h1>\n        <p>${esc(t.stats.join(' · '))} · ${t.parts} parts. Works with ${esc(t.worksWith)}.</p>\n        <p><a href="/#/${e.slug}">Open the free 3D guide</a></p>\n        <p>${esc(t.disclaimer)} Demo steps: always follow the official instructions in your box.</p>\n        `;
  fs.mkdirSync(`${dist}/p/${e.slug}`, { recursive: true });
  fs.writeFileSync(`${dist}/p/${e.slug}/index.html`, swap(tpl, head({ title: t.ogTitle, description: t.ogDescription, url, image: `${SITE}/share/${e.slug}.jpg`, alt: t.alt }), body, go));
  n++;
}

// sitemap, llms.txt, 404
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(`${dist}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  [`${SITE}/`, ...cat.map((e) => `${SITE}/p/${e.slug}/`)].map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n');
const byBrand = new Map();
for (const e of cat) { const t = pieceText(e.slug, cat); const k = t.brand; if (!byBrand.has(k)) byBrand.set(k, []); byBrand.get(k).push(t); }
fs.writeFileSync(`${dist}/llms.txt`, `# Hexkey

> Free, open-source, voice-guided 3D assembly guides for flat-pack furniture. ${site.pieces} pieces from ${site.brands} brands. Pick a piece, check the parts in the box, then build step by step while a voice reads each step. Works on phones; no account, no install. Hexkey is not affiliated with or endorsed by any furniture brand; its steps are demos written in its own words, so always follow the official instructions in the box.

- Site: ${SITE}/
- Source code (MIT) and data (CC BY-SA 4.0): https://github.com/rchrdchn/hexkey
- Every guide has a page at ${SITE}/p/<slug>/ that opens the 3D guide at ${SITE}/#/<slug>.

## Guides
${[...byBrand].sort((a, b) => a[0].localeCompare(b[0])).map(([b, ts]) => `\n### Works with ${b}\n` + ts.map((t) => `- [${t.name} ${t.title}](${SITE}/p/${t.slug}/): ${t.stats.join(', ')}, ${t.parts} parts`).join('\n')).join('\n')}
`);
fs.writeFileSync(`${dist}/404.html`, `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Not found · Hexkey</title><link rel="icon" href="/icon.svg" type="image/svg+xml" />
<style>body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f6f1ea; color: #1f1b18; font-family: ui-rounded, "SF Pro Rounded", system-ui, -apple-system, sans-serif; text-align: center; padding: 24px; } h1 { font-size: 2rem; margin: 0 0 .4rem; } p { color: #7a6f64; } a { display: inline-block; margin-top: .6rem; background: #ff5a36; color: #fff; font-weight: 800; padding: 12px 22px; border-radius: 99px; text-decoration: none; }</style>
</head><body><main><h1>That page isn't here</h1><p>The link may be old, or the piece was renamed.</p><a href="/">Back to Hexkey</a></main></body></html>
`);
console.log(`share-pages: ${n} /p/ pages, sitemap.xml (${n + 1} URLs), llms.txt, 404.html`);
