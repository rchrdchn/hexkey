import * as THREE from 'three';
import { forwardRef, useMemo } from 'react';
import type { HwKind } from '../types';

// All hardware is built along +Y. y=0 is the panel surface, +Y points out of the hole (the side it's pushed in from).
const metal = new THREE.MeshStandardMaterial({ color: '#b9bec6', metalness: 0.85, roughness: 0.3 });
const dark = new THREE.MeshStandardMaterial({ color: '#5b6068', metalness: 0.7, roughness: 0.35 });
const wood = new THREE.MeshStandardMaterial({ color: '#d7ad7c', roughness: 0.8 });
const zinc = new THREE.MeshStandardMaterial({ color: '#d9dde2', metalness: 0.6, roughness: 0.35 });
const cyl = (r: number, h: number, seg = 16) => new THREE.CylinderGeometry(r, r, h, seg);
const G = {
  dowel: cyl(0.4, 3, 12),
  pinShaft: cyl(0.3, 2.6, 10),
  pinHead: new THREE.SphereGeometry(0.5, 14, 10),
  camDisc: cyl(0.8, 1.2, 24),
  camSlot: new THREE.BoxGeometry(1.25, 0.2, 0.22),
  camArrow: new THREE.ConeGeometry(0.22, 0.45, 3),
  screwHead: cyl(0.5, 0.22, 16),
  screwShaft: new THREE.CylinderGeometry(0.22, 0.08, 3.5, 8),
  nailHead: cyl(0.3, 0.08, 10),
  nailShaft: cyl(0.08, 2, 6),
  bolt: cyl(0.4, 7, 12),
  boltRing: cyl(0.48, 0.25, 12),
  pinPlate: new THREE.BoxGeometry(1.1, 0.2, 1.4),
  pinPeg: cyl(0.25, 1, 8),
  plateA: new THREE.BoxGeometry(5, 0.25, 3),
  plateB: new THREE.BoxGeometry(5, 3, 0.25),
};

export function HardwareModel({ kind }: { kind: HwKind }) {
  switch (kind) {
    case 'dowel': return <mesh geometry={G.dowel} material={wood} position={[0, 0.6, 0]} />;
    case 'campin': return (<>
      <mesh geometry={G.pinShaft} material={metal} position={[0, 0.3, 0]} />
      <mesh geometry={G.pinHead} material={metal} position={[0, 1.8, 0]} />
    </>);
    case 'cam': return (<>
      <mesh geometry={G.camDisc} material={zinc} position={[0, -0.45, 0]} />
      <mesh geometry={G.camSlot} material={dark} position={[0, 0.2, 0]} />
      <mesh geometry={G.camArrow} material={dark} position={[0, 0.2, 0.55]} rotation={[Math.PI / 2, 0, 0]} />
    </>);
    case 'screw': return (<>
      <mesh geometry={G.screwHead} material={dark} position={[0, 0.11, 0]} />
      <mesh geometry={G.screwShaft} material={dark} position={[0, -1.75, 0]} />
    </>);
    case 'nail': return (<>
      <mesh geometry={G.nailHead} material={metal} position={[0, 0.04, 0]} />
      <mesh geometry={G.nailShaft} material={metal} position={[0, -1, 0]} />
    </>);
    case 'bolt': return (<>
      <mesh geometry={G.bolt} material={metal} position={[0, 0, 0]} />
      <mesh geometry={G.boltRing} material={dark} position={[0, 0, 0]} />
    </>);
    case 'shelfpin': return (<>
      <mesh geometry={G.pinPeg} material={metal} position={[0, -0.3, 0]} />
      <mesh geometry={G.pinPlate} material={metal} position={[0, 0.3, 0]} />
    </>);
    case 'bracket': return (<>
      <mesh geometry={G.plateA} material={zinc} position={[0, 0.12, 1.5]} />
      <mesh geometry={G.plateB} material={zinc} position={[0, 1.5, 0]} />
    </>);
  }
}

export const HardwareItem = forwardRef<THREE.Group, { kind: HwKind }>(({ kind }, ref) => (
  <group ref={ref} matrixAutoUpdate={false} visible={false}>
    <HardwareModel kind={kind} />
  </group>
));

let ringTex: THREE.Texture | null = null;
export function useRingTexture() {
  return useMemo(() => {
    if (ringTex) return ringTex;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d')!;
    x.strokeStyle = '#ff5a36';
    x.lineWidth = 10;
    x.beginPath(); x.arc(64, 64, 50, 0, Math.PI * 2); x.stroke();
    x.fillStyle = 'rgba(255,90,54,0.18)';
    x.beginPath(); x.arc(64, 64, 45, 0, Math.PI * 2); x.fill();
    ringTex = new THREE.CanvasTexture(c);
    ringTex.colorSpace = THREE.SRGBColorSpace;
    return ringTex;
  }, []);
}
