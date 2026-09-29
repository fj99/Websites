import { expect, Page, test } from '@playwright/test';

const urls = {
  saas: 'http://127.0.0.1:4173',
  agency: 'http://127.0.0.1:4174',
  portfolio: 'http://127.0.0.1:4175',
  restaurant: 'http://127.0.0.1:4176',
  realEstate: 'http://127.0.0.1:4177',
};

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Phone-specific interaction coverage');
});

async function expectPhoneShell(page: Page, url: string, menuSelector: string) {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });

  await page.goto(url);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  expect(runtimeErrors).toEqual([]);

  const menuButton = page.locator(menuSelector);
  await expect(menuButton).toBeVisible();
  const menuBox = await menuButton.boundingBox();
  expect(menuBox?.width).toBeGreaterThanOrEqual(40);
  expect(menuBox?.height).toBeGreaterThanOrEqual(40);

  const smallButtons = await page.locator('button:visible').evaluateAll((buttons) =>
    buttons
      .map((button) => {
        const box = button.getBoundingClientRect();
        return {
          label: button.getAttribute('aria-label') || button.textContent?.trim(),
          width: box.width,
          height: box.height,
        };
      })
      .filter((button) => button.width < 40 || button.height < 40),
  );
  expect(smallButtons).toEqual([]);

  await menuButton.click();
  await expect(page.locator('header nav')).toBeVisible();
  return menuButton;
}

test('SaaS phone navigation, billing, and signup work', async ({ page }) => {
  await expectPhoneShell(page, urls.saas, '.menu');
  await page.locator('header nav a').first().click();
  await expect(page.locator('header nav')).not.toBeVisible();

  const monthly = page.locator('.billing button').first();
  await monthly.click();
  await expect(monthly).toHaveClass(/active/);

  const email = page.locator('#saas-email');
  await expect(email).toHaveAttribute('type', 'email');
  await email.fill('phone@example.com');
  await page.locator('.cta form button').click();
  await expect(page.locator('.cta [aria-live="polite"]')).not.toBeEmpty();
});

test('Agency phone navigation and contact form work', async ({ page }) => {
  await expectPhoneShell(page, urls.agency, '.menu-button');
  await page.locator('header nav a').first().click();
  await expect(page.locator('header nav')).not.toBeVisible();

  await page.locator('input[name="name"]').fill('Mobile User');
  await page.locator('input[name="email"]').fill('phone@example.com');
  await page.locator('textarea[name="message"]').fill('Testing the phone form.');
  await page.locator('.contact form button').click();
  await expect(page.locator('.contact [aria-live="polite"]')).not.toBeEmpty();
});

test('Portfolio phone navigation and project filters work', async ({ page }) => {
  await expectPhoneShell(page, urls.portfolio, 'header > button');
  await page.locator('header nav a').first().click();
  await expect(page.locator('header nav')).not.toBeVisible();

  const allProjects = await page.locator('.project-grid article').count();
  const category = page.locator('.filters button').nth(1);
  await category.click();
  await expect(category).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.project-grid article').count()).toBeLessThan(allProjects);
});

test('Restaurant phone navigation, tabs, and reservation dialog work', async ({ page }) => {
  await expectPhoneShell(page, urls.restaurant, '.menu-button');
  await page.locator('header nav button').click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const closeButton = dialog.locator('.close');
  const closeBox = await closeButton.boundingBox();
  expect(closeBox?.width).toBeGreaterThanOrEqual(40);
  expect(closeBox?.height).toBeGreaterThanOrEqual(40);

  await dialog.locator('input[name="email"]').fill('phone@example.com');
  await dialog.locator('form > button').click();
  await expect(dialog.locator('[aria-live="polite"]')).not.toBeEmpty();
  await closeButton.click();
  await expect(dialog).not.toBeVisible();

  const secondTab = page.getByRole('tab').nth(1);
  await secondTab.click();
  await expect(secondTab).toHaveAttribute('aria-selected', 'true');
});

test('Real-estate phone navigation, filters, and inquiry form work', async ({ page }) => {
  await expectPhoneShell(page, urls.realEstate, '.menu-button');
  await page.locator('header nav a').first().click();
  await expect(page.locator('header nav')).not.toBeVisible();

  const allListings = await page.locator('.listing-grid article').count();
  const category = page.locator('.filters button').nth(1);
  await category.click();
  await expect(category).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.listing-grid article').count()).toBeLessThan(allListings);

  await page.locator('.inquiry input[name="name"]').fill('Mobile User');
  await page.locator('.inquiry input[name="email"]').fill('phone@example.com');
  await page.locator('.inquiry form > button').click();
  await expect(page.locator('.inquiry [aria-live="polite"]')).not.toBeEmpty();
});
