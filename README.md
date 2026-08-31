# The Hungry Homies — Initiation

An absurdly prestigious golden invitation that makes the recipient survive a
six-trial initiation before their fantasy football league invite is revealed.
Mobile-first, ~5 minutes. Every trial is a physical gesture, not a puzzle.

| # | Trial | Gesture | The joke |
| --- | --- | --- | --- |
| 1 | Eligibility ticket | scratch the foil off | you win "consideration" |
| 2 | The Commissioner's ego | press and hold to inflate | it never says stop, it pops at 41 PSI |
| 3 | Draft night | mash to chug two beers | the whole app stays crooked afterward |
| 4 | Last place punishment | flick to spin | the Commissioner forces a re-spin |
| 5 | League covenant | draw your signature | you can only read the terms after signing |
| 6 | The seal | press and hold to stamp | — |

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
node scripts/playthrough.mjs   # Playwright E2E driving REAL gestures: drags the
                               # envelope open, scratches the foil, holds until the
                               # ego pops, mashes both beers, flicks the wheel twice,
                               # draws a signature, holds the stamp. Also checks
                               # refresh persistence and finale gating.
node scripts/screens.mjs       # screenshots every trial for visual QA
```

## Where things live

| Path | What |
| --- | --- |
| `src/config.js` | league invite URL, dev mode, branding |
| `src/data/trials.js` | ALL copy, jokes, and tuning numbers for every trial. Change content here, not in components. |
| `src/persistence.js` | storage adapter. Implement the same 5-method interface with Supabase and swap it in `createStorage()` to add the shared leaderboard — game code doesn't change. Invite tokens read from `?t=`. |
| `src/GameContext.jsx` | game state, stats tracking, autosave |
| `src/components/trials/` | one component per trial (T1Scratch … T6Seal) |
| `src/sound.js` | WebAudio-synthesized SFX (no assets), mute routes through one gain |

## Tuning it

Everything you'd want to change is copy or a number in `src/data/trials.js`:
punishments on the wheel, covenant terms, the escalating pressure-gauge taunts,
how many beers, `popAt` PSI, scratch `threshold`, signature `minStroke`, seal
`holdMs`. No component changes needed.
