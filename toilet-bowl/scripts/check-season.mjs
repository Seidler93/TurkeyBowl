import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'playwright');
const url = process.argv[3] || 'https://turkeybowl-743d7--phone-preview-1dgni7pg.web.app';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Toilet Bowl 2027', exact: true }).waitFor();
  assert.equal(await page.title(), 'Toilet Bowl 2027');
  assert.match(await page.locator('#details').innerText(), /Thursday, November 25, 2027/);
  assert.match(await page.locator('#details').innerText(), /9:00 AM/);
  await page.waitForFunction(() => document.querySelector('#events')?.textContent.includes('Wednesday, November 24, 2027'));
  assert.match(await page.locator('#events').innerText(), /6:30 PM/);
  assert.match(await page.locator('#attendance').innerText(), /Toilet Bowl 2027/);
  await page.getByRole('button', { name: 'RSVP for 2027' }).click();
  await page.getByRole('heading', { name: 'RSVP for 2027' }).waitFor();
  await page.getByRole('button', { name: 'Close RSVP' }).click();
  console.log('PASS: 2027 hero, page title, game date/time, dinner date/time, attendance and RSVP year');
} finally {
  await browser.close();
}
