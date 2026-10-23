# Furniture brands × assembly instructions (Hexkey research)

_Updated 2026-10-23 (PT). Machine-readable copy: [data/sources/brands.json](../data/sources/brands.json)._

**What this is:** a survey of 46 furniture brands — big, medium and small/direct-to-consumer — covering where each keeps its assembly instructions, whether they're public, robots.txt/terms notes, popular flat-pack products, and how well they fit Hexkey's archetypes (1–5).

**How it was gathered (ground rules):**
- Polite fetcher only: user agent `HexkeyResearch/0.1`, 2–10 s between requests (more where `Crawl-delay` asked), robots.txt checked first, no logins, no captchas, no bot-protection bypass. 94 logged requests in total.
- When a site blocked us (403/423/429/TLS refusal/bot challenge), we stopped and recorded it. A few facts for blocked or JS-only brands came from public web-search results (retailer listings quoting the maker); those pieces are marked `medium` confidence and say so in their notes.
- Facts only (names, SKUs, dimensions, counts, minutes, people, links). No brand PDFs, diagrams, images or text were copied or stored in the repo. Instruction PDFs are **linked** (`instructionsUrl`), never rehosted.

## Coverage

| Tier | Brands | Included (pieces) | Research-only (queued) | Skipped (blocked/terms) |
|---|---|---|---|---|
| big | 16 | 8 | 5 | 3 |
| medium | 20 | 10 | 5 | 5 |
| small | 10 | 2 | 8 | 0 |
| **total** | **46** | **20** | **18** | **8** |

## Pieces in the catalog by brand

| Brand | Pieces |
|---|---|
| IKEA | 35 |
| Walker Edison | 10 |
| Dorel Home (Ameriwood Home, DHP, Novogratz, Cosco) | 5 |
| Zinus | 13 |
| Sauder | 1 |
| South Shore | 1 |
| Prepac | 1 |
| ClosetMaid (Home by Ames) | 1 |
| Tribesigns | 3 |
| Nathan James | 5 |
| SONGMICS / VASAGLE | 2 |
| FlexiSpot | 1 |
| UPLIFT Desk | 1 |
| Bestar | 4 |
| Linon | 2 |
| Delta Children | 2 |
| Seville Classics | 6 |
| Branch | 3 |
| VIVO | 2 |
| Storkcraft | 11 |
| **total** | **109** |

## Big brands and big-box retailers

