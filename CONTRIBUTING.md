# Contributing to Hexkey

Hexkey grows one piece of furniture at a time, and every piece comes from someone who built it. Thanks for helping.

> **Hexkey is not affiliated with, sponsored by or endorsed by IKEA or any other brand named in this repo.** Brand and product names are trademarks of their owners, used only to say which products a guide is written for.

## Contents

- [Ways to help](#ways-to-help)
- [Content rules (please read)](#content-rules-please-read)
- [Set up locally](#set-up-locally)
- [Add a piece with a catalog spec (easiest)](#add-a-piece-with-a-catalog-spec-easiest)
- [Add a piece by hand](#add-a-piece-by-hand)
- [Add a new brand](#add-a-new-brand)
- [Code changes](#code-changes)
- [Branches and pull requests](#branches-and-pull-requests)
- [Pull request checklist](#pull-request-checklist)
- [Licensing of contributions](#licensing-of-contributions)
- [Labels](#labels)

## Ways to help

| You have | Do this |
|---|---|
| A piece you've built (or one still in the box) and an evening | **Add it.** Open a [Contribute furniture](https://github.com/rchrdchn/hexkey/issues/new?template=contribute-furniture.yml) issue so nobody duplicates the work, then send a pull request. |
| A piece you'd love to see | **Request it.** First check [open requests](https://github.com/rchrdchn/hexkey/issues?q=is%3Aissue+is%3Aopen+label%3Afurniture-request+sort%3Areactions-%2B1-desc) and add a 👍. If it's not there, open a [Furniture request](https://github.com/rchrdchn/hexkey/issues/new?template=furniture-request.yml). |
| A step that looks wrong, or a bug | **Tell us** with a [Feedback / bug report](https://github.com/rchrdchn/hexkey/issues/new?template=bug-report.yml). Include the piece, the step number and your device. |
| The piece and no time to write JSON | **Measure or test.** Comment on a request with dimensions and hardware counts, or step through a guide and report what's off. |
| Code skills | **Improve the app:** a new archetype, a better camera angle, accessibility, performance. See [Code changes](#code-changes). |

The **Contribute** button in the app runs a quick fit check and fills in the issue for you. Its link check currently accepts ikea.com product pages. For other brands, open the issue on GitHub and paste the brand's product page link.

### Is my piece a good fit?

- ✅ **Great fit:** you have the piece (built or in the box), you can write step data or measurements, and it's around 25 steps or fewer.
- 🤔 **Could work:** very long builds, or big systems (wardrobes, kitchens, bunk beds). Start with one module or one section.
- 💡 **Better as a request:** you don't have the piece in hand. Requests with lots of 👍 get built first.

## Content rules (please read)

These rules keep Hexkey legal and trustworthy. Pull requests that break them will be closed.

**Your own words, no brand files**

- **Write every step from scratch** in your own words. Don't copy text, drawings or step layouts from any manual.
- **Never commit or attach** any brand's manuals, PDFs, drawings, product photos, screenshots of manuals, logos or 3D models. That applies to the repo, issues and pull requests.
- **Model parts in code** from dimensions. Every panel is a box, and hardware comes from the built-in kit.
- **No scraped content.** Don't paste product descriptions, reviews or other copy from a website.

**Facts and official links only**

- Record **facts**: names, SKUs, dimensions, part and hardware counts, minutes, number of people. Measure them yourself or take them from the product page.
- `productUrl` must be the brand's **official product page**, never a PDF or asset link. For IKEA that's an ikea.com `/p/` page. For other brands it must be on the brand's own site listed in `data/sources/brands.json`. `npm run validate` enforces this.
- `instructionsUrl` may **link** the brand's own instructions. Never download, rehost or quote them.
- List the pages your facts came from in `sources`, and be honest in `confidence`.

**Fetch politely**

- Respect robots.txt and each site's terms. Go slow.
- Never log in, solve captchas or get around bot protection to reach anything.
- If a site blocks you, stop and note it in `data/sources/brands.json` instead.

**Labels and sponsors**

- Every piece is labeled **"Works with BRAND® X"** (the `worksWith` field) and shows its brand's not-affiliated line, which comes from `data/sources/brands.json`.
- Don't present any brand, IKEA, TaskRabbit or any retailer as a sponsor or partner of Hexkey. The only paid links are the Amazon tool links described in the [README](README.md#tools-and-affiliate-links).

**Safety and style**

- Include the safety steps the real product needs: wall anchoring, two-person lifts.
- Keep captions to 2-5 words and narration to one or two short sentences.

## Set up locally

You need Node 20 or newer (`.nvmrc` pins 20) and npm.

```bash
git clone https://github.com/rchrdchn/hexkey && cd hexkey
npm install
npm run dev            # http://localhost:5173
```

Optional, depending on what you're doing:

- **Browser checks and thumbnails:** `npx playwright install chromium webkit`, plus `ffmpeg` for thumbnails.
- **Narration clips:** Python 3 with `pip install kokoro soundfile`, plus `ffmpeg`.

## Add a piece with a catalog spec (easiest)

Most pieces fit an archetype: bookcase, chest of drawers, cube shelf, table, desk, standing desk, bed, platform bed, crib, wall shelf, ladder shelf, frame shelf, wire shelf, stool. All options are in [docs/ARCHETYPES.md](docs/ARCHETYPES.md).

**Worked example:** a desk from a brand that's already in the catalog, saved as `catalog/ameriwood-parsons-desk.json`.

1. **Pick a slug.** Lowercase with hyphens, usually `<brand>-<product>-<variant>`.
2. **Copy a similar spec.** For a desk, copy `catalog/ameriwood-parsons-desk.json`. For a dresser, copy `catalog/malm-3.json`.
3. **Fill in the facts** from the official product page:

   ```json
   {
     "$schema": "../schema/catalog-spec.schema.json",
     "slug": "ameriwood-parsons-desk",
     "name": "PARSONS",
     "title": "Desk with drawer",
     "brand": "dorel",
     "archetype": "table",
     "category": "desks",
     "size": [99.0, 50.0, 76.0],
     "worksWith": "Ameriwood Home® Parsons computer desk with drawer (9178196), 39×19.7×30\" (W×D×H)",
     "productUrl": "https://www.dorelhome.com/products/ameriwood-home-parsons-computer-desk-with-drawer-4",
     "color": "#f1efea",
     "confidence": "medium",
     "sources": ["https://www.dorelhome.com/products/ameriwood-home-parsons-computer-desk-with-drawer-4"],
     "options": { "tt": 4, "leg": { "s": 5, "inset": 0 }, "topLabel": "Desk top (drawer built in)", "mount": "dbolt" },
     "tags": ["desk", "parsons", "home office", "ameriwood", "dorel"],
     "notes": "The top arrives with its drawer already built; you add four legs. (trimmed)",
     "people": 2,
     "minutes": 20
   }
   ```

   - `brand` is an `id` from `data/sources/brands.json`. Leave it out for IKEA.
   - `size` is W×D×H in cm, in the order the product page prints it.
   - `worksWith` starts with the brand label and ®, for example "Ameriwood Home® Parsons …".
   - `category` is one of `bedroom`, `desks`, `dressers`, `kids`, `shelving`, `storage`, `tables`.
   - `notes` explains anything you guessed. The schema gives you autocomplete in VS Code.

4. **Generate and validate:**

   ```bash
   npm run gen        # writes public/pieces/<slug>/piece.json, index.json and catalog.json
   npm run validate
   ```

5. **Step through it** at `http://localhost:5173/#/<slug>` on a phone-size window. Check each step reads at a glance, safety callouts appear, and the counts look right.
6. **Thumbnail:** `npm run build && npm run preview`, then in another terminal `npm run thumbs -- http://localhost:4173 <slug>`. This writes `public/thumbs/<slug>.webp`.
7. **Narration (optional):** `PYTHON=/path/to/venv/bin/python npm run voice -- <slug>`. Until clips exist, the app uses the browser's voice.
8. **Open a pull request** (see below).

If your piece almost fits an archetype, a new option or a new archetype is a welcome code PR. [docs/ARCHETYPES.md](docs/ARCHETYPES.md#adding-a-new-archetype) explains how.

## Add a piece by hand

For anything the archetypes can't express:

1. **Measure.** Write down every panel's width, height and depth in centimeters, and every bag of hardware and its count.
2. **Create `public/pieces/<slug>/piece.json`.** Copying `public/pieces/lack/piece.json` is the easiest start. The [data format](README.md#data-format) explains every field, and [`schema/piece.schema.json`](schema/piece.schema.json) gives you autocomplete.
   - First place every panel (`objects`) where it sits in the finished piece.
   - Then write `steps` that `add` those objects in build order, with a 2-5 word `caption` and a one or two sentence `say`.
3. **Register it:** add the slug to `HAND` (and its category to `HAND_META`) in `scripts/generate.mjs`, then run `npm run gen`.
4. **Validate and step through it**, then add a thumbnail and narration as in steps 5-7 above.

## Add a new brand

1. Check the brand's robots.txt and terms first. If they bar automated collection, stop.
2. Add an entry to `data/sources/brands.json`. Copy an existing one and fill in `id`, `name`, `label` (with ®), `site`, `instructions`, `access`, `robots`, `fit`, `disclaimer` ("Not affiliated with or endorsed by …"), `status` and `checked`.
3. Add a row to [docs/BRANDS.md](docs/BRANDS.md) and the trademark line in the README.
4. Then add pieces with `"brand": "<id>"`.

## Code changes

Bug fixes and features are welcome.

- **Stack:** Vite, React 19, TypeScript (`strict`), three.js via @react-three/fiber and drei.
- **Style:** match the code around you. There's no linter or formatter config, so keep diffs small and readable, and `npm run typecheck` must pass.
- **Keep it static:** no backend, no accounts, no tracking, no new third-party requests.
- **Data over code:** if something can be expressed in `piece.json`, a catalog spec or `data/tools.json`, put it there.
- **Test on phones.** Check Safari on iPhone (or `npm run shots` in WebKit) and Chrome. Tap targets should be at least 44 px.
- If you change the tool rules in `src/tools.ts`, mirror them in `scripts/tools-check.mjs`. If you change `howManyText()` in `src/data.ts`, mirror it in `scripts/voice.py`.

## Branches and pull requests

1. Fork the repo and create a branch from `main`, for example `piece/ameriwood-parsons-desk` or `fix/kallax-camera`.
2. Keep one piece or one fix per pull request.
3. Write clear commit messages that say what changed and why, for example "Add Ameriwood Home Parsons desk (table archetype, medium confidence)".
4. Run the checks below, then open the pull request against `main`. Link your Contribute issue if there is one.
5. **GitHub Actions is turned off** for this repo, so nothing runs automatically. Run the checks yourself and say in the pull request that they passed.

Checks to run before every pull request:

```bash
npm run validate
npm run build          # validate + typecheck + production build
npm run shots:catalog -- http://localhost:4173 shots/catalog chromium,webkit <slug>   # optional, with npm run preview running
```

## Pull request checklist

- [ ] `npm run validate` and `npm run build` pass with no errors.
- [ ] Steps are written in my own words. No brand text, images, PDFs, logos or models are included.
- [ ] `productUrl` is the brand's official product page; `sources` lists where the facts came from.
- [ ] `worksWith` reads "BRAND® product …" and the piece uses a `brand` id from `data/sources/brands.json`.
- [ ] Nothing was fetched against robots.txt, behind a login or past bot protection.
- [ ] Safety steps (anchoring, two people) are included where the product needs them.
- [ ] `confidence` is honest, and anything guessed is explained in `notes`.
- [ ] Generated files (`piece.json`, `index.json`, `catalog.json`) are regenerated and committed.
- [ ] Screenshots of the new piece in Hexkey on a phone-size screen (not of the manual).

## Licensing of contributions

By contributing you agree that:

- **Code** is licensed under the [MIT License](LICENSE).
- **Furniture data and narration audio** (`public/pieces/**`, `public/audio/**`) are licensed under [CC BY-SA 4.0](LICENSE-DATA), credited to "Hexkey contributors".
- You wrote the contribution yourself and have the right to license it this way.

## Labels

| Label | Used for |
|---|---|
| `furniture-request` | Pieces people want. Sort by 👍 to see what's most wanted. |
| `contribution` | Someone is working on a piece. Comment before starting the same one. |
| `bug` | Bugs and feedback. |

## Be kind

Be kind and patient in issues and reviews. We're all just trying to find the last cam lock.
