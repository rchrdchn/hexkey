// Archetypes added in brands batch 3: bunk and loft beds (Plank+Beam-style solid wood), screw-together cubby
// grids with non-square cells (ECR4Kids-style), L-shaped desks (fixed or electric, Eureka Ergonomic-style),
// tool-free panel beds on steel supports with ratchet straps (Floyd-style), and clamp-leg tables (Floyd-style).
// Steps are written in our own words from public facts (dimensions, materials, what is in the box); they are a
// demo, never a copy of any manual.
import { say, Say, pick, spread } from './lib.mjs';
import { anchorStep } from './carcass.mjs';

/** Bunk bed, or loft bed with `loft: true`. size = [L, W, H] (product-page order: length × width × height). */
export function bunkBed(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [L, W, H] = s.size;
  const loft = !!o.loft, post = o.post ?? 8.5, rh = o.railH ?? 14, rt = 3.5;
  const lowY = o.lowerY ?? 25, upY = o.upperY ?? H - 38; // top of each slat deck
  const guard = H - upY; // guard rail rises to the top of the posts
  const zq = W / 2 - post / 2, sx = L / 2 - post / 2, rl = L - 2 * post;
  const ladderRight = o.ladder !== 'left', lx = (ladderRight ? 1 : -1) * (L / 2 - post - 25);
  b.part('end', 'End frame'); b.part('rail', 'Side rail'); b.part('bar', 'Metal support bar'); b.part('slats', 'Slat roll');
  b.part('guard', 'Guard rail'); b.part('ladder', 'Ladder');
  const endBoxes = () => [
    { s: [post, H, post], p: [0, 0, -zq] }, { s: [post, H, post], p: [0, 0, zq] },
    { s: [rt, 10, W - 2 * post], p: [0, H / 2 - 6, 0] },
    { s: [rt, 18, W - 2 * post], p: [0, upY - H / 2 - 4, 0] },
    ...(loft ? [] : [{ s: [rt, 18, W - 2 * post], p: [0, lowY - H / 2 - 4, 0] }]),
  ];
  b.obj('endH', 'end', [post, H, W], [-sx, H / 2, 0], { boxes: endBoxes() });
  b.obj('endF', 'end', [post, H, W], [sx, H / 2, 0], { boxes: endBoxes() });
  const ry = (deck) => deck - rh / 2 + 2; // rail top sits a little above the slats
  const deckParts = (key, deck) => {
    b.obj(`rail${key}B`, 'rail', [rl, rh, rt], [0, ry(deck), -zq]);
    b.obj(`rail${key}F`, 'rail', [rl, rh, rt], [0, ry(deck), zq]);
    b.obj(`bar${key}`, 'bar', [rl, 3, 3], [0, deck - 3.5, 0]);
    const n = o.slats ?? Math.max(12, Math.round(L / 14));
    const sw = W - 2 * post - 1;
    b.obj(`slats${key}`, 'slats', [rl - 2, 1.8, sw], [0, deck - 0.9, 0], { boxes: spread(-rl / 2 + 5, rl / 2 - 5, n).map((x) => ({ s: [7, 1.8, sw], p: [x, 0, 0] })) });
    return n;
  };
  const nU = deckParts('U', upY);
  const nL = loft ? 0 : deckParts('L', lowY);
  const gy = upY + guard / 2;
  const glen = rl * 0.55, gx = (ladderRight ? -1 : 1) * (rl / 2 - glen / 2);
  const guardBoxes = (len) => [{ s: [len, 4, 2.5], p: [0, guard / 2 - 4, 0] }, { s: [len, 4, 2.5], p: [0, 0, 0] }, ...spread(-len / 2 + 2, len / 2 - 2, 2).map((x) => ({ s: [4, guard - 4, 2.5], p: [x, -2, 0] }))];
  b.obj('guardB', 'guard', [rl, guard - 4, 2.5], [0, gy - 2, -zq - 3], { boxes: guardBoxes(rl) });
  b.obj('guardF', 'guard', [glen, guard - 4, 2.5], [gx, gy - 2, zq + 3], { boxes: guardBoxes(glen) });
  const lh = upY + 20, rungs = Math.max(3, Math.round(upY / 28));
  b.obj('ladder', 'ladder', [40, lh, 4], [lx, lh / 2, zq + 6], { boxes: [
    { s: [4, lh, 4], p: [-18, 0, 0] }, { s: [4, lh, 4], p: [18, 0, 0] },
    ...spread(-lh / 2 + 25, upY - lh / 2, rungs).map((y) => ({ s: [32, 3, 4], p: [0, y, 0] })),
  ] });
  const bolts = (x, ax, ys) => b.H('bolt', ax, ys.flatMap((y) => [[x, y, -zq], [x, y, zq]]), { spin: true });
  const firstDeck = loft ? upY : lowY;
  b.step({ caption: 'Unbox + count', say: pick(slug, 'unbox', ['Open the boxes in the bedroom, the frame will not fit through a door once it is built. Lay every part on the flattened cartons and count the bolts against the parts list.', 'Build it in the room it will live in. Spread the parts out on the empty boxes and check the hardware bags against the parts list first.']), view: { az: 30, el: 30 }, safety: 'Two people for this one.' });
  b.step({ caption: loft ? 'Head end + rails' : 'Head end + low rails', say: `Stand the head end frame up and bolt the two ${loft ? 'side rails' : 'lower side rails'} to it, one at the back and one at the front. ${loft ? 'These carry the bed, so the slat ledges face in.' : 'Slat ledges face in.'} Hand tight for now.`, add: ['endH', ...(loft ? ['railUB', 'railUF'] : ['railLB', 'railLF'])], from: [0, 0, 40], hardware: [bolts(-sx + post / 2, '+x', [ry(firstDeck) - rh / 4, ry(firstDeck) + rh / 4])], view: { az: 35, el: 25 }, safety: 'Two people for this one.' });
  b.step({ caption: 'Foot end. 4 bolts.', say: 'Bring in the foot end frame and bolt the free ends of the rails to it. A helper holds the frame upright while you start each bolt.', add: ['endF'], from: [40, 0, 0], hardware: [bolts(sx - post / 2, '-x', [ry(firstDeck) - rh / 4, ry(firstDeck) + rh / 4])], view: { az: -35, el: 25 }, safety: 'Two people for this one.' });
  if (!loft) b.step({ caption: 'Upper rails. 8 bolts.', say: 'Now the top bunk. Lift each upper side rail into place between the end frames and bolt both ends. Use a step stool, not the bed, to reach.', add: ['railUB', 'railUF'], from: [0, 30, 0], hardware: [bolts(-sx + post / 2, '+x', [ry(upY)]), bolts(sx - post / 2, '-x', [ry(upY)]), b.C('bolt', 4)], view: { az: 30, el: 20 }, safety: 'Two people for this one.' });
  b.step({ caption: 'Square, then tighten', say: 'Measure corner to corner across the frame both ways. When the diagonals match it is square. Now tighten every bolt, firmly.', view: { az: 0, el: 75 } });
  b.step({ caption: loft ? 'Support bar' : '2 support bars', say: `Drop the metal support bar${loft ? '' : 's'} in down the middle, end frame to end frame, and screw ${loft ? 'it' : 'each one'} in. ${loft ? 'It keeps' : 'They keep'} the slats from sagging.`, add: loft ? ['barU'] : ['barL', 'barU'], from: [0, 25, 0], hardware: [b.C('screw', loft ? 2 : 4)], view: { az: 30, el: 50 } });
  if (!loft) b.step({ caption: `Lower slats (${nL})`, say: `Unroll the lower slat roll across the ledges and screw or clip the ends down. ${Say(nL)} slats, evenly spaced.`, add: ['slatsL'], from: [0, 30, 0], view: { az: 30, el: 45 } });
  b.step({ caption: `${loft ? 'Slats' : 'Upper slats'} (${nU})`, say: `${loft ? 'Unroll' : 'Same up top: unroll'} the slats across the ${loft ? '' : 'upper '}ledges and fix both ends. ${Say(nU)} slats. Check none of them can slide out.`, add: ['slatsU'], from: [0, 30, 0], view: { az: 30, el: 55 } });
  b.step({ caption: 'Guard rails on', say: `Bolt the long guard rail along the back of the ${loft ? 'bed' : 'top bunk'}, and the short one along the front, leaving the gap for the ladder. Both sides of the top get a rail, even against a wall.`, add: ['guardB', 'guardF'], from: [0, 25, 0], hardware: [b.C('bolt', 8)], view: { az: 25, el: 30 }, safety: 'Never leave off a guard rail.' });
  b.step({ caption: 'Ladder on', say: 'Hook the ladder over the front rail in the gap and bolt it on at the top. Its feet sit flat on the floor.', add: ['ladder'], from: [0, 0, 35], hardware: [b.H('bolt', '-z', [[lx - 18, ry(upY), zq + 4], [lx + 18, ry(upY), zq + 4]], { spin: true })], view: { az: ladderRight ? -20 : 20, el: 20 } });
  anchorStep(b, { W: L, D: W, sideY1: H }, `Push the bed against a wall and give it a firm shake: nothing should rock or creak. A tall bed is top-heavy, so anchor it to the wall with fixings for your wall. ${loft ? 'The top' : 'The top bunk'} is not for children under six.`);
}

