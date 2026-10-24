import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, ContactShadows, Edges, Environment, Lightformer } from '@react-three/drei';
import type { Piece, V3, ObjectDef } from '../types';
import { CM, poseMatrix, objectLocal, flatLayout, objectCorners, frameBox, lerpPose, easeInOut, easeOutBack, clamp01, pieceBounds, D2R } from './math';
import { HardwareItem, useRingTexture } from './Hardware';
import { partColor } from '../palette';
import { sfx } from '../sfx';

export type Mode = 'pick' | 'parts' | 'build' | 'done';
const HWS = 1.8; // hardware is drawn 1.8x so it reads on a phone
const POSE_T = 1.5;
const FLY_T = 1.15;

interface Props { piece: Piece; mode: Mode; step: number; highlight?: string | null; onSnap?: (fn: () => string) => void; reduced?: boolean; still?: boolean; /** Share cards only: push finished parts apart from the center by this fraction (exploded view), and frame looser (zoomMul). */ explode?: number; zoomMul?: number; /** no background or floor (alpha PNG for share cards) */ clear?: boolean; inset: { top: number; bottom: number; left: number } }

const FINAL: V3 = [0, 0, 0];
// in the finished piece only show hardware you'd actually see (screw shafts and dowels would poke through the 1.8x models)
const SHOWN_DONE = new Set(['cam', 'knob', 'bracket', 'shelfpin', 'nail']);
const ghostMat = new THREE.MeshBasicMaterial({ color: '#ff5a36', transparent: true, opacity: 0.15, depthWrite: false });

/** One object: a single box/cylinder, or a handful of sub-shapes (pre-assembled frames, slat rolls). */
function Body({ o, mat, edges }: { o: ObjectDef; mat: THREE.Material; edges: string | null }) {
  const list = o.boxes ?? [{ s: o.size, p: [0, 0, 0] as V3, shape: o.shape }];
  const many = list.length > 6;
  return (<>
    {list.map((b, i) => (
      <mesh key={i} material={mat} position={[b.p[0] * CM, b.p[1] * CM, b.p[2] * CM]} rotation={'r' in b && b.r ? [b.r[0] * D2R, b.r[1] * D2R, b.r[2] * D2R] : [0, 0, 0]}>
        {b.shape === 'cyl'
          ? <cylinderGeometry args={[(Math.min(b.s[0], b.s[2]) * CM) / 2, (Math.min(b.s[0], b.s[2]) * CM) / 2, b.s[1] * CM, many ? 8 : 18]} />
          : <boxGeometry args={[b.s[0] * CM, b.s[1] * CM, b.s[2] * CM]} />}
        {edges && !(many && b.shape === 'cyl') && <Edges threshold={15} color={edges} />}
      </mesh>
    ))}
  </>);
}

