import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for playbook pages.
 * Uses toHaveScreenshot() for full-page comparisons.
 *
 * Baselines are stored in tests/playbook/visual.spec.ts-snapshots/
 * Update with: npx playwright test visual.spec.ts --update-snapshots
 */

const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  wide: { width: 1440, height: 900 },
} as const;

// All pages to capture
const PAGES = [
  { path: '/', name: 'landing' },
  { path: '/playbook/', name: 'overview' },
  { path: '/playbook/product', name: 'product' },
  { path: '/playbook/roadmap', name: 'roadmap' },
  { path: '/playbook/architecture', name: 'architecture' },
  { path: '/playbook/specs', name: 'specs' },
  { path: '/playbook/strategy', name: 'strategy' },
  { path: '/playbook/monetization', name: 'monetization' },
  { path: '/playbook/market', name: 'market' },
  { path: '/playbook/segments', name: 'segments' },
  { path: '/playbook/competition', name: 'competition' },
  { path: '/playbook/marketing', name: 'marketing' },
  { path: '/playbook/future', name: 'future' },
  { path: '/playbook/resources', name: 'resources' },
];

// Disable animations for stable screenshots
const DISABLE_ANIMATIONS_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`;

test.describe('Visual Regression - Desktop', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  for (const page of PAGES) {
    test(`${page.name} matches baseline`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      // Inject CSS to disable animations
      await browserPage.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

      await expect(browserPage).toHaveScreenshot(`${page.name}-desktop.png`, {
        fullPage: true,
        threshold: 0.1, // 10% pixel difference threshold
      });
    });
  }
});

test.describe('Visual Regression - Mobile', () => {
  test.use({ viewport: VIEWPORTS.mobile });

  for (const page of PAGES) {
    test(`${page.name} matches baseline`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      await browserPage.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

      await expect(browserPage).toHaveScreenshot(`${page.name}-mobile.png`, {
        fullPage: true,
        threshold: 0.1,
      });
    });
  }
});

test.describe('Visual Regression - Tablet', () => {
  test.use({ viewport: VIEWPORTS.tablet });

  // Only test key pages at tablet to reduce baseline maintenance
  const keyPages = PAGES.filter(p =>
    ['landing', 'overview', 'architecture', 'competition'].includes(p.name)
  );

  for (const page of keyPages) {
    test(`${page.name} matches baseline`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      await browserPage.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

      await expect(browserPage).toHaveScreenshot(`${page.name}-tablet.png`, {
        fullPage: true,
        threshold: 0.1,
      });
    });
  }
});

test.describe('Visual Regression - Wide', () => {
  test.use({ viewport: VIEWPORTS.wide });

  // Only test key pages at wide to reduce baseline maintenance
  const keyPages = PAGES.filter(p =>
    ['landing', 'overview', 'architecture'].includes(p.name)
  );

  for (const page of keyPages) {
    test(`${page.name} matches baseline`, async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState('networkidle');

      await browserPage.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

      await expect(browserPage).toHaveScreenshot(`${page.name}-wide.png`, {
        fullPage: true,
        threshold: 0.1,
      });
    });
  }
});

test.describe('Component Visual Tests', () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test('navigation sidebar appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

    const sidebar = page.locator('.sidebar');
    await expect(sidebar).toHaveScreenshot('sidebar.png', {
      threshold: 0.1,
    });
  });

  test('page metadata badge', async ({ page }) => {
    await page.goto('/playbook/');
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

    const meta = page.locator('.page-meta');
    await expect(meta).toHaveScreenshot('page-meta.png', {
      threshold: 0.1,
    });
  });

  test('table styling', async ({ page }) => {
    await page.goto('/playbook/competition');
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

    // Capture first table
    const table = page.locator('table').first();
    await expect(table).toHaveScreenshot('table.png', {
      threshold: 0.1,
    });
  });

  test('footer appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.addStyleTag({ content: DISABLE_ANIMATIONS_CSS });

    const footer = page.locator('.page-footer');
    await expect(footer).toHaveScreenshot('footer.png', {
      threshold: 0.1,
    });
  });
});

test.describe('Dark Mode / Theme', () => {
  // Currently no dark mode, but placeholder for future
  test.skip('respects system preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Would check for dark mode styles here
  });
});
