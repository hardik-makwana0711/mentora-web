// Prints a compact list of failures (and annotations) from report/results.json.
import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync(new URL('../results/results.json', import.meta.url), 'utf8'));
const strip = (s) => s.replace(/\u001b\[[0-9;]*m/g, '');
const rows = [];
const walk = (suite, trail = []) => {
  for (const s of suite.suites ?? []) walk(s, [...trail, s.title]);
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      const r = t.results[t.results.length - 1];
      if (!r) continue;
      const title = `[${t.projectName}] ${[...trail.slice(1), spec.title].join(' › ')}`;
      if (r.status !== 'passed' && r.status !== 'skipped') {
        const msgs = (r.errors ?? []).map((e) => strip(e.message ?? '').split('\n').filter(Boolean).slice(0, 14).join('\n      '));
        rows.push(`FAIL ${title}\n      ${msgs.join('\n      ---\n      ')}`);
      }
      for (const a of t.annotations ?? []) if (process.argv.includes('--notes')) rows.push(`NOTE ${title} :: ${a.type}: ${a.description?.slice(0, 400)}`);
    }
  }
};
for (const s of data.suites) walk(s, [s.title]);
console.log(rows.join('\n'));
console.log(`\nstats: ${JSON.stringify(data.stats)}`);
