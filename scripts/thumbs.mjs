// Renders a catalog thumbnail per piece with our own 3D renderer (/?thumb=<slug>) and saves public/thumbs/<slug>.webp.
// Usage: node scripts/thumbs.mjs [baseUrl=http://localhost:4173] [slugs=all]   (needs a running `vite preview` and ffmpeg)
import { chromium } from 'playwright';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
const root = new URL('..', import.meta.url).pathname;
const base = process.argv[2] || 'http://localhost:4173';
const all = JSON.parse(fs.readFileSync(`${root}public/pieces/index.json`, 'utf8'));
const slugs = process.argv[3] ? process.argv[3].split(',') : all;
fs.mkdirSync(`${root}public/thumbs`, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 400, height: 300 }, deviceScaleFactor: 1 });
for (const slug of slugs) {
  await page.goto(`${base}/?thumb=${slug}`);
  await page.waitForSelector('body[data-ready]', { timeout: 30000 });
  const png = `/tmp/thumb-${slug}.png`;
  await page.screenshot({ path: png });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', png, '-c:v', 'libwebp', '-quality', '72', '-compression_level', '6', `${root}public/thumbs/${slug}.webp`]);
  console.log(slug, fs.statSync(`${root}public/thumbs/${slug}.webp`).size);
}
await browser.close();
