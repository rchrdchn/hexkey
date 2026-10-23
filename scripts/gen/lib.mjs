// Shared helpers for the archetype generators. Plain JS so `node` runs it with no build step.
// Units: centimeters. Axes: x = right, y = up, z = toward the viewer (front).

export const r = (n) => Math.round(n * 100) / 100;
export const r3 = (v) => v.map(r);

/** Standard hardware. A generator calls b.use('cam') and gets the id back; only used kinds end up in the piece. */
export const HW = {
  pin: { label: 'Cam pin', kind: 'campin' },
  cam: { label: 'Cam lock', kind: 'cam' },
  dowel: { label: 'Wood dowel', kind: 'dowel' },
  screw: { label: 'Screw', kind: 'screw' },
  nail: { label: 'Nail', kind: 'nail' },
  spin: { label: 'Shelf pin', kind: 'shelfpin' },
  anchor: { label: 'Wall bracket', kind: 'bracket' },
  bolt: { label: 'Bolt', kind: 'bolt' },
  dbolt: { label: 'Double-ended screw', kind: 'bolt' },
  knob: { label: 'Knob', kind: 'knob' },
  hinge: { label: 'Hinge', kind: 'hinge' },
  sleeve: { label: 'Plastic sleeve', kind: 'shelfpin' },
  foot: { label: 'Levelling foot', kind: 'bolt' },
  caster: { label: 'Caster wheel', kind: 'bolt' },
};

export class Build {
  constructor(spec) {
    this.spec = spec;
    this.o = spec.options ?? {};
    this.parts = []; this.hardware = []; this.objects = []; this.steps = []; this.env = [];
  }
  part(id, label, plural) {
    if (!this.parts.find((p) => p.id === id)) this.parts.push(plural ? { id, label, plural } : { id, label });
    return id;
  }
  use(id, override) {
    const d = { ...HW[id], ...(override ?? {}) };
    if (!d.kind) throw new Error(`unknown hardware ${id}`);
    if (!this.hardware.find((h) => h.id === id)) this.hardware.push(d.plural ? { id, label: d.label, plural: d.plural, kind: d.kind } : { id, label: d.label, kind: d.kind });
    return id;
  }
  obj(id, part, size, pos, extra = {}) {
    if (this.objects.find((x) => x.id === id)) throw new Error(`duplicate object ${id}`);
    const o = { id, part, size: r3(size), pos: r3(pos), ...extra };
    if (o.boxes) o.boxes = o.boxes.map((s) => ({ ...s, s: r3(s.s), p: r3(s.p) }));
    this.objects.push(o);
    return id;
  }
  step(s) {
    const out = {};
    for (const k of ['caption', 'say', 'add', 'from', 'twist', 'pose', 'hardware', 'view', 'safety']) {
      const v = s[k];
      if (v === undefined || v === null || v === false || (Array.isArray(v) && !v.length)) continue;
      out[k] = v;
    }
    if (out.hardware) out.hardware = out.hardware.filter((u) => (u.at && u.at.length) || u.count).map((u) => (u.at ? { ...u, at: u.at.map(r3) } : u));
    if (out.hardware && !out.hardware.length) delete out.hardware;
    this.steps.push(out);
    return this.steps.length - 1;
  }
  /** hardware use helper: H('cam', '+y', [[x,y,z], ...], {spin:true}) */
  H(id, axis, at, extra = {}) { this.use(id); return { id, axis, at, ...extra }; }
  C(id, count) { this.use(id); return { id, axis: '+y', count }; }
}

// ---------- words ----------
export const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
export const say = (n) => (n <= 20 ? NUM[n] : String(n));
export const Say = (n) => { const s = say(n); return s[0].toUpperCase() + s.slice(1); };
export const ord = (n) => ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'][n] ?? `number ${n + 1}`;
/** Pick a line deterministically per slug so pieces don't all sound the same. */
export function pick(slug, key, options) {
  let h = 0;
  for (const c of slug + key) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return options[h % options.length];
}
export const spread = (a, b, n) => (n === 1 ? [(a + b) / 2] : Array.from({ length: n }, (_, k) => a + ((b - a) * k) / (n - 1)));
