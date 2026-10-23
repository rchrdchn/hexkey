// The flat-pack box: two sides, a bottom, a top, optional fixed shelves/dividers, a base and a nailed back.
// Most chests, bookcases and cabinets are this box plus something inside it.
import { r, say, Say, pick, spread } from './lib.mjs';

/** Pure geometry for a carcass. cfg: { W,H,D, t, tt, top:'inset'|'overlay', overhang, base:{type:'none'|'plinth'|'legs'|'apron'|'casters', h, leg} } */
export function carcassGeo(cfg) {
  const { W, H, D } = cfg;
  const t = cfg.t ?? 1.6;
  const top = cfg.top ?? 'inset';
  const tt = cfg.tt ?? (top === 'overlay' ? 2.2 : t);
  const base = { type: 'none', h: 0, ...(cfg.base ?? {}) };
  const bh = base.type === 'none' ? 0 : base.h;
  const raised = ['legs', 'apron', 'casters'].includes(base.type);
  const sideY0 = raised ? bh : 0;
  const sideY1 = top === 'overlay' ? H - tt : H;
  const IW = W - 2 * t;
  const bottomY = (base.type === 'plinth' ? bh : sideY0) + t / 2;
  const y0 = bottomY + t / 2;
  const y1 = top === 'overlay' ? sideY1 : H - t;
  const zq = r(Math.min(D / 2 - 3, Math.max(4, D * 0.32)));
  return { ...cfg, W, H, D, t, top, tt, base, bh, raised, sideY0, sideY1, IW, bottomY, y0, y1, zq, sxL: -W / 2 + t, sxR: W / 2 - t, oh: cfg.overhang ?? 0 };
}

/**
 * Adds the carcass objects and steps.
 * extra: { fixed: [y], dividers: [{x, y0, y1}], back: 'nailed'|'none', lying, noun }
 * Returns { flipped } so callers know the piece ends upright.
 */
