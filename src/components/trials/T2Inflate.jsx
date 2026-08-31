import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { INFLATE } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Press and hold. The gauge never says stop in a way you should believe.
export default function T2Inflate() {
  const { advance, stat } = useGame();
  const [psi, setPsi] = useState(0);
  const [popped, setPopped] = useState(false);
  const [holding, setHolding] = useState(false);
  const raf = useRef(0);
  const held = useRef(false);
  const last = useRef(0);
  const hiss = useRef(0);

  const stopHold = () => {
    held.current = false;
    setHolding(false);
    cancelAnimationFrame(raf.current);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const startHold = (e) => {
    e.preventDefault();
    if (popped || held.current) return;
    held.current = true;
    setHolding(true);
    last.current = performance.now();
    const tick = (now) => {
      if (!held.current) return;
      const dt = (now - last.current) / 1000;
      last.current = now;
      setPsi((p) => {
        const next = p + dt * 9.5;
        if (now - hiss.current > 120) { hiss.current = now; sfx.hiss(); }
        if (next >= INFLATE.popAt) {
          held.current = false;
          setHolding(false);
          setPopped(true);
          sfx.pop();
          stat('maxPsi', INFLATE.popAt);
          stat('popped', true);
          return INFLATE.popAt;
        }
        stat('maxPsi', next);
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const stage = [...INFLATE.stages].reverse().find((s) => psi >= s.at) || INFLATE.stages[0];
  const size = 96 + Math.min(psi, INFLATE.popAt) * 4.4;
  const strain = Math.min(1, psi / INFLATE.popAt);

  if (popped) {
    return (
      <div className="trial">
        <header className="trial-head">
          <div className="trial-kicker">{INFLATE.title}</div>
          <h2 className="trial-title">{INFLATE.popText}</h2>
        </header>
        <div className="pop-scene">
          <div className="pop-burst">
            {Array.from({ length: 14 }, (_, i) => (
              <span key={i} className="shred" style={{ '--a': `${(360 / 14) * i}deg`, '--d': `${70 + (i % 4) * 26}px` }} />
            ))}
          </div>
          <div className="pop-psi">{INFLATE.popAt} PSI</div>
          <p className="trial-note">{INFLATE.popSub}</p>
          <div className="slip">{INFLATE.slip}</div>
        </div>
        <button className="btn primary block" onClick={() => { sfx.paper(); advance(); }}>
          {INFLATE.cta}
        </button>
      </div>
    );
  }

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{INFLATE.title}</div>
        <h2 className="trial-title">{INFLATE.sub}</h2>
      </header>

      <div className="gauge">
        <div className="gauge-psi">{psi.toFixed(1)}<small>PSI</small></div>
        <div className="gauge-bar">
          <div className="gauge-fill" style={{ width: `${(psi / INFLATE.popAt) * 100}%` }} />
          <div className="gauge-reg" style={{ left: `${(12.5 / INFLATE.popAt) * 100}%` }} />
        </div>
        <div className={'gauge-msg ' + stage.tone}>{stage.text}</div>
      </div>

      <div
        className={'inflate-stage' + (holding ? ' pumping' : '')}
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
      >
        <div
          className="ego"
          style={{
            width: size,
            height: size * (1 - strain * 0.1),
            filter: `saturate(${1 + strain})`,
            animationDuration: `${Math.max(0.12, 0.7 - strain * 0.55)}s`,
          }}
        >
          <span className="ego-face">HH</span>
        </div>
        <div className="hold-hint">{holding ? '' : INFLATE.hint}</div>
      </div>
    </div>
  );
}
