// Archetypes built on the carcass: chest (drawers/open/doors), bookcase, cubes.
import { r, say, Say, pick, spread } from './lib.mjs';
import { carcassGeo, carcassBuild, anchorStep, shelfLevels } from './carcass.mjs';

/** Rows top to bottom: [{ type: 'drawer'|'open'|'door', cols: 1, h: 1 }] */
function layoutRows(g, rows) {
  const { y0, y1, t, IW } = g;
  const sep = rows.slice(0, -1).map((a, i) => { const z = rows[i + 1]; return a.type !== 'drawer' || z.type !== 'drawer' || (a.cols ?? 1) !== (z.cols ?? 1); });
  const nSep = sep.filter(Boolean).length;
  const avail = y1 - y0 - nSep * t;
  const sumW = rows.reduce((s, x) => s + (x.h ?? 1), 0);
  let cur = y1;
  const out = [], fixed = [];
  rows.forEach((row, i) => {
    const h = (avail * (row.h ?? 1)) / sumW;
    out.push({ ...row, cols: row.cols ?? 1, ya: cur - h, yb: cur, block: fixed.length });
    cur -= h;
    if (sep[i]) { fixed.push(r(cur - t / 2)); cur -= t; }
  });
  // dividers: one per column gap, spanning each block of rows that share cols
  const dividers = [];
  const blocks = new Map();
  out.forEach((row) => { if (row.cols > 1) { const k = row.block; const bl = blocks.get(k) ?? { cols: row.cols, ya: row.ya, yb: row.yb }; bl.ya = Math.min(bl.ya, row.ya); bl.yb = Math.max(bl.yb, row.yb); blocks.set(k, bl); } });
  for (const bl of blocks.values()) {
    const cw = (IW - (bl.cols - 1) * t) / bl.cols;
    for (let k = 1; k < bl.cols; k++) dividers.push({ x: r(-IW / 2 + k * cw + (k - 0.5) * t), y0: r(bl.ya), y1: r(bl.yb) });
  }
  out.forEach((row) => {
    const cw = (IW - (row.cols - 1) * t) / row.cols;
    row.slots = Array.from({ length: row.cols }, (_, j) => ({ xa: -IW / 2 + j * (cw + t), xb: -IW / 2 + j * (cw + t) + cw }));
  });
  return { rows: out, fixed, dividers };
}