export function carcassBuild(b, g, extra = {}) {
  const slug = b.spec.slug;
  const { W, H, D, t, tt, zq, sxL, sxR, IW, bottomY, sideY0, sideY1, base, bh } = g;
  const fixed = extra.fixed ?? [];
  const dividers = extra.dividers ?? [];
  const back = extra.back ?? 'nailed';
  const lying = !!extra.lying;
  const noun = extra.noun ?? 'frame';
  const big = H >= 120 || W >= 120;
  const sideH = sideY1 - sideY0;
  const midY = sideY0 + sideH / 2;

  b.part('side', 'Side panel');
  b.obj('sideL', 'side', [t, sideH, D], [-W / 2 + t / 2, midY, 0]);
  b.obj('sideR', 'side', [t, sideH, D], [W / 2 - t / 2, midY, 0]);
  b.part('bottom', 'Bottom panel');
  b.obj('bottom', 'bottom', [IW, t, D - 0.4], [0, bottomY, 0.2]);
  const topY = g.top === 'overlay' ? H - tt / 2 : H - t / 2;
  b.part('top', 'Top panel');
  if (g.top === 'overlay') b.obj('top', 'top', [W + 2 * g.oh, tt, D + g.oh], [0, topY, g.oh / 2]);
  else b.obj('top', 'top', [IW, t, D - 0.4], [0, topY, 0.2]);
  if (fixed.length) b.part('fixed', 'Fixed shelf', 'Fixed shelves');
  fixed.forEach((y, i) => b.obj(`fixed${i + 1}`, 'fixed', [IW, t, D - 0.4], [0, y, 0.2]));
  if (dividers.length) b.part('divider', 'Divider');
  dividers.forEach((d, i) => b.obj(`div${i + 1}`, 'divider', [t, d.y1 - d.y0, D - 0.4], [d.x, (d.y0 + d.y1) / 2, 0.2]));

  // joints on a side's inner face: bottom, fixed shelves, and the top when it sits between the sides
  const joints = [bottomY, ...fixed, ...(g.top === 'inset' ? [topY] : [])];
  const pins = (sx, ax) => b.H('pin', ax, joints.flatMap((y) => [[sx, y, zq], [sx, y, -zq]]));
  const dowels = (sx, ax) => b.H('dowel', ax, joints.flatMap((y) => [[sx, y, zq * 0.4], [sx, y, -zq * 0.4]]));
  const cams = (sx, ys) => b.H('cam', '+y', ys.flatMap((y) => [[sx, y + t / 2, zq], [sx, y + t / 2, -zq]]), { spin: true });
  const nPins = joints.length * 2;
  const pose0 = lying ? [-90, 0, 0] : undefined;
  const v = (az, el, more = {}) => ({ az, el: lying ? Math.max(el, 50) : el, ...more });

  b.step({
    caption: 'Side panel + pins',
    say: lying
      ? `Lay one side panel flat, holes facing up. Screw in ${say(nPins)} cam pins and tap in ${say(nPins)} wood dowels.`
      : `Stand one side panel on its edge, holes facing in. Screw in ${say(nPins)} cam pins by hand, then tap in ${say(nPins)} dowels.`,
    pose: pose0, add: ['sideL'], from: [-30, 0, 0], hardware: [pins(sxL, '+x'), dowels(sxL, '+x')], view: v(50, 25),
  });
  b.step({
    caption: 'Bottom on. Lock 2.',
    say: pick(slug, 'bottom', [
      'Push the bottom panel onto the low pins and dowels. Drop two cam locks into the round holes, arrows facing the pins, and turn them clockwise until they grab.',
      'Slide the bottom panel onto the pins at the low end. Two cam locks go in, arrow toward the pin, then a firm clockwise turn.',
    ]),
    add: ['bottom'], from: [35, 0, 0], hardware: [cams(sxL + 3.4, [bottomY])], view: v(35, 40),
  });
  if (fixed.length) b.step({
    caption: fixed.length > 1 ? `Fixed shelves. Lock ${fixed.length * 2}.` : 'Fixed shelf. Lock 2.',
    say: `The fixed shel${fixed.length > 1 ? 'ves hold' : 'f holds'} the ${noun} square, so ${fixed.length > 1 ? 'they go' : 'it goes'} in now. Slide onto the pins and lock with cam locks, clockwise.`,
    add: fixed.map((_, i) => `fixed${i + 1}`), from: [35, 0, 0], hardware: [cams(sxL + 3.4, fixed)], view: v(30, 40),
  });
  if (dividers.length) b.step({
    caption: dividers.length > 1 ? `${dividers.length} dividers in` : 'Divider in',
    say: `Tap dowels into the panel below, then press the divider${dividers.length > 1 ? 's' : ''} down onto them. Dowels go in the top end too, ready for what sits above.`,
    add: dividers.map((_, i) => `div${i + 1}`), from: [0, 30, 0],
    hardware: [b.H('dowel', '+y', dividers.flatMap((d) => [[d.x, d.y0, zq * 0.6], [d.x, d.y0, -zq * 0.6], [d.x, d.y1, zq * 0.6], [d.x, d.y1, -zq * 0.6]]))],
    view: v(30, 30),
  });
  if (g.top === 'inset') b.step({
    caption: 'Top on. Lock 2.',
    say: 'Same move at the other end. Push the top panel onto its pins, add two cam locks, and turn them clockwise.',
    add: ['top'], from: [35, 0, 0], hardware: [cams(sxL + 3.4, [topY])], view: v(25, 40),
  });
  const camsR = [bottomY, ...fixed, ...(g.top === 'inset' ? [topY] : [])];
  b.step({
    caption: `Side two. Lock ${camsR.length * 2}.`,
    say: `Pins and dowels go into the ends of the panels on this side too. ${big ? 'With a helper, lower' : 'Lower'} the second side onto all of them at once, then lock the last ${say(camsR.length * 2)} cam locks.`,
    add: ['sideR'], from: [30, 0, 0], hardware: [pins(sxR, '-x'), dowels(sxR, '-x'), cams(sxR - 3.4, camsR)],
    view: v(-40, 30), safety: big ? 'Two people for this one.' : undefined,
  });
  if (g.top === 'overlay') b.step({
    caption: 'Top on. Lock 4.',
    say: 'Tap four dowels into the top edges of the sides. Set the top panel on, good side up, then lock it from inside with four cam locks.',
    add: ['top'], from: [0, 30, 0],
    hardware: [
      b.H('dowel', '+y', [[-W / 2 + t / 2, sideY1, zq * 0.5], [-W / 2 + t / 2, sideY1, -zq * 0.5], [W / 2 - t / 2, sideY1, zq * 0.5], [W / 2 - t / 2, sideY1, -zq * 0.5]]),
      b.H('cam', '+x', [[sxL, sideY1 - 3.5, zq], [sxL, sideY1 - 3.5, -zq]], { spin: true }),
      b.H('cam', '-x', [[sxR, sideY1 - 3.5, zq], [sxR, sideY1 - 3.5, -zq]], { spin: true }),
    ],
    view: v(30, 35),
  });
  if (base.type === 'plinth' && bh > 0) {
    b.part('plinth', 'Plinth');
    const pz = D / 2 - 1.5 - t / 2;
    b.obj('plinth', 'plinth', [IW, bh, t], [0, bh / 2, pz]);
    b.step({
      caption: 'Plinth',
      say: 'Tap four dowels into the ends of the plinth board and press it in under the bottom panel, at the front.',
      add: ['plinth'], from: [0, 0, 30],
      hardware: [b.H('dowel', '+z', [[-IW / 2, bh * 0.3, pz], [-IW / 2, bh * 0.7, pz], [IW / 2, bh * 0.3, pz], [IW / 2, bh * 0.7, pz]])],
      view: v(25, 30, { tight: true, zoom: 0.85 }),
    });
  }

  const raisedBase = g.raised && bh > 0;
  const flip = back === 'nailed' || raisedBase;
  if (flip) {
    b.step({
      caption: 'Flip it face down',
      say: big ? `Roll the ${noun} over so it lies on its front. Ask your helper, and put the flattened box underneath to save the finish.` : `Tip the ${noun} onto its front, on a rug or the flattened box so nothing gets scratched.`,
      pose: lying ? [-90, 180, 0] : [90, 0, 0], view: { az: 60, el: 50 }, safety: big ? 'Two-person lift.' : undefined,
    });
  }
  if (back === 'nailed') {
    b.part('back', 'Back panel');
    const by0 = base.type === 'plinth' || base.type === 'none' ? 0.5 : sideY0;
    const by1 = sideY1 - 0.2;
    const len = by1 - by0;
    let cuts = [by0, by1];
    if (len > 150) {
      const mid = (by0 + by1) / 2;
      const near = fixed.length ? fixed.reduce((a, y) => (Math.abs(y - mid) < Math.abs(a - mid) ? y : a), fixed[0]) : mid;
      cuts = [by0, Math.abs(near - mid) < len * 0.2 ? near : mid, by1];
    }
    const bz = -D / 2 - 0.15, nz = -D / 2 - 0.3;
    for (let i = 0; i < cuts.length - 1; i++) {
      const a = cuts[i], c = cuts[i + 1];
      const id = cuts.length > 2 ? (i === 0 ? 'backLow' : 'backUp') : 'back';
      b.obj(id, 'back', [W - 0.4, c - a, 0.3], [0, (a + c) / 2, bz]);
      const ne = Math.max(3, Math.round((c - a) / 22));
      const nx = Math.max(2, Math.round(IW / 28));
      const rows = [a + 1.2, c - 1.2, ...fixed.filter((y) => y > a + 3 && y < c - 3)];
      b.step({
        caption: cuts.length > 2 ? (i === 0 ? 'Back, lower half' : 'Back, upper half') : 'Nail on the back',
        say: i === 0
          ? `Lay the back panel on, smooth side facing in. Line it up with ${cuts.length > 2 ? 'the bottom corners' : 'one corner'} and nail it along the edges, about every twenty centimeters. If the corners line up, the ${noun} is square.`
          : 'Second back piece, butted tight against the first. Same nailing pattern along every edge.',
        add: [id], from: [0, 0, -30],
        hardware: [
          { id: b.use('nail'), axis: '-z', line: [[-W / 2 + t / 2, a + 1, nz], [-W / 2 + t / 2, c - 1, nz]], n: ne },
          { id: 'nail', axis: '-z', line: [[W / 2 - t / 2, a + 1, nz], [W / 2 - t / 2, c - 1, nz]], n: ne },
          ...rows.map((y) => ({ id: 'nail', axis: '-z', line: [[-IW / 2 + 4, y, nz], [IW / 2 - 4, y, nz]], n: nx })),
        ],
        view: { az: 35, el: 55 },
      });
    }
  }
  if (raisedBase) {
    const s = base.leg ?? 4.5, inset = 1.5;
    const lx = W / 2 - inset - s / 2, lz = D / 2 - inset - s / 2;
    const corners = [[-lx, lz], [lx, lz], [lx, -lz], [-lx, -lz]];
    if (base.type === 'casters') {
      b.part('caster', 'Caster');
      corners.forEach(([x, z], i) => b.obj(`caster${i + 1}`, 'caster', [s, bh, s], [x, bh / 2, z], { shape: 'cyl' }));
      b.step({
        caption: '4 casters',
        say: 'While it lies on its front, press or screw a caster into each corner of the bottom. Two of them lock, so put those at the front.',
        add: corners.map((_, i) => `caster${i + 1}`), from: [0, -20, 0], twist: true, view: { az: 30, el: 50 },
      });
    } else {
      b.part('leg', 'Leg');
      corners.forEach(([x, z], i) => b.obj(`leg${i + 1}`, 'leg', [s, bh, s], [x, bh / 2, z]));
      const hw = [];
      if (base.type === 'apron') {
        b.part('apron', 'Front rail');
        b.obj('apron', 'apron', [W - 2 * (inset + s), bh * 0.6, 1.8], [0, bh * 0.7, lz + s / 2 - 0.9]);
        hw.push(b.H('screw', '-y', corners.map(([x, z]) => [x, sideY0, z]), { spin: true }));
      }
      b.step({
        caption: base.type === 'apron' ? 'Legs + front rail' : '4 legs on',
        say: base.type === 'apron'
          ? 'While it lies on its front, screw a leg into each corner of the bottom, then fit the decorative front rail between the two front legs.'
          : 'While it lies on its front, twist a leg into each corner of the bottom. Hand tight, then a quarter turn more.',
        add: [...corners.map((_, i) => `leg${i + 1}`), ...(base.type === 'apron' ? ['apron'] : [])], from: [0, -25, 0], twist: base.type !== 'apron',
        hardware: hw, view: { az: 30, el: 50 },
      });
    }
  }
  if (flip) {
    b.step({
      caption: 'Stand it up',
      say: big ? 'Stand it up together. Lift with your legs, not your back.' : 'Stand it back up on its feet. Nice, the box is done.',
      pose: lying ? [0, 360, 0] : [0, 0, 0], view: { az: 30, el: 18 }, safety: big ? 'Two-person lift.' : undefined,
    });
  } else if (lying) {
    b.step({ caption: 'Stand it up', say: 'Stand it upright. Lift with your legs, not your back.', pose: [0, 0, 0], view: { az: 30, el: 18 }, safety: big ? 'Two-person lift.' : undefined });
  }
  return { flipped: flip };
}

