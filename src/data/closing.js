// ============================================================
// STEP 7 — CLOSE THE STORE
// ------------------------------------------------------------
// Each checklist task keys off information from earlier steps:
//   reconcile -> Step 4 (variance lives in the card batch)
//   deposit   -> Step 4 ($183.69: drop 100 + drawer 233.69 − till 150)
//   waste     -> Step 3 (the player's own remake count)
//   labor     -> Step 6 (Jake still clocked in → CLOCK OUT error)
//   dough     -> Step 2 (40-ball tray standard; also Sysco email)
//   alarm     -> Step 5 (code 2461 from Dennis's email)
//   doors     -> Step 6 (back door propped with a milk crate)
// ============================================================

import { CASH } from './cash.js';

export const CLOSING = {
  time: '12:03 AM',
  clockOutTime: '12:07 AM',

  tasks: [
    { id: 'reconcile', label: 'Reconcile drawer' },
    { id: 'deposit', label: 'Verify deposit' },
    { id: 'waste', label: 'Record waste' },
    { id: 'labor', label: 'Confirm labor' },
    { id: 'makeline', label: 'Secure makeline' },
    { id: 'dough', label: 'Verify dough count' },
    { id: 'alarm', label: 'Set alarm' },
    { id: 'doors', label: 'Lock doors' },
  ],

  reconcile: {
    prompt: 'CLOSING VARIANCE: −$37.84. To reconcile, mark where the money actually is.',
    options: [
      { id: 'stolen', text: 'Missing / suspected theft — file loss report', correct: false, fail: 'The POS rejects the loss report: "variance matches open card batch exception." It knows. It always knew.' },
      { id: 'batch', text: 'In the card batch — order 1113 settled by card, voided and re-rung as cash', correct: true },
      { id: 'safe', text: 'In the safe — drop was over-counted', correct: false, fail: 'Safe recount: $100.00. Still $100.00. The safe is the only honest thing in this building.' },
      { id: 'rounding', text: 'Rounding drift, write it off', correct: false, fail: '"Rounding drift" of exactly $37.84 would be a mathematical event worth publishing. Rejected.' },
    ],
  },

  deposit: {
    prompt: 'ENTER TONIGHT\'S DEPOSIT TOTAL (drops + drawer cash − $150 till keep)',
    answer: CASH.depositAmount, // 183.69
    tolerance: 0.001,
    failText: 'DEPOSIT MISMATCH — recount. The count sheet and drawer report are in the binder.',
  },

  waste: {
    // correct value is dynamic: the player's failed makeline attempts
    promptTemplate:
      'WASTE LOG — enter the number of remade pizzas from tonight\'s shift. (The POS counted. This is a test of honesty, not memory.)',
    failLow: 'WASTE UNDER-REPORTED. The POS logged your remakes. It logs everything.',
    failHigh: 'That is more pizzas than you ruined. Do not punish yourself. Enter the real number.',
    zeroNote: 'Zero remakes on record. Noted. Suspicious, but noted.',
  },

  labor: {
    rows: [
      ['D. FOLTZ (GM)', 'IN 10:52 AM', 'OUT 11:41 PM', '12.8 HRS'],
      ['MARIA S.', 'IN 10:58 AM', 'OUT 8:04 PM', '9.1 HRS'],
      ['MARCUS D. (DRV)', 'IN 4:58 PM', 'OUT 11:31 PM', '6.6 HRS'],
      ['J. RENNER', 'IN 4:11 PM', '— ACTIVE —', '8.1 HRS'],
      ['NEW HIRE (YOU)', 'IN 4:17 PM', '— ACTIVE —', '8.0 HRS'],
    ],
    approveNote: 'Labor approved. Open punches will be validated at clock-out.',
  },

  dough: {
    prompt: 'PREP VERIFICATION — walk-in tray standard: how many doughballs per prep tray, at what ball weight?',
    // 40 balls (Step 2 prep sheet + Sysco "40-BALL PREP STANDARD"), 16.0 oz target
    countAnswer: 40,
    weightAnswer: 16.0,
    failText: 'DOES NOT MATCH PREP STANDARD. It\'s on the prep sheet. It\'s also on the Sysco confirmation. It\'s everywhere.',
  },

  alarm: {
    prompt: 'ENTER ALARM CODE — ARM TO AWAY',
    code: '2461',
    failText: 'INVALID CODE. Three failed attempts dispatches a guy named Ron. Nobody wants Ron.',
    successText: 'ARMED — AWAY. 60 SECONDS. EXIT THROUGH THE FRONT.',
  },

  doors: {
    backPropped: true,
    proppedText: 'BACK DOOR: PROPPED OPEN (MILK CRATE)',
    crateText: 'You move the milk crate. You briefly wonder how long it has been there, and for whom.',
  },

  clockOutError: 'ERROR\nMANAGER CANNOT CLOCK OUT WITH ACTIVE EMPLOYEE.\nSEE: LABOR > OPEN PUNCHES',
};
