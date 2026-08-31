import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { storage } from './persistence.js';
import { setMuted } from './sound.js';

// phase: 'envelope' -> 'invitation' -> 'trials' (1..5) -> 'finale'
const initialState = {
  phase: 'envelope',
  trial: 1,
  startTime: null,
  endTime: null,
  muted: false,
  stats: {
    pulls: 0,          // slot handle pulls before the jackpot
    jackpotOnPull: 0,
    darts: 0,          // darts thrown at the wall
    doorWrongs: 0,     // wrong answers at the door
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'PHASE':
      return { ...state, phase: action.phase };
    case 'BEGIN':
      return { ...state, phase: 'trials', trial: 1, startTime: state.startTime || Date.now() };
    case 'ADVANCE': {
      const next = state.trial + 1;
      if (next > 5) return { ...state, phase: 'finale', endTime: state.endTime || Date.now() };
      return { ...state, trial: next };
    }
    case 'GOTO': // dev only
      if (action.trial === 0) return { ...initialState };
      if (action.trial === 6) {
        return { ...state, phase: 'finale', startTime: state.startTime || Date.now() - 300000, endTime: Date.now() };
      }
      return { ...state, phase: 'trials', trial: action.trial, startTime: state.startTime || Date.now() };
    case 'STAT':
      return { ...state, stats: { ...state.stats, [action.key]: action.value } };
    case 'MUTE':
      return { ...state, muted: action.muted };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

const GameCtx = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const saved = storage.loadGame();
    const s = saved ? { ...init, ...saved, stats: { ...init.stats, ...(saved.stats || {}) } } : init;
    setMuted(!!s.muted);
    return s;
  });

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    storage.saveGame(state);
  }, [state]);

  useEffect(() => { setMuted(!!state.muted); }, [state.muted]);

  const api = {
    state,
    dispatch,
    advance: () => dispatch({ type: 'ADVANCE' }),
    stat: (key, value) => dispatch({ type: 'STAT', key, value }),
    reset: () => { storage.clearGame(); dispatch({ type: 'RESET' }); },
  };

  return <GameCtx.Provider value={api}>{children}</GameCtx.Provider>;
}

export function useGame() {
  return useContext(GameCtx);
}
