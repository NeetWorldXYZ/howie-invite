import React, { useEffect, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { JAKE } from '../../data/jake.js';
import { JakeFile } from '../docs.jsx';
import { StepShell, useToast } from '../common.jsx';
import { sfx } from '../../sound.js';

export default function Step6Jake() {
  const { advance, stat, unlockBinder } = useGame();
  // brief -> file -> dialogue
  const [phase, setPhase] = useState('brief');
  const [deadOptions, setDeadOptions] = useState([]);
  const [rebuttal, setRebuttal] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [toast] = useToast();

  useEffect(() => { unlockBinder('jake'); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (opt) => {
    if (opt.correct) {
      sfx.punch();
      stat('step6Done', { set: true });
      setPhase('dialogue');
    } else {
      sfx.deny();
      stat('jakeWrongPicks');
      setDeadOptions((d) => [...d, opt.id]);
      setRebuttal(opt.rebuttal);
    }
  };

  useEffect(() => {
    if (phase !== 'dialogue') return;
    if (lineIdx < JAKE.terminationDialogue.length) {
      const t = setTimeout(() => { sfx.tap(); setLineIdx((i) => i + 1); }, 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(advance, 2600);
    return () => clearTimeout(t);
  }, [phase, lineIdx, advance]);

  if (phase === 'brief') {
    return (
      <StepShell kicker="11:26 PM — OFFICE" title="">
        <div className="panel" style={{ marginTop: 30, textAlign: 'center' }}>
          <div className="step-kicker" style={{ marginBottom: 14 }}>MANAGEMENT TASK</div>
          <p style={{ fontSize: 19, fontWeight: 600, letterSpacing: '0.04em' }}>
            JAKE MUST BE TERMINATED TONIGHT.
          </p>
          <p className="muted">
            Dennis slides a folder across the desk. "Corporate wants it done before midnight. Paperwork's all in there. Use a reason that holds up — the last manager who winged it is still doing depositions."
          </p>
          <button className="btn primary" style={{ marginTop: 10 }} onClick={() => { sfx.paper(); setPhase('file'); }}>
            OPEN THE FILE
          </button>
        </div>
      </StepShell>
    );
  }

  if (phase === 'dialogue') {
    return (
      <StepShell kicker="12:01 AM — BACK HALLWAY" title="">
        <div className="texts-phone" style={{ marginTop: 24 }}>
          <div className="texts-header">IN PERSON. UNFORTUNATELY.</div>
          <div className="texts">
            {JAKE.terminationDialogue.slice(0, lineIdx + 1).map((m, i) => (
              <div key={i} className={'text-bubble ' + (m.who === 'YOU' ? 'dennis' : 'jake')}>
                {m.msg}
              </div>
            ))}
          </div>
        </div>
        {lineIdx >= JAKE.terminationDialogue.length && (
          <p className="muted" style={{ textAlign: 'center', fontStyle: 'italic' }}>
            Jake takes his shift meal and leaves through the back.
          </p>
        )}
      </StepShell>
    );
  }

  return (
    <StepShell kicker="EMPLOYEE FILE" title="Find the reason that holds.">
      <JakeFile />

      {!askOpen ? (
        <button className="btn primary block" onClick={() => { sfx.tap(); setAskOpen(true); }}>
          SELECT TERMINATION REASON
        </button>
      ) : (
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>{JAKE.question.prompt}</div>
          <div className="choice-list">
            {JAKE.question.options.map((o) => (
              <button key={o.id} className={'choice' + (deadOptions.includes(o.id) ? ' dead' : '')} onClick={() => pick(o)}>
                {o.text}
              </button>
            ))}
          </div>
          {rebuttal && (
            <div className="rebuttal" style={{ marginTop: 10 }}>
              <b>DOCUMENTATION DOESN'T SUPPORT THIS</b>
              {rebuttal}
            </div>
          )}
        </div>
      )}
      {toast}
    </StepShell>
  );
}
