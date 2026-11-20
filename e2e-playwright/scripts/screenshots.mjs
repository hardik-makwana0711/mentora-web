// Captures UI screenshots of the main pages for every role, in light and dark, desktop and phone.
// LOCAL stack only (seeded test accounts). Usage: node scripts/screenshots.mjs <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5180';
const out = process.argv[2] ?? 'screenshots';
fs.mkdirSync(out, { recursive: true });

const ACC = {
  parent: ['parent.seed@mentora.dev', 'Parent@123', ['dashboard', 'wallet', 'search', 'lessons', 'students', 'messages', 'profile']],
  student: ['student.seed@mentora.dev', 'Student@123', ['dashboard', 'lessons', 'materials', 'search', 'profile']],
  mentor: ['mentor.seed@mentora.dev', 'Mentor@123', ['dashboard', 'earnings', 'availability', 'listings', 'lessons', 'profile']],
  admin: ['admin.seed@mentora.dev', 'Admin@123', ['', 'users', 'mentor-verifications', 'marketing']],
};
const PUBLIC = ['/', '/login'];
const VIEWS = { desktop: { width: 1366, height: 860 }, tablet: { width: 768, height: 1024 }, phone: { width: 375, height: 812 } };

const browser = await chromium.launch({ channel: 'chrome' });

async function newCtx(theme, view, storageState) {
  const ctx = await browser.newContext({ viewport: VIEWS[view], deviceScaleFactor: view === 'phone' ? 2 : 1, storageState });
  await ctx.addInitScript((t) => {
    localStorage.setItem('mentora:theme', t);
    localStorage.setItem('mentora:locale', 'en');
  }, theme);
  return ctx;
}

async function shot(page, url, file) {
  await page.goto(BASE + url);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(out, file) });
  const ox = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (ox > 1) console.log('OVERFLOW', file, ox);
  console.log('saved', file);
}

const states = {};
for (const [role, [email, pw]] of Object.entries(ACC)) {
  const ctx = await newCtx('light', 'desktop');
  const page = await ctx.newPage();
  await page.goto(BASE + '/login');
  await page.getByLabel(/email or phone/i).fill(email);
  await page.getByLabel(/^password$/i).fill(pw);
  await page.getByRole('button', { name: /^log in$/i }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 20000 });
  states[role] = await ctx.storageState();
  await ctx.close();
}

for (const theme of ['light', 'dark']) {
  for (const view of Object.keys(VIEWS)) {
    const pub = await newCtx(theme, view);
    const pp = await pub.newPage();
    for (const p of PUBLIC) await shot(pp, p, `${theme}-${view}-public-${p === '/' ? 'home' : p.slice(1)}.png`);
    await pub.close();
    for (const [role, [, , pages]] of Object.entries(ACC)) {
      const list = view === 'desktop' ? pages : pages.slice(0, 4);
      const ctx = await newCtx(theme, view, states[role]);
      const page = await ctx.newPage();
      for (const sub of list) await shot(page, `/${role}${sub ? '/' + sub : ''}`, `${theme}-${view}-${role}-${sub || 'home'}.png`);
      await ctx.close();
    }
  }
}
await browser.close();
