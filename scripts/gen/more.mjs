// Archetypes added for non-IKEA brands: metal/wood platform beds (Zinus-style), electric standing desks
// (FlexiSpot/UPLIFT-style frames) and screw-together frame shelves (ladder/etagere bookcases).
// Steps are written in our own words from public facts; they are a demo, never a copy of any manual.
import { r, say, Say, pick, spread } from './lib.mjs';

/** Platform bed: legs + side rails + end rails + center beam + slats, optional headboard. size = [W, L, H] (H = headboard top, or frame height without one). */
export function platformBed(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, L, Hs] = s.size;
  const FH = o.height ?? 35, rh = o.railH ?? 8, metal = o.material !== 'wood';
  const hb = o.headboard !== false, HB = hb ? Hs : FH;
  const legS = metal ? 3 : 5, ry = FH - rh / 2, rw = metal ? 3 : 4;
  b.part('rail', 'Side rail'); b.part('end', 'End rail'); b.part('leg', 'Leg'); b.part('beam', 'Center beam'); b.part('slats', metal ? 'Slat set' : 'Slat roll');
  const rx = W / 2 - rw / 2, ez = L / 2 - rw / 2;
  const nSide = o.sideLegs ?? (L > 190 ? 3 : 2);
  const lz = spread(-L / 2 + legS, L / 2 - legS, nSide);
  const legBox = (z) => ({ s: [legS, FH - rh, legS], p: [0, -(rh) / 2, z], shape: metal ? 'box' : 'box' });
  b.obj('railL', 'rail', [rw, FH, L], [-rx, FH / 2, 0], { boxes: [{ s: [rw, rh, L], p: [0, FH / 2 - rh / 2, 0] }, ...lz.map((z) => ({ s: [legS, FH - rh, legS], p: [0, -rh / 2, z] }))] });
  b.obj('railR', 'rail', [rw, FH, L], [rx, FH / 2, 0], { boxes: [{ s: [rw, rh, L], p: [0, FH / 2 - rh / 2, 0] }, ...lz.map((z) => ({ s: [legS, FH - rh, legS], p: [0, -rh / 2, z] }))] });
  void legBox;
  b.obj('endH', 'end', [W - 2 * rw, rh, rw], [0, ry, -ez]);
  b.obj('endF', 'end', [W - 2 * rw, rh, rw], [0, ry, ez]);
  const nb = o.centerLegs ?? 3;
  b.obj('beam', 'beam', [4, FH, L - 2 * rw], [0, FH / 2, 0], { boxes: [{ s: [4, rh * 0.7, L - 2 * rw], p: [0, FH / 2 - rh * 0.35, 0] }, ...spread(-L / 2 + 30, L / 2 - 30, nb).map((z) => ({ s: [legS, FH - rh * 0.7, legS], p: [0, -rh * 0.35, z], shape: 'cyl' }))] });
  const n = o.slats ?? (metal ? 14 : 20), sw = W - 2 * rw - 1;
  const zs = spread(-L / 2 + rw + 4, L / 2 - rw - 4, n);
  b.obj('slats', 'slats', [sw, 1.8, L - 2 * rw - 2], [0, FH + 0.9, 0], { boxes: zs.map((z) => ({ s: [sw, 1.8, metal ? 7 : 6.5], p: [0, 0, z] })) });
  if (hb) {
    b.part('head', 'Headboard');
    const ph = HB - FH + 10;
    b.obj('head', 'head', [W, HB, 4], [0, HB / 2, -L / 2 - 2], { boxes: [{ s: [W, ph, 3], p: [0, HB / 2 - ph / 2, 0] }, { s: [5, HB, 4], p: [-W / 2 + 2.5, 0, 0] }, { s: [5, HB, 4], p: [W / 2 - 2.5, 0, 0] }] });
  }
  const corner = (z, ax) => b.H('bolt', ax, [[-rx, ry, z], [rx, ry, z]], { spin: true });
  b.step({ caption: 'Unbox in the bedroom', say: pick(slug, 'unbox', ['Open the box in the room the bed will live in. Lay every part out on the flattened carton and match the hardware to the parts list.', 'Build it where it will stay. Spread the parts on the empty box and count the bolts against the parts list before you start.']), view: { az: 30, el: 35 }, safety: 'Two people for this one.' });
  b.step({ caption: metal ? 'Side rails, legs down' : 'Legs onto side rails', say: metal ? 'Lay out both side rails and fold or screw their legs down so they stand on their own.' : 'Screw the legs onto both side rails, hand tight for now.', add: ['railL', 'railR'], from: [0, 30, 0], hardware: metal ? [] : [b.C('bolt', nSide * 2)], view: { az: 35, el: 35 } });
  b.step({ caption: 'Head + foot rails', say: 'Join the head rail and the foot rail between the side rails, one bolt per corner to start. Leave them a little loose until the frame is square.', add: ['endH', 'endF'], from: [0, 0, 40], hardware: [corner(-ez, '+z'), corner(ez, '-z')], view: { az: 40, el: 40 } });
  b.step({ caption: 'Center beam + legs', say: `Drop the center beam in from head to foot and stand up its ${say(nb)} support legs. The middle of a queen carries the most weight, so make sure every foot touches the floor.`, add: ['beam'], from: [0, 30, 0], hardware: [b.C('bolt', 2)], view: { az: 30, el: 55 } });
  b.step({ caption: 'Square, then tighten', say: 'Measure corner to corner both ways. When the diagonals match, the frame is square. Now tighten every bolt.', view: { az: 0, el: 80 } });
  if (hb) b.step({ caption: 'Headboard on', say: 'Stand the headboard at the head end and bolt it to the frame, two bolts each side. A helper holds it upright while you thread the first bolt.', add: ['head'], from: [0, 0, -40], hardware: [b.H('bolt', '+z', [[-rx, ry - 2, -L / 2], [-rx, ry + 2, -L / 2], [rx, ry - 2, -L / 2], [rx, ry + 2, -L / 2]], { spin: true })], view: { az: 150, el: 25 }, safety: 'Two people for this one.' });
  b.step({ caption: `Lay ${n} slats`, say: metal ? `Lay the slats across the frame and drop them into their slots or straps, evenly spaced. ${Say(n)} of them, no gaps wider than your manual allows.` : `Unroll the slats across the frame and screw or clip each end down. ${Say(n)} slats, evenly spaced.`, add: ['slats'], from: [0, 35, 0], view: { az: 30, el: 55 } });
  b.step({ caption: 'Mattress on', say: 'Push the bed into place, check it does not rock, and lay the mattress on. No box spring needed on a platform bed.', view: { az: 25, el: 25 } });
}