/** Drawers: runners, the first drawer in three steps, then "the rest", then knobs. */
function drawers(b, g, slots, opt) {
  const slug = b.spec.slug;
  const { D } = g;
  const gap = 0.3, ft = 1.6, st = 1.2, dd = Math.min(D - 6, opt.depth ?? D - 6);
  const runners = opt.runners !== false;
  const rw = runners ? 1.3 : 0.2; // runner gap each side
  b.part('dside', 'Drawer side'); b.part('dback', 'Drawer back'); b.part('dbottom', 'Drawer bottom');
  const fronts = [...new Set(slots.map((s) => r(s.yb - s.ya)))].sort((a, z) => z - a);
  const fpart = (h) => {
    if (fronts.length === 1) return b.part('front', 'Drawer front');
    const i = fronts.indexOf(r(h));
    return i === 0 ? b.part('front', 'Drawer front') : b.part(`front${i + 1}`, i === fronts.length - 1 ? 'Small drawer front' : 'Medium drawer front');
  };
  const D2 = D / 2;
  const ids = [];
  slots.forEach((s, n) => {
    const k = n + 1;
    const fw = s.xb - s.xa + (opt.overlay ? g.t * 0.9 : -gap), fh = s.yb - s.ya - gap;
    const cx = (s.xa + s.xb) / 2, cy = (s.ya + s.yb) / 2;
    const bw = s.xb - s.xa - 2 * rw, bh = Math.max(6, fh - 4);
    const by = s.ya + 1 + bh / 2;
    // drawer 1 is built (and left) pulled half open, so its sides, bottom and back stay visible
    const pull = n === 0 && slots.length > 1 && opt.pullFirst !== false ? r(dd * 0.55) : 0;
    const zf = D2 - ft / 2 + (opt.overlay ? ft : 0) + pull;
    const zfront = zf - ft / 2; // back face of the front
    const zs = zfront - dd / 2;
    b.obj(`d${k}f`, fpart(s.yb - s.ya), [fw, fh, ft], [cx, cy, zf]);
    b.obj(`d${k}l`, 'dside', [st, bh, dd], [cx - bw / 2 + st / 2, by, zs]);
    b.obj(`d${k}r`, 'dside', [st, bh, dd], [cx + bw / 2 - st / 2, by, zs]);
    b.obj(`d${k}b`, 'dbottom', [bw - 2 * st + 0.8, 0.3, dd - 1.5], [cx, s.ya + 2, zs + 0.2]);
    b.obj(`d${k}k`, 'dback', [bw - 2 * st, bh - 1.5, st], [cx, by + 0.75, zfront - dd + st / 2]);
    ids.push({ k, cx, cy, bw, by, bh, zfront, zs: zs - pull, s, fw });
    if (runners) {
      b.part('runner', 'Drawer runner');
      b.obj(`rn${k}l`, 'runner', [1.2, 1.4, dd], [s.xa + 0.6, s.ya + 1.6, zs - pull]);
      b.obj(`rn${k}r`, 'runner', [1.2, 1.4, dd], [s.xb - 0.6, s.ya + 1.6, zs - pull]);
    }
  });
  if (runners) b.step({
    caption: `Runners: ${ids.length} pairs`,
    say: pick(slug, 'runners', [
      `Screw the metal runners inside the frame, one pair for each drawer, ${say(ids.length * 2)} in all. Use the pre-drilled holes so every pair sits level.`,
      `Runner time. ${Say(ids.length)} pairs, one on each wall of every opening, screwed into the pre-drilled holes. Left and right runners are mirror images, so check the labels.`,
    ]),
    add: ids.flatMap(({ k }) => [`rn${k}l`, `rn${k}r`]), from: [0, 0, 30],
    hardware: [
      b.H('screw', '+x', ids.flatMap(({ s, zs }) => [[s.xa, s.ya + 1.6, zs + dd / 3], [s.xa, s.ya + 1.6, zs - dd / 3]])),
      b.H('screw', '-x', ids.flatMap(({ s, zs }) => [[s.xb, s.ya + 1.6, zs + dd / 3], [s.xb, s.ya + 1.6, zs - dd / 3]])),
    ],
    view: { az: 20, el: 25 },
  });
  else b.step({
    caption: 'Check the rails',
    say: 'This one has no metal runners. The drawers slide on wooden rails built into the sides. Run a fingertip along them and brush off any splinters, then rub on a little candle wax so the drawers glide.',
    view: { az: 20, el: 20, tight: true },
  });
  const f = ids[0];
  b.step({
    caption: 'Drawer 1: front + sides',
    say: 'First drawer. Lay the drawer front face down on something soft. Tap in four dowels, then press both drawer sides onto them, grooves facing in.',
    add: [`d${f.k}f`, `d${f.k}l`, `d${f.k}r`], from: [0, 0, 35],
    hardware: [b.H('dowel', '-z', [[f.cx - f.bw / 2 + 0.6, f.by - f.bh / 4, f.zfront], [f.cx - f.bw / 2 + 0.6, f.by + f.bh / 4, f.zfront], [f.cx + f.bw / 2 - 0.6, f.by - f.bh / 4, f.zfront], [f.cx + f.bw / 2 - 0.6, f.by + f.bh / 4, f.zfront]])],
    view: { az: 25, el: 40, tight: true, zoom: 0.9 },
  });
  b.step({
    caption: 'Slide in the bottom',
    say: pick(slug, 'dbottom', ['Slide the thin drawer bottom into the grooves, shiny side up, all the way to the front.', 'The drawer bottom slides into the grooves from the back. Shiny side up. Push it home against the front.']),
    add: [`d${f.k}b`], from: [0, 0, -35], view: { az: 30, el: 45, tight: true, zoom: 0.9 },
  });
  b.step({
    caption: 'Drawer back. 4 screws.',
    say: 'Close the drawer with its back panel, then drive four screws through the back into the sides. Snug, not cranked.',
    add: [`d${f.k}k`], from: [0, 0, -30],
    hardware: [b.H('screw', '-z', [[f.cx - f.bw / 2 + 0.6, f.by - f.bh / 4, f.zfront - dd], [f.cx - f.bw / 2 + 0.6, f.by + f.bh / 4, f.zfront - dd], [f.cx + f.bw / 2 - 0.6, f.by - f.bh / 4, f.zfront - dd], [f.cx + f.bw / 2 - 0.6, f.by + f.bh / 4, f.zfront - dd]], { spin: true })],
    view: { az: 25, el: 38, tight: true, zoom: 0.9 },
  });
  const rest = ids.slice(1);
  if (rest.length) b.step({
    caption: rest.length > 1 ? `Build ${rest.length} more` : 'Build drawer two',
    say: `${rest.length > 1 ? `Now the other ${say(rest.length)} drawers` : 'Now the second drawer'}, exactly the same way: front, sides, bottom, back. Then slide every drawer in${runners ? ' onto its runners' : ''} until it stops. The demo leaves drawer one pulled open so you can see inside. Take a break halfway if you need one.`,
    add: rest.flatMap(({ k }) => [`d${k}f`, `d${k}l`, `d${k}r`, `d${k}b`, `d${k}k`]), from: [0, 0, 40],
    hardware: [b.C('dowel', rest.length * 4), b.C('screw', rest.length * 4)],
    view: { az: 20, el: 20 },
  });
  else b.step({ caption: 'Slide it in', say: `Slide the drawer into its opening${runners ? ' on the runners' : ''}. It should close flush.`, view: { az: 20, el: 20 } });
  if (opt.knobs) {
    const per = opt.knobs;
    b.step({
      caption: 'Knobs on',
      say: `${per > 1 ? `Two ${opt.knobWord ?? 'knobs'} per drawer` : `One ${(opt.knobWord ?? 'knobs').replace(/s$/, '')} per drawer`}. Each one gets a screw from the inside of the drawer front. Hand tight is plenty.`,
      hardware: [b.H('knob', '+z', ids.flatMap(({ cx, cy, fw, zfront }) => (per > 1 ? [[cx - fw / 4, cy, zfront + 1.6 + (opt.overlay ? 1.6 : 0)], [cx + fw / 4, cy, zfront + 1.6 + (opt.overlay ? 1.6 : 0)]] : [[cx, cy, zfront + 1.6 + (opt.overlay ? 1.6 : 0)]])))],
      view: { az: 15, el: 15 },
    });
  }
}

