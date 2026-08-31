import React, { useRef, useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { sfx } from '../sound.js';
import { OPENING, TICKET } from '../data/trials.js';
import { Logo } from './art.jsx';

export default function Envelope() {
  const { state, dispatch } = useGame();
  const [tear, setTear] = useState(0);
  const [opening, setOpening] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const ripAt = useRef(0);

  // ---------- the golden ticket ----------
  if (state.phase === 'invitation') {
    return (
      <div className="envelope-scene">
        <div className="gticket">
          <div className="gt-foil" />
          <div className="gt-guilloche" />
          <div className="gt-inner">
            <div className="gt-row">
              <span className="gt-admit">{TICKET.admit}</span>
              <span className="gt-serial">{TICKET.serial}</span>
            </div>
            <div className="gt-logo"><Logo width={168} /></div>
            <div className="gt-kicker">{TICKET.kicker}</div>
            <div className="gt-league">{TICKET.league}</div>
            <div className="gt-sub">{TICKET.sub}</div>
            <div className="gt-year">{TICKET.year}</div>
            <div className="gt-rule" />
            <p className="gt-body">{TICKET.body}</p>
            <p className="gt-fine">{TICKET.fine}</p>
          </div>
          <div className="gt-notch l" />
          <div className="gt-notch r" />
        </div>
        <button className="btn primary" onClick={() => { sfx.punch(); dispatch({ type: 'BEGIN' }); }}>
          {TICKET.cta}
        </button>
        <div style={{ height: 24 }} />
      </div>
    );
  }

  // ---------- the envelope ----------
  const finish = () => {
    if (opening) return;
    setOpening(true);
    sfx.paper();
    setTimeout(() => sfx.shimmer(), 620);
    setTimeout(() => dispatch({ type: 'PHASE', phase: 'invitation' }), 1750);
  };

  const down = (e) => { if (!opening) { dragging.current = true; startX.current = e.clientX; } };
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
        <div className="env-letter"><div className="env-letter-glow" /></div>
        <div className="env-pocket">
          <div className="env-emboss"><Logo width={74} /></div>
        </div>
        <div className="env-flap" style={{ transform: opening ? undefined : `rotateX(${tear * 168}deg)` }}>
          <div className="env-flap-front" />
          <div className="env-flap-back" />
        </div>
        <div className="env-seal" style={{ opacity: opening ? 0 : 1 - tear }}>
          <span className="env-seal-mono">HH</span>
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
