import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { MAZE } from '../../data/trials.js';
import { DeliveryCar } from '../art.jsx';
import { sfx } from '../../sound.js';

const GRID = MAZE.grid;
const ROWS = GRID.length;
const COLS = GRID[0].length;

const cellAt = (r, c) => (r < 0 || c < 0 || r >= ROWS || c >= COLS ? '#' : GRID[r][c]);
const findCell = (ch) => {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (GRID[r][c] === ch) return { r, c };
  return { r: 0, c: 0 };
};

export default function T4Maze() {
  const { advance } = useGame();
  const boardRef = useRef(null);
  const dragging = useRef(false);
  const engineAt = useRef(0);
  const start = findCell('S');
  const house = findCell('H');

  // position in cell units (floats), car is a circle of radius CAR_R cells
  const [pos, setPos] = useState({ x: start.c + 0.5, y: start.r + 0.5 });
  const [arrived, setArrived] = useState(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  const CAR_R = 0.3;

  const blocked = (x, y) => {
    // sample the car's bounding box corners against the grid
    for (const [ox, oy] of [[-CAR_R, -CAR_R], [CAR_R, -CAR_R], [-CAR_R, CAR_R], [CAR_R, CAR_R]]) {
      const c = Math.floor(x + ox), r = Math.floor(y + oy);
      if (cellAt(r, c) === '#') return true;
      if (x + ox < 0 || y + oy < 0 || x + ox > COLS || y + oy > ROWS) return true;
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
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const nx = x + (tx - x) * 0.34;
      const ny = y + (ty - y) * 0.34;
      // slide on each axis independently so corridors feel forgiving
      if (!blocked(nx, y)) x = nx;
      if (!blocked(x, ny)) y = ny;
    }
    setPos({ x, y });
    const now = performance.now();
    if (now - engineAt.current > 220) { engineAt.current = now; sfx.engine(); }

    if (Math.floor(y) === house.r && Math.floor(x) === house.c) {
      dragging.current = false;
      setArrived(true);
      sfx.arrive();
      setTimeout(advance, 2100);
    }
  };

  useEffect(() => {
    const stop = () => { dragging.current = false; };
    window.addEventListener('pointerup', stop);
    return () => window.removeEventListener('pointerup', stop);
  }, []);

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{MAZE.title}</div>
        <h2 className="trial-title">{arrived ? MAZE.arrive : MAZE.sub}</h2>
      </header>

      <div
        className="maze-board"
        ref={boardRef}
        style={{ aspectRatio: `${COLS} / ${ROWS}` }}
        onPointerDown={(e) => { dragging.current = true; move(e); }}
        onPointerMove={move}
      >
        {GRID.map((row, r) =>
          row.split('').map((ch, c) => (
            <div
              key={`${r}-${c}`}
              className={'mz ' + (ch === '#' ? 'mz-bldg' : 'mz-road')}
              style={{ left: `${(c / COLS) * 100}%`, top: `${(r / ROWS) * 100}%`, width: `${100 / COLS}%`, height: `${100 / ROWS}%` }}
            >
              {ch === 'S' && <span className="mz-store">STORE</span>}
              {ch === 'H' && <span className="mz-house" />}
            </div>
          ))
        )}
        <div
          className="mz-car"
          style={{ left: `${(pos.x / COLS) * 100}%`, top: `${(pos.y / ROWS) * 100}%` }}
        >
          <DeliveryCar size={Math.max(18, 240 / COLS)} />
        </div>
      </div>

      <div className="slot-msg">{arrived ? '' : MAZE.hint}</div>
    </div>
  );
}