function doorsFor(b, g, area, opt) {
  // area: { xa, xb, ya, yb } on the front; opt.doors = 1|2
  const n = opt.doors ?? 1;
  const D2 = g.D / 2;
  b.part('door', 'Door');
  const w = (area.xb - area.xa) / n - 0.3, h = area.yb - area.ya - 0.3;
  const doors = Array.from({ length: n }, (_, i) => {
    const cx = area.xa + (area.xb - area.xa) * (i + 0.5) / n;
    const left = n === 1 ? (opt.hingeSide ?? 'left') === 'left' : i === 0;
    const hx = left ? cx - w / 2 + 2.5 : cx + w / 2 - 2.5;
    const hn = h > 100 ? 3 : 2;
    return { id: `door${i + 1}`, cx, hx, hn, left };
  });
  const cy = (area.ya + area.yb) / 2;
  doors.forEach((d) => b.obj(d.id, 'door', [w, h, 1.8], [d.cx, cy, D2 + 0.9]));
  const hinges = doors.flatMap((d) => spread(area.ya + 10, area.yb - 10, d.hn).map((y) => [d.hx, y, D2]));
  b.step({
    caption: n > 1 ? 'Hang the doors' : 'Hang the door',
    say: `Press the hinge${hinges.length > 1 ? 's' : ''} into the round cups on the back of the door${n > 1 ? 's' : ''}, then clip ${n > 1 ? 'each door' : 'it'} onto the mounting plates inside the frame. Hold the door while you clip. It's heavier than it looks.`,
    add: doors.map((d) => d.id), from: [0, 0, 40],
    hardware: [b.H('hinge', '-z', hinges), b.C('screw', hinges.length * 2)],
    view: { az: 25, el: 15 },
  });
  b.step({
    caption: 'Line up the gaps',
    say: 'Close the door and look at the gaps. The screws on each hinge move the door up, down, in and out. A quarter turn at a time until the gaps are even.',
    view: { az: 10, el: 10, tight: true },
  });
  if (opt.knobs) b.step({
    caption: 'Knob on',
    say: `A ${opt.knobWord ?? 'knob'} for ${n > 1 ? 'each door' : 'the door'}, on the side away from the hinges. One screw from the inside.`,
    hardware: [b.H('knob', '+z', doors.map((d) => [d.left ? d.cx + w / 2 - 4 : d.cx - w / 2 + 4, cy, D2 + 1.8]))],
    view: { az: 15, el: 10 },
  });
}

