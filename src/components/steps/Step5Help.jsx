import React, { useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { STOREHELP, TICKET_CREATED_TEXT } from '../../data/storehelp.js';
import { InboxView } from '../docs.jsx';
import { StepShell, Overlay, HintButton, useToast } from '../common.jsx';
import { sfx } from '../../sound.js';

export default function Step5Help() {
  const { advance, stat, unlockBinder } = useGame();
  // broken -> hold -> login -> inbox -> compose -> sent
  const [phase, setPhase] = useState('broken');
  const [clue, setClue] = useState(null);
  const [pw, setPw] = useState('');
  const [form, setForm] = useState({ store: '', errorCode: '', callback: '' });
  const [toast, showToast] = useToast();

  const clues = STOREHELP.clues;

  const tryLogin = () => {
    if (pw === STOREHELP.email.password) {
      sfx.chime();
      unlockBinder('inbox');
      setPhase('inbox');
    } else {
      stat('storeHelpAttempts');
      sfx.deny();
      showToast('SIGN-IN FAILED\n"Contact your administrator." You are the administrator.', 'bad', 3000);
    }
  };

  const send = () => {
    const a = STOREHELP.composeAnswer;
    if (form.store === a.store && form.errorCode === a.errorCode && form.callback === a.callback) {
      sfx.send();
      setPhase('sent');
      setTimeout(advance, 5200);
    } else {
      stat('storeHelpAttempts');
      sfx.deny();
      showToast('AUTO-REJECTED BY STORE HELP\n"Ticket did not meet requirements. See requirements."', 'bad', 3400);
    }
  };

  const OfficeItems = () => (
    <>
      <div className="muted small" style={{ textAlign: 'center' }}>The office, such as it is:</div>
      <div className="searchable-room">
        <button className="wall-item sticky" onClick={() => { sfx.paper(); setClue('keyboard'); }}>
          <span className="wi-kind">UNDER THE KEYBOARD</span>a yellowed note
        </button>
        <button className="wall-item laminate" onClick={() => { sfx.paper(); setClue('router'); }}>
          <span className="wi-kind">ON THE SHELF</span>the router (one light is orange)
        </button>
        <button className="wall-item paper" onClick={() => { sfx.paper(); setClue('binder'); }}>
          <span className="wi-kind">MANAGER BINDER — "IT STUFF"</span>a page in Dennis's handwriting
        </button>
        <button className="wall-item plaque" onClick={() => { sfx.tap(); setClue('plaque'); }}>
          <span className="wi-kind" style={{ color: 'inherit' }}>ON THE WALL</span>a dusty plaque
        </button>
        <button className="wall-item laminate" style={{ gridColumn: '1 / -1' }} onClick={() => { sfx.paper(); setClue('helpsheet'); }}>
          <span className="wi-kind">TAPED TO THE MONITOR</span>STORE HELP — ESCALATION PROCEDURE (rev. 2019)
        </button>
      </div>

      <Overlay open={clue === 'keyboard'} onClose={() => setClue(null)}>
        <div className="wall-item sticky" style={{ transform: 'none', width: '100%', fontSize: 14, padding: 20, whiteSpace: 'pre-line' }}>
          {clues.keyboardNote}
        </div>
      </Overlay>
      <Overlay open={clue === 'router'} onClose={() => setClue(null)}>
        <div className="paper-doc" style={{ fontFamily: 'var(--mono)' }}>
          <h4>{clues.routerLabel.title}</h4>
          <div>SSID: {clues.routerLabel.ssid}</div>
          <div>WPA2 KEY: <b>{clues.routerLabel.key}</b></div>
          <div className="rc-rule" style={{ borderTop: '1px dashed #999', margin: '8px 0' }} />
          <div style={{ fontSize: 11 }}>{clues.routerLabel.sticker}</div>
        </div>
      </Overlay>
      <Overlay open={clue === 'binder'} onClose={() => setClue(null)}>
        <div className="paper-doc"><span className="pen" style={{ fontSize: 15 }}>{clues.binderNote}</span></div>
      </Overlay>
      <Overlay open={clue === 'plaque'} onClose={() => setClue(null)}>
        <div className="wall-item plaque" style={{ transform: 'none', width: '100%', padding: 26, fontSize: 16 }}>
          {clues.plaque}
        </div>
      </Overlay>
      <Overlay open={clue === 'helpsheet'} onClose={() => setClue(null)}>
        <div className="laminated">
          <div className="laminated-title">{clues.helpSheet.title}</div>
          {clues.helpSheet.lines.map((l, i) => <p key={i} style={{ margin: '7px 0', fontSize: 13, fontFamily: 'var(--mono)' }}>{l}</p>)}
        </div>
      </Overlay>
    </>
  );

  if (phase === 'broken') {
    return (
      <StepShell kicker="9:58 PM" title="Something's wrong.">
        <div className="pos-frame">
          <div className="pos-screen">
            <div className="pos-title">{STOREHELP.breakage.headline}</div>
            <div className="pos-bad" style={{ fontSize: 15, margin: '8px 0' }}>{STOREHELP.breakage.posError}</div>
            <div className="pos-dim" style={{ fontSize: 11 }}>Online orders queue: 6 orders, 0 printing. The phone has started ringing. It will not stop.</div>
            <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 12 }}>{STOREHELP.breakage.routerLights.join('   ')}</div>
          </div>
        </div>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="step-kicker" style={{ marginBottom: 12 }}>CONTACT STORE HELP</div>
          <button className="btn primary" onClick={() => { sfx.phone(); setPhase('hold'); }}>CALL</button>
        </div>
        {toast}
      </StepShell>
    );
  }

  if (phase === 'hold') {
    return (
      <StepShell kicker="STORE HELP LINE" title="">
        <div className="panel hold-screen">
          <div className="step-kicker">YOUR CALL IS IMPORTANT TO US</div>
          <div className="hold-time">ESTIMATED HOLD TIME:<br />2 HOURS 47 MINUTES</div>
          <div className="hold-music">…a saxophone cover of a song you almost recognize…</div>
          <button className="btn block" style={{ marginTop: 24 }} onClick={() => { sfx.tap(); setPhase('login'); }}>
            EMAIL INSTEAD
          </button>
        </div>
        {toast}
      </StepShell>
    );
  }

  if (phase === 'login') {
    return (
      <StepShell kicker="BACK OFFICE" title="The store email.">
        <div className="email-app">
          <div className="email-top"><span>HowieMail — Sign in</span></div>
          <div className="email-body login-box">
            <div className="email-field">
              <label>ACCOUNT</label>
              <input value={STOREHELP.email.username} readOnly style={{ background: '#eef0f3' }} />
            </div>
            <div className="email-field">
              <label>PASSWORD</label>
              <input
                type="text"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                value={pw}
                placeholder="nobody wrote it down. someone wrote it down."
                onChange={(e) => setPw(e.target.value)}
              />
            </div>
            <button className="btn primary block" style={{ marginTop: 6 }} onClick={tryLogin} disabled={!pw}>
              SIGN IN
            </button>
          </div>
        </div>
        <OfficeItems />
        <HintButton id="storehelp" hints={STOREHELP.hints} />
        {toast}
      </StepShell>
    );
  }

  if (phase === 'inbox') {
    return (
      <StepShell kicker="STORE ACCOUNT" title="You're in.">
        <InboxView />
        <p className="muted small" style={{ textAlign: 'center' }}>
          Store Help's auto-reply lists what a ticket must contain.
        </p>
        <button className="btn primary block" onClick={() => { sfx.tap(); setPhase('compose'); }}>
          COMPOSE MESSAGE TO STORE HELP
        </button>
        {toast}
      </StepShell>
    );
  }

  if (phase === 'compose') {
    const opts = STOREHELP.composeOptions;
    return (
      <StepShell kicker="NEW MESSAGE" title="">
        <div className="email-app">
          <div className="email-top"><span>To: storehelp@hhcorp-support.example</span></div>
          <div className="email-body">
            <p style={{ fontSize: 13 }}>Our internet is down and online orders aren't printing. Please advise.</p>
            <div className="email-field">
              <label>STORE NUMBER</label>
              <select value={form.store} onChange={(e) => setForm((f) => ({ ...f, store: e.target.value }))}>
                <option value="">— select —</option>
                {opts.store.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="email-field">
              <label>ERROR CODE ON SCREEN</label>
              <select value={form.errorCode} onChange={(e) => setForm((f) => ({ ...f, errorCode: e.target.value }))}>
                <option value="">— select —</option>
                {opts.errorCode.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="email-field">
              <label>CALLBACK NUMBER</label>
              <select value={form.callback} onChange={(e) => setForm((f) => ({ ...f, callback: e.target.value }))}>
                <option value="">— select —</option>
                {opts.callback.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <button
              className="btn primary block"
              style={{ marginTop: 8 }}
              disabled={!form.store || !form.errorCode || !form.callback}
              onClick={send}
            >
              SEND
            </button>
            <button className="btn ghost block small" style={{ marginTop: 8 }} onClick={() => setPhase('inbox')}>
              ‹ BACK TO INBOX
            </button>
          </div>
        </div>
        {toast}
      </StepShell>
    );
  }

  // sent
  return (
    <StepShell kicker="STORE HELP" title="">
      <div className="pos-screen" style={{ marginTop: 30, textAlign: 'center', padding: '30px 16px' }}>
        <div style={{ fontSize: 16, letterSpacing: '0.18em' }}>TICKET CREATED</div>
        <div className="pos-dim" style={{ marginTop: 10, fontSize: 11.5 }}>{TICKET_CREATED_TEXT}</div>
      </div>
      <p className="muted" style={{ textAlign: 'center', fontStyle: 'italic' }}>
        The router, unprompted, blinks back to life. You tell no one.
      </p>
    </StepShell>
  );
}
