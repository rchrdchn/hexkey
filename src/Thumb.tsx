// Renders one piece, still: /?thumb=<slug>[&view=parts][&explode=0.5][&zoom=0.8][&bg=none][&dpr=2]. Used by scripts/thumbs.mjs (finished piece)
// and scripts/share-cards.mjs (finished piece + parts laid out, at 2x, for the 1200x630 link-preview cards).
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { Piece } from './types';
import { loadPiece } from './data';
import { Scene } from './scene/Scene';

const q = new URLSearchParams(location.search);
const view = q.get('view') === 'parts' ? 'parts' : 'done';
const explode = Math.min(1.5, Math.max(0, Number(q.get('explode')) || 0));
const zoomMul = Math.min(1.5, Math.max(0.4, Number(q.get('zoom')) || 1));
const clear = q.get('bg') === 'none';
if (clear) document.head.insertAdjacentHTML('beforeend', '<style>html, body, #root { background: transparent !important; }</style>');
const dpr = Math.min(3, Math.max(1, Number(q.get('dpr')) || 1));

export default function Thumb({ slug }: { slug: string }) {
  const [p, setP] = useState<Piece | null>(null);
  useEffect(() => { loadPiece(slug).then(setP).catch((e) => { document.title = `error ${e}`; }); }, [slug]);
  useEffect(() => { if (p) { const t = setTimeout(() => document.body.setAttribute('data-ready', '1'), 1800); return () => clearTimeout(t); } }, [p]);
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas frameloop="demand" dpr={dpr} camera={{ fov: 30, position: [2, 1.4, 2.4], near: 0.02, far: 60 }} flat gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}>
        {p && <Scene piece={p} mode={view} step={0} reduced still explode={explode} zoomMul={zoomMul} clear={clear} inset={{ top: 0, bottom: 0, left: 0 }} />}
      </Canvas>
    </div>
  );
}
