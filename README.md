# Hexkey

**Flat-pack, talked through.** Hexkey is an open-source, voice-guided 3D assembly guide for flat-pack furniture.
Pick your piece, check off what's in the box, then build it step by step. A voice tells you what to do, the 3D model shows you, and you can keep your hands on the furniture.

> Works with 98 pieces from 19 brands:
> - **35 IKEA® pieces:** LACK, KALLAX, BILLY, MALM, HEMNES, ALEX, BRIMNES, TARVA, RAST, GURSKEN, IVAR, BESTÅ, TROFAST, SNIGLAR, BEKVÄM, INGO, MICKE and LAGKAPTEN/ADILS.
> - **63 pieces from 18 other brands:** Walker Edison®, Ameriwood Home® and Novogratz® (Dorel Home), Zinus®, Sauder®, South Shore®, Prepac®, ClosetMaid®, Tribesigns®, Nathan James®, VASAGLE® (SONGMICS), FlexiSpot®, UPLIFT Desk®, Bestar®, Linon®, Delta Children®, Seville Classics®, Branch® and VIVO®.
>
> **Hexkey is not affiliated with, sponsored by or endorsed by any of these brands** (Inter IKEA Systems B.V., Dorel Industries and the others listed in [data/sources/brands.json](data/sources/brands.json)).
> The steps here are our own and are a demo. Always follow the official instructions that came in your box.

| Pick | Check the box | Build | Done |
|---|---|---|---|
| Choose a piece. It spins in 3D. | Tap each part and hardware bag as you find it. Parts are color-matched to the 3D model. | Parts lift off the floor and fly into a glowing ghost outline. Hardware pops in with ×N counts; cam locks turn. | Confetti, a turntable and a share card with your build time. |

## What's in the catalog

98 pieces. The three hand-made guides (LACK side table, KALLAX 2×2, BILLY 80×202) are tuned step by step; the other 95 (32 IKEA, 63 from other brands) are generated from short specs by [archetypes](docs/ARCHETYPES.md).
Confidence says how sure we are about the internals: **high** = dimensions and construction match the product page; **medium** = dimensions right, drawer/shelf layout or hardware counts are our best guess; **low** = simplified. Every guide is a demo: always follow the official instructions in your box. The app does not show confidence badges; instead every parts list says counts are our best estimate.

