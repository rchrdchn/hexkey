// Renders one finished piece, still, for catalog thumbnails: /?thumb=<slug>. Used by scripts/thumbs.mjs only.
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Piece } from './types';
import { loadPiece } from './data';
import { Scene } from './scene/Scene';

export default function Thumb({ slug }: { slug: string }) {
  const [p, setP] = useState<Piece | null>(null);
  useEffect(() => { loadPiece(slug).then(setP).catch((e) => { document.title = `error ${e}`; }); }, [slug]);
  useEffect(() => { if (p) { const t = setTimeout(() => document.body.setAttribute('data-ready', '1'), 1800); return () => clearTimeout(t); } }, [p]);
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas frameloop="demand" dpr={1} camera={{ fov: 30, position: [2, 1.4, 2.4], near: 0.02, far: 60 }} flat gl={{ preserveDrawingBuffer: true, antialias: true }}>
        {p && <Scene piece={p} mode="done" step={0} reduced still inset={{ top: 0, bottom: 0, left: 0 }} />}
      </Canvas>
    </div>
  );
}
