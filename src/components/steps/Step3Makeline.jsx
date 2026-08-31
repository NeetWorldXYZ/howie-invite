import React, { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { TICKET, TOPPINGS, SAUCES, FLAVORS, CUTS, SIZES, validatePizza, diagnosePizza, FAIL_LINES } from '../../data/makeline.js';
import { ReferenceSheets } from '../docs.jsx';
import { StepShell, Overlay, useToast } from '../common.jsx';
import { sfx } from '../../sound.js';

const FLAVOR_COLORS = {
  BTR: '#e8c96a', GHB: '#9aa85a', CAJ: '#b5502a', SES: '#d8c9a0', RCH: '#e3ddc8', ASG: '#e0d3a8',
};

// deterministic-ish scatter for topping bits
function scatter(count, side, seed) {
  const bits = [];
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand()) * 33;
    let x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius * 0.92;
    if (side === 'left') x = 50 - Math.abs(x - 50) * 0.86 - 4;
    if (side === 'right') x = 50 + Math.abs(x - 50) * 0.86 + 4;
    bits.push({ x, y, r: rand() * 360 });
  }
  return bits;
}

function ToppingBits({ code, side }) {
  const t = TOPPINGS[code];
  const bits = useMemo(() => scatter(code === 'PEP' || code === 'ITS' ? 11 : 9, side, code.charCodeAt(0) * 7 + (side === 'left' ? 13 : side === 'right' ? 29 : 41)), [code, side]);
  const sq = code === 'GPP' || code === 'ONI';
  return bits.map((b, i) => (
    <span
      key={i}
      className={'topping-bit' + (sq ? ' sq' : '')}
      style={{
        left: `${b.x}%`, top: `${b.y}%`,
        width: code === 'PEP' ? 13 : 10, height: code === 'PEP' ? 13 : sq ? 4 : 10,
        background: t.color,
        transform: `translate(-50%,-50%) rotate(${b.r}deg)`,
      }}
    />
  ));
}

