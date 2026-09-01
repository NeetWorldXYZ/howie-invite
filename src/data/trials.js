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

// ---------- TRIAL 4 — THE HOT BAG ----------
export const BAG = {
  title: 'OUT OF THE OVEN',
  sub: 'TAP TO BOX IT AND LOAD THE BAG',
  order: { num: '#4471', items: '2 LG PEP · 1 HOWIE BREAD', addr: '2216 TELEGRAPH RD' },
  seconds: 15,
  need: 100,
  perTap: 2.9,
  decay: 5,            // units lost per second — stopping loses ground
  hint: 'TAP FAST. IT IS ALREADY COOLING.',
  success: 'IN THE BAG. MARCUS TAKES IT FROM HERE.',
  fails: [
    'Cold. Dennis remade it. Try again.',
    'Cold again. He remade it again. He did not say anything, which is worse.',
    'The customer has called the store. Maria took it. Go.',
    'Dennis is now watching you do this.',
  ],
  retry: 'REMAKE IT',
};

// ---------- TRIAL 5 — THE KEY ----------
// A key is pressed into one of three dough balls. They get shuffled.
// Keep your eye on it. This is meant to be genuinely hard.
export const KEY = {
  title: 'DENNIS WANTS TO SHOW YOU SOMETHING',
  intro: 'There is a key in one of these. Watch it.',
  watching: 'WATCH.',
  picking: 'WHICH ONE.',
  swaps: 16,
  startMs: 460,
  endMs: 165,
  wrong: [
    'Nothing in that one. He re-hides it.',
    'Wrong again. He is enjoying this more than he should be.',
    'No. He does this at parties.',
    'Still no. Maria has stopped watching.',
  ],
  right: 'THERE IT IS.',
  cta: 'TAKE THE KEY',

  chest: {
    title: 'THE BOX',
    sub: 'PUT THE KEY IN',
    hint: 'TAP THE LOCK',
    opened: 'It is mostly garbage.',
    cta: 'TAKE THE PAPER',
  },

  // The clock-out code is on this scrap, buried in junk. It can be
  // pulled back up during clock-out.
  note: {
    heading: 'DO NOT LOSE THIS',
    lines: [
      ['scrawl', 'MARIA — the walk-in thing again'],
      ['num', 'WALK-IN TEMP ALARM ....... 38'],
      ['num', 'SAFE (ask Dennis) ........ 22-14-6'],
      ['strike', 'CLOCK OUT PIN ............ 0000'],
      ['pen', 'clock out pin is 7319 now. Dennis changed it after the thing.'],
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

// ---------- TRIAL 6 — CLOCK OUT ----------
export const CLOCKOUT = {
  title: 'END OF SHIFT',
  sub: 'PUNCH OUT',
  time: '12:07 AM',
  code: '7319',
  wrong: ['Not the pin.', 'No.', 'It is on the paper from the box.'],
  noteBtn: 'CHECK THE PAPER',
  accepted: 'CLOCKED OUT',
  acceptedSub: '12:07 AM — go home',

  phone: {
    countdown: [3, 2, 1],
    ringing: 'INCOMING',
    caller: 'DENNIS (STORE)',
    answer: 'ANSWER',
    lines: [
      "Hey. Hey — you still in the lot?",
      "It got real busy. Like, real busy.",
      "Any chance you can come back in?",
    ],
    yes: "YES, I'M ON MY WAY",
    no: 'NO, SORRY, I AM A LAZY BONES',
  },

  getOut: {
    big: 'GET OUT',
    sub: 'The Commissioner has reviewed your answer.',
    callBack: 'CALL HIM BACK',
    startOver: 'START THE WHOLE THING OVER',
  },

  grovel: {
    header: 'CALLING DENNIS…',
    lines: [
      { who: 'YOU', msg: "Dennis. Hi. Hey. It's me." },
      { who: 'DENNIS', msg: '…' },
      { who: 'YOU', msg: "I said a thing. On the phone. About being a lazy bones." },
      { who: 'DENNIS', msg: 'I heard you the first time.' },
      { who: 'YOU', msg: "I'm coming in. I'm already in the car. I'm putting shoes on in the car." },
      { who: 'DENNIS', msg: 'You were in the lot the whole time.' },
      { who: 'YOU', msg: "Please forgive me. Please forgive us. I'll do the walk-in. I'll do the grease trap." },
      { who: 'DENNIS', msg: 'Come in.' },
      { who: 'YOU', msg: 'Thank you. Thank you, Dennis.' },
    ],
    cta: 'DRIVE BACK',
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
  { id: 'bag', label: 'HOT BAG' },
  { id: 'key', label: 'THE KEY' },
  { id: 'clockout', label: 'CLOCK OUT' },
];
