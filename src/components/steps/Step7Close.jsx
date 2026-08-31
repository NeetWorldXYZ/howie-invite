import React, { useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { CLOSING } from '../../data/closing.js';
import { CLOCKIN } from '../../data/clockin.js';
import { StepShell, Overlay, Keypad, useToast } from '../common.jsx';
import { sfx } from '../../sound.js';

export default function Step7Close() {
  const { advance, stat, state, setStepData } = useGame();
  const saved = state.stepData.closing || { done: [], jakeOut: false };
  const [done, setDone] = useState(saved.done);
  const [jakeOut, setJakeOut] = useState(saved.jakeOut);
  const [task, setTask] = useState(null);
  const [clockPhase, setClockPhase] = useState('idle'); // idle | error | labor | pin | out
  const [rebuttal, setRebuttal] = useState(null);
  const [deposit, setDeposit] = useState('');
  const [waste, setWaste] = useState('');
  const [doughCount, setDoughCount] = useState('');
  const [doughWeight, setDoughWeight] = useState('');
  const [bins, setBins] = useState([]);
  const [crateMoved, setCrateMoved] = useState(false);
  const [frontLocked, setFrontLocked] = useState(false);
  const [backLocked, setBackLocked] = useState(false);
  const [toast, showToast] = useToast();

  const wasteAnswer = Math.max(0, (state.stats.makelineAttempts || 1) - 1);

  const complete = (id) => {
    sfx.beep();
    const d = [...new Set([...done, id])];
    setDone(d);
    setStepData('closing', { done: d, jakeOut });
    setTask(null);
    setRebuttal(null);
  };
  const miss = (msg) => {
    stat('closingMistakes');
    sfx.deny();
    showToast(msg, 'bad', 3200);
  };

  const allDone = CLOSING.tasks.every((t) => done.includes(t.id));

  const tryClockOut = () => {
    if (!jakeOut) {
      sfx.error();
      setClockPhase('error');
    } else {
      sfx.punch();
      setClockPhase('out');
      setTimeout(() => sfx.chime(), 600);
      setTimeout(advance, 4200);
    }
  };

  const clockJakeOut = (pin) => {
    if (pin === CLOCKIN.pin) {
      sfx.punch();
      setJakeOut(true);
      setStepData('closing', { done, jakeOut: true });
      setClockPhase('idle');
      showToast('J. RENNER — SHIFT ENDED 12:06 AM\n(8.1 HRS. HE WAS HERE THE WHOLE TIME.)', 'good', 3400);
    } else {
      stat('closingMistakes');
      sfx.deny();
      showToast('MANAGER PIN REQUIRED\n(Yours. The one you clocked in with.)', 'bad');
    }
  };

  if (clockPhase === 'out') {
    return (
      <StepShell kicker="TIME CLOCK" title="">
        <div className="pos-frame" style={{ marginTop: 30 }}>
          <div className="pos-screen" style={{ textAlign: 'center', padding: '38px 14px' }}>
            <div style={{ fontSize: 17, letterSpacing: '0.2em' }}>CLOCK OUT ACCEPTED</div>
            <div style={{ fontSize: 26, margin: '10px 0' }}>{CLOSING.clockOutTime}</div>
            <div className="pos-dim" style={{ fontSize: 11 }}>SHIFT LENGTH: 7.8 HRS — WE FIXED YOUR TIME. YOU'RE WELCOME.</div>
          </div>
        </div>
        <div className="fade-black" style={{ animationDelay: '2.2s' }} />
      </StepShell>
    );
  }

  return (
    <StepShell kicker="12:03 AM — MANAGER CLOSE" title="Close the store.">
      <div className="checklist">
        {CLOSING.tasks.map((t) => (
          <button
            key={t.id}
            className={'check-item' + (done.includes(t.id) ? ' done' : '')}
            onClick={() => { if (!done.includes(t.id)) { sfx.tap(); setTask(t.id); setRebuttal(null); } }}
          >
            <span className="box">{done.includes(t.id) ? '✓' : ''}</span>
            {t.label}
          </button>
        ))}
        <button
          className={'check-item' + (jakeOut && allDone ? '' : '')}
          style={{ borderColor: allDone ? 'rgba(201,162,39,0.5)' : undefined, opacity: allDone ? 1 : 0.45 }}
          disabled={!allDone}
          onClick={tryClockOut}
        >
          <span className="box">{clockPhase === 'out' ? '✓' : ''}</span>
          Clock out
        </button>
      </div>

      {clockPhase === 'error' && (
        <div className="error-block">
          {CLOSING.clockOutError}
          <div style={{ marginTop: 12 }}>
            <button className="btn small" onClick={() => { sfx.tap(); setClockPhase('labor'); }}>OPEN LABOR SCREEN</button>
          </div>
        </div>
      )}

      <p className="muted small" style={{ textAlign: 'center' }}>
        Anything you found earlier tonight is in the MANAGER BINDER, top right.
      </p>
      {toast}

      {/* ---------- RECONCILE ---------- */}
      <Overlay open={task === 'reconcile'} onClose={() => setTask(null)}>
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>RECONCILE DRAWER</div>
          <p className="small" style={{ marginBottom: 10 }}>{CLOSING.reconcile.prompt}</p>
          <div className="choice-list">
            {CLOSING.reconcile.options.map((o) => (
              <button key={o.id} className="choice" onClick={() => {
                if (o.correct) complete('reconcile');
                else { setRebuttal(o.fail); stat('closingMistakes'); sfx.deny(); }
              }}>{o.text}</button>
            ))}
          </div>
          {rebuttal && <div className="rebuttal" style={{ marginTop: 10 }}><b>REJECTED</b>{rebuttal}</div>}
        </div>
      </Overlay>

      {/* ---------- DEPOSIT ---------- */}
      <Overlay open={task === 'deposit'} onClose={() => setTask(null)}>
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>VERIFY DEPOSIT</div>
          <p className="small">{CLOSING.deposit.prompt}</p>
          <input
            className="scale-lcd"
            style={{ width: '100%', border: '1px solid #23402a', fontSize: 24, marginTop: 8 }}
            inputMode="decimal"
            placeholder="0.00"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
          />
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => {
            const v = parseFloat(deposit.replace(/[$,\s]/g, ''));
            if (Math.abs(v - CLOSING.deposit.answer) < 0.005) complete('deposit');
            else miss(CLOSING.deposit.failText);
          }}>SEAL THE BAG</button>
        </div>
      </Overlay>

      {/* ---------- WASTE ---------- */}
      <Overlay open={task === 'waste'} onClose={() => setTask(null)}>
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>RECORD WASTE</div>
          <p className="small">{CLOSING.waste.promptTemplate}</p>
          <input
            className="scale-lcd"
            style={{ width: '100%', border: '1px solid #23402a', fontSize: 24, marginTop: 8 }}
            inputMode="numeric"
            placeholder="0"
            value={waste}
            onChange={(e) => setWaste(e.target.value)}
          />
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => {
            const v = parseInt(waste, 10);
            if (v === wasteAnswer) {
              if (wasteAnswer === 0) showToast(CLOSING.waste.zeroNote, 'good', 2600);
              complete('waste');
            } else if (Number.isFinite(v) && v < wasteAnswer) miss(CLOSING.waste.failLow);
            else miss(CLOSING.waste.failHigh);
          }}>LOG IT</button>
        </div>
      </Overlay>

      {/* ---------- LABOR ---------- */}
      <Overlay open={task === 'labor'} onClose={() => setTask(null)}>
        <div className="pos-screen">
          <div className="pos-title">LABOR — 8/30</div>
          {CLOSING.labor.rows.map((r, i) => (
            <div className="pos-line" key={i} style={{ fontSize: 11.5 }}>
              <span>{r[0]}</span><span className="r">{r[1]} · {r[2]} · {r[3]}</span>
            </div>
          ))}
          <div className="pos-dim" style={{ marginTop: 10, fontSize: 11 }}>{CLOSING.labor.approveNote}</div>
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => complete('labor')}>APPROVE LABOR</button>
        </div>
      </Overlay>

      {/* ---------- SECURE MAKELINE ---------- */}
      <Overlay open={task === 'makeline'} onClose={() => setTask(null)}>
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>SECURE MAKELINE</div>
          <p className="small">Lid and date every bin. Tap each one.</p>
          <div className="ctl-row" style={{ marginTop: 10 }}>
            {['SAUCE', 'CHEESE', 'PEP', 'SAUSAGE', 'VEG', 'THE MYSTERY BIN'].map((b) => (
              <button key={b} className={'chip' + (bins.includes(b) ? ' sel' : '')} onClick={() => {
                if (!bins.includes(b)) { sfx.splat(); setBins((x) => [...x, b]); }
              }}>{bins.includes(b) ? '✓ ' : ''}{b}</button>
            ))}
          </div>
          {bins.length >= 6 && (
            <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => complete('makeline')}>WALK-IN, WRAPPED, DATED</button>
          )}
        </div>
      </Overlay>

      {/* ---------- DOUGH COUNT ---------- */}
      <Overlay open={task === 'dough'} onClose={() => setTask(null)}>
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>VERIFY DOUGH COUNT</div>
          <p className="small">{CLOSING.dough.prompt}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <input className="scale-lcd" style={{ flex: 1, border: '1px solid #23402a', fontSize: 20, minWidth: 0 }} inputMode="numeric" placeholder="balls / tray" value={doughCount} onChange={(e) => setDoughCount(e.target.value)} />
            <input className="scale-lcd" style={{ flex: 1, border: '1px solid #23402a', fontSize: 20, minWidth: 0 }} inputMode="decimal" placeholder="oz each" value={doughWeight} onChange={(e) => setDoughWeight(e.target.value)} />
          </div>
          <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => {
            if (parseInt(doughCount, 10) === CLOSING.dough.countAnswer && Math.abs(parseFloat(doughWeight) - CLOSING.dough.weightAnswer) < 0.05) complete('dough');
            else miss(CLOSING.dough.failText);
          }}>CONFIRM</button>
        </div>
      </Overlay>

      {/* ---------- ALARM ---------- */}
      <Overlay open={task === 'alarm'} onClose={() => setTask(null)}>
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>{CLOSING.alarm.prompt}</div>
          <Keypad length={4} masked={false} label="ARM — AWAY" onSubmit={(code) => {
            if (code === CLOSING.alarm.code) {
              sfx.alarm();
              showToast(CLOSING.alarm.successText, 'good', 3000);
              complete('alarm');
            } else miss(CLOSING.alarm.failText);
          }} />
        </div>
      </Overlay>

      {/* ---------- DOORS ---------- */}
      <Overlay open={task === 'doors'} onClose={() => setTask(null)}>
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>LOCK DOORS</div>
          <div className="choice-list">
            <button className="choice" onClick={() => { sfx.punch(); setFrontLocked(true); }}>
              {frontLocked ? '✓ FRONT DOOR — LOCKED' : 'FRONT DOOR — lock it'}
            </button>
            {!crateMoved ? (
              <button className="choice" onClick={() => { sfx.error(); setCrateMoved(true); showToast(CLOSING.doors.crateText, '', 3600); }}>
                {CLOSING.doors.proppedText}
              </button>
            ) : (
              <button className="choice" onClick={() => { sfx.punch(); setBackLocked(true); }}>
                {backLocked ? '✓ BACK DOOR — LOCKED' : 'BACK DOOR — lock it'}
              </button>
            )}
          </div>
          {frontLocked && backLocked && (
            <button className="btn primary block" style={{ marginTop: 12 }} onClick={() => complete('doors')}>DOORS SECURED</button>
          )}
        </div>
      </Overlay>

      {/* ---------- LABOR / JAKE PUNCH ---------- */}
      <Overlay open={clockPhase === 'labor' || clockPhase === 'pin'} onClose={() => setClockPhase('idle')}>
        <div className="pos-screen">
          <div className="pos-title">LABOR &gt; OPEN PUNCHES</div>
          <div className="pos-line"><span>NEW HIRE (YOU)</span><span className="r">IN 4:17 PM — ACTIVE</span></div>
          <div className="pos-line pos-alert"><span>J. RENNER</span><span className="r">IN 4:11 PM — CLOCKED IN</span></div>
          <div className="pos-dim" style={{ margin: '8px 0', fontSize: 11 }}>
            STATUS: CLOCKED IN. EMPLOYMENT: TERMINATED.<br />
            THE SYSTEM SEES NO CONTRADICTION.
          </div>
          {clockPhase === 'labor' ? (
            <button className="btn primary block" onClick={() => { sfx.tap(); setClockPhase('pin'); }}>
              END SHIFT — J. RENNER
            </button>
          ) : (
            <div style={{ marginTop: 10 }}>
              <div className="pos-alert" style={{ fontSize: 11, marginBottom: 8 }}>MANAGER OVERRIDE — ENTER YOUR PIN</div>
              <Keypad length={4} onSubmit={clockJakeOut} label="OVERRIDE" />
            </div>
          )}
        </div>
      </Overlay>
    </StepShell>
  );
}
