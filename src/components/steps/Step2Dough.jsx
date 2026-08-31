import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { DOUGH } from '../../data/dough.js';
import { StepShell, useToast } from '../common.jsx';
import { sfx } from '../../sound.js';

const rnd = (a, b) => a + Math.random() * (b - a);

export default function Step2Dough() {
  const { advance, stat, state, setStepData } = useGame();
  const saved = state.stepData.dough || { done: 0, accSum: 0, phase: 'work' };

  const [ball, setBall] = useState(0); // oz on the scale
  const [grabbing, setGrabbing] = useState(false);
  const [phase, setPhase] = useState(saved.phase); // work | reveal | extra | interrupt
  const [done, setDone] = useState(saved.done);
  const [accSum, setAccSum] = useState(saved.accSum);
  const [toast, showToast] = useToast();
  const grabRef = useRef({ active: false, raf: 0, amount: 0, last: 0 });

  const persist = (d, a, p) => setStepData('dough', { done: d, accSum: a, phase: p });

  // --- press-and-hold grabbing from the tub ---
  const startGrab = (e) => {
    e.preventDefault();
    if (grabRef.current.active) return;
    grabRef.current = { active: true, amount: 0, last: performance.now(), raf: 0 };
    setGrabbing(true);
    const tick = (now) => {
      const g = grabRef.current;
      if (!g.active) return;
      const dt = (now - g.last) / 1000;
      g.last = now;
      g.amount += DOUGH.grabRatePerSec * dt * rnd(0.75, 1.25);
      g.raf = requestAnimationFrame(tick);
    };
    grabRef.current.raf = requestAnimationFrame(tick);
  };
  const endGrab = () => {
    const g = grabRef.current;
    if (!g.active) return;
    g.active = false;
    cancelAnimationFrame(g.raf);
    setGrabbing(false);
    if (g.amount > 0.05) {
      sfx.splat();
      sfx.scale();
      setBall((b) => Math.min(64, b + g.amount));
    }
  };
  useEffect(() => () => cancelAnimationFrame(grabRef.current.raf), []);

  const pinchOff = () => {
    if (ball <= 0) return;
    sfx.splat();
    setBall((b) => Math.max(0, b - rnd(...DOUGH.pinchOz)));
  };
  const addPinch = () => {
    sfx.splat();
    setBall((b) => Math.min(64, b + rnd(...DOUGH.pinchOz)));
  };
  const scrap = () => { if (ball > 0) { sfx.splat(); setBall(0); } };

  const totalNeeded = phase === 'extra'
    ? DOUGH.requiredBeforeReveal + DOUGH.keepGoingExtra
    : DOUGH.requiredBeforeReveal;

  const trayIt = () => {
    const err = Math.abs(ball - DOUGH.targetOz);
    if (ball < 1) return;
    if (err <= DOUGH.toleranceOz) {
      sfx.register();
      const acc = Math.max(0, 100 - err * 12.5);
      const d = done + 1;
      const a = accSum + acc;
      setDone(d); setAccSum(a); setBall(0);
      stat('doughAccuracy', { set: a / d });
      if (phase === 'work' && d >= DOUGH.requiredBeforeReveal) {
        persist(d, a, 'reveal');
        setTimeout(() => { setPhase('reveal'); sfx.error(); }, 900);
        showToast(`${d} / ${DOUGH.totalRequired} COMPLETE`, 'good', 1300);
      } else if (phase === 'extra' && d >= totalNeeded) {
        persist(d, a, 'interrupt');
        setPhase('interrupt');
        setTimeout(advance, 4200);
      } else {
        persist(d, a, phase);
        showToast(`${d} / ${DOUGH.totalRequired} COMPLETE`, 'good', 1400);
      }
    } else {
      sfx.deny();
      showToast(
        ball > DOUGH.targetOz + DOUGH.toleranceOz
          ? 'TOO HEAVY. Dennis sees food cost.'
          : 'TOO LIGHT. That\'s a lawsuit in some states.',
        'bad'
      );
    }
  };

  const choose = (choice) => {
    stat('doughChoice', { set: choice });
    if (choice === 'keep_going') {
      sfx.tap();
      setPhase('extra');
      persist(done, accSum, 'extra');
    } else {
      sfx.register();
      persist(done, accSum, 'work');
      showToast('Noted for your evaluation.', '', 1800);
      setTimeout(advance, 1900);
    }
  };

  if (phase === 'reveal') {
    return (
      <StepShell kicker="DOUGH PREP" title="">
        <div className="dough-reveal">
          <div className="big">{DOUGH.totalRequired - done} REMAINING</div>
          <div className="sub">The tray standard is {DOUGH.totalRequired}. You have made {done}.</div>
          <div className="dough-choice">
            <button className="btn block" onClick={() => choose('keep_going')}>KEEP GOING</button>
            <button className="btn block danger" onClick={() => choose('fuck_this')}>FUCK THIS, I GET IT.</button>
          </div>
        </div>
        {toast}
      </StepShell>
    );
  }

  if (phase === 'interrupt') {
    return (
      <StepShell kicker="DOUGH PREP" title="">
        <div className="panel" style={{ marginTop: 40, textAlign: 'center' }}>
          <div className="step-kicker" style={{ marginBottom: 10 }}>DENNIS, FROM THE OFFICE</div>
          <p style={{ fontSize: 16, fontStyle: 'italic' }}>"{DOUGH.managerInterrupt}"</p>
        </div>
      </StepShell>
    );
  }

  const wDisplay = ball.toFixed(1);
  const ballSize = ball <= 0 ? 0 : Math.min(88, 18 + Math.sqrt(ball) * 15);

  return (
    <StepShell kicker="WALK-IN — PREP TABLE" title="Portion the dough.">
      <div className="paper-doc" style={{ fontFamily: 'var(--mono)', fontSize: 11.5 }}>
        {DOUGH.prepSheet.map((l, i) => <div key={i}>{l}</div>)}
      </div>

      <div className="dough-station">
        <div
          className={'dough-tub' + (grabbing ? ' grabbing' : '')}
          onPointerDown={startGrab}
          onPointerUp={endGrab}
          onPointerLeave={endGrab}
          onPointerCancel={endGrab}
        >
          <div className="dough-tub-label">BULK DOUGH — 40 LB</div>
          <div className="dough-mass" style={{ transform: grabbing ? 'scale(0.95)' : undefined }} />
          <div className="grab-hint">{grabbing ? 'pulling…' : 'PRESS & HOLD TO PULL DOUGH'}</div>
        </div>

        <div className="dough-scale">
          <div className="scale-plate">
            {ball > 0 && <div className="dough-ball" style={{ width: ballSize, height: ballSize * 0.92 }} />}
          </div>
          <div className="scale-readout">
            <div className="scale-lcd">{wDisplay}<small>OZ</small></div>
            <div className="scale-target">TARGET <b>{DOUGH.targetOz.toFixed(1)} OZ</b> ± {DOUGH.toleranceOz}</div>
          </div>
        </div>

        <div className="dough-actions">
          <button className="btn" onClick={pinchOff} disabled={ball <= 0}>PINCH OFF</button>
          <button className="btn" onClick={addPinch}>ADD PINCH</button>
          <button className="btn ghost" onClick={scrap} disabled={ball <= 0}>SCRAP IT</button>
          <button className="btn primary" onClick={trayIt} disabled={ball < 1}>TRAY IT</button>
        </div>

        <div className="dough-progress">
          <b>{done}</b> / {DOUGH.totalRequired} COMPLETE
        </div>
      </div>
      {toast}
    </StepShell>
  );
}
