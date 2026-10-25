// Archetypes added in brands batch 5: tool-free joinery bed frames (Thuma-style: rails that slide into slotted
// corner legs, a center support and a slat roll) and wardrobes / armoires (a tall carcass with hanging rails,
// shelves, hinged or mirror doors and optional drawers along the bottom).
// Steps are written in our own words from public facts (dimensions, materials, what is in the box); they are a
// demo, never a copy of any manual.
import { r, say, Say, pick, spread } from './lib.mjs';
import { carcassGeo, carcassBuild, anchorStep, shelfLevels } from './carcass.mjs';
import { drawers } from './storage.mjs';

/**
 * Joinery bed: four slotted corner legs, head and foot rails, two side rails that drop into the leg slots,
 * a center rail on its own legs and a slat roll. No tools. size = [W, L, H] (H = headboard top, or the frame height).
 * options: frame (frame height, cm), clear (under-bed height, cm), leg (leg size, cm), headboard, slats, centerLegs, screws.
 */
export function joineryBed(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, L, Hs] = s.size;
  const FH = o.frame ?? 33, clear = o.clear ?? 23, rh = FH - clear, leg = o.leg ?? 7.5, rw = 3.8;
  const hb = !!o.headboard;
  const lx = W / 2 - leg / 2, lz = L / 2 - leg / 2, ry = FH - rh / 2;
  b.part('leg', 'Corner leg'); b.part('end', 'Head and foot rail'); b.part('rail', 'Side rail'); b.part('center', 'Center rail'); b.part('slats', 'Slat roll');
  const legIds = [['legHL', -lx, -lz], ['legHR', lx, -lz], ['legFL', -lx, lz], ['legFR', lx, lz]];
  // each leg shows its two open slots as notches on the inner faces
  for (const [id, x, z] of legIds) b.obj(id, 'leg', [leg, FH, leg], [x, FH / 2, z], { boxes: [
    { s: [leg, FH, leg], p: [0, 0, 0] },
    { s: [leg * 0.5, 0.6, leg * 0.6], p: [-Math.sign(x) * leg * 0.25, FH / 2 - 0.3, 0] },
  ] });
  const inW = W - 2 * leg, inL = L - 2 * leg;
  // rails carry a short tongue at each end that sits inside the leg slot
  b.obj('endH', 'end', [inW + leg, rh, rw], [0, ry, -lz], { boxes: [{ s: [inW, rh, rw], p: [0, 0, 0] }, { s: [leg / 2, rh - 2, rw - 1], p: [-inW / 2 - leg / 4, -1, 0] }, { s: [leg / 2, rh - 2, rw - 1], p: [inW / 2 + leg / 4, -1, 0] }] });
  b.obj('endF', 'end', [inW + leg, rh, rw], [0, ry, lz], { boxes: [{ s: [inW, rh, rw], p: [0, 0, 0] }, { s: [leg / 2, rh - 2, rw - 1], p: [-inW / 2 - leg / 4, -1, 0] }, { s: [leg / 2, rh - 2, rw - 1], p: [inW / 2 + leg / 4, -1, 0] }] });
  const sideBoxes = [{ s: [rw, rh, inL], p: [0, 0, 0] }, { s: [rw - 1, rh - 2, leg / 2], p: [0, -1, -inL / 2 - leg / 4] }, { s: [rw - 1, rh - 2, leg / 2], p: [0, -1, inL / 2 + leg / 4] }];
  b.obj('railL', 'rail', [rw, rh, inL + leg], [-lx, ry, 0], { boxes: sideBoxes });
  b.obj('railR', 'rail', [rw, rh, inL + leg], [lx, ry, 0], { boxes: sideBoxes });
  const nc = o.centerLegs ?? 2, ch = rh * 0.6;
  const cz = spread(-L / 4, L / 4, nc);
  b.obj('center', 'center', [5, FH - 1.8, inL], [0, (FH - 1.8) / 2, 0], { boxes: [
    { s: [5, ch, inL], p: [0, (FH - 1.8) / 2 - ch / 2, 0] },
    ...cz.map((z) => ({ s: [5, FH - 1.8 - ch, 5], p: [0, -ch / 2, z], shape: 'cyl' })),
  ] });
  const n = o.slats ?? Math.max(14, Math.round(L / 11)), sw = inW - 1;
  const zs = spread(-inL / 2 + 4, inL / 2 - 4, n);
  b.obj('slats', 'slats', [sw, 1.8, inL - 2], [0, FH - 0.9, 0], { boxes: zs.map((z) => ({ s: [sw, 1.8, 6.5], p: [0, 0, z] })) });
  if (hb) {
    b.part('head', 'Headboard');
    b.obj('head', 'head', [W, Hs, 4], [0, Hs / 2, -L / 2 - 2], { boxes: [{ s: [W, Hs - FH, 3], p: [0, FH / 2, 0] }, { s: [6, Hs, 4], p: [-W / 2 + 3, 0, 0] }, { s: [6, Hs, 4], p: [W / 2 - 3, 0, 0] }] });
  }
  const big = W >= 140;
  b.step({ caption: 'No tools needed', say: pick(slug, 'unbox', ['Clear the floor where the bed will live and lay the parts out on the empty box. This frame is held together by its joints, so put the screwdriver away.', 'Pick the spot and clear it. The pieces lock into each other with wooden joints, no tools, so you only need your hands and a helper.']), view: { az: 30, el: 35 }, safety: 'Two people for this one.' });
  b.step({ caption: 'Head end', say: 'Stand two corner legs up, slots facing each other. Lower the head rail so its tongues slide down into the slots, both ends together, until the top is flush with the legs.', add: ['legHL', 'legHR', 'endH'], from: [0, 30, 0], view: { az: 35, el: 30 } });
  b.step({ caption: 'Foot end', say: pick(slug, 'foot', ['Same again at the foot end: two legs, then the foot rail slides down into their slots.', 'Build the foot end the same way. Rail tongues into the leg slots, pressed down flush.']), add: ['legFL', 'legFR', 'endF'], from: [0, 30, 0], view: { az: -35, el: 30 } });
  b.step({ caption: '2 side rails in', say: `Set the two ends a bed length apart. Lift a side rail and lower its tongues into the open slots at the head and the foot at the same time, then press down until it sits flush. ${big ? 'One person at each end makes this easy.' : 'Then the other side.'} If a joint is tight, press with your palm, never hammer.`, add: ['railL', 'railR'], from: [0, 30, 0], view: { az: 40, el: 40 }, safety: big ? 'Two people for this one.' : undefined });
  const screws = o.screws ?? 2;
  b.step({
    caption: 'Center rail',
    say: `Drop the center rail into the notches in the middle of the head and foot rails, and stand its ${say(nc)} legs straight so they touch the floor.${screws ? ` Then turn the ${say(screws)} hand-tightened screws in with your fingers until snug.` : ''}`,
    add: ['center'], from: [0, 30, 0], hardware: screws ? [b.H('hand', '-z', [[0, FH - ch / 2, -inL / 2], [0, FH - ch / 2, inL / 2]].slice(0, Math.max(1, screws)), { spin: true })] : [],
    view: { az: 30, el: 55 },
  });
  b.step({ caption: 'Check the joints', say: 'Press down on each corner. Every rail should sit flush with the top of its legs, with no gap in any slot. Measure corner to corner both ways: when the diagonals match, the frame is square.', view: { az: 0, el: 75 } });
  b.step({ caption: `Unroll ${n} slats`, say: `Unroll the slats from the head to the foot. Seat the ends on the ledges inside the side rails so they lock in place and cannot slide. ${Say(n)} slats, evenly spaced.`, add: ['slats'], from: [0, 30, 0], view: { az: 30, el: 55 } });
  if (hb) b.step({ caption: 'Headboard on', say: 'Stand the headboard behind the head end and seat it on its fittings at the head legs, the way your brand guide shows. Lean on it gently: it should not wobble.', add: ['head'], from: [0, 0, -40], view: { az: 150, el: 25 }, safety: 'Two people for this one.' });
  b.step({ caption: 'Mattress on', say: 'Push the bed into place, check that nothing rocks, and lay the mattress on. No box spring needed.', view: { az: 25, el: 25 } });
}

