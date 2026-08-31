import React, { useState } from 'react';
import { Laminated } from './common.jsx';
import { REFERENCE_SHEETS } from '../data/makeline.js';
import { CASH, TRANSACTIONS, DRAWER_EVENTS, CARD_SETTLEMENT, DRIVER_SHEET, SAFE_SHEET, CLOCK_LOG } from '../data/cash.js';
import { INBOX } from '../data/storehelp.js';
import { JAKE } from '../data/jake.js';
import { sfx } from '../sound.js';

const money = (n) => (n < 0 ? '−$' : '$') + Math.abs(n).toFixed(2);

// ---------- Makeline reference sheets ----------
export function ReferenceSheets() {
  const [openId, setOpenId] = useState(REFERENCE_SHEETS[0].id);
  return (
    <div>
      <div className="docs-row">
        {REFERENCE_SHEETS.map((s) => (
          <button
            key={s.id}
            className={'doc-chip' + (openId === s.id ? ' gold' : '')}
            onClick={() => { sfx.paper(); setOpenId(s.id); }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <Laminated sheet={REFERENCE_SHEETS.find((s) => s.id === openId)} />
    </div>
  );
}

// ---------- Step 4 records ----------
export function TransactionLog() {
  return (
    <div className="pos-screen">
      <div className="pos-title">POS TRANSACTION LOG — 8/30</div>
      <div className="ledger">
        {TRANSACTIONS.map((tx) => (
          <div key={tx.id}>
            <div className={'ledger-row' + (tx.voided ? ' voided' : '')}>
              <span className="t">{tx.t}</span>
              <span>#{tx.id} {tx.refund ? 'REFUND' : 'SALE'} {tx.tender}</span>
              <span className="amt">{money(tx.amt)}</span>
            </div>
            {tx.voided && (
              <div className="ledger-note ledger-flag">
                VOID {tx.voided} — {tx.voidBy} — "{tx.voidReason}"
              </div>
            )}
            {tx.note && <div className="ledger-note">{tx.note}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DrawerEventLog() {
  return (
    <div className="pos-screen">
      <div className="pos-title">DRAWER / SAFE EVENT LOG</div>
      <div className="ledger">
        {DRAWER_EVENTS.map((e, i) => (
          <div className="ledger-row" key={i}>
            <span className="t">{e.t}</span>
            <span>{e.ev}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettlementReport() {
  return (
    <div className="paper-doc">
      <h4>{CARD_SETTLEMENT.title}</h4>
      <table><tbody>
        {CARD_SETTLEMENT.lines.map(([k, v], i) => (
          <tr key={i}><td>{k}</td><td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{v}</td></tr>
        ))}
      </tbody></table>
      <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11 }}>
        {CARD_SETTLEMENT.detail.map((d, i) => <div key={i}>{d}</div>)}
      </div>
    </div>
  );
}

export function DriverAndSafe() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="paper-doc">
        <h4>{DRIVER_SHEET.title}</h4>
        <table><tbody>
          {DRIVER_SHEET.lines.map(([k, v], i) => (
            <tr key={i}><td>{k}</td><td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{v}</td></tr>
          ))}
        </tbody></table>
        <div className="pen" style={{ marginTop: 8 }}>{DRIVER_SHEET.note}</div>
      </div>
      <div className="paper-doc">
        <h4>{SAFE_SHEET.title}</h4>
        <table><tbody>
          {SAFE_SHEET.lines.map(([k, v], i) => (
            <tr key={i}><td>{k}</td><td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{v}</td></tr>
          ))}
        </tbody></table>
      </div>
      <div className="pos-screen">
        <div className="pos-title">CLOCK PUNCHES — 8/30</div>
        {CLOCK_LOG.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

export function DrawerSummary() {
  return (
    <div className="pos-screen">
      <div className="pos-title">CLOSING DRAWER RECONCILIATION</div>
      <div className="pos-line"><span>STARTING TILL</span><span className="r">{money(CASH.startingTill)}</span></div>
      <div className="pos-line"><span>CASH SALES (POS)</span><span className="r">$240.45</span></div>
      <div className="pos-line"><span>CASH REFUNDS</span><span className="r">−$18.92</span></div>
      <div className="pos-line"><span>SAFE DROPS</span><span className="r">−{money(CASH.safeDropTotal).slice(1)}</span></div>
      <div className="pos-line"><span>EXPECTED IN DRAWER</span><span className="r">{money(CASH.expected)}</span></div>
      <div className="pos-line"><span>COUNTED</span><span className="r">{money(CASH.counted)}</span></div>
      <div className="pos-line pos-bad"><span>VARIANCE</span><span className="r">−$37.84</span></div>
    </div>
  );
}

// ---------- Step 5 inbox ----------
export function InboxView({ extraEmails = [], onOpenEmail }) {
  const [openId, setOpenId] = useState(null);
  const emails = [...extraEmails, ...INBOX];
  const open = emails.find((e) => e.id === openId);

  if (open) {
    return (
      <div className="email-app">
        <div className="email-top">
          <span onClick={() => setOpenId(null)} style={{ cursor: 'pointer' }}>‹ Inbox</span>
          <span style={{ fontSize: 11, opacity: 0.8 }}>store4471</span>
        </div>
        <div className="email-body">
          <div className="eh">
            <b>{open.subject}</b><br />
            {open.from}<br />
            {open.time}
          </div>
          {open.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    );
  }

  return (
    <div className="email-app">
      <div className="email-top"><span>Inbox — {emails.length}</span><span style={{ fontSize: 11, opacity: 0.8 }}>HowieMail</span></div>
      {emails.map((e) => (
        <button
          key={e.id}
          className={'email-row' + (e.unread ? ' unread' : '')}
          onClick={() => { sfx.tap(); setOpenId(e.id); onOpenEmail && onOpenEmail(e.id); }}
        >
          <span className="et">{e.time}</span>
          <span className="ef">{e.from.split('<')[0].trim()}</span>
          <span className="es">{e.subject}</span>
        </button>
      ))}
    </div>
  );
}

// ---------- Step 6 Jake file ----------
export function JakeFile() {
  const tabs = [
    { id: 'punches', label: 'PUNCHES' },
    { id: 'writeups', label: 'WRITE-UPS' },
    { id: 'incident', label: 'INCIDENT 8/26' },
    { id: 'texts', label: 'TEXTS' },
    { id: 'notes', label: 'MGR NOTES' },
    { id: 'complaint', label: 'COMPLAINT' },
  ];
  const [tab, setTab] = useState('punches');
  const f = JAKE.file;

  return (
    <div className="folder">
      <div className="folder-tab-strip">
        <span>EMPLOYEE FILE — {JAKE.name}</span>
        <span>HIRED {JAKE.hired}</span>
      </div>
      <div className="tabs" style={{ padding: '4px 8px' }}>
        {tabs.map((t) => (
          <button key={t.id} className={'tab' + (tab === t.id ? ' on' : '')} style={tab === t.id ? undefined : { color: '#4d3f1a', borderColor: 'rgba(77,63,26,0.4)' }} onClick={() => { sfx.paper(); setTab(t.id); }}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="folder-inner">
        {tab === 'punches' && (
          <>
            <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--mono)', fontSize: 12 }}>{f.punches.title}</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--mono)' }}>
                <tbody>
                  {f.punches.rows.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(38,36,31,0.12)' }}>
                      {r.map((c, j) => <td key={j} style={{ padding: '4px 3px', whiteSpace: 'nowrap' }}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small" style={{ marginTop: 10 }}>{f.punches.note}</p>
          </>
        )}
        {tab === 'writeups' && (
          <>
            <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--mono)', fontSize: 12 }}>{f.writeups.title}</h4>
            {f.writeups.rows.map((w, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(38,36,31,0.15)', padding: '8px 0' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600 }}>{w.date} — {w.type}</div>
                <div style={{ fontSize: 13, margin: '4px 0' }}>{w.text}</div>
                {w.signed && <div className="pen">{w.signed}</div>}
              </div>
            ))}
          </>
        )}
        {tab === 'incident' && (
          <>
            <h4 style={{ margin: '0 0 4px', fontFamily: 'var(--mono)', fontSize: 12 }}>{f.incident.title}</h4>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, marginBottom: 8 }}>{f.incident.by}</div>
            {f.incident.lines.map((l, i) => <p key={i} style={{ fontSize: 13, margin: '6px 0' }}>{l}</p>)}
          </>
        )}
        {tab === 'texts' && (
          <div className="texts-phone">
            <div className="texts-header">{f.texts.title}</div>
            <div className="texts">
              {f.texts.thread.map((m, i) => (
                <div key={i} className={'text-bubble ' + m.who.toLowerCase()}>
                  {m.msg}
                  <div className="text-when">{m.when}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'notes' && (
          <>
            <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--mono)', fontSize: 12 }}>{f.managerNotes.title}</h4>
            {f.managerNotes.lines.map((l, i) => <p key={i} className="pen" style={{ margin: '7px 0' }}>{l}</p>)}
          </>
        )}
        {tab === 'complaint' && (
          <>
            <h4 style={{ margin: '0 0 8px', fontFamily: 'var(--mono)', fontSize: 12 }}>{f.complaint.title}</h4>
            {f.complaint.lines.map((l, i) => <p key={i} style={{ fontSize: 13, margin: '6px 0' }}>{l}</p>)}
          </>
        )}
      </div>
    </div>
  );
}
