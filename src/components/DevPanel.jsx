import React, { useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { CLOCKIN } from '../data/clockin.js';
import { SOLUTION } from '../data/makeline.js';
import { CASH, CASH_QUESTION } from '../data/cash.js';
import { STOREHELP } from '../data/storehelp.js';
import { JAKE } from '../data/jake.js';
import { CLOSING } from '../data/closing.js';

// Only rendered when DEV_MODE is true (see config.js). Lets you jump
// around, reveal solutions, auto-complete the current step, and
// inspect saved state.
export default function DevPanel() {
  const { state, dispatch, reset } = useGame();
  const [open, setOpen] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [showState, setShowState] = useState(false);

  if (!open) {
    return <button className="dev-fab" onClick={() => setOpen(true)}>DEV</button>;
  }

  const autoComplete = () => {
    // Marks the current step done and advances (stats untouched).
    if (state.phase !== 'shift') dispatch({ type: 'GOTO', step: 1 });
    else dispatch({ type: 'ADVANCE' });
  };

  const solutions = {
    step1_pin: CLOCKIN.pin,
    step3_pizza: SOLUTION,
    step4_answer: CASH_QUESTION.options.find((o) => o.correct).id,
    step4_deposit: CASH.depositAmount,
    step5_password: STOREHELP.email.password,
    step5_compose: STOREHELP.composeAnswer,
    step6_reason: JAKE.question.options.find((o) => o.correct).id,
    step7_alarm: CLOSING.alarm.code,
    step7_dough: `${CLOSING.dough.countAnswer} @ ${CLOSING.dough.weightAnswer} oz`,
  };

  return (
    <div className="devpanel">
      <div className="dev-row" style={{ justifyContent: 'space-between' }}>
        <b>DEV MODE — phase: {state.phase} / step {state.step}</b>
        <button onClick={() => setOpen(false)}>close</button>
      </div>
      <div className="dev-row">
        <button onClick={() => dispatch({ type: 'GOTO', step: 0 })}>envelope</button>
        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
          <button key={s} onClick={() => dispatch({ type: 'GOTO', step: s })}>step {s}</button>
        ))}
        <button onClick={() => dispatch({ type: 'GOTO', step: 8 })}>finale</button>
      </div>
      <div className="dev-row">
        <button onClick={autoComplete}>complete current step</button>
        <button onClick={() => ['sheets', 'drawer', 'inbox', 'jake'].forEach((s) => dispatch({ type: 'UNLOCK_BINDER', section: s }))}>unlock binder</button>
        <button onClick={reset}>reset game</button>
        <button onClick={() => setShowSolutions((v) => !v)}>solutions</button>
        <button onClick={() => setShowState((v) => !v)}>state</button>
      </div>
      {showSolutions && <pre>{JSON.stringify(solutions, null, 1)}</pre>}
      {showState && <pre>{JSON.stringify(state, null, 1)}</pre>}
    </div>
  );
}
