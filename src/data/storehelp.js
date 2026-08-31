// ============================================================
// STEP 5 — STORE HELP
// ------------------------------------------------------------
// The router died; online orders are failing. Calling support is
// a 2h47m hold. Email requires the store account password.
//
// CREDENTIAL PUZZLE:
//   Router label:    Wi-Fi key  "Crust4471!"
//   Binder note:     "email password is the wifi password, but with
//                     the year we OPENED instead of the store number"
//   Wall plaque:     "PROUDLY SERVING FLAT ROCK SINCE 2009"
//   => password:     Crust2009!
//   Username is printed on the old Store Help sheet (prefilled).
//
// COMPOSE PUZZLE: the Store Help auto-reply requires three fields:
//   store number 4471, error code E-1067 (on the router / POS
//   screen), callback phone (734) 555-0148 (on the Store Help sheet).
// ============================================================

export const STOREHELP = {
  breakage: {
    headline: 'ONLINE ORDERS — CONNECTION LOST',
    posError: 'POS OFFLINE MODE — ERR E-1067 (WAN UNREACHABLE)',
    routerLights: ['PWR ●', 'WAN ○', 'WLAN ●', 'LAN1 ●'],
  },
  holdTime: '2 HOURS 47 MINUTES',
  email: {
    username: 'store4471@howiemail.net',
    password: 'Crust2009!',
  },

  // Searchable physical clues
  clues: {
    keyboardNote: 'pw: Pizza123!\n(DOESN\'T WORK ANYMORE. DENNIS CHANGED IT AFTER THE INCIDENT. ASK DENNIS. DO NOT ASK ABOUT THE INCIDENT.)',
    routerLabel: {
      title: 'NETGEAR N450 — PROPERTY OF STORE 4471',
      ssid: 'HHOWIES-4471',
      key: 'Crust4471!',
      sticker: 'DO NOT UNPLUG. THE ORANGE LIGHT IS NORMAL. (the orange light is not normal)',
    },
    binderNote:
      'IT STUFF — email password is the wifi password but swap the store number for the year we opened. if you don\'t know the year we opened, it\'s on the wall. you walk past it every day. — D',
    plaque: 'PROUDLY SERVING FLAT ROCK SINCE 2009',
    helpSheet: {
      title: 'STORE HELP — ESCALATION PROCEDURE (rev. 2019)',
      lines: [
        'PHONE: 1-800-555-0199 (avg hold: yes)',
        'EMAIL: storehelp@hhcorp-support.example',
        'STORE ACCOUNT: store4471@howiemail.net',
        'STORE CALLBACK LINE: (734) 555-0148',
        'INCLUDE OR THEY WILL NOT READ IT: store number, the exact error code on screen, a callback number.',
      ],
    },
  },

  composeAnswer: {
    store: '4471',
    errorCode: 'E-1067',
    callback: '(734) 555-0148',
  },
  composeOptions: {
    store: ['4471', '4417', '1067', '2009'],
    errorCode: ['E-1067', 'E-4471', 'WAN-450', 'ERR-2009'],
    callback: ['(734) 555-0148', '1-800-555-0199', '(734) 555-4471', 'the store doesn\'t know its own number'],
  },

  hints: [
    'The old password under the keyboard is dead, but the binder says the new one is built from the Wi-Fi password. Find the router.',
    'Wi-Fi key is Crust4471!. The binder says to swap the store number for the year the store opened — which is on the wall plaque.',
  ],
};

