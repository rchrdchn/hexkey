import data from '../data/tools.json';
import type { Piece } from './types';
import { amazonSearch } from './config/affiliates';

interface Why { if?: { category?: string[]; archetype?: string[]; hardware?: string[]; anchors?: boolean }; text: string }
export interface Tool { id: string; name: string; short: string; note: string; query: string; icon: string; url: string; must?: boolean; why: Why[] }
/** One row in the Tools window: the tool, why this piece needs it, and whether it's a must-have. */
export interface ToolRow { tool: Tool; why: string; must: boolean }
interface Rules {
  default: string[]; category: Record<string, string[]>; archetype: Record<string, string[]>; combo: Record<string, string[]>; hardware: Record<string, string[]>;
  tall: { minHeightCm: number; tools: string[] }; slugs: Record<string, { add?: string[]; drop?: string[] }>;
}
const rules = data.rules as Rules;
export const TOOLS: Tool[] = (data.tools as Omit<Tool, 'url'>[]).map((t) => ({ ...t, url: amazonSearch(t.query) }));
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

type ForPiece = Pick<Piece, 'slug' | 'category' | 'archetype' | 'size' | 'hardware'>;
/** The first `why` whose `if` matches this piece. Same matching as scripts/tools-check.mjs. */
export function whyFor(t: Tool, p: ForPiece, anchored: boolean): string {
  const kinds = new Set<string>(p.hardware.map((h) => h.kind));
  const hit = t.why.find(({ if: c }) => !c || (
    (!c.category || c.category.includes(p.category ?? '')) &&
    (!c.archetype || c.archetype.includes(p.archetype ?? '')) &&
    (!c.hardware || c.hardware.every((k) => kinds.has(k))) &&
    (c.anchors === undefined || c.anchors === anchored)));
  return hit?.text ?? t.note;
}

/** Most useful first after the must-haves. */
const EXTRA = ['drill', 'mallet', 'flathead', 'stubby', 'level', 'tape', 'pads', 'glue', 'knife'];
/** Rows for the Tools window: must-haves (hex key, Phillips #2, and the wall-anchor kit when it can tip), then the rest by usefulness. */
export function toolRows(p: ForPiece): ToolRow[] {
  const tools = toolsFor(p);
  const anchored = needsAnchor(tools);
  const rank = (t: Tool) => (t.must ? 0 : t.id === 'anchors' ? 1 : 2 + (EXTRA.indexOf(t.id) + 1 || EXTRA.length + 1));
  return [...tools].sort((a, b) => rank(a) - rank(b) || (ORDER.get(a.id)! - ORDER.get(b.id)!))
    .map((t) => ({ tool: t, why: whyFor(t, p, anchored), must: !!t.must || t.id === 'anchors' }));
}