/** Screw-together cubby grid with any cell size. size = [W, D, H]; options cols, rows, t (board), back, casters. */
export function cubby(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, D, H] = s.size;
  const cols = o.cols, rows = o.rows, t = o.t ?? 1.6;
  const cw = (W - (cols + 1) * t) / cols, ch = (H - (rows + 1) * t) / rows;
  const IW = W - 2 * t;
  const big = H >= 80 || W >= 110;
  b.part('side', 'Side panel'); b.part('end', 'Top and bottom'); if (rows > 1) b.part('long', 'Long shelf', 'Long shelves'); if (cols > 1) b.part('div', 'Divider');
  b.obj('sideL', 'side', [t, H, D], [-W / 2 + t / 2, H / 2, 0]);
  b.obj('sideR', 'side', [t, H, D], [W / 2 - t / 2, H / 2, 0]);
  b.obj('bottom', 'end', [IW, t, D], [0, t / 2, 0]);
  b.obj('top', 'end', [IW, t, D], [0, H - t / 2, 0]);
  const rowY = (k) => t + k * (ch + t);
  const divX = (j) => -IW / 2 + j * cw + (j - 1) * t + t / 2;
  for (let k = 0; k < rows - 1; k++) b.obj(`long${k + 1}`, 'long', [IW, t, D], [0, rowY(k) + ch + t / 2, 0]);
  for (let k = 0; k < rows; k++) for (let j = 1; j < cols; j++) b.obj(`div${k + 1}_${j}`, 'div', [t, ch, D - 0.5], [divX(j), rowY(k) + ch / 2, 0.25]);
  if (o.back) { b.part('back', 'Back panel'); b.obj('back', 'back', [W, H, 0.5], [0, H / 2, -D / 2 - 0.25]); }
  const zq = D / 2 - 3;
  const sideScrews = (x, ax, ys) => b.H('screw', ax, ys.flatMap((y) => [[x, y, zq], [x, y, -zq]]), { spin: true });
  const xL = -W / 2 + t, xR = W / 2 - t;
  const longYs = Array.from({ length: rows - 1 }, (_, k) => rowY(k) + ch + t / 2);
  b.step({ caption: 'Side + bottom', say: `Stand one side panel on its edge, holes facing in. Butt the bottom board against it and drive two screws through the side into the board. ${pick(slug, 'pre', ['Snug, not stripped.', 'Stop when the head is flush.'])}`, add: ['sideL', 'bottom'], from: [-30, 0, 0], hardware: [sideScrews(xL, '+x', [t / 2])], view: { az: 45, el: 25 } });
  if (rows > 1) b.step({ caption: rows > 2 ? `${rows - 1} long shelves` : 'Long shelf', say: `Screw ${rows > 2 ? `the ${say(rows - 1)} long shelves` : 'the long shelf'} to the same side, two screws each. The holes set the cubby height, so just follow them.`, add: longYs.map((_, k) => `long${k + 1}`), from: [35, 0, 0], hardware: [sideScrews(xL, '+x', longYs)], view: { az: 40, el: 30 } });
  if (cols > 1) b.step({ caption: `Dividers (${rows * (cols - 1)})`, say: `Tap a dowel into each divider hole, then press the ${say(rows * (cols - 1))} short dividers in between the boards, ${say(cols - 1)} per row. Push each one fully home so the cubbies stay square.`, add: Array.from({ length: rows }, (_, k) => Array.from({ length: cols - 1 }, (_, j) => `div${k + 1}_${j + 1}`)).flat(), from: [0, 0, 30], hardware: [b.H('dowel', '+y', Array.from({ length: rows }, (_, k) => Array.from({ length: cols - 1 }, (_, j) => [divX(j + 1), rowY(k), 0])).flat())], view: { az: 25, el: 30 } });
  b.step({ caption: 'Top on', say: 'Set the top board over the last row of dividers and screw it to the side panel.', add: ['top'], from: [0, 30, 0], hardware: [sideScrews(xL, '+x', [H - t / 2])], view: { az: 30, el: 40 } });
  b.step({ caption: 'Second side', say: `${big ? 'With a helper steadying it, ' : ''}line the second side up with every board end and screw it on, top to bottom. Then check each cubby is square before the screws bite.`, add: ['sideR'], from: [35, 0, 0], hardware: [sideScrews(xR, '-x', [t / 2, ...longYs, H - t / 2])], view: { az: -40, el: 25 }, safety: big ? 'Two people make this easier.' : undefined });
  if (o.back) b.step({ caption: 'Back panel', say: 'Lay it face down, square up the back panel with the edges and fix it all round. The back is what keeps the grid from racking sideways.', add: ['back'], from: [0, 0, -30], hardware: [b.C('nail', Math.round((W + H) / 10))], pose: [-90, 0, 0], view: { az: 0, el: 70 } });
  if (o.back) b.step({ caption: 'Stand it up', say: 'Stand it back up on its base.', pose: [0, 0, 0], view: { az: 30, el: 20 } });
  if (o.anchor) anchorStep(b, { W, D, sideY1: H }, 'Fit the anti-tip kit to the back of the top, then fix it to the wall with fixings for your wall. Kids climb cubbies. Always anchor it.');
  else b.step({ caption: 'Wobble test', say: 'Set it on a flat floor and press on each top corner. If it rocks, check the screws again. Fill the low cubbies with the heavy things.', view: { az: 25, el: 20 } });
}

