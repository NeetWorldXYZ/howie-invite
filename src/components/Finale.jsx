import React, { useEffect, useRef } from 'react';
import { useGame } from '../GameContext.jsx';
import { FINALE } from '../data/trials.js';
import { LEAGUE_INVITE_URL } from '../config.js';
import { storage, getInviteToken } from '../persistence.js';
import { sfx } from '../sound.js';
import { HowieJesus } from './art.jsx';

export default function Finale() {
  const { state, reset } = useGame();
  const submitted = useRef(false);

  useEffect(() => { sfx.heaven(); }, []);

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
    <div className="heaven">
      <div className="heaven-light" />
      <div className="heaven-motes" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ '--x': `${(i * 5.7) % 100}%`, '--d': `${(i % 9) * 1.1}s`, '--s': `${8 + (i % 4) * 2.5}s` }} />
        ))}
      </div>

      <HowieJesus width={250} />

      <p className="heaven-line">{FINALE.blessing}</p>
      <div className="heaven-rule" />
      <div className="heaven-league">{FINALE.league}</div>
      <div className="heaven-year">{FINALE.year}</div>

      {LEAGUE_INVITE_URL ? (
        <a className="btn primary big heaven-cta" href={LEAGUE_INVITE_URL} target="_blank" rel="noreferrer">
          {FINALE.cta}
        </a>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <button className="btn primary big heaven-cta" onClick={() => sfx.deny()}>{FINALE.cta}</button>
          <div className="heaven-note" style={{ whiteSpace: 'pre-line' }}>{FINALE.noUrl}</div>
        </div>
      )}

      {/* the finale must never be a dead end */}
      <button className="run-again heaven-again" onClick={() => { sfx.tap(); reset(); }}>
        RUN IT AGAIN
      </button>
    </div>
  );
}
