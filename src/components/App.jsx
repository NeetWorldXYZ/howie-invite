import React from 'react';
import { useGame } from '../GameContext.jsx';
import { DEV_MODE } from '../config.js';
import Hud from './Hud.jsx';
import Envelope from './Envelope.jsx';
import Step1Clockin from './steps/Step1Clockin.jsx';
import Step2Dough from './steps/Step2Dough.jsx';
import Step3Makeline from './steps/Step3Makeline.jsx';
import Step4Cash from './steps/Step4Cash.jsx';
import Step5Help from './steps/Step5Help.jsx';
import Step6Jake from './steps/Step6Jake.jsx';
import Step7Close from './steps/Step7Close.jsx';
import Finale from './Finale.jsx';
import DevPanel from './DevPanel.jsx';

const STEPS = {
  1: Step1Clockin,
  2: Step2Dough,
  3: Step3Makeline,
  4: Step4Cash,
  5: Step5Help,
  6: Step6Jake,
  7: Step7Close,
};

export default function App() {
  const { state } = useGame();

  let screen;
  if (state.phase === 'envelope' || state.phase === 'invitation') {
    screen = <Envelope />;
  } else if (state.phase === 'finale') {
    screen = <Finale />;
  } else {
    const Step = STEPS[state.step] || Step1Clockin;
    screen = <Step key={state.step} />;
  }

  const inShift = state.phase === 'shift';

  return (
    <div className="app">
      {inShift && <Hud />}
      {screen}
      {DEV_MODE && <DevPanel />}
    </div>
  );
}
