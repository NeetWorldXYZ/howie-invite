// ============================================================
// STEP 1 — CLOCK IN
// ------------------------------------------------------------
// The player needs a 4-digit temporary PIN. Everything required
// is on screen; the puzzle is careful reading plus two traps.
//
// SOLUTION: 1517
//   Digits 1–2: the minutes on the POSTED schedule (4:15 PM -> "15")
//               (NOT the time clock's "4:00", NOT the arrival "4:17")
//   Digits 3–4: last two digits of store #4471 ("71"), swapped -> "17"
// ============================================================

export const CLOCKIN = {
  pin: '1517',
  shiftStart: '4:00 PM',
  arrival: '4:17 PM',

  memo: {
    title: 'HH-OPS-114 (rev. 6) — TEMPORARY PIN PROCEDURE',
    lines: [
      'New employees operate on a temporary PIN until first payroll.',
      'Your temporary PIN is four digits, assembled as follows:',
      '§1. FIRST TWO DIGITS — the minutes of your scheduled start time, as it appears on the POSTED weekly schedule. Not your offer letter. Not what the time clock says. Not when you actually showed up.',
      '§2. LAST TWO DIGITS — the last two digits of your store number, in reverse order.',
      'Do not write your PIN down.',
      '(This memo does not count as writing it down. Legal reviewed it.)',
    ],
  },

  stickyNote: {
    from: 'D',
    text: 'New guy — your PIN is in the binder. The binder is locked. The code to the binder is your PIN. Corporate is aware of the issue.',
  },

  schedule: {
    title: 'WEEK OF AUG 24 — POSTED SCHEDULE',
    note: 'CHANGES IN PEN ARE FINAL — D.',
    rows: [
      { name: 'DENNIS F. (GM)', shift: '11:00 AM – CL' },
      { name: 'MARIA S.', shift: '11:00 AM – 8:00 PM' },
      { name: 'JAKE R.', shift: '4:00 PM – CL', scratched: false },
      { name: 'MARCUS D. (DRV)', shift: '5:00 PM – CL' },
      // The player's row. Original 4:00 is crossed out, 4:15 written in pen.
      { name: 'NEW HIRE (YOU)', shift: '4:00 PM – CL', penFix: '4:15', scratched: true },
      { name: 'BRITTANY K.', shift: 'QUIT', scratched: false },
    ],
  },

  hints: [
    'The time clock says 4:00. That is not what is POSTED. Look at the schedule on the wall — including anything written in pen.',
    'Posted start is 4:15 → first two digits are 15. Store #4471 → last two digits 71, reversed → 17.',
  ],

  successNote: "We'll fix your time later.",
};

export function validateClockinPin(entry) {
  return entry === CLOCKIN.pin;
}
