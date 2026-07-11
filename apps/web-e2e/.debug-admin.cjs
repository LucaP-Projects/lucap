const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: 'http://localhost:3000' });
  const page = await context.newPage();

  page.on('pageerror', err => console.log('PAGE CRASH:', err.message));

  await page.goto('/auth/login');
  await page.waitForLoadState('domcontentloaded');
  console.log('LOADED:', page.url());

  await page.fill('input[name="email"]', 'admin@lucap.com');
  await page.fill('input[name="password"]', 'Admin@1234');
  await page.click('button[type="submit"]');

  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    console.log(`t=${i+1}s`, page.url().replace('http://localhost:3000', ''));
  }

  const h1 = await page.locator('h1').first().textContent().catch(() => 'no h1');
  console.log('H1:', h1);

  await context.close();
  await browser.close();
})();