// ---------- THE INBOX ----------
// Some of these matter in Step 7. Don't reorganize casually:
// - 'alarm'   -> alarm code 2461
// - 'payroll' -> terminated employees must be clocked out manually
// - 'sysco'   -> 40-count dough tray target
export const INBOX = [
  {
    id: 'storehelp_auto',
    from: 'Store Help <storehelp@hhcorp-support.example>',
    subject: 'AUTO-REPLY: Ticket requirements',
    time: '11:12 PM',
    unread: true,
    body: [
      'Thank you for contacting Store Help.',
      'Tickets missing ANY of the following are closed without review:',
      '• Store number',
      '• Exact error code displayed on the device',
      '• Callback number',
      'Current queue position: 41.',
      'This mailbox is monitored Monday–Thursday.',
    ],
  },
  {
    id: 'alarm',
    from: 'Dennis Foltz <dfoltz@howiemail.net>',
    subject: 'new alarm code (do not share) (do not write down)',
    time: 'Tue 9:41 AM',
    body: [
      'Alarm code changed because Brittany quit and she "knows things."',
      'New code: 2461.',
      'Arm it to AWAY, you have 60 seconds, walk out the FRONT. The back door counts as a "zone fault" and I get a call at 6 AM.',
      'Deleting this email after you read it. (I will not.)',
    ],
  },
  {
    id: 'payroll',
    from: 'HH Payroll <no-reply@hhcorp.example>',
    subject: 'REMINDER: Pay period closes Sunday',
    time: 'Mon 6:00 AM',
    body: [
      'Managers: approve labor before end-of-night close.',
      'NOTE: Terminated or separated employees remain on the active labor report until MANUALLY clocked out in POS (LABOR > punch > END SHIFT). The closeout will not process with an open punch.',
      'This has been the number one closeout support call for 11 consecutive years.',
    ],
  },
  {
    id: 'sysco',
    from: 'Sysco Detroit <orders@sysco.example>',
    subject: 'Order confirmation #88-41207 — Delivery Wed',
    time: 'Wed 4:15 AM',
    body: [
      'FLOUR HI-GLUTEN 50LB × 6',
      'MOZZ SHRED 20LB × 8',
      'PEPPERONI SLICED 12.5LB × 4',
      'DOUGH TRAYS (LEXAN, 40-BALL PREP STANDARD) × 2',
      'CUP PORTION 8OZ SLV × 10',
      'DRIVER NOTE: gate code still wrong. left it all by the dumpster again.',
    ],
  },
  {
    id: 'complaint',
    from: 'CustomerVoice <feedback@hhcorp.example>',
    subject: 'Customer feedback — Store 4471 (1 of 2)',
    time: 'Thu 2:12 PM',
    body: [
      'Rating: 1/5',
      '"Your driver parked in my yard. Not the driveway. The yard. He said the driveway \'had a vibe.\' Pizza was fine."',
      'Corporate response required within 48 hours. Response drafted by Dennis: "We have spoken to the driver about vibes."',
      'Status: CLOSED — RESOLVED.',
    ],
  },
  {
    id: 'schedule',
    from: 'Dennis Foltz <dfoltz@howiemail.net>',
    subject: 'FW: this week',
    time: 'Fri 3:22 PM',
    body: [
      'Maria — posted the new schedule. Changes in pen are final.',
      'Told Jake Friday NOT to come in Saturday, we were over on labor. If he shows up anyway pay him, if he doesn\'t, that\'s what I told him to do, so nobody write him up for it.',
      'Also the walk-in is doing the noise again. If it stops making the noise, THAT\'S when we worry.',
    ],
  },
  {
    id: 'foodsafety',
    from: 'HH Corporate <ops@hhcorp.example>',
    subject: 'Q3 Food Safety Module 7 — OVERDUE',
    time: 'Fri 9:00 AM',
    body: [
      'The following team members have not completed Module 7 (Cooling Curves):',
      '• All of them',
      'Module 7 takes approximately 45 minutes and must be completed on the back office computer, which we are aware does not currently turn on.',
    ],
  },
  {
    id: 'farewell',
    from: 'Gary Wisniewski <gwiz1971@personal.example>',
    subject: '(no subject)',
    time: 'Mar 12',
    body: [
      'To whoever gets the store after me,',
      'The safe sticks. Lift the handle UP while you turn it.',
      'The oven runs 15 degrees hot on the left side. Nobody believes me.',
      'The vacuum guy next door is going to ask for quarters. It\'s easier to just give him the quarters.',
      'I was going to write more but honestly it\'s all in the binder.',
      '— Gary',
    ],
  },
];

export const TICKET_CREATED_TEXT = 'TICKET CREATED — #HH-77012. A technician will respond in the order it was received.';
