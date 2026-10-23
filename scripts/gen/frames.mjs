// Archetypes that aren't boxes: tables, desks, wall shelves, beds, cribs, ladder shelving, step stools.
import { r, say, Say, pick, spread } from './lib.mjs';

/** Screw-in-leg table, built upside down (LACK, LAGKAPTEN/ADILS). */
export function table(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, D, H] = s.size;
  const tt = o.tt ?? 5, ls = o.leg?.s ?? 5, inset = o.leg?.inset ?? 0.5, round = o.leg?.shape === 'round';
  const lx = W / 2 - inset - ls / 2, lz = D / 2 - inset - ls / 2;
  const corners = [[-lx, lz], [lx, lz], [lx, -lz], [-lx, -lz]];
  const lh = H - tt;
  b.part('top', o.topLabel ?? 'Table top');
  b.obj('top', 'top', [W, tt, D], [0, H - tt / 2, 0]);
  b.part('leg', 'Leg');
  corners.forEach(([x, z], i) => b.obj(`leg${i + 1}`, 'leg', [ls, lh, ls], [x, lh / 2, z], round ? { shape: 'cyl' } : {}));
  const plates = o.mount === 'plate';
  if (plates) { b.part('plate', 'Mounting plate'); corners.forEach(([x, z], i) => b.obj(`plate${i + 1}`, 'plate', [9, 0.4, 9], [x, lh - 0.2, z])); }
  b.step({
    caption: 'Top face down',
    say: pick(slug, 'top', ['Lay the top upside down on a rug or the flattened box, so the good side stays scratch-free.', 'Flip the top onto something soft, underside up. Pre-drilled holes should be facing you.']),
    pose: [180, 0, 0], add: ['top'], from: [0, 30, 0], view: { az: 30, el: 50 },
  });
  if (plates) b.step({
    caption: '4 mounting plates',
    say: 'Screw a mounting plate onto each corner, four screws each, using the pre-drilled holes. These are what the legs twist into.',
    add: corners.map((_, i) => `plate${i + 1}`), from: [0, -20, 0],
    hardware: [b.H('screw', '-y', corners.flatMap(([x, z]) => [[x - 3, lh, z - 3], [x + 3, lh, z - 3], [x + 3, lh, z + 3], [x - 3, lh, z + 3]]), { spin: true })],
    view: { az: 30, el: 55 },
  });
  else b.step({
    caption: '4 double screws',
    say: 'Twist a double-ended screw into each corner hole by hand, halfway in. The other half is for the leg.',
    hardware: [b.H('dbolt', '-y', corners.map(([x, z]) => [x, lh, z]), { spin: true })],
    view: { az: 30, el: 55, tight: true, zoom: 0.9 },
  });
  b.step({ caption: '2 legs on', say: 'Twist on the first two legs, clockwise, until they are snug and straight. Hand tight is right.', add: ['leg1', 'leg2'], from: [0, -30, 0], twist: true, view: { az: 30, el: 45 } });
  b.step({ caption: 'Last 2 legs', say: pick(slug, 'legs2', ['Same with the last two legs.', 'And the last two. Check they all stand straight.']), add: ['leg3', 'leg4'], from: [0, -30, 0], twist: true, view: { az: -30, el: 45 } });
  if (o.bars) {
    // side support bars between the front and back legs (metal-frame desks)
    const by = o.bars;
    b.part('bar', 'Support bar');
    b.obj('barL', 'bar', [2.5, 2.5, 2 * lz - ls], [-lx, by, 0]);
    b.obj('barR', 'bar', [2.5, 2.5, 2 * lz - ls], [lx, by, 0]);
    b.step({ caption: '2 support bars', say: 'Screw a support bar between the front and back leg on each side. They stop the desk swaying when you type.', add: ['barL', 'barR'], from: [0, -25, 0], hardware: [b.H('screw', '+z', [[-lx, by, -lz + ls / 2], [lx, by, -lz + ls / 2]], { spin: true }), b.H('screw', '-z', [[-lx, by, lz - ls / 2], [lx, by, lz - ls / 2]], { spin: true })], view: { az: 30, el: 35 } });
  }
  if (o.shelf) {
    const sy = o.shelf.y, st = o.shelf.t ?? 1.6;
    const sw = W - 2 * (inset + ls), sd = D - 2 * inset - 0.6;
    b.part('shelf', 'Shelf');
    b.obj('shelf', 'shelf', [sw, st, sd], [0, sy, 0]);
    b.step({
      caption: 'Shelf. 8 screws.',
      say: 'Slide the lower shelf between the legs and screw it in, two screws through each leg. Keep the shelf level as you go.',
      add: ['shelf'], from: [0, 0, 40],
      hardware: [b.H('screw', '+x', [[-lx + ls / 2, sy, lz - 1.2], [-lx + ls / 2, sy, -lz + 1.2]], { spin: true }), b.H('screw', '-x', [[lx - ls / 2, sy, lz - 1.2], [lx - ls / 2, sy, -lz + 1.2]], { spin: true }), b.C('screw', 4)],
      view: { az: 30, el: 40 },
    });
  }
  b.step({
    caption: 'Flip it over',
    say: W >= 110 ? 'With a helper, turn it right side up. Lift it, don\'t pivot on the legs, or they can snap off.' : 'Turn it right side up. Lift it, don\'t drag it on two legs.',
    pose: [360, 0, 0], view: { az: 30, el: 20 }, safety: W >= 110 ? 'Two-person lift.' : undefined,
  });
  if (o.feet) b.step({ caption: 'Level the feet', say: 'Rock the table gently. If it wobbles, twist the adjustable foot on the short leg until it sits flat.', view: { az: 20, el: 10, tight: true } });
}

