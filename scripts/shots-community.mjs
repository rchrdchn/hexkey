// Screenshots of the nav, Contribute and Request modals (Chromium + WebKit, iPhone 15 + iPhone SE 320px + 1440x900); checks focus trap, Esc, links,
// and the multi-brand link box (any official https product/instructions page; http, home pages and PDF/image links rejected).
// Usage: node scripts/shots-community.mjs [baseUrl] [outDir]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
const base = process.argv[2] || 'http://localhost:4173';
const out = process.argv[3] || 'shots/contribute';
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [], checks = [];
const ok = (c, m) => { checks.push(`${c ? 'PASS' : 'FAIL'} ${m}`); };
for (const eng of ['chromium', 'webkit']) {
  const bt = eng === 'webkit' ? webkit : chromium;
  const browser = await bt.launch({ args: eng === 'chromium' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [] });
  for (const [name, opts] of [['iphone', { ...devices['iPhone 15'], deviceScaleFactor: 2 }], ['iphoneSE', { ...devices['iPhone SE'], deviceScaleFactor: 2 }], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
    const o = { ...opts }; delete o.defaultBrowserType; if (eng === 'chromium' && name !== 'desktop') o.isMobile = true;
    const ctx = await browser.newContext(o);
    // Headless WebKit on Linux without GStreamer media plugins crashes when an <audio> gets a src; stub it (screenshots only).
    if (eng === 'webkit') await ctx.addInitScript('Object.defineProperty(HTMLMediaElement.prototype,"src",{set(v){this._s=v},get(){return this._s||""}});HTMLMediaElement.prototype.play=function(){return Promise.resolve()};');
    const page = await ctx.newPage();
    const tag = `${eng}/${name}`;
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${tag}] ${m.type()}: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`[${tag}] pageerror: ${e.message}`));
    const shot = (l) => page.screenshot({ path: `${out}/${eng}-${name}-${l}.png` });
    await page.goto(base + '/#/');
    await page.waitForSelector('.card b, .start-cta'); // phones show the Pick-your-furniture button, desktop the picker
    await sleep(2200);
    await shot('01-nav');
    // header must not overflow
    const over = await page.evaluate(() => { const h = document.querySelector('.top'); return [...h.children].some((c) => c.getBoundingClientRect().right > innerWidth + 1); });
    ok(!over, `${tag} nav fits`);
    // Contribute
    await page.locator('.pill', { hasText: 'Contribute' }).click();
    await page.waitForSelector('.cm.contrib');
    await sleep(700);
    ok(await page.evaluate(() => document.activeElement?.id === 'c-url'), `${tag} contribute autofocus url`);
    await shot('02-contribute-empty');
    const hint = () => page.locator('#c-url-h').innerText();
    const bad = async (u, label) => { await page.fill('#c-url', u); await sleep(150); ok(await page.locator('#c-url[aria-invalid=true]').count() === 1, `${tag} ${label} rejected (“${await hint()}”)`); };
    await bad('http://www.walkeredison.com/products/holmes-bookcase', 'plain http link');
    await bad('https://www.sauder.com/', 'home page');
    await bad('https://www.example.com/manual.pdf', 'PDF link');
    await bad('javascript:alert(1)', 'non-web link');
    await bad('not a link', 'free text');
    await page.fill('#c-url', 'https://www.walkeredison.com/products/holmes-bookcase?utm_source=test');
    await sleep(400);
    ok(await page.locator('#c-url[aria-invalid=true]').count() === 0 && /Walker Edison/.test(await hint()), `${tag} other-brand link accepted with brand (“${await hint()}”)`);
    ok((await page.locator('.cm.contrib .two input').inputValue()) === 'Holmes Bookcase', `${tag} name guessed from the link`);
    await page.fill('#c-url', 'https://www.target.com/p/some-cube-organizer/-/A-12345678');
    await sleep(200);
    ok(await page.locator('#c-url[aria-invalid=true]').count() === 0 && /target\.com/.test(await hint()), `${tag} store link accepted (“${await hint()}”)`);
    ok(/not affiliated|isn’t affiliated/.test(await page.locator('.cm.contrib .cm-note').innerText()), `${tag} not-affiliated line in Contribute`);
    await page.fill('#c-url', 'https://www.walkeredison.com/products/holmes-bookcase');
    await sleep(200);
    await shot('02b-contribute-other-brand');
    await page.fill('#c-url', 'https://www.ikea.com/us/en/p/hemnes-8-drawer-dresser-white-stain-80318604/');
    await page.selectOption('.cm select >> nth=0', 'Storage & dressers');
    await page.locator('.seg label', { hasText: 'In the box' }).click();
    await page.locator('.seg label', { hasText: 'Steps JSON' }).click();
    await page.selectOption('.cm select >> nth=1', '2');
    await page.locator('.own input').check();
    await sleep(500);
    const verdict = await page.locator('.verdict b').textContent();
    ok(verdict === 'Great fit', `${tag} verdict good (${verdict})`);
    const href = await page.locator('.cm a.cta').getAttribute('href');
    ok(/template=contribute-furniture\.yml/.test(href) && /product=HEMNES/.test(href) && /brand=IKEA/.test(href), `${tag} issue link prefilled (product, brand)`);
    if (name !== 'desktop') { await page.locator('.cm-body').evaluate((e) => (e.scrollTop = e.scrollHeight)); await sleep(300); }
    await shot('03-contribute-good');
    await page.locator('.seg label', { hasText: 'Not yet' }).click();
    await page.locator('.seg label', { hasText: 'A review' }).click();
    await sleep(400);
    ok((await page.locator('.verdict b').textContent()) === 'Better as a request', `${tag} verdict request`);
    await shot('04-contribute-request');
    // focus trap: tab many times, focus must stay inside dialog
    for (let i = 0; i < 30; i++) await page.keyboard.press('Tab');
    ok(await page.evaluate(() => !!document.activeElement?.closest('.cm')), `${tag} focus trapped`);
    await page.locator('.cm .cta').click(); // "Request it instead" hands over to the request modal
    await page.waitForSelector('.cm.req');
    await sleep(600);
    ok((await page.inputValue('#r-url')).includes('hemnes'), `${tag} request prefilled from contribute`);
    await page.fill('.cm textarea', 'Eight drawers, lots of runners.');
    await shot('05-request-filled');
    const rh = await page.locator('.cm a.cta').getAttribute('href');
    ok(/template=furniture-request\.yml/.test(rh), `${tag} request issue link`);
    await page.keyboard.press('Escape');
    await sleep(300);
    ok(await page.locator('.cm').count() === 0, `${tag} Esc closes`);
    ok(await page.evaluate(() => location.hash) === '#/', `${tag} route unchanged after modal`);
    await page.locator('.pill.alt').click();
    await page.waitForSelector('.cm.req');
    await sleep(700);
    await shot('06-request-empty');
    ok(/isn’t affiliated/.test(await page.locator('.cm.req .cm-note').innerText()), `${tag} not-affiliated line in Request`);
    await page.fill('#r-url', 'https://www.sauder.com/products/select-5-shelf-bookcase');
    await sleep(400);
    ok(await page.locator('#r-url[aria-invalid=true]').count() === 0 && (await page.locator('.cm.req a.cta').getAttribute('href') || '').includes('sauder.com'), `${tag} Request accepts another brand (“${await page.locator('#r-url-h').innerText()}”)`);
    await shot('07-request-other-brand');
    await page.locator('.cm-x').click();
    await sleep(200);
    ok(await page.locator('.cm').count() === 0, `${tag} close button`);
    await ctx.close();
  }
  await browser.close();
}
fs.writeFileSync(`${out}/console.txt`, errors.join('\n') + '\n');
fs.writeFileSync(`${out}/checks.txt`, checks.join('\n') + '\n');
console.log(checks.join('\n'));
console.log(errors.length ? errors.join('\n') : 'no console errors');
