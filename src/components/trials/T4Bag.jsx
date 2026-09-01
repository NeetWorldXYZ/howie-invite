import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { BAG } from '../../data/trials.js';
import { Logo } from '../art.jsx';
import { sfx } from '../../sound.js';

// Fifteen seconds to box the order and get it in the hot bag, against a
// meter that drains the whole time.
export default function T4Bag() {
  const { advance } = useGame();
  const [filled, setFilled] = useState(0);
  const [left, setLeft] = useState(BAG.seconds);
  const [state, setState] = useState('ready'); // ready | going | won | lost
  const [fails, setFails] = useState(0);
  const raf = useRef(0);
  const start = useRef(0);
  const val = useRef(0);
  const tickAt = useRef(0);
  const won = useRef(false);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const win = () => {
    if (won.current) return;
    won.current = true;
    cancelAnimationFrame(raf.current);
    setState('won');
    sfx.chime();
    setTimeout(advance, 1100);
  };

  const run = () => {
    setState('going');
    val.current = 0;
    start.current = performance.now();
    const step = (now) => {
      const remain = Math.max(0, BAG.seconds - (now - start.current) / 1000);
      setLeft(remain);
      // check before draining, or the meter is always a hair short
      if (val.current >= BAG.need) { win(); return; }
      val.current = Math.max(0, val.current - BAG.decay * (1 / 60));
      setFilled(val.current);
      if (remain <= 5 && now - tickAt.current > 1000) { tickAt.current = now; sfx.beep(); }
      if (remain <= 0) {
        setState('lost'); sfx.deny();
        setFails((f) => f + 1);
        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  const tap = () => {
    if (state === 'ready') run();
    if (state !== 'going' && state !== 'ready') return;
    val.current = Math.min(BAG.need, val.current + BAG.perTap);
    setFilled(val.current);
    sfx.slap();
    if (val.current >= BAG.need) win();
  };

  const pct = Math.min(100, (filled / BAG.need) * 100);
  const boxes = Math.min(6, Math.floor((filled / BAG.need) * 6 + 0.001));
  const urgent = state === 'going' && left <= 5;

  return (
    <div className="trial loadout">
      <div className="run-hud">
        <Logo width={58} />
        <div className="run-order">
          <div className="run-num">ORDER {BAG.order.num}</div>
          <div className="run-items">{BAG.order.items}</div>
          <div className="run-addr">{BAG.order.addr}</div>
        </div>
      </div>

      <header className="trial-head">
        <div className="trial-kicker">{BAG.title}</div>
        <h2 className="trial-title">
          {state === 'won' ? BAG.success
            : state === 'lost' ? BAG.fails[Math.min(fails - 1, BAG.fails.length - 1)]
            : BAG.sub}
        </h2>
      </header>

      <div className={'lo-clock' + (urgent ? ' urgent' : '')}>
        {left.toFixed(2)}<small>S</small>
      </div>

      <div className="lo-meter"><div className="lo-meter-fill" style={{ width: `${pct}%` }} /></div>

      <div className="lo-stage" onPointerDown={tap}>
        <div className="lo-bag">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={'lo-box' + (i < boxes ? ' in' : '')} />
          ))}
          <span className="lo-bag-front">HOT BAG</span>
        </div>
        {state === 'ready' && <div className="drive-cue">{BAG.hint}</div>}
      </div>

      {state === 'lost' && (
        <button className="btn primary block" onClick={() => {
          won.current = false; setState('ready'); setFilled(0); setLeft(BAG.seconds); val.current = 0; sfx.tap();
        }}>{BAG.retry}</button>
      )}
    </div>
  );
}
