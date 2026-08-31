import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { sfx } from '../sound.js';
import { OPENING, ENVELOPE, TICKET } from '../data/trials.js';
import { Logo } from './art.jsx';

// One continuous scene. The card never swaps screens — it is the same
// element the whole way, sliding out of the envelope and coming forward.
// Stages: idle -> break -> open -> rise -> hero
const STAGE_AT = { break: 0, open: 380, rise: 980, hero: 1820 };

function TicketFace({ shown }) {
  return (
    <div className={'gt-inner' + (shown ? ' shown' : '')}>
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
  );
}

export default function Envelope() {
  const { state, dispatch } = useGame();
  const alreadyOpened = state.phase === 'invitation';

  const [stage, setStage] = useState(alreadyOpened ? 'hero' : 'idle');
  const [pull, setPull] = useState(0); // 0..1 while dragging the seal
  const drag = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // A reset can happen while this component is already mounted (from the
  // invitation screen), so follow the phase back to the start.
  useEffect(() => {
    if (state.phase === 'envelope' && stage !== 'idle') {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setPull(0);
      setStage('idle');
    }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const runReveal = () => {
    const at = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    setStage('break');
    sfx.waxCrack();
    at(() => { setStage('open'); sfx.flapOpen(); }, STAGE_AT.open);
    at(() => { setStage('rise'); sfx.cardSlide(); }, STAGE_AT.rise);
    at(() => {
      setStage('hero');
      sfx.shimmer();
      dispatch({ type: 'PHASE', phase: 'invitation' });
    }, STAGE_AT.hero);
  };

  // --- pull the wax seal to break it ---
  const sealDown = (e) => {
    if (stage !== 'idle') return;
    e.preventDefault();
    e.stopPropagation();
    // Capture, or the drag dies the moment the finger leaves the seal —
    // which is almost immediately, since the seal is only 74px across.
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not supported */ }
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const sealMove = (e) => {
    if (!drag.current || stage !== 'idle') return;
    e.preventDefault();
    const d = Math.hypot(e.clientX - drag.current.x, e.clientY - drag.current.y);
    const p = Math.min(1, d / 64);
    setPull(p);
    if (p >= 1) { drag.current = null; runReveal(); }
  };
  const sealUp = (e) => {
    try { e?.currentTarget?.releasePointerCapture?.(e.pointerId); } catch { /* already released */ }
    drag.current = null;
    if (stage === 'idle') setPull(0);
  };

  const opened = stage !== 'idle' && stage !== 'break';

  return (
    <div className={'reveal-scene stage-' + stage}>
      <div className="spotlight" />
      <div className="motes" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} style={{ '--x': `${(i * 6.3) % 100}%`, '--d': `${(i % 8) * 1.4}s`, '--s': `${9 + (i % 5) * 3}s` }} />
        ))}
      </div>

      {stage === 'idle' && (
        <div className="reveal-copy">
          <div className="lucky-eyebrow">{OPENING.eyebrow}</div>
          <div className="chosen-text">{OPENING.chosen}</div>
          <div className="lucky-sub">{OPENING.subline}</div>
        </div>
      )}

      <div className="reveal-stage">
        {/* The envelope is split in two so the card can sit BETWEEN its
            layers. A single wrapper would create one stacking context and
            the card would paint over the whole thing, seal included. */}
        <div className="env-behind">
          <div className="env-back"><span className="env-liner" /></div>
        </div>

        {/* the card — one element from envelope to hand */}
        <div className="gticket">
          <div className="gt-foil" />
          <div className="gt-guilloche" />
          <TicketFace shown={stage === 'hero'} />
          <div className="gt-notch l" />
          <div className="gt-notch r" />
        </div>

        <div className="env-front">
          {/* front pocket, drawn over the card so it clips as it slides out */}
          <div className="env-pocket">
            <div className="env-face">
              <span className="env-stamp">
                <Logo width={30} />
                <i>{ENVELOPE.stampValue}</i>
              </span>
              <span className="env-postmark">
                <b>{ENVELOPE.postmark.city}</b>
                <i>{ENVELOPE.postmark.date}</i>
              </span>
              <span className="env-address">
                <em>{ENVELOPE.addressedTo}</em>
                <b>{ENVELOPE.addressLine}</b>
              </span>
            </div>
          </div>

          {/* flap, liner showing on its underside once open */}
          <div className="env-flap">
            <div className="env-flap-front" />
            <div className="env-flap-back"><span className="env-liner" /></div>
          </div>

          {/* shards keep falling while the flap opens */}
          {stage === 'idle' || stage === 'break' || stage === 'open' ? (
            <div
              className={'wax-seal' + (stage === 'break' || stage === 'open' ? ' broken' : '')}
              style={stage === 'idle' ? { transform: `translate(-50%,-50%) translateY(${pull * 9}px) scale(${1 + pull * 0.06})` } : undefined}
              onPointerDown={sealDown}
              onPointerMove={sealMove}
              onPointerUp={sealUp}
              onPointerCancel={sealUp}
            >
              <span className="wax-face" />
              {[0, 1, 2, 3, 4].map((i) => (
                <span className={'wax-shard s' + i} key={i} />
              ))}
              <span className="wax-mono">HH</span>
              <span className="wax-crack" style={{ opacity: pull, transform: `scaleY(${0.3 + pull})` }} />
            </div>
          ) : null}
        </div>
      </div>

      {stage === 'idle' && <div className="seal-hint">{OPENING.sealHint}</div>}

      {stage === 'hero' && (
        <button className="btn primary reveal-cta" onClick={() => { sfx.punch(); dispatch({ type: 'BEGIN' }); }}>
          {TICKET.cta}
        </button>
      )}
    </div>
  );
}
