// End-to-end run of the initiation using REAL gestures against the built app.
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
const box = async (sel) => (await page.locator(sel).boundingBox());

const t0 = Date.now();
try {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // ---------- OPENING: drag to tear ----------
  await page.getByText('You are the lucky one.').waitFor();
  const env = await box('.envelope');
  await page.mouse.move(env.x + 14, env.y + env.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 24; i++) {
    await page.mouse.move(env.x + 14 + (env.width * 0.78 * i) / 24, env.y + env.height / 2);
    await page.waitForTimeout(12);
  }
  await page.mouse.up();
  await page.getByText('Official Invitation').waitFor({ timeout: 8000 });
  ok('opening: dragging tears the envelope open');
  await btn('BEGIN INITIATION').click();
  await page.getByText('INITIATION').first().waitFor();
  ok('invitation -> trials');

  // ---------- TRIAL 1: scratch ----------
  const cv = await box('.scratch-canvas');
  for (let row = 0; row < 7; row++) {
    const y = cv.y + 12 + (cv.height - 24) * (row / 6);
    await page.mouse.move(cv.x + 6, y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(cv.x + 6 + ((cv.width - 12) * i) / 12, y);
    }
    await page.mouse.up();
  }
  await page.getByText('THREE MATCHING. YOU WIN.').waitFor({ timeout: 8000 });
  ok('trial 1: scratching the foil reveals the win');
  await btn('CONTINUE').click();

  // ---------- TRIAL 2: press and hold to pop ----------
  await page.getByText("THE COMMISSIONER'S EGO").waitFor();
  const stage = await box('.inflate-stage');
  await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2);
  await page.mouse.down();
  await page.getByText('EGO RUPTURED').waitFor({ timeout: 15000 });
  await page.mouse.up();
  ok('trial 2: holding inflates until it pops');
  await btn('PICK UP THE SLIP').click();

  // ---------- TRIAL 3: mash to chug ----------
  await page.getByText('DRAFT NIGHT').first().waitFor();
  const glass = await box('.chug-stage');
  for (let i = 0; i < 160; i++) {
    await page.mouse.click(glass.x + glass.width / 2, glass.y + glass.height / 2, { delay: 3 });
    if (i % 6 === 0 && await page.getByText('Two down.').isVisible().catch(() => false)) break;
    // the between-beers beat ignores taps; wait it out rather than wasting them
    if (await page.getByText('ANOTHER.').isVisible().catch(() => false)) await page.waitForTimeout(1800);
    await page.waitForTimeout(12);
  }
  await page.getByText('Two down.').waitFor({ timeout: 10000 });
  ok('trial 3: mashing drinks both beers');
  const tilted = await page.locator('.app.drunk-2').count();
  if (tilted !== 1) throw new Error('drunk tilt not applied after chugging');
  ok('trial 3: the app is now visibly crooked');
  await btn('STAND UP SLOWLY').click();

  // ---------- TRIAL 4: flick the wheel, twice ----------
  await page.getByText('LAST PLACE PUNISHMENT').waitFor();
  const flick = async () => {
    const w = await box('.wheel');
    const cx = w.x + w.width / 2, cy = w.y + w.height / 2;
    await page.mouse.move(cx, cy - w.height * 0.34);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) {
      const a = -Math.PI / 2 + (i / 8) * 1.5;
      await page.mouse.move(cx + Math.cos(a) * w.width * 0.34, cy + Math.sin(a) * w.height * 0.34);
    }
    await page.mouse.up();
  };
  await flick();
  await page.getByText('Spin recorded.').waitFor({ timeout: 15000 });
  ok('trial 4: flicking spins the wheel to a result');
  await btn('SPIN AGAIN (NOT OPTIONAL)').click();
  await page.locator('.verdict.locked').waitFor({ timeout: 20000 });
  ok('trial 4: the forced re-spin locks in a punishment');
  await btn('ACCEPT MY FATE').click();

  // ---------- TRIAL 5: draw a signature ----------
  await page.getByText('LEAGUE COVENANT').waitFor();
  if (await btn('EXECUTE AGREEMENT').isVisible().catch(() => false)) throw new Error('could execute without signing');
  ok('trial 5: cannot execute before signing');
  const pad = await box('.sign-pad');
  await page.mouse.move(pad.x + 20, pad.y + pad.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 40; i++) {
    const x = pad.x + 20 + ((pad.width - 40) * i) / 40;
    const y = pad.y + pad.height / 2 + Math.sin(i / 2.2) * 26;
    await page.mouse.move(x, y);
  }
  await page.mouse.up();
  await btn('EXECUTE AGREEMENT').click();
  await page.getByText('SIGNATURE ACCEPTED').waitFor();
  await page.getByText(/Dues are \$50/).waitFor();
  ok('trial 5: terms are only readable after signing');
  await btn('I HAVE MADE A HUGE MISTAKE').click();

  // ---------- TRIAL 6: press and hold to stamp ----------
  await page.getByText('SEAL YOUR ENTRY').waitFor();
  const wax = await box('.wax');
  await page.mouse.move(wax.x + wax.width / 2, wax.y + wax.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(2100);
  await page.mouse.up();
  ok('trial 6: holding stamps the seal');

  // ---------- FINALE ----------
  await page.getByText('Initiation Complete').waitFor({ timeout: 10000 });
  await page.getByText('THE HUNGRY HOMIES').waitFor();
  ok('finale: welcome card');
  await btn('VIEW YOUR RECORD').click();
  await page.getByText('INITIATION RECORD').waitFor();
  await page.getByText('EGO INFLATED TO').waitFor();
  await page.getByText('ACCEPT LEAGUE INVITATION').waitFor();
  ok('finale: record + invite button');

  // real punishment text landed on the record
  const rec = await page.locator('.shift-report').innerText();
  if (!/TRAMP|WAFFLE|MILK|SUSHI|MOM|SHAVE|PORTRAITS|JERSEY/.test(rec)) {
    throw new Error('no punishment recorded on the report');
  }
  ok('finale: the punishment they actually spun is on the record');

  // ---------- persistence + gating ----------
  await page.reload();
  await page.getByText('Initiation Complete').waitFor();
  ok('finale survives refresh');

  const p2 = await (await browser.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p2.goto(BASE);
  const fresh = await p2.getByText('You are the lucky one.').isVisible().catch(() => false);
  const leaked = await p2.getByText('Initiation Complete').isVisible().catch(() => false);
  if (fresh && !leaked) ok('a fresh visitor starts at the envelope, not the finale');
  else fail('gating', `fresh=${fresh} leaked=${leaked}`);
  await p2.close();

  if (errors.length) fail('no page errors', errors.join(' | '));
  else ok('no uncaught page errors');
  console.log(`\n  scripted run took ${((Date.now() - t0) / 1000).toFixed(0)}s of machine time`);
} catch (e) {
  fail('playthrough', e.message);
  await page.screenshot({ path: 'scripts/failure.png', fullPage: true }).catch(() => {});
}

await browser.close();
console.log(failures === 0 ? '\nPLAYTHROUGH PASSED' : `\n${failures} FAILURE(S)`);
process.exit(failures ? 1 : 0);
