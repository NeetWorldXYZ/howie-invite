// ============================================================
// THE INITIATION — all copy and content lives here.
// Six tactile trials. No riddles. You do a thing, a thing happens.
// Tone: R. Crude, deadpan, never explicit.
// ============================================================

export const OPENING = {
  eyebrow: 'TWELVE WERE PRINTED',
  chosen: 'You are the lucky one.',
  subline: 'One of twelve. Located by you. Verified by nobody.',
  tearHint: 'DRAG ACROSS TO TEAR OPEN',
};

export const INVITATION = {
  kicker: 'Official Invitation',
  fine: 'By order of the Commissioner,',
  body: 'You have been selected for membership in the 2026 Hungry Homies Fantasy Football League.',
  fine2: 'Twelve invitations exist. Eleven have already been claimed by men you know personally. This should concern you.',
  body2: 'League bylaws require initiation. Six trials. No substitutions, no proxies, no getting your buddy to do it.',
  closer: 'Begin immediately.',
  cta: 'BEGIN INITIATION',
};

// ---------- TRIAL 1 — SCRATCH ----------
export const SCRATCH = {
  title: 'ELIGIBILITY TICKET',
  sub: 'SCRATCH THE FOIL. ALL OF IT. WE\'LL KNOW.',
  ticketLabel: 'COMMISSIONER\'S DISCRETIONARY ENTRY',
  serial: 'NO. 007 OF 012',
  symbols: ['LUCKY', 'LUCKY', 'LUCKY'],
  threshold: 0.62, // fraction of foil that must be removed
  winText: 'THREE MATCHING. YOU WIN.',
  finePrint: [
    'PRIZE: CONSIDERATION.',
    'ODDS OF WINNING: 1 IN 12.',
    'ODDS OF ENJOYING IT: SUBSTANTIALLY WORSE.',
    'NON-TRANSFERABLE. NON-REFUNDABLE. NON-BINDING ON THE COMMISSIONER, WHO REMAINS FREE TO DO WHATEVER HE WANTS.',
  ],
  cta: 'CONTINUE',
};

// ---------- TRIAL 2 — INFLATE ----------
export const INFLATE = {
  title: "THE COMMISSIONER'S EGO",
  sub: 'INFLATE TO REGULATION PRESSURE',
  hint: 'PRESS AND HOLD',
  popAt: 41,
  // psi threshold -> what the gauge says
  stages: [
    { at: 0, text: 'REGULATION: 12.5 PSI', tone: 'ok' },
    { at: 12.5, text: 'REGULATION REACHED. HE WOULD LIKE MORE.', tone: 'ok' },
    { at: 17, text: 'ABOVE REGULATION. NOBODY IS STOPPING YOU.', tone: 'warn' },
    { at: 22, text: 'HE IS TELLING THE STORY ABOUT THE 2019 PLAYOFFS.', tone: 'warn' },
    { at: 27, text: 'HE HAS BROUGHT UP HIS FANTASY RECORD UNPROMPTED.', tone: 'warn' },
    { at: 32, text: 'STOP.', tone: 'bad' },
    { at: 36, text: 'HE IS ENJOYING THIS.', tone: 'bad' },
    { at: 39, text: 'SERIOUSLY.', tone: 'bad' },
  ],
  popText: 'EGO RUPTURED',
  popSub: 'This has happened before. It will happen again in week 4.',
  slip: 'ADMIT ONE — PENDING FURTHER HUMILIATION',
  cta: 'PICK UP THE SLIP',
};

// ---------- TRIAL 3 — CHUG ----------
export const CHUG = {
  title: 'DRAFT NIGHT',
  sub: 'MANDATORY. TAP TO DRINK.',
  hint: 'TAP FAST',
  rounds: [
    { label: 'BEER 1 OF 2', done: 'Fine. Everyone\'s fine.' },
    { label: 'BEER 2 OF 2', done: 'You have begun explaining your draft strategy to someone who did not ask.' },
  ],
  tapsPerBeer: 22,
  bacLine: 'BLOOD ALCOHOL: LEGALLY YOU ARE FINE. SPIRITUALLY YOU ARE NOT.',
  cta: 'STAND UP SLOWLY',
};