/** Four legs, four rails, a top (INGO-style). */
export function apronTable(b) {
  const s = b.spec, o = b.o;
  const [W, D, H] = s.size;
  const tt = o.tt ?? 2.8, ls = o.leg ?? 5.5, ah = o.apron ?? 8, at = 2;
  const lh = H - tt;
  const lx = W / 2 - 6 - ls / 2, lz = D / 2 - 6 - ls / 2;
  b.part('top', 'Table top'); b.part('leg', 'Leg'); b.part('long', 'Long rail'); b.part('short', 'Short rail');
  b.obj('top', 'top', [W, tt, D], [0, H - tt / 2, 0]);
  [[-lx, lz], [lx, lz], [lx, -lz], [-lx, -lz]].forEach(([x, z], i) => b.obj(`leg${i + 1}`, 'leg', [ls, lh, ls], [x, lh / 2, z]));
  const ay = lh - ah / 2;
  b.obj('longF', 'long', [2 * lx - ls, ah, at], [0, ay, lz]);
  b.obj('longB', 'long', [2 * lx - ls, ah, at], [0, ay, -lz]);
  b.obj('shortL', 'short', [at, ah, 2 * lz - ls], [-lx, ay, 0]);
  b.obj('shortR', 'short', [at, ah, 2 * lz - ls], [lx, ay, 0]);
  b.step({ caption: 'Top face down', say: 'Put the table top upside down on the flattened box. You will build the frame right on top of it.', pose: [180, 0, 0], add: ['top'], from: [0, 30, 0], view: { az: 30, el: 50 } });
  b.step({
    caption: 'Legs + long rails',
    say: 'Bolt a long rail between two legs, then do the same with the other pair. Two bolts at each joint. Leave them a little loose for now.',
    add: ['leg1', 'leg2', 'leg3', 'leg4', 'longF', 'longB'], from: [0, -30, 0],
    hardware: [b.H('bolt', '+x', [[-lx + ls / 2, ay - 2, lz], [-lx + ls / 2, ay + 2, lz], [-lx + ls / 2, ay - 2, -lz], [-lx + ls / 2, ay + 2, -lz]], { spin: true }), b.H('bolt', '-x', [[lx - ls / 2, ay - 2, lz], [lx - ls / 2, ay + 2, lz], [lx - ls / 2, ay - 2, -lz], [lx - ls / 2, ay + 2, -lz]], { spin: true })],
    view: { az: 30, el: 45 },
  });
  b.step({
    caption: 'Short rails join them',
    say: 'Now join the two halves with the short rails, two bolts per joint. Square up the frame, then tighten every bolt.',
    add: ['shortL', 'shortR'], from: [0, -30, 0],
    hardware: [b.H('bolt', '+z', [[-lx, ay - 2, lz - ls / 2], [-lx, ay + 2, lz - ls / 2], [lx, ay - 2, lz - ls / 2], [lx, ay + 2, lz - ls / 2]], { spin: true }), b.H('bolt', '-z', [[-lx, ay - 2, -lz + ls / 2], [-lx, ay + 2, -lz + ls / 2], [lx, ay - 2, -lz + ls / 2], [lx, ay + 2, -lz + ls / 2]], { spin: true })],
    view: { az: -35, el: 45 },
  });
  b.step({
    caption: 'Screw down the top',
    say: 'Center the frame on the top and drive the wood screws up through the rails into the top. Short screws only, so nothing pokes through.',
    hardware: [b.H('screw', '-y', [[-lx / 2, lh, lz], [lx / 2, lh, lz], [-lx / 2, lh, -lz], [lx / 2, lh, -lz], [-lx, lh, 0], [lx, lh, 0]], { spin: true })],
    view: { az: 30, el: 55 },
  });
  b.step({ caption: 'Flip it over', say: 'With a helper, lift it and turn it right side up. Then sit down. You earned it.', pose: [360, 0, 0], view: { az: 30, el: 20 }, safety: 'Two-person lift.' });
}

