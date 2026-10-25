# Furniture brands × assembly instructions (Hexkey research)

_Updated 2026-10-24 (PT). Machine-readable copy: [data/sources/brands.json](../data/sources/brands.json)._

**What this is:** a survey of 50 furniture brands — big, medium and small/direct-to-consumer — covering where each keeps its assembly instructions, whether they're public, robots.txt/terms notes, popular flat-pack products, and how well they fit Hexkey's archetypes (1–5).

**How it was gathered (ground rules):**
- Polite fetcher only: user agent `HexkeyResearch/0.1`, 2–10 s between requests (more where `Crawl-delay` asked), robots.txt checked first, no logins, no captchas, no bot-protection bypass. 94 logged requests in total.
- When a site blocked us (403/423/429/TLS refusal/bot challenge), we stopped and recorded it. A few facts for blocked or JS-only brands came from public web-search results (retailer listings quoting the maker); those pieces are marked `medium` confidence and say so in their notes.
- Facts only (names, SKUs, dimensions, counts, minutes, people, links). No brand PDFs, diagrams, images or text were copied or stored in the repo. Instruction PDFs are **linked** (`instructionsUrl`), never rehosted.

## Coverage

| Tier | Brands | Included (pieces) | Research-only (queued) | Skipped (blocked/terms) |
|---|---|---|---|---|
| big | 16 | 8 | 5 | 3 |
| medium | 22 | 15 | 2 | 5 |
| small | 12 | 7 | 5 | 0 |
| **total** | **50** | **30** | **12** | **8** |

## Pieces in the catalog by brand

| Brand | Pieces |
|---|---|
| IKEA | 38 |
| Walker Edison | 10 |
| Dorel Home (Ameriwood Home, DHP, Novogratz, Cosco) | 5 |
| Zinus | 13 |
| Sauder | 1 |
| South Shore | 1 |
| Prepac | 1 |
| ClosetMaid (Home by Ames) | 1 |
| Floyd | 6 |
| Burrow | 2 |
| Tribesigns | 3 |
| Nathan James | 5 |
| SONGMICS / VASAGLE | 2 |
| FlexiSpot | 1 |
| UPLIFT Desk | 1 |
| Bestar | 4 |
| Linon | 2 |
| Delta Children | 2 |
| KidKraft | 1 |
| Seville Classics | 6 |
| Branch | 3 |
| Hodedah | 7 |
| Thuma | 5 |
| Autonomous | 2 |
| VIVO | 2 |
| Storkcraft | 11 |
| Plank+Beam | 13 |
| Max & Lily | 3 |
| Eureka Ergonomic | 8 |
| ECR4Kids | 7 |
| **total** | **166** |

## Big brands and big-box retailers