/**
 * Wardrobe / armoire: a tall carcass split into columns (hanging rail, hat shelf, adjustable shelves), hinged
 * doors (any of them can be a mirror door) and optional drawers along the bottom. size = [W, D, H].
 * options: cols: [{ w, rod, hat, shelves, doors, mirror }], drawers: { rows, cols, h }, knobs, knobWord, t, tt, top, base, lying.
 */
export function wardrobe(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, D, H] = s.size;
  const g = carcassGeo({ W, H, D, t: o.t ?? 1.6, top: o.top ?? 'overlay', tt: o.tt, overhang: o.overhang ?? 0, base: o.base ?? { type: 'plinth', h: 6 } });
  const { t, IW, y0, y1 } = g;
  const cols = o.cols ?? [{ rod: true, hat: true, doors: 2 }];
  const dz = o.drawers ? o.drawers.h : 0;
  const fixed = [];
  let zoneY0 = y0;
  if (dz) { fixed.push(r(y0 + dz + t / 2)); zoneY0 = y0 + dz + t; }
  // column x ranges inside the door zone
  const sumW = cols.reduce((a, c) => a + (c.w ?? 1), 0);
  const avail = IW - (cols.length - 1) * t;
  let cx = -IW / 2;
  const C = cols.map((c, i) => { const w = (avail * (c.w ?? 1)) / sumW; const out = { ...c, xa: cx, xb: cx + w }; cx += w + (i < cols.length - 1 ? t : 0); return out; });
  const dividers = C.slice(0, -1).map((c) => ({ x: r(c.xb + t / 2), y0: r(zoneY0), y1: r(y1) }));
  const dcols = o.drawers?.cols ?? 1;
  if (dz && dcols > 1) {
    const dw = (IW - (dcols - 1) * t) / dcols;
    for (let k = 1; k < dcols; k++) dividers.push({ x: r(-IW / 2 + k * dw + (k - 0.5) * t), y0: r(y0), y1: r(y0 + dz) });
  }
  const lying = o.lying ?? H > 140;
  carcassBuild(b, g, { fixed, dividers, back: 'nailed', lying, noun: 'wardrobe' });
  if (dz) {
    const rows = o.drawers.rows ?? 1, rhh = dz / rows, dw = (IW - (dcols - 1) * t) / dcols;
    const slots = [];
    for (let rr = 0; rr < rows; rr++) for (let k = 0; k < dcols; k++) slots.push({ xa: -IW / 2 + k * (dw + t), xb: -IW / 2 + k * (dw + t) + dw, ya: y0 + dz - (rr + 1) * rhh, yb: y0 + dz - rr * rhh });
    drawers(b, g, slots, { runners: o.runners, knobs: o.drawerKnobs ?? o.knobs, knobWord: o.drawerKnobWord ?? o.knobWord, depth: o.drawerDepth });
  }
  // inside: hat shelves + rails, then adjustable shelves
  const rails = [], hats = [], shelves = [];
  C.forEach((c, i) => {
    let top = y1;
    if (c.rod) {
      if (c.hat) { const hy = y1 - 26; hats.push({ i, y: hy, c }); top = hy; }
      rails.push({ i, y: top - 6, c });
    }
    if (c.shelves) {
      const lo = zoneY0, hi = c.rod ? Math.max(zoneY0 + 30, top - 110) : top;
      shelfLevels(lo, hi, [], c.shelves).forEach((y) => shelves.push({ i, y, c }));
    }
  });
  const sh = [...hats, ...shelves];
  if (sh.length) b.part('shelf', 'Shelf', 'Shelves');
  sh.forEach((x, k) => b.obj(`shelf${k + 1}`, 'shelf', [x.c.xb - x.c.xa - 0.4, 1.6, D - 2.4], [(x.c.xa + x.c.xb) / 2, x.y, -0.6]));
  if (rails.length) b.part('rail', 'Clothes rail');
  rails.forEach((x, k) => b.obj(`rail${k + 1}`, 'rail', [x.c.xb - x.c.xa - 0.6, 2.2, 2.2], [(x.c.xa + x.c.xb) / 2, x.y, 0]));
  if (sh.length) {
    const pins = sh.flatMap((x) => [[x.c.xa, x.y - 1.1, g.zq * 0.8], [x.c.xa, x.y - 1.1, -g.zq * 0.8]]);
    const pinsR = sh.flatMap((x) => [[x.c.xb, x.y - 1.1, g.zq * 0.8], [x.c.xb, x.y - 1.1, -g.zq * 0.8]]);
    b.step({
      caption: sh.length > 1 ? `${sh.length} shelves in` : 'Shelf in',
      say: `${hats.length ? `The shelf above the rail goes in first, high up. ` : ''}Push four shelf pins into the holes at the height you want for each shelf, ${say(sh.length * 4)} pins in all, then rest the shelves on them, front edge flush.`,
      add: sh.map((_, k) => `shelf${k + 1}`), from: [0, 0, 40],
      hardware: [b.H('spin', '+x', pins), b.H('spin', '-x', pinsR)], view: { az: 20, el: 20 },
    });
  }
  if (rails.length) b.step({
    caption: rails.length > 1 ? `${rails.length} clothes rails` : 'Clothes rail',
    say: `Screw a rail holder to each side of the hanging space, level with each other, then drop the clothes rail${rails.length > 1 ? 's' : ''} into the holders. Hang one coat and check it slides freely.`,
    add: rails.map((_, k) => `rail${k + 1}`), from: [0, 0, 35],
    hardware: [b.H('railcup', '+x', rails.map((x) => [x.c.xa, x.y, 0])), b.H('railcup', '-x', rails.map((x) => [x.c.xb, x.y, 0])), b.C('screw', rails.length * 4)],
    view: { az: 20, el: 15 },
  });
  // doors: one set per column, any of them can be a mirror door
  const D2 = D / 2, dyA = (dz ? zoneY0 - t / 2 : g.bh) + 0.3, dyB = H - (g.top === 'overlay' ? g.tt : 0) - 0.3;
  const dh = dyB - dyA, hn = dh > 150 ? 4 : dh > 100 ? 3 : 2;
  const doors = [];
  C.forEach((c) => {
    const nd = c.doors ?? 1, xa = c.xa - (doors.length === 0 ? t * 0.9 : t / 2), xb = c.xb + (c === C[C.length - 1] ? t * 0.9 : t / 2);
    const w = (xb - xa) / nd - 0.3;
    for (let j = 0; j < nd; j++) {
      const dcx = xa + (xb - xa) * (j + 0.5) / nd;
      const left = nd === 1 ? (c.hinge ?? 'left') === 'left' : j === 0;
      doors.push({ id: `door${doors.length + 1}`, cx: dcx, w, left, mirror: !!(c.mirror && (nd === 1 || j === (c.mirrorDoor ?? 0))) });
    }
  });
  if (doors.some((d) => !d.mirror)) b.part('door', 'Door');
  if (doors.some((d) => d.mirror)) b.part('mirror', 'Mirror door');
  doors.forEach((d) => b.obj(d.id, d.mirror ? 'mirror' : 'door', [d.w, dh, 1.8], [d.cx, (dyA + dyB) / 2, D2 + 0.9]));
  const hinges = doors.flatMap((d) => spread(dyA + 10, dyB - 10, hn).map((y) => [d.left ? d.cx - d.w / 2 + 2.5 : d.cx + d.w / 2 - 2.5, y, D2]));
  const nm = doors.filter((d) => d.mirror).length;
  b.step({
    caption: doors.length > 1 ? `Hang ${doors.length} doors` : 'Hang the door',
    say: `Press ${say(hn)} hinges into the round cups on the back of each door, ${say(hinges.length)} in all, then clip each door onto its mounting plates inside the frame.${nm ? ` The mirror door is heavier and breakable: carry it upright and hang it last.` : ''} Doors this tall need a second pair of hands.`,
    add: doors.map((d) => d.id), from: [0, 0, 40],
    hardware: [b.H('hinge', '-z', hinges), b.C('screw', hinges.length * 2)],
    view: { az: 20, el: 12 }, safety: 'Two people for this one.',
  });
  b.step({ caption: 'Line up the gaps', say: pick(slug, 'gaps', ['Close every door and look at the gaps. The screws on each hinge move a door up, down, in and out. A quarter turn at a time until the gaps are even and the doors meet in a straight line.', 'Shut the doors and check the lines. Tall doors drift, so nudge the hinge screws a quarter turn at a time until every gap matches.']), view: { az: 10, el: 10, tight: true } });
  if (o.knobs) b.step({
    caption: 'Handles on',
    say: `A ${(o.knobWord ?? 'knobs').replace(/s$/, '')} for each door, on the side away from the hinges, about chest height. One screw from the inside.`,
    hardware: [b.H('knob', '+z', doors.map((d) => [d.left ? d.cx + d.w / 2 - 4 : d.cx - d.w / 2 + 4, Math.min(dyB - 20, dyA + dh * 0.55), D2 + 1.8]))],
    view: { az: 15, el: 10 },
  });
  anchorStep(b, g, pick(slug, 'anchor', [
    'Last and most important. A full wardrobe with an open door can tip forward. Fix the wall bracket to the top at the back, then screw it into the wall with fixings that suit your wall. Always anchor it.',
    'Before anything goes inside, anchor it. Screw the wall bracket to the back edge of the top and into the wall with the right fixings for your wall. Tall, deep and heavy means it must be anchored.',
  ]));
}