export function chest(b) {
  const s = b.spec, o = b.o;
  const [W, D, H] = s.size;
  const g = carcassGeo({ W, H, D, t: o.t ?? 1.6, top: o.top ?? 'overlay', tt: o.tt, overhang: o.overhang ?? 0, base: o.base });
  const L = layoutRows(g, o.rows);
  carcassBuild(b, g, { fixed: L.fixed, dividers: L.dividers, back: o.back ?? 'nailed', noun: o.noun ?? 'frame' });
  const dslots = L.rows.filter((x) => x.type === 'drawer').flatMap((row) => row.slots.map((sl) => ({ ...sl, ya: row.ya, yb: row.yb })));
  if (dslots.length) drawers(b, g, dslots, { runners: o.runners, knobs: o.knobs, knobWord: o.knobWord, overlay: o.overlayFronts, depth: o.drawerDepth });
  const doorRows = L.rows.filter((x) => x.type === 'door');
  if (doorRows.length) doorsFor(b, g, { xa: -g.IW / 2, xb: g.IW / 2, ya: Math.min(...doorRows.map((x) => x.ya)), yb: Math.max(...doorRows.map((x) => x.yb)) }, o);
  if (o.shelves) addShelves(b, g, shelfLevels(Math.min(...doorRows.map((x) => x.ya)), Math.max(...doorRows.map((x) => x.yb)), [], o.shelves), 'Shelf in', true);
  if (o.anchor !== false) anchorStep(b, g);
}

function addShelves(b, g, ys, caption, inside) {
  if (!ys.length) return;
  const { t, IW, D, sxL, sxR, zq } = g;
  b.part('shelf', 'Shelf', 'Shelves');
  ys.forEach((y, i) => b.obj(`shelf${i + 1}`, 'shelf', [IW - 0.4, 1.6, D - 2.4], [0, y, -0.6]));
  const pinsAt = ys.flatMap((y) => [[sxL, y - 1.1, zq * 0.8], [sxL, y - 1.1, -zq * 0.8]]);
  const pinsAtR = ys.flatMap((y) => [[sxR, y - 1.1, zq * 0.8], [sxR, y - 1.1, -zq * 0.8]]);
  b.step({
    caption: ys.length > 1 ? `${ys.length} shelves in` : caption,
    say: `Push ${say(ys.length * 4)} shelf pins into the holes at the heights you like, four per shelf, then rest ${ys.length > 1 ? 'each shelf' : 'the shelf'} on top.${inside ? '' : ' Move them any time.'}`,
    add: ys.map((_, i) => `shelf${i + 1}`), from: [0, 0, 40],
    hardware: [b.H('spin', '+x', pinsAt), b.H('spin', '-x', pinsAtR)],
    view: { az: 20, el: 20 },
  });
  void t;
}

