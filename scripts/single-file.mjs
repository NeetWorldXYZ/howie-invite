// Bundles the built app into ONE self-contained HTML fragment
// (no doctype/html/head/body) suitable for publishing as an Artifact.
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const dist = 'dist';
const assets = readdirSync(join(dist, 'assets'));
const cssFile = assets.find((f) => f.endsWith('.css'));
const jsFile = assets.find((f) => f.endsWith('.js'));

const css = readFileSync(join(dist, 'assets', cssFile), 'utf8');
const js = readFileSync(join(dist, 'assets', jsFile), 'utf8');
const esc = (s) => s.replace(/<\/script/gi, '<\\/script');

const out = `<title>Howies Finest</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap">
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${esc(js)}
</script>
`;

const target = process.argv[2] || 'dist/single.html';
writeFileSync(target, out);
console.log(`wrote ${target} — ${(out.length / 1024).toFixed(0)} KB`);
