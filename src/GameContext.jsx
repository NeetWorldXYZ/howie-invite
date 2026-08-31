import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { storage } from './persistence.js';
import { setMuted } from './sound.js';

// phase: 'envelope' -> 'invitation' -> 'shift' (steps 1..7) -> 'finale'
const initialState = {
  phase: 'envelope',
  step: 1,
  startTime: null,
  endTime: null,
  muted: false,
  notes: '',
  stats: {
    hintsUsed: 0,
    clockinAttempts: 0,
    doughAccuracy: null,
    doughChoice: null, // 'keep_going' | 'fuck_this'
    makelineAttempts: 0,
    cashAttempts: 0,
    storeHelpAttempts: 0,
    jakeWrongPicks: 0,
    closingMistakes: 0,
    step4Done: false,
    step6Done: false,
  },
  // per-step scratch state so refreshing mid-step doesn't lose much
  stepData: {},
  // binder sections unlocked as the shift progresses
  binder: { sheets: false, drawer: false, inbox: false, jake: false },
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...initialState, ...action.state, stats: { ...initialState.stats, ...(action.state.stats || {}) } };
    case 'PHASE':
      return { ...state, phase: action.phase };
    case 'BEGIN_SHIFT':
      return { ...state, phase: 'shift', step: 1, startTime: state.startTime || Date.now() };
    case 'ADVANCE': {
      const next = state.step + 1;
      if (next > 7) return { ...state, phase: 'finale', endTime: state.endTime || Date.now() };
      return { ...state, step: next };
    }
    case 'GOTO': // dev only
      return action.step === 0
        ? { ...state, phase: 'envelope', step: 1 }
        : action.step === 8
          ? { ...state, phase: 'finale', endTime: state.endTime || Date.now(), startTime: state.startTime || Date.now() }
          : { ...state, phase: 'shift', step: action.step, startTime: state.startTime || Date.now() };
    case 'STAT': {
      const cur = state.stats[action.key];
      const val = action.set !== undefined ? action.set : (cur || 0) + (action.add ?? 1);
      return { ...state, stats: { ...state.stats, [action.key]: val } };
    }
    case 'STEP_DATA':
      return { ...state, stepData: { ...state.stepData, [action.key]: action.value } };
    case 'UNLOCK_BINDER':
      return { ...state, binder: { ...state.binder, [action.section]: true } };
    case 'NOTES':
      return { ...state, notes: action.value };
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
    stat: (key, opts = {}) => dispatch({ type: 'STAT', key, ...opts }),
    setStepData: (key, value) => dispatch({ type: 'STEP_DATA', key, value }),
    unlockBinder: (section) => dispatch({ type: 'UNLOCK_BINDER', section }),
    reset: () => { storage.clearGame(); dispatch({ type: 'RESET' }); },
  };

  return <GameCtx.Provider value={api}>{children}</GameCtx.Provider>;
}

export function useGame() {
  return useContext(GameCtx);
}
