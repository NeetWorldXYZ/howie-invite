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
  league: 'HOWIES FINEST',
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
  curtainTease: 'STEP RIGHT UP',
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
  // The record plaque. It is meant to be excessive.
  note: {
    eyebrow: 'CERTIFIED · NOTARIZED · LAMINATED',
    heading: "HOWIE'S BOOK OF RECORDS",
    page: 'PAGE ONE. THERE IS ONLY ONE PAGE.',
    names: 'KORY & JASON',
    title: 'DOUGH CHAMPS',
    reign: 'THEN · NOW · FOREVER',
    facts: [
      'UNDEFEATED. UNTIED. UNBOTHERED.',
      'Challengers to date: several. Survivors: zero.',
      'Your name: checked twice. Not in here.',
    ],
    fine: 'This record may not be broken, contested, appealed, or brought up at Thanksgiving. Howie has signed off. Howie does not un-sign.',
    ack1: 'ALL HAIL THE DOUGH CHAMPS',
    louder: 'LOUDER.',
    ack2: 'ALL!! HAIL!! THE DOUGH CHAMPS!!',
    thanks: 'That is what we thought.',
  },
};

// ---------- TRIAL 4 — THE KEY ----------
// A key is pressed into one of three dough balls. They get shuffled.
// Keep your eye on it — hard enough to lose, not hard enough to rage.
export const KEY = {
  title: 'JESSE WANTS TO SHOW YOU SOMETHING',
  intro: 'There is a key in one of these. Watch it.',
  watching: 'WATCH.',
  picking: 'WHICH ONE.',
  swaps: 10,
  startMs: 520,
  endMs: 270,
  wrong: [
    'Nothing in that one. He re-hides it.',
    'Wrong again. He is enjoying this more than he should be.',
    'No. He does this at parties.',
    'Still no. Maria has stopped watching.',
  ],
  right: 'THERE IT IS.',

  // The key floats up and the back office fades in around you.
  safe: {
    kicker: "THE MANAGER'S OFFICE",
    plaque: 'JESSE · GM',
    sub: 'OPEN THE SAFE',
    hint: 'PUT THE KEY IN',
    opened: 'It is mostly garbage.',
    paperHint: 'TAKE THE PAPER',
    cta: 'TAKE THE PAPER',
  },

  // The clock-out code is on this scrap, buried in junk. It can be
  // pulled back up during clock-out.
  note: {
    heading: 'DO NOT LOSE THIS',
    lines: [
      ['scrawl', 'MARIA — the walk-in thing again'],
      ['num', 'WALK-IN TEMP ALARM ....... 38'],
      ['num', 'SAFE (ask Jesse) ......... 22-14-6'],
      ['strike', 'CLOCK OUT PIN ............ 0000'],
      ['pen', 'clock out pin is 7319 now. Jesse changed it after the thing.'],
      ['num', 'GREASE PICKUP ............ TUES'],
      ['scrawl', 'if the phone rings after 11 do NOT answer it'],
      ['num', 'DUMPSTER KEY ............. taped under sink'],
      ['scrawl', "jason owes me $14 (he knows)"],
      ['num', 'HOWIE BREAD ............. 4 per box, not 6'],
      ['pen', 'whoever keeps turning the oven down — I will find out'],
    ],
    footer: 'Kory & Jason, dough champs, still unbeaten',
  },
};

// ---------- TRIAL 5 — CLOCK OUT ----------
export const CLOCKOUT = {
  title: 'END OF SHIFT',
  sub: 'PUNCH OUT',
  time: '12:07 AM',
  code: '7319',
  wrong: ['Not the pin.', 'No.', 'It is on the paper from the safe.'],
  noteBtn: 'CHECK THE PAPER',
  accepted: 'CLOCKED OUT',
  acceptedSub: '12:07 AM — go home',
  padSubmit: 'PUNCH',

  phone: {
    countdown: [3, 2, 1],
    ringing: 'INCOMING CALL',
    caller: 'JESSE (STORE)',
    callerSub: "HOWIE'S · FLAT ROCK",
    answer: 'ANSWER',
    tapHint: 'TAP TO KEEP LISTENING',
    lines: [
      { who: 'JESSE', msg: "Don't hang up. Do NOT hang up." },
      { who: 'JESSE', msg: 'Marcus hit a mailbox. He is fine. The mailbox is not. The pizzas were involved.' },
      { who: 'JESSE', msg: 'I have forty pies on the screen and Maria just walked into the walk-in and closed the door.' },
      { who: 'JESSE', msg: 'I need you back in here. Right now. Howie needs you.' },
    ],
    choiceHeader: 'HE IS WAITING.',
    choiceSub: 'THERE IS ONLY ONE RIGHT ANSWER.',
    yes: "YES. I'M ALREADY IN THE CAR.",
    no: 'NO, SORRY, I AM A LAZY BONES',
  },

  getOut: {
    sub: "Jesse has hung up. The Commissioner was cc'd. Howie felt it from headquarters.",
    callBack: 'CALL HIM BACK. BEG.',
    startOver: 'START THE WHOLE THING OVER',
  },

  grovel: {
    header: 'CALLING JESSE…',
    dialing: 'RINGING',
    tapHint: 'TAP TO SPEAK',
    lines: [
      { who: 'YOU', msg: "Jesse. Hey. Hi. It's me. Don't hang up." },
      { who: 'JESSE', msg: '…' },
      { who: 'YOU', msg: 'I said the thing. About being a lazy bones.' },
      { who: 'JESSE', msg: 'I had you on speaker. The whole store heard it.' },
      { who: 'YOU', msg: 'Marcus too?' },
      { who: 'JESSE', msg: 'Marcus especially. He stopped bleeding just to boo.' },
      { who: 'YOU', msg: "I'm coming in. I'm in the car. I'm wearing one shoe and I'm coming in." },
      { who: 'JESSE', msg: 'You were in the parking lot this entire call.' },
      { who: 'YOU', msg: "I'll do the walk-in. I'll do the grease trap. I'll take the Tuesday truck. FORGIVE ME." },
      { who: 'JESSE', msg: '…Get in here.' },
    ],
    cta: 'DRIVE BACK LIKE YOU MEAN IT',
  },
};

// ---------- FINALE ----------
export const FINALE = {
  blessing: 'Welcome to the league, my friend.',
  league: 'HOWIES FINEST',
  year: '2026',
  cta: 'ACCEPT LEAGUE INVITATION',
  noUrl: 'The Commissioner has not pasted the league link yet.\nScreenshot this and harass him directly.',
};

export const TRIALS = [
  { id: 'slot', label: 'MACHINE' },
  { id: 'pizza', label: 'PIZZA' },
  { id: 'darts', label: 'DARTS' },
  { id: 'key', label: 'THE KEY' },
  { id: 'clockout', label: 'CLOCK OUT' },
];