/** Desk with a drawer tower on the right (MICKE-style). */
export function desk(b) {
  const s = b.spec, o = b.o;
  const [W, D, H] = s.size;
  const t = 1.6, tt = o.tt ?? 2, tw = o.tower ?? 35;
  const sh = H - tt;
  b.part('side', 'Side panel'); b.part('top', 'Desk top'); b.part('modesty', 'Back panel'); b.part('tpanel', 'Tower panel'); b.part('front', 'Drawer front'); b.part('dbox', 'Drawer box part');
  b.obj('sideL', 'side', [t, sh, D], [-W / 2 + t / 2, sh / 2, 0]);
  const xi = W / 2 - tw;
  b.obj('sideR', 'side', [t, sh, D], [W / 2 - t / 2, sh / 2, 0]);
  b.obj('sideM', 'side', [t, sh, D], [xi + t / 2, sh / 2, 0]);
  const cw = tw - 2 * t, cx = xi + tw / 2;
  b.obj('tBottom', 'tpanel', [cw, t, D - 1], [cx, 8, 0]);
  b.obj('tShelf', 'tpanel', [cw, t, D - 1], [cx, sh - 16, 0]);
  b.obj('modesty', 'modesty', [xi + W / 2 - t, 30, t], [(-W / 2 + t + xi) / 2, sh - 15 - 3, -D / 2 + 3]);
  b.obj('top', 'top', [W, tt, D], [0, H - tt / 2, 0]);
  const dh = 12, dy = sh - 8;
  b.obj('dFront', 'front', [cw - 0.3, dh, 1.6], [cx, dy, D / 2 - 0.8]);
  b.obj('dBox', 'dbox', [cw - 2.6, dh - 3, D - 8], [cx, dy - 0.5, -2.4], { boxes: [
    { s: [1.2, dh - 3, D - 8], p: [-(cw - 2.6) / 2 + 0.6, 0, 0] }, { s: [1.2, dh - 3, D - 8], p: [(cw - 2.6) / 2 - 0.6, 0, 0] },
    { s: [cw - 5, dh - 4, 1.2], p: [0, 0.5, -(D - 8) / 2 + 0.6] }, { s: [cw - 5, 0.3, D - 9], p: [0, -(dh - 3) / 2 + 0.6, 0] },
  ] });
  const zq = D / 2 - 6;
  b.step({ caption: 'Tower sides', say: 'Start with the drawer tower. Lay the two tower sides on their edges, holes facing each other, and screw in the cam pins.', add: ['sideR', 'sideM'], from: [30, 0, 0], hardware: [b.H('pin', '-x', [[W / 2 - t, 8, zq], [W / 2 - t, 8, -zq], [W / 2 - t, sh - 16, zq], [W / 2 - t, sh - 16, -zq]]), b.H('pin', '+x', [[xi + t, 8, zq], [xi + t, 8, -zq], [xi + t, sh - 16, zq], [xi + t, sh - 16, -zq]])], view: { az: 40, el: 25 } });
  b.step({ caption: 'Tower shelves. Lock 8.', say: 'Fit the two tower panels between the sides, one low and one under the drawer. Eight cam locks, all turned clockwise.', add: ['tBottom', 'tShelf'], from: [0, 0, 35], hardware: [b.H('cam', '+y', [8, sh - 16].flatMap((y) => [[xi + t + 3.4, y + t / 2, zq], [xi + t + 3.4, y + t / 2, -zq], [W / 2 - t - 3.4, y + t / 2, zq], [W / 2 - t - 3.4, y + t / 2, -zq]]), { spin: true })], view: { az: 30, el: 35 } });
  b.step({ caption: 'Left side + back', say: 'Connect the left side panel to the tower with the long back panel. Dowels first, then cam locks at both ends.', add: ['sideL', 'modesty'], from: [-35, 0, 0], hardware: [b.H('dowel', '+x', [[-W / 2 + t, sh - 25, -D / 2 + 3], [-W / 2 + t, sh - 11, -D / 2 + 3]]), b.H('cam', '+z', [[-W / 2 + t + 3.4, sh - 18, -D / 2 + 3 + t / 2], [xi - 3.4, sh - 18, -D / 2 + 3 + t / 2]], { spin: true })], view: { az: 140, el: 25 }, safety: 'Two people make this easier.' });
  b.step({ caption: 'Desk top on', say: 'Tap dowels into the top edges, set the desk top on, and screw it down from underneath through the tower and the side.', add: ['top'], from: [0, 35, 0], hardware: [b.H('dowel', '+y', [[-W / 2 + t / 2, sh, zq], [-W / 2 + t / 2, sh, -zq], [W / 2 - t / 2, sh, zq], [W / 2 - t / 2, sh, -zq], [xi + t / 2, sh, zq], [xi + t / 2, sh, -zq]]), b.C('screw', 6)], view: { az: 30, el: 35 } });
  b.step({ caption: 'Build the drawer', say: 'Build the drawer box: sides onto the front, bottom slides into the grooves, back panel screwed on.', add: ['dFront', 'dBox'], from: [0, 0, 45], hardware: [b.C('dowel', 4), b.C('screw', 4)], view: { az: 25, el: 25, tight: true, zoom: 0.9 } });
  b.step({ caption: 'Anchor it', say: 'Use the wall fitting to tie the desk to the wall behind it. It stops the desk from tipping if someone leans on an open drawer.', hardware: [b.H('anchor', '-z', [[0, sh - 6, -D / 2 + 3 - t / 2]])], view: { az: 150, el: 25, tight: true, zoom: 0.8 }, safety: 'Tip-over risk. Always anchor to the wall.' });
}

