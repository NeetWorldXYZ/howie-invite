// ============================================================
// STEP 3 — THE MAKELINE
// ------------------------------------------------------------
// The ticket is written in store shorthand. The reference sheets
// (some relevant, some not) let the player decode it.
//
// TICKET:  1 LG  RS-LT  XCHZ
//          1/2A: PEP MSH
//          1/2B: ITS BLK ONI
//          FLV: CAJ    CUT: SQ
//          *NO GPP*
//
// CORRECT BUILD:
//   size LG, red sauce with the 4 oz ladle (LT on LG = one ladle
//   size down), 4 cups cheese (X on LG = one cup up from 3),
//   left half: pepperoni + mushroom, right half: italian sausage
//   + black olive + onion, cajun crust rub, square cut.
//   ("Half A is the LEFT half as you face the cut table.")
//   *NO GPP* is a trap — the pizza never had green pepper.
// ============================================================

export const TOPPINGS = {
  PEP: { name: 'Pepperoni', color: '#b03a2e' },
  ITS: { name: 'Italian Sausage', color: '#8d6e63' },
  BAC: { name: 'Bacon', color: '#a1493a' },
  HAM: { name: 'Ham', color: '#d98e8e' },
  MSH: { name: 'Mushroom', color: '#c9b8a3' },
  ONI: { name: 'Onion', color: '#e8dcd0' },
  GPP: { name: 'Green Pepper', color: '#5c8a4e' },
  BLK: { name: 'Black Olive', color: '#3a3a40' },
  PIN: { name: 'Pineapple', color: '#e0c05a' },
  JAL: { name: 'Jalapeño', color: '#4f7a3a' },
};

export const SAUCES = {
  RS: { name: 'Red Sauce', color: '#9e2b1e' },
  BQ: { name: 'BBQ', color: '#5a2c18' },
  GB: { name: 'Garlic Butter', color: '#e3cf8f' },
  NS: { name: 'No Sauce', color: 'transparent' },
};

export const FLAVORS = {
  BTR: 'Butter',
  GHB: 'Garlic Herb',
  CAJ: 'Cajun',
  SES: 'Sesame',
  RCH: 'Ranch',
  ASG: 'Asiago',
};

export const CUTS = { PIE: 'Pie (8)', SQ: 'Square', DBL: 'Double Cut', NC: 'Uncut' };
export const SIZES = { SM: '10"', MD: '12"', LG: '14"', XL: '16"' };

export const TICKET = {
  number: '047',
  time: '8:12 PM',
  header: ['HUNGRY HOWIE\'S #4471', 'TKT 047      8:12 PM', 'PHONE — PICKUP 8:35'],
  lines: [
    '1  LG  RS-LT  XCHZ',
    '   1/2A: PEP MSH',
    '   1/2B: ITS BLK ONI',
    '   FLV: CAJ',
    '   CUT: SQ',
    '   *NO GPP*',
  ],
  customer: 'RANDY',
};

export const SOLUTION = {
  size: 'LG',
  sauce: 'RS',
  sauceLadle: 4,   // oz
  cheeseCups: 4,
  left: ['PEP', 'MSH'],
  right: ['ITS', 'BLK', 'ONI'],
  flavor: 'CAJ',
  cut: 'SQ',
};