export function Scene({ piece, mode, step, highlight, onSnap, reduced, still, explode = 0, zoomMul = 1, clear, inset }: Props) {
  const { camera, size, invalidate, gl, scene, clock } = useThree();
  const controls = useRef<CameraControls>(null);
  const meshes = useRef<Record<string, THREE.Group | null>>({});
  const ghosts = useRef<Record<string, THREE.Group | null>>({});
  const envRef = useRef<THREE.Group>(null);
  const hwRefs = useRef<Record<string, THREE.Group | null>>({});
  const ringRefs = useRef<Record<string, THREE.Sprite | null>>({});
  const ringTex = useRingTexture();
  const bounds = useMemo(() => pieceBounds(piece), [piece]);
  const flat = useMemo(() => flatLayout(piece), [piece]);
  const locals = useMemo(() => Object.fromEntries(piece.objects.map((o) => [o.id, objectLocal(o)])), [piece]);
  const finalPose = piece.poses[piece.poses.length - 1] ?? FINAL;
  // exploded view (share cards): each object's offset from the piece's center, in world units, for the finished pose
  const spread = useMemo(() => {
    if (!explode) return null;
    const M = poseMatrix(piece, finalPose, bounds);
    const cs = Object.fromEntries(piece.objects.map((o) => [o.id, new THREE.Box3().setFromPoints(objectCorners(o, M.clone().multiply(locals[o.id]))).getCenter(new THREE.Vector3())]));
    const all = new THREE.Box3(); Object.values(cs).forEach((c) => all.expandByPoint(c));
    const mid = all.getCenter(new THREE.Vector3());
    return Object.fromEntries(Object.entries(cs).map(([id, c]) => [id, new THREE.Matrix4().makeTranslation(c.clone().sub(mid).multiplyScalar(explode))]));
  }, [piece, explode, bounds, locals, finalPose]);
  const mats = useMemo(() => {
    const ids = piece.parts.map((p) => p.id);
    return Object.fromEntries(piece.objects.map((o) => [o.id, new THREE.MeshStandardMaterial({ color: partColor(ids.indexOf(o.part), piece.color), roughness: 0.75, emissive: '#ff5a36', emissiveIntensity: 0 })]));
  }, [piece]);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  // animation clock per (piece, mode, step)
  const anim = useRef({ t0: 0, fromPose: FINAL as V3, pose: FINAL as V3, key: '', landed: new Set<string>(), userAt: -1e9 });
  const targetPose: V3 = mode === 'build' ? piece.poses[step] : finalPose;

  const key = `${piece.slug}|${mode}|${step}`;
  if (anim.current.key !== key) {
    const a = anim.current;
    const sameRun = a.key.startsWith(`${piece.slug}|build`) && mode === 'build';
    a.fromPose = sameRun ? a.pose : targetPose;
    a.key = key;
    a.t0 = -1; // set on first frame
    a.landed = new Set();
  }

  useEffect(() => { onSnap?.(() => { gl.render(scene, camera); return gl.domElement.toDataURL('image/png'); }); }, [gl, scene, camera, onSnap]);

  // ---------- camera ----------
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const M = poseMatrix(piece, targetPose, bounds);
    const pts: THREE.Vector3[] = [];
    let az = 35, el = 22, zoom = 1;
    if (mode === 'parts') {
      piece.objects.forEach((o) => pts.push(...objectCorners(o, flat[o.id])));
      az = 0; el = 62; zoom = 1.05;
    } else if (mode === 'build') {
      const s = piece.steps[step];
      (s.add ?? []).forEach((id) => pts.push(...objectCorners(piece.objects.find((o) => o.id === id)!, M.clone().multiply(locals[id]))));
      piece.hw.filter((h) => h.step === step).forEach((h) => pts.push(new THREE.Vector3(...h.pos).multiplyScalar(CM).applyMatrix4(M)));
      // frame the new stuff plus what's already built, unless the step asks for a close-up
      if (pts.length < 3 || !s.view?.tight) piece.objects.filter((o) => (piece.addedAt[o.id] ?? 99) <= step).forEach((o) => pts.push(...objectCorners(o, M.clone().multiply(locals[o.id]))));
      if (s.view) { az = s.view.az; el = s.view.el; zoom = s.view.zoom ?? 1; }
    } else {
      piece.objects.forEach((o) => pts.push(...objectCorners(o, (spread ? spread[o.id].clone() : new THREE.Matrix4()).multiply(M).multiply(locals[o.id]))));
      zoom = zoomMul * (still ? (piece.size[1] > 1.6 * Math.max(piece.size[0], piece.size[2]) ? 0.95 : 1.3) : mode === 'done' ? 0.95 : 1.12);
      el = 18;
    }
    const box = new THREE.Box3().setFromPoints(pts);
    if (mode === 'build') box.expandByScalar(0.06);
    const cam = camera as THREE.PerspectiveCamera;
    // Only part of the screen is free (sheet at the bottom on phones, panel on the left on desktop).
    // Shift the projection so the subject is centered in the free area, and frame for that area's size.
    const w = size.width - inset.left, h = Math.max(120, size.height - inset.top - inset.bottom);
    cam.setViewOffset(size.width, size.height, -inset.left / 2, (inset.bottom - inset.top) / 2, size.width, size.height);
    const vfov = 2 * Math.atan(Math.tan((cam.fov * Math.PI) / 360) * (h / size.height)) * (180 / Math.PI);
    const { pos, target } = frameBox(box, az, el, vfov, w / h, zoom);
    c.smoothTime = reduced ? 0.01 : 0.55;
    c.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, true);
    invalidate();
  }, [key, size.width, size.height, inset.top, inset.bottom, inset.left]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- per-frame ----------
  useFrame((state, dt) => {
    const a = anim.current;
    const now = state.clock.elapsedTime;
    if (a.t0 < 0) a.t0 = now;
    const t = reduced ? 99 : now - a.t0;
    let busy = false;

    // turntable on pick/done (pauses while the user is dragging)
    if ((mode === 'pick' || mode === 'done') && !still && controls.current && now - a.userAt > 2.5) {
      controls.current.rotate(dt * 0.35, 0, false);
      busy = true;
    }

    const pt = clamp01(t / POSE_T);
    a.pose = lerpPose(a.fromPose, targetPose, easeInOut(pt));
    if (pt < 1) busy = true;
    const M = poseMatrix(piece, a.pose, bounds);
    const Mt = poseMatrix(piece, targetPose, bounds);
    const poseDelay = a.fromPose.join() !== targetPose.join() ? POSE_T * 0.6 : 0;

    const adding = mode === 'build' ? piece.steps[step].add ?? [] : [];
    const from = mode === 'build' ? piece.steps[step].from ?? [0, 30, 0] : [0, 30, 0];
    let lastLand = poseDelay + 0.3;
    const pulse = 0.5 + 0.5 * Math.sin(now * 5);

    piece.objects.forEach((o) => {
      const m = meshes.current[o.id];
      if (!m) return;
      const at = piece.addedAt[o.id] ?? 99;
      const mat = mats[o.id];
      let em = 0;
      if (mode === 'pick' || mode === 'done') { if (spread) m.matrix.copy(spread[o.id]).multiply(M).multiply(locals[o.id]); else m.matrix.copy(M).multiply(locals[o.id]); }
      else if (mode === 'parts') {
        m.matrix.copy(flat[o.id]);
        if (highlight && o.part === highlight) { em = 0.25 + 0.35 * pulse; busy = true; }
      } else if (at < step) m.matrix.copy(M).multiply(locals[o.id]);
      else if (at > step) m.matrix.copy(flat[o.id]);
      else {
        const k = adding.indexOf(o.id);
        const delay = poseDelay + 0.35 + k * Math.min(0.28, 2.4 / Math.max(1, adding.length));
        const ft = clamp01((t - delay) / FLY_T);
        lastLand = Math.max(lastLand, delay + FLY_T);
        const target = Mt.clone().multiply(locals[o.id]);
        const tp = new THREE.Vector3(), tq = new THREE.Quaternion(), ts = new THREE.Vector3();
        target.decompose(tp, tq, ts);
        const fp = new THREE.Vector3(), fq = new THREE.Quaternion();
        flat[o.id].decompose(fp, fq, ts);
        const fromW = new THREE.Vector3(...from).multiplyScalar(CM).transformDirection(Mt).multiplyScalar(new THREE.Vector3(...from).length() * CM);
        const p1 = fp.clone().add(new THREE.Vector3(0, 0.45 + bounds.getSize(new THREE.Vector3()).y * CM * 0.25, 0));
        const p2 = tp.clone().add(fromW.clone().multiplyScalar(1.6));
        const e = ft;
        // cubic bezier flat -> up -> approach -> target, eased
        const u = easeInOut(Math.min(1, e / 0.85));
        const b = (p0: number, q1: number, q2: number, p3: number) => (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * q1 + 3 * (1 - u) * u * u * q2 + u ** 3 * p3;
        const pos = new THREE.Vector3(b(fp.x, p1.x, p2.x, tp.x), b(fp.y, p1.y, p2.y, tp.y), b(fp.z, p1.z, p2.z, tp.z));
        // final settle along the insertion axis with a tiny overshoot
        if (e > 0.85) pos.copy(tp).add(fromW.clone().multiplyScalar(0.12 * (1 - easeOutBack((e - 0.85) / 0.15))));
        const q = fq.clone().slerp(tq, easeInOut(clamp01(e / 0.7)));
        if (piece.steps[step].twist) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (1 - easeInOut(e)) * Math.PI * 4));
        m.matrix.compose(pos, q, new THREE.Vector3(1, 1, 1));
        if (ft < 1) busy = true;
        if (ft >= 1 && !a.landed.has(o.id)) { a.landed.add(o.id); if (!reduced) sfx.thunk(); }
        const glow = clamp01(1 - (t - delay - FLY_T) / 1.6);
        em = ft < 1 ? 0.35 : 0.35 * glow;
        if (glow > 0) busy = true;
        const g = ghosts.current[o.id];
        if (g) {
          g.visible = ft < 1;
          g.matrix.copy(target);
          ghostMat.opacity = 0.1 + 0.12 * pulse;
        }
      }
      if (!(mode === 'build' && at === step)) { const g = ghosts.current[o.id]; if (g) g.visible = false; }
      mat.emissiveIntensity = em;
      m.matrixWorldNeedsUpdate = true;
    });

    if (envRef.current) { envRef.current.visible = mode !== 'parts' && !spread; envRef.current.matrix.copy(M); envRef.current.matrixWorldNeedsUpdate = true; }

    // hardware
    const nowCount = mode === 'build' ? piece.hw.filter((x) => x.step === step).length : 0;
    const up = new THREE.Vector3(0, 1, 0);
    piece.hw.forEach((h) => {
      const g = hwRefs.current[h.key];
      const r = ringRefs.current[h.key];
      if (!g) return;
      const internal = h.kind === 'dowel' || h.kind === 'campin' || h.kind === 'bolt' || h.kind === 'hinge';
      const show = mode === 'pick' || mode === 'done' ? SHOWN_DONE.has(h.kind) && !spread : mode === 'build' && (h.step === step || (h.step < step && (!internal || h.step === step - 1)));
      g.visible = show;
      if (r) r.visible = false;
      if (!show) return;
      const ax = new THREE.Vector3(...h.axis);
      const q = new THREE.Quaternion().setFromUnitVectors(up, ax);
      let off = 0, sc = 1, spin = 0;
      if (mode === 'build' && h.step === step) {
        const d0 = lastLand + Math.min(h.order * 0.07, 1.4);
        const ht = clamp01((t - d0) / 0.5);
        off = (1 - easeOutBack(ht)) * 6;
        sc = Math.max(0.001, Math.min(1, ht * 2.5));
        if (h.spin) { const st = clamp01((t - d0 - 0.6) / 0.9); spin = easeInOut(st) * Math.PI * (h.kind === 'cam' ? 1 : 4); if (st < 1) busy = true; if (st >= 1 && h.kind === 'cam' && !a.landed.has(h.key)) { a.landed.add(h.key); if (!reduced) sfx.click(); } }
        if (ht < 1) busy = true;
        if (r) {
          r.visible = true;
          const world = new THREE.Vector3(...h.pos).addScaledVector(ax, 3).multiplyScalar(CM).applyMatrix4(M);
          r.position.copy(world);
          const s = (nowCount > 8 ? 0.022 : 0.032) + 0.008 * pulse;
          r.scale.set(s, s, 1);
          busy = true;
        }
      }
      q.multiply(new THREE.Quaternion().setFromAxisAngle(up, spin));
      const local = new THREE.Matrix4().compose(new THREE.Vector3(...h.pos).addScaledVector(ax, off).multiplyScalar(CM), q, new THREE.Vector3(1, 1, 1).multiplyScalar(CM * HWS * sc));
      g.matrix.copy(M).multiply(local);
      g.matrixWorldNeedsUpdate = true;
    });

    if (busy) invalidate();
  });

  return (
    <>
      {!clear && <color attach="background" args={['#f6f1ea']} />}
      <hemisphereLight args={['#ffffff', '#d9cbb8', 1.1]} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} />
      <directionalLight position={[-4, 3, -2]} intensity={0.5} />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
        <Lightformer intensity={1} position={[5, 1, 3]} scale={[4, 3, 1]} />
        <Lightformer intensity={0.6} color="#ffd9c7" position={[-5, 1, -2]} scale={[4, 3, 1]} />
      </Environment>
      {!clear && (
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.001, 0]}>
          <circleGeometry args={[30, 64]} />
          <meshBasicMaterial color="#efe8de" />
        </mesh>
      )}
      <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={14} blur={2.4} far={2.5} resolution={512} color="#5a4636" />
      {piece.env && (
        <group ref={envRef} matrixAutoUpdate={false}>
          {piece.env.map((e) => (
            <mesh key={e.id} position={[e.pos[0] * CM, e.pos[1] * CM, e.pos[2] * CM]}>
              <boxGeometry args={[e.size[0] * CM, e.size[1] * CM, e.size[2] * CM]} />
              <meshStandardMaterial color={e.color ?? '#ece6dc'} roughness={0.95} />
            </mesh>
          ))}
        </group>
      )}
      {piece.objects.map((o) => (
        <group key={o.id}>
          <group ref={(m) => { meshes.current[o.id] = m; }} matrixAutoUpdate={false}>
            <Body o={o} mat={mats[o.id]} edges="#a99c8a" />
          </group>
          <group ref={(m) => { ghosts.current[o.id] = m; }} matrixAutoUpdate={false} visible={false}>
            <Body o={o} mat={ghostMat} edges={o.boxes ? null : '#ff5a36'} />
          </group>
        </group>
      ))}
      {piece.hw.map((h) => (
        <group key={h.key}>
          <HardwareItem kind={h.kind} ref={(g) => { hwRefs.current[h.key] = g; }} />
          <sprite ref={(s) => { ringRefs.current[h.key] = s; }} visible={false} renderOrder={10}>
            <spriteMaterial map={ringTex} sizeAttenuation={false} depthTest={false} transparent />
          </sprite>
        </group>
      ))}
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={0.3}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.49}
        onStart={() => { anim.current.userAt = 1e9; }}
        onEnd={() => { anim.current.userAt = clock.elapsedTime; invalidate(); }}
      />
    </>
  );
}
