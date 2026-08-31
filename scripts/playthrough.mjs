// End-to-end run using REAL gestures against the built app.
// Requires: npm run build && npx vite preview --port 4173
import { chromium } from 'playwright';

const BASE = 'http://localhost:4173/';
let failures = 0;
const ok = (n) => console.log(`  ok  ${n}`);
const fail = (n, e) => { failures++; console.error(`FAIL  ${n}: ${e}`); };

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const btn = (n) => page.getByRole('button', { name: n, exact: true });
const box = (sel) => page.locator(sel).boundingBox();

try {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // ---------- ENVELOPE -> GOLDEN TICKET ----------
  await page.getByText('You have been chosen.').waitFor();
  if (await page.locator('.envelope .hh-logo').count() !== 1) throw new Error('logo missing from envelope');
  ok('envelope shows the embossed Howie\'s logo');
  const env = await box('.envelope');
  await page.mouse.move(env.x + 14, env.y + env.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 24; i++) {
    await page.mouse.move(env.x + 14 + (env.width * 0.78 * i) / 24, env.y + env.height / 2);
    await page.waitForTimeout(10);
  }
  await page.mouse.up();
  await page.locator('.gticket').waitFor({ timeout: 8000 });
  if (await page.locator('.gticket .hh-logo').count() !== 1) throw new Error('logo missing from ticket');
  await page.getByText('ADMIT ONE').waitFor();
  ok('tearing it open reveals the golden ticket with the logo');
  await btn('BEGIN INITIATION').click();

  // ---------- TRIAL 1: SLOT ----------
  await page.getByText('THE MACHINE').waitFor();
  const pullLever = async () => {
    const l = await box('.lever');
    await page.mouse.move(l.x + l.width / 2, l.y + 10);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(l.x + l.width / 2, l.y + 10 + i * 9);
    await page.mouse.up();
    await page.waitForTimeout(2200);
  };
  await pullLever();
  if (await page.locator('.reel-final svg[aria-label="jackpot"]').count() > 0) throw new Error('jackpot hit on min bet');
  ok('trial 1: min bet loses');
  await pullLever();
  await btn('MAX BET').click();
  await pullLever();
  const fingers = await page.locator('.reel-final svg[aria-label="jackpot"]').count();
  if (fingers !== 3) throw new Error(`expected 3 middle fingers on max bet, got ${fingers}`);
  ok('trial 1: MAX BET lands three middle fingers = jackpot');
  await page.getByText('MAKE ONE PIZZA').waitFor({ timeout: 12000 });
  ok('trial 1: jackpot holds ~3s then advances');

  // ---------- TRIAL 2: PIZZA ----------
  // out-of-order guard
  await page.getByRole('button', { name: 'PEPPERONI' }).click();
  await page.getByText('Sauce first.').waitFor();
  ok('trial 2: refuses pepperoni before sauce');
  const smear = async () => {
    const pz = await box('.pizza-round');
    const cx = pz.x + pz.width / 2, cy = pz.y + pz.height / 2, R = pz.width / 2;
    for (let ring = 0.16; ring <= 0.82; ring += 0.13) {
      const r = R * ring;
      await page.mouse.move(cx + r, cy);
      await page.mouse.down();
      for (let a = 0; a <= 360; a += 16) {
        const rad = (a * Math.PI) / 180;
        await page.mouse.move(cx + Math.cos(rad) * r, cy + Math.sin(rad) * r);
      }
      await page.mouse.up();
    }
  };
  await smear();
  await btn('NEXT').click();
  ok('trial 2: sauce spread accepted');
  await smear();
  await btn('NEXT').click();
  ok('trial 2: cheese accepted');
  const pz = await box('.pizza-round');
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const r = pz.width / 2 * (i % 2 ? 0.28 : 0.6);
    await page.mouse.click(pz.x + pz.width / 2 + Math.cos(a) * r, pz.y + pz.height / 2 + Math.sin(a) * r);
  }
  if (await page.locator('.pz-pep').count() < 14) throw new Error('pepperoni not placed');
  await btn('DONE').click();
  await btn('SEND IT').click();
  ok('trial 2: pepperoni placed, pizza sent');

  // ---------- TRIAL 3: DARTS ----------
  await page.getByText('THE BALLOON WALL').waitFor();
  const wall = await box('.balloon-wall');
  let found = false;
  for (let attempt = 0; attempt < 40 && !found; attempt++) {
    const targets = await page.locator('.balloon:not(.popped)').all();
    if (!targets.length) break;
    const t = await targets[0].boundingBox();
    // flick from the dart toward the balloon
    const sx = wall.x + wall.width / 2, sy = wall.y + wall.height + 30;
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    found = await page.locator('.prize-paper').isVisible().catch(() => false);
  }
  if (!found) throw new Error('never found the balloon with the paper');
  ok('trial 3: flicking darts pops balloons until the paper is found');
  await page.locator('.balloon-wall.receded').waitFor();
  ok('trial 3: balloons recede into the background');
  await page.locator('.prize-paper').click();
  await page.getByText("HOWIE'S BOOK OF RECORDS").waitFor();
  await page.getByText('KORY & JASON').waitFor();
  await page.locator('.rn-title', { hasText: 'DOUGH CHAMPS' }).waitFor();
  ok('trial 3: the note names the dough champs');
  await btn('ALL HAIL THE DOUGH CHAMPS').click();

  // ---------- TRIAL 4: MAZE ----------
  await page.getByText('DELIVERY').first().waitFor();
  const bd = await box('.maze-board');
  // BFS the grid, then drag the car cell by cell along the path
  const grid = await page.evaluate(() => window.__MAZE__);
  const G = grid || [
    'S..#.....','##.#.###.','.....#...','.###.#.##','.#...#...',
    '.#.###.#.','...#...#.','.###.##..','.....#.#.','####.#.#.','.......#H'];
  const R = G.length, C = G[0].length;
  const at = (r, c) => (r < 0 || c < 0 || r >= R || c >= C ? '#' : G[r][c]);
  let S, H;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (G[r][c] === 'S') S = [r, c]; if (G[r][c] === 'H') H = [r, c]; }
  const prev = new Map(); const q = [S]; const seen = new Set([S.join()]);
  while (q.length) {
    const [r, c] = q.shift();
    if (r === H[0] && c === H[1]) break;
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (at(nr, nc) === '#' || seen.has(nr + ',' + nc)) continue;
      seen.add(nr + ',' + nc); prev.set(nr + ',' + nc, [r, c]); q.push([nr, nc]);
    }
  }
  const path = []; let cur = H;
  while (cur && !(cur[0] === S[0] && cur[1] === S[1])) { path.unshift(cur); cur = prev.get(cur.join()); }
  const px = (c) => bd.x + ((c + 0.5) / C) * bd.width;
  const py = (r) => bd.y + ((r + 0.5) / R) * bd.height;
  await page.mouse.move(px(S[1]), py(S[0]));
  await page.mouse.down();
  for (const [r, c] of path) {
    for (let k = 0; k < 4; k++) await page.mouse.move(px(c), py(r));
    await page.waitForTimeout(18);
  }
  await page.mouse.up();
  await page.getByText('You found the house.', { exact: false }).waitFor({ timeout: 10000 });
  ok('trial 4: the car drives the maze to the house');

  // ---------- TRIAL 5: DOOR ----------
  await page.getByText('KNOCK').waitFor({ timeout: 10000 });
  const door = await box('.door');
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(door.x + door.width / 2, door.y + door.height / 2);
    await page.waitForTimeout(160);
  }
  await page.getByText('All Corners', { exact: false }).waitFor({ timeout: 8000 });
  ok('trial 5: three knocks brings someone to the door');
  // wrong answer first
  await btn('9').click();
  await btn('OK').click();
  await page.getByText('That is not it.').waitFor();
  ok('trial 5: wrong ounces rejected');
  await btn('1').click();
  await btn('1').click();
  await btn('OK').click();
  await page.locator('.door.open').waitFor({ timeout: 6000 });
  ok('trial 5: 11 oz opens the door');

  // ---------- FINALE ----------
  await page.getByText('WELCOME TO THE LEAGUE').waitFor({ timeout: 10000 });
  await page.getByText('HUNGRY HOMIES').waitFor();
  if (await page.locator('.confetti .cf').count() < 40) throw new Error('no confetti');
  if (await page.locator('.finale-card .hh-logo').count() !== 1) throw new Error('logo missing from finale');
  await page.getByText('ACCEPT LEAGUE INVITATION').waitFor();
  ok('finale: confetti, logo, welcome and the invite button');

  await page.reload();
  await page.getByText('WELCOME TO THE LEAGUE').waitFor();
  ok('finale survives refresh');

  const p2 = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p2.goto(BASE);
  const fresh = await p2.getByText('You have been chosen.').isVisible().catch(() => false);
  const leaked = await p2.getByText('WELCOME TO THE LEAGUE').isVisible().catch(() => false);
  if (fresh && !leaked) ok('a fresh visitor starts at the envelope, not the finale');
  else fail('gating', `fresh=${fresh} leaked=${leaked}`);
  await p2.close();

  if (errors.length) fail('no page errors', errors.join(' | '));
  else ok('no uncaught page errors');
} catch (e) {
  fail('playthrough', e.message);
  await page.screenshot({ path: 'scripts/failure.png', fullPage: true }).catch(() => {});
}

await browser.close();
console.log(failures === 0 ? '\nPLAYTHROUGH PASSED' : `\n${failures} FAILURE(S)`);
process.exit(failures ? 1 : 0);
