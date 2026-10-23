# Archetypes: furniture from a short spec

Most flat-pack furniture is a handful of shapes: a box with shelves, a box with drawers, a top on four legs.
Hexkey's generator turns a short spec in `catalog/<slug>.json` into a full `public/pieces/<slug>/piece.json`:
every panel placed in 3D, every hole's hardware, the step order, camera angles, poses (face down, stand up, flip),
safety callouts and narration, all written in our own words.

```bash
npm run gen          # catalog/*.json -> public/pieces/<slug>/piece.json + index.json + catalog.json
npm run validate     # also fails if a generated file is stale
npm run thumbs       # optional: re-render public/thumbs/<slug>.webp (needs a running preview)
```

Never edit a generated `piece.json` by hand (it has a `$generated` note). Change the spec, or the archetype code, and run `npm run gen`.
Hand-made pieces (LACK, KALLAX 2×2, BILLY) are not generated and stay as they are.

## The spec

| Field | Meaning |
|---|---|
| `slug`, `name`, `title` | URL id, product family name (caps), what it is. |
| `archetype` | One of the archetypes below. |
| `category` | `shelving`, `dressers`, `bedroom`, `storage`, `tables`, `desks`, `kids` (picker chips). |
| `size` | Outer size in cm, in product-page order: **W×D×H** (beds: W×L×headboard H; cribs: L×W×H). |
| `brand` | Brand id from `data/sources/brands.json` (default `ikea`). Sets the picker's brand chip and the brand's not-affiliated line. |
| `worksWith`, `productUrl` | The "Works with BRAND® …" line and the official product page on the brand's own site (never a PDF). |
| `instructionsUrl` | Optional link to the brand's own official instructions (PDF or help page). Linked from the guide; never copied or rehosted. |
| `confidence` | `high`: dimensions and construction match the product page and common knowledge. `medium`: dimensions are right, internal layout or hardware counts are our best guess. `low`: simplified. Not shown as a badge: every parts list carries one disclaimer that counts are our best estimate. |
| `sources` | https pages the facts came from (product pages, not files). |
| `options` | Archetype knobs (below). |
| `minutes`, `people`, `level` | Optional overrides. Otherwise estimated from parts, hardware, drawers and steps. |
| `notes`, `tags` | Free text for contributors, search words. |

## Archetypes

| Archetype | Used by | Key options |
|---|---|---|
| `bookcase` | BILLY 40/106, HEMNES bookcase, BESTÅ frame, TROFAST frame | `t` panel thickness, `top` `inset`\|`overlay`, `tt`, `overhang`, `base` (`none`, `plinth`, `legs`, `apron`, `casters` + `h`), `shelves` (adjustable count), `fixed` (fixed shelf heights as fractions), `lying` (build on its back; default when taller than 140), `back`, `finale` (extra closing step) |
| `chest` | MALM 2/3/4/6, HEMNES 3/8, RAST, TARVA, GURSKEN, BRIMNES, ALEX | `rows` top to bottom: `{ "type": "drawer", "cols": 2, "h": 1.4 }` (`h` is a relative height weight, default 1) or `{ "type": "open" }`/`{ "type": "door" }`; `knobs` per drawer and `knobWord`; `runners` (false = wooden rails); `drawerDepth`; `anchor`; plus the carcass options above |
| `cubes` | KALLAX 1×4, 2×4, 4×4 | `cols`, `rows` (33.5 cm cells, 3.9 cm outer and 1.5 cm inner boards) |
| `table` | LACK coffee table and TV bench, LAGKAPTEN/ADILS | `tt` top thickness, `leg` size, `shelf` (lower shelf), `mount` (`dbolt` double-ended screws or `plate`), `feet` (levelling feet), `topLabel` |
| `apron-table` | INGO | `tt`, `leg`, `apron` |
| `desk` | MICKE | `tower` (side drawer/shelf unit) |
| `wall-shelf` | LACK wall shelf | none: shows a wall, a hidden fitting and the shelf sliding on |
| `bed` | MALM and TARVA queen | `board`, `footboard`, `posts`, `railH`, `clear` (under-bed height), `slats` |
| `crib` | SNIGLAR | `bars`, `base` (mattress base heights) |
| `ladder` | IVAR | `shelves`, `shelfW` |
| `stool` | BEKVÄM | none |
| `platform-bed` | Zinus Mia, Moiz, Allen, Linda | `height` (frame top, cm), `material` (`metal`\|`wood`), `headboard` (false for none), `railH`, `sideLegs`, `centerLegs`, `slats`. Size is W×L×headboard H |
| `standing-desk` | FlexiSpot E7, UPLIFT V2 | `tt` top thickness, `inset` (column distance from the ends). Built upside down: brackets + crossbeam, columns, feet, control box, cables, flip, reset |
| `frame-shelf` | Nathan James Theo/Haven, Tribesigns ladder | `shelves` (fixed, screwed), `lean` (top shelf depth in cm for ladder shelves that taper), `post`, `st`, `bottom` |
| `wire-shelf` | Seville Classics UltraDurable | `shelves`, `pole` (diameter, cm), `wheels` (caster height in cm; 0 = levelling feet), `sections` (pole pieces per corner), `bottom` (lowest shelf height). Tool-free: poles, split sleeves, shelves tapped down. Size is W×D×H including wheels |