/** L-shaped desk: main top + return top, fixed metal legs or electric (`electric: true`, two lifting columns).
 * size = [W, D, H]: W = main desk length, D = overall depth including the return, H = (lowest) height.
 * options: dw main-top depth (cm), rw return width (default dw), side ('left' | 'right' = where the return sits), tt. */
export function lDesk(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, D, H] = s.size;
  const tt = o.tt ?? 2.5, dw = o.dw ?? 58.4, rw = o.rw ?? dw, sx = o.side === 'right' ? 1 : -1;
  const ty = H - tt, mz = -D / 2 + dw / 2, rl = D - dw, rz = -D / 2 + dw + rl / 2, rx = sx * (W / 2 - rw / 2);
  const electric = !!o.electric;
  b.part('main', 'Main desk top'); b.part('ret', 'Return top'); b.part('plate', 'Joining plate'); b.part('beam', 'Frame beam');
  b.obj('main', 'main', [W, tt, dw], [0, H - tt / 2, mz]);
  b.obj('ret', 'ret', [rw, tt, rl], [rx, H - tt / 2, rz]);
  b.obj('plates', 'plate', [rw - 10, 0.4, 16], [rx, ty - 0.2, -D / 2 + dw], { boxes: spread(-(rw - 10) / 2 + 6, (rw - 10) / 2 - 6, 2).map((x) => ({ s: [10, 0.4, 16], p: [x, 0, 0] })) });
  const inset = 8;
  const beamMain = [W - 2 * inset, 5, 5], beamRet = [5, 5, rl - inset];
  b.obj('beamM', 'beam', beamMain, [0, ty - 2.5, mz]);
  b.obj('beamR', 'beam', beamRet, [rx, ty - 2.5, rz - inset / 2]);
  const seam = [[rx - (rw - 10) / 2 + 3, ty, -D / 2 + dw - 5], [rx - (rw - 10) / 2 + 3, ty, -D / 2 + dw + 5], [rx + (rw - 10) / 2 - 3, ty, -D / 2 + dw - 5], [rx + (rw - 10) / 2 - 3, ty, -D / 2 + dw + 5]];
  const far = -sx * (W / 2 - inset - 3.5);
  b.step({ caption: 'Tops face down', say: pick(slug, 'top', ['Lay both desk tops upside down on the flattened box or a rug, pushed together into an L. This desk is built upside down.', 'Flip both tops onto something soft, underside up, and butt them together into the L shape.']), add: ['main', 'ret'], pose: [180, 0, 0], from: [0, 30, 0], view: { az: 30, el: 55 } });
  b.step({ caption: 'Join the tops', say: `Screw the joining plates across the seam where the two tops meet. Check the edges are flush before you drive the last screw. The return goes on the ${o.side === 'right' ? 'right' : 'left'} here, but it can go either way.`, add: ['plates'], from: [0, -20, 0], hardware: [b.H('screw', '-y', seam, { spin: true }), b.C('screw', 4)], view: { az: 20, el: 65 } });
  b.step({ caption: 'Frame beams', say: `Lay the ${electric ? 'L-shaped frame' : 'frame beams'} along both tops and screw ${electric ? 'it' : 'them'} down through the pre-drilled holes. The frame is what ties the L together, so use every screw.`, add: ['beamM', 'beamR'], from: [0, -25, 0], hardware: [b.C('screw', electric ? 12 : 8)], view: { az: 30, el: 55 } });
  if (electric) {
    b.part('column', 'Lifting column'); b.part('foot', 'Foot'); b.part('ctrl', 'Control box'); b.part('keypad', 'Keypad');
    const cw = 7, cd = 5, fh = 4, ch = ty - 5 - fh;
    const colBoxes = [{ s: [cw, ch * 0.55, cd], p: [0, ch * 0.225, 0] }, { s: [cw - 1, ch * 0.5, cd - 1], p: [0, -ch * 0.25, 0] }];
    b.obj('colM', 'column', [cw, ch, cd], [far, fh + ch / 2, mz], { boxes: colBoxes });
    b.obj('colR', 'column', [cw, ch, cd], [rx, fh + ch / 2, D / 2 - inset - 3], { boxes: colBoxes });
    b.obj('footM', 'foot', [cw, fh, dw - 6], [far, fh / 2, mz]);
    b.obj('footR', 'foot', [rw - 6, fh, cw], [rx, fh / 2, D / 2 - inset - 3]);
    b.obj('ctrl', 'ctrl', [20, 4, 9], [0, ty - 2, -D / 2 + 12]);
    b.obj('keypad', 'keypad', [14, 2.5, 6], [-sx * W / 4, ty - 1.25, -D / 2 + dw - 3]);
    b.step({ caption: '2 lifting columns', say: 'Set one lifting column on the far end of the main top and one at the end of the return, cables toward the back, and bolt each one down.', add: ['colM', 'colR'], from: [0, -40, 0], hardware: [b.C('bolt', 8)], view: { az: 35, el: 40 }, safety: 'Columns are heavy. Lift with your legs.' });
    b.step({ caption: '2 feet', say: 'Bolt a foot across the end of each column. On the return the foot runs across it, so the desk stands steady both ways.', add: ['footM', 'footR'], from: [0, -30, 0], hardware: [b.C('bolt', 8)], view: { az: 30, el: 35 } });
    b.step({ caption: 'Control box + keypad', say: 'Screw the control box under the back of the main top and the keypad under the front edge. Plug both motor cables and the keypad into the box, then clip the cables up out of the way.', add: ['ctrl', 'keypad'], from: [0, -20, 0], hardware: [b.C('screw', 6)], view: { az: 160, el: 50 } });
  } else {
    b.part('leg', 'Leg');
    const lh = ty - 5, legs = [[far, -D / 2 + inset], [far, -D / 2 + dw - inset], [sx * (W / 2 - inset), D / 2 - inset], [sx * (W / 2 - rw + inset), D / 2 - inset]];
    legs.forEach(([x, z], i) => b.obj(`leg${i + 1}`, 'leg', [5, lh, 5], [x, lh / 2, z]));
    b.step({ caption: '4 legs on', say: 'Bolt a leg into each corner bracket: two at the far end of the main top and two at the end of the return. Snug them, then go round once more and tighten.', add: ['leg1', 'leg2', 'leg3', 'leg4'], from: [0, -35, 0], hardware: [b.H('bolt', '-y', legs.map(([x, z]) => [x, ty - 5, z]), { spin: true }), b.C('bolt', 4)], view: { az: 35, el: 40 } });
  }
  b.step({ caption: 'Flip it over', say: 'With a helper, lift the whole desk and turn it onto its feet. Lift it clear of the floor, do not pivot it on one leg.', pose: [360, 0, 0], view: { az: 30, el: 22 }, safety: 'Two-person lift.' });
  if (electric) b.step({ caption: 'Power on + reset', say: 'Plug it in and run the first-time reset from your manual, usually holding the down button until the desk bottoms out. Then try up and down with nothing on top, and watch both columns move together.', view: { az: 25, el: 15 } });
  else b.step({ caption: 'Level it', say: 'Push it into the corner and press on each end. If it rocks, twist the adjustable feet until all of them touch the floor.', view: { az: 25, el: 15 } });
}

