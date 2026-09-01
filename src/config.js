// ============================================================
// GAME CONFIGURATION
// ============================================================

// (guarded so plain Node scripts can also import this module)
const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};

// Paste the real fantasy football league invitation URL here (or set
// VITE_LEAGUE_INVITE_URL at build time). It is never rendered anywhere
// in the UI until the shift has been fully completed.
export const LEAGUE_INVITE_URL =
  env.VITE_LEAGUE_INVITE_URL ||
  'https://fantasy.espn.com/football/league/join?leagueId=184982086&inviteId=88f62777-562c-4e18-a833-ce5e56ed3640';

// Developer / testing mode. NEVER enabled for normal players.
// Enable with:  VITE_DEV_MODE=true npm run dev
// or in a pinch, from the browser console: localStorage.setItem('hh_dev','1')
export const DEV_MODE =
  env.VITE_DEV_MODE === 'true' ||
  (typeof localStorage !== 'undefined' && localStorage.getItem('hh_dev') === '1');

// League branding
export const LEAGUE_NAME = 'HOWIES FINEST';
export const LEAGUE_YEAR = '2026';

// Store identity — referenced across several puzzles. If you change the
// store number, re-check the clock-in PIN data in src/data/clockin.js.
export const STORE = {
  number: '4471',
  phone: '(734) 555-0148',
  address: '2216 Telegraph Rd',
  city: 'Flat Rock, MI',
  opened: '2009',
};