export function bookcase(b) {
  const s = b.spec, o = b.o;
  const [W, D, H] = s.size;
  const g = carcassGeo({ W, H, D, t: o.t ?? 1.5, top: o.top ?? 'inset', tt: o.tt, overhang: o.overhang ?? 0, base: o.base ?? { type: 'plinth', h: 6 } });
  const fixed = (o.fixed ?? []).map((f) => r(g.y0 + (g.y1 - g.y0) * f));
  const lying = o.lying ?? H > 140;
  carcassBuild(b, g, { fixed, back: o.back ?? 'nailed', lying, noun: o.noun ?? 'bookcase' });
  if (o.rails) {
    const levels = spread(g.y0 + 6, g.y1 - 8, o.rails).map(r);
    b.part('rail', 'Bin rail');
    levels.forEach((y, i) => { b.obj(`railL${i + 1}`, 'rail', [1.4, 1.2, D - 3], [g.sxL + 0.7, y, -1]); b.obj(`railR${i + 1}`, 'rail', [1.4, 1.2, D - 3], [g.sxR - 0.7, y, -1]); });
    b.step({
      caption: `${o.rails * 2} bin rails`,
      say: `Snap or screw the bin rails onto the inside walls, ${say(o.rails)} pairs, matching heights left and right. Mix big and small bins later by skipping a rail.`,
      add: levels.flatMap((_, i) => [`railL${i + 1}`, `railR${i + 1}`]), from: [0, 0, 35],
      hardware: [b.C('screw', o.rails * 4)], view: { az: 20, el: 20 },
    });
  }
  if (o.shelves) addShelves(b, g, shelfLevels(g.y0, g.y1, fixed, o.shelves), 'Shelf in', !!o.doors);
  if (o.doors) doorsFor(b, g, { xa: -W / 2 + 0.2, xb: W / 2 - 0.2, ya: g.bh + 0.3, yb: H - 0.3 }, o);
  if (o.finale) b.step({ ...o.finale, view: { az: 25, el: 18 } });
  if (o.anchor !== false) anchorStep(b, g);
}

