import { test, expect } from '@playwright/test';

/**
 * Responsive behavior tests for playbook.
 * Tests 4 viewports: Mobile (375×812), Tablet (768×1024), Desktop (1280×800), Wide (1440×900).
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1440, height: 900 },
} as const;

// Representative pages to test responsive behavior
const PAGES_TO_TEST = [
  '/',
  '/playbook/',
  '/playbook/architecture', // Has tables and code blocks
  '/playbook/competition', // Has comparison tables
];

test.describe('Responsive - Mobile', () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px tolerance
  });

  test('hamburger menu is visible', async ({ page }) => {
    await page.goto('/');
    const menuToggle = page.locator('#menu-toggle');
    await expect(menuToggle).toBeVisible();
  });

  test('sidebar is collapsed by default', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.sidebar');

    // On mobile, sidebar should not have 'open' class initially
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('hamburger opens and closes sidebar', async ({ page }) => {
    await page.goto('/');
    const menuToggle = page.locator('#menu-toggle');
    const sidebar = page.locator('.sidebar');

    // Click to open
    await menuToggle.click();
    await expect(sidebar).toHaveClass(/open/);

    // Click to close
    await menuToggle.click();
    await expect(sidebar).not.toHaveClass(/open/);
  });

  for (const pagePath of PAGES_TO_TEST) {
    test(`${pagePath} - tables don't overflow`, async ({ page }) => {
      await page.goto(pagePath);
      const tables = await page.locator('table').all();

      for (const table of tables) {
        const tableBox = await table.boundingBox();
        const contentBox = await page.locator('main.content').boundingBox();

        if (tableBox && contentBox) {
          // Table should not exceed content area
          expect(tableBox.width).toBeLessThanOrEqual(contentBox.width + 20); // 20px tolerance for padding
        }
      }
    });

    test(`${pagePath} - images scale down`, async ({ page }) => {
      await page.goto(pagePath);
      const images = await page.locator('img').all();

      for (const img of images) {
        const imgBox = await img.boundingBox();
        const viewportWidth = VIEWPORTS.mobile.width;

        if (imgBox) {
          expect(imgBox.width).toBeLessThanOrEqual(viewportWidth);
        }
      }
    });
  }
});

test.describe('Responsive - Tablet', () => {
  test.use({ viewport: VIEWPORTS.tablet });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('content is readable', async ({ page }) => {
    await page.goto('/playbook/');
    const content = page.locator('main.content');
    await expect(content).toBeVisible();

    const contentBox = await content.boundingBox();
    expect(contentBox?.width).toBeGreaterThan(300); // Ensure reasonable content width
  });
});

test.describe('Responsive - Desktop', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('sidebar is persistently visible', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox?.width).toBeGreaterThan(150); // Sidebar should have reasonable width
  });

  test('hamburger menu is hidden', async ({ page }) => {
    await page.goto('/');
    const menuToggle = page.locator('#menu-toggle');

    // On desktop, hamburger should be hidden via CSS
    // We check if it's not visible or has display:none
    const isVisible = await menuToggle.isVisible();
    expect(isVisible).toBe(false);
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/');

    // Click on a playbook link
    await page.click('text=Product');
    await expect(page).toHaveURL(/\/playbook\/product/);

    // Verify sidebar is still visible after navigation
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Responsive - Wide', () => {
  test.use({ viewport: VIEWPORTS.wide });

  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('content width is constrained', async ({ page }) => {
    await page.goto('/playbook/');
    const content = page.locator('main.content');
    const contentBox = await content.boundingBox();

    // Content should have max-width constraint, not span full viewport
    expect(contentBox?.width).toBeLessThan(VIEWPORTS.wide.width - 200); // Account for sidebar
  });

  test('layout maintains proper proportions', async ({ page }) => {
    await page.goto('/');

    const sidebar = page.locator('.sidebar');
    const content = page.locator('main.content');

    const sidebarBox = await sidebar.boundingBox();
    const contentBox = await content.boundingBox();

    // Sidebar should be narrower than content
    if (sidebarBox && contentBox) {
      expect(sidebarBox.width).toBeLessThan(contentBox.width);
    }
  });
});

test.describe('Code Blocks Responsive', () => {
  const viewports = Object.entries(VIEWPORTS);

  for (const [name, viewport] of viewports) {
    test.describe(`${name} viewport`, () => {
      test.use({ viewport });

      test('code blocks scroll horizontally (no page overflow)', async ({ page }) => {
        await page.goto('/playbook/architecture');

        // Check page doesn't overflow
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);

        // Code blocks should have overflow-x: auto/scroll
        const codeBlocks = await page.locator('pre').all();
        for (const block of codeBlocks) {
          const overflow = await block.evaluate(el => getComputedStyle(el).overflowX);
          expect(['auto', 'scroll']).toContain(overflow);
        }
      });
    });
  }
});
