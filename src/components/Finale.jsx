import React, { useEffect, useRef } from 'react';
import { useGame } from '../GameContext.jsx';
import { FINALE } from '../data/trials.js';
import { LEAGUE_INVITE_URL } from '../config.js';
import { storage, getInviteToken } from '../persistence.js';
import { sfx } from '../sound.js';
import { Logo } from './art.jsx';

const PIECES = 90;
const CONFETTI_COLORS = ['#c9a227', '#edd282', '#c0281c', '#f4e3a1', '#ffffff', '#e8bd3a'];

export default function Finale() {
  const { state } = useGame();
  const submitted = useRef(false);

  useEffect(() => { sfx.fanfare(); }, []);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    storage.submitResult({
      token: getInviteToken(),
      completed: true,
      completionMs: (state.endTime || Date.now()) - (state.startTime || Date.now()),
      stats: state.stats,
      dateCompleted: new Date().toISOString(),
    });
  }, [state]);

  return (
    <div className="finale-scene">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: PIECES }, (_, i) => (
          <span
            key={i}
            className={'cf' + (i % 3 === 0 ? ' strip' : '')}
            style={{
              '--x': `${(i * 8.7) % 100}%`,
              '--d': `${(i % 11) * 0.28}s`,
              '--r': `${(i * 47) % 360}deg`,
              '--dur': `${3.4 + (i % 5) * 0.6}s`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            }}
          />
        ))}
      </div>

      <div className="finale-card">
        <Logo width={190} />
        <div className="fin-rule" />
        <div className="fin-welcome">{FINALE.welcome}</div>
        <div className="fin-league">{FINALE.league}</div>
        <div className="fin-year">{FINALE.year}</div>
      </div>

      {LEAGUE_INVITE_URL ? (
        <a className="btn primary big" href={LEAGUE_INVITE_URL} target="_blank" rel="noreferrer">
          {FINALE.cta}
        </a>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <button className="btn primary big" onClick={() => sfx.deny()}>{FINALE.cta}</button>
          <div className="muted small" style={{ marginTop: 12, whiteSpace: 'pre-line' }}>{FINALE.noUrl}</div>
        </div>
      )}
    </div>
  );
}
