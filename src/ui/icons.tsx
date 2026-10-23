import type { HwKind, V3 } from '../types';

/** Isometric box drawn from real dimensions, so each part card looks like its panel. */
export function IsoPart({ size, color, px = 64 }: { size: V3; color: string; px?: number }) {
  // lay flat like it would come out of the box: thinnest = height
  const s = [...size].sort((a, b) => a - b);
  let [h, d, w] = s;
  const k = 1 / Math.max(w, d, h * 4);
  w *= k; d *= k; h = Math.max(h * k, 0.035);
  const c = Math.cos(Math.PI / 6), sn = 0.5;
  const P = (x: number, y: number, z: number) => [(x - z) * c, (x + z) * sn - y];
  const pts = { a: P(0, h, 0), b: P(w, h, 0), c2: P(w, h, d), d: P(0, h, d), e: P(w, 0, 0), f: P(w, 0, d), g: P(0, 0, d) };
  const all = Object.values(pts);
  const minX = Math.min(...all.map((p) => p[0])), maxX = Math.max(...all.map((p) => p[0]));
  const minY = Math.min(...all.map((p) => p[1])), maxY = Math.max(...all.map((p) => p[1]));
  const vb = `${minX - 0.06} ${minY - 0.06} ${maxX - minX + 0.12} ${maxY - minY + 0.12}`;
  const poly = (...p: number[][]) => p.map((q) => q.join(',')).join(' ');
  return (
    <svg viewBox={vb} width={px} height={px} aria-hidden>
      <g stroke="#8b7e6d" strokeWidth={0.015} strokeLinejoin="round">
        <polygon points={poly(pts.a, pts.b, pts.c2, pts.d)} fill={color} />
        <polygon points={poly(pts.d, pts.c2, pts.f, pts.g)} fill={shade(color, 0.86)} />
        <polygon points={poly(pts.b, pts.e, pts.f, pts.c2)} fill={shade(color, 0.74)} />
      </g>
    </svg>
  );
}
function shade(hex: string, f: number) {
  return '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * f).toString(16).padStart(2, '0')).join('');
}

const M = '#9aa0a8', D = '#545a62', W = '#d7ad7c';
export function HwIcon({ kind, px = 44 }: { kind: HwKind; px?: number }) {
  const body = (() => {
    switch (kind) {
      case 'dowel': return <g transform="rotate(-35 32 32)"><rect x="25" y="8" width="14" height="48" rx="7" fill={W} /><path d="M27 18h10M27 26h10M27 34h10M27 42h10" stroke="#b98d5c" strokeWidth="2" /></g>;
      case 'campin': return <g transform="rotate(-35 32 32)"><circle cx="32" cy="12" r="8" fill={M} /><rect x="28" y="16" width="8" height="38" rx="2" fill={M} /><path d="M28 30h8M28 37h8M28 44h8" stroke={D} strokeWidth="2" /></g>;
      case 'cam': return <g><circle cx="32" cy="32" r="22" fill="#d9dde2" stroke={M} strokeWidth="3" /><rect x="14" y="29" width="36" height="6" rx="3" fill={D} /><path d="M32 14l6 9h-12z" fill={D} /></g>;
      case 'screw': return <g transform="rotate(-35 32 32)"><rect x="20" y="6" width="24" height="7" rx="3" fill={D} /><path d="M27 13h10l-3 42h-4z" fill={D} /><path d="M26 22l12 3M26 30l12 3M27 38l10 3" stroke="#2b2f34" strokeWidth="2" /></g>;
      case 'nail': return <g transform="rotate(-35 32 32)"><rect x="22" y="6" width="20" height="5" rx="2" fill={M} /><path d="M30 11h4v40l-2 6-2-6z" fill={M} /></g>;
      case 'bolt': return <g transform="rotate(-35 32 32)"><rect x="27" y="4" width="10" height="56" rx="3" fill={M} /><rect x="23" y="29" width="18" height="6" rx="2" fill={D} /><path d="M27 10h10M27 16h10M27 22h10M27 42h10M27 48h10M27 54h10" stroke={D} strokeWidth="1.6" /></g>;
      case 'shelfpin': return <g><rect x="14" y="26" width="22" height="12" rx="3" fill={M} /><rect x="30" y="18" width="20" height="28" rx="3" fill={M} stroke={D} strokeWidth="2" /></g>;
      case 'bracket': return <g><path d="M12 20h40v10H22v24H12z" fill="#d9dde2" stroke={M} strokeWidth="3" strokeLinejoin="round" /><circle cx="40" cy="25" r="3" fill={D} /><circle cx="17" cy="44" r="3" fill={D} /></g>;
    }
  })();
  return <svg viewBox="0 0 64 64" width={px} height={px} aria-hidden>{body}</svg>;
}

export function Logo({ px = 30 }: { px?: number }) {
  // a hex key (Allen key) bent into an L, tilted like it's mid-turn
  return (
    <svg viewBox="0 0 64 64" width={px} height={px} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#1f1b18" />
      <path d="M20 16 L20 40 Q20 48 28 48 L48 48" fill="none" stroke="#ff5a36" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      
    </svg>
  );
}

export const I = {
  next: <svg viewBox="0 0 24 24" width="30" height="30"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  back: <svg viewBox="0 0 24 24" width="24" height="24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  repeat: <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  sound: <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  mute: <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  mic: <svg viewBox="0 0 24 24" width="22" height="22"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  close: <svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>,
  check: <svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  share: <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 3v12M7 8l5-5 5 5M5 13v6h14v-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  clock: <svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.4" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  people: <svg viewBox="0 0 24 24" width="14" height="14"><circle cx="9" cy="8" r="3.5" fill="currentColor" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0z" fill="currentColor" /><circle cx="17" cy="9" r="2.8" fill="currentColor" opacity=".6" /><path d="M14.5 14.2A5.5 5.5 0 0 1 22 19.5h-5" fill="currentColor" opacity=".6" /></svg>,
  warn: <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3l10 18H2z" fill="currentColor" /><path d="M12 10v5M12 18v.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  gh: <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"/></svg>,
  wrench: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><path d="M14.5 4.5a4.5 4.5 0 0 0-4.3 5.8L4 16.5 7.5 20l6.2-6.2a4.5 4.5 0 0 0 5.8-4.3l-2.6 2.6-3-.5-.5-3 2.6-2.6c-.5-.3-1-.5-1.5-.5z" fill="currentColor"/></svg>,
  bulb: <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" fill="currentColor"/><path d="M9.5 19h5M10.5 21.5h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
};
