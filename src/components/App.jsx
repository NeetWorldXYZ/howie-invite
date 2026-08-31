import React from 'react';
import { useGame } from '../GameContext.jsx';
import { DEV_MODE } from '../config.js';
import Hud from './Hud.jsx';
import Envelope from './Envelope.jsx';
import Finale from './Finale.jsx';
import DevPanel from './DevPanel.jsx';
import T1Scratch from './trials/T1Scratch.jsx';
import T2Inflate from './trials/T2Inflate.jsx';
import T3Chug from './trials/T3Chug.jsx';
import T4Wheel from './trials/T4Wheel.jsx';
import T5Sign from './trials/T5Sign.jsx';
import T6Seal from './trials/T6Seal.jsx';

const TRIAL_VIEWS = { 1: T1Scratch, 2: T2Inflate, 3: T3Chug, 4: T4Wheel, 5: T5Sign, 6: T6Seal };

export default function App() {
  const { state } = useGame();

  let screen;
  if (state.phase === 'envelope' || state.phase === 'invitation') screen = <Envelope />;
  else if (state.phase === 'finale') screen = <Finale />;
  else {
    const View = TRIAL_VIEWS[state.trial] || T1Scratch;
    screen = <View key={state.trial} />;
  }

  // The chug trial leaves the whole app slightly crooked. It never recovers.
  const tilt = state.phase === 'trials' ? state.drunk : 0;

  return (
    <div className={'app' + (tilt ? ` drunk-${Math.min(2, tilt)}` : '')}>
      {state.phase === 'trials' && <Hud />}
      {screen}
      {DEV_MODE && <DevPanel />}
    </div>
  );
}
