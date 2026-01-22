import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for playbook tests.
 * Tests run against local Jekyll server or live GitHub Pages.
 */
export default defineConfig({
  testDir: './tests/playbook',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    // Base URL for tests - use local Jekyll or live site
    baseURL: process.env.PLAYBOOK_URL || 'http://localhost:4000/purchase-copilot',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Viewports for responsive tests
  // Defined here for reference, used in responsive.spec.ts
  // - Mobile: 375×812
  // - Tablet: 768×1024
  // - Desktop: 1280×800
  // - Wide: 1440×900

  // Web server: build Jekyll, then serve _site with a static server
  // In CI: Jekyll builds to docs/_site, then we serve it
  // Locally: same flow, or set PLAYBOOK_URL to test against live site
  webServer: process.env.PLAYBOOK_URL ? undefined : {
    command: 'cd docs && bundle exec jekyll build && npx serve _site -l 4000',
    url: 'http://localhost:4000/purchase-copilot',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
