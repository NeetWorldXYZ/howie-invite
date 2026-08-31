import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { PIZZA } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Sauce and cheese are painted onto canvases and measured for coverage.
// Pepperoni are placed objects. Order is enforced: sauce, cheese, pep.
export default function T2Pizza() {
  const { advance } = useGame();
  const sauceRef = useRef(null);
  const cheeseRef = useRef(null);
  const wrapRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const soundAt = useRef(0);

  const [step, setStep] = useState(0);
  const [cover, setCover] = useState([0, 0]);
  const [peps, setPeps] = useState([]);
  const [nudge, setNudge] = useState('');
  const [done, setDone] = useState(false);

  const setupCanvas = (cv) => {
    if (!cv || cv.dataset.ready) return;
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = r.width * dpr;
    cv.height = r.height * dpr;
    cv.getContext('2d').scale(dpr, dpr);
    cv.dataset.ready = '1';
  };
  useEffect(() => { setupCanvas(sauceRef.current); setupCanvas(cheeseRef.current); });

  const activeCanvas = () => (step === 0 ? sauceRef.current : step === 1 ? cheeseRef.current : null);

  // measure painted coverage inside the pizza circle
  const measure = () => {
    const cv = activeCanvas();
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
    const w = cv.width, h = cv.height;
    const cx = w / 2, cy = h / 2, rad = Math.min(w, h) / 2 * 0.86;
    let inside = 0, painted = 0;
    for (let y = 0; y < h; y += 6) {
      for (let x = 0; x < w; x += 6) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy > rad * rad) continue;
        inside++;
        if (data[(y * w + x) * 4 + 3] > 40) painted++;
      }
    }
    const p = inside ? painted / inside : 0;
    setCover((c) => { const n = [...c]; n[step] = p; return n; });
  };

  const pos = (e, el) => {
    const r = el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const paint = (e) => {
    const cv = activeCanvas();
    if (!cv || !drawing.current) return;
    e.preventDefault();
    const ctx = cv.getContext('2d');
    const p = pos(e, cv);
    const l = last.current || p;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (step === 0) {
      ctx.strokeStyle = '#9e2b1e';
      ctx.lineWidth = 34;
      ctx.globalAlpha = 0.92;
      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    } else {
      // shredded mozzarella: scatter little strands along the stroke
      ctx.globalAlpha = 1;
      const steps = Math.max(1, Math.round(Math.hypot(p.x - l.x, p.y - l.y) / 4));
      for (let i = 0; i <= steps; i++) {
        const x = l.x + (p.x - l.x) * (i / steps);
        const y = l.y + (p.y - l.y) * (i / steps);
        for (let k = 0; k < 3; k++) {
          const a = Math.random() * Math.PI * 2;
          const d = Math.random() * 20;
          ctx.save();
          ctx.translate(x + Math.cos(a) * d, y + Math.sin(a) * d);
          ctx.rotate(Math.random() * Math.PI);
          ctx.fillStyle = Math.random() > 0.5 ? '#f7e9bd' : '#f2dda3';
          ctx.fillRect(-6, -1.7, 12, 3.4);
          ctx.restore();
        }
      }
    }
    const now = performance.now();
    if (now - soundAt.current > 110) { soundAt.current = now; step === 0 ? sfx.spread() : sfx.sprinkle(); }
    last.current = p;
  };

  const down = (e) => {
    if (step > 1) return;
    e.preventDefault();
    drawing.current = true;
    last.current = null;
    paint(e);
  };
  const up = () => { if (drawing.current) { drawing.current = false; last.current = null; measure(); } };

  const placePep = (e) => {
    if (step !== 2) return;
    const wrap = wrapRef.current;
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const cx = r.width / 2, cy = r.height / 2, rad = Math.min(r.width, r.height) / 2 * 0.84;
    if ((x - cx) ** 2 + (y - cy) ** 2 > rad * rad) return;
    sfx.slap();
    setPeps((p) => [...p, { x, y, r: Math.random() * 360 }]);
  };

  const stepDef = PIZZA.steps[step];
  const progress = step === 2 ? peps.length / stepDef.need : cover[step] / stepDef.need;
  const stepReady = progress >= 1;

  const nextStep = () => {
    sfx.chime();
    if (step === 2) { setDone(true); return; }
    setStep((s) => s + 1);
    setNudge('');
  };

  const tapLocked = () => {
    setNudge(PIZZA.outOfOrder[step] || '');
    sfx.deny();
  };

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{PIZZA.title}</div>
        <h2 className="trial-title">{done ? PIZZA.finalNote : stepDef.hint}</h2>
      </header>

      <div className="pizza-steps">
        {PIZZA.steps.map((s, i) => (
          <button
            key={s.id}
            className={'pstep' + (i === step ? ' on' : '') + (i < step ? ' done' : '')}
            onClick={() => { if (i > step) tapLocked(); }}
          >
            {i < step ? '✓ ' : ''}{s.label}
          </button>
        ))}
      </div>

      <div className="pizza-stage">
        <div
          className="pizza-round"
          ref={wrapRef}
          onPointerDown={(e) => { step === 2 ? placePep(e) : down(e); }}
          onPointerMove={paint}
          onPointerUp={up}
          onPointerLeave={up}
          onPointerCancel={up}
        >
          <div className="pz-crust" />
          <canvas ref={sauceRef} className="pz-layer" />
          <canvas ref={cheeseRef} className="pz-layer" />
          {peps.map((p, i) => (
            <span key={i} className="pz-pep" style={{ left: p.x, top: p.y, transform: `translate(-50%,-50%) rotate(${p.r}deg)` }} />
          ))}
        </div>
      </div>

      <div className="pz-meter">
        <div className="pz-meter-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <div className="slot-msg">{nudge || (stepReady ? stepDef.done : '')}</div>

      {done ? (
        <button className="btn primary block" onClick={() => { sfx.tap(); advance(); }}>{PIZZA.cta}</button>
      ) : (
        <button className="btn primary block" disabled={!stepReady} onClick={nextStep}>
          {stepReady ? (step === 2 ? 'DONE' : 'NEXT') : stepDef.label}
        </button>
      )}
    </div>
  );
}
