// Shared by scripts/share-cards.mjs (images), scripts/share-pages.mjs (static /p/<slug>/ pages) and scripts/share-check.mjs.
// One place for the words on link previews, so the image, the page and the check never drift apart.
import fs from 'node:fs';
import crypto from 'node:crypto';

export const root = new URL('../..', import.meta.url).pathname;
export const SITE = (process.env.SITE_URL || 'https://hexkey.pages.dev').replace(/\/$/, '');
export const CARD = { w: 1200, h: 630 };
/** Bump when the card design changes, so share-check asks for a regenerate. */
export const DESIGN = 3;
export const MAX_BYTES = 300 * 1024;

export const catalog = () => JSON.parse(fs.readFileSync(`${root}public/pieces/catalog.json`, 'utf8'));
export const piece = (slug) => JSON.parse(fs.readFileSync(`${root}public/pieces/${slug}/piece.json`, 'utf8'));

export const fmtMinutes = (m) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`);
export const LEVEL = { 1: 'Easy', 2: 'Medium', 3: 'Advanced' };
const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

/** "IKEA®" from "IKEA® MALM chest of 6 drawers, 160×48×78 cm (…)" */
export const brandMark = (p) => (p.worksWith.includes('®') ? p.worksWith.slice(0, p.worksWith.indexOf('®') + 1) : `${p.brand}®`);
/** "IKEA® MALM chest of 6 drawers" (no size) */
export const worksShort = (p) => p.worksWith.split(/,\s/)[0].replace(/\s*\([^)]*\)$/, '');
export const disclaimer = (p) => p.disclaimer ?? 'Not affiliated with or endorsed by Inter IKEA Systems B.V.';

export function pieceText(slug, cat = catalog()) {
  const p = piece(slug);
  const e = cat.find((x) => x.slug === slug);
  if (!e) throw new Error(`${slug} missing from catalog.json`);
  const people = `${e.people} ${e.people > 1 ? 'people' : 'person'}`;
  const stats = [fmtMinutes(e.minutes), people, LEVEL[e.level] ?? 'Medium', `${e.steps} steps`];
  return {
    slug,
    name: p.name,
    title: p.title,
    brand: brandMark(p),
    worksWith: worksShort(p),
    disclaimer: disclaimer(p),
    level: e.level,
    stats,
    parts: e.pieces + e.hardware,
    ogTitle: `How to build the ${p.name} ${lowerFirst(p.title)}, step by step in 3D`,
    ogDescription: `Free 3D assembly guide, read out loud: ${stats.join(' · ')}, ${e.pieces + e.hardware} parts. Works with ${worksShort(p)}. ${disclaimer(p)}`,
    alt: `${p.name} ${lowerFirst(p.title)} in 3D, parts pulled apart. Works with ${worksShort(p)}. ${stats.join(', ')}.`,
  };
}

export function siteText(cat = catalog()) {
  const brands = new Set(cat.map((e) => e.brandId ?? 'ikea')).size;
  return {
    pieces: cat.length,
    brands,
    ogTitle: 'Hexkey · Flat-pack, without the headache',
    ogDescription: `Free step-by-step 3D assembly guides that talk you through every screw. ${cat.length} pieces from ${brands} brands, from IKEA® to Zinus®. No account, no install. Open source. Not affiliated with any brand.`,
    alt: `Hexkey: flat-pack furniture without the headache. Free 3D assembly guides with voice, ${cat.length} pieces, ${brands} brands.`,
  };
}

export const hash = (o) => crypto.createHash('sha1').update(JSON.stringify([DESIGN, o])).digest('hex').slice(0, 12);
/** What a card's pixels depend on (text + geometry file). Regenerate when this changes. */
export const pieceKey = (t) => hash([t.name, t.title, t.brand, t.stats, t.disclaimer, fs.readFileSync(`${root}public/pieces/${t.slug}/piece.json`, 'utf8').length]);
export const siteKey = (s) => hash([s.pieces, s.brands]);
export const SITE_HERO = ['kallax', 'malm-6', 'zinus-allen-queen'];

/** JPEG width/height from the SOF marker (no deps). */
export function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    const m = buf[i + 1], len = buf.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