// ---------- TRIAL 4 — WHEEL ----------
export const WHEEL = {
  title: 'LAST PLACE PUNISHMENT',
  sub: 'FLICK TO SPIN. THIS IS BINDING.',
  hint: 'SWIPE THE WHEEL',
  segments: [
    'TRAMP STAMP\nWINNER PICKS',
    '24 HOURS IN A\nWAFFLE HOUSE',
    'THE MILK MILE\nNO SUPERVISION',
    'GAS STATION SUSHI\nON CAMERA',
    'YOUR MOM DRAFTS\nFOR YOU NEXT YEAR',
    'SHAVE IT.\nALL OF IT.',
    'SENIOR PORTRAITS\nAT THE MALL',
    'RIVAL JERSEY\n6 AM, MAIN ST',
  ],
  firstResultNote: 'Spin recorded.',
  reSpinPrompt: 'The Commissioner has invoked a re-spin. He is allowed to do that. He wrote the rules.',
  reSpinBtn: 'SPIN AGAIN (NOT OPTIONAL)',
  finalNote: 'RECORDED. WITNESSED. NOTARIZED BY A GUY NAMED DUSTIN.',
  cta: 'ACCEPT MY FATE',
};

// ---------- TRIAL 5 — SIGNATURE ----------
export const SIGN = {
  title: 'LEAGUE COVENANT',
  sub: 'SIGN BELOW',
  scrollTerms: 'TERMS AND CONDITIONS — PLEASE REVIEW CAREFULLY',
  hint: 'DRAW YOUR SIGNATURE',
  minStroke: 260, // px of ink required
  afterTitle: 'SIGNATURE ACCEPTED',
  afterSub: 'You may now read what you agreed to.',
  terms: [
    'Dues are $50 and are due before the draft. "I\'ll Venmo you" is not a payment. It has never been a payment.',
    'The Commissioner\'s decisions are final, including the ones he makes after seeing the outcome.',
    'You waive all right to complain about scheduling, in the group chat or in person, for the duration of your natural life.',
    'The collusion clause applies to all owners except the Commissioner, who is grandfathered in for reasons that were explained once, quickly.',
    'Last place punishment is enforceable by the group. Photographic evidence is required and will be distributed.',
    'You consent to your team name being changed without notice if it is boring.',
    'Trophy remains at the Commissioner\'s residence regardless of who wins. It looks better there. He has a shelf.',
    'By signing you affirm you are of legal drinking age and questionable judgment.',
  ],
  cta: 'I HAVE MADE A HUGE MISTAKE',
};

// ---------- TRIAL 6 — SEAL ----------
export const SEAL = {
  title: 'SEAL YOUR ENTRY',
  sub: 'PRESS AND HOLD UNTIL IT TAKES',
  hint: 'PRESS AND HOLD',
  holdMs: 1700,
  doneText: 'SEALED',
};

// ---------- FINALE ----------
export const FINALE = {
  kicker: 'Initiation Complete',
  approved: 'You survived it.',
  welcome: 'Welcome to',
  cta: 'ACCEPT LEAGUE INVITATION',
  noUrl: 'The Commissioner has not attached the league link yet.\nScreenshot this and harass him directly.',
};

export const TRIALS = [
  { id: 'scratch', label: 'ELIGIBILITY' },
  { id: 'inflate', label: 'PRESSURE' },
  { id: 'chug', label: 'DRAFT NIGHT' },
  { id: 'wheel', label: 'PUNISHMENT' },
  { id: 'sign', label: 'COVENANT' },
  { id: 'seal', label: 'THE SEAL' },
];
