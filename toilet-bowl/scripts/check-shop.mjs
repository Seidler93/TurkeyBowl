import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'playwright');
const url = process.argv[3] || 'https://turkeybowl-743d7--phone-preview-1dgni7pg.web.app';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [390, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    await page.goto(`${url}/shop`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: '2027 Turkey Bowl T-shirt' }).waitFor();
    await page.waitForFunction(() => document.querySelector('.shop-product-photo img')?.naturalWidth > 0);
    assert.match(await page.locator('.shop-price').innerText(), /25/);
    await page.getByText('Pick up on game day.', { exact: true }).waitFor();
    assert.match(await page.locator('.shop-contact').innerText(), /Contact AJ at 224-660-5288/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    assert.equal(await page.getByRole('button', { name: 'Add to Cart', exact: true }).isDisabled(), true);
    for (const size of ['S', 'M', 'L', 'XL', '2XL', '3XL']) {
      await page.getByLabel('Size', { exact: true }).selectOption(size);
      assert.equal(await page.getByLabel('Size', { exact: true }).inputValue(), size);
    }
    await page.getByLabel('Size', { exact: true }).selectOption('M');
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
    await page.getByLabel('Size', { exact: true }).selectOption('XL');
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
    assert.match(await page.locator('.shop-cart-summary').innerText(), /75\.00/);
    assert.equal(await page.locator('.shop-cart-items li').count(), 2);
    assert.equal(await page.getByRole('button', { name: 'Checkout coming closer to the 2027 game', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: 'Decrease green M quantity', exact: true }).click();
    assert.match(await page.locator('.shop-cart-summary').innerText(), /50\.00/);
    await page.getByRole('button', { name: 'Increase green XL quantity', exact: true }).click();
    await page.getByRole('button', { name: 'Remove green size M', exact: true }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.match(await page.locator('.shop-cart-summary').innerText(), /50\.00/);
    assert.equal(await page.locator('.shop-cart-items li').count(), 1);
    await page.getByRole('button', { name: 'Decrease green XL quantity', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Checkout coming closer to the 2027 game', exact: true }).isDisabled(), true);
    await page.getByRole('radio', { name: 'Black / Beets', exact: true }).check();
    await page.waitForFunction(() => {
      const image = document.querySelector('.shop-product-photo img');
      return image?.src.endsWith('shop-tshirt-2027-black.jpg') && image.complete && image.naturalWidth > 0;
    });
    await page.getByLabel('Size', { exact: true }).selectOption('XL');
    await page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
    assert.equal(await page.locator('.shop-cart-items li').count(), 2);
    assert.match(await page.locator('.shop-cart-items').innerText(), /Black \/ Beets/);
    assert.match(await page.locator('.shop-cart-summary').innerText(), /50\.00/);
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.shop-cart-items li').count(), 2);
    await page.getByRole('button', { name: 'Remove black size XL', exact: true }).click();
    assert.equal(await page.locator('.shop-cart-items li').count(), 1);
    assert.match(await page.locator('.shop-cart-items').innerText(), /Green \/ Pics/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.getByRole('button', { name: 'Clear cart', exact: true }).click();
    await page.getByText('Your cart is empty.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('button', { name: 'Shop', exact: true }).click();
    assert.equal(await page.evaluate(() => window.scrollY), 0);
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.getByRole('button', { name: 'Close menu', exact: true }).click({ position: { x: 20, y: 120 } });
    assert.equal(await page.getByRole('button', { name: 'Toggle menu' }).getAttribute('aria-expanded'), 'false');
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button', { name: 'Toggle menu' }).getAttribute('aria-expanded'), 'false');
    console.log(`PASS: Shop product, image, price, pickup details, checkout state and menu at ${width}px`);
    await context.close();
  }
} finally {
  await browser.close();
}
