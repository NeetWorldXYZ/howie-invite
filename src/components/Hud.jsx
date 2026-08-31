import React, { useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { sfx } from '../sound.js';
import { TRIALS } from '../data/trials.js';

export default function Hud() {
  const { state, dispatch, reset } = useGame();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <div className="hud">
        <div className="hud-progress">
          INITIATION<br /><b>{state.trial} / {TRIALS.length}</b>
        </div>
        <div className="hud-actions">
          <button
            className="hud-btn"
            onClick={() => { dispatch({ type: 'MUTE', muted: !state.muted }); if (state.muted) sfx.tap(); }}
          >
            {state.muted ? 'MUTED' : 'SOUND'}
          </button>
          <button className="hud-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">⋯</button>
        </div>
      </div>

      {menuOpen && (
        <div className="hud-menu" onClick={() => setMenuOpen(false)}>
          {!confirmReset ? (
            <button className="danger" onClick={(e) => { e.stopPropagation(); setConfirmReset(true); }}>
              Start over
            </button>
          ) : (
            <>
              <button className="danger" onClick={() => { reset(); setConfirmReset(false); }}>
                Yes, start over
              </button>
              <button onClick={(e) => { e.stopPropagation(); setConfirmReset(false); setMenuOpen(false); }}>
                No
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