/** Floating wall shelf on a hidden bracket (LACK-style). */
export function wallShelf(b) {
  const s = b.spec;
  const [W, D, T] = s.size;
  const y = 140;
  b.env = [{ id: 'wall', size: [W + 70, 200, 2], pos: [0, 100, -D / 2 - 1.6], color: '#ece6dc' }];
  b.part('shelf', 'Shelf'); b.part('fitting', 'Wall fitting');
  b.obj('fitting', 'fitting', [W - 30, 4, 12], [0, y, -D / 2 + 5.4], { boxes: [
    { s: [W - 30, 4, 0.6], p: [0, 0, -5.7] },
    ...spread(-(W - 30) / 2 + 3, (W - 30) / 2 - 3, 3).map((x) => ({ s: [1.6, 1, 11], p: [x, 0, 0.4] })),
  ] });
  b.obj('shelf', 'shelf', [W, T, D], [0, y, 0]);
  b.step({ caption: 'Find the spot', say: 'Pick the spot and find what is behind the wall: a stud, brick or drywall. The screws for the wall are not included, because they depend on that.', view: { az: 20, el: 10 }, safety: 'Check your wall can carry the load.' });
  b.step({
    caption: 'Level, then screw',
    say: 'Hold the wall fitting up, put a level on it, and mark the holes. Drill, plug if needed, and screw the fitting to the wall. Level matters more than anything here.',
    add: ['fitting'], from: [0, 0, 30], hardware: [b.H('screw', '-z', spread(-(W - 30) / 2 + 6, (W - 30) / 2 - 6, 4).map((x) => [x, y, -D / 2 - 0.6]), { spin: true })],
    view: { az: 25, el: 10, tight: true },
  });
  b.step({ caption: 'Slide the shelf on', say: 'Slide the shelf over the prongs, all the way back until it touches the wall.', add: ['shelf'], from: [0, 0, 45], view: { az: 30, el: 15 } });
  b.step({ caption: 'Lock screws', say: 'From underneath, drive the two small locking screws up into the fitting. Now it cannot slide off.', hardware: [b.H('screw', '+y', [[-(W - 30) / 2 + 3, y - T / 2, -D / 2 + 6], [(W - 30) / 2 - 3, y - T / 2, -D / 2 + 6]], { spin: true })], view: { az: 20, el: -20, tight: true } });
}

