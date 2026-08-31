# The Hungry Homies — Shift

An absurdly prestigious golden invitation that makes the recipient complete one
full shift at a pizza store before their fantasy football league invite is
revealed. Mobile-first, ~15–25 minutes.

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
jump to any step, reset, reveal every solution, auto-complete the current
step, inspect saved state. Never visible to normal players.

## Verification

```bash
npm run verify                 # 38 data checks: every puzzle solvable,
                               # the $37.84 ledger reconciles to the cent,
                               # all Step 7 clues obtainable earlier
node scripts/playthrough.mjs   # full Playwright E2E: solves every puzzle,
                               # tests failure paths, refresh persistence,
                               # and finale gating (build + `npm run preview` first)
```

## Where things live

| Path | What |
| --- | --- |
| `src/config.js` | invite URL, dev mode, store identity |
| `src/data/*.js` | ALL puzzle content — riddles, ledger, emails, Jake's file, jokes. Change content here, not in components. Each file documents its solution at the top. |
| `src/persistence.js` | storage adapter. Implement the same 5-method interface with Supabase and swap it in `createStorage()` to add the shared leaderboard — game code doesn't change. Invite tokens read from `?t=`. |
| `src/GameContext.jsx` | game state, stats tracking, autosave |
| `src/components/steps/` | one component per shift step |
| `src/components/docs.jsx` | shared document renderers (inbox, employee file, ledgers) used by steps AND the manager binder |
| `src/sound.js` | WebAudio-synthesized SFX (no assets), mute routes through one gain |

## Spoilers (solutions)

Every `src/data/*.js` file has the answer in its header comment. Short form:
PIN **1517** · dough **16.0 oz ±0.5** · pizza per ticket (LT sauce on LG = 4 oz
ladle, XCHZ = 4 cups, half A = left) · shortage = **order 1113 voided after the
card settled, re-rung as cash** · email pw **Crust2009!** · fire Jake for the
**8/26 comps after the signed 8/12 final warning** · deposit **$183.69** ·
alarm **2461** · waste = your own remake count · dough standard **40 @ 16.0 oz**
· Jake never clocked out — end his punch with your own manager PIN.
