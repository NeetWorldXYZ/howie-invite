import React, { useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { TRIALS } from '../data/trials.js';

// Only rendered when DEV_MODE is true (see config.js).
export default function DevPanel() {
  const { state, dispatch, reset, advance } = useGame();
  const [open, setOpen] = useState(false);
  const [showState, setShowState] = useState(false);

  if (!open) return <button className="dev-fab" onClick={() => setOpen(true)}>DEV</button>;

  return (
    <div className="devpanel">
      <div className="dev-row" style={{ justifyContent: 'space-between' }}>
        <b>DEV — {state.phase} / trial {state.trial}</b>
        <button onClick={() => setOpen(false)}>close</button>
      </div>
      <div className="dev-row">
        <button onClick={() => dispatch({ type: 'GOTO', trial: 0 })}>envelope</button>
        {TRIALS.map((t, i) => (
          <button key={t.id} onClick={() => dispatch({ type: 'GOTO', trial: i + 1 })}>{i + 1} {t.label}</button>
        ))}
        <button onClick={() => dispatch({ type: 'GOTO', trial: 7 })}>finale</button>
      </div>
      <div className="dev-row">
        <button onClick={advance}>skip current</button>
        <button onClick={reset}>reset</button>
        <button onClick={() => setShowState((v) => !v)}>state</button>
      </div>
      {showState && <pre>{JSON.stringify(state, null, 1)}</pre>}
    </div>
  );
}