/** KALLAX-style cube grid: thick outer frame, thin inner grid. */
export function cubes(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const cols = o.cols, rows = o.rows;
  const T = o.outer ?? 3.9, t = o.inner ?? 1.5, cell = o.cell ?? 33.5;
  const D = s.size[1];
  const IW = cols * cell + (cols - 1) * t, IH = rows * cell + (rows - 1) * t;
  const W = IW + 2 * T, H = IH + 2 * T;
  const lying = o.lying ?? H > 100;
  const big = H >= 120 || W >= 120;
  b.part('side', 'Side panel'); b.part('end', 'End panel');
  b.obj('sideL', 'side', [T, H, D], [-W / 2 + T / 2, H / 2, 0]);
  b.obj('sideR', 'side', [T, H, D], [W / 2 - T / 2, H / 2, 0]);
  b.obj('bottom', 'end', [IW, T, D], [0, T / 2, 0]);
  b.obj('top', 'end', [IW, T, D], [0, H - T / 2, 0]);
  if (rows > 1) b.part('long', 'Long shelf', 'Long shelves');
  if (cols > 1) b.part('div', 'Divider');
  const rowY = (k) => T + k * (cell + t); // bottom of row k (0 = bottom)
  const divX = (j) => -IW / 2 + j * cell + (j - 1) * t + t / 2; // j = 1..cols-1
  for (let k = 0; k < rows - 1; k++) b.obj(`long${k + 1}`, 'long', [IW, t, D], [0, rowY(k) + cell + t / 2, 0]);
  for (let k = 0; k < rows; k++) for (let j = 1; j < cols; j++) b.obj(`div${k + 1}_${j}`, 'div', [t, cell, D], [divX(j), rowY(k) + cell / 2, 0]);
  const zq = D / 2 - 6, sxL = -W / 2 + T, sxR = W / 2 - T;
  const endPins = (sx, ax) => b.H('pin', ax, [[sx, T / 2, zq], [sx, T / 2, -zq], [sx, H - T / 2, zq], [sx, H - T / 2, -zq]]);
  const longDowels = (sx, ax) => (rows > 1 ? [b.H('dowel', ax, Array.from({ length: rows - 1 }, (_, k) => rowY(k) + cell + t / 2).flatMap((y) => [[sx, y, zq], [sx, y, -zq]]))] : []);
  const v = (az, el, more = {}) => ({ az, el: lying ? Math.max(el, 50) : el, ...more });
  b.step({
    caption: 'Side panel + pins',
    say: `${lying ? 'Lay one thick side panel flat on the floor' : 'Stand one thick side panel on its edge'}, holes ${lying ? 'up' : 'in'}. Screw in four cam pins at the ends${rows > 1 ? `, and tap ${say((rows - 1) * 2)} dowels into the holes for the long shelves` : ''}.`,
    pose: lying ? [-90, 0, 0] : undefined, add: ['sideL'], from: [-30, 0, 0], hardware: [endPins(sxL, '+x'), ...longDowels(sxL, '+x')], view: v(50, 25),
  });
  b.step({
    caption: 'Bottom on. Lock 2.',
    say: 'Push one of the thick end panels onto the low pins, then lock it with two cam locks, arrows toward the pins, turned clockwise.',
    add: ['bottom'], from: [35, 0, 0], hardware: [b.H('cam', '+y', [[sxL + 3.4, T, zq], [sxL + 3.4, T, -zq]], { spin: true })], view: v(35, 40),
  });
  for (let k = 0; k < rows; k++) {
    const yb = rowY(k);
    if (cols > 1) b.step({
      caption: rows > 1 ? `Row ${k + 1}: dividers` : `${cols - 1} divider${cols > 2 ? 's' : ''}`,
      say: k === 0
        ? `Tap dowels into the panel below, two per divider, and stand ${cols > 2 ? `the ${say(cols - 1)} short dividers` : 'the short divider'} on them. They set the cube width, so push them fully home.`
        : pick(slug, `row${k}`, ['Next row of dividers, same as before: dowels down, dividers on.', 'Dowels, then dividers. Line them up over the ones below.', 'Another row of dividers. You know the drill.']),
      add: Array.from({ length: cols - 1 }, (_, j) => `div${k + 1}_${j + 1}`), from: [0, 30, 0],
      hardware: [b.H('dowel', '+y', Array.from({ length: cols - 1 }, (_, j) => divX(j + 1)).flatMap((x) => [[x, yb, zq], [x, yb, -zq], [x, yb + cell, zq], [x, yb + cell, -zq]]))],
      view: v(30, 35),
    });
    if (k < rows - 1) b.step({
      caption: `Long shelf ${k + 1}`,
      say: k === 0 ? 'Lower a long shelf onto the divider dowels and the side dowels at the same time. Wiggle it down evenly, a little at each end.' : `Long shelf number ${say(k + 1)}, onto the dowels.`,
      add: [`long${k + 1}`], from: [35, 0, 0], view: v(30, 40),
    });
  }
  b.step({
    caption: 'Top on. Lock 2.',
    say: 'Top end panel onto its pins and the top dowels. Lock two cam locks.',
    add: ['top'], from: [35, 0, 0], hardware: [b.H('cam', '+y', [[sxL + 3.4, H, zq], [sxL + 3.4, H, -zq]], { spin: true })], view: v(25, 40),
  });
  b.step({
    caption: 'Side two. Lock 4.',
    say: `Pins into the ends of the top and bottom, ${rows > 1 ? 'dowels into the long shelves, ' : ''}then ${big ? 'with a helper, ' : ''}press the second side on and lock the last four cam locks.`,
    add: ['sideR'], from: [30, 0, 0],
    hardware: [endPins(sxR, '-x'), ...longDowels(sxR, '-x'), b.H('cam', '+y', [[sxR - 3.4, T, zq], [sxR - 3.4, T, -zq], [sxR - 3.4, H, zq], [sxR - 3.4, H, -zq]], { spin: true })],
    view: v(-40, 30), safety: big ? 'Two people for this one.' : undefined,
  });
  if (lying) b.step({ caption: 'Stand it up', say: big ? 'Stand it up together, walking it up from one end. It is heavy.' : 'Stand it up on its end.', pose: [0, 0, 0], view: { az: 30, el: 18 }, safety: big ? 'Two-person lift.' : undefined });
  if (o.anchor !== false) anchorStep(b, { W, D, sideY1: H }, 'Screw the wall bracket to the top at the back, then into the wall with fixings for your wall. Fill the bottom cubes first and the top ones last. And always anchor it.');
}
