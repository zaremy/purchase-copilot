import { test, expect } from '@playwright/test';

/**
 * CSS contract tests for playbook.
 * Verifies style invariants and Porsche-inspired design system.
 */

test.describe('CSS Loading', () => {
  test('only one CSS file loaded from /docs/assets/', async ({ page }) => {
    const cssRequests: string[] = [];

    page.on('request', request => {
      if (request.resourceType() === 'stylesheet') {
        cssRequests.push(request.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter to only our playbook CSS
    const docsCSS = cssRequests.filter(url =>
      url.includes('/assets/styles.css') || url.includes('/purchase-copilot/assets/')
    );

    // Should only load our single stylesheet
    expect(docsCSS.length).toBe(1);
    expect(docsCSS[0]).toContain('styles.css');
  });

  test('no external CSS frameworks loaded', async ({ page }) => {
    const cssRequests: string[] = [];

    page.on('request', request => {
      if (request.resourceType() === 'stylesheet') {
        cssRequests.push(request.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should not load Bootstrap, Tailwind CDN, etc.
    const forbidden = ['bootstrap', 'tailwind', 'bulma', 'foundation', 'materialize'];
    for (const framework of forbidden) {
      const found = cssRequests.some(url => url.toLowerCase().includes(framework));
      expect(found, `Should not load ${framework}`).toBe(false);
    }
  });
});

test.describe('Typography Invariants', () => {
  test('body text has readable line-height', async ({ page }) => {
    await page.goto('/playbook/');

    const lineHeight = await page.evaluate(() => {
      const p = document.querySelector('main.content p');
      if (!p) return null;
      return parseFloat(getComputedStyle(p).lineHeight) / parseFloat(getComputedStyle(p).fontSize);
    });

    // Line-height ratio should be between 1.4 and 2.0 for readability
    expect(lineHeight).toBeGreaterThanOrEqual(1.4);
    expect(lineHeight).toBeLessThanOrEqual(2.0);
  });

  test('h1 is larger than body text', async ({ page }) => {
    await page.goto('/playbook/');

    const sizes = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const p = document.querySelector('main.content p');
      if (!h1 || !p) return null;
      return {
        h1: parseFloat(getComputedStyle(h1).fontSize),
        p: parseFloat(getComputedStyle(p).fontSize),
      };
    });

    expect(sizes).not.toBeNull();
    expect(sizes!.h1).toBeGreaterThan(sizes!.p * 1.5); // h1 should be at least 1.5x body
  });

  test('heading hierarchy is maintained', async ({ page }) => {
    await page.goto('/playbook/architecture'); // Page with multiple heading levels

    const sizes = await page.evaluate(() => {
      const getSizeOrNull = (selector: string) => {
        const el = document.querySelector(selector);
        return el ? parseFloat(getComputedStyle(el).fontSize) : null;
      };
      return {
        h1: getSizeOrNull('h1'),
        h2: getSizeOrNull('h2'),
        h3: getSizeOrNull('h3'),
      };
    });

    if (sizes.h1 && sizes.h2) {
      expect(sizes.h1).toBeGreaterThan(sizes.h2);
    }
    if (sizes.h2 && sizes.h3) {
      expect(sizes.h2).toBeGreaterThan(sizes.h3);
    }
  });
});

test.describe('Layout Invariants', () => {
  test('content has max-width constraint', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/playbook/');

    const contentWidth = await page.evaluate(() => {
      const content = document.querySelector('main.content');
      return content ? content.getBoundingClientRect().width : null;
    });

    // Content should not span full viewport on wide screens
    expect(contentWidth).not.toBeNull();
    expect(contentWidth!).toBeLessThan(1200); // Reasonable max-width
  });

  test('sidebar has fixed width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const sidebarWidth = await page.evaluate(() => {
      const sidebar = document.querySelector('.sidebar');
      return sidebar ? sidebar.getBoundingClientRect().width : null;
    });

    // Sidebar should have consistent width (around 200-300px)
    expect(sidebarWidth).toBeGreaterThanOrEqual(180);
    expect(sidebarWidth).toBeLessThanOrEqual(320);
  });
});

test.describe('Porsche Design System Compliance', () => {
  test('uses strokes/dividers (not cards/boxes)', async ({ page }) => {
    await page.goto('/playbook/');

    // Check for horizontal rules (dividers)
    const hrCount = await page.locator('hr').count();
    expect(hrCount).toBeGreaterThan(0);

    // Check that we don't have shadcn-style cards
    const cardElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let cardCount = 0;
      elements.forEach(el => {
        const style = getComputedStyle(el);
        // Cards typically have box-shadow and border-radius together
        const hasBoxShadow = style.boxShadow !== 'none';
        const hasBorderRadius = parseFloat(style.borderRadius) > 8;
        const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                              style.backgroundColor !== 'transparent' &&
                              style.backgroundColor !== 'rgb(255, 255, 255)';
        if (hasBoxShadow && hasBorderRadius && hasBackground) {
          cardCount++;
        }
      });
      return cardCount;
    });

    // Should have minimal card-like elements (tables might have some styling)
    expect(cardElements).toBeLessThan(5);
  });

  test('background is white or near-white', async ({ page }) => {
    await page.goto('/');

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Should be white or very light
    // rgb(255, 255, 255) or similar
    expect(bgColor).toMatch(/rgb\(2[45]\d, 2[45]\d, 2[45]\d\)|rgb\(255, 255, 255\)/);
  });

  test('primary text is dark', async ({ page }) => {
    await page.goto('/playbook/');

    const textColor = await page.evaluate(() => {
      const p = document.querySelector('main.content p');
      return p ? getComputedStyle(p).color : null;
    });

    // Parse RGB values
    const match = textColor?.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (match) {
      const [, r, g, b] = match.map(Number);
      // Text should be dark (low RGB values)
      const avgBrightness = (r + g + b) / 3;
      expect(avgBrightness).toBeLessThan(100);
    }
  });
});

