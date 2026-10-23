import type { Piece } from './types';

export const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
};

/** 1080x1350 share card: 3D snapshot + big stats. */
export async function makeCard(shot: string, p: Piece, ms: number | null): Promise<Blob> {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f6f1ea'; x.fillRect(0, 0, W, H);
  const img = new Image();
  img.src = shot;
  await img.decode().catch(() => {});
  if (img.width) {
    // cover-fit the snapshot into the top area
    const bw = W, bh = 900, r = Math.max(bw / img.width, bh / img.height);
    const sw = bw / r, sh = bh / r;
    x.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 80, bw, bh);
  }
  const font = (w: number, s: number) => `${w} ${s}px ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", sans-serif`;
  // logo pill
  x.fillStyle = '#1f1b18'; round(x, 60, 60, 300, 84, 42); x.fill();
  x.strokeStyle = '#ff5a36'; x.lineWidth = 12; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(104, 82); x.lineTo(104, 112); x.quadraticCurveTo(104, 122, 114, 122); x.lineTo(136, 122); x.stroke();
  x.fillStyle = '#f6f1ea'; x.font = font(800, 42); x.fillText('hexkey', 160, 116);
  // stats
  x.fillStyle = '#1f1b18';
  x.font = font(900, 120); x.fillText(`${p.name} ✓`, 60, 1110);
  x.font = font(600, 46); x.fillStyle = '#6d6257';
  const bits = [ms != null ? `built in ${fmtTime(ms)}` : 'built', `${p.steps.length} steps`, `${p.objects.length + p.totalHw} pieces`];
  x.fillText(bits.join('  ·  '), 60, 1190);
  x.fillStyle = '#ff5a36'; x.font = font(800, 40);
  x.fillText('Voice-guided flat-pack builds', 60, 1280);
  return new Promise((res) => c.toBlob((b) => res(b!), 'image/png'));
}
function round(x: CanvasRenderingContext2D, X: number, Y: number, w: number, h: number, r: number) {
  x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath();
}

export async function shareCard(blob: Blob, p: Piece) {
  const file = new File([blob], `hexkey-${p.slug}.png`, { type: 'image/png' });
  const nav = navigator as any;
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], title: `I built ${p.name}`, text: `Built my ${p.name} with Hexkey, step by step, out loud.` }); return 'shared'; } catch { return 'cancel'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  return 'downloaded';
}
