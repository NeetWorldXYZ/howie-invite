import React, { useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { CLOCKIN, validateClockinPin } from '../../data/clockin.js';
import { STORE } from '../../config.js';
import { Keypad, Overlay, HintButton, StepShell, useToast } from '../common.jsx';
import { sfx } from '../../sound.js';

export default function Step1Clockin() {
  const { advance, stat } = useGame();
  const [doc, setDoc] = useState(null); // 'memo' | 'schedule' | 'sticky'
  const [accepted, setAccepted] = useState(false);
  const [toast, showToast] = useToast();

  const submit = (pin) => {
    stat('clockinAttempts');
    if (validateClockinPin(pin)) {
      sfx.punch();
      setAccepted(true);
      setTimeout(() => sfx.chime(), 300);
      setTimeout(advance, 3400);
    } else {
      sfx.deny();
      showToast('INVALID PIN\nSEE MANAGER (MANAGER IS IN THE OFFICE) (DO NOT BOTHER THE MANAGER)', 'bad', 3200);
    }
  };

  if (accepted) {
    return (
      <StepShell kicker="TIME CLOCK" title="">
        <div className="pos-frame">
          <div className="pos-screen" style={{ textAlign: 'center', padding: '38px 14px' }}>
            <div style={{ fontSize: 17, letterSpacing: '0.2em' }}>CLOCK IN ACCEPTED</div>
            <div style={{ fontSize: 26, margin: '10px 0' }}>{CLOCKIN.arrival}</div>
            <div className="pos-dim" style={{ fontSize: 11 }}>We'll fix your time later.</div>
          </div>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell kicker={`STORE #${STORE.number} — BACK HALLWAY`} title="Clock in.">
      <div className="pos-frame">
        <div className="pos-screen">
          <div className="pos-title">EMP TIME SYSTEM v2.3 — DO NOT UNPLUG</div>
          <div className="pos-line"><span>SHIFT START</span><span className="r">{CLOCKIN.shiftStart}</span></div>
          <div className="pos-line"><span>ARRIVAL</span><span className="r pos-alert">{CLOCKIN.arrival}</span></div>
          <div className="pos-line pos-dim"><span>STORE</span><span className="r">#{STORE.number}</span></div>
          <div className="pos-line pos-dim"><span>EMP</span><span className="r">NEW HIRE</span></div>
          <div style={{ marginTop: 8, fontSize: 11 }} className="pos-alert">ENTER 4-DIGIT EMPLOYEE PIN</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Keypad length={4} onSubmit={submit} label="CLOCK IN" />
        </div>
      </div>

      <div className="muted small" style={{ textAlign: 'center' }}>Things taped to the wall:</div>
      <div className="wall-items">
        <button className="wall-item laminate" onClick={() => { sfx.paper(); setDoc('memo'); }}>
          <span className="wi-kind">LAMINATED MEMO</span>
          HH-OPS-114 — TEMPORARY PIN PROCEDURE
        </button>
        <button className="wall-item paper" onClick={() => { sfx.paper(); setDoc('schedule'); }}>
          <span className="wi-kind">PRINTOUT</span>
          WEEK OF AUG 24 — POSTED SCHEDULE
        </button>
        <button className="wall-item sticky" onClick={() => { sfx.paper(); setDoc('sticky'); }}>
          <span className="wi-kind">STICKY NOTE</span>
          "New guy —"
        </button>
        <div className="wall-item plaque">
          <span className="wi-kind" style={{ color: 'inherit' }}>WALL PLAQUE</span>
          PROUDLY SERVING FLAT ROCK SINCE 2009
        </div>
      </div>

      <HintButton id="clockin" hints={CLOCKIN.hints} />
      {toast}

      <Overlay open={doc === 'memo'} onClose={() => setDoc(null)}>
        <div className="laminated">
          <div className="laminated-title">{CLOCKIN.memo.title}</div>
          {CLOCKIN.memo.lines.map((l, i) => (
            <p key={i} style={{ margin: '8px 0', fontSize: 13 }}>{l}</p>
          ))}
        </div>
      </Overlay>

      <Overlay open={doc === 'schedule'} onClose={() => setDoc(null)}>
        <div className="paper-doc">
          <h4>{CLOCKIN.schedule.title}</h4>
          <table><tbody>
            {CLOCKIN.schedule.rows.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>
                  {r.scratched
                    ? <><span className="scratched">{r.shift}</span>{' '}<span className="pen">{r.penFix} PM – CL</span></>
                    : r.shift}
                </td>
              </tr>
            ))}
          </tbody></table>
          <div className="pen" style={{ marginTop: 10 }}>{CLOCKIN.schedule.note}</div>
        </div>
      </Overlay>

      <Overlay open={doc === 'sticky'} onClose={() => setDoc(null)}>
        <div className="wall-item sticky" style={{ transform: 'none', width: '100%', minHeight: 120, fontSize: 15, padding: 20 }}>
          {CLOCKIN.stickyNote.text}
          <div style={{ marginTop: 12, textAlign: 'right' }}>— {CLOCKIN.stickyNote.from}</div>
        </div>
      </Overlay>
    </StepShell>
  );
}
