import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { SCRATCH } from '../../data/trials.js';
import { sfx } from '../../sound.js';

// Canvas foil you rub off with your finger. Tracks how much is gone.
export default function T1Scratch() {
  const { advance, stat } = useGame();
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPt = useRef(null);
  const scratchSound = useRef(0);
  const [pct, setPct] = useState(0);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const cv = canvasRef.current;
    const rect = cv.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = rect.width * dpr;
    cv.height = rect.height * dpr;
    const ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    // brushed gold foil
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, '#8a6d14');
    g.addColorStop(0.22, '#d8b545');
    g.addColorStop(0.4, '#f4e3a1');
    g.addColorStop(0.58, '#c39b23');
    g.addColorStop(0.8, '#8a6d14');
    g.addColorStop(1, '#b28d1e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    // foil grain
    ctx.globalAlpha = 0.09;
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#4a3a08';
      const y = Math.random() * rect.height;
      ctx.fillRect(0, y, rect.width, Math.random() * 1.4);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(60,45,5,0.55)';
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', rect.width / 2, rect.height / 2 - 6);
    ctx.fillText('· · · · · · · ·', rect.width / 2, rect.height / 2 + 12);
  }, []);

  const measure = () => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
    let clear = 0;
    // sample every 40th pixel for speed
    for (let i = 3; i < data.length; i += 160) {
      if (data[i] < 40) clear++;
    }
    const total = data.length / 160;
    const p = clear / total;
    setPct(p);
    stat('scratchPct', p);
    if (p >= SCRATCH.threshold && !won) {
      setWon(true);
      sfx.chime();
    }
  };

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPt.current = pos(e);
    scrape(e);
  };

  const scrape = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = pos(e);
    const l = lastPt.current || p;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPt.current = p;
    const now = performance.now();
    if (now - scratchSound.current > 90) {
      scratchSound.current = now;
      sfx.scrape();
    }
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPt.current = null;
    measure();
  };

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{SCRATCH.title}</div>
        <h2 className="trial-title">{won ? SCRATCH.winText : SCRATCH.sub}</h2>
      </header>

      <div className="ticket-card">
        <div className="ticket-top">
          <span>{SCRATCH.ticketLabel}</span>
          <span>{SCRATCH.serial}</span>
        </div>
        <div className="scratch-area">
          <div className="scratch-under">
            {SCRATCH.symbols.map((s, i) => (
              <div className="scratch-sym" key={i}>
                <div className="sym-mark" />
                <span>{s}</span>
              </div>
            ))}
          </div>
          <canvas
            ref={canvasRef}
            className={'scratch-canvas' + (won ? ' cleared' : '')}
            onPointerDown={start}
            onPointerMove={scrape}
            onPointerUp={end}
            onPointerLeave={end}
            onPointerCancel={end}
          />
        </div>
        <div className="ticket-bottom">
          {won ? 'VALIDATED' : `FOIL REMOVED: ${Math.round(pct * 100)}%`}
        </div>
      </div>

      {won && (
        <div className="fine-print">
          {SCRATCH.finePrint.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}

      {won && (
        <button className="btn primary block" onClick={() => { sfx.tap(); advance(); }}>
          {SCRATCH.cta}
        </button>
      )}
    </div>
  );
}
