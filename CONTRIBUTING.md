# Contributing to Hexkey

Hexkey grows one piece of furniture at a time, and every piece comes from someone who built it. Thanks for helping.

> **Hexkey is not affiliated with, sponsored by or endorsed by Inter IKEA Systems B.V.** IKEA and product names are trademarks of Inter IKEA Systems B.V., used only to say which products a guide is written for.

## Ways to help

| You have | Do this |
|---|---|
| A piece you've built (or one still in the box) and an evening | **Add it.** Open a [Contribute furniture](https://github.com/rchrdchn/hexkey/issues/new?template=contribute-furniture.yml) issue so nobody duplicates the work, then send a pull request. |
| A piece you'd love to see | **Request it.** First check [open requests](https://github.com/rchrdchn/hexkey/issues?q=is%3Aissue+is%3Aopen+label%3Afurniture-request+sort%3Areactions-%2B1-desc) and add a 👍. If it's not there, open a [Furniture request](https://github.com/rchrdchn/hexkey/issues/new?template=furniture-request.yml). |
| A step that looks wrong, or a bug | **Tell us** with a [Feedback / bug report](https://github.com/rchrdchn/hexkey/issues/new?template=bug-report.yml). |
| The piece and no time to write JSON | **Measure or test.** Comment on a request with dimensions, or step through a draft guide and report what's off. |

The **Contribute** button in the app runs a quick fit check and fills in the issue for you.

### Is my piece a good fit?

- ✅ **Great fit:** you have the piece (built or in the box), you can write step data or measurements, and it's around 25 steps or fewer.
- 🤔 **Could work:** very long builds, or big systems (wardrobes, kitchens, beds). Start with one module or one section.
- 💡 **Better as a request:** you don't have the piece in hand. Requests with lots of 👍 get built first.

## The one rule: your own words, no IKEA files

- **Write every step from scratch** in your own words. Do not copy text, drawings or step layouts from any manual.
- **Never commit or attach** IKEA manuals, PDFs, drawings, product photos, screenshots of manuals or 3D models, in the repo, in issues or in pull requests.
- **Model parts in code** from dimensions (every panel is a box). Dimensions are facts; measure them yourself or take them from the product page.
- `productUrl` must be the official **ikea.com product page** (`https://www.ikea.com/<country>/<lang>/p/...`), never a PDF or asset link. `npm run validate` enforces this.
- Include the safety steps the real product needs: wall anchoring, two-person lifts.

Pull requests that include manufacturer assets will be closed.

## Add a piece, step by step

```bash
git clone https://github.com/rchrdchn/hexkey && cd hexkey
npm install
npm run dev            # http://localhost:5173
```

1. **Measure.** Write down every panel's width, height and depth in centimeters, and every bag of hardware and its count.
2. **Create `public/pieces/<slug>/piece.json`.** Copying `public/pieces/lack/piece.json` is the easiest start. The [data format](README.md#data-format) explains every field, and [`schema/piece.schema.json`](schema/piece.schema.json) gives you autocomplete in VS Code.
   - First place every panel (`objects`) where it sits in the finished piece.
   - Then write `steps` that `add` those objects in build order, with a 2-5 word `caption` and a one or two sentence `say`.
3. **Register it:** add the slug to `public/pieces/index.json` and to `SLUGS` in `src/data.ts`.
4. **Validate:**
   ```bash
   npm run validate     # ids, references, counts, productUrl, audio
   npm run build        # validate + typecheck + production build
   ```
5. **Step through it** at `http://localhost:5173/#/<slug>`. Tweak `view`, `from` and `pose` until each step reads at a glance on a phone.
6. **Voice (optional).** The browser's voice is used until clips exist. To generate clips: `PYTHON=/path/to/venv/bin/python npm run voice -- <slug>` (needs `pip install kokoro soundfile` and `ffmpeg`).
7. **Open a pull request** that links your Contribute issue and includes a few screenshots of Hexkey (not of the manual). `npm run shots` can take them for you.

### Pull request checklist

- [ ] `npm run build` passes with no errors.
- [ ] Steps are written in my own words; no IKEA text, images, PDFs or models are included.
- [ ] `productUrl` is the ikea.com product page.
- [ ] Safety steps (anchoring, two people) are included where the product needs them.
- [ ] Screenshots of the new piece in Hexkey on a phone-size screen.

## Code changes

Bug fixes and features are welcome too. Keep it static (no backend, no tracking), test on a phone-size screen in Safari and Chrome, and run `npm run build` before opening a pull request.

## Licensing

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

Be kind; we're all just trying to find the last cam lock.