// ---------- Laminated reference sheets ----------
export const REFERENCE_SHEETS = [
  {
    id: 'abbrev',
    title: 'TICKET ABBREVIATIONS',
    grease: true,
    sections: [
      {
        head: 'SIZES',
        rows: [['SM', '10"'], ['MD', '12"'], ['LG', '14"'], ['XL', '16"']],
      },
      {
        head: 'SAUCE',
        rows: [
          ['RS', 'Red sauce'], ['BQ', 'BBQ'], ['GB', 'Garlic butter'], ['NS', 'No sauce'],
          ['-LT', 'light'], ['X-', 'extra'],
        ],
      },
      {
        head: 'CHEESE',
        rows: [['CHZ', 'Cheese (reg unless marked)'], ['LTCHZ', 'light'], ['XCHZ', 'extra'], ['NOCHZ', 'why order pizza']],
      },
      {
        head: 'TOPPINGS',
        rows: [
          ['PEP', 'Pepperoni'], ['ITS', 'Italian sausage'], ['BAC', 'Bacon'], ['HAM', 'Ham'],
          ['MSH', 'Mushroom'], ['ONI', 'Onion'], ['GPP', 'Green pepper'], ['BLK', 'Black olive'],
          ['PIN', 'Pineapple'], ['JAL', 'Jalapeño'],
        ],
      },
      {
        head: 'NOTES',
        rows: [
          ['1/2A / 1/2B', 'Half A is the LEFT half as you face the cut table. This is not negotiable. Ask Maria what happened in March.'],
          ['*NO ___*', 'If the ticket says NO on a topping the pizza doesn\'t come with, that is the customer\'s problem, not yours. Build what\'s listed.'],
        ],
      },
    ],
  },
  {
    id: 'portions',
    title: 'PORTION CHART — SAUCE & CHEESE',
    sections: [
      {
        head: 'SAUCE LADLE (REGULAR)',
        rows: [['SM', '3 oz'], ['MD', '4 oz'], ['LG', '6 oz'], ['XL', '8 oz']],
      },
      {
        head: 'SAUCE MODIFIERS',
        rows: [
          ['LIGHT (-LT)', 'use one ladle size DOWN'],
          ['EXTRA (X-)', 'use one ladle size UP'],
          ['SM LIGHT', 'half ladle. eyeball it. you\'ll be wrong.'],
        ],
      },
      {
        head: 'CHEESE (8 OZ CUPS)',
        rows: [
          ['SM', '2 cups'], ['MD', '2 cups'], ['LG', '3 cups'], ['XL', '4 cups'],
          ['LIGHT', 'one cup down'], ['EXTRA', 'one cup up'],
        ],
      },
    ],
  },
  {
    id: 'crustcut',
    title: 'CRUST FLAVORS & CUTS',
    sections: [
      {
        head: 'FLAVORED CRUST (RUB ON EDGE AFTER BAKE)',
        rows: [
          ['BTR', 'Butter'], ['GHB', 'Garlic herb'], ['CAJ', 'Cajun'],
          ['SES', 'Sesame'], ['RCH', 'Ranch'], ['ASG', 'Asiago'],
        ],
      },
      {
        head: 'CUT STYLES',
        rows: [
          ['PIE', '8 wedges (default)'], ['SQ', 'square / party cut'],
          ['DBL', '16 slices. youth soccer teams.'], ['NC', 'uncut. do not ask.'],
        ],
      },
    ],
  },
  {
    id: 'oven',
    title: 'CONVEYOR OVEN SETTINGS', // deliberately irrelevant
    sections: [
      {
        head: 'DO NOT TOUCH',
        rows: [
          ['TEMP', '465°F'], ['BELT', '6:30'],
          ['NOTE', 'If you changed it anyway, change it back and tell no one.'],
        ],
      },
      {
        head: 'WINGS',
        rows: [['ALL', 'second pass, foil down'], ['BONELESS', 'they\'re nuggets. charge more.']],
      },
    ],
  },
];

export function validatePizza(built) {
  const setEq = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();
  const s = SOLUTION;
  return (
    built.size === s.size &&
    built.sauce === s.sauce &&
    built.sauceLadle === s.sauceLadle &&
    built.cheeseCups === s.cheeseCups &&
    setEq(built.left || [], s.left) &&
    setEq(built.right || [], s.right) &&
    built.flavor === s.flavor &&
    built.cut === s.cut
  );
}

// Category-level hint: names ONE thing that's wrong, not the fix.
export function diagnosePizza(built) {
  const setEq = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();
  const s = SOLUTION;
  if (built.size !== s.size) return 'The size is wrong.';
  if (built.sauce !== s.sauce) return 'Wrong sauce.';
  if (built.sauceLadle !== s.sauceLadle) return 'Sauce amount is off. Read the modifier again.';
  if (built.cheeseCups !== s.cheeseCups) return 'Cheese amount is off.';
  if (!setEq(built.left || [], s.left) || !setEq(built.right || [], s.right)) {
    const allBuilt = [...(built.left || []), ...(built.right || [])];
    const allSol = [...s.left, ...s.right];
    if (setEq(allBuilt, allSol)) return 'Right toppings. Wrong geography.';
    return 'The toppings are wrong.';
  }
  if (built.flavor !== s.flavor) return 'Crust flavor is wrong.';
  if (built.cut !== s.cut) return 'Cut is wrong.';
  return null;
}

export const FAIL_LINES = [
  'ORDER INCORRECT',
  'ORDER INCORRECT — remake it.',
  'ORDER INCORRECT — Randy has called twice.',
  'ORDER INCORRECT — Dennis looked over, said nothing, and went back to the office.',
];
