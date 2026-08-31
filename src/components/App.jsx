import React from 'react';
import { useGame } from '../GameContext.jsx';
import { DEV_MODE } from '../config.js';
import Hud from './Hud.jsx';
import Envelope from './Envelope.jsx';
import Finale from './Finale.jsx';
import DevPanel from './DevPanel.jsx';
import T1Slot from './trials/T1Slot.jsx';
import T2Pizza from './trials/T2Pizza.jsx';
import T3Darts from './trials/T3Darts.jsx';
import T4Maze from './trials/T4Maze.jsx';
import T5Door from './trials/T5Door.jsx';

const TRIAL_VIEWS = { 1: T1Slot, 2: T2Pizza, 3: T3Darts, 4: T4Maze, 5: T5Door };

export default function App() {
  const { state } = useGame();

  let screen;
  if (state.phase === 'envelope' || state.phase === 'invitation') screen = <Envelope />;
  else if (state.phase === 'finale') screen = <Finale />;
  else {
    const View = TRIAL_VIEWS[state.trial] || T1Slot;
    screen = <View key={state.trial} />;
  }

  return (
    <div className="app">
      {state.phase === 'trials' && <Hud />}
      {screen}
      {DEV_MODE && <DevPanel />}
    </div>
  );
}
