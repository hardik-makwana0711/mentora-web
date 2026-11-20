// Debug helper: lists visible buttons/links without an accessible name.
// Usage (PowerShell): node scripts/find-unnamed.mjs <role> <path> [width]
import { chromium } from '@playwright/test';

const [role = 'mentor', path = '/mentor/availability', width = '375'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: Number(width), height: 812 },
  storageState: new URL(`../.auth/${role}.json`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
});
const page = await ctx.newPage();
await page.goto(`http://localhost:5180${path}`);
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(800);
const out = await page.evaluate(() =>
  [...document.querySelectorAll('button, a[href], [role="button"]')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const name = el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText?.trim();
      return !name;
    })
    .map((el) => el.outerHTML.slice(0, 300)),
);
console.log(out.join('\n\n') || 'none');
await browser.close();
