import React, { useRef, useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { sfx } from '../sound.js';
import { LEAGUE_YEAR } from '../config.js';
import { OPENING, INVITATION } from '../data/trials.js';

export default function Envelope() {
  const { state, dispatch } = useGame();
  const [tear, setTear] = useState(0); // 0..1
  const [opening, setOpening] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const ripAt = useRef(0);

  if (state.phase === 'invitation') {
    return (
      <div className="envelope-scene">
        <div className="invitation-card">
          <div className="inv-kicker">{INVITATION.kicker}</div>
          <div className="inv-rule" />
          <p className="inv-fine">{INVITATION.fine}</p>
          <p>
            You have been selected for membership in the{' '}
            <span className="inv-strong">{LEAGUE_YEAR} Hungry Homies Fantasy Football League</span>.
          </p>
          <p className="inv-fine">{INVITATION.fine2}</p>
          <p>{INVITATION.body2}</p>
          <div className="inv-rule" />
          <p className="inv-strong" style={{ letterSpacing: '0.12em' }}>{INVITATION.closer}</p>
        </div>
        <button
          className="btn primary"
          onClick={() => { sfx.punch(); dispatch({ type: 'BEGIN' }); }}
        >
          {INVITATION.cta}
        </button>
        <div style={{ height: 30 }} />
      </div>
    );
  }

  const finish = () => {
    if (opening) return;
    setOpening(true);
    sfx.paper();
    setTimeout(() => sfx.chime(), 600);
    setTimeout(() => dispatch({ type: 'PHASE', phase: 'invitation' }), 1700);
  };

  const down = (e) => {
    if (opening) return;
    dragging.current = true;
    startX.current = e.clientX;
  };

  const move = (e) => {
    if (!dragging.current || opening) return;
    e.preventDefault();
    const w = e.currentTarget.getBoundingClientRect().width;
    const t = Math.max(0, Math.min(1, (e.clientX - startX.current) / (w * 0.72)));
    setTear(t);
    if (t > ripAt.current + 0.07) { ripAt.current = t; sfx.scrape(); }
    if (t >= 1) { dragging.current = false; finish(); }
  };

  const up = () => {
    dragging.current = false;
    if (!opening && tear < 1) { setTear(0); ripAt.current = 0; }
  };

  return (
    <div className="envelope-scene">
      <div className="lucky-eyebrow">{OPENING.eyebrow}</div>
      <div className="chosen-text">{OPENING.chosen}</div>
      <div className="lucky-sub">{OPENING.subline}</div>

      <div
        className={'envelope' + (opening ? ' open' : '')}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
      >
        <div className="env-body" />
        <div className="env-letter">
          <div className="env-letter-preview">OFFICIAL&nbsp;INVITATION</div>
        </div>
        <div className="env-pocket" />
        <div className="env-flap" style={{ transform: opening ? undefined : `rotateX(${tear * 168}deg)` }}>
          <div className="env-flap-front" />
          <div className="env-flap-back" />
        </div>
        <div className="env-seal" style={{ opacity: opening ? 0 : 1 - tear }}>
          <div className="env-seal-inner">
            HH
            <small>EST. FOREVER</small>
          </div>
        </div>
        {!opening && (
          <div className="tear-track" style={{ opacity: 1 - tear }}>
            <span className="tear-thumb" style={{ left: `${8 + tear * 74}%` }} />
          </div>
        )}
      </div>

      {!opening && <div className="tear-hint">{OPENING.tearHint}</div>}
    </div>
  );
}