| Piece | Category | Steps | Parts | Hardware | Built by | Confidence |
|---|---|---|---|---|---|---|
| **KALLAX** Shelf unit 2×2 | shelving | 8 | 7 | 29 | hand-made | ●●● high |
| **BILLY** Bookcase | shelving | 14 | 12 | 86 | hand-made | ●●● high |
| **BILLY** Low bookcase | shelving | 10 | 8 | 37 | bookcase | ●●○ medium |
| **BILLY** Narrow bookcase | shelving | 12 | 12 | 57 | bookcase | ●●● high |
| **HEMNES** Bookcase | shelving | 12 | 11 | 49 | bookcase | ●●○ medium |
| **IVAR** Shelving unit | shelving | 6 | 7 | 21 | ladder | ●●○ medium |
| **KALLAX** Shelf unit 1×4 | shelving | 9 | 7 | 29 | cubes | ●●● high |
| **KALLAX** Shelf unit 2×4 | shelving | 13 | 11 | 45 | cubes | ●●● high |
| **KALLAX** Shelf unit 4×4 | shelving | 13 | 19 | 78 | cubes | ●●● high |
| **LACK** Wall shelf | shelving | 4 | 2 | 6 | wall-shelf | ●●○ medium |
| **GURSKEN** Chest of 3 drawers | dressers | 15 | 30 | 60 | chest | ●●○ medium |
| **HEMNES** 3-drawer dresser | dressers | 15 | 31 | 68 | chest | ●●○ medium |
| **HEMNES** 8-drawer dresser | dressers | 16 | 67 | 134 | chest | ●●○ medium |
| **MALM** Chest of 2 drawers | dressers | 13 | 19 | 45 | chest | ●●● high |
| **MALM** Chest of 3 drawers | dressers | 13 | 26 | 57 | chest | ●●● high |
| **MALM** Chest of 4 drawers | dressers | 13 | 33 | 69 | chest | ●●● high |
| **MALM** Chest of 6 drawers | dressers | 14 | 48 | 98 | chest | ●●● high |
| **RAST** Chest of 3 drawers | dressers | 13 | 20 | 45 | chest | ●●○ medium |
| **TARVA** 3-drawer dresser | dressers | 15 | 30 | 60 | chest | ●●○ medium |
| **BRIMNES** Nightstand | bedroom | 14 | 14 | 48 | chest | ●●○ medium |
| **HEMNES** Nightstand | bedroom | 14 | 24 | 50 | chest | ●●○ medium |
| **MALM** Bed frame, Queen | bedroom | 7 | 8 | 28 | bed | ●●○ medium |
| **TARVA** Bed frame, Queen | bedroom | 7 | 8 | 28 | bed | ●●○ medium |
| **BESTÅ** Frame | storage | 9 | 6 | 29 | bookcase | ●●○ medium |
| **BRIMNES** TV unit | storage | 16 | 22 | 66 | chest | ●●○ medium |
| **LACK** Side table | tables | 5 | 5 | 4 | hand-made | ●●● high |
| **INGO** Table | tables | 5 | 9 | 22 | apron-table | ●●○ medium |
| **LACK** Coffee table | tables | 6 | 6 | 12 | table | ●●● high |
| **LACK** TV bench | tables | 6 | 6 | 12 | table | ●●○ medium |
| **ALEX** Drawer unit | desks | 14 | 41 | 85 | chest | ●●● high |
| **LAGKAPTEN / ADILS** Desk | desks | 6 | 9 | 16 | table | ●●● high |
| **MICKE** Desk | desks | 6 | 9 | 41 | desk | ●○○ low |
| **BEKVÄM** Step stool | kids | 4 | 5 | 11 | stool | ●●○ medium |
| **SNIGLAR** Crib | kids | 5 | 5 | 16 | crib | ●●○ medium |
| **TROFAST** Storage frame | kids | 6 | 4 | 21 | bookcase | ●○○ low |

## Features

- **3D you can spin.** Drag to orbit, pinch to zoom. The camera eases to a good angle for every step.
- **Parts fly in from an "unboxed" flat lay** into a pulsing ghost outline, then settle with a little bounce.
- **Hardware tray** with icons and ×N badges for each step. Tap a chip to hear "how many".
- **Voice narration** for every step: pre-generated clips (Kokoro-82M, voice `af_heart`, Apache-2.0), with the browser's own voice as a fallback.
- **Hands-free.** Tap the mic, then say **"next"**, **"back"**, **"repeat"**, **"how many"** or **"stop"** (Web Speech API, Chrome and Safari).
- **Headphone buttons.** Next-track / previous-track on AirPods or a Bluetooth remote move between steps (Media Session API). Play replays the step.
- **Screen stays on** while you build (Screen Wake Lock).
- Keyboard: ← → or Space, R to repeat. Swipe the bottom card left/right on a phone.
- Safety callouts (wall anchoring, two-person lifts) are part of the data, so every piece gets them.
- Progress for the parts check-off is saved on the device. No accounts, no tracking, no backend. (The optional tool links go to Amazon, which has its own privacy policy.)

## Tools and affiliate links

The parts screen has a small **Tools for this build** card under the Start button (closed until you tap it), and the finish screen has a one-line **Need tools?** reminder. Dressers, kids' chests and tall shelving lead with the wall-anchor kit.

