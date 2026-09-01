import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { KEY } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Three dough balls, one key, a shuffle that gets faster. Then the box
// the key opens, and the scrap of paper inside it.
export default function T5Key() {
  const { advance, stat } = useGame();

  // slot -> which ball index sits in each of the 3 table positions
  const [order, setOrder] = useState([0, 1, 2]);
  const [keyBall] = useState(() => Math.floor(Math.random() * 3));
  const [phase, setPhase] = useState('peek'); // peek | shuffling | pick | got | chest | note
  const [lifted, setLifted] = useState(true);
  const [wrongs, setWrongs] = useState(0);
  const [msg, setMsg] = useState('');
  const [chestOpen, setChestOpen] = useState(false);
  const timers = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clearTimers, []);
  const at = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const startRound = () => {
    clearTimers();
    setPhase('peek');
    setLifted(true);
    setMsg('');
    at(() => { setLifted(false); sfx.slap(); runShuffle(); }, 1500);
  };

  useEffect(() => { startRound(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runShuffle = () => {
    setPhase('shuffling');
    let i = 0;
    const stepOnce = () => {
      // ease from slow to fast across the whole sequence
      const t = i / (KEY.swaps - 1);
      const gap = KEY.startMs + (KEY.endMs - KEY.startMs) * t;
      setOrder((o) => {
        const a = Math.floor(Math.random() * 3);
        let b = Math.floor(Math.random() * 3);
        while (b === a) b = Math.floor(Math.random() * 3);
        const n = [...o];
        [n[a], n[b]] = [n[b], n[a]];
        return n;
      });
      sfx.swap();
      i += 1;
      if (i < KEY.swaps) at(stepOnce, gap);
      else at(() => setPhase('pick'), gap + 120);
    };
    at(stepOnce, 260);
  };

  const pick = (slot) => {
    if (phase !== 'pick') return;
    const ball = order[slot];
    if (ball === keyBall) {
      sfx.keyJingle();
      setPhase('got');
      setMsg(KEY.right);
      stat('keyWrongs', wrongs);
    } else {
      sfx.deny();
      const w = wrongs + 1;
      setWrongs(w);
      setMsg(KEY.wrong[Math.min(w - 1, KEY.wrong.length - 1)]);
      at(startRound, 1400);
      setPhase('shuffling'); // lock input while it resets
    }
  };

  // ---------- the box ----------
  if (phase === 'chest' || phase === 'note') {
    const n = KEY.note;
    if (phase === 'note') {
      return (
        <div className="trial">
          <header className="trial-head">
            <div className="trial-kicker">{KEY.chest.title}</div>
            <h2 className="trial-title">{KEY.chest.opened}</h2>
          </header>
          <div className="scrap">
            <div className="scrap-head">{n.heading}</div>
            {n.lines.map((l, i) => (
              <div key={i} className={'scrap-line ' + l[0]}>{l[1]}</div>
            ))}
            <div className="scrap-foot">{n.footer}</div>
          </div>
          <button className="btn primary block" onClick={() => { sfx.paper(); advance(); }}>
            {KEY.chest.cta}
          </button>
        </div>
      );
    }
    return (
      <div className="trial">
        <header className="trial-head">
          <div className="trial-kicker">{KEY.chest.title}</div>
          <h2 className="trial-title">{KEY.chest.sub}</h2>
        </header>
        <div className="chest-stage">
          <div className={'chest' + (chestOpen ? ' open' : '')}>
            <div className="chest-lid">
              <span className="chest-face" />
              <span className="chest-band" />
            </div>
            <div className="chest-body">
              <span className="chest-band" />
              <button
                className="chest-lock"
                onClick={() => {
                  if (chestOpen) return;
                  sfx.chestOpen();
                  setChestOpen(true);
                  at(() => setPhase('note'), 1400);
                }}
              >
                <i />
              </button>
            </div>
            <div className="chest-glow" />
          </div>
          {!chestOpen && <div className="drive-cue">{KEY.chest.hint}</div>}
        </div>
      </div>
    );
  }

  // ---------- the shuffle ----------
  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{KEY.title}</div>
        <h2 className="trial-title">
          {phase === 'peek' ? KEY.intro
            : phase === 'shuffling' ? (msg || KEY.watching)
            : phase === 'pick' ? KEY.picking
            : msg}
        </h2>
      </header>

      <div className="shuffle-table">
        {[0, 1, 2].map((slot) => {
          const ball = order[slot];
          const showKey = lifted && ball === keyBall;
          const revealed = phase === 'got' && ball === keyBall;
          return (
            <button
              key={ball}
              className={'dough-slot' + (phase === 'pick' ? ' pickable' : '')}
              style={{ left: `${8 + slot * 33}%` }}
              onClick={() => pick(slot)}
              aria-label={`dough ${slot + 1}`}
            >
              {(showKey || revealed) && <span className="slot-key" />}
              <span className={'dough-ball' + (lifted && ball === keyBall ? ' up' : '') + (revealed ? ' up' : '')} />
              <span className="slot-num">{slot + 1}</span>
            </button>
          );
        })}
      </div>

      {phase === 'got' && (
        <button className="btn primary block" onClick={() => { sfx.tap(); setPhase('chest'); }}>
          {KEY.cta}
        </button>
      )}
    </div>
  );
}
