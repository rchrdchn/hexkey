// Checks data/tools.json: ids, rules, search queries, and that every piece gets a sane tool list
// (hex key + Phillips always; dressers and tall shelving always get the wall-anchor kit).
// The resolver mirrors toolsFor() in src/tools.ts; keep them in sync.
// Usage: node scripts/tools-check.mjs [--list]   (exit 1 on errors)
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const { tools, rules } = JSON.parse(fs.readFileSync(`${root}data/tools.json`, 'utf8'));
const slugs = JSON.parse(fs.readFileSync(`${root}public/pieces/index.json`, 'utf8'));
let errors = 0;
const err = (m) => { errors++; console.error(`✗ tools: ${m}`); };
const ids = new Set();
for (const t of tools) {
  if (!/^[a-z0-9-]+$/.test(t.id || '')) err(`bad id "${t.id}"`);
  if (ids.has(t.id)) err(`duplicate id "${t.id}"`);
  ids.add(t.id);
  for (const k of ['name', 'short', 'note', 'query', 'icon']) if (typeof t[k] !== 'string' || !t[k]) err(`${t.id}: missing ${k}`);
  if (/amazon|http|\$|★/i.test(`${t.name} ${t.note}`)) err(`${t.id}: name/note must be our own plain words (no links, prices or ratings)`);
  // `why`: the one-line reason in the Tools window. First matching `if` wins; the last entry is the catch-all.
  if (!Array.isArray(t.why) || !t.why.length) { err(`${t.id}: missing why list`); continue; }
  t.why.forEach((w, i) => {
    if (typeof w.text !== 'string' || w.text.length < 8 || w.text.length > 90) err(`${t.id}.why[${i}]: text must be one short line (8-90 chars)`);
    if (/amazon|http|\$|★|stars?\b|best seller/i.test(w.text || '')) err(`${t.id}.why[${i}]: our own words only (no links, prices or ratings)`);
    for (const k of Object.keys(w.if || {})) if (!['category', 'archetype', 'hardware', 'anchors'].includes(k)) err(`${t.id}.why[${i}]: unknown if.${k}`);
  });
  if (t.why[t.why.length - 1].if) err(`${t.id}: last why entry must have no "if" (catch-all)`);
  if (t.must !== undefined && t.must !== true) err(`${t.id}: must is true or absent`);
}
for (const id of ['hex-key', 'phillips']) if (!tools.find((t) => t.id === id)?.must) err(`${id} must be marked must: true`);
const lists = [['default', rules.default], ['tall', rules.tall?.tools],
  ...['category', 'archetype', 'combo', 'hardware'].flatMap((g) => Object.entries(rules[g] || {}).map(([k, v]) => [`${g}.${k}`, v])),
  ...Object.entries(rules.slugs || {}).flatMap(([s, o]) => [[`slugs.${s}.add`, o.add || []], [`slugs.${s}.drop`, o.drop || []]])];
for (const [where, l] of lists) {
  if (!Array.isArray(l)) { err(`${where} must be a list`); continue; }
  for (const id of l) if (!ids.has(id)) err(`${where}: unknown tool "${id}"`);
}
for (const s of Object.keys(rules.slugs || {})) if (!slugs.includes(s)) err(`slugs.${s}: no such piece`);
const order = tools.map((t) => t.id);
function toolsFor(p) {
  const set = new Set(rules.default);
  const add = (l) => l?.forEach((id) => set.add(id));
  if (p.category) add(rules.category[p.category]);
  if (p.archetype) add(rules.archetype[p.archetype]);
  add(rules.combo?.[`${p.category}+${p.archetype}`]);
  p.hardware.forEach((h) => add(rules.hardware[h.kind]));
  if (p.size[1] >= rules.tall.minHeightCm && p.archetype !== 'platform-bed' && p.archetype !== 'bed' && p.category !== 'desks') add(rules.tall.tools);
  const o = rules.slugs[p.slug];
  add(o?.add); o?.drop?.forEach((id) => set.delete(id));
  return order.filter((id) => set.has(id));
}
// Same matching as whyFor() in src/tools.ts.
function whyFor(t, p, anchored) {
  const kinds = new Set(p.hardware.map((h) => h.kind));
  return t.why.find(({ if: c }) => !c || ((!c.category || c.category.includes(p.category ?? '')) && (!c.archetype || c.archetype.includes(p.archetype ?? ''))
    && (!c.hardware || c.hardware.every((k) => kinds.has(k))) && (c.anchors === undefined || c.anchors === anchored)))?.text;
}
const list = process.argv.includes('--list');
for (const slug of slugs) {
  const p = JSON.parse(fs.readFileSync(`${root}public/pieces/${slug}/piece.json`, 'utf8'));
  const got = toolsFor(p);
  if (!got.includes('hex-key') || !got.includes('phillips')) err(`${slug}: must include hex-key and phillips`);
  const tallShelf = p.size[1] >= rules.tall.minHeightCm && ['shelving', 'storage', 'kids'].includes(p.category);
  if ((p.category === 'dressers' || tallShelf || (p.category === 'kids' && p.archetype === 'chest')) && !got.includes('anchors')) err(`${slug}: dressers, kids' chests and tall shelving need the wall-anchor kit`);
  const why = got.map((id) => [id, whyFor(tools.find((t) => t.id === id), p, got.includes('anchors'))]);
  for (const [id, w] of why) if (!w) err(`${slug}: no reason for ${id}`);
  if (got.includes('anchors') && p.archetype !== 'wall-shelf' && !/tip/.test(why.find(([id]) => id === 'anchors')[1])) err(`${slug}: the wall-anchor reason must say it stops tipping`);
  if (list) console.log(`${slug.padEnd(34)} ${got.join(', ')}`);
  if (process.argv.includes('--why')) for (const [id, w] of why) console.log(`  ${id.padEnd(9)} ${w}`);
}
console.log(errors ? `tools: ${errors} error(s)` : `tools: ${tools.length} tools, ${slugs.length} pieces OK`);
process.exit(errors ? 1 : 0);
