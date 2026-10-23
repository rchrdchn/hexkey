#!/usr/bin/env node
// Expands catalog/<slug>.json specs (archetype + dimensions + options) into full public/pieces/<slug>/piece.json files,
// and writes public/pieces/index.json + public/pieces/catalog.json (the picker's lightweight list).
// Hand-written pieces (no catalog spec) are left alone and only summarized.
//   node scripts/generate.mjs           write everything
//   node scripts/generate.mjs --check   exit 1 if any generated file is stale
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Build, r } from './gen/lib.mjs';
import { chest, bookcase, cubes } from './gen/storage.mjs';
import { table, apronTable, desk, wallShelf, bed, crib, ladder, stool } from './gen/frames.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
export const ARCHETYPES = { chest, bookcase, cubes, table, 'apron-table': apronTable, desk, 'wall-shelf': wallShelf, bed, crib, ladder, stool };
/** Hand-authored pieces keep their order at the front. */
const HAND = ['lack', 'kallax', 'billy'];
/** Brands (id -> label + not-affiliated line) come from the research file data/sources/brands.json. */
export const BRANDS = Object.fromEntries(JSON.parse(readFileSync(join(root, 'data/sources/brands.json'), 'utf8')).brands.map((b) => [b.id, b]));
const brandOf = (id = 'ikea') => { const b = BRANDS[id]; if (!b) throw new Error(`unknown brand "${id}" (add it to data/sources/brands.json)`); return b; };
const HAND_META = {
  lack: { category: 'tables', archetype: 'hand-made', confidence: 'high' },
  kallax: { category: 'shelving', archetype: 'hand-made', confidence: 'high' },
  billy: { category: 'shelving', archetype: 'hand-made', confidence: 'high' },
};

function estimate(p, spec) {
  const objs = p.objects.length;
  let hw = 0;
  for (const s of p.steps) for (const u of s.hardware ?? []) hw += u.count ?? u.at?.length ?? u.n ?? 0;
  const drawers = p.objects.filter((o) => /^d\d+f$/.test(o.id)).length;
  const minutes = Math.max(10, Math.round((4 + objs * 1.2 + hw * 0.25 + drawers * 6 + p.steps.length) / 5) * 5);
  const [W, H] = p.size;
  const people = spec.people ?? (spec.archetype === 'bed' || H >= 120 || W >= 140 ? 2 : 1);
  const level = spec.level ?? (minutes <= 20 ? 1 : minutes <= 75 ? 2 : 3);
  return { minutes: spec.minutes ?? minutes, people, level };
}

function bounds(objects) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const o of objects) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], o.pos[a] - o.size[a] / 2); hi[a] = Math.max(hi[a], o.pos[a] + o.size[a] / 2); }
  return [0, 1, 2].map((a) => Math.round(hi[a] - lo[a]));
}

export function generate(spec) {
  const fn = ARCHETYPES[spec.archetype];
  if (!fn) throw new Error(`${spec.slug}: unknown archetype ${spec.archetype}`);
  const b = new Build(spec);
  fn(b);
  const size = bounds(b.objects.filter((o) => !o.rot));
  const piece = {
    $schema: '../../../schema/piece.schema.json',
    $generated: `from catalog/${spec.slug}.json by scripts/generate.mjs (archetype "${spec.archetype}"). Edit the spec, not this file.`,
    slug: spec.slug, name: spec.name, title: spec.title, brand: brandOf(spec.brand).short ?? brandOf(spec.brand).name, brandId: spec.brand ?? 'ikea',
    disclaimer: brandOf(spec.brand).disclaimer, worksWith: spec.worksWith, productUrl: spec.productUrl,
    ...(spec.instructionsUrl ? { instructionsUrl: spec.instructionsUrl } : {}),
    size, minutes: 0, people: 1, level: 1, color: spec.color ?? '#f3efe8',
    category: spec.category, archetype: spec.archetype, confidence: spec.confidence, sources: spec.sources,
    ...(b.env.length ? { env: b.env } : {}),
    parts: b.parts, hardware: b.hardware, objects: b.objects, steps: b.steps,
    done: spec.done ?? `Done. Your ${spec.name} ${spec.title.toLowerCase()} is built. Give it a proud little pat.`,
  };
  Object.assign(piece, estimate(piece, spec));
  if (spec.notes) piece.notes = spec.notes;
  return piece;
}

function summary(p, meta = {}) {
  let hw = 0;
  for (const s of p.steps) for (const u of s.hardware ?? []) hw += u.count ?? u.at?.length ?? u.n ?? 0;
  return {
    slug: p.slug, name: p.name, title: p.title, brand: p.brand ?? 'IKEA', brandId: p.brandId ?? 'ikea', category: p.category ?? meta.category, archetype: p.archetype ?? meta.archetype,
    confidence: p.confidence ?? meta.confidence, size: p.size, minutes: p.minutes, people: p.people, level: p.level, color: p.color,
    steps: p.steps.length, pieces: p.objects.length, hardware: hw,
    tags: [p.name.toLowerCase(), p.title.toLowerCase(), (p.brand ?? 'IKEA').toLowerCase(), ...(meta.tags ?? [])],
  };
}

const stable = (o) => JSON.stringify(o, null, 2) + '\n';
let stale = 0;
function put(path, text) {
  const cur = existsSync(path) ? readFileSync(path, 'utf8') : '';
  if (cur === text) return;
  stale++;
  if (CHECK) { console.error(`stale: ${path.replace(root + '/', '')}`); return; }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

const specs = readdirSync(join(root, 'catalog')).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const s = JSON.parse(readFileSync(join(root, 'catalog', f), 'utf8'));
  brandOf(s.brand);
  if (s.slug !== f.replace(/\.json$/, '')) throw new Error(`catalog/${f}: slug must match file name`);
  return s;
});
const entries = HAND.map((slug) => summary(JSON.parse(readFileSync(join(root, 'public/pieces', slug, 'piece.json'), 'utf8')), HAND_META[slug]));
for (const spec of specs) {
  const p = generate(spec);
  put(join(root, 'public/pieces', spec.slug, 'piece.json'), stable(p));
  entries.push(summary(p, { tags: spec.tags }));
}
put(join(root, 'public/pieces/index.json'), JSON.stringify(entries.map((e) => e.slug)) + '\n');
put(join(root, 'public/pieces/catalog.json'), JSON.stringify(entries) + '\n');
if (CHECK && stale) { console.error(`${stale} generated file(s) are stale. Run: npm run gen`); process.exit(1); }
console.log(`${CHECK ? 'checked' : 'generated'} ${specs.length} catalog pieces (+${HAND.length} hand-made), ${CHECK ? 'all fresh' : `${stale} file(s) written`}`);
void r;
