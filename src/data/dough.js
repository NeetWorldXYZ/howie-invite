// ============================================================
// STEP 2 — DOUGH PREP
// ============================================================

export const DOUGH = {
  targetOz: 16.0,
  toleranceOz: 0.5,
  totalRequired: 40,     // the "goal" per the prep sheet
  requiredBeforeReveal: 3, // balls the player must actually make
  keepGoingExtra: 2,     // extra balls if they choose KEEP GOING
  bulkStartOz: 640,      // tub of dough to pull from

  // How much a grab takes per second of holding (oz), with noise.
  grabRatePerSec: 14,
  pinchOz: [0.2, 0.45],  // random range for pinch off / add pinch

  prepSheet: [
    'PREP — LARGE DOUGH',
    'TARGET: 16.0 OZ ±0.5',
    'TRAY COUNT TONIGHT: 40',
    'UNDERWEIGHT BALLS = CUSTOMER COMPLAINTS',
    'OVERWEIGHT BALLS = FOOD COST. DENNIS SEES FOOD COST.',
  ],

  managerInterrupt:
    "Leave the rest. Printer's going off and Maria left at 8. Makeline. Now.",
};
