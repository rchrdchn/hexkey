// Fails when a link-preview card is missing, the wrong size, too heavy, or stale (its piece's name/stats changed since it was rendered).
// Fix with: npm run build && npx vite preview --port 4191 & node scripts/share-cards.mjs http://localhost:4191   (re-renders only stale cards)
import fs from 'node:fs';
import { root, catalog, pieceText, siteText, pieceKey, siteKey, jpegSize, CARD, MAX_BYTES } from './share/lib.mjs';

const cat = catalog();
const manPath = `${root}public/share/cards.json`;
const man = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { site: null, pieces: {} };
const bad = [];
const look = (file, label) => {
  if (!fs.existsSync(file)) return bad.push(`${label}: missing`);
  const buf = fs.readFileSync(file), d = jpegSize(buf);
  if (!d) bad.push(`${label}: not a JPEG`);
  else if (d.w !== CARD.w || d.h !== CARD.h) bad.push(`${label}: ${d.w}x${d.h}, want ${CARD.w}x${CARD.h}`);
  if (buf.length > MAX_BYTES) bad.push(`${label}: ${Math.round(buf.length / 1024)}KB > ${MAX_BYTES / 1024}KB`);
  return buf.length;
};
let bytes = look(`${root}public/og.jpg`, 'og.jpg') || 0;
if (man.site !== siteKey(siteText(cat))) bad.push('og.jpg: stale (piece or brand count changed)');
for (const e of cat) {
  bytes += look(`${root}public/share/${e.slug}.jpg`, `share/${e.slug}.jpg`) || 0;
  if (man.pieces[e.slug] !== pieceKey(pieceText(e.slug, cat))) bad.push(`share/${e.slug}.jpg: stale`);
}
const extra = fs.readdirSync(`${root}public/share`).filter((f) => f.endsWith('.jpg') && !cat.some((e) => `${e.slug}.jpg` === f));
extra.forEach((f) => bad.push(`share/${f}: no such piece`));
if (bad.length) {
  console.error(`share-check: ${bad.length} problem(s)\n  ` + bad.slice(0, 40).join('\n  ') + '\nRe-render: node scripts/share-cards.mjs <preview-url>');
  process.exit(1);
}
console.log(`share-check: ${cat.length} piece cards + og.jpg OK, ${CARD.w}x${CARD.h}, ${(bytes / 1048576).toFixed(1)} MB total`);
