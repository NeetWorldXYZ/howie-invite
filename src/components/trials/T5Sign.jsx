import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { SIGN } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// You sign first. You read second. That is the joke.
export default function T5Sign() {
  const { advance, stat } = useGame();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPt = useRef(null);
  const inkRef = useRef(0);
  const [ink, setInk] = useState(0);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = rect.width * dpr;
    cv.height = rect.height * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1a3a8a';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [signed]);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPt.current = pos(e);
  };

  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    const l = lastPt.current || p;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    inkRef.current += Math.hypot(p.x - l.x, p.y - l.y);
    setInk(inkRef.current);
    lastPt.current = p;
  };

  const up = () => { drawing.current = false; lastPt.current = null; };

  const commit = () => {
    stat('signatureInk', inkRef.current);
    sfx.seal();
    setSigned(true);
  };

  const clear = () => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    inkRef.current = 0;
    setInk(0);
    sfx.tap();
  };

  if (signed) {
    return (
      <div className="trial">
        <header className="trial-head">
          <div className="trial-kicker">{SIGN.afterTitle}</div>
          <h2 className="trial-title">{SIGN.afterSub}</h2>
        </header>
        <div className="terms-open">
          <ol>
            {SIGN.terms.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>
        <button className="btn primary block" onClick={() => { sfx.tap(); advance(); }}>
          {SIGN.cta}
        </button>
      </div>
    );
  }

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{SIGN.title}</div>
        <h2 className="trial-title">{SIGN.sub}</h2>
      </header>

      <div className="contract">
        <div className="contract-head">{SIGN.scrollTerms}</div>
        <div className="terms-blur" aria-hidden="true">
          <div className="terms-crawl">
            {[...SIGN.terms, ...SIGN.terms].map((t, i) => <p key={i}>{t}</p>)}
          </div>
        </div>
        <div className="sign-row">
          <canvas
            ref={canvasRef}
            className="sign-pad"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerLeave={up}
            onPointerCancel={up}
          />
          <div className="sign-line">✕ ________________________</div>
        </div>
        <div className="sign-foot">
          <span className="hold-hint">{ink < 20 ? SIGN.hint : ''}</span>
          {ink > 20 && <button className="btn ghost small" onClick={clear}>CLEAR</button>}
        </div>
      </div>

      <button className="btn primary block" disabled={ink < SIGN.minStroke} onClick={commit}>
        {ink < SIGN.minStroke ? 'KEEP SIGNING' : 'EXECUTE AGREEMENT'}
      </button>
    </div>
  );
}