/** Electric standing desk frame + top, built upside down. size = [W, D, H] (H = lowest sitting height used for the model). */
export function standingDesk(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, D, H] = s.size;
  const tt = o.tt ?? 2.5, inset = o.inset ?? 10, cw = 7, cd = 5, fh = 4;
  const fx = W / 2 - inset - cw / 2, ty = H - tt;
  b.part('top', 'Desk top'); b.part('beam', 'Crossbeam'); b.part('bracket', 'Side bracket'); b.part('column', 'Lifting column'); b.part('foot', 'Foot'); b.part('ctrl', 'Control box'); b.part('keypad', 'Keypad'); b.part('tray', 'Cable tray');
  b.obj('top', 'top', [W, tt, D], [0, H - tt / 2, 0]);
  b.obj('brL', 'bracket', [cw, 2.5, D - 12], [-fx, ty - 1.25, 0]);
  b.obj('brR', 'bracket', [cw, 2.5, D - 12], [fx, ty - 1.25, 0]);
  b.obj('beam', 'beam', [2 * fx - cw, 5, 5], [0, ty - 4, -2]);
  const ch = ty - 2.5 - fh;
  b.obj('colL', 'column', [cw, ch, cd], [-fx, fh + ch / 2, -2], { boxes: [{ s: [cw, ch * 0.55, cd], p: [0, ch * 0.225, 0] }, { s: [cw - 1, ch * 0.5, cd - 1], p: [0, -ch * 0.25, 0] }] });
  b.obj('colR', 'column', [cw, ch, cd], [fx, fh + ch / 2, -2], { boxes: [{ s: [cw, ch * 0.55, cd], p: [0, ch * 0.225, 0] }, { s: [cw - 1, ch * 0.5, cd - 1], p: [0, -ch * 0.25, 0] }] });
  b.obj('footL', 'foot', [cw, fh, D - 6], [-fx, fh / 2, 0]);
  b.obj('footR', 'foot', [cw, fh, D - 6], [fx, fh / 2, 0]);
  b.obj('ctrl', 'ctrl', [20, 4, 9], [0, ty - 2, -D / 2 + 14]);
  b.obj('keypad', 'keypad', [14, 2.5, 6], [W / 2 - inset - 25, ty - 1.25, D / 2 - 3]);
  b.obj('tray', 'tray', [W * 0.5, 6, 8], [0, ty - 3, -D / 2 + 5]);
  const scr = (x) => [[x, ty, D / 2 - 14], [x, ty, -D / 2 + 14]];
  b.step({ caption: 'Top face down', say: pick(slug, 'top', ['Lay the desk top upside down on the flattened box or a rug, so the good side stays scratch-free.', 'Flip the top onto something soft, underside up. This whole desk is built upside down.']), add: ['top'], pose: [180, 0, 0], from: [0, 30, 0], view: { az: 30, el: 50 } });
  b.step({ caption: 'Crossbeam + brackets', say: 'Slide the side brackets onto the ends of the crossbeam, set it in the middle of the top, and stretch it out until the brackets sit near the ends. Screw both brackets into the top.', add: ['beam', 'brL', 'brR'], from: [0, -25, 0], hardware: [b.H('screw', '-y', [...scr(-fx), ...scr(fx)], { spin: true }), b.C('screw', 4)], view: { az: 30, el: 55 } });
  b.step({ caption: '2 lifting columns', say: 'Set each lifting column onto its bracket, motor end against the beam, and bolt it down. Cables face the back.', add: ['colL', 'colR'], from: [0, -40, 0], hardware: [b.C('bolt', 8)], view: { az: 35, el: 40 }, safety: 'Columns are heavy. Lift with your legs.' });
  b.step({ caption: '2 feet', say: 'Bolt a foot across the end of each column, longer side toward the front. Check both feet point the same way.', add: ['footL', 'footR'], from: [0, -30, 0], hardware: [b.C('bolt', 8)], view: { az: 30, el: 35 } });
  b.step({ caption: 'Control box + keypad', say: 'Screw the control box under the top near the back, and the keypad under the front edge on the side you prefer.', add: ['ctrl', 'keypad'], from: [0, -20, 0], hardware: [b.C('screw', 6)], view: { az: 20, el: 60 } });
  b.step({ caption: 'Plug in the cables', say: 'Plug both motor cables and the keypad cable into the control box, then tuck everything into the cable tray and screw the tray on. Do not plug into the wall yet.', add: ['tray'], from: [0, -20, 0], hardware: [b.C('screw', 4)], view: { az: 160, el: 50 } });
  b.step({ caption: 'Flip it over', say: 'With a helper, lift the desk and turn it onto its feet. Lift it clear, do not pivot it on one leg.', pose: [360, 0, 0], view: { az: 30, el: 20 }, safety: 'Two-person lift.' });
  b.step({ caption: 'Power on + reset', say: 'Plug it in, then run the first-time reset from your manual, usually holding the down button until the desk bottoms out. Test up and down with nothing on top.', view: { az: 25, el: 15 } });
}

