import { test, expect } from '@playwright/test';
import { expectCleanAudit, expectNoCrash, settle, themeOf, useTheme, watchErrors } from './helpers';

/** Level 1 · smoke: every public page loads in the project's theme, with the brand font and no crash. */
const PUBLIC_PAGES = [
  { path: '/', heading: /tutoring platform/i },
  { path: '/login', heading: /welcome back/i },
  { path: '/register', heading: /create account/i },
  { path: '/forgot-password', heading: null },
  { path: '/forgot-password/sent', heading: null },
  { path: '/reset-password/success', heading: null },
  { path: '/support', heading: null },
  { path: '/privacy-policy', heading: null },
  { path: '/terms-and-conditions', heading: null },
];

test.describe('Smoke · public pages', () => {
  for (const p of PUBLIC_PAGES) {
    test(`loads ${p.path}`, async ({ page }, testInfo) => {
      const theme = themeOf(testInfo);
      await useTheme(page, theme);
      const errors = watchErrors(page);

      const res = await page.goto(p.path);
      expect(res?.status(), 'HTTP status').toBeLessThan(400);
      await settle(page);
      await expectNoCrash(page);

      // Theme + Trusted Navy tokens applied
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const tokens = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return {
          primary: cs.getPropertyValue('--color-m-primary').trim(),
          font: getComputedStyle(document.body).fontFamily,
        };
      });
      expect(tokens.primary).toBe(theme === 'dark' ? '#4b69ee' : '#1f3fbf');
      expect(tokens.font).toContain('Plus Jakarta Sans');
      expect(
        await page.evaluate(() => document.fonts.check('600 16px "Plus Jakarta Sans Variable"'))
      ).toBe(true);

      if (p.heading) await expect(page.getByText(p.heading).first()).toBeVisible();

      await expectCleanAudit(page, testInfo, p.path);
      await testInfo.attach(`${p.path} (${theme})`, {
        body: await page.screenshot({ fullPage: false }),
        contentType: 'image/png',
      });
      expect(errors.pageErrors, 'uncaught page errors').toEqual([]);
    });
  }
});
