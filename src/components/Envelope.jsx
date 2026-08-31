import React, { useState } from 'react';
import { useGame } from '../GameContext.jsx';
import { sfx } from '../sound.js';
import { LEAGUE_YEAR } from '../config.js';

export default function Envelope() {
  const { state, dispatch } = useGame();
  const [opening, setOpening] = useState(false);

  if (state.phase === 'invitation') {
    return (
      <div className="envelope-scene">
        <div className="invitation-card">
          <div className="inv-kicker">Official Invitation</div>
          <div className="inv-rule" />
          <p className="inv-fine">By order of the Commissioner,</p>
          <p>
            You have been selected for consideration for membership in the{' '}
            <span className="inv-strong">{LEAGUE_YEAR} Hungry Homies Fantasy Football League</span>.
          </p>
          <p className="inv-fine">This invitation does not guarantee admission.</p>
          <p>
            League bylaws require all prospective owners to successfully complete{' '}
            <span className="inv-strong">one shift</span> before being granted entry.
          </p>
          <div className="inv-rule" />
          <p className="inv-strong" style={{ letterSpacing: '0.12em' }}>Report for duty immediately.</p>
        </div>
        <button
          className="btn primary"
          style={{ marginTop: 26, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          onClick={() => { sfx.punch(); dispatch({ type: 'BEGIN_SHIFT' }); }}
        >
          BEGIN SHIFT
        </button>
        <div style={{ height: 40 }} />
      </div>
    );
  }

  const open = () => {
    if (opening) return;
    setOpening(true);
    sfx.paper();
    setTimeout(() => sfx.chime(), 700);
    setTimeout(() => dispatch({ type: 'PHASE', phase: 'invitation' }), 2100);
  };

  return (
    <div className="envelope-scene">
      <div className="chosen-text">You have been chosen.</div>

      <div className={'envelope' + (opening ? ' open' : '')} onClick={open}>
        <div className="env-body" />
        <div className="env-letter">
          <div className="env-letter-preview">OFFICIAL&nbsp;INVITATION</div>
        </div>
        <div className="env-pocket" />
        <div className="env-flap">
          <div className="env-flap-front" />
          <div className="env-flap-back" />
        </div>
        <div className="env-seal">
          <div className="env-seal-inner">
            HH
            <small>EST. FOREVER</small>
          </div>
        </div>
      </div>

      {!opening && (
        <button className="btn primary open-cta" onClick={open}>
          OPEN INVITATION
        </button>
      )}
    </div>
  );
}
