// Verifies every puzzle has a consistent, solvable answer.
// Run: npm run verify
import { CASH, TRANSACTIONS, CASH_QUESTION } from '../src/data/cash.js';
import { CLOCKIN, validateClockinPin } from '../src/data/clockin.js';
import { SOLUTION, validatePizza, diagnosePizza, TICKET } from '../src/data/makeline.js';
import { STOREHELP, INBOX } from '../src/data/storehelp.js';
import { JAKE } from '../src/data/jake.js';
import { CLOSING } from '../src/data/closing.js';
import { STORE } from '../src/config.js';

let failures = 0;
function check(name, cond, detail = '') {
  if (cond) console.log(`  ok  ${name}`);
  else { failures++; console.error(`FAIL  ${name} ${detail}`); }
}
const cents = (n) => Math.round(n * 100);

console.log('— STEP 1: CLOCK IN —');
{
  // PIN = posted schedule minutes (15) + store last two digits reversed (71 -> 17)
  const posted = CLOCKIN.schedule.rows.find((r) => r.penFix);
  const minutes = posted.penFix.split(':')[1];
  const last2 = STORE.number.slice(-2);
  const derived = minutes + last2[1] + last2[0];
  check('derived PIN matches data', derived === CLOCKIN.pin, `derived=${derived} data=${CLOCKIN.pin}`);
  check('validator accepts PIN', validateClockinPin(CLOCKIN.pin));
  check('trap PINs rejected', !['0017', '1771', '1717', '0071', '1500'].some(validateClockinPin));
}

console.log('— STEP 3: MAKELINE —');
{
  check('solution validates', validatePizza({ ...SOLUTION, left: [...SOLUTION.left], right: [...SOLUTION.right] }));
  check('swapped halves rejected', !validatePizza({ ...SOLUTION, left: [...SOLUTION.right], right: [...SOLUTION.left] }));
  check('swapped halves diagnosed as geography', diagnosePizza({ ...SOLUTION, left: [...SOLUTION.right], right: [...SOLUTION.left] }) === 'Right toppings. Wrong geography.');
  check('wrong ladle rejected', !validatePizza({ ...SOLUTION, sauceLadle: 6 }));
  check('GPP trap not in solution', ![...SOLUTION.left, ...SOLUTION.right].includes('GPP'));
  check('ticket mentions the NO GPP trap', TICKET.lines.some((l) => l.includes('NO GPP')));
  // LT on LG = one ladle down: LG regular 6oz -> 4oz; XCHZ on LG: 3 cups -> 4
  check('LT sauce on LG is 4oz per portion chart', SOLUTION.sauceLadle === 4);
  check('X cheese on LG is 4 cups per portion chart', SOLUTION.cheeseCups === 4);
}

console.log('— STEP 4: CASH LEDGER —');
{
  const cashTx = TRANSACTIONS.filter((t) => t.tender === 'CASH' && !t.refund && !t.voided);
  const cashSales = cashTx.reduce((a, t) => a + cents(t.amt), 0);
  const refunds = TRANSACTIONS.filter((t) => t.refund).reduce((a, t) => a + cents(-t.amt), 0);
  const cardTx = TRANSACTIONS.filter((t) => t.tender === 'CARD' && !t.voided);
  const cardBatch = cardTx.reduce((a, t) => a + cents(t.amt), 0);
  const voided = TRANSACTIONS.find((t) => t.voided);

  const expected = cents(CASH.startingTill) + cashSales - refunds - cents(CASH.safeDropTotal);
  check('expected drawer = 271.53', expected === cents(CASH.expected), `got ${expected / 100}`);

  // Physical cash: order 1114's 37.84 was recorded but never received
  const physical = expected - cents(37.84);
  check('counted drawer = 233.69', physical === cents(CASH.counted), `got ${physical / 100}`);
  check('variance is exactly -37.84', expected - physical === cents(37.84));
  check('void amount equals variance', cents(voided.amt) === cents(37.84));

  check('POS card batch = 406.21', cardBatch === cents(CASH.posCardBatch), `got ${cardBatch / 100}`);
  const settlement = cardBatch + cents(voided.amt); // voided charge still settled
  check('processor settlement = 444.05', settlement === cents(CASH.processorSettlement), `got ${settlement / 100}`);
  check('settlement variance = +37.84', settlement - cardBatch === cents(37.84));

  // Driver reconciles
  const driverCash = TRANSACTIONS.filter((t) => t.note?.includes('MARCUS')).reduce((a, t) => a + cents(t.amt), 0);
  check('driver cash-out = 86.50', driverCash === cents(86.50), `got ${driverCash / 100}`);

  // Deposit for step 7
  const deposit = cents(CASH.safeDropTotal) + physical - cents(150);
  check('deposit = 183.69', deposit === cents(CASH.depositAmount), `got ${deposit / 100}`);
  check('exactly one correct cash answer', CASH_QUESTION.options.filter((o) => o.correct).length === 1);
  check('all wrong cash answers have rebuttals', CASH_QUESTION.options.filter((o) => !o.correct).every((o) => o.rebuttal));
}

