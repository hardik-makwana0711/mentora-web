// Debug helper: lists elements wider than a 375 px viewport for a role page.
// Usage: node scripts/find-overflow.mjs parent /parent/dashboard [light|dark]
import { chromium } from '@playwright/test';

const [role = 'parent', path = '/parent/dashboard', theme = 'light'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  storageState: new URL(`../.auth/${role}.json`, import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
});
const page = await ctx.newPage();
await page.addInitScript((t) => localStorage.setItem('mentora:theme', t), theme);
await page.goto(`http://localhost:5180${path}`);
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(800);
const res = await page.evaluate(() => {
  const W = document.documentElement.clientWidth;
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > W + 1 && r.width > 0) {
      const parentOver = el.parentElement && el.parentElement.getBoundingClientRect().right > W + 1;
      if (!parentOver) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 6).join('.')} right=${Math.round(r.right)} w=${Math.round(r.width)} text="${(el.textContent || '').trim().slice(0, 40)}"`);
    }
  });
  return { W, scrollW: document.documentElement.scrollWidth, out: out.slice(0, 15) };
});
console.log(JSON.stringify(res, null, 2));
await browser.close();
