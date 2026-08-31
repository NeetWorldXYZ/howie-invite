// ============================================================
// THE INITIATION — all copy, jokes and tuning numbers.
// Five hands-on trials. Change content here, not in components.
// ============================================================

export const OPENING = {
  eyebrow: 'ONE OF TEN',
  chosen: 'You have been chosen.',
  subline: 'Ten were printed. This one found you.',
  sealHint: 'PULL THE SEAL',
};

export const ENVELOPE = {
  addressedTo: 'To the bearer of',
  addressLine: 'No. 007',
  postmark: { city: 'FLAT ROCK MI', date: 'AUG 31 2026' },
  stampValue: 'FIRST CLASS',
};

export const TICKET = {
  admit: 'ADMIT ONE',
  serial: 'No. 007 / 010',
  kicker: 'Golden Ticket',
  league: 'HUNGRY HOMIES',
  year: '2026',
  sub: 'FANTASY FOOTBALL LEAGUE',
  body: 'This ticket entitles the bearer to one (1) attempt at membership.',
  fine: 'Bearer must complete initiation. Ticket is non-transferable and, per the Commissioner, non-negotiable.',
  cta: 'BEGIN INITIATION',
};

// ---------- TRIAL 1 — SLOT MACHINE ----------
export const SLOT = {
  title: 'THE MACHINE',
  sub: 'PULL THE HANDLE',
  hint: 'PULL DOWN',
  startCredits: 200,
  bets: [
    { id: 'one', label: 'BET 1', amount: 1 },
    { id: 'five', label: 'BET 5', amount: 5 },
    { id: 'max', label: 'MAX BET', amount: 50 },
  ],
  // Reels always lose until MAX BET is placed.
  symbols: ['CHERRY', 'SEVEN', 'BAR', 'BELL', 'DOUGH'],
  losses: [
    'NOTHING.',
    'SO CLOSE. NOT REALLY, BUT SO CLOSE.',
    'THE MACHINE HAS NOTICED YOU ARE BETTING THE MINIMUM.',
    'THE MACHINE RESPECTS COWARDS LESS THAN LOSERS.',
    'BET MORE. THAT IS THE ENTIRE ADVICE.',
    'IT IS NOT GOING TO HIT ON A DOLLAR. IT NEVER WAS.',
  ],
  maxNudge: 'MAX BET',
  jackpotText: 'JACKPOT',
  jackpotSub: 'MAXIMUM DISRESPECT',
  jackpotHoldMs: 3200,
};

// ---------- TRIAL 2 — BUILD THE PIZZA ----------
export const PIZZA = {
  title: 'MAKE ONE PIZZA',
  steps: [
    { id: 'sauce', label: 'SAUCE', hint: 'SPREAD THE SAUCE', need: 0.62, done: 'Sauce down.' },
    { id: 'cheese', label: 'CHEESE', hint: 'CHEESE IT. ALL THE WAY OUT.', need: 0.6, done: 'Cheese down.' },
    { id: 'pep', label: 'PEPPERONI', hint: 'TAP TO LAY PEPPERONI', need: 14, done: 'That is a pizza.' },
  ],
  // indexed by the step you are CURRENTLY on — says what is missing now
  outOfOrder: [
    'Sauce first.',
    'It needs cheese before it needs pepperoni.',
  ],
  finalNote: 'Cut it, box it, move on.',
  cta: 'SEND IT',
};

// ---------- TRIAL 3 — DART / BALLOONS ----------
export const DARTS = {
  title: 'BALLOON POP',
  banner: 'EVERY PLAYER A WINNER',
  sub: 'FLICK A DART AT THE WALL',
  hint: 'SWIPE UP FROM THE DART',
  balloonCount: 15,
  missText: [
    'Missed.',
    'That one is in the corkboard now.',
    'The carnival keeps the dart.',
    'The guy running the booth has not looked up once.',
  ],
  popText: ['Pop.', 'Nothing in that one.', 'Empty.', 'Also empty.'],
  noteFound: 'Something was rolled up in that one.',
  paperHint: 'TOUCH THE PAPER',
  note: {
    heading: "HOWIE'S BOOK OF RECORDS",
    names: 'KORY & JASON',
    title: 'DOUGH CHAMPS',
    detail: 'Record stands. Unbeaten. Contested only by people who were not there.',
    ack: 'ALL HAIL THE DOUGH CHAMPS',
  },
};

// ---------- TRIAL 4 — DELIVERY MAZE ----------
export const MAZE = {
  title: 'DELIVERY',
  sub: 'DRAG THE CAR TO THE HOUSE',
  hint: 'DRAG THE CAR',
  // '#' building  '.' road  'S' store  'H' house
  // Perfect maze: exactly one route, real dead ends. 74 steps end to end.
  grid: [
    '###########',
    '#S#.....#.#',
    '#.###.#.#.#',
    '#...#.#...#',
    '###.#.###.#',
    '#...#.#...#',
    '#.###.#.###',
    '#.....#...#',
    '#########.#',
    '#...#...#.#',
    '#.#.#.#.#.#',
    '#.#...#.#.#',
    '#.#####.#.#',
    '#.#...#...#',
    '#.#.#.#####',
    '#...#....H#',
    '###########',
  ],
  order: { num: '#4471', items: '2 LG PEP · 1 HOWIE BREAD', addr: '2216 TELEGRAPH RD' },
  promise: '30 MINUTES OR LESS',
  lateNote: 'It has been longer than thirty minutes. Nobody is timing you. The pizza knows.',
  arrive: 'You found the house. No porch light, obviously.',
};

// ---------- TRIAL 5 — THE DOOR ----------
export const DOOR = {
  title: '',
  knockPrompt: 'KNOCK',
  knocksNeeded: 3,
  waiting: 'Somebody is coming.',
  voice: 'Before I open this door.',
  question: 'How many ounces is an All Corners dough ball cut into?',
  unit: 'OZ',
  answer: 11,
  wrong: ['That is not it.', 'No.', 'You did not work there, did you.'],
  hintAfter: 2,
  hint: 'It is between ten and twelve. That is the hint. That is the whole hint.',
  correct: 'Yeah. Alright. Come in.',
};

// ---------- FINALE ----------
export const FINALE = {
  welcome: 'WELCOME TO THE LEAGUE',
  league: 'HUNGRY HOMIES',
  year: '2026',
  cta: 'ACCEPT LEAGUE INVITATION',
  noUrl: 'The Commissioner has not pasted the league link yet.\nScreenshot this and harass him directly.',
};

export const TRIALS = [
  { id: 'slot', label: 'MACHINE' },
  { id: 'pizza', label: 'PIZZA' },
  { id: 'darts', label: 'DARTS' },
  { id: 'maze', label: 'DELIVERY' },
  { id: 'door', label: 'THE DOOR' },
];