export default function Step3Makeline() {
  const { advance, stat, unlockBinder } = useGame();
  const [phase, setPhase] = useState('printing'); // printing | build | x14 | done
  const [printed, setPrinted] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [toast, showToast] = useToast();

  const [pz, setPz] = useState({
    size: null, sauce: null, sauceLadle: null, cheeseCups: null,
    left: [], right: [], flavor: null, cut: null,
  });
  const [activeTopping, setActiveTopping] = useState(null);

  useEffect(() => {
    unlockBinder('sheets');
    const t1 = setTimeout(() => { sfx.printer(); setPrinted(true); }, 700);
    const t2 = setTimeout(() => setPhase('build'), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTopping = (side) => {
    if (!activeTopping) return;
    sfx.splat();
    setPz((p) => {
      const clean = {
        left: p.left.filter((c) => c !== activeTopping),
        right: p.right.filter((c) => c !== activeTopping),
      };
      if (side === 'whole') {
        return { ...p, left: [...clean.left, activeTopping], right: [...clean.right, activeTopping] };
      }
      return { ...p, ...clean, [side]: [...clean[side], activeTopping] };
    });
    setActiveTopping(null);
  };

  const removeTopping = (side, code) => {
    sfx.tap();
    setPz((p) => ({ ...p, [side]: p[side].filter((c) => c !== code) }));
  };

  const sendIt = () => {
    stat('makelineAttempts');
    if (validatePizza(pz)) {
      sfx.chime();
      setPhase('x14');
      setTimeout(() => sfx.printer(), 1600);
      setTimeout(() => setPhase('done'), 2400);
      setTimeout(advance, 7200);
    } else {
      sfx.deny();
      const n = failCount + 1;
      setFailCount(n);
      // After 3 failures the feedback starts narrowing it down.
      const line = FAIL_LINES[Math.min(n - 1, FAIL_LINES.length - 1)];
      const diag = n >= 3 ? '\n' + diagnosePizza(pz) : '';
      showToast(line + diag, 'bad', 3400);
    }
  };

  const Ticket = ({ small }) => (
    <div className="receipt" style={small ? { transform: 'scale(0.94)' } : undefined}>
      {TICKET.header.map((h, i) => <div key={i} className={i === 0 ? 'rc-center rc-big' : 'rc-center'}>{h}</div>)}
      <div className="rc-rule" />
      {TICKET.lines.map((l, i) => <div key={i} style={{ whiteSpace: 'pre' }}>{l}</div>)}
      <div className="rc-rule" />
      <div>NAME: {TICKET.customer}</div>
    </div>
  );

  if (phase === 'printing') {
    return (
      <StepShell kicker="MAKELINE" title="">
        <div className="printer-wrap" style={{ marginTop: 30 }}>
          <div className="printer"><div className={'printer-led' + (printed ? ' busy' : '')} /></div>
          <div className={'ticket-out' + (printed ? ' printed' : '')}>
            <Ticket />
          </div>
        </div>
      </StepShell>
    );
  }

  if (phase === 'x14' || phase === 'done') {
    return (
      <StepShell kicker="MAKELINE" title="">
        <div className="printer-wrap" style={{ marginTop: 30 }}>
          <div className="printer"><div className={'printer-led' + (phase === 'x14' ? '' : ' busy')} /></div>
          {phase === 'done' && (
            <div className="ticket-out printed">
              <div className="receipt">
                <div className="rc-center rc-big">TKT 048&nbsp;&nbsp;8:41 PM</div>
                <div className="rc-rule" />
                <div className="rc-center rc-big" style={{ fontSize: 18, padding: '8px 0' }}>SAME ORDER × 14</div>
                <div className="rc-rule" />
                <div className="rc-center">NAME: RANDY (AGAIN)</div>
                <div className="rc-center" style={{ fontSize: 10 }}>"for the guys"</div>
              </div>
            </div>
          )}
        </div>
        {phase === 'x14' && (
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div className="step-kicker">ORDER CORRECT</div>
            <p className="muted">The pizza goes down the belt.</p>
          </div>
        )}
        {phase === 'done' && (
          <p className="muted" style={{ textAlign: 'center', marginTop: 26, fontStyle: 'italic' }}>
            Dennis takes the tickets off the printer. "I'll take these. Go count the drawer."
          </p>
        )}
      </StepShell>
    );
  }

  const sauceOn = pz.sauce && pz.sauce !== 'NS' && pz.sauceLadle;
  const pizzaPx = pz.size === 'SM' ? 190 : pz.size === 'MD' ? 220 : pz.size === 'LG' ? 252 : pz.size === 'XL' ? 286 : 210;

  return (
    <StepShell kicker="MAKELINE" title="Build the order.">
      <div className="docs-row">
        <button className="doc-chip gold" onClick={() => { sfx.paper(); setTicketOpen(true); }}>◈ ORDER TICKET</button>
        <button className="doc-chip" onClick={() => { sfx.paper(); setDocsOpen(true); }}>REFERENCE SHEETS</button>
      </div>

      <div className="pizza-builder">
        <div className="pizza-stage">
          <div className="pizza" style={{ width: pizzaPx, height: pizzaPx * 0.96 }}>
            {sauceOn && (
              <div className="sauce-layer" style={{
                background: `radial-gradient(circle at 48% 45%, ${SAUCES[pz.sauce].color}, ${SAUCES[pz.sauce].color}dd)`,
                opacity: 0.55 + Math.min(0.4, (pz.sauceLadle || 0) * 0.05),
              }} />
            )}
            {pz.cheeseCups && <div className="cheese-layer" style={{ opacity: 0.55 + Math.min(0.4, pz.cheeseCups * 0.09) }} />}
            {pz.left.map((c) => <ToppingBits key={'l' + c} code={c} side="left" />)}
            {pz.right.map((c) => <ToppingBits key={'r' + c} code={c} side="right" />)}
            {(pz.left.length > 0 || pz.right.length > 0) && <div className="half-divider" />}
            {pz.flavor && <div className="crust-flavor" style={{ borderColor: FLAVOR_COLORS[pz.flavor] + '99' }} />}
            <div className="pizza-cut-label">
              {pz.size ? SIZES[pz.size] : '—'}{pz.flavor ? ` · ${FLAVORS[pz.flavor]} crust` : ''}{pz.cut ? ` · ${CUTS[pz.cut]}` : ''}
            </div>
          </div>
        </div>

        <div className="builder-controls">
          <div className="ctl-group">
            <div className="ctl-label">DOUGH</div>
            <div className="ctl-row">
              {Object.keys(SIZES).map((s) => (
                <button key={s} className={'chip' + (pz.size === s ? ' sel' : '')} onClick={() => { sfx.tap(); setPz((p) => ({ ...p, size: s })); }}>{s} {SIZES[s]}</button>
              ))}
            </div>
          </div>

          <div className="ctl-group">
            <div className="ctl-label">SAUCE</div>
            <div className="ctl-row">
              {Object.keys(SAUCES).map((s) => (
                <button key={s} className={'chip' + (pz.sauce === s ? ' sel' : '')} onClick={() => { sfx.tap(); setPz((p) => ({ ...p, sauce: s, sauceLadle: s === 'NS' ? 0 : p.sauceLadle })); }}>{SAUCES[s].name}</button>
              ))}
            </div>
            {pz.sauce && pz.sauce !== 'NS' && (
              <div className="ctl-row" style={{ marginTop: 8 }}>
                {[3, 4, 6, 8].map((oz) => (
                  <button key={oz} className={'chip' + (pz.sauceLadle === oz ? ' sel' : '')} onClick={() => { sfx.splat(); setPz((p) => ({ ...p, sauceLadle: oz })); }}>{oz} oz ladle</button>
                ))}
              </div>
            )}
          </div>

          <div className="ctl-group">
            <div className="ctl-label">CHEESE (8 OZ CUPS)</div>
            <div className="ctl-row">
              {[1, 2, 3, 4, 5].map((c) => (
                <button key={c} className={'chip' + (pz.cheeseCups === c ? ' sel' : '')} onClick={() => { sfx.splat(); setPz((p) => ({ ...p, cheeseCups: c })); }}>{c}</button>
              ))}
              <button className={'chip' + (pz.cheeseCups === 0 ? ' sel' : '')} onClick={() => { sfx.tap(); setPz((p) => ({ ...p, cheeseCups: 0 })); }}>none</button>
            </div>
          </div>

          <div className="ctl-group">
            <div className="ctl-label">TOPPINGS — pick one, then place it</div>
            <div className="ctl-row">
              {Object.keys(TOPPINGS).map((c) => (
                <button key={c} className={'chip' + (activeTopping === c ? ' sel' : '')} onClick={() => { sfx.tap(); setActiveTopping((a) => (a === c ? null : c)); }}>{TOPPINGS[c].name}</button>
              ))}
            </div>
            {activeTopping && (
              <div className="half-target">
                <button className="chip wide" onClick={() => applyTopping('left')}>← LEFT HALF</button>
                <button className="chip wide" onClick={() => applyTopping('whole')}>WHOLE</button>
                <button className="chip wide" onClick={() => applyTopping('right')}>RIGHT HALF →</button>
              </div>
            )}
            {(pz.left.length > 0 || pz.right.length > 0) && (
              <div style={{ marginTop: 10, fontSize: 11.5, fontFamily: 'var(--mono)', color: 'var(--cream-dim)', lineHeight: 1.9 }}>
                <div>L: {pz.left.map((c) => (
                  <button key={c} className="chip" style={{ padding: '2px 7px', fontSize: 10, marginRight: 4 }} onClick={() => removeTopping('left', c)}>{c} ✕</button>
                ))}{pz.left.length === 0 && '—'}</div>
                <div>R: {pz.right.map((c) => (
                  <button key={c} className="chip" style={{ padding: '2px 7px', fontSize: 10, marginRight: 4 }} onClick={() => removeTopping('right', c)}>{c} ✕</button>
                ))}{pz.right.length === 0 && '—'}</div>
              </div>
            )}
          </div>

          <div className="ctl-group">
            <div className="ctl-label">CRUST FLAVOR (RUB)</div>
            <div className="ctl-row">
              {Object.keys(FLAVORS).map((f) => (
                <button key={f} className={'chip' + (pz.flavor === f ? ' sel' : '')} onClick={() => { sfx.tap(); setPz((p) => ({ ...p, flavor: f })); }}>{FLAVORS[f]}</button>
              ))}
            </div>
          </div>

          <div className="ctl-group">
            <div className="ctl-label">CUT</div>
            <div className="ctl-row">
              {Object.keys(CUTS).map((c) => (
                <button key={c} className={'chip' + (pz.cut === c ? ' sel' : '')} onClick={() => { sfx.tap(); setPz((p) => ({ ...p, cut: c })); }}>{CUTS[c]}</button>
              ))}
            </div>
          </div>

          <button
            className="btn primary block"
            disabled={!pz.size || !pz.sauce || pz.cheeseCups == null || !pz.flavor || !pz.cut}
            onClick={sendIt}
          >
            SEND TO OVEN
          </button>
        </div>
      </div>

      {toast}

      <Overlay open={ticketOpen} onClose={() => setTicketOpen(false)}>
        <Ticket />
      </Overlay>
      <Overlay open={docsOpen} onClose={() => setDocsOpen(false)} wide>
        <div className="panel"><ReferenceSheets /></div>
      </Overlay>
    </StepShell>
  );
}
