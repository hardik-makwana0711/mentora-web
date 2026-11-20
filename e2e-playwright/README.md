# Mentora web · Playwright E2E

End-to-end tests for the Trusted Navy rollout: every role, both themes, desktop and 375 px.
They run against a **local** stack only, with the seeded test accounts. Do not point them at production.

## Levels (small → big)

| File                          | Level | What it checks                                                                                                                                                          |
| ----------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/auth.setup.ts`         | 0     | Logs in parent, student, mentor and admin through the real form; saves each session                                                                                     |
| `tests/01-smoke.spec.ts`      | 1     | All 9 public pages load; theme attribute, navy tokens and Plus Jakarta Sans font applied; design audit                                                                  |
| `tests/02-auth.spec.ts`       | 2     | Login validation, wrong password, show/hide password, theme toggle, TR ⇄ EN, links, every role signs in, route guards, logout                                           |
| `tests/03-role-pages.spec.ts` | 3     | 54 role pages (parent 14, student 12, mentor 20, admin 8) render without crash and pass the design audit                                                                |
| `tests/04-buttons.spec.ts`    | 4     | Presses every _safe_ button/link on the main role pages (never delete, pay, submit, log out…); every sidebar link; header theme/language/notifications                  |
| `tests/05-journeys.spec.ts`   | 5     | Wallet top-up (validation + success), search → mentor → booking, profile edit + restore, lessons tabs/calendar, listing form validation, payout form, 375 px navigation |

**Design audit** (runs on every page): text under 12 px, WCAG AA contrast (4.5:1 / 3:1 large), horizontal overflow,
controls without an accessible name. Tap targets under 24×24 px are reported as notes.

**Projects:** `light`, `dark` (1366×860) and `mobile-light`, `mobile-dark` (375×812, levels 1 and 3).

## Run it

1. Local Postgres with the seed data, and the backend on port 4000:
   ```bash
   cd apps/backend
   DATABASE_URL=postgresql://<user>:<pass>@localhost:5432/<db> npx prisma migrate deploy
   DATABASE_URL=... npx tsx prisma/seed.ts
   DATABASE_URL=... CORS_ORIGINS=http://localhost:5180 ENABLE_PARENT_WALLET_DUMMY_TOPUP=true npx tsx src/server.ts
   ```
2. Web on port 5180, pointed at the local API:
   ```bash
   cd C:\mentora-web
   set VITE_API_BASE_URL=http://localhost:4000&& npm run dev -- --port 5180 --strictPort
   ```
3. Tests (uses your installed Google Chrome, no browser download):
   ```bash
   cd C:\mentora-web\e2e-playwright
   npm install
   npx playwright test                 # everything
   npx playwright test --project=dark  # one theme
   npx playwright show-report report   # HTML report with screenshots per page
   node scripts/summarize.mjs          # compact failure list
   ```

Override accounts with `E2E_<ROLE>_EMAIL` / `E2E_<ROLE>_PASSWORD` and the URL with `E2E_BASE_URL`.

Helpers: `scripts/find-overflow.mjs <role> <path> [theme]` lists elements wider than 375 px.