console.log('— STEP 5: STORE HELP —');
{
  // password derivable: wifi key with store number swapped for opening year
  const derived = STOREHELP.clues.routerLabel.key.replace(STORE.number, STORE.opened);
  check('password derivable from clues', derived === STOREHELP.email.password, `derived=${derived}`);
  check('plaque contains opening year', STOREHELP.clues.plaque.includes(STORE.opened));
  const ca = STOREHELP.composeAnswer;
  check('compose answers exist in options',
    STOREHELP.composeOptions.store.includes(ca.store) &&
    STOREHELP.composeOptions.errorCode.includes(ca.errorCode) &&
    STOREHELP.composeOptions.callback.includes(ca.callback));
  check('error code shown on POS screen', STOREHELP.breakage.posError.includes(ca.errorCode));
  check('callback on help sheet', STOREHELP.clues.helpSheet.lines.some((l) => l.includes(ca.callback)));
}

console.log('— STEP 6: JAKE —');
{
  check('exactly one correct termination reason', JAKE.question.options.filter((o) => o.correct).length === 1);
  check('all wrong reasons have rebuttals', JAKE.question.options.filter((o) => !o.correct).every((o) => o.rebuttal));
  const fw = JAKE.file.writeups.rows.find((r) => r.type.includes('FINAL'));
  check('final warning documented and signed', !!fw && fw.signed.includes('Jake R.'));
  check('8/17 punches exonerate complaint', JAKE.file.punches.rows.some((r) => r[0] === '8/17' && r[3] === 'OUT 2:00 PM'));
  check('Dennis email corroborates 8/23 defense', INBOX.find((e) => e.id === 'schedule').body.some((l) => l.includes('NOT to come in Saturday')));
}

console.log('— STEP 7: CLOSING CLUES OBTAINABLE EARLIER —');
{
  const alarmEmail = INBOX.find((e) => e.id === 'alarm');
  check('alarm code in inbox', alarmEmail.body.some((l) => l.includes(CLOSING.alarm.code)));
  check('deposit answer = step 4 deposit', CLOSING.deposit.answer === CASH.depositAmount);
  const sysco = INBOX.find((e) => e.id === 'sysco');
  check('40-ball standard in Sysco email', sysco.body.some((l) => l.includes('40-BALL')));
  check('dough answers match step 2 (40 @ 16.0)', CLOSING.dough.countAnswer === 40 && CLOSING.dough.weightAnswer === 16.0);
  const payroll = INBOX.find((e) => e.id === 'payroll');
  check('manual clock-out foreshadowed in payroll email', payroll.body.some((l) => l.includes('MANUALLY clocked out')));
  check('exactly one correct reconcile option', CLOSING.reconcile.options.filter((o) => o.correct).length === 1);
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