| Brand | Status | Fit | Where instructions live | Access | robots.txt / terms | Popular flat-pack | Notes |
|---|---|---|---|---|---|---|---|
| [IKEA](https://www.ikea.com) | included | 5 | Product page → "Assembly and documents" (PDF per article) | public, no login | allows /p/ pages | KALLAX, BILLY, MALM, HEMNES, LACK, BRIMNES, MICKE, IVAR | 35 pieces in the catalog. |
| [Walker Edison](https://www.walkeredison.com) | included | 5 | Product page "Assembly Instructions" PDF (images.salsify.com) + Assembly Guides/Videos help pages | public, no login | Shopify default; /products/*.json not disallowed | Holmes bookcase, Rebecca 6-drawer dresser, Domm nightstand, Kelm TV stand, Amira bookshelf | Specs from product JSON; dims listed H × L × W. |
| [Dorel Home (Ameriwood Home, DHP, Novogratz, Cosco)](https://www.dorelhome.com) | included | 4 | Product page "Assembly Instructions" PDF on cdn.dorelhome.com/DorelHomeFiles/ProductDocuments/ | public, no login | Shopify default; allowed | Parsons desk/tables/TV stand, Her Majesty nightstand, Westerleigh dresser, Farmington cabinet | Product pages often leave dimension fields blank; dims cross-checked with retailer listings quoting manufacturer copy → medium confidence. |
| [Zinus](https://www.zinus.com) | included | 5 | Product page "Assembly Instructions" PDF on Shopify CDN | public, no login | Crawl-delay 10; products allowed | Mia metal platform bed, Moiz wood platform bed, Allen bed, Linda bed | Mia, Moiz and Allen in twin, full, queen and king (outer-frame sizes from each page's "Dimensions and Weight" list); Linda queen only (its page lists no per-size dimensions); Suzanne page returned 503 → skipped. |
| [Sauder](https://www.sauder.com) | included | 4 | Instruction book lookup/request by model number (/service/instruction-book-request) | public | Disallows /Dimensions, /services/, /compare; spec panel loads from a disallowed endpoint so specs were NOT fetched | Beginnings bookcases, Select bookcases, Cannery Bridge, standing desks | Facts from retailer listings via web search only → medium confidence, 1 piece. |
| [South Shore](https://www.southshorefurniture.com) | included | 4 | Product page assembly PDF / support "Assembly instructions" by model | site returned 423 to our fetcher | n/a (blocked) | Axess bookcase, Step One dresser, Libra | Site blocked (HTTP 423) → not crawled; 1 piece from retailer listings via web search, medium confidence. |
| [Prepac](https://www.prepacmfg.com) | included | 4 | Product page "Assembly Instructions" PDF | TLS connection refused for our fetcher | n/a (blocked) | Sonoma/Fremont 6-drawer dresser, Elite storage, shoe cubbies | Site unreachable (TLS failure) → 1 piece from retailer listings via web search, medium confidence. |
| [ClosetMaid (Home by Ames)](https://www.homebyames.com) | included | 4 | Product page instructions PDF (Cubeicals) | public; closetmaid.com redirects to homebyames.com | not crawled (facts via web search) | Cubeicals 9-cube, 3-cube, 6-cube | 1 piece from the brand listing via web search, medium confidence. |
| [Bush Furniture](https://www.bushfurniture.com) | research-only | 4 | Assembly instructions by model in support section | TLS/connection failure | n/a (blocked) | Cabot, Somerset, Studio C desks | Site unreachable → queued. _(unverified: from general knowledge)_ |
| [HON](https://www.hon.com) | research-only | 2 | Product documents / installation instructions per series | public | Crawl-delay 60 | office desking, files | Mostly contract office furniture; low flat-pack fit. |
| [Ashley (Signature Design RTA)](https://www.ashleyfurniture.com) | research-only | 3 | Assembly instructions linked on RTA product pages | public | unverified (general knowledge, site not checked) | Signature Design RTA dressers/bookcases | Mostly delivered assembled; queued. _(unverified: from general knowledge)_ |
| [Wayfair (incl. AllModern)](https://www.wayfair.com) | skipped | 2 | Marketplace; manufacturer PDFs per listing | HTTP 429 on home page | n/a (rate-limited) | marketplace | Blocked → skipped. Marketplace, not a brand. |
| [Target (Room Essentials, Threshold, Brightroom)](https://www.target.com) | research-only | 3 | "Assembly instructions" PDF links on some product pages | JS-rendered pages | robots reachable; terms bar scraping | Room Essentials 3-shelf bookcase, Brightroom cubes | Terms bar automated collection → no pieces. |
| [Walmart (Mainstays)](https://www.walmart.com) | research-only | 3 | Manuals linked on some listings; mainstays.com unreachable | JS pages | Crawl-delay 5; terms bar scraping | Mainstays 3/5-shelf bookcase, Mainstays 9-cube | Terms bar automated collection → no pieces. |
| [Amazon Basics](https://www.amazon.com) | skipped | 2 | "User Manual (PDF)" under product docs | 202 bot challenge | n/a | Amazon Basics desks/shelves | Bot challenge → skipped (no bypass). |
| [The Home Depot (StyleWell, Hampton Bay)](https://www.homedepot.com) | skipped | 2 | "Instructions / Assembly" PDFs under Specifications | HTTP 403 | n/a (blocked) | StyleWell | Blocked → skipped. |

## Medium brands

| Brand | Status | Fit | Where instructions live | Access | robots.txt / terms | Popular flat-pack | Notes |
|---|---|---|---|---|---|---|---|
| [West Elm](https://www.westelm.com) | skipped | 2 | Care & assembly PDFs on product pages | HTTP 403 | n/a (blocked) | Mid-Century dresser | Blocked → skipped; most pieces arrive assembled. |
| [Pottery Barn](https://www.potterybarn.com) | skipped | 2 | Assembly instructions on product pages | HTTP 403 | n/a (blocked) |  | Blocked → skipped. |
| [CB2](https://www.cb2.com) | skipped | 2 | Assembly PDFs on product pages | HTTP 403 even on robots.txt | n/a (blocked) |  | Blocked → skipped. |
| [Crate & Barrel](https://www.crateandbarrel.com) | skipped | 2 | Assembly PDFs on product pages | HTTP 403 even on robots.txt | n/a (blocked) |  | Blocked → skipped. |
| [Room & Board](https://www.roomandboard.com) | skipped | 2 | Assembly instructions on product pages | HTTP 403 | Crawl-delay 10 |  | Blocked → skipped; mostly delivered assembled. |
| [Article](https://www.article.com) | research-only | 3 | Assembly guides per product (help centre) | public | Crawl-delay 1 | Sofas (bolt-on legs), beds | Mostly upholstered; low archetype fit. Queued. |
| [Floyd](https://floydhome.com) | research-only | 4 | Assembly videos/guides per product | public | unverified (general knowledge, site not checked) | Floyd Bed, Floyd Table, Shelving System | Good fit (bolt-together); queued. _(unverified: from general knowledge)_ |
| [Burrow](https://burrow.com) | research-only | 3 | Assembly guides per product | public | Crawl-delay 10 | Range shelving, Serif | Queued. |
| [Tribesigns](https://www.tribesigns.com) | included | 5 | Product page installation manual PDF on Shopify CDN | public | Crawl-delay 10 | 5-tier ladder bookshelf, computer desks, L-desks | One page returned 503 → skipped that item. |
| [Nathan James](https://nathanjameshome.com) | included | 4 | Instructions in box; product pages list assembly minutes (no PDF seen) | public | Crawl-delay 10; .json 404 so HTML specs used | Theo ladder shelf, Parker desk, Haven bookcase, Andrew nightstand |  |
| [SONGMICS / VASAGLE](https://www.songmics.com) | included | 4 | "Important instructions" section on product pages; manual PDFs not linked on the pages we read | public, no login (songmics.com; vasagle.com still TLS failure) | Shopify default; products allowed | VASAGLE CUSTOS 6-tier bookshelf (ULBC412), VASAGLE LIRY nightstand (ULET699), cube storage, ladder shelves | Pages are mostly script-rendered; size and tier/drawer counts taken from the product titles on songmics.com. No instructions link, so pieces carry no instructionsUrl. |
| [FlexiSpot](https://www.flexispot.com) | included | 5 | Product page "Downloads" → E7 manual | public | verified 2026-10-23 | E7 standing desk frame, E5, Comhar |  |
| [UPLIFT Desk](https://www.upliftdesk.com) | included | 5 | Assembly & programming page + Specs/Assembly tab | public | verified 2026-10-23 | UPLIFT V2 standing desk |  |
| [Bestar](https://www.bestar.com) | included | 4 | Product page "View assembly instructions" → Salsify-hosted PDF | public, no login | Shopify default; products allowed | Universel tall 5-shelf bookcase, 20W nightstand, murphy beds, L-desks | Assembled width/depth/height in the page data; the visible "75×120×65 cm" block is a page template default, so we ignored it. |
| [Linon](https://www.linon.com) | included | 3 | No public instructions link seen on product pages; "assembly required" noted in copy | public, no login | Shopify default; products allowed | Cody 2/4/6 cube unit, Cosgrove ladder bookcase, Hudson dressers and nightstands | Many Linon pieces ship mostly assembled ("only the legs"), so we skipped those and took the Cody cube units, which need full assembly. Cody outer size is worked out from the published inner cube size → low confidence. |
| [Delta Children](https://www.deltachildren.com) | included | 5 | Product page "Assembly Instructions" PDF on Shopify CDN + tips video | public | Shopify default; allowed | Rowen 4-drawer dresser, Haven 6-drawer dresser, Sutton dresser, toy organizers |  |
| [KidKraft](https://www.kidkraft.com) | research-only | 3 | Instructions lookup by item number | public | Crawl-delay 10 | play kitchens, bookcases | Toys dominate; queued. |
| [Furinno](https://www.furinno.com) | research-only | 4 | Instructions on product pages | sitemap 502 | unverified (general knowledge, site not checked) | Pasir 3-tier shelf, Turn-N-Tube | Server error → queued. |
| [Seville Classics](https://www.sevilleclassics.com) | included | 4 | Product page "View assembly instructions" PDF (files.elfsightcdn.com) | public | Shopify; Crawl-delay 10; /products.json allowed | UltraDurable 4/5/6-tier wire shelving, HOME 4-tier shelving, airLIFT desks | Specs from product JSON body (assembled W×D×H, height on levelling feet). Tool-free wire shelving uses the wire-shelf archetype; airLIFT desks queued. |
| [Storkcraft](https://www.storkcraft.com) | included | 5 | Product page "Assembly Instructions" link → Salsify-hosted PDF (one per model; some per model-number suffix) | public, no login | Shopify default; products allowed (10 s between requests) | Rio 4/6-cube organizer bookcases, Casablanca and California cube bookcases, Santorini, California and Casablanca 2-drawer nightstands, Rio, Kyoto and Sorrento 6-drawer dressers, Alpine 4-drawer chest | Assembled W×D×H listed under "Product Dimensions" on each page; "2 people recommended" and pre-installed drawer tracks noted in copy. Graco®-licensed lines skipped (licensed brand name). |

## Small / direct-to-consumer

| Brand | Status | Fit | Where instructions live | Access | robots.txt / terms | Popular flat-pack | Notes |
|---|---|---|---|---|---|---|---|
| [Branch](https://www.branchfurniture.com) | included | 4 | Per-product assembly guide pages (e.g. /daily-desk-assembly-guide) plus a spec-sheet PDF | public, no login | Shopify default; products allowed | Daily Desk, Office Desk, Duo Standing Desk, Standing Desk, L-Desk | Sizes from the product pages and FAQ (Daily 28.5" tall; Office 30" tall; Duo 28–47.3"). |
| [Thuma](https://www.thuma.co) | research-only | 4 | Tool-free assembly guide/video ("The Bed") | public | Crawl-delay 10 | The Bed, Nightstand | Joinery bed needs a new archetype; queued. |
| [Sabai](https://sabai.design) | research-only | 2 | Assembly videos | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Essential sofa | Upholstered; low fit. _(unverified: from general knowledge)_ |
| [Hem](https://hem.com) | research-only | 3 | Assembly instructions per product | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Palissade, Kazimir | Queued. _(unverified: from general knowledge)_ |
| [Castlery](https://www.castlery.com) | research-only | 2 | Assembly guides per product | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Dawson | Mostly upholstered; low fit. _(unverified: from general knowledge)_ |
| [Hodedah](https://www.hodedah.com) | research-only | 4 | Instructions PDFs per item | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | dressers, bookcases | Queued. _(unverified: from general knowledge)_ |
| [Yaheetech](https://www.yaheetech.com) | research-only | 3 | Manuals on Amazon/product pages | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | bookcases, desks | Queued. _(unverified: from general knowledge)_ |
| [Autonomous](https://www.autonomous.ai) | research-only | 4 | Assembly guide per desk | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | SmartDesk Core | Standing desk archetype ready; queued. _(unverified: from general knowledge)_ |
| [VIVO](https://www.vivo-us.com) | included | 4 | Product page "Assembly Instructions": frame and table-top manual PDFs on the Shopify CDN | public, no login | Shopify default; products allowed | PRO 60×24" dual motor desk, E2 series desks, desk frames | Specs (top size, thickness, height range) listed on the product page. |
| [Fully (Herman Miller)](https://www.fully.com) | research-only | 3 | Jarvis desk assembly guide | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Jarvis desk | Jarvis now sold via Herman Miller; queued. _(unverified: from general knowledge)_ |

## Skipped and why

| Brand | What happened |
|---|---|
| Wayfair / AllModern | HTTP 429 on the home page (rate-limited). Marketplace anyway. |
| West Elm, Pottery Barn, Room & Board | HTTP 403. |
| CB2, Crate & Barrel | HTTP 403 even for robots.txt. |
| The Home Depot | HTTP 403. |
| Amazon (Basics) | HTTP 202 bot challenge — not bypassed. |
| Target, Walmart | Reachable, but JS-rendered pages and terms that bar automated collection → research only, no pieces. |
| South Shore | HTTP 423 (locked) for our fetcher → 1 piece from public retailer listings only. |
| Bush, Prepac, VASAGLE, Hillsdale, Allswell, mainstays.com | TLS/connection refused → Prepac 1 piece from retailer listings; others queued. |
| SONGMICS | sitemap 503 → queued. |
| Furinno | sitemap 502 → queued. |
| Sauder | Site reachable, but spec panels load from a path robots.txt disallows (`/Dimensions`, `/services/`), so we didn't fetch specs → 1 piece from search listings. |
| Single items | Zinus Suzanne (503), Tribesigns 6-tier bookcase (503), Walker Edison Sloane TV stand (layout didn't fit an archetype honestly), Holmes desk and Delta Sutton (no dimensions). |

## Where instructions live (verified patterns)

- **IKEA:** product page → "Assembly and documents" (PDF per article number).
- **Walker Edison:** product page "Assembly Instructions" (Salsify-hosted PDF) plus Assembly Guides / Videos / Request Parts help pages.
- **Dorel Home (Ameriwood, DHP, Novogratz, Cosco):** product page documents on `cdn.dorelhome.com/DorelHomeFiles/ProductDocuments/` (assembly + functional drawing).
- **Zinus:** product page "Assembly Instructions" PDFs on the Shopify CDN, one per size group (twin; full/queen/king).
- **Tribesigns:** product page installation manual PDF on the Shopify CDN.
- **Delta Children:** product page "Assembly Instructions" PDF + "Assembly Tips & Tricks" video.
- **Nathan James:** "all hardware and instructions included"; product pages list assembly minutes, no public PDF seen.
- **FlexiSpot:** product page "Downloads" (E7 manual).
- **UPLIFT Desk:** assembly & programming page plus the Specs/Assembly tab.
- **Sauder:** instruction-book lookup/request by model number.

## Queue (next batches)

1. **Walker Edison** (fit 5): 64" metal-X bookshelf, ladder bookshelf 68", Ivy 3-drawer TV console, mid-century nightstands, platform beds. All have public Salsify PDFs and full specs in product JSON.
2. **Dorel Home**: Westerleigh 6-drawer dresser, Farmington cabinet, Large Parsons 2-drawer desk (need dimensions from a public listing).
3. **Zinus**: ~~twin/full/king of Mia, Moiz, Allen~~ (done, batch 2). Linda twin/full/king once its page lists per-size dimensions; Suzanne when the page is up.
4. **Delta Children**: Sutton 3-drawer, Epic bookcase hutch, 6-shelf storage with 2 drawers.
5. **Tribesigns**: L-shaped desks (needs an `l-desk` archetype), 6-tier bookcase.
6. **Standing desks**: Autonomous SmartDesk Core, VIVO frames, Branch Duo, Fully Jarvis (archetype ready).
7. **Floyd** (bed, table, shelving system) and **Thuma** (tool-free joinery bed) — good fits, need a check of their pages and possibly a `joinery-bed` archetype.
8. **Bush, South Shore, Prepac, VASAGLE, Furinno** — retry their own sites later; if still blocked, use public retailer listings at `medium` confidence.
9. **Target / Walmart house brands** — only via public data that their terms allow (e.g. manufacturer pages for the same item); no scraping.

## Fit score key

5 = maps straight onto an existing archetype with public specs and instructions · 4 = good fit, minor gaps · 3 = partial fit or limited public data · 2 = mostly upholstered/assembled or blocked · 1 = no fit.
