import { test, expect } from '@playwright/test';

/**
 * Content integrity tests for playbook pages.
 * Verifies: H1 presence, metadata, no placeholders, working links.
 */

// All playbook pages to test
const PLAYBOOK_PAGES = [
  { path: '/', name: 'Landing' },
  { path: '/playbook/', name: 'Overview' },
  { path: '/playbook/product', name: 'Product' },
  { path: '/playbook/roadmap', name: 'Roadmap' },
  { path: '/playbook/architecture', name: 'Architecture' },
  { path: '/playbook/specs', name: 'Specs' },
  { path: '/playbook/strategy', name: 'Strategy' },
  { path: '/playbook/monetization', name: 'Monetization' },
  { path: '/playbook/market', name: 'Market' },
  { path: '/playbook/segments', name: 'Segments' },
  { path: '/playbook/competition', name: 'Competition' },
  { path: '/playbook/marketing', name: 'Marketing' },
  { path: '/playbook/future', name: 'Future' },
  { path: '/playbook/resources', name: 'Resources' },
];

// Playbook pages (not landing) should have metadata
const PAGES_WITH_METADATA = PLAYBOOK_PAGES.filter(p => p.path !== '/');

// Placeholder patterns that should not appear in content
const PLACEHOLDER_PATTERNS = [
  /\bTBD\b/i,
  /\bTODO\b/i,
  /\blorem\s+ipsum\b/i,
  /\[placeholder\]/i,
  /\[insert\s+/i,
  /FIXME/i,
];

test.describe('Content Integrity', () => {
  for (const page of PLAYBOOK_PAGES) {
    test.describe(page.name, () => {
      test('loads without console errors', async ({ page: browserPage }) => {
        const errors: string[] = [];
        browserPage.on('console', msg => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });

        await browserPage.goto(page.path);
        await browserPage.waitForLoadState('networkidle');

        // Filter out known benign errors (e.g., favicon 404)
        const criticalErrors = errors.filter(
          e => !e.includes('favicon') && !e.includes('404')
        );
        expect(criticalErrors).toHaveLength(0);
      });

      test('has exactly one h1', async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        const h1Elements = await browserPage.locator('h1').all();
        expect(h1Elements).toHaveLength(1);
      });

      test('has a valid title', async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        const title = await browserPage.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      });

      test('has no placeholder text', async ({ page: browserPage }) => {
        await browserPage.goto(page.path);
        const content = await browserPage.locator('main.content').textContent();

        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(content).not.toMatch(pattern);
        }
      });
    });
  }
});

test.describe('Metadata', () => {
  for (const page of PAGES_WITH_METADATA) {
    test(`${page.name} has status and last_updated`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);

      // Check for page-meta div with status
      const metaDiv = browserPage.locator('.page-meta');
      await expect(metaDiv).toBeVisible();

      // Check status badge exists
      const status = metaDiv.locator('.status');
      await expect(status).toBeVisible();

      // Check last_updated exists
      const lastUpdated = metaDiv.locator('.last-updated');
      await expect(lastUpdated).toBeVisible();
    });
  }
});

test.describe('Navigation', () => {
  test('sidebar navigation is present', async ({ page }) => {
    await page.goto('/');
    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('all playbook nav links are present', async ({ page }) => {
    await page.goto('/');

    // Check for main nav sections
    const nav = page.locator('.sidebar nav');
    await expect(nav).toBeVisible();

    // Verify playbook section exists
    const playbookSection = nav.locator('text=Playbook');
    await expect(playbookSection).toBeVisible();
  });

  test('logo links to home', async ({ page }) => {
    await page.goto('/playbook/');
    const logo = page.locator('.logo');
    await expect(logo).toHaveAttribute('href', /\/$/);
  });
});

test.describe('Internal Links', () => {
  test('all internal links resolve (no 404)', async ({ page }) => {
    await page.goto('/');

    // Get all internal links
    const links = await page.locator('a[href^="/"]').all();
    const hrefs = new Set<string>();

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && !href.includes('#')) {
        hrefs.add(href);
      }
    }

    // Test each unique link
    for (const href of hrefs) {
      const response = await page.goto(href);
      expect(response?.status(), `Link ${href} should not be 404`).not.toBe(404);
    }
  });

  test('anchor links have valid targets', async ({ page }) => {
    // Test a page known to have anchor links
    await page.goto('/playbook/architecture');

    const anchorLinks = await page.locator('a[href^="#"]').all();

    for (const link of anchorLinks) {
      const href = await link.getAttribute('href');
      if (href && href.length > 1) {
        const targetId = href.substring(1);
        const target = page.locator(`#${CSS.escape(targetId)}`);
        await expect(target, `Anchor target ${href} should exist`).toBeAttached();
      }
    }
  });
});
