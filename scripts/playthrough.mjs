// Full end-to-end playthrough against the built app (npm run build first,
// then a preview server on :4173). Solves every puzzle for real, tests
// refresh persistence, and confirms the finale is unreachable early.
import { chromium } from 'playwright';

const BASE = 'http://localhost:4173/';
let failures = 0;
const ok = (name) => console.log(`  ok  ${name}`);
const fail = (name, e) => { failures++; console.error(`FAIL  ${name}: ${e}`); };

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium',
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) playtest',
});
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

const tapText = async (text, exact = false) => {
  await page.getByText(text, { exact }).first().click();
};
const btn = (name, exact = true) => page.getByRole('button', { name, exact });

try {
  await page.goto(BASE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // ---------- ENVELOPE ----------
  await btn('OPEN INVITATION').click();
  await btn('BEGIN SHIFT').click();
  await page.getByText('SHIFT PROGRESS').waitFor();
  ok('envelope -> invitation -> shift');

  // ---------- STEP 1: wrong PIN then right PIN ----------
  for (const d of ['9', '9', '9', '9']) await btn(d).click();
  await btn('CLOCK IN').click();
  await page.getByText('INVALID PIN').waitFor();
  ok('step 1 rejects wrong PIN');
  for (const d of ['1', '5', '1', '7']) await btn(d).click();
  await btn('CLOCK IN').click();
  await page.getByText('CLOCK IN ACCEPTED').waitFor();
  ok('step 1 accepts 1517');
  await page.getByText('Portion the dough.').waitFor({ timeout: 8000 });

  // ---------- STEP 2: three balls, then bail ----------
  const makeBall = async () => {
    const tub = page.locator('.dough-tub');
    const lcd = page.locator('.scale-lcd');
    const read = async () => parseFloat((await lcd.innerText()).replace(/[^\d.]/g, ''));
    // pull dough until at least ~14oz on the scale
    for (let i = 0; i < 30 && (await read()) < 14; i++) {
      const box = await tub.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(180);
      await page.mouse.up();
      await page.waitForTimeout(80);
    }
    // fine-tune with pinches
    for (let i = 0; i < 60; i++) {
      const w = await read();
      if (Math.abs(w - 16.0) <= 0.45) break;
      if (w > 16.0) await btn('PINCH OFF').click();
      else await btn('ADD PINCH').click();
      await page.waitForTimeout(40);
    }
    await btn('TRAY IT').click();
  };
  await makeBall();
  await page.getByText('1 / 40 COMPLETE').first().waitFor();
  ok('step 2 first ball trayed');
  await makeBall();
  await makeBall();
  await page.getByText('37 REMAINING').waitFor({ timeout: 8000 });
  ok('step 2 reveal at 3/40');
  await btn('FUCK THIS, I GET IT.').click();
  await page.getByText('Build the order.').waitFor({ timeout: 10000 });
  ok('step 2 -> step 3 via FUCK THIS');

  // ---------- STEP 3: wrong build first, then correct ----------
  await btn('SM 10"').click();
  await btn('BBQ').click();
  await btn('3 oz ladle').click();
  await page.locator('.ctl-group', { hasText: 'CHEESE' }).getByRole('button', { name: '1', exact: true }).click();
  await btn('Butter').click();
  await btn('Pie (8)').click();
  await btn('SEND TO OVEN').click();
  await page.getByText('ORDER INCORRECT').waitFor();
  ok('step 3 rejects wrong pizza');

  await btn('LG 14"').click();
  await btn('Red Sauce').click();
  await btn('4 oz ladle').click();
  await page.locator('.ctl-group', { hasText: 'CHEESE' }).getByRole('button', { name: '4', exact: true }).click();
  const place = async (topping, half) => {
    await btn(topping).click();
    await btn(half).click();
  };
  await place('Pepperoni', '← LEFT HALF');
  await place('Mushroom', '← LEFT HALF');
  await place('Italian Sausage', 'RIGHT HALF →');
  await place('Black Olive', 'RIGHT HALF →');
  await place('Onion', 'RIGHT HALF →');
  await btn('Cajun').click();
  await btn('Square').click();
  await btn('SEND TO OVEN').click();
  await page.getByText('SAME ORDER × 14').waitFor({ timeout: 10000 });
  ok('step 3 correct pizza -> ×14');
  await page.getByText('The drawer is short.').waitFor({ timeout: 10000 });

  // ---------- refresh persistence mid-shift ----------
  await page.reload();
  await page.getByText('The drawer is short.').waitFor();
  const prog = await page.locator('.hud-progress').innerText();
  if (!prog.includes('4 / 7')) throw new Error('progress lost on refresh: ' + prog);
  ok('refresh keeps progress at step 4');

  // ---------- STEP 4: wrong answer then right ----------
  await btn('I KNOW WHAT HAPPENED').click();
  await tapText('Marcus pocketed cash');
  await page.getByText("DOESN'T RECONCILE").waitFor();
  ok('step 4 rebuts wrong answer');
  await tapText('voided and re-rung as cash');
  await page.getByText('VARIANCE RECLASSIFIED').waitFor();
  await page.getByText('$183.69').waitFor();
  ok('step 4 solved, deposit shown');
  await page.getByText("Something's wrong.").waitFor({ timeout: 10000 });

  // ---------- STEP 5 ----------
  await btn('CALL').click();
  await page.getByText('2 HOURS 47 MINUTES').waitFor();
  await btn('EMAIL INSTEAD').click();
  await page.getByPlaceholder(/nobody wrote it down/).fill('Pizza123!');
  await btn('SIGN IN').click();
  await page.getByText('SIGN-IN FAILED').waitFor();
  ok('step 5 rejects old password');
  await page.getByPlaceholder(/nobody wrote it down/).fill('Crust2009!');
  await btn('SIGN IN').click();
  await page.getByText("You're in.").waitFor();
  ok('step 5 accepts Crust2009!');
  // read the alarm email (players would; also exercises the inbox)
  await tapText('new alarm code');
  await page.getByText('New code: 2461.').waitFor();
  await tapText('‹ Inbox');
  await btn('COMPOSE MESSAGE TO STORE HELP').click();
  await page.locator('select').nth(0).selectOption('4471');
  await page.locator('select').nth(1).selectOption('E-1067');
  await page.locator('select').nth(2).selectOption('(734) 555-0148');
  await btn('SEND').click();
  await page.getByText('TICKET CREATED').first().waitFor();
  ok('step 5 ticket created');
  await page.getByText('JAKE MUST BE TERMINATED TONIGHT.').waitFor({ timeout: 10000 });

  // ---------- STEP 6 ----------
  await btn('OPEN THE FILE').click();
  await btn('SELECT TERMINATION REASON').click();
  await tapText('No-call/no-show on Saturday 8/23');
  await page.getByText("DOCUMENTATION DOESN'T SUPPORT THIS").waitFor();
  ok('step 6 rebuts bad reason');
  await tapText('Unauthorized 100% comps on 8/26');
  await page.getByText('ending your employment').waitFor();
  ok('step 6 correct reason -> termination');
  await page.getByText('Close the store.').waitFor({ timeout: 15000 });

  // ---------- STEP 7 ----------
  const clockOutBtn = page.getByRole('button', { name: 'Clock out', exact: false });
  if (await clockOutBtn.isEnabled()) throw new Error('Clock out enabled before tasks done');
  ok('step 7 clock out gated');

  await tapText('Reconcile drawer');
  await tapText('In the card batch');
  await tapText('Verify deposit');
  await page.getByPlaceholder('0.00').fill('183.69');
  await btn('SEAL THE BAG').click();
  await tapText('Record waste');
  // one failed makeline attempt earlier -> waste = 1
  await page.getByPlaceholder('0', true).fill('1');
  await btn('LOG IT').click();
  await tapText('Confirm labor');
  await btn('APPROVE LABOR').click();
  await tapText('Secure makeline');
  for (const b of ['SAUCE', 'CHEESE', 'PEP', 'SAUSAGE', 'VEG', 'THE MYSTERY BIN']) {
    await btn(b).click();
  }
  await btn('WALK-IN, WRAPPED, DATED').click();
  await tapText('Verify dough count');
  await page.getByPlaceholder('balls / tray').fill('40');
  await page.getByPlaceholder('oz each').fill('16.0');
  await btn('CONFIRM').click();
  await tapText('Set alarm');
  for (const d of ['2', '4', '6', '1']) await btn(d).click();
  await btn('ARM — AWAY').click();
  await tapText('Lock doors');
  await tapText('FRONT DOOR — lock it');
  await tapText('PROPPED OPEN');
  await tapText('BACK DOOR — lock it');
  await btn('DOORS SECURED').click();
  ok('step 7 all eight tasks complete');

  await clockOutBtn.click();
  await page.getByText('MANAGER CANNOT CLOCK OUT WITH ACTIVE EMPLOYEE.').waitFor();
  ok('step 7 clock-out blocked by Jake');
  await btn('OPEN LABOR SCREEN').click();
  await btn('END SHIFT — J. RENNER').click();
  for (const d of ['1', '5', '1', '7']) await btn(d).click();
  await btn('OVERRIDE').click();
  await page.getByText('SHIFT ENDED 12:06 AM').waitFor();
  ok('step 7 Jake clocked out with manager PIN');
  await clockOutBtn.click();
  await page.getByText('CLOCK OUT ACCEPTED').waitFor();
  ok('step 7 clock out accepted');

  // ---------- FINALE ----------
  await page.getByText('SHIFT COMPLETE', { exact: false }).first().waitFor({ timeout: 10000 });
  await page.getByText('THE HUNGRY HOMIES').waitFor();
  ok('finale: welcome card');
  await btn('VIEW SHIFT PERFORMANCE').click();
  await page.getByText('PIZZAS FUCKED UP').waitFor();
  await page.getByText('ACCEPT LEAGUE INVITATION').waitFor();
  ok('finale: shift report + invite button');

  // finale survives refresh
  await page.reload();
  await page.getByText('SHIFT COMPLETE', { exact: false }).first().waitFor();
  ok('finale persists across refresh');

  // ---------- fresh visitor cannot reach finale ----------
  const page2 = await ctx.browser().newContext({ viewport: { width: 390, height: 844 } }).then((c) => c.newPage());
  await page2.goto(BASE);
  const sawEnvelope = await page2.getByText('YOU HAVE BEEN CHOSEN', { exact: false }).first().isVisible().catch(() => false);
  const sawFinale = await page2.getByText('SHIFT COMPLETE').first().isVisible().catch(() => false);
  if (sawEnvelope && !sawFinale) ok('fresh session starts at the envelope, not the finale');
  else fail('fresh session gating', `envelope=${sawEnvelope} finale=${sawFinale}`);
  await page2.close();

  if (errors.length) fail('no page errors', errors.join(' | '));
  else ok('no uncaught page errors during full playthrough');
} catch (e) {
  fail('playthrough', e.message);
  await page.screenshot({ path: 'scripts/failure.png', fullPage: true }).catch(() => {});
  console.error(await page.content().then((c) => c.slice(0, 800)).catch(() => ''));
}

await browser.close();
console.log(failures === 0 ? '\nPLAYTHROUGH PASSED' : `\n${failures} FAILURE(S)`);
process.exit(failures ? 1 : 0);
