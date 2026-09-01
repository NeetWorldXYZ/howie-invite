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

  // count scheduled audio sources so we can prove sound actually fires
  await page.addInitScript(() => {
    window.__started = 0;
    const orig = AudioScheduledSourceNode.prototype.start;
    AudioScheduledSourceNode.prototype.start = function (...a) { window.__started++; return orig.apply(this, a); };
  });
  await page.reload();

  // ---------- THE REVEAL ----------
  await page.getByText('You have been chosen.').waitFor();
  await page.getByText('ONE OF TEN').waitFor();
  ok('opening says one of ten');
  if (await page.locator('.env-front .env-address').count() !== 1) throw new Error('envelope is not addressed');
  if (await page.locator('.env-stamp .hh-logo').count() !== 1) throw new Error('no Howie stamp on the envelope');
  if (await page.locator('.env-postmark').count() !== 1) throw new Error('no postmark');
  ok('envelope is addressed, stamped and postmarked');

  // the card starts tucked inside, its face hidden
  if (await page.locator('.gt-inner.shown').count() !== 0) throw new Error('card face visible before opening');
  ok('card face is hidden while it is still in the envelope');

  // pull the wax seal to break it
  const seal = await box('.wax-seal');
  await page.mouse.move(seal.x + seal.width / 2, seal.y + seal.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 12; i++) {
    await page.mouse.move(seal.x + seal.width / 2, seal.y + seal.height / 2 + i * 8);
    await page.waitForTimeout(14);
  }
  await page.mouse.up();
  // the shards fade as they fall, so assert on attachment rather than visibility
  await page.locator('.wax-seal.broken').waitFor({ state: 'attached', timeout: 4000 });
  ok('pulling the wax seal breaks it');

  // sound must come on by itself — no tap-to-enable, no mute toggle
  await page.waitForTimeout(400);
  const audio = await page.evaluate(() => {
    const el = document.querySelector('audio');
    return {
      started: window.__started || 0,
      media: !!el && !el.paused && document.body.contains(el),
    };
  });
  if (!audio.started) throw new Error('no audio sources were scheduled on the first gesture');
  ok(`sound unlocks on the first gesture (${audio.started} sources scheduled)`);
  if (!audio.media) throw new Error('silent media element not playing — iOS ringer switch would mute everything');
  ok('silent media element is playing, so iOS does not gate audio on the ringer switch');

  // choreography: flap opens, card rises, card comes forward
  await page.locator('.reveal-scene.stage-open').waitFor({ timeout: 4000 });
  ok('flap opens');
  await page.locator('.reveal-scene.stage-rise').waitFor({ timeout: 5000 });
  ok('card slides up out of the envelope');
  await page.locator('.reveal-scene.stage-hero').waitFor({ timeout: 6000 });
  await page.waitForTimeout(1500);
  ok('card comes forward and the envelope falls away');

  // it is the SAME card element the whole way, never a screen swap
  if (await page.locator('.gticket').count() !== 1) throw new Error('more than one card element');
  ok('one card element from envelope to hand');

  await page.getByText('ADMIT ONE').waitFor();
  await page.getByText('No. 007 / 010').waitFor();
  ok('card reads No. 007 / 010 for a ten-team league');
  if (await page.locator('.gticket .hh-logo').count() !== 1) throw new Error('logo missing from card');
  ok('card carries the logo');

  // reopening later must not replay the whole reveal
  await page.reload();
  await page.locator('.reveal-scene.stage-hero').waitFor({ timeout: 6000 });
  if (await page.locator('.wax-seal').count() !== 0) throw new Error('reveal replayed after refresh');
  ok('refreshing after the reveal does not replay it');

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
  if (await page.locator('.reel-final .mf-img').count() > 0) throw new Error('jackpot hit on min bet');
  ok('trial 1: min bet loses');
  await pullLever();
  await btn('MAX BET').click();
  await pullLever();
  const fingers = await page.locator('.reel-final .mf-img').count();
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
  await page.getByText('BALLOON POP').first().waitFor();
  const wall = await box('.balloon-wall');
  let found = false;
  let dartPath = [];
  for (let attempt = 0; attempt < 40 && !found; attempt++) {
    const targets = await page.locator('.balloon:not(.popped)').all();
    if (!targets.length) break;
    const t = await targets[0].boundingBox();
    const ready = await box('.dart-ready');
    await page.mouse.move(ready.x + ready.width / 2, ready.y + ready.height / 2);
    await page.mouse.down();
    await page.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 6 });
    await page.mouse.up();
    if (attempt === 0) {
      // sample the very first throw to prove it animates rather than jumps
      for (let i = 0; i < 9; i++) {
        const pos = await page.evaluate(() => {
          const d = document.querySelector('.dart-flying');
          if (!d) return null;
          const r = d.getBoundingClientRect();
          return Math.round(r.left) + ',' + Math.round(r.top);
        });
        if (pos) dartPath.push(pos);
        await page.waitForTimeout(38);
      }
      dartPath = [...new Set(dartPath)];
    }
    await page.waitForTimeout(500);
    found = await page.locator('.prize-paper').isVisible().catch(() => false);
  }
  if (!found) throw new Error('never found the balloon with the paper');
  ok('trial 3: flicking darts pops balloons until the paper is found');
  if (dartPath.length < 4) throw new Error(`dart teleported — only ${dartPath.length} positions sampled`);
  ok(`trial 3: the dart flies (sampled ${dartPath.length} positions in flight)`);
  await page.locator('.balloon-wall.receded').waitFor();
  ok('trial 3: balloons recede into the background');
  await page.locator('.prize-paper').click();
  await page.getByText("HOWIE'S BOOK OF RECORDS").waitFor();
  await page.getByText('KORY & JASON').waitFor();
  await page.locator('.rn-title', { hasText: 'DOUGH CHAMPS' }).waitFor();
  ok('trial 3: the note names the dough champs');
  await btn('ALL HAIL THE DOUGH CHAMPS').click();

  // ---------- TRIAL 4: DELIVERY ----------
  await page.locator('.run-hud').waitFor();
  await page.getByText('ORDER #4471').waitFor();
  ok('trial 4: delivery order slip is present');

  // the whole trial has to fit — the old board ran off the bottom and
  // could not be scrolled to, because steering needs touch-action:none
  const mazeOverflow = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight);
  if (mazeOverflow > 4) throw new Error(`delivery trial overflows the screen by ${mazeOverflow}px`);
  ok('trial 4: fits on screen with nothing below the fold');

  // BFS the maze, convert the route to a list of turns, swipe them
  const G = ['###########','#S#.....#.#','#.###.#.#.#','#...#.#...#','###.#.###.#',
             '#...#.#...#','#.###.#.###','#.....#...#','#########.#','#...#...#.#',
             '#.#.#.#.#.#','#.#...#.#.#','#.#####.#.#','#.#...#...#','#.#.#.#####',
             '#...#....H#','###########'];
  const R = G.length, C = G[0].length;
  const open = (r, c) => !(r < 0 || c < 0 || r >= R || c >= C || G[r][c] === '#');
  let S, H;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { if (G[r][c] === 'S') S = [r, c]; if (G[r][c] === 'H') H = [r, c]; }
  const prev = new Map(); const q = [S]; const seen = new Set([S.join()]);
  while (q.length) {
    const [r, c] = q.shift();
    if (r === H[0] && c === H[1]) break;
    for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nr = r + dr, nc = c + dc;
      if (!open(nr, nc) || seen.has(nr + ',' + nc)) continue;
      seen.add(nr + ',' + nc); prev.set(nr + ',' + nc, [r, c]); q.push([nr, nc]);
    }
  }
  const path = []; let cur = H;
  while (cur && !(cur[0] === S[0] && cur[1] === S[1])) { path.unshift(cur); cur = prev.get(cur.join()); }
  path.unshift(S);
  const dv = await box('.drive-view');
  const cxp = dv.x + dv.width / 2, cyp = dv.y + dv.height / 2;
  const swipe = async (dx, dy) => {
    await page.mouse.move(cxp, cyp);
    await page.mouse.down();
    await page.mouse.move(cxp + dx * 60, cyp + dy * 60, { steps: 4 });
    await page.mouse.up();
  };
  const carCell = () => page.evaluate(({ C, R }) => {
    const el = document.querySelector('.mz-car');
    if (!el) return null;
    return [Math.floor((parseFloat(el.style.top) / 100) * R), Math.floor((parseFloat(el.style.left) / 100) * C)];
  }, { C, R });

  // Steer by reading where the car actually is and swiping the next
  // direction on the route. The car buffers turns and stops at walls, so
  // repeating the correct direction always converges.
  const idxOf = (r, c) => path.findIndex((p) => p[0] === r && p[1] === c);
  for (let i = 0; i < 260; i++) {
    if (await page.getByText('You found the house.', { exact: false }).isVisible().catch(() => false)) break;
    const cellNow = await carCell();
    if (!cellNow) break;
    const at = idxOf(cellNow[0], cellNow[1]);
    if (at < 0 || at + 1 >= path.length) { await page.waitForTimeout(60); continue; }
    const nxt = path[at + 1];
    await swipe(Math.sign(nxt[1] - cellNow[1]), Math.sign(nxt[0] - cellNow[0]));
    await page.waitForTimeout(60);
  }
  await page.getByText('You found the house.', { exact: false }).waitFor({ timeout: 30000 });
  ok('trial 4: swiping steers the car all the way to the house');

  const trailPts = await page.locator('.mz-trail polyline').first().getAttribute('points');
  const pts = (trailPts || '').trim().split(/\s+/).map((p) => p.split(',').map(Number));
  if (pts.length < 20) throw new Error('route was not traced behind the car');
  ok(`trial 4: the route is traced behind the car (${pts.length} points)`);

  // every trail segment must be axis-aligned; a diagonal means the car
  // cut a corner through a building, which is what tunnelling looked like
  let diagonals = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = Math.abs(pts[i][0] - pts[i - 1][0]);
    const dy = Math.abs(pts[i][1] - pts[i - 1][1]);
    if (dx > 0.02 && dy > 0.02) diagonals++;
  }
  if (diagonals > 0) throw new Error(`${diagonals} diagonal trail segments — the car cut through buildings`);
  ok('trial 4: the route never cuts through a building');

  // ---------- TRIAL 5: DOOR ----------
  await page.getByText('KNOCK', { exact: true }).waitFor({ timeout: 10000 });
  const door = await box('.door');
  for (let i = 0; i < 3; i++) {
    await page.mouse.click(door.x + door.width / 2, door.y + door.height / 2);
    await page.waitForTimeout(160);
  }
  await page.getByText('All Corners', { exact: false }).waitFor({ timeout: 8000 });
  ok('trial 5: three knocks brings someone to the door');
  // the whole exchange must sit on the door, with nothing below the fold
  const overlayOnDoor = await page.locator('.door .door-panel').count() > 0
    && await page.locator('.door-frame .door-overlay.ask').count() === 1;
  if (!overlayOnDoor) throw new Error('question is not rendered on the door');
  const scrollable = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight);
  if (scrollable > 4) throw new Error(`door trial requires scrolling (${scrollable}px overflow)`);
  ok('trial 5: question + keypad sit on the door, no scrolling needed');
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

  // The finale must not be a dead end — you have to be able to play again.
  await page.getByRole('button', { name: 'RUN IT AGAIN', exact: true }).click();
  await page.getByText('You have been chosen.').waitFor({ timeout: 8000 });
  await page.locator('.wax-seal').waitFor({ timeout: 4000 });
  ok('RUN IT AGAIN on the finale restarts from the sealed envelope');
  await page.reload();
  await page.getByText('You have been chosen.').waitFor({ timeout: 8000 });
  ok('the restart persists through a refresh (save really was cleared)');

  // and the same is reachable from the HUD menu at any point
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: /Start over/ }).waitFor();
  ok('HUD reset is reachable outside the trials too');
  await page.keyboard.press('Escape').catch(() => {});

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
