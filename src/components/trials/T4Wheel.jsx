import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { WHEEL } from '../../data/trials.js';
import { sfx } from '../../sound.js';

const N = WHEEL.segments.length;
const SEG = 360 / N;

// Flick it. It spins with friction. It lands where it lands.
// Then the Commissioner makes you do it again.
export default function T4Wheel() {
  const { advance, stat } = useGame();
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [reSpinOffered, setReSpinOffered] = useState(false);

  const raf = useRef(0);
  const vel = useRef(0);
  const drag = useRef(null);
  const tickAt = useRef(0);
  const angleRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const settle = (finalAngle) => {
    // pointer sits at top (-90deg); find which segment is under it
    const norm = ((-finalAngle - 90) % 360 + 360) % 360;
    const idx = Math.floor(norm / SEG) % N;
    const label = WHEEL.segments[idx];
    setResult(label);
    setSpinning(false);
    sfx.chime();
    const n = spinCount + 1;
    setSpinCount(n);
    if (n === 1) {
      stat('firstPunishment', label);
      setTimeout(() => setReSpinOffered(true), 1400);
    } else {
      stat('punishment', label);
    }
  };

  const run = () => {
    const step = () => {
      vel.current *= 0.986;
      angleRef.current += vel.current;
      setAngle(angleRef.current);
      const now = performance.now();
      if (Math.abs(vel.current) > 0.4 && now - tickAt.current > Math.max(38, 260 / Math.abs(vel.current))) {
        tickAt.current = now;
        sfx.click();
      }
      if (Math.abs(vel.current) < 0.12) {
        settle(angleRef.current);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  };

  const down = (e) => {
    if (spinning) return;
    const { cx, cy } = centerOf(e.currentTarget);
    drag.current = {
      cx, cy,
      a: Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI),
      t: performance.now(),
      v: 0,
    };
  };

  const move = (e) => {
    if (!drag.current || spinning) return;
    e.preventDefault();
    const d = drag.current;
    const a = Math.atan2(e.clientY - d.cy, e.clientX - d.cx) * (180 / Math.PI);
    let delta = a - d.a;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const now = performance.now();
    const dt = Math.max(8, now - d.t);
    d.v = delta / dt * 16;
    d.a = a;
    d.t = now;
    angleRef.current += delta;
    setAngle(angleRef.current);
  };

  const up = () => {
    if (!drag.current || spinning) return;
    const v = drag.current.v;
    drag.current = null;
    if (Math.abs(v) < 1.5) return; // too gentle to count as a flick
    vel.current = Math.max(-34, Math.min(34, v * 2.4));
    setSpinning(true);
    setResult(null);
    run();
  };

  const reSpin = () => {
    setReSpinOffered(false);
    setResult(null);
    setSpinning(true);
    vel.current = 26 + Math.random() * 8;
    run();
  };

  const locked = spinCount >= 2 && result && !spinning;

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{WHEEL.title}</div>
        <h2 className="trial-title">{WHEEL.sub}</h2>
      </header>

      <div className="wheel-wrap">
        <div className="wheel-pointer" />
        <div
          className="wheel"
          style={{ transform: `rotate(${angle}deg)` }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
        >
          {WHEEL.segments.map((s, i) => (
            <div
              className={'wheel-seg' + (i % 2 ? ' alt' : '')}
              key={i}
              style={{ transform: `rotate(${i * SEG}deg)` }}
            >
              <span style={{ transform: `rotate(${SEG / 2}deg)` }}>{s}</span>
            </div>
          ))}
          <div className="wheel-hub" />
        </div>
      </div>

      {!result && !spinning && <div className="hold-hint center">{WHEEL.hint}</div>}

      {result && !spinning && (
        <div className={'verdict' + (locked ? ' locked' : '')}>
          <div className="verdict-kicker">{locked ? WHEEL.finalNote : WHEEL.firstResultNote}</div>
          <div className="verdict-text">{result}</div>
        </div>
      )}

      {reSpinOffered && !spinning && (
        <div className="respin">
          <p className="trial-note">{WHEEL.reSpinPrompt}</p>
          <button className="btn danger block" onClick={reSpin}>{WHEEL.reSpinBtn}</button>
        </div>
      )}

      {locked && (
        <button className="btn primary block" onClick={() => { sfx.tap(); advance(); }}>
          {WHEEL.cta}
        </button>
      )}
    </div>
  );
}
