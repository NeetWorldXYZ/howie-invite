import { chromium } from 'playwright';
const BASE = 'http://localhost:4173/';
const OUT = process.env.SHOT_DIR || 'scripts/shots';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await b.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(BASE);
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('hh_dev', '1'); });
await page.reload();
await page.waitForTimeout(2800);
await page.screenshot({ path: `${OUT}/01-envelope.png` });

// open it to see the golden ticket
const env = await page.locator('.envelope').boundingBox();
await page.mouse.move(env.x + 14, env.y + env.height / 2);
await page.mouse.down();
for (let i = 1; i <= 24; i++) await page.mouse.move(env.x + 14 + (env.width * 0.78 * i) / 24, env.y + env.height / 2);
await page.mouse.up();
await page.waitForTimeout(2400);
await page.screenshot({ path: `${OUT}/02-ticket.png`, fullPage: true });

const jump = async (n, name, wait = 900) => {
  await page.getByRole('button', { name: 'DEV', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(`^${n} `) }).click();
  await page.getByRole('button', { name: 'close', exact: true }).click();
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
};
await jump(1, '03-slot');
await jump(2, '04-pizza');
await jump(3, '05-darts');
await jump(4, '06-maze');
await jump(5, '07-door');
await page.getByRole('button', { name: 'DEV', exact: true }).click();
await page.getByRole('button', { name: 'finale', exact: true }).click();
await page.getByRole('button', { name: 'close', exact: true }).click();
await page.waitForTimeout(1600);
await page.screenshot({ path: `${OUT}/08-finale.png` });
await b.close();
console.log('shots done');
