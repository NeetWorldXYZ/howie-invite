// ============================================================
// STEP 4 — THE CASH SHORTAGE
// ------------------------------------------------------------
// THE TRUTH: Order 1113 ($37.84) was paid by CARD at 7:41 PM.
// Dennis voided it at 7:43 ("customer said it didn't go through")
// and Jake re-rang it at 7:44 as CASH. The card charge actually
// settled at the processor. So the POS expects $37.84 in cash
// that never physically existed — the money is in the card batch.
//
// LEDGER (verified by scripts/verify.mjs):
//   starting till                 150.00
//   + POS-recorded cash sales     240.45   (includes phantom 37.84)
//   - cash refund                  18.92
//   - safe drop                   100.00
//   = POS expected drawer         271.53
//   counted                       233.69   -> variance -37.84
//
//   POS card batch (post-void)    406.21
//   processor settlement          444.05   -> +37.84 (the money)
//
//   deposit = drop 100.00 + counted 233.69 - till keep 150.00
//           = 183.69   <-- needed again in Step 7.
// ============================================================

export const CASH = {
  variance: -37.84,
  startingTill: 150.0,
  counted: 233.69,
  expected: 271.53,
  safeDropTotal: 100.0,
  cashRefunds: 18.92,
  posCardBatch: 406.21,
  processorSettlement: 444.05,
  depositAmount: 183.69, // remembered for Step 7
  midCountTime: '7:00 PM',
};

// order#, time, amount, tender, flags
export const TRANSACTIONS = [
  { id: 1101, t: '4:36 PM', amt: 24.17, tender: 'CARD' },
  { id: 1102, t: '4:51 PM', amt: 18.50, tender: 'CASH' },
  { id: 1103, t: '5:12 PM', amt: 31.06, tender: 'CARD' },
  { id: 1104, t: '5:29 PM', amt: 12.99, tender: 'CASH' },
  { id: 1105, t: '5:44 PM', amt: 47.25, tender: 'CARD' },
  { id: 1106, t: '5:58 PM', amt: 22.75, tender: 'CASH' },
  { id: 1107, t: '6:10 PM', amt: 9.64, tender: 'CASH' },
  { id: 1108, t: '6:27 PM', amt: 54.80, tender: 'CARD' },
  { id: 1109, t: '6:41 PM', amt: 16.38, tender: 'CASH', note: 'DELIVERY — MARCUS D.' },
  { id: 1110, t: '6:55 PM', amt: 28.91, tender: 'CARD' },
  { id: 1111, t: '7:08 PM', amt: 33.20, tender: 'CASH', note: 'DELIVERY — MARCUS D.' },
  { id: 1112, t: '7:22 PM', amt: 19.99, tender: 'CARD' },
  { id: 1113, t: '7:41 PM', amt: 37.84, tender: 'CARD', voided: '7:43 PM', voidBy: 'D.FOLTZ (MGR OVERRIDE)', voidReason: 'CUST SAYS CARD DIDN\'T GO THRU' },
  { id: 1114, t: '7:44 PM', amt: 37.84, tender: 'CASH', note: 'RE-RING OF 1113 — J.RENNER' },
  { id: 1115, t: '7:58 PM', amt: 26.45, tender: 'CARD' },
  { id: 1116, t: '8:05 PM', amt: -18.92, tender: 'CASH', refund: true, note: 'REFUND ref 1108 — wrong pizza. slip signed.' },
  { id: 1117, t: '8:19 PM', amt: 41.13, tender: 'CARD' },
  { id: 1118, t: '8:33 PM', amt: 36.92, tender: 'CASH', note: 'DELIVERY — MARCUS D.' },
  { id: 1119, t: '8:47 PM', amt: 14.75, tender: 'CASH' },
  { id: 1120, t: '9:02 PM', amt: 52.60, tender: 'CARD' },
  { id: 1121, t: '9:18 PM', amt: 23.08, tender: 'CARD' },
  { id: 1122, t: '9:36 PM', amt: 17.42, tender: 'CASH' },
  { id: 1123, t: '9:55 PM', amt: 29.87, tender: 'CARD' },
  { id: 1124, t: '10:14 PM', amt: 11.31, tender: 'CASH' },
  { id: 1125, t: '10:42 PM', amt: 26.90, tender: 'CARD' },
  { id: 1126, t: '11:07 PM', amt: 8.75, tender: 'CASH' },
];