/** Tool-free panel bed: steel supports in a grid, wood panels laid on top, ratchet straps, optional headboard.
 * size = [W, L, H] (H = headboard top, or frame height without one). options: cols, rows, frame (frame height cm), headboard. */
export function panelBed(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, L, Hs] = s.size;
  const cols = o.cols ?? 3, rows = o.rows ?? 2, FH = o.frame ?? 19, pt = 3.8, sh = FH - pt, hb = !!o.headboard;
  const pw = W / cols, pl = L / rows;
  b.part('support', 'Steel support'); b.part('panel', 'Wood panel'); b.part('strap', 'Ratchet strap');
  const xs = spread(-W / 2 + 8, W / 2 - 8, cols + 1), zs = spread(-L / 2 + 8, L / 2 - 8, rows + 1);
  b.obj('supports', 'support', [W - 2, sh, L - 2], [0, sh / 2, 0], { boxes: xs.flatMap((x) => zs.map((z) => ({ s: [16, sh, 16], p: [x, 0, z] }))) });
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) b.obj(`p${r + 1}_${c + 1}`, 'panel', [pw - 0.4, pt, pl - 0.4], [-W / 2 + pw * (c + 0.5), sh + pt / 2, -L / 2 + pl * (r + 0.5)]);
  b.obj('straps', 'strap', [W + 1, FH, L + 1], [0, FH / 2, 0], { boxes: zs.map((z) => ({ s: [W + 1, 0.4, 3], p: [0, FH / 2 - 0.2, z] })).concat(zs.map((z) => ({ s: [W + 1, 0.4, 3], p: [0, -FH / 2 + 0.2, z] }))) });
  const panelsIn = (r) => Array.from({ length: cols }, (_, c) => `p${r + 1}_${c + 1}`);
  b.step({ caption: 'No tools needed', say: pick(slug, 'unbox', ['Clear the floor where the bed will go. This frame goes together with no tools and no screws: just supports, panels and straps.', 'Pick the spot and clear it. There are no screws in this bed, so put the screwdriver away.']), view: { az: 30, el: 40 } });
  b.step({ caption: `Set out ${(cols + 1) * (rows + 1)} supports`, say: `Stand the steel supports on the floor in a grid, ${say(cols + 1)} across and ${say(rows + 1)} from head to foot. Use a panel as a spacer so the gaps come out right.`, add: ['supports'], from: [0, 25, 0], view: { az: 30, el: 55 } });
  for (let r = 0; r < rows; r++) b.step({ caption: r === 0 ? 'Head-end panels' : rows > 2 && r < rows - 1 ? `Panel row ${r + 1}` : 'Foot-end panels', say: r === 0 ? `Lay the first ${say(cols)} panels across the head-end supports, good side up, edges tight together.` : 'Next row of panels, butted tight against the first. Nudge the supports under the joints if they have drifted.', add: panelsIn(r), from: [0, 30, 0], view: { az: 30, el: 50 }, safety: r === 0 && W >= 140 ? 'Two people make this easier.' : undefined });
  b.step({ caption: 'Ratchet the straps', say: `Run each ratchet strap round the supports and panels, ${say(rows + 1)} in all, and crank them until the panels pull tight with no gaps. Snug is enough, the straps only stop things shifting.`, add: ['straps'], from: [0, 20, 0], view: { az: 25, el: 35 } });
  if (hb) {
    b.part('head', 'Headboard panel');
    b.obj('head', 'head', [W, Hs - 2, pt], [0, (Hs - 2) / 2 + 2, -L / 2 - pt / 2 - 1]);
    b.step({ caption: 'Headboard up', say: 'Stand the headboard panel at the head end and seat it in its brackets on the end supports. Lean it back gently until it settles.', add: ['head'], from: [0, 0, -40], view: { az: 150, el: 25 }, safety: 'Two people for this one.' });
  }
  b.step({ caption: 'Mattress on', say: 'Push the bed into place, press on each corner to check nothing rocks, and lay the mattress on. No box spring needed.', view: { az: 25, el: 25 } });
}

