// Playful, non-IKEA palette (no blue + yellow). Part colors match the check-off cards.
export const ACCENT = '#ff5a36';
const TINTS = ['#ffffff', '#ffd9c4', '#cfeadb', '#dcd8f5', '#f9d3dc', '#d8ecef', '#efe3c8'];
export function partColor(i: number, base: string) {
  if (i <= 0) return base;
  const a = hex(base), b = hex(TINTS[i % TINTS.length]);
  // mix 70% tint into the base so they read as "the same furniture, different part"
  return '#' + a.map((v, k) => Math.round(v * 0.3 + b[k] * 0.7).toString(16).padStart(2, '0')).join('');
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