export const DRAWER_EVENTS = [
  { t: '4:02 PM', ev: 'DRAWER OPEN — SHIFT START COUNT: $150.00 (D.FOLTZ)' },
  { t: '7:00 PM', ev: 'MID-SHIFT SPOT COUNT: EVEN ($0.00 VARIANCE) (D.FOLTZ)' },
  { t: '7:43 PM', ev: 'MANAGER OVERRIDE — VOID #1113 (D.FOLTZ)' },
  { t: '9:15 PM', ev: 'SAFE DROP: $100.00 — SLIP #211 (D.FOLTZ)' },
  { t: '9:58 PM', ev: 'NO SALE — J.RENNER' },
  { t: '10:03 PM', ev: 'NO SALE — J.RENNER — keyed reason: "quarters for vacuum guy next door"' },
  { t: '10:21 PM', ev: 'NO SALE — J.RENNER' },
  { t: '12:01 AM', ev: 'CLOSING COUNT: $233.69 — VARIANCE −$37.84' },
];

export const CARD_SETTLEMENT = {
  title: 'PROCESSOR SETTLEMENT — BATCH 0830',
  lines: [
    ['TRANSACTIONS SETTLED', '13'],
    ['SETTLEMENT TOTAL', '$444.05'],
    ['POS CARD BATCH', '$406.21'],
    ['BATCH VARIANCE', '+$37.84'],
  ],
  detail: [
    '7:41 PM  AUTH  ****3317  $37.84  SETTLED',
    'NOTE: no reversal received for auth ****3317.',
  ],
};

// Driver cash-out sheet — plausible lead, fully reconciles.
export const DRIVER_SHEET = {
  title: 'DRIVER CASH-OUT — MARCUS D.',
  lines: [
    ['CASH ORDERS TAKEN', '$86.50   (1109, 1111, 1118)'],
    ['CASH TURNED IN', '$86.50'],
    ['VARIANCE', '$0.00'],
  ],
  note: 'was $20 short at first. found it in the car. under the thing. — M',
};

export const SAFE_SHEET = {
  title: 'SAFE COUNT SHEET — 8/30',
  lines: [
    ['DROP SLIP #211 (9:15 PM)', '$100.00 ✓ verified in safe'],
    ['DROPS TOTAL', '$100.00'],
    ['DEPOSIT BAG #A-0830', 'pending close'],
  ],
};

export const CLOCK_LOG = [
  'D.FOLTZ (GM)     IN 10:52 AM',
  'MARIA S.         IN 10:58 AM   OUT 8:04 PM',
  'J.RENNER         IN 4:11 PM',
  'MARCUS D. (DRV)  IN 4:58 PM    OUT 11:31 PM',
  'NEW HIRE (YOU)   IN 4:17 PM',
];

export const CASH_QUESTION = {
  prompt: 'WHAT CAUSED THE −$37.84 SHORTAGE?',
  options: [
    {
      id: 'jake_nosale',
      text: 'Jake skimmed the drawer using NO SALE opens around 10 PM.',
      correct: false,
      rebuttal:
        'The drawer was even at the 7:00 PM spot count and the variance is exactly $37.84 — the amount of the 7:41 void/re-ring pair, two hours before the no-sales. Petty theft doesn\'t come in exact ticket amounts.',
    },
    {
      id: 'driver',
      text: 'Marcus pocketed cash from a delivery.',
      correct: false,
      rebuttal:
        'His cash-out sheet reconciles to the penny: $86.50 taken, $86.50 turned in. He did find $20 in his car "under the thing," but it went in the bag.',
    },
    {
      id: 'void_rering',
      text: 'Order 1113 was paid by card and settled, but was voided and re-rung as cash — so the POS expects $37.84 in cash that never existed. The money is in the card batch.',
      correct: true,
    },
    {
      id: 'safe_drop',
      text: 'The 9:15 safe drop was actually $137.84 but logged as $100.',
      correct: false,
      rebuttal:
        'The safe count sheet shows slip #211 verified at $100.00 in the safe. If anything extra were in there, the safe would be OVER — it isn\'t.',
    },
    {
      id: 'refund',
      text: 'The 8:05 refund was fraudulent — no product was returned.',
      correct: false,
      rebuttal:
        'The refund is $18.92, not $37.84, and the slip is signed. The math doesn\'t get you there no matter how much you dislike refunds.',
    },
  ],
};
