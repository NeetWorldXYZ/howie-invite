import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { GameProvider } from './GameContext.jsx';
import App from './components/App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
