import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { SEAL } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Press and hold. Pressure builds. It thunks.
export default function T6Seal() {
  const { advance } = useGame();
  const [progress, setProgress] = useState(0);
  const [stamped, setStamped] = useState(false);
  const raf = useRef(0);
  const held = useRef(false);
  const start = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const stop = () => {
    held.current = false;
    cancelAnimationFrame(raf.current);
    if (!stamped) setProgress(0);
  };

  const down = (e) => {
    e.preventDefault();
    if (stamped || held.current) return;
    held.current = true;
    start.current = performance.now();
    const tick = (now) => {
      if (!held.current) return;
      const p = Math.min(1, (now - start.current) / SEAL.holdMs);
      setProgress(p);
      if (p >= 1) {
        held.current = false;
        setStamped(true);
        sfx.seal();
        setTimeout(advance, 2000);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{SEAL.title}</div>
        <h2 className="trial-title">{stamped ? SEAL.doneText : SEAL.sub}</h2>
      </header>

      <div className="seal-stage">
        <div className="seal-doc">
          <div className="seal-doc-line long" />
          <div className="seal-doc-line" />
          <div className="seal-doc-line long" />
          <div className="seal-doc-line short" />
          <div
            className={'wax' + (stamped ? ' set' : '')}
            style={{ transform: `scale(${stamped ? 1 : 0.55 + progress * 0.5})`, opacity: stamped ? 1 : 0.25 + progress * 0.75 }}
            onPointerDown={down}
            onPointerUp={stop}
            onPointerLeave={stop}
            onPointerCancel={stop}
          >
            <span>HH</span>
          </div>
        </div>
        {!stamped && (
          <>
            <div className="press-bar"><div className="press-fill" style={{ width: `${progress * 100}%` }} /></div>
            <div className="hold-hint">{SEAL.hint}</div>
          </>
        )}
      </div>
    </div>
  );
}
