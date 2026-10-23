export type V3 = [number, number, number];

export interface PartDef { id: string; label: string; plural?: string }
export type HwKind = 'dowel' | 'campin' | 'cam' | 'screw' | 'nail' | 'bolt' | 'shelfpin' | 'bracket';
export interface HwDef { id: string; label: string; kind: HwKind; plural?: string }
export interface ObjectDef { id: string; part: string; size: V3; pos: V3; rot?: V3 }
export interface HwUse { id: string; axis: string; at?: V3[]; line?: [V3, V3]; n?: number; spin?: boolean; count?: number }
export interface StepDef {
  caption: string;
  say: string;
  add?: string[];
  from?: V3;
  twist?: boolean;
  pose?: V3;
  hardware?: HwUse[];
  view?: { az: number; el: number; zoom?: number; tight?: boolean };
  safety?: string;
}
export interface PieceDef {
  slug: string; name: string; title: string; worksWith: string; productUrl: string;
  size: V3; minutes: number; people: number; level: number; color: string;
  parts: PartDef[]; hardware: HwDef[]; objects: ObjectDef[]; steps: StepDef[]; done: string;
}

/** Hardware instance after expanding `at` / `line` */
export interface HwInst { key: string; id: string; kind: HwKind; pos: V3; axis: V3; spin: boolean; step: number; order: number }

export interface Piece extends PieceDef {
  addedAt: Record<string, number>; // object id -> step index
  hw: HwInst[];
  poses: V3[]; // effective pose per step (carry-forward)
  partCount: Record<string, number>;
  hwCount: Record<string, number>;
  totalHw: number;
}
