// Builds a fully self-contained index.html for static hosting
// (GitHub Pages / any static host). Everything is inlined, so there
// are no asset paths to get wrong on a subdirectory deploy.
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';

const SITE_URL = process.env.SITE_URL || 'https://neetworldxyz.github.io/howie-invite';
const dist = 'dist';
const assets = readdirSync(join(dist, 'assets'));
const css = readFileSync(join(dist, 'assets', assets.find((f) => f.endsWith('.css'))), 'utf8');
const js = readFileSync(join(dist, 'assets', assets.find((f) => f.endsWith('.js'))), 'utf8');
const esc = (s) => s.replace(/<\/script/gi, '<\\/script');

const TITLE = 'You Have Been Chosen';
const DESC = 'One of ten. Howies Finest Fantasy Football 2026 — open your invitation.';

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>${TITLE}</title>
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#0a0a0c">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Howies Finest">
<link rel="apple-touch-icon" href="${SITE_URL}/icon.png">
<link rel="icon" href="${SITE_URL}/icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Howies Finest">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${SITE_URL}/">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${TITLE}">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${SITE_URL}/og.png">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap">
<style>
${css}
</style>
</head>
<body>
<div id="root"></div>
<script type="module">
${esc(js)}
</script>
</body>
</html>
`;

mkdirSync('site', { recursive: true });
writeFileSync('site/index.html', out);
// Pages needs this or it runs the output through Jekyll
writeFileSync('site/.nojekyll', '');
console.log(`site/index.html — ${(out.length / 1024).toFixed(0)} KB`);
