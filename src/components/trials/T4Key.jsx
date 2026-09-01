import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { KEY } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Three dough balls, one key, a shuffle that gets faster — then the key
// floats up and the manager's office fades in around the wall safe.
function KeyArt({ className }) {
  return (
    <svg className={className} viewBox="0 0 44 96" aria-hidden="true">
      <defs>
        <linearGradient id="kg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e3a1" />
          <stop offset="0.5" stopColor="#e0bb4e" />
          <stop offset="1" stopColor="#a5811b" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="18" r="16" fill="url(#kg)" />
      <circle cx="22" cy="18" r="7" fill="var(--key-hole, #17130b)" />
      <rect x="17" y="30" width="10" height="54" rx="3" fill="url(#kg)" />
      <rect x="27" y="66" width="12" height="7" rx="2" fill="url(#kg)" />
      <rect x="27" y="77" width="9" height="7" rx="2" fill="url(#kg)" />
    </svg>
  );
}

export default function T4Key() {
  const { advance, stat } = useGame();

  // slot -> which ball index sits in each of the 3 table positions
  const [order, setOrder] = useState([0, 1, 2]);
  const [keyBall] = useState(() => Math.floor(Math.random() * 3));
  const [phase, setPhase] = useState('peek'); // peek | shuffling | pick | got | office | note
  const [lifted, setLifted] = useState(true);
  const [wrongs, setWrongs] = useState(0);
  const [msg, setMsg] = useState('');
  const [stage, setStage] = useState('enter'); // office: enter | ready | turn | open
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
      // no button — the key takes itself to the office
      at(() => {
        setPhase('office');
        setStage('enter');
        sfx.shimmer();
        at(() => setStage('ready'), 1700);
      }, 1200);
    } else {
      sfx.deny();
      const w = wrongs + 1;
      setWrongs(w);
      setMsg(KEY.wrong[Math.min(w - 1, KEY.wrong.length - 1)]);
      at(startRound, 1400);
      setPhase('shuffling'); // lock input while it resets
    }
  };

  const useKey = () => {
    if (stage !== 'ready') return;
    sfx.latch();
    setStage('turn');
    at(() => { sfx.chestOpen(); setStage('open'); }, 750);
  };

  // ---------- the manager's office ----------
  if (phase === 'office') {
    const s = KEY.safe;
    return (
      <div className={'office-scene ' + stage}>
        <div className="office-wall">
          <div className="office-panel" />
          <div className="office-plaque">{s.plaque}</div>
          <div className="office-cork">
            <i /><i /><i />
          </div>
          <div className="office-lamp" />
        </div>

        <div className="office-kicker">{s.kicker}</div>

        <div className={'safe' + (stage === 'open' ? ' open' : '')}>
          <div className="safe-inner">
            <button
              className="safe-paper"
              onClick={() => { sfx.paper(); setPhase('note'); }}
              aria-label={s.paperHint}
            >
              <span />
            </button>
          </div>
          <div className="safe-door">
            <span className="safe-dial"><i /></span>
            <button className="safe-keyhole" onClick={useKey} aria-label={s.sub}>
              <i />
            </button>
            <span className="safe-handle" />
            <span className="safe-brand">HOWIE'S</span>
          </div>
        </div>

        {stage !== 'open' && <KeyArt className={'float-key ' + stage} />}

        <div className="office-hint">
          {stage === 'open' ? s.paperHint : stage === 'ready' ? s.hint : stage === 'turn' ? '' : s.sub}
        </div>
      </div>
    );
  }

  // ---------- the scrap ----------
  if (phase === 'note') {
    const n = KEY.note;
    return (
      <div className="trial">
        <header className="trial-head">
          <div className="trial-kicker">{KEY.safe.kicker}</div>
          <h2 className="trial-title">{KEY.safe.opened}</h2>
        </header>
        <div className="scrap">
          <div className="scrap-head">{n.heading}</div>
          {n.lines.map((l, i) => (
            <div key={i} className={'scrap-line ' + l[0]}>{l[1]}</div>
          ))}
          <div className="scrap-foot">{n.footer}</div>
        </div>
        <button className="btn primary block" onClick={() => { sfx.paper(); advance(); }}>
          {KEY.safe.cta}
        </button>
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
        <div className="table-spots" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="table-spot" style={{ left: `${8 + i * 33}%` }}>
              <b>{i + 1}</b>
            </span>
          ))}
        </div>
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