/** Screw-together frame shelf (metal or wood side frames, fixed shelves). size = [W, D, H]. */
export function frameShelf(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, D, H] = s.size;
  const n = o.shelves ?? 5, st = o.st ?? 1.8, up = o.post ?? 2.5, lean = o.lean ?? 0;
  const sx = W / 2 - up / 2;
  b.part('frame', 'Side frame'); b.part('shelf', 'Shelf', 'Shelves');
  const sideBoxes = [{ s: [up, H, up], p: [0, 0, -D / 2 + up / 2] }, { s: [up, H, up], p: [0, 0, D / 2 - up / 2] }];
  b.obj('sideL', 'frame', [up, H, D], [-sx, H / 2, 0], { boxes: sideBoxes });
  b.obj('sideR', 'frame', [up, H, D], [sx, H / 2, 0], { boxes: sideBoxes });
  const ys = spread(o.bottom ?? 8, H - st, n).map(r);
  // leaning ladders get shallower toward the top
  ys.forEach((y, i) => { const d = lean ? D - (D - lean) * (i / Math.max(1, n - 1)) : D - 0.5; b.obj(`shelf${i + 1}`, 'shelf', [W - 2 * up, st, d], [0, y + st / 2, (D - d) / 2 * (lean ? -1 : 0)]); });
  const scr = (list) => [b.H('screw', '+x', list.flatMap((y) => [[-sx + up / 2, y + st / 2, D / 4], [-sx + up / 2, y + st / 2, -D / 4]]), { spin: true }), b.H('screw', '-x', list.flatMap((y) => [[sx - up / 2, y + st / 2, D / 4], [sx - up / 2, y + st / 2, -D / 4]]), { spin: true })];
  b.step({ caption: 'Lay out the frames', say: pick(slug, 'lay', ['Lay both side frames on the floor, inside faces up, and sort the shelves from biggest to smallest if they differ.', 'Put the two side frames on a rug, holes facing in. Match each shelf to its spot using the hole marks.']), add: ['sideL'], from: [-30, 0, 0], view: { az: 40, el: 30 } });
  b.step({ caption: 'Bottom + top shelf', say: 'Screw the bottom shelf and the top shelf to the first frame. Hand tight for now so the frame can still settle.', add: ['shelf1', `shelf${n}`], from: [30, 0, 0], hardware: [scr([ys[0], ys[n - 1]])[0]], view: { az: 35, el: 25 } });
  b.step({ caption: 'Second frame', say: 'Bring in the second frame and screw it to the same two shelves. Now it stands as a box.', add: ['sideR'], from: [30, 0, 0], hardware: [scr([ys[0], ys[n - 1]])[1]], view: { az: -35, el: 25 }, safety: 'Two people make this easier.' });
  if (n > 2) b.step({ caption: `${n - 2} middle shelves`, say: 'Fit the middle shelves one by one, two screws each side.', add: ys.slice(1, -1).map((_, i) => `shelf${i + 2}`), from: [0, 0, 35], hardware: scr(ys.slice(1, -1)), view: { az: 25, el: 20 } });
  b.step({ caption: 'Stand up, tighten', say: 'Stand it upright on a flat floor, check it does not rock, and tighten every screw. Adjust the levelling feet if it has them.', view: { az: 25, el: 15 } });
  b.step({ caption: 'Anchor it', say: 'Fix the top to the wall with the anti-tip strap or bracket and screws that suit your wall. Tall shelves always get anchored.', hardware: [b.H('anchor', '-z', [[0, H - 4, -D / 2]])], view: { az: 150, el: 25, tight: true, zoom: 0.8 }, safety: 'Tip-over risk. Always anchor to the wall.' });
}