/** Bed frame: headboard, rails, footboard, ledges, center beam, slats. Also cribs (o.crib). */
export function bed(b) {
  const s = b.spec, o = b.o, slug = s.slug;
  const [W, L, HB] = s.size;
  const fb = o.footboard ?? 38, rh = o.railH ?? 26, ry0 = o.clear ?? 20, pt = o.board ?? 4;
  const posts = o.posts; // TARVA: square posts at the corners
  const zH = -L / 2 + pt / 2, zF = L / 2 - pt / 2;
  const board = (h, z) => posts
    ? { size: [W, h, pt + 2], pos: [0, h / 2, z], boxes: [
        { s: [posts, h, posts], p: [-W / 2 + posts / 2, 0, 0] }, { s: [posts, h, posts], p: [W / 2 - posts / 2, 0, 0] },
        { s: [W - 2 * posts, h * 0.35, pt * 0.6], p: [0, h / 2 - h * 0.2 - 3, 0] }, { s: [W - 2 * posts, rh, pt * 0.6], p: [0, -h / 2 + ry0 + rh / 2, 0] },
      ] }
    : { size: [W, h, pt], pos: [0, h / 2, z] };
  b.part('head', 'Headboard'); b.part('foot', 'Footboard'); b.part('rail', 'Side rail'); b.part('ledge', 'Slat ledge'); b.part('beam', 'Center beam'); b.part('slats', 'Slat roll');
  const hbo = board(HB, zH), fbo = board(fb, zF);
  b.obj('head', 'head', hbo.size, [0, HB / 2, zH], hbo.boxes ? { boxes: hbo.boxes } : {});
  b.obj('foot', 'foot', fbo.size, [0, fb / 2, zF], fbo.boxes ? { boxes: fbo.boxes } : {});
  const rl = L - 2 * pt, rx = W / 2 - (posts ? posts / 2 : 1.2), ryc = ry0 + rh / 2;
  b.obj('railL', 'rail', [2.4, rh, rl], [-rx, ryc, 0]);
  b.obj('railR', 'rail', [2.4, rh, rl], [rx, ryc, 0]);
  const ly = ry0 + 2;
  b.obj('ledgeL', 'ledge', [3, 3, rl - 2], [-rx + 2.7, ly, 0]);
  b.obj('ledgeR', 'ledge', [3, 3, rl - 2], [rx - 2.7, ly, 0]);
  b.obj('beam', 'beam', [4, ly + 1.5, rl - 2], [0, (ly + 1.5) / 2, 0], { boxes: [{ s: [4, 6, rl - 2], p: [0, (ly + 1.5) / 2 - 3, 0] }, { s: [4, ly - 4.5, 4], p: [0, -3, 0], shape: 'cyl' }] });
  const n = o.slats ?? 17, sw = 2 * rx - 6;
  const zs = spread(-rl / 2 + 5, rl / 2 - 5, n);
  b.obj('slats', 'slats', [sw, 0.9, rl - 4], [0, ly + 1.95, 0], { boxes: zs.map((z) => ({ s: [sw, 0.9, 6.3], p: [0, 0, z] })) });
  const boltsAt = (z, ax) => b.H('bolt', ax, [-rx, rx].flatMap((x) => [[x, ryc - rh / 4, z], [x, ryc + rh / 4, z]]), { spin: true });
  b.step({ caption: 'Headboard first', say: 'Build it in the room it will live in. Stand the headboard where the bed will go, a hand-width from the wall.', add: ['head'], from: [0, 0, -30], view: { az: 30, el: 25 }, safety: 'Two people for this one.' });
  b.step({ caption: 'Side rails. 4 bolts.', say: 'Hold a side rail against the headboard and bolt it on, two bolts. Then the other rail. Keep the ledge grooves facing in.', add: ['railL', 'railR'], from: [0, 0, 40], hardware: [boltsAt(-L / 2 + pt, '+z')], view: { az: 40, el: 30 }, safety: 'Two people for this one.' });
  b.step({ caption: 'Footboard. 4 bolts.', say: 'Bring in the footboard and bolt both rails to it. Leave the bolts a little loose until the frame is square.', add: ['foot'], from: [0, 0, 40], hardware: [boltsAt(L / 2 - pt, '-z')], view: { az: 140, el: 30 } });
  b.step({ caption: 'Square, then tighten', say: 'Measure corner to corner both ways. When the two diagonals match, the frame is square. Now tighten every bolt.', view: { az: 0, el: 80 } });
  b.step({ caption: 'Slat ledges', say: 'Screw a slat ledge along the inside of each rail, flush with the bottom of the groove.', add: ['ledgeL', 'ledgeR'], from: [0, 25, 0], hardware: [b.C('screw', Math.round(rl / 25) * 2)], view: { az: 35, el: 50 } });
  b.step({ caption: 'Center beam', say: 'Hang the center beam between the headboard and the footboard, then twist its support leg down until it touches the floor. The middle needs support too.', add: ['beam'], from: [0, 30, 0], hardware: [b.C('screw', 4)], view: { az: 35, el: 50 } });
  b.step({ caption: `Roll out ${n} slats`, say: pick(slug, 'slats', [`Unroll the slats across the ledges, curved side up, and space them evenly. ${Say(n)} slats, clipped or screwed at the ends.`, `Roll out all ${say(n)} slats like a rug, curve up, and lock the ends to the ledges.`]), add: ['slats'], from: [0, 35, 0], view: { az: 30, el: 55 } });
}