| Brand | Status | Fit | Where instructions live | Access | robots.txt / terms | Popular flat-pack | Notes |
|---|---|---|---|---|---|---|---|
| [IKEA](https://www.ikea.com) | included | 5 | Product page → "Assembly and documents" (PDF per article) | public, no login | allows /p/ pages | KALLAX, BILLY, MALM, HEMNES, LACK, BRIMNES, MICKE, IVAR | 38 pieces in the catalog. Batch 5 added the KLEPPSTAD and RAKKESTAD 2-door wardrobes and the BRIMNES 3-door wardrobe (wardrobe archetype; sizes from the product pages). |
| [Walker Edison](https://www.walkeredison.com) | included | 5 | Product page "Assembly Instructions" PDF (images.salsify.com) + Assembly Guides/Videos help pages | public, no login | Shopify default; /products/*.json not disallowed | Holmes bookcase, Rebecca 6-drawer dresser, Domm nightstand, Kelm TV stand, Amira bookshelf | Specs from product JSON; dims listed H × L × W. |
| [Dorel Home (Ameriwood Home, DHP, Novogratz, Cosco)](https://www.dorelhome.com) | included | 4 | Product page "Assembly Instructions" PDF on cdn.dorelhome.com/DorelHomeFiles/ProductDocuments/ | public, no login | Shopify default; allowed | Parsons desk/tables/TV stand, Her Majesty nightstand, Westerleigh dresser, Farmington cabinet | Product pages often leave dimension fields blank; dims cross-checked with retailer listings quoting manufacturer copy → medium confidence. |
| [Zinus](https://www.zinus.com) | included | 5 | Product page "Assembly Instructions" PDF on Shopify CDN | public, no login | Crawl-delay 10; products allowed | Mia metal platform bed, Moiz wood platform bed, Allen bed, Linda bed | Mia, Moiz and Allen in twin, full, queen and king (outer-frame sizes from each page's "Dimensions and Weight" list); Linda queen only (its page lists no per-size dimensions); Suzanne page returned 503 → skipped. |
| [Sauder](https://www.sauder.com) | included | 4 | Instruction book lookup/request by model number (/service/instruction-book-request) | public | Disallows /Dimensions, /services/, /compare; spec panel loads from a disallowed endpoint so specs were NOT fetched | Beginnings bookcases, Select bookcases, Cannery Bridge, standing desks | Facts from retailer listings via web search only → medium confidence, 1 piece. |
| [South Shore](https://www.southshorefurniture.com) | included | 4 | Product page assembly PDF / support "Assembly instructions" by model | site returned 423 to our fetcher | n/a (blocked) | Axess bookcase, Step One dresser, Libra | Site blocked (HTTP 423) → not crawled; 1 piece from retailer listings via web search, medium confidence. |
| [Prepac](https://www.prepacmfg.com) | included | 4 | Product page "Assembly Instructions" PDF | TLS connection refused for our fetcher | n/a (blocked) | Sonoma/Fremont 6-drawer dresser, Elite storage, shoe cubbies | Site unreachable (TLS failure) → 1 piece from retailer listings via web search, medium confidence. |
| [ClosetMaid (Home by Ames)](https://www.homebyames.com) | included | 4 | Product page instructions PDF (Cubeicals) | public; closetmaid.com redirects to homebyames.com | not crawled (facts via web search) | Cubeicals 9-cube, 3-cube, 6-cube | 1 piece from the brand listing via web search, medium confidence. |
| [Bush Furniture](https://www.bushfurniture.com) | research-only | 4 | Assembly instructions by model in support section | TLS/connection failure | n/a (blocked) | Cabot, Somerset, Studio C desks | Re-checked Oct 24 and 25: TLS connection still fails for our fetcher → still queued. |
| [HON](https://www.hon.com) | research-only | 2 | Product documents / installation instructions per series | public | Crawl-delay 60 | office desking, files | Mostly contract office furniture; low flat-pack fit. |
| [Ashley (Signature Design RTA)](https://www.ashleyfurniture.com) | research-only | 3 | Assembly instructions linked on RTA product pages | public | unverified (general knowledge, site not checked) | Signature Design RTA dressers/bookcases | Re-checked Oct 24 and 25: robots.txt answers 406 and product data 403 for our fetcher → still queued (no bypass). |
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
| [Floyd](https://floydhome.com) | included | 4 | Assembly page (/pages/assembly) plus per-product PDF guides and videos linked from product pages | public, no login | Shopify default; products allowed (10 s between requests) | Floyd Bed, Modular Table, Lift Off coffee table, Short and Tall Shelf | Batch 3: Floyd Bed (twin, full/queen, king, full/queen with headboard) and Modular Table (small, large), sizes from the product pages. Tool-free bed (steel supports, honeycomb panels, ratchet straps) uses the panel-bed archetype; the table uses clamp-table with Floyd clamp legs. Panel layout is our best guess → low confidence. Lift Off coffee table skipped (how the top fixes to the end supports is not clear from the page); shelves skipped (their pages print no dimensions). |
| [Burrow](https://burrow.com) | included | 3 | Product page "Download Assembly Instructions" PDF on the Shopify CDN | public, no login | Shopify (headless); products allowed, Crawl-delay 10 | Prospect 3/6/9-drawer low and 5/10/15-drawer tall dressers, Index bookcases, Heist dresser and nightstand, Range sofas | Batch 4: Prospect 3-drawer low and 5-drawer tall dressers ("General Dimensions" and drawer interiors on each page). Wider Prospect dressers skipped (they are side-by-side modules, not one case); Index bookcases skipped (tool-free knurled-screw frame needs its own archetype); Heist pages print no outer size. Range sofas are upholstered. |
| [Tribesigns](https://www.tribesigns.com) | included | 5 | Product page installation manual PDF on Shopify CDN | public | Crawl-delay 10 | 5-tier ladder bookshelf, computer desks, L-desks | One page returned 503 → skipped that item. |
| [Nathan James](https://nathanjameshome.com) | included | 4 | Instructions in box; product pages list assembly minutes (no PDF seen) | public | Crawl-delay 10; .json 404 so HTML specs used | Theo ladder shelf, Parker desk, Haven bookcase, Andrew nightstand |  |
| [SONGMICS / VASAGLE](https://www.songmics.com) | included | 4 | "Important instructions" section on product pages; manual PDFs not linked on the pages we read | public, no login (songmics.com; vasagle.com still TLS failure) | Shopify default; products allowed | VASAGLE CUSTOS 6-tier bookshelf (ULBC412), VASAGLE LIRY nightstand (ULET699), cube storage, ladder shelves | Pages are mostly script-rendered; size and tier/drawer counts taken from the product titles on songmics.com. No instructions link, so pieces carry no instructionsUrl. |
| [FlexiSpot](https://www.flexispot.com) | included | 5 | Product page "Downloads" → E7 manual | public | verified 2026-10-23 | E7 standing desk frame, E5, Comhar |  |
| [UPLIFT Desk](https://www.upliftdesk.com) | included | 5 | Assembly & programming page + Specs/Assembly tab | public | verified 2026-10-23 | UPLIFT V2 standing desk |  |
| [Bestar](https://www.bestar.com) | included | 4 | Product page "View assembly instructions" → Salsify-hosted PDF | public, no login | Shopify default; products allowed | Universel tall 5-shelf bookcase, 20W nightstand, murphy beds, L-desks | Assembled width/depth/height in the page data; the visible "75×120×65 cm" block is a page template default, so we ignored it. |
| [Linon](https://www.linon.com) | included | 3 | No public instructions link seen on product pages; "assembly required" noted in copy | public, no login | Shopify default; products allowed | Cody 2/4/6 cube unit, Cosgrove ladder bookcase, Hudson dressers and nightstands | Many Linon pieces ship mostly assembled ("only the legs"), so we skipped those and took the Cody cube units, which need full assembly. Cody outer size is worked out from the published inner cube size → low confidence. |
| [Delta Children](https://www.deltachildren.com) | included | 5 | Product page "Assembly Instructions" PDF on Shopify CDN + tips video | public | Shopify default; allowed | Rowen 4-drawer dresser, Haven 6-drawer dresser, Sutton dresser, toy organizers |  |
| [KidKraft](https://www.kidkraft.com) | included | 3 | Product page "Assembly Instructions" link (Salsify-hosted or Shopify CDN PDF) | public, no login | Shopify default; products allowed (10 s between requests) | Puzzle Bookshelf, Bookcase with Reading Nook, Study Desk with Chair, play kitchens and dollhouses | Batch 4: Puzzle Bookshelf (product dimensions in inches and cm on the page). Reading Nook bookcase and Study Desk skipped (nook seat and hutch need new archetypes); most of the catalog is toys. |
| [Furinno](https://www.furinno.com) | research-only | 4 | Instructions on product pages | sitemap 502 | unverified (general knowledge, site not checked) | Pasir 3-tier shelf, Turn-N-Tube | Re-checked Oct 24 and 25: home page loads but product pages, sitemap and store API return 502 → still queued. |
| [Seville Classics](https://www.sevilleclassics.com) | included | 4 | Product page "View assembly instructions" PDF (files.elfsightcdn.com) | public | Shopify; Crawl-delay 10; /products.json allowed | UltraDurable 4/5/6-tier wire shelving, HOME 4-tier shelving, airLIFT desks | Specs from product JSON body (assembled W×D×H, height on levelling feet). Tool-free wire shelving uses the wire-shelf archetype; airLIFT desks queued. |
| [Storkcraft](https://www.storkcraft.com) | included | 5 | Product page "Assembly Instructions" link → Salsify-hosted PDF (one per model; some per model-number suffix) | public, no login | Shopify default; products allowed (10 s between requests) | Rio 4/6-cube organizer bookcases, Casablanca and California cube bookcases, Santorini, California and Casablanca 2-drawer nightstands, Rio, Kyoto and Sorrento 6-drawer dressers, Alpine 4-drawer chest | Assembled W×D×H listed under "Product Dimensions" on each page; "2 people recommended" and pre-installed drawer tracks noted in copy. Graco®-licensed lines skipped (licensed brand name). |
| [Eureka Ergonomic](https://eurekaergonomic.com) | included | 4 | Per-product assembly PDF linked from each product page (hosted on the brand's Shopify CDN) | public, no login | Shopify default; products allowed (10 s between requests) | Norwood, Ark SD, Ark Lite and Ark Executive standing desks, leather-finish standing desk, L-shaped and executive desks with cabinets, gaming desks | Electric dual-motor standing desks; overall L×W×H and lift range on each page. Desks with built-in drawers are shown with the drawers simplified into the top. Batch 3 added the Ark Pro L standing desk, L60 L-shaped standing desk and L01 L-shaped office desk (l-desk archetype). Ark EX (built-in cabinet and drawers) and glass LED gaming desks skipped. |
| [ECR4Kids](https://ecr4kids.com) | included | 4 | "Assembly Instructions" PDF linked from each product page (hosted on Salsify) | public, no login | Shopify default; products allowed (10 s between requests) | Sleekline storage cabinets 24/30/36" H, Sleekline cubby cabinets 2×5, 3×4, 3×5, coat lockers, book displays, student desks | Classroom and kids' storage in birch plywood; W×D×H on each page. Batch 3 added Sleekline cubby cabinets 2×5, 3×4, 3×5 and 5×3 (cubby archetype; the 5×3 ships with an anti-tip kit); BrightSpace desk skipped (page calls it a floor table but lists a 25" height). |

## Small / direct-to-consumer

| Brand | Status | Fit | Where instructions live | Access | robots.txt / terms | Popular flat-pack | Notes |
|---|---|---|---|---|---|---|---|
| [Branch](https://www.branchfurniture.com) | included | 4 | Per-product assembly guide pages (e.g. /daily-desk-assembly-guide) plus a spec-sheet PDF | public, no login | Shopify default; products allowed | Daily Desk, Office Desk, Duo Standing Desk, Standing Desk, L-Desk | Sizes from the product pages and FAQ (Daily 28.5" tall; Office 30" tall; Duo 28–47.3"). |
| [Thuma](https://www.thuma.co) | included | 4 | Assembly page (/pages/assembly) with the tool-free guide and video | public, no login | Shopify; products allowed, Crawl-delay 10 (10 s between requests) | The Bed (Classic), Nightstand | Batch 5: Classic Bed in twin, full, queen and king, plus queen with headboard (joinery-bed archetype). Sizes, 13" frame height, 9" under-bed clearance, 39" headboard height and "two hand-tightened screws" from the product page; slat count and center-rail feet are our guess → low confidence. Nightstand skipped (no outer dimensions found on the page). |
| [Sabai](https://sabai.design) | research-only | 2 | Assembly videos | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Essential sofa | Upholstered; low fit. _(unverified: from general knowledge)_ |
| [Hem](https://hem.com) | research-only | 3 | Assembly instructions per product | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Palissade, Kazimir | Queued. _(unverified: from general knowledge)_ |
| [Castlery](https://www.castlery.com) | research-only | 2 | Assembly guides per product | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Dawson | Mostly upholstered; low fit. _(unverified: from general knowledge)_ |
| [Hodedah](https://hodedah.com) | included | 4 | Product page buttons: "Assembly Instructions" PDF and "Diagrams & Dimensions" PDF (wp-content/uploads) | public, no login | WordPress/WooCommerce; shop pages allowed (8 s between requests) | 3/4/5-shelf bookcases, 5-drawer and 7-drawer chests, 2-drawer nightstand, armoires, kitchen carts | Batch 4: 3, 4 and 5-shelf bookcases, 5-drawer chest, 7-drawer chest with locks, 2-drawer nightstand. "Assembled Dimensions" (H, W, D) on each page; drawer counts and glides from the feature list. Batch 5 added the HI882 2-door armoire with mirror and 2 drawers (wardrobe archetype). Still skipped: HI29 armoire (its page lists a 46.8" depth, likely a typo), HID8020 3-door armoire (drawers sit under one section only, not modelled yet), door bookcases and kitchen pieces. |
| [Yaheetech](https://www.yaheetech.com) | research-only | 3 | Manuals on Amazon/product pages | no product pages (redirect to /lander) | unverified (general knowledge, site not checked) | bookcases, desks | Re-checked Oct 24 and 25: yaheetech.com only redirects to a /lander page with no products → still queued. |
| [Autonomous](https://www.autonomous.ai) | included | 4 | Desk page "Assembly guide" PDF on cdn.autonomous.ai, plus a video guide | public, no login | robots.txt allows product pages for all crawlers (blocks only a few named bots) | Desk 2 (formerly SmartDesk Core) 53×29" and XL 70.5×30" | Batch 4: Desk 2 and Desk 2 XL (old SmartDesk Core URL redirects to the Desk 2 page). Spec table gives top sizes, height with top 28.3–47.5", dual motor, about 30 minutes to assemble. |
| [VIVO](https://www.vivo-us.com) | included | 4 | Product page "Assembly Instructions": frame and table-top manual PDFs on the Shopify CDN | public, no login | Shopify default; products allowed | PRO 60×24" dual motor desk, E2 series desks, desk frames | Specs (top size, thickness, height range) listed on the product page. |
| [Fully (Herman Miller)](https://www.fully.com) | research-only | 3 | Jarvis desk assembly guide | unverified (general knowledge, site not checked) | unverified (general knowledge, site not checked) | Jarvis desk | Re-checked Oct 24: Jarvis now lives on hermanmiller.com, whose desk page renders its specs with scripts → still queued. |
| [Plank+Beam](https://www.plankandbeam.com) | included | 4 | Help-center "Assembly resources" article (linked as "Assembly Instructions" on every product page) | public, no login | Shopify default; products allowed (10 s between requests) | Harbor desks 38/53", Sera, Marelle, Willow and Elio dressers, Marelle nightstands, bunk and loft beds | Solid pine furniture; overall L×D×H and drawer interiors printed on each product page. Batch 3 added Classic twin/twin, full/full and queen/queen bunk beds, Rustic twin/twin bunk bed and Rustic twin loft bed (bunk-bed archetype, low confidence). |
| [Max & Lily](https://maxandlily.com) | included | 4 | Assembly instructions page (/pages/assembly-instructions), linked from every product page | public, no login | Shopify default; products allowed (10 s between requests) | Charlotte bookcase, Hudson desks 38/53", Scandinavian dresser, Sutton secretary desk, kids beds with trundles | Kids' solid-wood furniture (sister brand of Plank+Beam). Overall L×W×H on each page. Scandinavian dresser and Sutton desk skipped this batch (drawer layout / fold-down desk not clear from the page). |

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
6. **Standing desks**: ~~Autonomous Desk 2~~ (done, batch 4: 53×29 and XL 70×30). Fully Jarvis still queued: its specs on hermanmiller.com are JS-rendered, so no public numbers to read yet.
7. ~~**Thuma**~~ (done, batch 5: Classic Bed in 5 sizes with the new `joinery-bed` archetype). (Floyd bed and table were added in batch 3; Floyd shelves still need dimensions.)
8. **Bush, South Shore, Prepac, VASAGLE, Furinno** — retry their own sites later; if still blocked, use public retailer listings at `medium` confidence. Re-checked 2026-10-24: Furinno returned 502 on product pages, sitemap and API; Bush failed TLS; Yaheetech's domain now redirects to a parked /lander page; Ashley still answers 406/403.
10. **Batch 4 (done 2026-10-24):** Hodedah (3 bookcases, 5- and 7-drawer chests, 2-drawer nightstand), Burrow (Prospect 3-drawer low and 5-drawer tall), Autonomous (Desk 2 and Desk 2 XL), KidKraft (Puzzle bookshelf). Left out on purpose: Burrow's wider modular Prospects, Index bookcase (tool-free knurled screws, no archetype yet) and nightstand (drawer count unclear); KidKraft Reading Nook and Study Desk (no matching archetype).
11. **Batch 5 (done 2026-10-25):** two new archetypes, `joinery-bed` and `wardrobe`. Thuma (Classic Bed twin, full, queen, king, queen with headboard), IKEA (KLEPPSTAD 2-door, RAKKESTAD 2-door, BRIMNES 3-door wardrobes), Hodedah (HI882 2-door armoire with mirror). Queued brands re-checked: Bush (connection fails), Furinno (store API 500), Yaheetech (still /lander), Ashley (403) stay queued; South Shore (429), VASAGLE (connection fails) and Prepac (TLS failure) could not be re-read for wardrobes and were not pushed. Still not built: a reading-nook archetype (KidKraft Reading Nook) and wardrobes with drawers under one section only (Hodedah HID8020).
9. **Target / Walmart house brands** — only via public data that their terms allow (e.g. manufacturer pages for the same item); no scraping.

## Fit score key

5 = maps straight onto an existing archetype with public specs and instructions · 4 = good fit, minor gaps · 3 = partial fit or limited public data · 2 = mostly upholstered/assembled or blocked · 1 = no fit.
