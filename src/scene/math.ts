import * as THREE from 'three';
import type { Piece, V3 } from '../types';

export const CM = 0.01; // data is in cm, scene in meters
export const D2R = Math.PI / 180;

export function pieceBounds(p: Pick<Piece, 'objects' | 'env'>) {
  const b = new THREE.Box3();
  [...p.objects, ...(p.env ?? [])].forEach((o) => {
    const h = new THREE.Vector3(...o.size).multiplyScalar(0.5);
    const c = new THREE.Vector3(...o.pos);
    b.expandByPoint(c.clone().sub(h)).expandByPoint(c.clone().add(h));
  });
  return b;
}

/** Pose = euler degrees (XYZ). Rotates about the piece center, then lifts so it rests on the floor. Returns local->world matrix (meters). */
export function poseMatrix(p: Piece, euler: V3, bounds = pieceBounds(p)) {
  const c = bounds.getCenter(new THREE.Vector3());
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(euler[0] * D2R, euler[1] * D2R, euler[2] * D2R, 'XYZ'));
  // lowest corner after rotation
  let minY = Infinity;
  for (let i = 0; i < 8; i++) {
    const v = new THREE.Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z).sub(c).applyQuaternion(q);
    minY = Math.min(minY, v.y);
  }
  const t = new THREE.Vector3(c.x, -minY, c.z);
  const m = new THREE.Matrix4().compose(t.multiplyScalar(CM), q, new THREE.Vector3(1, 1, 1));
  m.multiply(new THREE.Matrix4().makeTranslation(-c.x * CM, -c.y * CM, -c.z * CM));
  return m;
}

export const lerpPose = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export function objectLocal(o: { pos: V3; rot?: V3 }) {
  const r = o.rot ?? [0, 0, 0];
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...o.pos).multiplyScalar(CM),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] * D2R, r[1] * D2R, r[2] * D2R)),
    new THREE.Vector3(1, 1, 1),
  );
}

/** "Unboxed" flat lay: every panel lies flat on the floor to the right of the build area. World matrices (meters). */
export function flatLayout(p: Piece) {
  const b = pieceBounds({ objects: p.objects });
  const reach = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) / 2; // build area radius-ish
  const order = [...p.objects].sort((a, z) => (p.addedAt[a.id] ?? 99) - (p.addedAt[z.id] ?? 99));
  const out: Record<string, THREE.Matrix4> = {};
  const gap = 5;
  const maxRow = Math.max(110, reach * 1.6);
  let x = 0, z = 0, rowDepth = 0;
  const x0 = Math.max(b.max.x, reach * 0.55) + 30;
  order.forEach((o) => {
    const s = o.size;
    // dims sorted: thinnest goes vertical, longest along z
    const idx = [0, 1, 2].sort((i, j) => s[i] - s[j]);
    const [thin, mid, long] = idx;
    if (x > 0 && x + s[mid] > maxRow) { x = 0; z += rowDepth + gap * 2; rowDepth = 0; }
    // rotation mapping: local axis `thin` -> world Y, `mid` -> world X, `long` -> world Z
    const basis = new THREE.Matrix4();
    const cols: THREE.Vector3[] = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    cols[thin].set(0, 1, 0); cols[mid].set(1, 0, 0); cols[long].set(0, 0, 1);
    // ensure right-handed
    if (new THREE.Vector3().crossVectors(cols[0], cols[1]).dot(cols[2]) < 0) cols[mid].negate();
    basis.makeBasis(cols[0], cols[1], cols[2]);
    const q = new THREE.Quaternion().setFromRotationMatrix(basis);
    const pos = new THREE.Vector3(x0 + x + s[mid] / 2, s[thin] / 2, -reach * 0.6 + z + s[long] / 2).multiplyScalar(CM);
    out[o.id] = new THREE.Matrix4().compose(pos, q, new THREE.Vector3(1, 1, 1));
    x += s[mid] + gap;
    rowDepth = Math.max(rowDepth, s[long]);
  });
  return out;
}

/** Bounds of a set of world-space boxes */
export function boxOf(points: THREE.Vector3[]) {
  return new THREE.Box3().setFromPoints(points);
}

export function objectCorners(o: { size: V3 }, world: THREE.Matrix4) {
  const h = o.size.map((v) => (v * CM) / 2);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3(i & 1 ? h[0] : -h[0], i & 2 ? h[1] : -h[1], i & 4 ? h[2] : -h[2]).applyMatrix4(world));
  return pts;
}

/** Camera position for a box, given azimuth/elevation (deg) and the viewport */
export function frameBox(box: THREE.Box3, az: number, el: number, fovDeg: number, aspect: number, zoom = 1) {
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const r = Math.max(sphere.radius, 0.25);
  const vf = (fovDeg * D2R) / 2;
  const hf = Math.atan(Math.tan(vf) * aspect);
  const f = Math.min(vf, hf);
  const dist = (r / Math.sin(f)) * 1.05 / zoom;
  const dir = new THREE.Vector3(Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R));
  return { pos: sphere.center.clone().add(dir.multiplyScalar(dist)), target: sphere.center.clone() };
}

export const easeOutBack = (t: number) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
