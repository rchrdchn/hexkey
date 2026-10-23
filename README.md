# Hexkey

**Flat-pack, talked through.** Hexkey is an open-source, voice-guided 3D assembly guide for flat-pack furniture.
Pick your piece, check off what's in the box, then build it step by step. A voice tells you what to do, the 3D model shows you, and you can keep your hands on the furniture.

> Works with IKEA® LACK, KALLAX and BILLY. **Hexkey is not affiliated with, sponsored by or endorsed by Inter IKEA Systems B.V.**
> The steps here are our own and are a demo. Always follow the official instructions that came in your box.

| Pick | Check the box | Build | Done |
|---|---|---|---|
| Choose a piece. It spins in 3D. | Tap each part and hardware bag as you find it. Parts are color-matched to the 3D model. | Parts lift off the floor and fly into a glowing ghost outline. Hardware pops in with ×N counts; cam locks turn. | Confetti, a turntable and a share card with your build time. |

## What's in the demo

| Piece | Steps | Parts | Hardware | Shows off |
|---|---|---|---|---|
| **LACK** side table 55×55 | 5 | 5 | 4 | The quick opener: legs spin on, the table flips over |
| **KALLAX** 2×2 shelf unit | 8 | 7 | 29 | Cam pins, dowels and cam locks that actually turn |
| **BILLY** 80×202 bookcase | 14 | 12 | 86 | The hero: lying down, rolled over to nail the back, stood up, shelves in, anchored |

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
- Progress for the parts check-off is saved on the device. No accounts, no tracking, no backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # validate data + typecheck + build to dist/
npm run preview    # serve dist/ on http://localhost:4173
```

Node 20+. The output in `dist/` is a static site; it is deployed on Cloudflare Pages (build command `npm run build`, output `dist`, `NODE_VERSION=20`).

## Add a piece of furniture

Everything about a piece lives in one open JSON file: `public/pieces/<slug>/piece.json`. No code changes are needed.

1. **Measure.** Use the dimensions printed on the product page and a tape measure. Dimensions are facts; anyone can use them.
2. **Write `piece.json`** (format below). Start by placing every panel where it ends up in the finished piece, then write the steps that add them.
3. **Add the slug** to `public/pieces/index.json` (and to `SLUGS` in `src/data.ts`).
4. `npm run validate` checks ids, references, counts and audio.
5. `npm run dev`, open `/#/<slug>` and step through it. Tweak `view`, `from` and `pose` until each step reads at a glance.
6. **Generate the voice** (optional; the browser voice is used until you do):
   ```bash
   PYTHON=/path/to/venv-with-kokoro/bin/python npm run voice -- <slug>
   ```
   Needs `pip install kokoro soundfile` and `ffmpeg`. Only changed lines are regenerated.
7. Open a pull request with screenshots.

### Rules for contributions (please read)

- **Write your own steps.** Do not copy text, drawings or step layouts from any manufacturer's manual, and never add their PDFs, images, photos or 3D models to this repo.
- **Model parts in code** from dimensions: every panel is a box; hardware comes from the built-in kit.
- **Link to the official product page** in `productUrl` (not to PDFs or other files).
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
| `hardware kinds` | `dowel`, `campin`, `cam`, `screw`, `nail`, `bolt`, `shelfpin`, `bracket` (see `src/scene/Hardware.tsx`). |
| `view` | Camera azimuth (0 = front, 90 = right side) and elevation. The camera frames the new parts plus what's built; `tight: true` frames only the new parts and hardware. |

## How it works

- **Vite + React + TypeScript**, 3D with **three.js** via **@react-three/fiber** and **@react-three/drei** (CameraControls, ContactShadows, Edges, Lightformer environment). Rendering is on demand, so the GPU sleeps when nothing moves.
- `src/data.ts` expands a piece (step poses, hardware instances, counts). `src/scene/math.ts` does poses, the flat lay and camera framing. `src/scene/Scene.tsx` animates everything in one frame loop.
- `src/voice.ts`: narration (one reused `<audio>` element so iOS keeps it unlocked), `speechSynthesis` fallback, voice commands, Media Session, Wake Lock.
- Sound effects are synthesized with Web Audio; no files.
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

IKEA, LACK, KALLAX and BILLY are trademarks of Inter IKEA Systems B.V. They are used here only to say which products these guides are written for.
Hexkey is an independent project and is **not affiliated with, sponsored by or endorsed by Inter IKEA Systems B.V.** It contains no IKEA instructions, drawings, images or 3D models; every model is built in code from public dimensions and every step is written from scratch.
The guides are provided as-is. Check your parts against the official instructions, anchor tall furniture to the wall, and get help for heavy lifts.
