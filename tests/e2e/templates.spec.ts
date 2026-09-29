import { expect, test } from '@playwright/test';

const apps = [
  { name: 'SaaS', url: 'http://127.0.0.1:4173', heading: /workflows/i },
  { name: 'Agency', url: 'http://127.0.0.1:4174', heading: /ideas/i },
  { name: 'Portfolio', url: 'http://127.0.0.1:4175', heading: /digital/i },
  { name: 'Restaurant', url: 'http://127.0.0.1:4176', heading: /season/i },
  { name: 'Real estate', url: 'http://127.0.0.1:4177', heading: /exceptional/i },
];

for (const app of apps) {
  test(`${app.name} loads, navigates, and has no horizontal overflow`, async ({ page }) => {
    await page.goto(app.url);
    await expect(page.getByRole('heading', { level: 1, name: app.heading })).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    const pageFooter = page.locator('#root > footer');
    await pageFooter.scrollIntoViewIfNeeded();
    await expect(pageFooter).toBeVisible();
  });
}
