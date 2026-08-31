import React, { useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { DOOR } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Everything lives INSIDE the porch stage — the question and keypad are
// overlaid on the door itself so nothing on this trial requires scrolling.
export default function T5Door() {
  const { advance, stat } = useGame();
  const [knocks, setKnocks] = useState(0);
  const [phase, setPhase] = useState('knock'); // knock | waiting | ask | opening
  const [val, setVal] = useState('');
  const [wrongs, setWrongs] = useState(0);
  const [msg, setMsg] = useState('');

  const knock = () => {
    if (phase !== 'knock') return;
    sfx.knock();
    const n = knocks + 1;
    setKnocks(n);
    if (n >= DOOR.knocksNeeded) {
      setPhase('waiting');
      setTimeout(() => { sfx.latch(); setPhase('ask'); }, 1400);
    }
  };

  const submit = () => {
    if (parseInt(val, 10) === DOOR.answer) {
      sfx.doorOpen();
      stat('doorWrongs', wrongs);
      setPhase('opening');
      setTimeout(advance, 2100);
    } else {
      const w = wrongs + 1;
      setWrongs(w);
      sfx.deny();
      setMsg(w >= DOOR.hintAfter ? DOOR.hint : DOOR.wrong[Math.min(w - 1, DOOR.wrong.length - 1)]);
      setVal('');
    }
  };

  const press = (d) => {
    sfx.beep();
    if (d === '<') return setVal((v) => v.slice(0, -1));
    setVal((v) => (v.length < 2 ? v + d : v));
  };

  return (
    <div className="trial door-trial">
      <div className="porch">
        <div className="porch-wall" />
        <span className="porch-lamp" />

        <div className={'door-frame' + (phase === 'opening' ? ' lit' : '')}>
          <div className="door-light" />
          <div className={'door' + (phase === 'opening' ? ' open' : '')} onPointerDown={knock}>
            <div className="door-panel tp" />
            <div className="door-panel tp r" />
            <div className="door-panel bp" />
            <div className="door-panel bp r" />
            <span className="door-knob" />
            <span className="door-num">4471</span>
            <span className="peep" />
          </div>

          {/* the whole exchange happens on the door */}
          {phase === 'knock' && (
            <div className="door-overlay knock-cue">
              <div className="kc-word">{DOOR.knockPrompt}</div>
              <div className="kc-dots">
                {[0, 1, 2].map((i) => <i key={i} className={i < knocks ? 'on' : ''} />)}
              </div>
            </div>
          )}

          {phase === 'waiting' && (
            <div className="door-overlay">
              <div className="voice-line">{DOOR.waiting}</div>
            </div>
          )}

          {phase === 'ask' && (
            <div className="door-overlay ask">
              <div className="voice-line">"{DOOR.voice}"</div>
              <div className="voice-q">"{DOOR.question}"</div>
              <div className="oz-entry">
                <span className="oz-val">{val || '—'}</span>
                <span className="oz-unit">{DOOR.unit}</span>
              </div>
              <div className="oz-pad">
                {['1','2','3','4','5','6','7','8','9','<','0'].map((d) => (
                  <button key={d} className="key" onClick={(e) => { e.stopPropagation(); press(d); }}>{d}</button>
                ))}
                <button className="key go" disabled={!val} onClick={(e) => { e.stopPropagation(); submit(); }}>OK</button>
              </div>
              {msg && <div className="oz-msg">{msg}</div>}
            </div>
          )}

          {phase === 'opening' && (
            <div className="door-overlay">
              <div className="voice-line">"{DOOR.correct}"</div>
            </div>
          )}
        </div>

        <div className="doormat"><span>GO AWAY</span></div>
      </div>
    </div>
  );
}
