# Hexkey

**Flat-pack, talked through.** Hexkey is an open-source, voice-guided 3D assembly guide for flat-pack furniture.

Pick your piece, check off what's in the box, then build it step by step. A voice tells you what to do, the 3D model shows you, and your hands stay on the furniture.

**Try it:** [hexkey.pages.dev](https://hexkey.pages.dev) (works on phones; no account, no install).

> **Hexkey is not affiliated with, sponsored by or endorsed by IKEA or any other brand named here.** The steps are our own and are a demo. Always follow the official instructions that came in your box.

| Pick | Check the box | Build | Done |
|---|---|---|---|
| Choose a piece. It spins in 3D. | Tap each part and hardware bag as you find it. Parts are color-matched to the 3D model. | Parts lift off the floor and fly into a glowing ghost outline. Hardware pops in with ×N counts; cam locks turn. | Confetti, a turntable and a share card with your build time. |

## Contents

- [Features](#features)
- [What's in the catalog](#whats-in-the-catalog)
- [Quick start](#quick-start)
- [Scripts and checks](#scripts-and-checks)
- [Project structure](#project-structure)
- [How the data is organized](#how-the-data-is-organized)
- [Add a piece of furniture](#add-a-piece-of-furniture)
- [Data format](#data-format)
- [Voice narration](#voice-narration)
- [Tools and affiliate links](#tools-and-affiliate-links)
- [Help it grow](#help-it-grow)
- [How it works](#how-it-works)
- [Browser support](#browser-support)
- [Roadmap](#roadmap)
- [Link previews and share pages](#link-previews-and-share-pages)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Trademarks and disclaimer](#trademarks-and-disclaimer)

## Features

- **3D you can spin.** Drag to orbit, pinch to zoom. The camera eases to a good angle for every step.
- **Parts fly in from an "unboxed" flat lay** into a pulsing ghost outline, then settle with a little bounce.
- **Hardware tray** with icons and ×N badges for each step. Tap a chip to hear "how many".
- **Voice narration** for every step: pre-generated clips (Kokoro-82M, voice `af_heart`, Apache-2.0), with the browser's own voice as a fallback.
- **Hands-free.** Tap the mic, then say **"next"**, **"back"**, **"repeat"**, **"how many"** or **"stop"** (Web Speech API, Chrome and Safari).
- **Headphone buttons.** Next-track / previous-track on AirPods or a Bluetooth remote move between steps (Media Session API). Play replays the step.
- **Screen stays on** while you build (Screen Wake Lock).
- **Keyboard:** ← → or Space, R to repeat. Swipe the bottom card left/right on a phone.
- **Safety callouts** (wall anchoring, two-person lifts) are part of the data, so every piece gets them.
- **Tools for this build:** a Tools button lists the tools each piece needs, with optional Amazon links (see [Tools and affiliate links](#tools-and-affiliate-links)).
- **Private by design.** Parts check-off progress is saved on the device. No accounts, no tracking, no backend. (The optional tool links go to Amazon, which has its own privacy policy.)

## What's in the catalog

**146 pieces from 25 brands**, in 7 categories: bedroom (39), shelving (29), desks (24), kids (22), dressers (15), storage (9) and tables (8).

| Brand | Pieces | Brand | Pieces |
|---|---|---|---|
| IKEA® | 35 | Floyd® | 6 |
| Plank+Beam® | 13 | Seville Classics® | 6 |
| Zinus® | 13 | Bestar® | 4 |
| Storkcraft® | 11 | Branch® | 3 |
| Walker Edison® | 10 | Max & Lily® | 3 |
| Eureka Ergonomic® | 8 | Tribesigns® | 3 |
| ECR4Kids® | 7 | Delta Children® | 2 |
| Dorel Home (Ameriwood Home®, Novogratz®) | 5 | Linon® | 2 |
| Nathan James® | 5 | VIVO® | 2 |
| VASAGLE® (SONGMICS) | 2 | | |
| ClosetMaid®, FlexiSpot®, Prepac®, Sauder®, South Shore®, UPLIFT Desk® | 1 each | | |

- **3 hand-made guides** (LACK side table, KALLAX 2×2, BILLY 80×202) are tuned step by step.
- **143 generated guides** come from short JSON specs in `catalog/`, built by [archetypes](docs/ARCHETYPES.md) (bookcase, chest, cubes, table, platform bed, standing desk, bunk bed, L-desk, wire shelf and more).
- **The full list** with steps, part and hardware counts is in [`public/pieces/catalog.json`](public/pieces/catalog.json), which is also what the picker loads.
- **Brand research** for 50 brands (25 included, 17 queued, 8 skipped) is in [docs/BRANDS.md](docs/BRANDS.md) and [`data/sources/brands.json`](data/sources/brands.json).

Every piece has a **confidence** level for how sure we are about its internals:

- **high:** dimensions and construction match the product page.
- **medium:** dimensions are right; drawer/shelf layout or hardware counts are our best guess.
- **low:** simplified.

The app doesn't show confidence badges. Instead, every parts list says counts are our best estimate.

## Quick start

**You need:** Node 20 or newer (`.nvmrc` pins 20) and npm. Python 3, `ffmpeg` and Playwright browsers are only needed for voice clips, thumbnails and the browser checks.

```bash
git clone https://github.com/rchrdchn/hexkey && cd hexkey
npm install
npm run dev        # http://localhost:5173
```

Before you open a pull request:

```bash
npm run validate   # data checks: ids, references, counts, links, brands, tool rules
npm run build      # validate + typecheck + production build to dist/
npm run preview    # serve dist/ on http://localhost:4173
```

Routes are hash-based, so you can open a piece directly: `/#/billy` (check the box), `/#/billy/7` (step 7), `/#/billy/done`.

## Scripts and checks

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 5173. |
| `npm run build` | `validate` + `tsc --noEmit` + `vite build` to `dist/`, then `scripts/share-pages.mjs` writes the `/p/<slug>/` share pages, `sitemap.xml`, `llms.txt` and `404.html` (see [Link previews](#link-previews-and-share-pages)). |
| `npm run preview` | Serves `dist/` on port 4173. The browser scripts below default to this URL. |
| `npm run validate` | `scripts/validate.mjs` (ids, references, counts, product links, brands; audio drift is a warning) and `scripts/tools-check.mjs` (tool rules) and `scripts/share-check.mjs` (every piece has a fresh 1200×630 link-preview card under 300 KB). |
| `npm run typecheck` | TypeScript only. |
| `npm run gen` | Regenerates every catalog piece from `catalog/*.json`, plus `public/pieces/index.json` and `catalog.json`. |
| `npm run thumbs` | Renders picker thumbnails to `public/thumbs/<slug>.webp` (needs `npm run preview` running and `ffmpeg`). |
| `npm run share-cards -- <previewUrl> [stale\|all\|slugs]` | Renders the link-preview cards, `public/og.jpg` and `public/share/<slug>.jpg`, with our own 3D scene (needs a preview of a fresh build). Only stale cards by default. |
| `npm run voice -- <slug>` | Generates narration clips (see [Voice narration](#voice-narration)). |
| `npm run shots` | Walks the whole flow in Chromium and WebKit (iPhone and desktop) and saves screenshots. |
| `npm run shots:home` | Phone home screen and picker checks. |
| `npm run shots:catalog` | Clicks through every piece (parts, every step, done) in Chromium and WebKit and fails on any console error. |
| `npm run shots:community` | Contribute and Request furniture modals: focus trap, Esc, links, screenshots. |
| `npm run shots:tools` | Tools button and window checks (details below). |
| `node scripts/parts-check.mjs` | Parts checklist checks: no sideways scroll, tiles check off, disclaimer shows. |
| `node scripts/shots-brands.mjs` | Brand filter, search and per-brand legal line checks. |
| `node scripts/shots-share.mjs` | Share pages: `/p/<slug>/` opens `/#/<slug>` in WebKit (iPhone 15, iPhone SE) and Chromium, and the header Share button shares `/p/<slug>/`. |
| `node scripts/shots-brand-audio.mjs` | Non-IKEA narration: audio indexes match the piece text, every clip returns 200, and clips load while stepping through. |

The browser scripts use Playwright. Install its browsers once with `npx playwright install chromium webkit`. Most take `[baseUrl] [outDir] [pieces]` arguments; the first lines of each script explain them.

## Project structure

```
catalog/<slug>.json          short specs for generated pieces (input to npm run gen)
data/sources/brands.json     brand research: site, instructions, robots.txt notes, fit, disclaimer
data/tools.json              the tools catalog and the rules for which piece needs which tool
docs/ARCHETYPES.md           every archetype and spec option
docs/BRANDS.md               brand survey, ground rules and coverage
schema/                      JSON Schemas for piece.json and catalog specs (editor autocomplete)
public/pieces/<slug>/        piece.json for each piece (generated or hand-made)
public/pieces/catalog.json   picker list; index.json lists every slug
public/audio/<slug>/         narration MP3s + index.json
public/thumbs/<slug>.webp    picker thumbnails, rendered by our own 3D scene
public/share/<slug>.jpg      1200×630 link-preview card per piece; public/og.jpg is the site card; cards.json says what each was made from
scripts/share/               card design (card.mjs), shared words for cards and pages (lib.mjs), Nunito font (OFL)
scripts/share-*.mjs          share-cards renders the cards, share-pages writes /p/ pages + sitemap, share-check checks the cards
scripts/generate.mjs         catalog generator; archetypes live in scripts/gen/*.mjs
scripts/validate.mjs         data checks; tools-check.mjs checks tool rules
scripts/voice.py             narration generator (Kokoro-82M)
scripts/shots*.mjs           Playwright screenshot and UI checks
src/App.tsx                  screens and routing
src/data.ts                  expands a piece: poses, hardware instances, counts
src/scene/                   three.js scene, hardware models, camera and pose math
src/ui/                      picker (Catalog), Contribute/Request modals (Community), Tools window
src/config/affiliates.ts     the Amazon Associates tag and disclosure (one place)
src/voice.ts                 narration, voice commands, Media Session, Wake Lock
.github/ISSUE_TEMPLATE/      issue forms: furniture request, contribute furniture, bug report
```

## How the data is organized

- **One piece, one folder.** Everything the app needs for a piece is in `public/pieces/<slug>/piece.json`: parts, hardware, panel positions, steps, narration text, camera, safety and links. No code changes are needed to add one.
- **Generated pieces** start as a ~20-line spec in `catalog/<slug>.json`. `npm run gen` turns it into `piece.json`. Don't hand-edit a generated `piece.json`; change the spec and regenerate. `npm run validate` fails if generated files are stale.
- **Hand-made pieces** (`lack`, `kallax`, `billy`) are written directly as `piece.json` and registered in `HAND` and `HAND_META` in `scripts/generate.mjs`.
- **Brands** come from `data/sources/brands.json`. A piece's `brand` id sets its "Works with BRAND®" label and its brand's own not-affiliated line, and `productUrl` must be on that brand's site.
- **Facts only.** Specs hold names, dimensions, counts, minutes, people, and links to the brand's official product page and instructions. `sources` lists the pages the facts came from.
- **Narration audio** lives in `public/audio/<slug>/` and is keyed by text, so a clip only plays while its text still matches the JSON.
- **Tools** for each piece are resolved at runtime from the rules in `data/tools.json`.

## Add a piece of furniture

The short version is below. [CONTRIBUTING.md](CONTRIBUTING.md) has the full walkthrough, the content rules and the pull request checklist.

**Fastest: write a catalog spec.** If your piece is a bookcase, chest of drawers, cube shelf, table, bed, desk or similar, describe it in ~20 lines of JSON in `catalog/<slug>.json` and run `npm run gen`. The generator places every panel, the hardware, the steps, the camera, the flips and the safety callouts. See [docs/ARCHETYPES.md](docs/ARCHETYPES.md) for every option.

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

- `size` is W×D×H in cm, in the order the product page prints it.
- Non-IKEA pieces add `"brand": "<id from brands.json>"`, for example `catalog/ameriwood-parsons-desk.json` uses `"brand": "dorel"`.
- `instructionsUrl` (optional) links the brand's own instructions. We link it; we never copy or rehost it.
- `npm run gen` writes `public/pieces/<slug>/piece.json`, `index.json` and `catalog.json`.

**Fully custom: write `piece.json` by hand.** For anything the archetypes can't express, write `public/pieces/<slug>/piece.json` directly (format below), register it in `HAND` and `HAND_META` in `scripts/generate.mjs`, and run `npm run gen`.

**The rules, in short:** write every step in your own words; never add any brand's manuals, PDFs, drawings, photos or 3D models; record facts and official links only; respect robots.txt and never log in or get around bot protection; label pieces "Works with BRAND® X" with the brand's not-affiliated line. Details are in [CONTRIBUTING.md](CONTRIBUTING.md#content-rules-please-read).

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

## Voice narration

- Every step, every "how many" answer and the finish line have pre-generated MP3 clips in `public/audio/<slug>/`, plus an `index.json` that maps each clip to its text. Lines shared by all pieces are in `public/audio/common/`.
- Clips are made offline with [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0), voice `af_heart`.
- The app plays a clip only if its text still matches the piece JSON. Otherwise it uses the browser's own voice, so a new or edited piece works before its clips exist.
- To generate clips, use a Python environment with Kokoro installed:

```bash
pip install kokoro soundfile          # plus ffmpeg on your PATH
PYTHON=/path/to/venv/bin/python npm run voice -- <slug>   # one piece; omit <slug> for all
```

Only changed lines are regenerated. `VOICE` and `SPEED` environment variables override the defaults, but please keep `af_heart` for anything you send upstream so the app sounds consistent.

## Tools and affiliate links

A **Tools** button sits in the top bar next to the sound button, on the parts screen and on every build step. It shows how many tools the piece needs. On a phone's build bar it shrinks to a round wrench button with the count as a badge, so the progress bar keeps its room.

Tapping it opens the **Tools for this build** window. It's a bottom sheet on phones and a centered dialog on desktop. It's a real dialog: `role="dialog"`, `aria-modal`, focus stays inside, Esc, the backdrop or the X close it, the page behind can't scroll, and focus goes back to the button.

- The window shows the piece name under the title.
- Pieces that can tip over start with "This one can tip over. Anchor it to the wall before you fill it."
- **Must-have** comes first: hex key set and Phillips #2, plus the wall-anchor kit when the piece can tip.
- **Makes it easier** lists the rest, most useful first (drill, mallet, flathead, stubby, level, tape, pads, glue, knife).
- Each row has our own line icon, the tool name, one line on why this piece needs it, and a **Find on Amazon** link.
- The Amazon disclosure sits at the bottom of the window.

The finish screen keeps its one-line **Need tools?** reminder. Dressers, kids' chests and tall shelving lead with the wall-anchor kit.

**Tool-free pieces.** Some pieces go together by hand: LACK side table, the Floyd beds and the Seville wire shelving. They're marked `"toolFree": true` under `rules.slugs` in `data/tools.json`. For these:

- The pill reads **No tools** with a green check instead of a count (screen readers hear "No tools needed for this build").
- The window opens with "No tools needed. This one goes together by hand." There's no Must-have list, and never a hex key or Phillips #2.
- Only genuine helpers stay under **Makes it easier** (tape, pads, knife, a mallet for the Seville shelves). The wall-anchor kit sits under **For safety** when the piece can tip.
- The finish screen says "No tools this time. For the next build:" and suggests the basics.

`tools-check` fails if a tool-free piece adds a must-have tool, if one of its steps uses a hex key, screwdriver or drill, or if a piece's guide says "no tools needed" without the flag.

- **The tools catalog** is `data/tools.json`: 12 tools (hex key set, Phillips #2, flathead, stubby, rubber mallet, cordless drill/driver, tape measure, level, wood glue, felt pads, wall-anchor kit, utility knife) written in our own words.
- **The rules** in the same file decide which tools a piece needs. Every piece gets a hex key and a Phillips #2, except tool-free pieces (`slugs.<slug>.toolFree: true`). Tools are then added by category, archetype, category+archetype, hardware kind (cam locks add a flathead, nails and dowels add a mallet), and height (100 cm or taller adds anchors, a level and a drill). `slugs` adds or drops tools for one piece. Each tool's `why` list holds the one-line reasons: the first entry whose `if` matches the piece wins (`category`, `archetype`, `hardware` = all of these kinds present, `anchors` = the piece gets the wall-anchor kit), and the last entry is the catch-all. So a MALM dresser's mallet says "Taps the dowels and back-panel nails in without dents" and a wall shelf's drill says "Drills the holes for the wall brackets". `must: true` marks the must-haves. `src/tools.ts` resolves them and `npm run validate` checks them (`node scripts/tools-check.mjs --list --why` prints every piece's list with its reasons).
- **Links** are plain Amazon search links (`https://www.amazon.com/s?k=<query>&tag=…`). We don't use product pages, prices, star ratings or product images. Every link opens in a new tab with `rel="sponsored noopener nofollow"`.
- **The Associates tag** lives in one place: `src/config/affiliates.ts`.
- **Disclosure:** As an Amazon Associate, Hexkey earns from qualifying purchases. It's shown next to the links and in the app's footer line. Hexkey has no other sponsors, and no brand named here sponsors it.
- `npm run shots:tools -- <baseUrl> <outDir> <pieces>` tests the button and window in WebKit (iPhone 15, 320 and 375 px) and Chromium desktop. It checks the button is 44 px or bigger, sits next to the sound button and overlaps nothing, and that the badge matches the rows. It checks the dialog roles and title, that must-haves come first with a reason on every row, and the tip-over line. Every link must carry `tag=hexkey-20`, `rel="sponsored noopener nofollow"` and `target="_blank"`. The disclosure must be word for word, with no images or prices. It also checks the focus trap, the scroll lock, closing with Esc, the backdrop and the X, that focus returns, that Esc on a build step doesn't skip a step, the finish line, that the parts grid doesn't move, and that there's no sideways scroll. It saves screenshots too.

## Help it grow

Hexkey is meant to grow through its community, one piece of furniture at a time.

- **Contribute** (button in the app): a 30-second fit check, then a pre-filled [Contribute furniture](https://github.com/rchrdchn/hexkey/issues/new?template=contribute-furniture.yml) issue. Full guide: [CONTRIBUTING.md](CONTRIBUTING.md).
- **Request furniture** (button in the app): 👍 an [existing request](https://github.com/rchrdchn/hexkey/issues?q=is%3Aissue+is%3Aopen+label%3Afurniture-request+sort%3Areactions-%2B1-desc) or open a [new one](https://github.com/rchrdchn/hexkey/issues/new?template=furniture-request.yml). The most-wanted pieces get built first.
- **Feedback / bug report:** [open an issue](https://github.com/rchrdchn/hexkey/issues/new?template=bug-report.yml).

Issue forms live in `.github/ISSUE_TEMPLATE/` and use the labels `furniture-request`, `contribution` and `bug`. The in-app forms live in `src/ui/Community.tsx` and fill GitHub's issue forms through URL parameters, so there is no backend. The in-app link box accepts any https link to an official product or assembly-instructions page, for any brand, on the brand's own site or a store that sells the piece. It rejects plain http, home pages and direct PDF or image links, guesses the product name from the link, and fills in the brand when the site is in `data/sources/brands.json` (that list loads only when a form opens).

## How it works

- **Vite + React + TypeScript**, 3D with **three.js** via **@react-three/fiber** and **@react-three/drei** (CameraControls, ContactShadows, Edges, Lightformer environment). Rendering is on demand, so the GPU sleeps when nothing moves.
- `src/data.ts` expands a piece (step poses, hardware instances, counts). `src/scene/math.ts` does poses, the flat lay and camera framing. `src/scene/Scene.tsx` animates everything in one frame loop.
- `src/voice.ts`: narration (one reused `<audio>` element so iOS keeps it unlocked), `speechSynthesis` fallback, voice commands, Media Session, Wake Lock.
- Sound effects are synthesized with Web Audio; no files.
- `src/ui/Community.tsx`: the Contribute and Request modals (fit check, link check, pre-filled GitHub issue links, focus trap and Esc).
- `scripts/generate.mjs` + `scripts/gen/*.mjs`: the catalog generator (archetypes). The picker only loads `pieces/catalog.json` and small WebP thumbnails; a piece's full JSON loads when you open it.

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

## Link previews and share pages

When someone pastes a Hexkey link into iMessage, X, Slack, WhatsApp or Facebook, the preview shows a big 1200×630 card.

- **Site card** (`public/og.jpg`): "Flat-pack, without the headache", the live piece and brand counts, and three of our own exploded 3D renders.
- **Piece cards** (`public/share/<slug>.jpg`): the piece name, "Works with BRAND®", time, people, difficulty and steps, an exploded render of that piece from our own scene, and the brand's not-affiliated line. No brand logos, product photos or brand assets, ever.
- **Share pages.** The app's routes are hash routes (`#/malm-6`) and crawlers never see the part after `#`. So the build writes a real page per piece at `/p/<slug>/`. It is the app's own `index.html` with that piece's title, description and card, plus a one-line script that swaps the address to `/#/<slug>` before the app starts. People land straight in the guide (no redirect hop), and crawlers read the piece's meta. Without JavaScript the page shows the guide's name, stats and a link.
- **Share button.** On the parts screen the header Share button opens the share sheet with `/p/<slug>/` (or copies it). The "Built!" share card's text includes the same link.
- **Search indexing.** The site is indexable: no page has a `noindex` meta and no `X-Robots-Tag` header is sent. The spot for a `<meta name="robots">` line is marked in `index.html`; the share pages copy that head, so one line there would change every page.
- `sitemap.xml` lists the home page and every `/p/<slug>/` page. `llms.txt` describes the site and lists every guide. `robots.txt` welcomes all crawlers, AI bots included, and points to the sitemap. Unknown paths get `404.html` (a real 404). The IndexNow key file is `public/<key>.txt` (IndexNow keys are public by design); after a deploy that adds or renames pieces, ping `https://api.indexnow.org/indexnow` with the sitemap URLs and that key.

**Making the cards.** Cloudflare's build has no browser, so cards are rendered on your machine and committed, like thumbnails:

```bash
npm run build                                   # share-check fails here if a card is stale; build with `npx vite build` first in that case
npx vite preview --port 4191 &
npm run share-cards -- http://localhost:4191    # only stale cards (about 1.3 s each); add `all` to redo everything
```

A card is stale when its piece's name, title, brand, stats or geometry changes, or when `DESIGN` in `scripts/share/lib.mjs` is bumped after a design change. All 146 cards take about 3 minutes and weigh about 11.5 MB (65 to 110 KB each). The renders come from `/?thumb=<slug>&explode=0.32&zoom=0.9&bg=none&dpr=2`.

## Deployment

- The site is fully static. `npm run build` writes `dist/`.
- It's deployed on **Cloudflare Pages** from the `main` branch: build command `npm run build`, output directory `dist`, `NODE_VERSION=20`. Every push to `main` goes live at [hexkey.pages.dev](https://hexkey.pages.dev).
- `public/_headers` and `public/robots.txt` ship with the site. Crawlers, including AI bots, are welcome. The build adds `sitemap.xml`, `llms.txt`, `404.html` and the `/p/<slug>/` share pages. Because `404.html` exists, Cloudflare Pages returns a real 404 for unknown paths instead of the app; the app only uses `/` plus hash routes, so nothing else changes.
- **GitHub Actions is turned off** for this repo. `.github/workflows/ci.yml` is kept for reference only, so run `npm run validate && npm run build` yourself before every pull request.
- No secrets live in the repo, and the build needs none.

## Contributing

Contributions are very welcome: new furniture, fixes to steps, bug reports, requests and code. Start with [CONTRIBUTING.md](CONTRIBUTING.md). It covers setup, the content rules, a step-by-step example for adding a piece, and the pull request checklist.

## License

- **Code:** [MIT](LICENSE).
- **Furniture data and narration audio** (`public/pieces`, `public/audio`): [CC BY-SA 4.0](LICENSE-DATA), credited to "Hexkey contributors".
- Narration is generated with [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) (Apache-2.0).

## Trademarks and disclaimer

IKEA and the product names used here (LACK, KALLAX, BILLY, MALM, HEMNES and the others) are trademarks of Inter IKEA Systems B.V. Walker Edison, Ameriwood Home, Novogratz, Zinus, Sauder, South Shore, Prepac, ClosetMaid, Tribesigns, Nathan James, VASAGLE, SONGMICS, FlexiSpot, UPLIFT Desk, Bestar, Linon, Delta Children, Seville Classics, Branch, VIVO, Storkcraft, Plank+Beam, Max & Lily, Eureka Ergonomic, ECR4Kids, Floyd and their product names are trademarks of their respective owners. They are used here only to say which products these guides are written for.

Hexkey is an independent project and is **not affiliated with, sponsored by or endorsed by Inter IKEA Systems B.V. or any other brand named here** (the full list is in [data/sources/brands.json](data/sources/brands.json)). No brand named here sponsors Hexkey.

It contains no manufacturer instructions, drawings, images or 3D models. Every model is built in code from public dimensions and every step is written from scratch. Each piece links to its brand's own product page and, where public, the brand's own instructions.

The guides are provided as-is. Check your parts against the official instructions, anchor tall furniture to the wall, and get help for heavy lifts.
