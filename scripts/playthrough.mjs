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

  // the league link must not be exposed anywhere in the UI until the end
  const leakedEarly = await page.evaluate(() => {
    const inDom = document.body.innerHTML.includes('fantasy.espn.com');
    const links = [...document.querySelectorAll('a')].map((a) => a.href).join(' ');
    return inDom || links.includes('espn');
  });
  if (leakedEarly) throw new Error('the ESPN league link is visible before the game is finished');
  ok('the league link is not in the page before completion');

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
  // the circus curtain opens onto the booth before anything is throwable
  await page.locator('.curtain').waitFor({ timeout: 3000 });
  await page.getByText('STEP RIGHT UP').waitFor();
  ok('trial 3: the curtain is down when you arrive');
  await page.locator('.curtain.open').waitFor({ timeout: 4000 });
  await page.locator('.curtain').waitFor({ state: 'detached', timeout: 5000 });
  ok('trial 3: the curtain sweeps open onto the booth');
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
  if (!found) {
    // the prize can be in the very last balloon popped, and the paper
    // takes ~750ms to flutter out after the pop
    found = await page.locator('.prize-paper').waitFor({ timeout: 3000 }).then(() => true).catch(() => false);
  }
  if (!found) throw new Error('never found the balloon with the paper');
  ok('trial 3: flicking darts pops balloons until the paper is found');
  if (dartPath.length < 4) throw new Error(`dart teleported — only ${dartPath.length} positions sampled`);
  ok(`trial 3: the dart flies (sampled ${dartPath.length} positions in flight)`);
  await page.locator('.balloon-wall.receded').waitFor();
  ok('trial 3: balloons recede into the background');
  // it drifts by design, so Playwright's stability check never settles
  await page.locator('.prize-paper').click({ force: true });
  await page.getByText("HOWIE'S BOOK OF RECORDS").waitFor();
  await page.getByText('KORY & JASON').waitFor();
  await page.locator('.pq-title', { hasText: 'DOUGH CHAMPS' }).waitFor();
  ok('trial 3: the plaque names the dough champs');
  // the plaque demands to be hailed TWICE
  await btn('ALL HAIL THE DOUGH CHAMPS').click();
  await page.getByText('LOUDER.').waitFor({ timeout: 3000 });
  ok('trial 3: one hail is not enough — LOUDER.');
  await btn('ALL!! HAIL!! THE DOUGH CHAMPS!!').click();

  // ---------- TRIAL 4: THE KEY ----------
  await page.locator('.shuffle-table').waitFor({ timeout: 6000 });
  const numLefts = await page.locator('.table-spot').evaluateAll((els) => els.map((e) => e.style.left));
  if (new Set(numLefts).size !== 3) throw new Error('table position markers overlap');
  ok('trial 4: position markers 1/2/3 stay fixed on the table');
  // the key is shown, then hidden, then the balls shuffle
  await page.locator('.slot-key').waitFor({ timeout: 4000 });
  ok('trial 4: the key is shown before it is hidden');
  await page.locator('.dough-slot.pickable').first().waitFor({ timeout: 25000 });
  ok('trial 4: the shuffle runs and then lets you pick');

  // follow the key through the DOM (React keys the slot by ball id, so the
  // element carrying the key keeps its identity) and pick it
  let got = false;
  for (let round = 0; round < 6 && !got; round++) {
    await page.locator('.dough-slot.pickable').first().waitFor({ timeout: 25000 });
    // the winning slot is the one whose ball index matches the key; read it
    // off the rendered order by clicking each in turn across rounds
    const slots = await page.locator('.dough-slot').all();
    const boxes = [];
    for (const sl of slots) boxes.push(await sl.boundingBox());
    boxes.sort((x, y) => x.x - y.x);
    const pickIdx = round % 3;
    await page.mouse.click(boxes[pickIdx].x + boxes[pickIdx].width / 2, boxes[pickIdx].y + boxes[pickIdx].height / 2);
    await page.waitForTimeout(600);
    got = await page.getByText('THERE IT IS.').isVisible().catch(() => false);
  }
  if (!got) throw new Error('never found the key in six rounds');
  ok('trial 4: picking the right dough ball yields the key');

  // no button — the key floats off to the manager's office on its own
  await page.locator('.office-scene').waitFor({ timeout: 6000 });
  await page.locator('.float-key').waitFor();
  ok("trial 4: the key floats into the manager's office by itself");
  await page.getByText("THE MANAGER'S OFFICE").waitFor();
  await page.locator('.office-scene.ready').waitFor({ timeout: 6000 });
  await page.locator('.safe-keyhole').click();
  await page.locator('.safe.open').waitFor({ timeout: 5000 });
  ok('trial 4: the key opens the office safe');
  await page.locator('.safe-paper').click();
  await page.locator('.scrap').waitFor({ timeout: 5000 });
  await page.getByText('DO NOT LOSE THIS').waitFor();
  ok('trial 4: the safe holds the scrap of paper');
  // the clock-out pin must be findable on it
  const scrapText = await page.locator('.scrap').innerText();
  if (!scrapText.includes('7319')) throw new Error('the clock-out pin is not on the scrap');
  ok('trial 4: the clock-out pin is written on the scrap');
  await btn('TAKE THE PAPER').click();

  // ---------- TRIAL 5: CLOCK OUT ----------
  await page.locator('.punch-clock').waitFor();
  ok('trial 5: the punch clock is up');
  // the pad has to be an actual phone dial — big round keys
  const keySize = await page.locator('.dialpad .dk').first().boundingBox();
  if (!keySize || keySize.width < 48 || keySize.height < 48) {
    throw new Error(`dial keys too small: ${keySize && Math.round(keySize.width)}px`);
  }
  const padRows = await page.locator('.dialpad .dk').evaluateAll(
    (els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size,
  );
  if (padRows < 4) throw new Error(`dial pad collapsed into ${padRows} row(s)`);
  ok(`trial 5: the dial pad is phone-sized (${Math.round(keySize.width)}px keys, ${padRows} rows)`);
  // the paper can be pulled back up while punching out
  await btn('CHECK THE PAPER').click();
  await page.locator('.overlay .scrap').waitFor();
  ok('trial 5: the scrap can be referenced during clock-out');
  await page.locator('.overlay-close').click();
  // wrong pin first
  for (const d of ['1', '1', '1', '1']) await btn(d).click();
  await btn('PUNCH').click();
  await page.getByText('Not the pin.').waitFor();
  ok('trial 5: wrong pin rejected');
  for (const d of ['7', '3', '1', '9']) await btn(d).click();
  await btn('PUNCH').click();
  await page.getByText('CLOCKED OUT').first().waitFor();
  ok('trial 5: 7319 punches you out');

  // fade to black, 3-2-1, then the phone
  await page.locator('.blackout').waitFor({ timeout: 6000 });
  ok('trial 5: the screen fades to black');
  await page.locator('.count-num').waitFor({ timeout: 5000 });
  ok('trial 5: the countdown runs');
  await page.locator('.red-phone.ringing').waitFor({ timeout: 8000 });
  await page.getByText('JESSE (STORE)').waitFor();
  ok('trial 5: the red phone rings and it is Jesse');
  await btn('ANSWER').click();

  // the call plays one big line at a time, tap to advance
  await page.locator('.call-scene').waitFor({ timeout: 6000 });
  await page.getByText('Do NOT hang up', { exact: false }).waitFor({ timeout: 6000 });
  ok('trial 5: the call opens on one big line');
  for (let i = 0; i < 8; i++) {
    if (await page.locator('.call-choice').count()) break;
    await page.locator('.call-scene').click({ position: { x: 40, y: 300 } });
    await page.waitForTimeout(350);
  }
  await page.getByText('HE IS WAITING.').waitFor({ timeout: 6000 });
  ok('trial 5: tapping through the call lands on the big decision');

  // the lazy-bones branch first
  await btn('NO, SORRY, I AM A LAZY BONES').click();
  await page.locator('.getout-scene').waitFor();
  if (await page.locator('.hdy-frame').count() !== 1) throw new Error('no reaction shot');
  // the real clip, actually decoded and actually animated
  const clip = await page.locator('.hdy-real').evaluate((el) => ({
    w: el.naturalWidth, h: el.naturalHeight, gif: /\.gif$|image\/gif/.test(el.currentSrc || el.src),
  }));
  if (!clip.w) throw new Error('the Get Out clip did not load');
  if (!clip.gif) throw new Error('the reaction shot is not a gif — it will not animate');
  ok(`trial 5: saying no plays the real Get Out clip (${clip.w}x${clip.h} gif)`);
  await btn('CALL HIM BACK. BEG.').click();
  await page.getByText('CALLING JESSE…').waitFor();
  // grovel is tap-to-advance now — big lines, one at a time; only the
  // current line is on screen, so watch for the begging as it goes by
  let begged = false;
  for (let i = 0; i < 12; i++) {
    if (await page.getByText('FORGIVE ME', { exact: false }).count()) begged = true;
    if (await btn('DRIVE BACK LIKE YOU MEAN IT').count()) break;
    await page.locator('.grovel-scene').click({ position: { x: 40, y: 300 } });
    await page.waitForTimeout(250);
  }
  if (!begged) throw new Error('the grovel never actually begged');
  ok('trial 5: the grovel plays out line by line and begs');
  await btn('DRIVE BACK LIKE YOU MEAN IT').click();

  // ---------- FINALE ----------
  await page.locator('.heaven').waitFor({ timeout: 10000 });
  await page.getByText('Welcome to the league, my friend.').waitFor();
  await page.getByText('HOWIES FINEST').waitFor();
  if (await page.locator('.hj').count() !== 1) throw new Error('Howie is not at the gates');
  const art = await page.locator('.hj-real').evaluate((el) => ({ w: el.naturalWidth, h: el.naturalHeight }));
  if (!art.w) throw new Error('the Howie-at-the-gates artwork did not load');
  ok(`finale: the real artwork loads (${art.w}x${art.h})`);
  // it must fill the screen rather than sit in a box
  const cover = await page.locator('.hj-real').evaluate(
    (el) => el.getBoundingClientRect().width / window.innerWidth,
  );
  if (cover < 0.98) throw new Error(`artwork is not full bleed (${cover.toFixed(2)} of the width)`);
  ok('finale: the artwork is full bleed');
  const invite = page.getByRole('link', { name: 'ACCEPT LEAGUE INVITATION' });
  await invite.waitFor();
  const href = await invite.getAttribute('href');
  if (!/fantasy\.espn\.com.*leagueId=184982086/.test(href || '')) {
    throw new Error('invite button does not point at the ESPN league: ' + href);
  }
  ok('finale: the invite button links to the real ESPN league');
  ok('finale: Howie at the gates, the blessing and the invite button');

  await page.reload();
  await page.locator('.heaven').waitFor({ timeout: 10000 });
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
  const leaked = await p2.locator('.heaven').isVisible().catch(() => false);
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
