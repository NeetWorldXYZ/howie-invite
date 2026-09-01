import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { CLOCKOUT, KEY } from '../../data/trials.js';
import { Overlay } from '../common.jsx';
import { HowDareYou } from '../art.jsx';
import { sfx } from '../../sound.js';

const PAD = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
];

// Punch out with the pin off the scrap, then the phone rings.
export default function T5ClockOut() {
  const { advance, stat, reset } = useGame();
  // punch -> out -> black -> count -> ring -> talk -> getout -> grovel
  const [phase, setPhase] = useState('punch');
  const [val, setVal] = useState('');
  const [wrongs, setWrongs] = useState(0);
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState(false);
  const [count, setCount] = useState(null);
  const [line, setLine] = useState(0);      // call: index of the line on screen
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
    setLine(0);
  };

  const p = CLOCKOUT.phone;
  const nextLine = () => {
    if (line < p.lines.length) { sfx.tap(); setLine((l) => l + 1); }
  };

  const sayYes = () => { sfx.chime(); advance(); };
  const sayNo = () => { sfx.error(); setPhase('getout'); };

  const callBack = () => {
    sfx.dial();
    setPhase('grovel');
    setGrovelLine(0);
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
            <div className="dialpad">
              {PAD.map(([d, sub]) => (
                <button key={d} className="dk" onClick={() => press(d)} aria-label={d}>
                  <span className="dk-num">{d}</span>
                  {sub && <span className="dk-sub">{sub}</span>}
                </button>
              ))}
              <button className="dk aux" onClick={() => press('<')} aria-label="<">⌫</button>
              <button className="dk" onClick={() => press('0')} aria-label="0">
                <span className="dk-num">0</span>
                <span className="dk-sub">+</span>
              </button>
              <button className="dk go" disabled={val.length !== 4} onClick={submit} aria-label={CLOCKOUT.padSubmit}>
                {CLOCKOUT.padSubmit}
              </button>
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
  if (phase === 'ring') {
    return (
      <div className="blackout phone-scene">
        <div className="red-phone ringing">
          <div className="rp-body">
            <span className="rp-dial" />
            <span className="rp-cord" />
          </div>
          <div className="rp-handset" />
        </div>
        <div className="rp-label">{p.ringing}</div>
        <div className="rp-caller">{p.caller}</div>
        <div className="rp-caller-sub">{p.callerSub}</div>
        <button className="btn primary big rp-answer" onClick={answer}>{p.answer}</button>
      </div>
    );
  }

  if (phase === 'talk') {
    const choosing = line >= p.lines.length;
    const cur = p.lines[Math.min(line, p.lines.length - 1)];
    return (
      <div
        className={'call-scene' + (choosing ? ' choosing' : '')}
        onClick={choosing ? undefined : nextLine}
      >
        <div className="call-top">
          <div className="call-status">● LIVE · STORE LINE</div>
          <div className="call-name">{p.caller}</div>
          <div className="call-sub">{p.callerSub}</div>
        </div>

        {!choosing ? (
          <>
            <div className="call-line" key={line}>
              <div className="cl-who">{cur.who}</div>
              <p className="cl-msg">{cur.msg}</p>
            </div>
            <div className="call-foot">
              <div className="call-dots">
                {p.lines.map((_, i) => <i key={i} className={i <= line ? 'on' : ''} />)}
              </div>
              <div className="call-tap">{p.tapHint}</div>
            </div>
          </>
        ) : (
          <div className="call-choice">
            <div className="cc-header">{p.choiceHeader}</div>
            <div className="cc-sub">{p.choiceSub}</div>
            <button className="cc-btn yes" onClick={sayYes}>{p.yes}</button>
            <button className="cc-btn no" onClick={sayNo}>{p.no}</button>
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

  // ---------- grovelling, one line at a time ----------
  const g = CLOCKOUT.grovel;
  const gDone = grovelLine >= g.lines.length - 1;
  const gl = g.lines[Math.min(grovelLine, g.lines.length - 1)];
  return (
    <div
      className="grovel-scene"
      onClick={gDone ? undefined : () => { sfx.tap(); setGrovelLine((l) => l + 1); }}
    >
      <div className="call-top">
        <div className="call-status">● {g.dialing}</div>
        <div className="call-name">{g.header}</div>
      </div>

      <div className={'call-line grovel-line ' + (gl.who === 'YOU' ? 'me' : 'them')} key={grovelLine}>
        <div className="cl-who">{gl.who}</div>
        <p className="cl-msg">{gl.msg}</p>
      </div>

      <div className="call-foot">
        <div className="call-dots">
          {g.lines.map((_, i) => <i key={i} className={i <= grovelLine ? 'on' : ''} />)}
        </div>
        {gDone ? (
          <button className="btn primary block" onClick={(e) => { e.stopPropagation(); sfx.chime(); advance(); }}>
            {g.cta}
          </button>
        ) : (
          <div className="call-tap">{g.tapHint}</div>
        )}
      </div>
    </div>
  );
}