export function crib(b) {
  const s = b.spec, o = b.o;
  const [L, W, H] = s.size; // long side along x, short ends along z
  const post = 4.2, base = o.base ?? [17, 37];
  const nb = o.bars ?? 9;
  const endBoxes = (w) => [
    { s: [post, H, post], p: [-w / 2 + post / 2, 0, 0] }, { s: [post, H, post], p: [w / 2 - post / 2, 0, 0] },
    { s: [w - 2 * post, 6, 2.4], p: [0, H / 2 - 5, 0] }, { s: [w - 2 * post, 6, 2.4], p: [0, -H / 2 + 14, 0] },
    ...spread(-w / 2 + post + 4, w / 2 - post - 4, Math.max(3, Math.round(nb * 0.6))).map((x) => ({ s: [2.2, H - 30, 2.2], p: [x, 1.5, 0], shape: 'cyl' })),
  ];
  const sideBoxes = (len, h) => [
    { s: [len, 4, 2.4], p: [0, h / 2 - 2, 0] }, { s: [len, 4, 2.4], p: [0, -h / 2 + 2, 0] },
    ...spread(-len / 2 + 5, len / 2 - 5, nb + 4).map((x) => ({ s: [2.2, h - 8, 2.2], p: [x, 0, 0], shape: 'cyl' })),
  ];
  b.part('end', 'End frame'); b.part('side', 'Side frame'); b.part('base', 'Mattress base');
  b.obj('endL', 'end', [post, H, W], [-L / 2 + post / 2, H / 2, 0], { boxes: endBoxes(W).map((x) => ({ ...x, s: [x.s[2], x.s[1], x.s[0]], p: [0, x.p[1], x.p[0]] })) });
  b.obj('endR', 'end', [post, H, W], [L / 2 - post / 2, H / 2, 0], { boxes: endBoxes(W).map((x) => ({ ...x, s: [x.s[2], x.s[1], x.s[0]], p: [0, x.p[1], x.p[0]] })) });
  const sl = L - 2 * post, sh = H - 22, sy = 12 + sh / 2;
  b.obj('sideB', 'side', [sl, sh, 2.4], [0, sy, -W / 2 + post / 2], { boxes: sideBoxes(sl, sh) });
  b.obj('sideF', 'side', [sl, sh, 2.4], [0, sy, W / 2 - post / 2], { boxes: sideBoxes(sl, sh) });
  const by = base[1];
  b.obj('base', 'base', [sl - 1, 2, W - 2 * post - 1], [0, by, 0], { boxes: [
    { s: [sl - 1, 2, 3], p: [0, 0, -(W - 2 * post - 1) / 2 + 1.5] }, { s: [sl - 1, 2, 3], p: [0, 0, (W - 2 * post - 1) / 2 - 1.5] },
    ...spread(-(sl - 1) / 2 + 3, (sl - 1) / 2 - 3, 8).map((x) => ({ s: [5, 1.2, W - 2 * post - 4], p: [x, 0.2, 0] })),
  ] });
  const zq = W / 2 - post / 2;
  b.step({ caption: 'One end + back side', say: 'Lay out every part and count them, because cribs must be complete. Stand one end frame up and bolt the back side frame to it, two bolts.', add: ['endL', 'sideB'], from: [0, 0, -35], hardware: [b.H('bolt', '+x', [[-L / 2 + post, sy - sh / 3, -zq], [-L / 2 + post, sy + sh / 3, -zq]], { spin: true })], view: { az: 30, el: 25 } });
  b.step({ caption: 'Mattress base', say: `Choose the base height. Use the high position, about ${Math.round(base[1])} centimeters, for a newborn, and the low one as soon as your baby can sit up. Screw the base to the end frame.`, add: ['base'], from: [0, 35, 0], hardware: [b.C('screw', 4)], view: { az: 30, el: 45 }, safety: 'Lower the base once baby can sit up.' });
  b.step({ caption: 'Front side', say: 'Bolt the front side frame to the same end frame. Bars facing in, smooth side out.', add: ['sideF'], from: [0, 0, 35], hardware: [b.H('bolt', '+x', [[-L / 2 + post, sy - sh / 3, zq], [-L / 2 + post, sy + sh / 3, zq]], { spin: true })], view: { az: 30, el: 25 } });
  b.step({ caption: 'Last end. 4 bolts.', say: 'Close the box with the second end frame. Four bolts, then screw the base to this end too.', add: ['endR'], from: [35, 0, 0], hardware: [b.H('bolt', '-x', [[L / 2 - post, sy - sh / 3, zq], [L / 2 - post, sy + sh / 3, zq], [L / 2 - post, sy - sh / 3, -zq], [L / 2 - post, sy + sh / 3, -zq]], { spin: true }), b.C('screw', 4)], view: { az: -30, el: 30 } });
  b.step({ caption: 'Tighten + test', say: 'Tighten every bolt, then push hard on each corner. Nothing should wobble or gap. Check the bolts again every few months.', view: { az: 20, el: 35 }, safety: 'Never use it with a missing or loose part.' });
}

