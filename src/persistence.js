// ============================================================
// PERSISTENCE / DATA LAYER
// ------------------------------------------------------------
// The game only ever talks to `storage` (the adapter interface).
// To add a shared leaderboard later, implement the same interface
// backed by Supabase and swap it in `createStorage()` — nothing in
// the game code needs to change.
//
// Adapter interface:
//   loadGame():            saved game state object | null
//   saveGame(state):       persist game state
//   clearGame():           wipe saved game state
//   submitResult(result):  record a finished run (leaderboard row)
//   getResults():          Promise<result[]> — for a future leaderboard view
//
// A finished-run `result` looks like:
//   { name, token, completed, completionMs, score, grade,
//     hintsUsed, stats: {...perPuzzleAttempts}, dateCompleted }
// ============================================================

const SAVE_KEY = 'hh_shift_save_v1';
const RESULTS_KEY = 'hh_shift_results_v1';

class LocalStorageAdapter {
  loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  saveGame(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / private mode — game still works, just won't persist */
    }
  }

  clearGame() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch { /* ignore */ }
  }

  async submitResult(result) {
    try {
      const all = JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
      all.push(result);
      localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
    return { ok: true, local: true };
  }

  async getResults() {
    try {
      return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
    } catch {
      return [];
    }
  }
}

// --- Supabase adapter (future) -------------------------------
// class SupabaseAdapter {
//   constructor(client) { this.client = client; }
//   ...same five methods; saveGame/loadGame keyed by invite token
//   from the URL (?t=<token>), submitResult -> insert into `runs`.
// }

export function createStorage() {
  return new LocalStorageAdapter();
}

export const storage = createStorage();

// Invite token from the URL — reserved for the future shared
// leaderboard (unique invite links). Safe to ignore for now.
export function getInviteToken() {
  try {
    return new URLSearchParams(window.location.search).get('t') || null;
  } catch {
    return null;
  }
}
