/**
 * Smoke test structured education + discovery APIs (read-only except optional profile patch).
 * Usage: node scripts/education-smoke.mjs
 * Env: VITE_API_BASE_URL from apps/web/.env or API_BASE_URL override
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadApiBase() {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL.replace(/\/$/, '');
  try {
    const envPath = resolve(__dirname, '../.env');
    const raw = readFileSync(envPath, 'utf8');
    const match = raw.match(/^VITE_API_BASE_URL=(.+)$/m);
    if (match) return match[1].trim().replace(/\/$/, '');
  } catch {
    /* ignore */
  }
  return 'http://localhost:4000';
}

const API = loadApiBase();
const results = [];

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function json(method, path, { token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Security-Tunnel': 'hardened',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function login(email, password) {
  const { status, data } = await json('POST', '/api/v1/auth/login', {
    body: { login_identifier: email, password },
  });
  if (status !== 200 || !data?.data?.tokens?.access_token) {
    throw new Error(`Login failed for ${email}: ${data?.message ?? status}`);
  }
  return data.data.tokens.access_token;
}

async function main() {
  console.log(`API base: ${API}\n`);

  // Public education endpoints
  {
    const { status, data } = await json('GET', '/api/v1/education/universities?q=uni&limit=3');
    if (status === 200 && data?.success && Array.isArray(data.data?.items)) {
      pass('GET /education/universities', `${data.data.items.length} items`);
    } else fail('GET /education/universities', `${status} ${data?.message ?? ''}`);
  }

  {
    const { status, data } = await json('GET', '/api/v1/education/subjects?grade=8');
    if (status === 200 && data?.success && Array.isArray(data.data?.items)) {
      pass('GET /education/subjects?grade=8', `${data.data.items.length} subjects`);
    } else fail('GET /education/subjects?grade=8', `${status} ${data?.message ?? ''}`);
  }

  {
    const { status, data } = await json('GET', '/api/v1/education/exam-subjects?exam_track=LGS');
    if (status === 200 && data?.success && Array.isArray(data.data?.items)) {
      pass('GET /education/exam-subjects?exam_track=LGS', `${data.data.items.length} items`);
    } else fail('GET /education/exam-subjects?exam_track=LGS', `${status} ${data?.message ?? ''}`);
  }

  let parentToken;
  let mentorToken;
  try {
    parentToken = await login('parent.seed@mentora.dev', 'Parent@123');
    pass('Login parent seed');
  } catch (e) {
    fail('Login parent seed', e.message);
  }

  try {
    mentorToken = await login('mentor.seed@mentora.dev', 'Mentor@123');
    pass('Login mentor seed');
  } catch (e) {
    fail('Login mentor seed', e.message);
  }

  if (mentorToken) {
    const { status, data } = await json('GET', '/api/v1/profile/me', { token: mentorToken });
    const mp = data?.data?.mentor_profile;
    if (status === 200 && data?.success && mp) {
      const hasStructuredKeys =
        'primary_university' in mp &&
        'subject_proficiencies' in mp &&
        'exam_proficiencies' in mp;
      if (hasStructuredKeys) {
        pass('GET /profile/me mentor structured fields', `subjects=${mp.subject_proficiencies?.length ?? 0}`);
      } else fail('GET /profile/me mentor structured fields', 'missing keys');
    } else fail('GET /profile/me mentor', `${status}`);
  }

  if (parentToken) {
    const { status, data } = await json('GET', '/api/v1/mentors/search?limit=5', { token: parentToken });
    const items = data?.data?.items;
    if (status === 200 && Array.isArray(items)) {
      const withStructured = items.filter((i) => i.university_structured || i.subjects_structured?.length);
      pass('GET /mentors/search', `${items.length} mentors, ${withStructured.length} with structured`);
    } else fail('GET /mentors/search', `${status}`);

    const uniRes = await json('GET', '/api/v1/education/universities?q=a&limit=1');
    const uniId = uniRes.data?.data?.items?.[0]?.id;
    if (uniId) {
      const filtered = await json('GET', `/api/v1/mentors/search?university_id=${uniId}&limit=3`, {
        token: parentToken,
      });
      if (filtered.status === 200) {
        pass('GET /mentors/search?university_id', `${filtered.data?.data?.items?.length ?? 0} results`);
      } else fail('GET /mentors/search?university_id', `${filtered.status}`);
    }

    const subRes = await json('GET', '/api/v1/education/subjects?grade=8');
    const subjectId = subRes.data?.data?.items?.[0]?.id;
    if (subjectId) {
      const filtered = await json('GET', `/api/v1/mentors/search?subject_id=${subjectId}&grade=8&limit=3`, {
        token: parentToken,
      });
      if (filtered.status === 200) {
        pass('GET /mentors/search?subject_id&grade', `${filtered.data?.data?.items?.length ?? 0} results`);
      } else fail('GET /mentors/search?subject_id&grade', `${filtered.status}`);
    }

    const examRes = await json('GET', '/api/v1/education/exam-subjects?exam_track=TYT');
    const examId = examRes.data?.data?.items?.[0]?.id;
    if (examId) {
      const filtered = await json('GET', `/api/v1/mentors/search?exam_track_subject_id=${examId}&limit=3`, {
        token: parentToken,
      });
      if (filtered.status === 200) {
        pass('GET /mentors/search?exam_track_subject_id', `${filtered.data?.data?.items?.length ?? 0} results`);
      } else fail('GET /mentors/search?exam_track_subject_id', `${filtered.status}`);
    }

    if (items?.[0]?.mentor_id) {
      const mid = items[0].mentor_id;
      const prof = await json('GET', `/api/v1/mentors/${mid}/public-profile`, { token: parentToken });
      const m = prof.data?.data?.mentor;
      const listings = prof.data?.data?.listings;
      if (prof.status === 200 && m && Array.isArray(listings)) {
        const structuredListing = listings.find((l) => l.structured);
        pass(
          'GET /mentors/:id/public-profile',
          `listings=${listings.length}, structured=${structuredListing ? 'yes' : 'legacy-only'}`
        );
      } else fail('GET /mentors/:id/public-profile', `${prof.status}`);
    }

    const fav = await json('GET', '/api/v1/favourites/mentors', { token: parentToken });
    if (fav.status === 200 && Array.isArray(fav.data?.data)) {
      pass('GET /favourites/mentors', `${fav.data.data.length} favourites`);
    } else fail('GET /favourites/mentors', `${fav.status}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