/** IVAR-style: two ladder side units, shelves on pins, an X-brace. */
export function ladder(b) {
  const s = b.spec, o = b.o;
  const [W, D, H] = s.size;
  const up = 3.4, sw = o.shelfW ?? W - 2 * up - 0.6, n = o.shelves ?? 4;
  b.part('sideunit', 'Side unit'); b.part('shelf', 'Shelf', 'Shelves'); b.part('brace', 'X-brace');
  const sideBoxes = [{ s: [up, H, up], p: [0, 0, -D / 2 + up / 2] }, { s: [up, H, up], p: [0, 0, D / 2 - up / 2] }, ...[-H / 2 + 8, 0, H / 2 - 4].map((y) => ({ s: [2, 3, D - 2 * up], p: [0, y, 0] }))];
  const sx = W / 2 - up / 2;
  b.obj('sideL', 'sideunit', [up, H, D], [-sx, H / 2, 0], { boxes: sideBoxes });
  b.obj('sideR', 'sideunit', [up, H, D], [sx, H / 2, 0], { boxes: sideBoxes });
  const ys = spread(12, H - 3, n).map(r);
  ys.forEach((y, i) => b.obj(`shelf${i + 1}`, 'shelf', [sw, 2.2, D - 0.6], [0, y - 1.1, 0]));
  const len = Math.hypot(W - 2 * up, H * 0.5), ang = (Math.atan2(H * 0.5, W - 2 * up) * 180) / Math.PI;
  b.obj('brace', 'brace', [W - 2 * up, H * 0.5, 1], [0, H * 0.5, -D / 2 - 0.5], { boxes: [{ s: [len, 1.6, 0.3], p: [0, 0, 0], r: [0, 0, ang] }, { s: [len, 1.6, 0.3], p: [0, 0, 0.35], r: [0, 0, -ang] }] });
  const pins = (x, ax, list) => b.H('spin', ax, list.flatMap((y) => [[x, y - 2.4, D / 2 - up / 2], [x, y - 2.4, -D / 2 + up / 2]]));
  const xi = sx - up / 2;
  b.step({ caption: 'Pins in one side', say: 'Lean one side unit against the wall. Push shelf pins into the holes at the heights you want for the bottom and top shelves.', add: ['sideL'], from: [-30, 0, 0], hardware: [pins(-xi, '+x', [ys[0], ys[n - 1]])], view: { az: 40, el: 20 } });
  b.step({ caption: 'Bottom + top shelf', say: 'With a helper holding the side, rest the bottom shelf and the top shelf on their pins. The clips under each shelf grip the pins.', add: [`shelf1`, `shelf${n}`], from: [30, 0, 0], view: { az: 35, el: 20 }, safety: 'Two people for this one.' });
  b.step({ caption: 'Second side unit', say: 'Pins into the second side unit at matching heights, then slide it under the free ends of the shelves.', add: ['sideR'], from: [30, 0, 0], hardware: [pins(xi, '-x', [ys[0], ys[n - 1]])], view: { az: -35, el: 20 } });
  if (n > 2) b.step({ caption: `${n - 2} middle shelves`, say: 'Now the middle shelves. Pins in on both sides at the same height, then drop each shelf on.', add: ys.slice(1, -1).map((_, i) => `shelf${i + 2}`), from: [0, 0, 35], hardware: [pins(-xi, '+x', ys.slice(1, -1)), pins(xi, '-x', ys.slice(1, -1))], view: { az: 25, el: 20 } });
  b.step({ caption: 'X-brace on the back', say: 'Screw the metal X-brace across the back. It is what stops the whole thing leaning sideways, so do not skip it.', add: ['brace'], from: [0, 0, -40], hardware: [b.C('screw', 4)], view: { az: 160, el: 20 } });
  b.step({ caption: 'Anchor it', say: 'Fix the top of a side unit to the wall with a bracket and screws that suit your wall. Tall and narrow means anchor it, always.', hardware: [b.H('anchor', '-z', [[-sx, H - 6, -D / 2]])], view: { az: 150, el: 25, tight: true, zoom: 0.8 }, safety: 'Tip-over risk. Always anchor to the wall.' });
}

