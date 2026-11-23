import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'playwright');
const url = process.argv[3] || 'https://turkeybowl-743d7--phone-preview-dapbkq0n.web.app';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${url}/winners`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^View 2025 .* team photo$/ }).click({ timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('.photo-zoom-stage[aria-busy="false"] img')?.naturalWidth > 0);
  const imageBox = await page.locator('.photo-transition-layer img').boundingBox();
  assert.ok(imageBox.width > 200 && imageBox.height > 150);
  await page.getByRole('button', { name: "Next year's photo" }).click();
  await page.waitForFunction(() => document.querySelector('.photo-caption')?.textContent.includes('2024') && document.querySelectorAll('.photo-transition-layer').length === 1);
  assert.match(await page.locator('.photo-transition-layer img').getAttribute('alt'), /2024/);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.waitForFunction(() => {
    const image = document.querySelector('.photo-transition-layer img');
    return image && new DOMMatrixReadOnly(getComputedStyle(image.parentElement).transform).a > 1.1;
  });
  await page.getByRole('button', { name: "Next year's photo" }).click();
  await page.getByRole('button', { name: "Next year's photo" }).click();
  await page.waitForFunction(() => document.querySelector('.photo-caption')?.textContent.includes('2025') && document.querySelectorAll('.photo-transition-layer').length === 1);
  assert.match(await page.locator('.photo-transition-layer img').getAttribute('alt'), /2025/);
  console.log('PASS: Record Book transitions, photo/metadata alignment, zoom, and rapid navigation');
  await page.getByRole('button', { name: 'Close photos' }).click();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open Toilet Bowl photo 1', exact: true }).click({ timeout: 30000 });
  await page.waitForFunction(() => document.querySelector('.photo-zoom-stage[aria-busy="false"] img')?.naturalWidth > 0);
  for (let index = 0; index < 3; index++) await page.getByRole('button', { name: 'Next photo', exact: true }).click();
  await page.waitForFunction(() => {
    const stage = document.querySelector('.photo-zoom-stage');
    return stage?.getAttribute('aria-busy') === 'false' && stage.querySelector('img')?.alt === 'Toilet Bowl photo 4' && stage.querySelectorAll('.photo-transition-layer').length === 1;
  });
  console.log('PASS: gallery transitions and latest photo wins during rapid navigation');
  await page.getByRole('button', { name: 'Close photo', exact: true }).click();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  assert.ok(await page.evaluate(() => window.scrollY) > 100);
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.getByRole('button', { name: 'The Record Book', exact: true }).click();
  await page.getByRole('heading', { name: 'The Record Book', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.scrollY), 0);
  console.log('PASS: menu page navigation starts at the top after scrolling the homepage');
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^RSVP for/ }).tap();
  const mobileButtonStyle = await page.locator('.rsvp-btn').evaluate((button) => ({
    background: getComputedStyle(button).backgroundColor,
    transform: getComputedStyle(button).transform,
  }));
  assert.equal(mobileButtonStyle.background, 'rgb(240, 180, 41)');
  assert.equal(mobileButtonStyle.transform, 'none');
  await page.getByRole('button', { name: 'Close RSVP' }).tap();
  console.log('PASS: tapping RSVP on mobile leaves no sticky hover color or scaling');
  await page.goto(`${url}/gallery`, { waitUntil: 'domcontentloaded' });
  await page.locator('.gallery-columns .gallery-thumb').first().waitFor({ timeout: 30000 });
  const firstPhoto = await page.locator('.gallery-columns .gallery-thumb img').first().getAttribute('src');
  for (const columns of [1, 2, 3]) {
    await page.getByRole('button', { name: `${columns} column${columns === 1 ? '' : 's'}`, exact: true }).tap();
    const tracks = await page.locator('.gallery-columns .grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    assert.equal(tracks, columns);
    assert.equal(await page.locator('.gallery-columns .gallery-thumb img').first().getAttribute('src'), firstPhoto);
  }
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  console.log('PASS: 1/2/3-column layouts fit mobile and preserve loaded photos');
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
