import React, { useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { sfx } from '../sound.js';
import { TRIALS } from '../data/trials.js';

export default function Hud() {
  const { state, dispatch, reset } = useGame();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const inTrials = state.phase === 'trials';
  const onLight = state.phase === 'finale'; // the finale artwork is bright

  return (
    <>
      <div className={'hud' + (inTrials ? '' : ' bare') + (onLight ? ' on-light' : '')}>
        <div className="hud-progress">
          {inTrials && <>INITIATION<br /><b>{state.trial} / {TRIALS.length}</b></>}
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
              Start over from the envelope
            </button>
          ) : (
            <>
              <button className="danger" onClick={() => { reset(); setConfirmReset(false); }}>
                Yes, wipe my progress
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
