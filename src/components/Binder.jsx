import React, { useState } from 'react';
import { Overlay } from './common.jsx';
import { useGame } from '../GameContext.jsx';
import {
  ReferenceSheets, TransactionLog, DrawerEventLog, SettlementReport,
  DriverAndSafe, DrawerSummary, InboxView, JakeFile,
} from './docs.jsx';

// THE MANAGER BINDER — everything the player has earned access to
// during the shift, revisitable at any time. Step 7 depends on it.
export default function Binder({ open, onClose }) {
  const { state, dispatch } = useGame();
  const [section, setSection] = useState(null);
  const [cashTab, setCashTab] = useState('summary');

  const sections = [
    state.binder.sheets && { id: 'sheets', label: 'MAKELINE REFERENCE' },
    state.binder.drawer && { id: 'drawer', label: 'DRAWER INVESTIGATION' },
    state.binder.inbox && { id: 'inbox', label: 'STORE EMAIL' },
    state.binder.jake && { id: 'jake', label: 'EMPLOYEE FILE — J. RENNER' },
    { id: 'notes', label: 'YOUR NOTES' },
  ].filter(Boolean);

  const cashTabs = [
    ['summary', 'RECON'], ['log', 'TX LOG'], ['events', 'EVENTS'],
    ['settle', 'CARD SETTLE'], ['other', 'DRIVER/SAFE'],
  ];

  return (
    <Overlay open={open} onClose={() => { setSection(null); onClose(); }} wide>
      <div className="panel" style={{ minHeight: 200 }}>
        <div className="step-kicker" style={{ marginBottom: 10 }}>MANAGER BINDER</div>
        {!section ? (
          <div className="choice-list">
            {sections.map((s) => (
              <button key={s.id} className="choice" onClick={() => setSection(s.id)}>{s.label}</button>
            ))}
            {sections.length === 1 && (
              <div className="muted small">Documents you encounter during the shift get filed here.</div>
            )}
          </div>
        ) : (
          <>
            <button className="btn ghost small" style={{ marginBottom: 12 }} onClick={() => setSection(null)}>
              ‹ BINDER INDEX
            </button>
            {section === 'sheets' && <ReferenceSheets />}
            {section === 'drawer' && (
              <div>
                <div className="tabs" style={{ marginBottom: 10 }}>
                  {cashTabs.map(([id, label]) => (
                    <button key={id} className={'tab' + (cashTab === id ? ' on' : '')} onClick={() => setCashTab(id)}>{label}</button>
                  ))}
                </div>
                {cashTab === 'summary' && <DrawerSummary />}
                {cashTab === 'log' && <TransactionLog />}
                {cashTab === 'events' && <DrawerEventLog />}
                {cashTab === 'settle' && <SettlementReport />}
                {cashTab === 'other' && <DriverAndSafe />}
              </div>
            )}
            {section === 'inbox' && <InboxView />}
            {section === 'jake' && <JakeFile />}
            {section === 'notes' && (
              <div className="notepad">
                <textarea
                  value={state.notes}
                  placeholder="manager's notepad…"
                  onChange={(e) => dispatch({ type: 'NOTES', value: e.target.value })}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Overlay>
  );
}
