import React, { useEffect, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { CHUG } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Mash to drink. The screen stays crooked afterward.
export default function T3Chug() {
  const { advance, stat, dispatch } = useGame();
  const [round, setRound] = useState(0);
  const [taps, setTaps] = useState(0);
  const [between, setBetween] = useState(false);
  const [done, setDone] = useState(false);

  const level = 1 - taps / CHUG.tapsPerBeer;

  useEffect(() => {
    dispatch({ type: 'DRUNK', value: round });
  }, [round, dispatch]);

  const drink = () => {
    if (between || done) return;
    sfx.gulp();
    const t = taps + 1;
    setTaps(t);
    if (t >= CHUG.tapsPerBeer) {
      const finished = round + 1;
      stat('beers', finished);
      sfx.burp();
      if (finished >= CHUG.rounds.length) {
        setDone(true);
        dispatch({ type: 'DRUNK', value: finished });
      } else {
        setBetween(true);
        setTimeout(() => { setRound(finished); setTaps(0); setBetween(false); }, 1700);
      }
    }
  };

  if (done) {
    return (
      <div className="trial">
        <header className="trial-head">
          <div className="trial-kicker">{CHUG.title}</div>
          <h2 className="trial-title">Two down.</h2>
        </header>
        <div className="bac-panel">
          <div className="bac-line">{CHUG.bacLine}</div>
          <p className="trial-note">{CHUG.rounds[CHUG.rounds.length - 1].done}</p>
        </div>
        <button className="btn primary block" onClick={() => { sfx.tap(); advance(); }}>
          {CHUG.cta}
        </button>
      </div>
    );
  }

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{CHUG.title}</div>
        <h2 className="trial-title">{CHUG.sub}</h2>
      </header>

      <div className="chug-stage" onPointerDown={drink}>
        <div className="glass">
          <div className="beer" style={{ height: `${Math.max(0, level) * 100}%` }}>
            <div className="foam" />
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="bubble" style={{ '--x': `${12 + i * 13}%`, '--dl': `${i * 0.42}s` }} />
            ))}
          </div>
          <div className="glass-shine" />
        </div>
        <div className="chug-label">{between ? 'ANOTHER.' : CHUG.rounds[round].label}</div>
        <div className="hold-hint">{between ? '' : CHUG.hint}</div>
      </div>
    </div>
  );
}
