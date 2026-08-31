import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { SLOT } from '../../data/trials.js';
import { MiddleFinger, SlotSymbol } from '../art.jsx';
import { sfx } from '../../sound.js';

const STRIP = SLOT.symbols;
const ROW_H = 78;

// Reel that spins and lands on a given symbol (or the jackpot hand).
function Reel({ spinning, landed, jackpot, delay }) {
  // long strip so the blur reads as real motion
  const cells = [];
  for (let i = 0; i < 9; i++) cells.push(STRIP[i % STRIP.length]);
  return (
    <div className="reel">
      <div
        className={'reel-strip' + (spinning ? ' spinning' : '')}
        style={{ animationDelay: `${delay}ms` }}
      >
        {cells.map((c, i) => (
          <div className="reel-cell" key={i}><SlotSymbol kind={c} /></div>
        ))}
      </div>
      {!spinning && (
        <div className="reel-final">
          {jackpot ? <MiddleFinger /> : <SlotSymbol kind={landed} />}
        </div>
      )}
      <div className="reel-glass" />
    </div>
  );
}

export default function T1Slot() {
  const { advance, stat } = useGame();
  const [bet, setBet] = useState(SLOT.bets[0]);
  const [credits, setCredits] = useState(SLOT.startCredits);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState([STRIP[0], STRIP[1], STRIP[2]]);
  const [message, setMessage] = useState('');
  const [pulls, setPulls] = useState(0);
  const [jackpot, setJackpot] = useState(false);
  const [leverY, setLeverY] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const isMax = bet.id === 'max';

  const pull = () => {
    if (spinning || jackpot) return;
    sfx.lever();
    setSpinning(true);
    setMessage('');
    setCredits((c) => Math.max(0, c - bet.amount));
    const n = pulls + 1;
    setPulls(n);
    stat('pulls', n);

    const win = isMax; // it only ever hits on max bet
    // reels stop left-to-right
    [0, 1, 2].forEach((i) => {
      later(() => {
        sfx.reelStop();
        setReels((r) => {
          const next = [...r];
          if (win) next[i] = 'FINGER';
          else {
            // near-miss: first two match, third never does
            next[i] = i < 2 ? STRIP[1] : STRIP[(n + 2) % STRIP.length === 1 ? 3 : (n + 2) % STRIP.length];
          }
          return next;
        });
      }, 700 + i * 420);
    });

    later(() => {
      setSpinning(false);
      if (win) {
        setJackpot(true);
        stat('jackpotOnPull', n);
        sfx.jackpot();
        later(advance, SLOT.jackpotHoldMs);
      } else {
        sfx.deny();
        setMessage(SLOT.losses[Math.min(n - 1, SLOT.losses.length - 1)]);
      }
    }, 700 + 2 * 420 + 260);
  };

  // lever drag
  const leverDown = (e) => {
    if (spinning || jackpot) return;
    e.preventDefault();
    dragging.current = true;
    startY.current = e.clientY;
  };
  const leverMove = (e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const dy = Math.max(0, Math.min(84, e.clientY - startY.current));
    setLeverY(dy);
    if (dy >= 80) {
      dragging.current = false;
      setLeverY(84);
      pull();
      later(() => setLeverY(0), 260);
    }
  };
  const leverUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setLeverY(0);
  };

  const nudgeMax = pulls >= 2 && !isMax && !spinning && !jackpot;

  return (
    <div className={'trial slot-trial' + (jackpot ? ' jackpot' : '')}>
      <header className="trial-head">
        <div className="trial-kicker">{SLOT.title}</div>
        <h2 className="trial-title">{jackpot ? SLOT.jackpotText : SLOT.sub}</h2>
      </header>

      <div className="machine">
        <div className="machine-top">
          <div className="machine-marquee">{jackpot ? SLOT.jackpotSub : 'HOWIE\u2019S'}</div>
        </div>

        <div className="machine-body">
          <div className="reels">
            {[0, 1, 2].map((i) => (
              <Reel
                key={i}
                spinning={spinning}
                landed={reels[i]}
                jackpot={reels[i] === 'FINGER'}
                delay={i * 90}
              />
            ))}
          </div>

          <div
            className="lever"
            onPointerDown={leverDown}
            onPointerMove={leverMove}
            onPointerUp={leverUp}
            onPointerLeave={leverUp}
            onPointerCancel={leverUp}
          >
            <div className="lever-rod" style={{ height: 60 + leverY }} />
            <div className="lever-knob" style={{ transform: `translateY(${leverY}px)` }} />
          </div>
        </div>

        <div className="machine-readout">
          <div><span>CREDITS</span><b>{credits}</b></div>
          <div><span>BET</span><b>{bet.amount}</b></div>
        </div>
      </div>

      <div className="bet-row">
        {SLOT.bets.map((b) => (
          <button
            key={b.id}
            className={'bet-btn' + (bet.id === b.id ? ' on' : '') + (b.id === 'max' && nudgeMax ? ' nudge' : '')}
            disabled={spinning || jackpot}
            onClick={() => { sfx.beep(); setBet(b); }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="slot-msg">
        {jackpot ? '' : message || (spinning ? '' : SLOT.hint)}
      </div>

      {jackpot && (
        <div className="jackpot-fx">
          {Array.from({ length: 26 }, (_, i) => (
            <span key={i} className="coin" style={{ '--i': i, '--x': `${(i * 37) % 100}%`, '--d': `${(i % 7) * 0.14}s` }} />
          ))}
        </div>
      )}
    </div>
  );
}