export function anchorStep(b, g, text) {
  const n = g.W >= 100 ? 2 : 1;
  const xs = n === 2 ? [-g.W / 4, g.W / 4] : [0];
  b.step({
    caption: 'Anchor it',
    say: text ?? pick(b.spec.slug, 'anchor', [
      'Last step, and the most important. Screw the wall bracket to the top at the back, then fix it to the wall with screws that suit your wall. Furniture can tip over. Always anchor it.',
      `Fix the ${n > 1 ? 'two wall brackets' : 'wall bracket'} to the back edge of the top, then into the wall with fixings made for your wall type. Tip-overs are real. Anchor it.`,
    ]),
    hardware: [b.H('anchor', '-z', xs.map((x) => [x, g.sideY1 - 3, -g.D / 2 - 0.3]))],
    view: { az: 150, el: 25, tight: true, zoom: 0.8 }, safety: 'Tip-over risk. Always anchor to the wall.',
  });
}

/** Spread n adjustable shelves across the open compartments between y0..y1 split by fixed shelves. */
export function shelfLevels(y0, y1, fixed, n) {
  const cuts = [y0, ...[...fixed].sort((a, z) => a - z), y1];
  const comps = cuts.slice(0, -1).map((a, i) => ({ a, c: cuts[i + 1], m: 0 }));
  for (let k = 0; k < n; k++) comps.reduce((best, c) => ((c.c - c.a) / (c.m + 1) > (best.c - best.a) / (best.m + 1) ? c : best)).m++;
  return comps.flatMap((c) => spread(c.a, c.c, c.m + 2).slice(1, -1));
}
