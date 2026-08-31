import React, { useEffect, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { CASH, CASH_QUESTION } from '../../data/cash.js';
import { TransactionLog, DrawerEventLog, SettlementReport, DriverAndSafe, DrawerSummary } from '../docs.jsx';
import { StepShell, useToast } from '../common.jsx';
import { sfx } from '../../sound.js';

const TABS = [
  ['summary', 'RECON'],
  ['log', 'TX LOG'],
  ['events', 'EVENTS'],
  ['settle', 'CARD SETTLE'],
  ['other', 'DRIVER / SAFE'],
];

export default function Step4Cash() {
  const { advance, stat, state, dispatch, unlockBinder } = useGame();
  const [tab, setTab] = useState('summary');
  const [asking, setAsking] = useState(false);
  const [deadOptions, setDeadOptions] = useState([]);
  const [rebuttal, setRebuttal] = useState(null);
  const [solved, setSolved] = useState(false);
  const [toast, showToast] = useToast();

  useEffect(() => {
    unlockBinder('drawer');
    sfx.register();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (opt) => {
    stat('cashAttempts');
    if (opt.correct) {
      sfx.chime();
      setSolved(true);
      // Deposit figure quietly matters again at close.
      setTimeout(advance, 6200);
    } else {
      sfx.deny();
      setDeadOptions((d) => [...d, opt.id]);
      setRebuttal(opt.rebuttal);
    }
  };

  if (solved) {
    return (
      <StepShell kicker="OFFICE — 11:02 PM" title="">
        <div className="pos-screen" style={{ marginTop: 24 }}>
          <div className="pos-title">VARIANCE RECLASSIFIED</div>
          <div className="pos-line"><span>ORDER 1113/1114</span><span className="r">CARD, NOT CASH</span></div>
          <div className="pos-line"><span>FUNDS LOCATION</span><span className="r">PROCESSOR BATCH 0830</span></div>
          <div className="pos-line"><span>ADJUSTED VARIANCE</span><span className="r">$0.00</span></div>
          <div className="pos-line pos-alert" style={{ marginTop: 8 }}>
            <span>DEPOSIT (DROPS + DRAWER − TILL)</span><span className="r">${CASH.depositAmount.toFixed(2)}</span>
          </div>
          <div className="pos-dim" style={{ marginTop: 10, fontSize: 11 }}>
            Write that number somewhere. Or don't. The POS doesn't care about you either way.
          </div>
        </div>
        <p className="muted" style={{ textAlign: 'center', fontStyle: 'italic' }}>
          Dennis, without looking up: "Huh. Took the auditor a week."
        </p>
      </StepShell>
    );
  }

  return (
    <StepShell kicker="OFFICE — CLOSE-OUT" title="The drawer is short.">
      <div className="pos-frame">
        <div className="pos-screen" style={{ textAlign: 'center' }}>
          <div className="pos-title">CLOSING DRAWER DISCREPANCY</div>
          <div className="pos-bad" style={{ fontSize: 34, letterSpacing: '0.04em', padding: '6px 0' }}>−$37.84</div>
          <div className="pos-dim" style={{ fontSize: 11 }}>Corporate threshold for "incident report": $25.00</div>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={'tab' + (tab === id ? ' on' : '')} onClick={() => { sfx.tap(); setTab(id); }}>{label}</button>
        ))}
      </div>

      {tab === 'summary' && <DrawerSummary />}
      {tab === 'log' && <TransactionLog />}
      {tab === 'events' && <DrawerEventLog />}
      {tab === 'settle' && <SettlementReport />}
      {tab === 'other' && <DriverAndSafe />}

      <div className="notepad">
        <textarea
          value={state.notes}
          placeholder="manager's notepad — optional. nobody reads these until a deposition."
          onChange={(e) => dispatch({ type: 'NOTES', value: e.target.value })}
        />
      </div>

      {!asking ? (
        <button className="btn primary block" onClick={() => { sfx.tap(); setAsking(true); }}>
          I KNOW WHAT HAPPENED
        </button>
      ) : (
        <div className="panel">
          <div className="step-kicker" style={{ marginBottom: 10 }}>{CASH_QUESTION.prompt}</div>
          <div className="choice-list">
            {CASH_QUESTION.options.map((o) => (
              <button key={o.id} className={'choice' + (deadOptions.includes(o.id) ? ' dead' : '')} onClick={() => pick(o)}>
                {o.text}
              </button>
            ))}
          </div>
          {rebuttal && (
            <div className="rebuttal" style={{ marginTop: 10 }}>
              <b>DOESN'T RECONCILE</b>
              {rebuttal}
            </div>
          )}
        </div>
      )}
      {toast}
    </StepShell>
  );
}
