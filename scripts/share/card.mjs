// HTML for the 1200x630 link-preview cards. Rendered by scripts/share-cards.mjs with Playwright; text only + our own 3D renders.
import fs from 'node:fs';
import { root, esc } from './lib.mjs';

const font = `data:font/ttf;base64,${fs.readFileSync(`${root}scripts/share/Nunito-Variable.ttf`).toString('base64')}`;
const mark = (px) => `<svg viewBox="0 0 64 64" width="${px}" height="${px}"><rect width="64" height="64" rx="16" fill="#ff5a36"/><path d="M20 16 L20 40 Q20 48 28 48 L48 48" fill="none" stroke="#1f1b18" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ico = {
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
  people: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.4" fill="currentColor"/><path d="M2.5 20c.6-4 3.2-6 6.5-6s5.9 2 6.5 6z" fill="currentColor"/><circle cx="17" cy="9" r="2.6" fill="currentColor" opacity=".7"/><path d="M16 14.2c3 .1 4.9 1.9 5.5 5.8h-4.2" fill="currentColor" opacity=".7"/></svg>',
  steps: '<svg viewBox="0 0 24 24"><path d="M4 19h5v-5h5V9h5V4" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  voice: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 6a8.6 8.6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
};
const dots = (n) => `<span class="dots">${[1, 2, 3].map((i) => `<u class="${i <= n ? 'f' : ''}"></u>`).join('')}</span>`;

const css = `
@font-face { font-family: N; src: url(${font}) format('truetype'); font-weight: 200 1000; }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
body { font-family: N, sans-serif; color: #fbf6ef; background: #1f1b18; position: relative; -webkit-font-smoothing: antialiased; }
.glow { position: absolute; inset: 0; background: radial-gradient(560px 460px at 82% 58%, rgba(255, 90, 54, .34), rgba(255, 90, 54, 0) 70%), radial-gradient(900px 500px at 0% 0%, #2a2420, #1f1b18 70%); }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 42px 42px; -webkit-mask-image: linear-gradient(90deg, transparent 30%, #000 75%); }
.bar { position: absolute; left: 0; top: 0; bottom: 0; width: 14px; background: #ff5a36; }
.logo { position: absolute; left: 64px; top: 50px; display: flex; align-items: center; gap: 14px; font-weight: 900; font-size: 40px; letter-spacing: -.5px; }
.hero { position: absolute; right: 0; top: 0; height: 630px; object-fit: contain; filter: drop-shadow(0 24px 30px rgba(0,0,0,.45)); }
.col { position: absolute; left: 64px; top: 132px; }
.tag { display: inline-block; font-weight: 900; font-size: 26px; letter-spacing: 1.5px; color: #ff7a5c; text-transform: uppercase; border: 3px solid #ff5a36; border-radius: 99px; padding: 6px 20px 7px; }
.name { display: inline-block; font-weight: 1000; line-height: .95; letter-spacing: -3px; white-space: nowrap; margin-top: 18px; }
.sub { font-weight: 800; font-size: 44px; line-height: 1.08; color: #e8ddd0; margin-top: 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.chip { display: inline-flex; align-items: center; gap: 10px; font-weight: 900; font-size: 30px; background: rgba(255,255,255,.1); border-radius: 16px; padding: 8px 18px 10px 14px; }
.chip svg { width: 30px; height: 30px; color: #ff7a5c; }
.dots { display: inline-flex; gap: 5px; } .dots u { width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,.25); } .dots u.f { background: #ff5a36; }
.cta { position: absolute; left: 64px; bottom: 60px; display: inline-flex; align-items: center; gap: 12px; background: #ff5a36; color: #1f1b18; font-weight: 1000; font-size: 32px; border-radius: 18px; padding: 12px 26px 14px 20px; }
.cta svg { width: 34px; height: 34px; }
.url { position: absolute; bottom: 72px; font-weight: 800; font-size: 26px; color: #bfb3a6; }
.legal { position: absolute; left: 64px; bottom: 22px; font-weight: 600; font-size: 16px; color: #8f8478; }
.h1 { font-weight: 1000; font-size: 96px; line-height: .98; letter-spacing: -3px; margin-top: 0; }
.h1 em { font-style: normal; color: #ff5a36; }
.lede { font-weight: 800; font-size: 34px; line-height: 1.18; color: #e8ddd0; margin-top: 22px; width: 600px; }
`;

const fit = `<script>
for (const el of document.querySelectorAll('[data-fit]')) {
  const max = +el.dataset.fit, w = +el.dataset.w; let s = max; el.style.fontSize = s + 'px';
  while (el.scrollWidth > w && s > 40) { s -= 2; el.style.fontSize = s + 'px'; }
}
</script>`;

export function pieceCard(t, heroUrl) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="glow"></div><div class="grid"></div><div class="bar"></div>
<img class="hero" src="${heroUrl}" style="width:580px">
<div class="logo">${mark(52)}<span>hexkey</span></div>
<div class="col">
  <div class="tag">Works with ${esc(t.brand)}</div>
  <br><div class="name" data-fit="132" data-w="560">${esc(t.name)}</div>
  <div class="sub" style="width:560px">${esc(t.title)}</div>
  <div class="chips">
    <span class="chip">${ico.clock}${esc(t.stats[0])}</span>
    <span class="chip">${ico.people}${esc(t.stats[1])}</span>
    <span class="chip">${dots(t.level)}${esc(t.stats[2])}</span>
  </div>
</div>
<div class="cta">${ico.voice}Free 3D guide · ${esc(t.stats[3])}</div>
<div class="url" style="right:56px;top:62px;bottom:auto">hexkey.pages.dev</div>
<div class="legal">${esc(t.disclaimer)} Demo steps; follow the official instructions.</div>
${fit}</body></html>`;
}

export function siteCard(s, heroes) {
  // three of our own renders, overlapping, on the right
  const pos = [
    { l: 790, t: 0, w: 400 },
    { l: 600, t: 120, w: 380 },
    { l: 820, t: 220, w: 380 },
  ];
  const imgs = heroes.map((u, i) => `<img class="hero" src="${u}" style="left:${pos[i].l}px;top:${pos[i].t}px;width:${pos[i].w}px;height:auto;right:auto">`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="glow"></div><div class="grid"></div><div class="bar"></div>
${imgs}
<div class="logo">${mark(52)}<span>hexkey</span></div>
<div class="col" style="top:136px">
  <div class="h1">Flat-pack,<br>without the<br><em>headache.</em></div>
</div>
<div class="cta" style="bottom:118px">${ico.voice}Free 3D guides, read out loud</div>
<div class="chips" style="position:absolute;left:64px;bottom:50px;margin:0">
  <span class="chip">${ico.steps}${s.pieces} pieces</span><span class="chip">${s.brands} brands</span><span class="chip">Open source</span>
</div>
<div class="url" style="left:290px;top:62px;bottom:auto">hexkey.pages.dev</div>
<div class="legal" style="left:auto;right:56px;bottom:26px">Not affiliated with or endorsed by any furniture brand.</div>
${fit}</body></html>`;
}
