import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'playwright');
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
let workerVersion = 1;
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw new Error('Invalid path');
    let bytes = await readFile(file);
    if (pathname === '/sw.js') bytes = Buffer.concat([bytes, Buffer.from(`\n// Browser update test ${workerVersion}\n`)]);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(bytes);
  } catch {
    response.writeHead(404);
    response.end();
  }
});
await new Promise((resolveListening) => server.listen(0, '127.0.0.1', resolveListening));
let browser;
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  page.on('pageerror', (error) => console.error('Browser error:', error.message));
  const url = `http://127.0.0.1:${server.address().port}/`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 30000 });
  const manifest = await page.evaluate(async () => {
    const link = document.querySelector('link[rel="manifest"]');
    return fetch(link.href).then((response) => response.json());
  });
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.id, '/');
  for (const icon of manifest.icons) {
    assert.equal((await context.request.get(new URL(icon.src, url).href)).status(), 200);
  }
  console.log('PASS: install manifest, icons, and active service worker');
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^RSVP for/ }).waitFor();
  assert.match(await page.locator('.hero-info').innerText(), /Newton Park/);
  console.log('PASS: offline app launch with hero details and RSVP button');
  await context.setOffline(false);
  await page.getByRole('button', { name: /^RSVP for/ }).click();
  await page.getByRole('textbox', { name: 'Your name' }).fill('Unsaved RSVP');
  let navigations = 0;
  page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) navigations++; });
  workerVersion++;
  await page.evaluate(async () => (await navigator.serviceWorker.ready).update());
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting));
  assert.equal(await page.getByRole('textbox', { name: 'Your name' }).inputValue(), 'Unsaved RSVP');
  assert.equal(navigations, 0);
  console.log('PASS: available update preserves an open RSVP');
  const reloaded = page.waitForEvent('framenavigated', { predicate: (frame) => frame === page.mainFrame(), timeout: 15000 });
  await page.getByRole('button', { name: 'Close RSVP' }).click();
  await reloaded;
  await page.getByRole('button', { name: /^RSVP for/ }).waitFor();
  assert.ok(navigations > 0, 'New worker should automatically reload the idle app');
  console.log('PASS: idle app automatically activates the new version and reloads');
} finally {
  await browser?.close();
  await new Promise((resolveClosed) => server.close(resolveClosed));
}
