// Every sfx.<name>() a component calls must exist. A missing one throws
// inside an event handler and silently kills the interaction.
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const src = readFileSync('src/sound.js', 'utf8');
const defined = new Set([...src.matchAll(/^  (\w+)\(/gm)].map((m) => m[1]));

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const used = new Map();
for (const f of walk('src').filter((f) => /\.(jsx?|mjs)$/.test(f) && !f.endsWith('sound.js'))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/\bsfx\.(\w+)\s*\(/g)) {
    if (!used.has(m[1])) used.set(m[1], f);
  }
}
const missing = [...used].filter(([n]) => !defined.has(n));
if (missing.length) {
  for (const [n, f] of missing) console.error(`MISSING  sfx.${n}()  called from ${f}`);
  process.exit(1);
}
console.log(`  ok  all ${used.size} sfx calls resolve`);