test.describe('Table Styling', () => {
  test('tables have border styling', async ({ page }) => {
    await page.goto('/playbook/competition');

    const hasBorders = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return null;
      const style = getComputedStyle(table);
      const cellStyle = getComputedStyle(table.querySelector('td') || table.querySelector('th')!);
      return {
        tableBorder: style.borderWidth !== '0px' || style.borderCollapse === 'collapse',
        cellBorder: cellStyle.borderWidth !== '0px',
      };
    });

    expect(hasBorders).not.toBeNull();
    // Either table or cells should have borders
    expect(hasBorders!.tableBorder || hasBorders!.cellBorder).toBe(true);
  });

  test('table headers are visually distinct', async ({ page }) => {
    await page.goto('/playbook/competition');

    const headerStyles = await page.evaluate(() => {
      const th = document.querySelector('th');
      const td = document.querySelector('td');
      if (!th || !td) return null;
      return {
        thBg: getComputedStyle(th).backgroundColor,
        tdBg: getComputedStyle(td).backgroundColor,
        thWeight: getComputedStyle(th).fontWeight,
      };
    });

    expect(headerStyles).not.toBeNull();
    // Headers should be bold
    expect(parseInt(headerStyles!.thWeight)).toBeGreaterThanOrEqual(600);
  });
});

test.describe('Code Block Styling', () => {
  test('code blocks have distinct background', async ({ page }) => {
    await page.goto('/playbook/architecture');

    const codeStyle = await page.evaluate(() => {
      const pre = document.querySelector('pre');
      if (!pre) return null;
      const style = getComputedStyle(pre);
      return {
        background: style.backgroundColor,
        fontFamily: style.fontFamily,
      };
    });

    // Code blocks should have background that's not pure white
    if (codeStyle) {
      expect(codeStyle.background).not.toBe('rgb(255, 255, 255)');
      // Should use monospace font
      expect(codeStyle.fontFamily.toLowerCase()).toMatch(/mono|courier|consolas/);
    }
  });

  test('code blocks have overflow handling', async ({ page }) => {
    await page.goto('/playbook/architecture');

    const overflow = await page.evaluate(() => {
      const pre = document.querySelector('pre');
      return pre ? getComputedStyle(pre).overflowX : null;
    });

    expect(['auto', 'scroll']).toContain(overflow);
  });
});

test.describe('Link Styling', () => {
  test('links have visible styling', async ({ page }) => {
    await page.goto('/playbook/');

    const linkStyle = await page.evaluate(() => {
      const link = document.querySelector('main.content a');
      if (!link) return null;
      const style = getComputedStyle(link);
      return {
        color: style.color,
        textDecoration: style.textDecorationLine,
      };
    });

    expect(linkStyle).not.toBeNull();
    // Links should be visually distinct (colored or underlined)
    const hasUnderline = linkStyle!.textDecoration.includes('underline');
    const hasColor = linkStyle!.color !== 'rgb(0, 0, 0)'; // Not pure black
    expect(hasUnderline || hasColor).toBe(true);
  });
});

test.describe('Status Badge Styling', () => {
  test('status badges are visually distinct', async ({ page }) => {
    await page.goto('/playbook/');

    const statusStyle = await page.evaluate(() => {
      const status = document.querySelector('.status');
      if (!status) return null;
      const style = getComputedStyle(status);
      return {
        background: style.backgroundColor,
        padding: style.padding,
        borderRadius: style.borderRadius,
      };
    });

    expect(statusStyle).not.toBeNull();
    // Status should have some styling (background color or padding)
    const hasBg = statusStyle!.background !== 'rgba(0, 0, 0, 0)' &&
                  statusStyle!.background !== 'transparent';
    const hasPadding = statusStyle!.padding !== '0px';
    expect(hasBg || hasPadding).toBe(true);
  });
});
