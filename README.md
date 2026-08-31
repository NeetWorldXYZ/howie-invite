# The Hungry Homies — Initiation

A gold-foil Hungry Howie's golden ticket that makes the recipient work through
five hands-on trials before the fantasy football league invite is revealed.
Mobile-first, ~5 minutes. Every trial is a physical interaction, not a puzzle.

| # | Trial | What you do | The turn |
| --- | --- | --- | --- |
| 1 | The Machine | drag the lever to pull the slot handle | it only ever hits on MAX BET — then three middle fingers |
| 2 | Make One Pizza | smear sauce, sprinkle cheese, tap pepperoni | order is enforced; it tells you off if you skip ahead |
| 3 | The Balloon Wall | flick darts at a fairground wall | one balloon holds a slip of paper; the rest recede |
| 4 | Delivery | drag the Howie's car through a street maze | ends at the house, which becomes the door |
| 5 | The Door | knock three times, answer through the door | "How many oz is an All Corners dough ball?" — 11 |

The paper in trial 3 is Howie's Book of Records: **Kory & Jason, Dough Champs**.
It has to be acknowledged before you can move on.

Correct answer at the door opens it into confetti, the welcome, and the league link.

## Run it

```bash
npm install
npm run dev        # local dev
npm run build      # production build -> dist/
npm run preview    # serve the build
```

Deploy `dist/` anywhere static (Vercel, Netlify, GitHub Pages — `base: './'`
is already set).

## Configure the league invite link

Edit `src/config.js` (`LEAGUE_INVITE_URL`) or set at build time:

```bash
VITE_LEAGUE_INVITE_URL="https://fantasy.example/join/..." npm run build
```

The URL is never rendered anywhere until the shift is fully complete.

## Dev / testing mode

```bash
VITE_DEV_MODE=true npm run dev
```

(or `localStorage.setItem('hh_dev','1')` in the console.) Adds a DEV panel:
jump to any trial, skip the current one, reset, inspect saved state.
Never visible to normal players.

## Verification

```bash
npm run build && npx vite preview --port 4173
node scripts/playthrough.mjs   # Playwright E2E driving REAL gestures: tears the
                               # envelope, pulls the slot lever (asserts min bet
                               # loses and MAX BET lands 3 fingers), sauces/cheeses/
                               # peps the pizza, flicks darts until the paper drops,
                               # BFS-solves and drives the maze, knocks, answers 11.
                               # Also checks refresh persistence and finale gating.
node scripts/screens.mjs       # screenshots every trial for visual QA
```

## Where things live

| Path | What |
| --- | --- |
| `src/config.js` | league invite URL, dev mode, branding |
| `src/data/trials.js` | ALL copy, jokes, and tuning numbers for every trial. Change content here, not in components. |
| `src/persistence.js` | storage adapter. Implement the same 5-method interface with Supabase and swap it in `createStorage()` to add the shared leaderboard — game code doesn't change. Invite tokens read from `?t=`. |
| `src/GameContext.jsx` | game state, stats tracking, autosave |
| `src/components/trials/` | one component per trial (T1Slot … T5Door) |
| `src/components/art.jsx` | logo, middle finger, slot symbols, delivery car |
| `src/assets/howies-logo.png` | official logo, white background knocked out, inlined at build |
| `src/sound.js` | WebAudio-synthesized SFX (no assets), mute routes through one gain |

## Tuning it

Copy and numbers all live in `src/data/trials.js`: the slot taunts and bet
levels, pizza coverage thresholds, balloon count, the Book of Records note,
the maze grid (`'#'` building, `'.'` road, `S` store, `H` house), and the door
question and answer. No component changes needed.

The maze is validated as solvable by the playthrough, which BFS-solves it
before driving — edit the grid freely and the test will catch a walled-off house.