- **The tools catalog** is `data/tools.json`: 12 tools (hex key set, Phillips #2, flathead, stubby, rubber mallet, cordless drill/driver, tape measure, level, wood glue, felt pads, wall-anchor kit, utility knife) written in our own words.
- **The rules** in the same file decide which tools a piece needs. Every piece gets a hex key and a Phillips #2. Tools are then added by category, archetype, category+archetype, hardware kind (cam locks add a flathead, nails and dowels add a mallet), and height (100 cm or taller adds anchors, a level and a drill). `slugs` adds or drops tools for one piece. `src/tools.ts` resolves them and `npm run validate` checks them (`node scripts/tools-check.mjs --list` prints every piece's list).
- **Links** are plain Amazon search links (`https://www.amazon.com/s?k=<query>&tag=…`). We don't use product pages, prices, star ratings or product images. Every link opens in a new tab with `rel="sponsored noopener nofollow"`.
- **The Associates tag** lives in one place: `src/config/affiliates.ts`.
- **Disclosure:** As an Amazon Associate, Hexkey earns from qualifying purchases. It's shown next to the links and in the app's footer line. Hexkey has no other sponsors, and no brand named here sponsors it.
- `npm run shots:tools` checks the tag, rel and disclosure on the parts and finish screens. It also checks there's no sideways scroll at 320, 375 and 393 px, and saves screenshots.

## Help it grow

Hexkey is meant to grow through its community, one piece of furniture at a time.

- **Contribute** (button in the app): a 30-second fit check, then a pre-filled [Contribute furniture](https://github.com/rchrdchn/hexkey/issues/new?template=contribute-furniture.yml) issue. Full guide: [CONTRIBUTING.md](CONTRIBUTING.md).
- **Request furniture** (button in the app): 👍 an [existing request](https://github.com/rchrdchn/hexkey/issues?q=is%3Aissue+is%3Aopen+label%3Afurniture-request+sort%3Areactions-%2B1-desc) or open a [new one](https://github.com/rchrdchn/hexkey/issues/new?template=furniture-request.yml). The most-wanted pieces get built first.
- **Feedback / bug report:** [open an issue](https://github.com/rchrdchn/hexkey/issues/new?template=bug-report.yml).

Issue forms live in `.github/ISSUE_TEMPLATE/` and use the labels `furniture-request`, `contribution` and `bug`. The in-app forms live in `src/ui/Community.tsx`: they only accept ikea.com product page links and fill GitHub's issue forms through URL parameters, so there is no backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # validate data + typecheck + build to dist/
npm run preview    # serve dist/ on http://localhost:4173
```

Node 20+. The output in `dist/` is a static site; it is deployed on Cloudflare Pages (build command `npm run build`, output `dist`, `NODE_VERSION=20`).

## Add a piece of furniture

**Fastest: write a catalog spec.** If your piece is a bookcase, chest of drawers, cube shelf, table, bed or similar, describe it in ~20 lines of JSON in `catalog/<slug>.json` and run `npm run gen`. The generator places every panel, the hardware, the steps, the camera, the flips and the safety callouts. See [docs/ARCHETYPES.md](docs/ARCHETYPES.md) for every option.

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
    "top": "overlay", "tt": 1.8, "base": { "type": "none" }
  }
}
```

`size` is W×D×H in cm, in the order the product page prints it. `npm run gen` writes `public/pieces/<slug>/piece.json`, `index.json` and `catalog.json` (the picker list); `npm run validate` fails if any of them are stale.

**Fully custom: write `piece.json` by hand.** For anything the archetypes can't express, everything about a piece lives in one open JSON file: `public/pieces/<slug>/piece.json`. No code changes are needed.

1. **Measure.** Use the dimensions printed on the product page and a tape measure. Dimensions are facts; anyone can use them.
2. **Write `piece.json`** (format below). Start by placing every panel where it ends up in the finished piece, then write the steps that add them.
3. **Register it** in `HAND` and `HAND_META` in `scripts/generate.mjs` and run `npm run gen` (it rebuilds `index.json` and `catalog.json`).
4. `npm run validate` checks ids, references, counts and audio.
5. `npm run dev`, open `/#/<slug>` and step through it. Tweak `view`, `from` and `pose` until each step reads at a glance.
6. **Generate the voice** (optional; the browser voice is used until you do):
   ```bash
   PYTHON=/path/to/venv-with-kokoro/bin/python npm run voice -- <slug>
   ```
   Needs `pip install kokoro soundfile` and `ffmpeg`. Only changed lines are regenerated.
7. Open a pull request with screenshots. See [CONTRIBUTING.md](CONTRIBUTING.md) for the checklist.

### Rules for contributions (please read)

- **Write your own steps.** Do not copy text, drawings or step layouts from any manufacturer's manual, and never add their PDFs, images, photos or 3D models to this repo.
- **Model parts in code** from dimensions: every panel is a box; hardware comes from the built-in kit.
- **Link to the official product page** in `productUrl` (not to PDFs or other files). For IKEA that's an ikea.com `/p/` page; for other brands it must be on the brand's own site from `data/sources/brands.json`.
- **Link, don't copy, the official instructions.** `instructionsUrl` can point at the brand's own instructions PDF or help page. We only link it; never download, rehost or quote it.
- **Set `brand`** to an id from [data/sources/brands.json](data/sources/brands.json) (default `ikea`). It drives the brand chip in the picker, the "Works with BRAND®" label and the brand's own not-affiliated line. New brand? Add it there first, with where its instructions live, the robots.txt/terms notes and a fit score.
- **Fetch politely.** Respect robots.txt and site terms, go slow, no logins, never get around bot protection. If a site blocks you, skip it and note it in brands.json.
- Keep captions to 2-5 words and narration to one or two short sentences.
- Always include the safety steps the real product needs (anchoring, two people).

## Data format

Units are **centimeters**, angles are **degrees**. Axes: **x** to the right, **y** up, **z** toward you (the front). A JSON Schema lives in [`schema/piece.schema.json`](schema/piece.schema.json), so editors like VS Code autocomplete it.

```jsonc
{
  "slug": "lack",                       // folder name
  "name": "LACK",                       // name on the box
  "title": "Side table",
  "worksWith": "IKEA® LACK side table, 55×55 cm (21⅝×21⅝\")",
  "productUrl": "https://www.ikea.com/us/en/p/lack-side-table-white-30449908/",
  "size": [55, 45, 55],                 // assembled w, h, d
  "minutes": 10, "people": 1, "level": 1,
  "color": "#f3efe8",                   // base panel color; each part type gets a tint
  "parts":    [{ "id": "leg", "label": "Leg" }],                         // optional "plural"
  "hardware": [{ "id": "bolt", "label": "Double-ended screw", "kind": "bolt" }],
  "objects": [                          // every physical panel, where it sits when finished
    { "id": "leg1", "part": "leg", "size": [5, 40, 5], "pos": [-22.5, 20, 22.5] }
  ],
  "steps": [
    {
      "caption": "Spin on 2 legs",      // big text on screen
      "say": "Grab a leg, line it up with a screw, and spin it clockwise until it sits snug.",
      "add": ["leg1", "leg2"],          // objects that fly in this step
      "from": [0, -30, 0],              // they slide in from this direction (furniture space)
      "twist": true,                    // spin them on the way in (screw-on legs)
      "pose": [180, 0, 0],              // whole piece rotation from here on (upside down)
      "hardware": [
        { "id": "bolt", "axis": "-y", "spin": true, "at": [[-22.5, 40, 22.5]] },
        { "id": "nail", "axis": "-z", "line": [[-39, 1, -14.3], [-39, 99, -14.3]], "n": 5 }
      ],
      "view": { "az": 20, "el": 25, "zoom": 1, "tight": false },
      "safety": "Two-person lift."      // red callout
    }
  ],
  "done": "That's it. Your table is done."
}
```

| Field | Meaning |
|---|---|
| `objects[].pos` | Center of the panel in the finished piece. `size` is `[width, height, depth]`. Optional `rot` (degrees). |
| `steps[].add` | Objects that move from the flat lay into place. Each object must be added exactly once. |
| `steps[].from` | Approach direction in furniture space. Rotated along with `pose`, so `[0,0,30]` (from the front) becomes "from above" when the piece lies on its back. |
| `steps[].pose` | Euler XYZ rotation of the whole piece, kept until the next `pose`. It always rests on the floor. `[-90,0,0]` = lying on its back, `[-90,180,0]` = face down, `[180,0,0]` = upside down. Changes animate, so a pose-only step is a "flip it" moment. |
| `hardware[].axis` | The side the hardware goes in from (`+x -x +y -y +z -z`). Pins and dowels stick out that way; cam locks face that way. |
| `hardware[].at` / `line`+`n` / `count` | Exact points, `n` points spread along a line, or a count with no 3D placement. Counts in the check-off and tray are computed from these. |
| `hardware[].spin` | Cam locks turn half a turn, screws spin in. |
| `hardware kinds` | `dowel`, `campin`, `cam`, `screw`, `nail`, `bolt`, `shelfpin`, `bracket`, `hinge`, `knob` (see `src/scene/Hardware.tsx`). |
| `objects[].shape` / `boxes` | `cyl` for round legs; `boxes` are sub-shapes of one part (a pre-assembled frame, a slat roll, crib bars). |
| `env` | Static scenery that isn't a part, such as the wall a shelf hangs on. |
| `category`, `confidence`, `sources` | Picker category, how sure we are, and the https pages the facts came from (required for generated pieces). |
| `view` | Camera azimuth (0 = front, 90 = right side) and elevation. The camera frames the new parts plus what's built; `tight: true` frames only the new parts and hardware. |

## How it works

- **Vite + React + TypeScript**, 3D with **three.js** via **@react-three/fiber** and **@react-three/drei** (CameraControls, ContactShadows, Edges, Lightformer environment). Rendering is on demand, so the GPU sleeps when nothing moves.
- `src/data.ts` expands a piece (step poses, hardware instances, counts). `src/scene/math.ts` does poses, the flat lay and camera framing. `src/scene/Scene.tsx` animates everything in one frame loop.
- `src/voice.ts`: narration (one reused `<audio>` element so iOS keeps it unlocked), `speechSynthesis` fallback, voice commands, Media Session, Wake Lock.
- Sound effects are synthesized with Web Audio; no files.
- `src/ui/Community.tsx`: the Contribute and Request modals (fit check, ikea.com link check, pre-filled GitHub issue links, focus trap and Esc).
- `scripts/generate.mjs` + `scripts/gen/*.mjs`: the catalog generator (archetypes). The picker only loads `pieces/catalog.json` and small WebP thumbnails; a piece's full JSON loads when you open it.
- Routes are hash-based: `#/billy` (check the box), `#/billy/7` (step 7), `#/billy/done`.

## Browser support

| | Narration | Voice commands | Headphone buttons | Screen awake |
|---|---|---|---|---|
| iPhone Safari 16.4+ | ✓ | ✓ (needs Siri/dictation enabled) | ✓ | ✓ |
| Chrome / Edge desktop & Android | ✓ | ✓ | ✓ | ✓ |
| Firefox | ✓ | – (no Web Speech recognition) | ✓ | ✓ |

## Roadmap

1. A web editor to place parts, set camera angles and write narration, exporting `piece.json`.
2. "Draft from your PDF": load the manual you own, processed on your device, to suggest parts and counts for a human to fix.
3. More pieces from the community, more languages.
4. AR mode (WebXR / iOS Quick Look).

## License

- **Code:** [MIT](LICENSE).
- **Furniture data and narration audio** (`public/pieces`, `public/audio`): [CC BY-SA 4.0](LICENSE-DATA).
- Narration is generated with [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0).

## Trademarks and disclaimer

IKEA and the product names used here (LACK, KALLAX, BILLY, MALM, HEMNES and the others) are trademarks of Inter IKEA Systems B.V. Walker Edison, Ameriwood Home, Novogratz, Zinus, Sauder, South Shore, Prepac, ClosetMaid, Tribesigns, Nathan James, VASAGLE, SONGMICS, FlexiSpot, UPLIFT Desk, Bestar, Linon, Delta Children, Seville Classics, Branch, VIVO and their product names are trademarks of their respective owners. They are used here only to say which products these guides are written for.
Hexkey is an independent project and is **not affiliated with, sponsored by or endorsed by Inter IKEA Systems B.V. or any other brand named here.** It contains no manufacturer instructions, drawings, images or 3D models; every model is built in code from public dimensions and every step is written from scratch. Each piece links to its brand's own product page and, where public, the brand's own instructions.

### Brand research

`data/sources/brands.json` lists 45 furniture brands (big, medium and small/direct-to-consumer): where each one keeps its assembly instructions, whether they're public, robots.txt and terms notes, popular flat-pack products and a 1–5 fit score for Hexkey's archetypes. `status` is `included` (pieces in the catalog), `research-only` (queued) or `skipped` (the site blocked our polite fetcher, or its terms bar automated collection).
The guides are provided as-is. Check your parts against the official instructions, anchor tall furniture to the wall, and get help for heavy lifts.
