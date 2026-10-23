import type { Piece, PieceDef, HwInst, V3 } from './types';

const AXES: Record<string, V3> = { '+x': [1, 0, 0], '-x': [-1, 0, 0], '+y': [0, 1, 0], '-y': [0, -1, 0], '+z': [0, 0, 1], '-z': [0, 0, -1] };
export const axisVec = (a: string): V3 => AXES[a] ?? [0, 1, 0];

/** Expand a raw piece.json into everything the app needs (shared with scripts/validate.mjs logic). */
export function derive(def: PieceDef): Piece {
  const addedAt: Record<string, number> = {};
  const hw: HwInst[] = [];
  const poses: V3[] = [];
  let pose: V3 = [0, 0, 0];
  const hwCount: Record<string, number> = {};
  def.steps.forEach((s, i) => {
    if (s.pose) pose = s.pose;
    poses.push(pose);
    (s.add ?? []).forEach((id) => (addedAt[id] = i));
    let order = 0;
    (s.hardware ?? []).forEach((u, j) => {
      const kind = def.hardware.find((h) => h.id === u.id)?.kind ?? 'dowel';
      let pts: V3[] = u.at ?? [];
      if (u.line && u.n) {
        const [a, b] = u.line;
        pts = Array.from({ length: u.n }, (_, k) => {
          const t = u.n! === 1 ? 0.5 : k / (u.n! - 1);
          return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] as V3;
        });
      }
      pts.forEach((p, k) => hw.push({ key: `${i}-${j}-${k}`, id: u.id, kind, pos: p, axis: axisVec(u.axis), spin: !!u.spin, step: i, order: order++ }));
      hwCount[u.id] = (hwCount[u.id] ?? 0) + (pts.length || u.count || 0);
    });
  });
  const partCount: Record<string, number> = {};
  def.objects.forEach((o) => (partCount[o.part] = (partCount[o.part] ?? 0) + 1));
  return { ...def, addedAt, hw, poses, partCount, hwCount, totalHw: Object.values(hwCount).reduce((a, b) => a + b, 0) };
}

export const SLUGS = ['lack', 'kallax', 'billy'] as const;
const cache = new Map<string, Promise<Piece>>();
export function loadPiece(slug: string): Promise<Piece> {
  if (!cache.has(slug)) {
    cache.set(slug, fetch(`${import.meta.env.BASE_URL}pieces/${slug}/piece.json`).then((r) => {
      if (!r.ok) throw new Error(`piece ${slug}: ${r.status}`);
      return r.json();
    }).then(derive));
  }
  return cache.get(slug)!;
}

/** Hardware needed in one step, grouped: [{id, n}] */
export function stepHardware(p: Piece, i: number) {
  const m = new Map<string, number>();
  const s = p.steps[i];
  (s?.hardware ?? []).forEach((u) => {
    const n = u.at?.length ?? u.n ?? u.count ?? 0;
    m.set(u.id, (m.get(u.id) ?? 0) + n);
  });
  return [...m].map(([id, n]) => ({ id, n, def: p.hardware.find((h) => h.id === id)! }));
}

export function stepParts(p: Piece, i: number) {
  const m = new Map<string, number>();
  (p.steps[i]?.add ?? []).forEach((oid) => {
    const o = p.objects.find((x) => x.id === oid)!;
    m.set(o.part, (m.get(o.part) ?? 0) + 1);
  });
  return [...m].map(([id, n]) => ({ id, n, def: p.parts.find((x) => x.id === id)!, size: p.objects.find((o) => o.part === id)!.size }));
}

/** Words for "how many" (also used to pre-generate audio). Keep in sync with scripts/voice.py */
export function howManyText(p: Piece, i: number) {
  const hw = stepHardware(p, i);
  const parts = stepParts(p, i);
  const word = (n: number, d: { label: string; plural?: string }) => `${n} ${(n > 1 ? plural(d) : d.label).toLowerCase()}`;
  if (!hw.length && !parts.length) return 'Nothing new this step. Just you and the frame.';
  const bits = [...parts.map((x) => word(x.n, x.def)), ...hw.map((x) => word(x.n, x.def))];
  const list = bits.length > 1 ? `${bits.slice(0, -1).join(', ')} and ${bits[bits.length - 1]}` : bits[0];
  return `This step uses ${list}.`;
}

export const plural = (d: { label: string; plural?: string }) => d.plural ?? (d.label.endsWith('s') ? d.label : d.label + 's');
