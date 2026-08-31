import React, { useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { sfx } from '../sound.js';
import Binder from './Binder.jsx';

export default function Hud() {
  const { state, dispatch, reset } = useGame();
  const [menuOpen, setMenuOpen] = useState(false);
  const [binderOpen, setBinderOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const anyBinder = Object.values(state.binder).some(Boolean);

  return (
    <>
      <div className="hud">
        <div className="hud-progress">
          SHIFT PROGRESS<br /><b>{state.step} / 7</b>
        </div>
        <div className="hud-actions">
          {anyBinder && (
            <button className="hud-btn" onClick={() => { sfx.paper(); setBinderOpen(true); }}>
              BINDER
            </button>
          )}
          <button
            className="hud-btn"
            onClick={() => { dispatch({ type: 'MUTE', muted: !state.muted }); if (state.muted) sfx.tap(); }}
            aria-label="Toggle sound"
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
              Reset shift
            </button>
          ) : (
            <>
              <button className="danger" onClick={() => { reset(); setConfirmReset(false); }}>
                Yes — start over from nothing
              </button>
              <button onClick={(e) => { e.stopPropagation(); setConfirmReset(false); setMenuOpen(false); }}>
                No, keep my shift
              </button>
            </>
          )}
        </div>
      )}

      <Binder open={binderOpen} onClose={() => setBinderOpen(false)} />
    </>
  );
}
