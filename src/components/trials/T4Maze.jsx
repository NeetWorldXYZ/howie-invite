import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { MAZE } from '../../data/trials.js';
import { DeliveryCar, Logo } from '../art.jsx';
import { sfx } from '../../sound.js';

const GRID = MAZE.grid;
const ROWS = GRID.length;
const COLS = GRID[0].length;
const CAR_R = 0.26;

const cellAt = (r, c) => (r < 0 || c < 0 || r >= ROWS || c >= COLS ? '#' : GRID[r][c]);
const find = (ch) => {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (GRID[r][c] === ch) return { r, c };
  return { r: 1, c: 1 };
};

export default function T4Maze() {
  const { advance } = useGame();
  const boardRef = useRef(null);
  const dragging = useRef(false);
  const engine = useRef(null);
  const bumpAt = useRef(0);
  const start = find('S');
  const house = find('H');

  const [pos, setPos] = useState({ x: start.c + 0.5, y: start.r + 0.5 });
  const [heading, setHeading] = useState(180);
  const [trail, setTrail] = useState([{ x: start.c + 0.5, y: start.r + 0.5 }]);
  const [arrived, setArrived] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const posRef = useRef(pos);
  posRef.current = pos;

  // count-up clock, purely for atmosphere
  useEffect(() => {
    if (arrived) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [arrived]);

  const stopEngine = () => { engine.current?.stop(); engine.current = null; };
  useEffect(() => stopEngine, []);

  const blocked = (x, y) => {
    for (const [ox, oy] of [[-CAR_R, -CAR_R], [CAR_R, -CAR_R], [-CAR_R, CAR_R], [CAR_R, CAR_R]]) {
      if (cellAt(Math.floor(y + oy), Math.floor(x + ox)) === '#') return true;
    }
    return false;
  };

  const move = (e) => {
    if (!dragging.current || arrived) return;
    e.preventDefault();
    const b = boardRef.current.getBoundingClientRect();
    const tx = ((e.clientX - b.left) / b.width) * COLS;
    const ty = ((e.clientY - b.top) / b.height) * ROWS;
    let { x, y } = posRef.current;
    const from = { x, y };
    let hitWall = false;
    for (let i = 0; i < 8; i++) {
      const nx = x + (tx - x) * 0.3;
      const ny = y + (ty - y) * 0.3;
      if (!blocked(nx, y)) x = nx; else hitWall = true;
      if (!blocked(x, ny)) y = ny; else hitWall = true;
    }
    const dx = x - from.x, dy = y - from.y;
    const moved = Math.hypot(dx, dy);
    if (moved > 0.004) {
      setPos({ x, y });
      setHeading(Math.atan2(dy, dx) * (180 / Math.PI) + 90);
      setTrail((t) => {
        const last = t[t.length - 1];
        return Math.hypot(x - last.x, y - last.y) > 0.22 ? [...t, { x, y }] : t;
      });
    }
    const now = performance.now();
    if (hitWall && moved < 0.01 && now - bumpAt.current > 320) { bumpAt.current = now; sfx.wallBump(); }

    if (Math.floor(y) === house.r && Math.floor(x) === house.c) {
      dragging.current = false;
      stopEngine();
      setArrived(true);
      sfx.arrive();
      setTimeout(advance, 1900);
    }
  };

  const startDrag = (e) => {
    if (arrived) return;
    dragging.current = true;
    if (!engine.current) engine.current = sfx.engineLoop();
    move(e);
  };
  const endDrag = () => { dragging.current = false; stopEngine(); };

  useEffect(() => {
    window.addEventListener('pointerup', endDrag);
    return () => window.removeEventListener('pointerup', endDrag);
  }, []);

  const pct = (v, n) => `${(v / n) * 100}%`;
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const late = elapsed > 90;

  return (
    <div className="trial maze-trial">
      {/* driver's order slip — this is what makes it read as a delivery run */}
      <div className="run-hud">
        <Logo width={64} />
        <div className="run-order">
          <div className="run-num">ORDER {MAZE.order.num}</div>
          <div className="run-items">{MAZE.order.items}</div>
          <div className="run-addr">{MAZE.order.addr}</div>
        </div>
        <div className={'run-clock' + (late ? ' late' : '')}>
          <span>{mm}:{ss}</span>
          <small>{MAZE.promise}</small>
        </div>
      </div>

      <div
        className="maze-board"
        ref={boardRef}
        style={{ aspectRatio: `${COLS} / ${ROWS}` }}
        onPointerDown={startDrag}
        onPointerMove={move}
      >
        {GRID.map((row, r) =>
          row.split('').map((ch, c) => (
            <div
              key={`${r}-${c}`}
              className={'mz ' + (ch === '#' ? 'mz-bldg' : 'mz-road')}
              style={{ left: pct(c, COLS), top: pct(r, ROWS), width: pct(1, COLS), height: pct(1, ROWS) }}
            >
              {ch === '#' && <i className="mz-roof" style={{ '--s': (r * 7 + c * 13) % 5 }} />}
              {ch === 'S' && <span className="mz-store">HH</span>}
              {ch === 'H' && <span className="mz-house" />}
            </div>
          ))
        )}

        {/* the route, drawn as you drive it */}
        <svg className="mz-trail" viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none">
          <polyline
            points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#edd282"
            strokeWidth="0.13"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
          <polyline
            points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#fff6d5"
            strokeWidth="0.05"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0.16 0.2"
          />
        </svg>

        <div className="mz-car" style={{ left: pct(pos.x, COLS), top: pct(pos.y, ROWS) }}>
          <DeliveryCar size={Math.max(17, 300 / COLS)} heading={heading} />
        </div>
      </div>

      <div className="slot-msg">
        {arrived ? MAZE.arrive : late ? MAZE.lateNote : MAZE.hint}
      </div>
    </div>
  );
}
