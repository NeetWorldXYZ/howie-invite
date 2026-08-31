// Screenshot key scenes for visual QA (uses localStorage dev flag to jump).
import { chromium } from 'playwright';

const BASE = 'http://localhost:4173/';
const OUT = process.env.SHOT_DIR || 'scripts/shots';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

await page.goto(BASE);
await page.evaluate(() => { localStorage.clear(); localStorage.setItem('hh_dev', '1'); });
await page.reload();
await page.waitForTimeout(2600);
await page.screenshot({ path: `${OUT}/01-envelope.png` });

await page.getByRole('button', { name: 'OPEN INVITATION' }).click();
await page.waitForTimeout(2600);
await page.screenshot({ path: `${OUT}/02-invitation.png` });

const jump = async (step, name, wait = 1200) => {
  await page.getByRole('button', { name: 'DEV', exact: true }).click();
  await page.getByRole('button', { name: `step ${step}`, exact: true }).click();
  await page.getByRole('button', { name: 'close', exact: true }).click();
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
};

await page.getByRole('button', { name: 'BEGIN SHIFT' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/03-clockin.png`, fullPage: true });

await jump(2, '04-dough');
await jump(3, '05-makeline-print', 3600);
await page.screenshot({ path: `${OUT}/05b-makeline-build.png`, fullPage: true });
await jump(4, '06-cash');
await jump(5, '07-help');
await jump(6, '08-jake');
await page.getByRole('button', { name: 'OPEN THE FILE' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/08b-jake-file.png`, fullPage: true });
await jump(7, '09-close');

await page.getByRole('button', { name: 'DEV', exact: true }).click();
await page.getByRole('button', { name: 'finale', exact: true }).click();
await page.getByRole('button', { name: 'close', exact: true }).click();
await page.waitForTimeout(2200);
await page.screenshot({ path: `${OUT}/10-finale.png` });
await page.getByRole('button', { name: 'VIEW SHIFT PERFORMANCE' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/11-report.png`, fullPage: true });

await browser.close();
console.log('screens done');
