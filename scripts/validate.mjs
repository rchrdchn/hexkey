// Checks every piece.json: ids, references, counts, and that audio clips match the text.
// Usage: node scripts/validate.mjs   (exit 1 on errors; audio drift is only a warning)
import fs from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const slugs = JSON.parse(fs.readFileSync(`${root}public/pieces/index.json`, 'utf8'));
const KINDS = ['dowel', 'campin', 'cam', 'screw', 'nail', 'bolt', 'shelfpin', 'bracket'];
const AXES = ['+x', '-x', '+y', '-y', '+z', '-z'];
let errors = 0, warns = 0;
const err = (s, m) => { errors++; console.error(`✗ ${s}: ${m}`); };
const warn = (s, m) => { warns++; console.warn(`! ${s}: ${m}`); };
const v3 = (a) => Array.isArray(a) && a.length === 3 && a.every((n) => typeof n === 'number' && isFinite(n));
for (const slug of slugs) {
  const f = `${root}public/pieces/${slug}/piece.json`;
  let p;
  try { p = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { err(slug, `cannot read ${f}: ${e.message}`); continue; }
  if (p.slug !== slug) err(slug, `slug "${p.slug}" must match folder`);
  for (const k of ['name', 'title', 'worksWith', 'productUrl', 'done']) if (typeof p[k] !== 'string' || !p[k]) err(slug, `missing ${k}`);
  if (!/^https:\/\/www\.ikea\.com\/[a-z]{2}\/[a-z]{2}\/p\//.test(p.productUrl || '')) err(slug, 'productUrl must be an ikea.com product page (/p/), never a PDF or asset');
  if (!/IKEA®/.test(p.worksWith || '')) warn(slug, 'worksWith should say "IKEA® <NAME> ..."');
  const parts = new Set(), hw = new Set(), objs = new Map();
  for (const x of p.parts || []) { if (parts.has(x.id)) err(slug, `duplicate part ${x.id}`); parts.add(x.id); }
  for (const x of p.hardware || []) { if (hw.has(x.id)) err(slug, `duplicate hardware ${x.id}`); hw.add(x.id); if (!KINDS.includes(x.kind)) err(slug, `hardware ${x.id}: kind must be one of ${KINDS}`); }
  for (const o of p.objects || []) {
    if (objs.has(o.id)) err(slug, `duplicate object ${o.id}`);
    objs.set(o.id, o);
    if (!parts.has(o.part)) err(slug, `object ${o.id}: unknown part ${o.part}`);
    if (!v3(o.size) || o.size.some((n) => n <= 0)) err(slug, `object ${o.id}: size must be [w,h,d] cm > 0`);
    if (!v3(o.pos)) err(slug, `object ${o.id}: pos must be [x,y,z] cm`);
  }
  const added = new Map();
  (p.steps || []).forEach((s, i) => {
    const at = `${slug} step ${i + 1}`;
    if (!s.caption || !s.say) err(at, 'caption and say are required');
    if (s.caption && s.caption.length > 28) warn(at, `caption is long (${s.caption.length} chars); keep it glanceable`);
    for (const id of s.add || []) { if (!objs.has(id)) err(at, `add: unknown object ${id}`); if (added.has(id)) err(at, `${id} already added in step ${added.get(id) + 1}`); added.set(id, i); }
    if (s.from && !v3(s.from)) err(at, 'from must be [x,y,z]');
    if (s.pose && !v3(s.pose)) err(at, 'pose must be [rx,ry,rz] degrees');
    for (const u of s.hardware || []) {
      if (!hw.has(u.id)) err(at, `hardware: unknown id ${u.id}`);
      if (!AXES.includes(u.axis)) err(at, `hardware ${u.id}: axis must be one of ${AXES}`);
      if (!u.at && !u.line && !u.count) err(at, `hardware ${u.id}: needs at[], line+n or count`);
      if (u.at && !u.at.every(v3)) err(at, `hardware ${u.id}: bad point in at[]`);
      if (u.line && (!u.n || !u.line.every(v3))) err(at, `hardware ${u.id}: line needs two points and n`);
    }
    if (s.view && (typeof s.view.az !== 'number' || typeof s.view.el !== 'number')) err(at, 'view needs az and el (degrees)');
  });
  for (const id of objs.keys()) if (!added.has(id)) err(slug, `object ${id} is never added in a step`);
  // audio
  const idxf = `${root}public/audio/${slug}/index.json`;
  if (!fs.existsSync(idxf)) warn(slug, 'no audio yet (browser voice will be used). Run scripts/voice.py');
  else {
    const idx = JSON.parse(fs.readFileSync(idxf, 'utf8'));
    (p.steps || []).forEach((s, i) => { const k = `step-${i + 1}`; if (idx[k]?.text !== s.say) warn(slug, `${k} audio is stale or missing (browser voice fallback). Run scripts/voice.py ${slug}`); });
    for (const [k, v] of Object.entries(idx)) if (!fs.existsSync(`${root}public/audio/${slug}/${v.file}`)) err(slug, `audio ${k}: missing file ${v.file}`);
  }
  const n = (p.steps || []).length, hwN = (p.steps || []).flatMap((s) => s.hardware || []).reduce((a, u) => a + (u.at?.length ?? u.n ?? u.count ?? 0), 0);
  console.log(`✓ ${slug}: ${objs.size} parts, ${hwN} hardware, ${n} steps`);
}
console.log(errors ? `\n${errors} error(s), ${warns} warning(s)` : `\nall good (${warns} warning(s))`);
process.exit(errors ? 1 : 0);