/** Table on clamp-on legs: a flat top and four legs that clamp onto its edge. size = [W, D, H]. options: tt, legW. */
export function clampTable(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, D, H] = s.size;
  const tt = o.tt ?? 3.8, lw = o.legW ?? 5, lh = H - tt;
  b.part('top', 'Table top'); b.part('leg', 'Clamp leg');
  b.obj('top', 'top', [W, tt, D], [0, H - tt / 2, 0]);
  const cs = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
  const lx = W / 2 - 4, lz = D / 2 - 4;
  cs.forEach(([a, c], i) => b.obj(`leg${i + 1}`, 'leg', [lw, H, lw], [a * lx, H / 2, c * lz], { boxes: [
    { s: [lw, lh - 1, 1.2], p: [0, -(tt + 1) / 2, 0] }, { s: [lw, 0.6, 8], p: [0, H / 2 - 0.3, -c * 3] }, { s: [lw, 1, 8], p: [0, H / 2 - tt - 0.5, -c * 3] },
  ] }));
  b.use('bolt', { label: 'Clamp screw' });
  const scr = (i) => cs.slice(i, i + 2).map(([a, c]) => [a * lx, H - tt - 1, c * (lz - 3)]);
  b.step({ caption: 'Top face down', say: pick(slug, 'top', ['Lay the top upside down on a rug or the flattened box, so the good side stays clean.', 'Flip the top onto something soft, underside up.']), add: ['top'], pose: [180, 0, 0], from: [0, 30, 0], view: { az: 30, el: 50 } });
  b.step({ caption: 'Clamp 2 legs', say: 'Slide the clamp of a leg over one corner until it sits square against both edges, then tighten its screw from underneath. Same on the next corner.', add: ['leg1', 'leg2'], from: [0, -25, 0], hardware: [b.H('bolt', '-y', scr(0), { spin: true })], view: { az: 30, el: 45 } });
  b.step({ caption: 'Last 2 legs', say: 'Clamp the last two legs on the other corners. Snug every screw, but stop before it marks the wood.', add: ['leg3', 'leg4'], from: [0, -25, 0], hardware: [b.H('bolt', '-y', scr(2), { spin: true })], view: { az: -30, el: 45 } });
  b.step({ caption: 'Flip it over', say: 'Turn it right side up. Lift it clear, do not lever it on two legs. If it rocks, loosen one clamp, push the leg square and tighten again.', pose: [360, 0, 0], view: { az: 30, el: 20 } });
}
