import React, { useEffect, useState } from 'react';
import { sfx } from '../sound.js';
import { useGame } from '../GameContext.jsx';

// Full-screen overlay (documents, modals). Tap scrim or CLOSE to dismiss.
export function Overlay({ open, onClose, children, wide }) {
  if (!open) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className={'overlay-panel' + (wide ? ' wide' : '')} onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>
  );
}

// Laminated restaurant reference sheet
export function Laminated({ sheet }) {
  return (
    <div className={'laminated' + (sheet.grease ? ' grease' : '')}>
      <div className="laminated-title">{sheet.title}</div>
      {sheet.sections.map((sec, i) => (
        <div className="laminated-sec" key={i}>
          <div className="laminated-head">{sec.head}</div>
          <table><tbody>
            {sec.rows.map((r, j) => (
              <tr key={j}><td className="lam-code">{r[0]}</td><td>{r[1]}</td></tr>
            ))}
          </tbody></table>
        </div>
      ))}
    </div>
  );
}

// Numeric keypad
export function Keypad({ length = 4, onSubmit, masked = true, label = 'ENTER' }) {
  const [val, setVal] = useState('');
  const press = (d) => {
    sfx.beep();
    if (d === 'C') return setVal('');
    if (d === '<') return setVal((v) => v.slice(0, -1));
    setVal((v) => (v.length < length ? v + d : v));
  };
  return (
    <div className="keypad">
      <div className="keypad-display">
        {Array.from({ length }, (_, i) => (
          <span key={i} className={'keypad-slot' + (val[i] ? ' filled' : '')}>
            {val[i] ? (masked ? '•' : val[i]) : ''}
          </span>
        ))}
      </div>
      <div className="keypad-grid">
        {['1','2','3','4','5','6','7','8','9','C','0','<'].map((d) => (
          <button key={d} className="key" onClick={() => press(d)}>{d}</button>
        ))}
      </div>
      <button
        className="btn primary keypad-submit"
        disabled={val.length !== length}
        onClick={() => { const v = val; setVal(''); onSubmit(v); }}
      >
        {label}
      </button>
    </div>
  );
}

// Hint button with score penalty. `hints` is an array; each press reveals the next.
export function HintButton({ hints, id }) {
  const { state, stat, setStepData } = useGame();
  const used = state.stepData[`hints_${id}`] || 0;
  const [shown, setShown] = useState(false);
  const reveal = () => {
    sfx.paper();
    if (!shown && used < hints.length) {
      setStepData(`hints_${id}`, used + 1);
      stat('hintsUsed');
    }
    setShown(true);
  };
  return (
    <div className="hint-wrap">
      {shown && used > 0 && (
        <div className="hint-box">
          {hints.slice(0, used).map((h, i) => <p key={i}><span className="hint-n">HINT {i + 1}</span> {h}</p>)}
          {used < hints.length
            ? <button className="btn ghost small" onClick={reveal}>ANOTHER HINT (−)</button>
            : <div className="hint-exhausted">That's all the help there is.</div>}
          <button className="btn ghost small" onClick={() => setShown(false)}>HIDE</button>
        </div>
      )}
      {(!shown || used === 0) && (
        <button className="hint-btn" onClick={reveal}>
          {used > 0 ? 'HINTS' : 'HINT (affects your evaluation)'}
        </button>
      )}
    </div>
  );
}

// Step frame with title strip
export function StepShell({ kicker, title, children, className = '' }) {
  return (
    <div className={'step-shell ' + className}>
      {(kicker || title) && (
        <header className="step-head">
          {kicker && <div className="step-kicker">{kicker}</div>}
          {title && <h2 className="step-title">{title}</h2>}
        </header>
      )}
      {children}
    </div>
  );
}

// Brief auto-dismissing toast
export function useToast() {
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.ms || 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const node = toast ? <div className={'toast ' + (toast.kind || '')}>{toast.text}</div> : null;
  return [node, (text, kind, ms) => setToast({ text, kind, ms })];
}
