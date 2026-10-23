import data from '../data/tools.json';
import type { Piece } from './types';
import { amazonSearch } from './config/affiliates';

export interface Tool { id: string; name: string; short: string; note: string; query: string; icon: string; url: string }
interface Rules {
  default: string[]; category: Record<string, string[]>; archetype: Record<string, string[]>; combo: Record<string, string[]>; hardware: Record<string, string[]>;
  tall: { minHeightCm: number; tools: string[] }; slugs: Record<string, { add?: string[]; drop?: string[] }>;
}
const rules = data.rules as Rules;
export const TOOLS: Tool[] = data.tools.map((t) => ({ ...t, url: amazonSearch(t.query) }));
const ORDER = new Map(TOOLS.map((t, i) => [t.id, i]));

/** Tools a build needs, in catalog order. Same rules as scripts/tools-check.mjs. */
export function toolsFor(p: Pick<Piece, 'slug' | 'category' | 'archetype' | 'size' | 'hardware'>): Tool[] {
  const ids = new Set(rules.default);
  const add = (l?: string[]) => l?.forEach((id) => ids.add(id));
  if (p.category) add(rules.category[p.category]);
  if (p.archetype) add(rules.archetype[p.archetype]);
  add(rules.combo[`${p.category}+${p.archetype}`]);
  p.hardware.forEach((h) => add(rules.hardware[h.kind]));
  if (p.size[1] >= rules.tall.minHeightCm && p.archetype !== 'platform-bed' && p.archetype !== 'bed' && p.category !== 'desks') add(rules.tall.tools);
  const o = rules.slugs[p.slug];
  add(o?.add); o?.drop?.forEach((id) => ids.delete(id));
  return [...ids].filter((id) => ORDER.has(id)).sort((a, b) => ORDER.get(a)! - ORDER.get(b)!).map((id) => TOOLS[ORDER.get(id)!]);
}

/** True when the piece should be strapped to the wall (the finish screen says so first). */
export const needsAnchor = (tools: Tool[]) => tools.some((t) => t.id === 'anchors');
