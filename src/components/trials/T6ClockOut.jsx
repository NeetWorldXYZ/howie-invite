import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { CLOCKOUT, KEY } from '../../data/trials.js';
import { Overlay } from '../common.jsx';
import { HowDareYou } from '../art.jsx';
import { sfx } from '../../sound.js';

// Punch out with the pin off the scrap, then the phone rings.
export default function T6ClockOut() {
  const { advance, stat, reset } = useGame();
  // punch -> out -> black -> count -> ring -> talk -> getout -> grovel
  const [phase, setPhase] = useState('punch');
  const [val, setVal] = useState('');
  const [wrongs, setWrongs] = useState(0);
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState(false);
  const [count, setCount] = useState(null);
  const [line, setLine] = useState(0);
  const [grovelLine, setGrovelLine] = useState(0);
  const timers = useRef([]);
  const ring = useRef(null);

  const at = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => { timers.current.forEach(clearTimeout); ring.current?.stop(); }, []);

  const press = (d) => {
    sfx.beep();
    if (d === '<') return setVal((v) => v.slice(0, -1));
    setVal((v) => (v.length < 4 ? v + d : v));
  };

  const submit = () => {
    if (val === CLOCKOUT.code) {
      sfx.punchClock();
      stat('clockoutWrongs', wrongs);
      setPhase('out');
      at(() => setPhase('black'), 2000);
      at(() => { setCount(3); }, 2900);
    } else {
      const w = wrongs + 1;
      setWrongs(w);
      sfx.deny();
      setMsg(CLOCKOUT.wrong[Math.min(w - 1, CLOCKOUT.wrong.length - 1)]);
      setVal('');
    }
  };

  // 3 · 2 · 1 then the phone
  useEffect(() => {
    if (count === null) return;
    if (count > 0) {
      sfx.countBeep();
      const t = setTimeout(() => setCount((c) => c - 1), 900);
      return () => clearTimeout(t);
    }
    setPhase('ring');
    ring.current = sfx.phoneRing();
    return undefined;
  }, [count]);

  const answer = () => {
    ring.current?.stop();
    ring.current = null;
    sfx.pickUp();
    setPhase('talk');
    CLOCKOUT.phone.lines.forEach((_, i) => at(() => setLine(i + 1), 1300 * (i + 1)));
  };

  const sayYes = () => { sfx.chime(); advance(); };
  const sayNo = () => { sfx.error(); setPhase('getout'); };

  const callBack = () => {
    sfx.dial();
    setPhase('grovel');
    CLOCKOUT.grovel.lines.forEach((_, i) => at(() => setGrovelLine(i + 1), 1150 * (i + 1)));
  };

  // ---------- punch clock ----------
  if (phase === 'punch' || phase === 'out') {
    return (
      <div className="trial">
        <header className="trial-head">
          <div className="trial-kicker">{CLOCKOUT.title}</div>
          <h2 className="trial-title">{phase === 'out' ? CLOCKOUT.accepted : CLOCKOUT.sub}</h2>
        </header>

        <div className="punch-clock">
          <div className="pc-screen">
            {phase === 'out' ? (
              <>
                <div className="pc-big">{CLOCKOUT.accepted}</div>
                <div className="pc-sub">{CLOCKOUT.acceptedSub}</div>
              </>
            ) : (
              <>
                <div className="pc-time">{CLOCKOUT.time}</div>
                <div className="pc-slots">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={'pc-slot' + (val[i] ? ' filled' : '')}>{val[i] ? '•' : ''}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {phase === 'punch' && (
          <>
            <div className="oz-pad pc-pad">
              {['1','2','3','4','5','6','7','8','9','<','0'].map((d) => (
                <button key={d} className="key" onClick={() => press(d)}>{d}</button>
              ))}
              <button className="key go" disabled={val.length !== 4} onClick={submit}>OK</button>
            </div>
            {msg && <div className="slot-msg bad">{msg}</div>}
            <button className="btn ghost block small" onClick={() => { sfx.paper(); setNote(true); }}>
              {CLOCKOUT.noteBtn}
            </button>
            <Overlay open={note} onClose={() => setNote(false)}>
              <div className="scrap">
                <div className="scrap-head">{KEY.note.heading}</div>
                {KEY.note.lines.map((l, i) => <div key={i} className={'scrap-line ' + l[0]}>{l[1]}</div>)}
                <div className="scrap-foot">{KEY.note.footer}</div>
              </div>
            </Overlay>
          </>
        )}
      </div>
    );
  }

  // ---------- black + countdown ----------
  if (phase === 'black') {
    return (
      <div className="blackout">
        {count !== null && count > 0 && <div key={count} className="count-num">{count}</div>}
      </div>
    );
  }

  // ---------- the phone ----------
  if (phase === 'ring' || phase === 'talk') {
    const p = CLOCKOUT.phone;
    const done = line >= p.lines.length;
    return (
      <div className="blackout phone-scene">
        <div className={'red-phone' + (phase === 'ring' ? ' ringing' : '')}>
          <div className="rp-body">
            <span className="rp-dial" />
            <span className="rp-cord" />
          </div>
          <div className="rp-handset" />
        </div>

        {phase === 'ring' ? (
          <>
            <div className="rp-label">{p.ringing}</div>
            <div className="rp-caller">{p.caller}</div>
            <button className="btn primary big rp-answer" onClick={answer}>{p.answer}</button>
          </>
        ) : (
          <div className="rp-talk">
            {p.lines.slice(0, line).map((l, i) => (
              <p key={i} className="rp-line">"{l}"</p>
            ))}
            {done && (
              <div className="rp-choice">
                <button className="btn primary block" onClick={sayYes}>{p.yes}</button>
                <button className="btn danger block" onClick={sayNo}>{p.no}</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------- consequences ----------
  if (phase === 'getout') {
    return (
      <div className="getout-scene">
        <HowDareYou />
        <div className="getout-sub">{CLOCKOUT.getOut.sub}</div>
        <div className="getout-actions">
          <button className="btn primary block" onClick={callBack}>{CLOCKOUT.getOut.callBack}</button>
          <button className="btn ghost block small" onClick={reset}>{CLOCKOUT.getOut.startOver}</button>
        </div>
      </div>
    );
  }

  // ---------- grovelling ----------
  const g = CLOCKOUT.grovel;
  const gDone = grovelLine >= g.lines.length;
  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{g.header}</div>
      </header>
      <div className="texts-phone grovel">
        <div className="texts">
          {g.lines.slice(0, grovelLine).map((m, i) => (
            <div key={i} className={'text-bubble ' + (m.who === 'YOU' ? 'me' : 'them')}>{m.msg}</div>
          ))}
        </div>
      </div>
      {gDone && (
        <button className="btn primary block" onClick={() => { sfx.chime(); advance(); }}>{g.cta}</button>
      )}
    </div>
  );
}