`table` also takes `bars` (height in cm of two side support bars between the front and back legs, for metal-frame desks).

### How the carcass archetypes build

`bookcase` and `chest` share `scripts/gen/carcass.mjs`, which follows the order most flat-pack cases use:

1. Side panel down, cam pins / dowels in.
2. Bottom on, two cam locks turned.
3. Fixed shelves, then vertical dividers on dowels.
4. Second side (two-person callout when the piece is 120 cm or more).
5. Top (inset with cams, or overlay on dowels + cams), plinth.
6. Face down, back panel nailed (split in two when taller than 150 cm), legs or casters.
7. Stand it up. Then drawers, doors or adjustable shelves, then wall anchoring (tip-over safety on anything tall or with drawers).

Drawers: runners first, then the first drawer step by step (front + sides on dowels, bottom slid in, back screwed), left pulled half open so you can see inside; the rest are "build N more" with counts, then knobs.

## Example spec (MALM 3-drawer)

```json
{
  "$schema": "../schema/catalog-spec.schema.json",
  "slug": "malm-3",
  "name": "MALM",
  "title": "Chest of 3 drawers",
  "archetype": "chest",
  "category": "dressers",
  "size": [80, 48, 78],
  "worksWith": "IKEA® MALM chest of 3 drawers, 80×48×78 cm (31½×18⅞×30¾\")",
  "productUrl": "https://www.ikea.com/de/en/p/malm-chest-of-3-drawers-white-20403562/",
  "color": "#f3efe8",
  "confidence": "high",
  "sources": ["https://www.ikea.com/de/en/p/malm-chest-of-3-drawers-white-20403562/"],
  "options": {
    "rows": [{ "type": "drawer" }, { "type": "drawer" }, { "type": "drawer" }],
    "top": "overlay",
    "tt": 1.8,
    "base": { "type": "none" }
  },
  "tags": ["dresser"]
}
```

## Adding a new archetype

1. Write a function `(spec, build) => void` in `scripts/gen/` that calls `b.part()`, `b.obj()`, `b.use()` / `b.H()` and `b.step()` (see `scripts/gen/lib.mjs`).
2. Register it in the `ARCHETYPES` map in `scripts/generate.mjs` and in `schema/catalog-spec.schema.json`.
3. Units are cm; x right, y up, z toward the viewer. Hardware points out of its hole along `axis`.
4. `npm run gen && npm run validate`, then step through it in the browser on a phone-size window.