/** Two-step stool (BEKVÄM-style). */
export function stool(b) {
  const s = b.spec;
  const [W, D, H] = s.size;
  const t = 2.2, sd = D / 2;
  b.part('side', 'Side'); b.part('tread', 'Step'); b.part('rail', 'Back rail');
  const sideBoxes = [{ s: [t, H / 2, D], p: [0, -H / 4, 0] }, { s: [t, H / 2, sd + 2], p: [0, H / 4, -sd / 2 + 1] }];
  b.obj('sideL', 'side', [t, H, D], [-W / 2 + t / 2, H / 2, 0], { boxes: sideBoxes });
  b.obj('sideR', 'side', [t, H, D], [W / 2 - t / 2, H / 2, 0], { boxes: sideBoxes });
  b.obj('treadTop', 'tread', [W - 2 * t, t, sd + 2], [0, H - t / 2, -sd / 2 + 1]);
  b.obj('treadLow', 'tread', [W - 2 * t, t, sd], [0, H / 2 - t / 2, sd / 2]);
  b.obj('rail', 'rail', [W - 2 * t, 6, t], [0, 12, -D / 2 + t / 2]);
  const xi = -W / 2 + t;
  b.step({ caption: 'Side + dowels', say: 'Lay one side flat, the stepped edge facing you. Tap the wood dowels into the holes for the two steps and the back rail.', add: ['sideL'], from: [-30, 0, 0], hardware: [b.H('dowel', '+x', [[xi, H - t / 2, -sd + 4], [xi, H - t / 2, -4], [xi, H / 2 - t / 2, 4], [xi, H / 2 - t / 2, sd - 4], [xi, 12, -D / 2 + t / 2]])], view: { az: 50, el: 25 } });
  b.step({ caption: 'Steps + rail', say: 'Press both steps and the back rail onto the dowels. Wipe off any glue that squeezes out, if you used some.', add: ['treadTop', 'treadLow', 'rail'], from: [30, 0, 0], view: { az: 35, el: 30 } });
  b.step({ caption: 'Other side. 6 screws.', say: 'Put the second side on top and drive the screws through it into the steps and the rail. Then flip it and tighten the first side too.', add: ['sideR'], from: [30, 0, 0], hardware: [b.H('screw', '-x', [[W / 2 - t, H - t / 2, -sd + 4], [W / 2 - t, H - t / 2, -4], [W / 2 - t, H / 2 - t / 2, 4], [W / 2 - t, H / 2 - t / 2, sd - 4], [W / 2 - t, 12, -D / 2 + 1.5]], { spin: true }), b.C('screw', 1)], view: { az: -40, el: 25 } });
  b.step({ caption: 'Wobble test', say: 'Stand it on a flat floor and press on each corner of the top step. Retighten after the first week, wood settles.', view: { az: 30, el: 20 }, safety: 'Re-tighten the screws now and then.' });
}
