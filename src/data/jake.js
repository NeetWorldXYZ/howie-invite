// ============================================================
// STEP 6 — TERMINATE JAKE
// ------------------------------------------------------------
// Jake looks fireable five different ways. Four of them fall
// apart under the documentation. The one that holds:
//
//   CORRECT: Unauthorized 100% comps AFTER a signed final
//   warning — 8/12 signed final warning for comping food, then
//   8/26 incident report: six pizzas rung with MGR-COMP between
//   9:37–9:41 PM, no waste log entries, back door camera event
//   9:42 PM, POS discount report attached, witnessed by Maria.
//
// Refutations:
//   no-call/no-show 8/23  -> Jake's texts + Dennis's own email
//                            ("Told Jake Friday NOT to come in")
//   drawer theft 8/30     -> Step 4 proved the variance was the
//                            void/re-ring, not skimming
//   customer complaint 8/17 -> punches show Jake left at 2:00 PM,
//                            complaint incident was 8:40 PM
//   chronic tardiness     -> punches show he's pathologically EARLY
// ============================================================

export const JAKE = {
  name: 'JAKE RENNER',
  title: 'CREW — MAKELINE / REGISTER',
  hired: '3/14/2024',
  file: {
    punches: {
      title: 'CLOCK PUNCHES — LAST 3 WEEKS',
      rows: [
        ['8/11', 'SCH 4:00 PM', 'IN 3:19 PM', 'OUT 11:58 PM'],
        ['8/12', 'SCH 4:00 PM', 'IN 3:22 PM', 'OUT 12:04 AM'],
        ['8/14', 'SCH 11:00 AM', 'IN 10:17 AM', 'OUT 7:31 PM'],
        ['8/17', 'SCH 10:00 AM', 'IN 9:26 AM', 'OUT 2:00 PM'],
        ['8/19', 'SCH 4:00 PM', 'IN 3:31 PM', 'OUT 11:49 PM'],
        ['8/21', 'SCH 4:00 PM', '— NO PUNCH — (called out)', ''],
        ['8/23', 'SCH 4:00 PM', '— NO PUNCH —', ''],
        ['8/26', 'SCH 4:00 PM', 'IN 3:12 PM', 'OUT 11:55 PM'],
        ['8/28', 'SCH 4:00 PM', 'IN 3:40 PM', 'OUT 12:01 AM'],
        ['8/30', 'SCH 4:00 PM', 'IN 4:11 PM', '(ACTIVE)'],
      ],
      note: 'SYSTEM FLAG: employee habitually punches in 30–45 min early. Labor variance +4.2 hrs/wk. Multiple verbal requests to stop arriving early. Employee response on file: "traffic is unpredictable."',
    },
    writeups: {
      title: 'DISCIPLINARY RECORD',
      rows: [
        {
          date: '5/02',
          type: 'VERBAL',
          text: 'Ate toppings directly off the makeline. When confronted, continued making eye contact. No signature required for verbal.',
        },
        {
          date: '6/18',
          type: 'WRITTEN',
          text: 'Comped a full order for "a guy I know." No manager authorization. Employee stated the guy "was good for it."',
          signed: 'SIGNED: Jake R. / D. Foltz',
        },
        {
          date: '8/12',
          type: 'WRITTEN — FINAL WARNING',
          text: 'Unauthorized use of MGR-COMP discount (2 pizzas). Employee acknowledged policy HH-EMP-31: any further unauthorized discount or comp = termination.',
          signed: 'SIGNED: Jake R. / D. Foltz / witness M. Sanchez',
        },
      ],
    },
    incident: {
      title: 'INCIDENT REPORT — 8/26',
      by: 'FILED BY: M. SANCHEZ (SHIFT LEAD)',
      lines: [
        '9:37–9:41 PM: POS discount report shows SIX (6) large pizzas rung under MGR-COMP (100%). No manager on duty had authorized comps. Report attached.',
        '9:42 PM: back door camera event — door propped with milk crate, subject exits with insulated bags.',
        'Waste log for 8/26: zero entries.',
        'When asked the next day, employee stated the pizzas were "quality control."',
      ],
    },
    texts: {
      title: 'TEXT THREAD — DENNIS / JAKE (EXPORTED BY HR REQUEST)',
      thread: [
        { who: 'JAKE', msg: 'cant come in tire exploded', when: '8/21 2:14 PM' },
        { who: 'DENNIS', msg: 'You said your tire exploded last Tuesday.', when: '8/21 2:16 PM' },
        { who: 'JAKE', msg: 'other tire', when: '8/21 2:16 PM' },
        { who: 'DENNIS', msg: 'Fine. Getting coverage.', when: '8/21 2:31 PM' },
        { who: 'JAKE', msg: 'am i working saturday', when: '8/22 11:02 AM' },
        { who: 'DENNIS', msg: 'No. We\'re over on labor. Do NOT come in Saturday.', when: '8/22 11:20 AM' },
        { who: 'JAKE', msg: 'bet', when: '8/22 11:21 AM' },
        { who: 'JAKE', msg: 'you marked me no call no show?? you literally told me friday not to come in', when: '8/25 10:44 AM' },
        { who: 'DENNIS', msg: 'That doesn\'t sound like me', when: '8/25 10:52 AM' },
        { who: 'JAKE', msg: 'scroll up', when: '8/25 10:52 AM' },
      ],
    },
    managerNotes: {
      title: 'MANAGER NOTES — D. FOLTZ',
      lines: [
        '8/23 — Jake no-call/no-showed Saturday. Adding to file.',
        '8/25 — Jake disputing the no-show. Investigating (I am not going to investigate).',
        '8/17 — customer complaint about crew member, adding to Jake\'s file, sounds like him.',
        '8/30 — drawer short tonight. Jake was on register. Noting it here.',
      ],
    },
    complaint: {
      title: 'CUSTOMER COMPLAINT — 8/17, 8:40 PM',
      lines: [
        '"The kid at the counter told me the deep dish takes 25 minutes like it was MY fault. Tall, brown hair, an attitude."',
        'ATTACHED NOTE (D. FOLTZ): "sounds like Jake."',
      ],
    },
  },

  question: {
    prompt: 'TERMINATION REASON — SELECT THE REASON THE DOCUMENTATION ACTUALLY SUPPORTS',
    options: [
      {
        id: 'noshow',
        text: 'No-call/no-show on Saturday 8/23',
        correct: false,
        rebuttal:
          'HR will pull the texts: Dennis told him on Friday not to come in Saturday. Dennis\'s own email to Maria says the same thing and adds "nobody write him up for it." This one dies in arbitration.',
      },
      {
        id: 'theft',
        text: 'Register theft — drawer short $37.84 on his shift',
        correct: false,
        rebuttal:
          'You personally proved the shortage was the 7:41 void/re-ring hitting the card batch. Firing him for money that\'s sitting in the processor settlement is a wrongful-termination letter waiting to happen.',
      },
      {
        id: 'complaint',
        text: 'Customer complaint — rude at the counter, 8/17',
        correct: false,
        rebuttal:
          'The complaint came in at 8:40 PM on 8/17. Jake\'s punches show he clocked out at 2:00 PM that day. "Sounds like him" is not a timestamp.',
      },
      {
        id: 'tardy',
        text: 'Chronic attendance problems / tardiness',
        correct: false,
        rebuttal:
          'The punch record shows he is relentlessly, expensively EARLY. You cannot terminate a man for showing up 43 minutes before his shift. You can only wonder about him.',
      },
      {
        id: 'comps',
        text: 'Unauthorized 100% comps on 8/26, after a signed final warning for the same offense',
        correct: true,
      },
    ],
  },

  terminationDialogue: [
    { who: 'YOU', msg: 'Jake, we\'re ending your employment effective tonight.' },
    { who: 'JAKE', msg: 'Whatever. I was gonna quit anyway.' },
    { who: 'JAKE', msg: '…can I still get my shift meal' },
  ],
};
