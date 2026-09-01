import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { MAZE } from '../../data/trials.js';
import { DeliveryCar, Logo } from '../art.jsx';
import { sfx } from '../../sound.js';

const GRID = MAZE.grid;
const ROWS = GRID.length;
const COLS = GRID[0].length;
const VIEW_COLS = 6.4;      // how much map is on screen at once
const SPEED = 4.6;          // cells per second
const TURN_WINDOW = 0.22;   // how close to a junction a queued turn still takes

const isOpen = (r, c) => !(r < 0 || c < 0 || r >= ROWS || c >= COLS || GRID[r][c] === '#');
const find = (ch) => {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (GRID[r][c] === ch) return { r, c };
  return { r: 1, c: 1 };
};

// Steering, not dragging. The car drives itself; you swipe a direction and
// it takes that turn at the next junction where it is available. The camera
// follows, so the map never has to fit on screen.
export default function T4Maze() {
  const { advance } = useGame();
  const start = find('S');
  const house = find('H');

  const viewRef = useRef(null);
  const raf = useRef(0);
  const last = useRef(0);
  const engine = useRef(null);
  const swipe = useRef(null);
  const bumpAt = useRef(0);

  const car = useRef({ x: start.c + 0.5, y: start.r + 0.5, dx: 0, dy: 0 });
  const want = useRef(null);
  const trailRef = useRef([{ x: start.c + 0.5, y: start.r + 0.5 }]);

  const [, force] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [moving, setMoving] = useState(false);

  useEffect(() => {
    if (arrived) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [arrived]);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    engine.current?.stop();
  }, []);

  // ---- the drive loop ----
  useEffect(() => {
    const tick = (now) => {
      const dt = Math.min(0.05, (now - (last.current || now)) / 1000);
      last.current = now;
      const c = car.current;

      // take a queued turn when close enough to a junction
      const cx = Math.floor(c.x) + 0.5;
      const cy = Math.floor(c.y) + 0.5;
      const w = want.current;
      if (w && (w.dx !== c.dx || w.dy !== c.dy)) {
        const near = Math.hypot(c.x - cx, c.y - cy) < TURN_WINDOW;
        if (near && isOpen(Math.floor(cy) + w.dy, Math.floor(cx) + w.dx)) {
          pushCorner(cx, cy);
          c.x = cx; c.y = cy; c.dx = w.dx; c.dy = w.dy;
          want.current = null;
          sfx.turnTick();
        }
      }

      if (c.dx || c.dy) {
        const step = SPEED * dt;
        let nx = c.x + c.dx * step;
        let ny = c.y + c.dy * step;
        // stop cleanly at a wall instead of tunnelling through it
        const leadR = Math.floor(ny + c.dy * 0.5);
        const leadC = Math.floor(nx + c.dx * 0.5);
        if (!isOpen(leadR, leadC)) {
          nx = Math.floor(c.x) + 0.5;
          ny = Math.floor(c.y) + 0.5;
          pushCorner(nx, ny);
          c.dx = 0; c.dy = 0;
          setMoving(false);
          engine.current?.stop(); engine.current = null;
          if (now - bumpAt.current > 300) { bumpAt.current = now; sfx.wallBump(); }
        }
        c.x = nx; c.y = ny;
        pushTrail(c);

        if (Math.floor(c.y) === house.r && Math.floor(c.x) === house.c && !arrived) {
          c.dx = 0; c.dy = 0;
          engine.current?.stop(); engine.current = null;
          setArrived(true);
          sfx.arrive();
          setTimeout(advance, 1900);
          return;
        }
      }

      force((n) => n + 1);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrived]);

  const pushTrail = (c) => {
    const t = trailRef.current;
    const l = t[t.length - 1];
    if (Math.hypot(c.x - l.x, c.y - l.y) > 0.14) t.push({ x: c.x, y: c.y });
  };

  // Corners must be recorded exactly. The distance filter above would drop
  // a junction that sits too close to the previous point, and the polyline
  // would then cut the corner — drawing a diagonal across a building.
  const pushCorner = (x, y) => {
    const t = trailRef.current;
    const l = t[t.length - 1];
    if (l.x !== x || l.y !== y) t.push({ x, y });
  };

  // ---- swipe to steer ----
  const steer = (dx, dy) => {
    if (arrived) return;
    want.current = { dx, dy };
    const c = car.current;
    if (!c.dx && !c.dy) {
      // standing still: go now if that way is open
      if (isOpen(Math.floor(c.y) + dy, Math.floor(c.x) + dx)) {
        c.dx = dx; c.dy = dy;
        want.current = null;
      }
    }
    if ((c.dx || c.dy) && !engine.current) engine.current = sfx.engineLoop();
    if (c.dx || c.dy) setMoving(true);
  };

  const down = (e) => { swipe.current = { x: e.clientX, y: e.clientY }; };
  const up = (e) => {
    if (!swipe.current) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    swipe.current = null;
    if (Math.hypot(dx, dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) steer(Math.sign(dx), 0);
    else steer(0, Math.sign(dy));
  };

  const c = car.current;
  const cell = 100 / VIEW_COLS;                       // % of viewport width per cell
  const camX = 50 - c.x * cell;                       // keep the car centred
  const view = viewRef.current?.getBoundingClientRect();
  const cellPx = view ? view.width / VIEW_COLS : 56;
  const camYpx = (view ? view.height / 2 : 190) - c.y * cellPx;

  const heading = c.dx || c.dy
    ? Math.atan2(c.dy, c.dx) * (180 / Math.PI) + 90
    : 180;

  // compass to the customer
  const toHouse = Math.atan2((house.r + 0.5) - c.y, (house.c + 0.5) - c.x) * (180 / Math.PI) + 90;
  const dist = Math.hypot((house.c + 0.5) - c.x, (house.r + 0.5) - c.y);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const late = elapsed > 90;

  return (
    <div className="trial maze-trial">
      <div className="run-hud">
        <Logo width={58} />
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
        className="drive-view"
        ref={viewRef}
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => { swipe.current = null; }}
      >
        <div
          className="drive-map"
          style={{
            width: `${COLS * cell}%`,
            transform: `translate(${camX}%, ${camYpx}px)`,
          }}
        >
          {GRID.map((row, r) =>
            row.split('').map((ch, cc) => (
              <div
                key={`${r}-${cc}`}
                className={'mz ' + (ch === '#' ? 'mz-bldg' : 'mz-road')}
                style={{
                  left: `${(cc / COLS) * 100}%`, top: `${(r / ROWS) * 100}%`,
                  width: `${100 / COLS}%`, height: `${100 / ROWS}%`,
                }}
              >
                {ch === '#' && <i className="mz-roof" style={{ '--s': (r * 7 + cc * 13) % 5 }} />}
                {ch === 'S' && <span className="mz-store">HH</span>}
                {ch === 'H' && <span className="mz-house" />}
              </div>
            ))
          )}

          <svg className="mz-trail" viewBox={`0 0 ${COLS} ${ROWS}`} preserveAspectRatio="none">
            <polyline
              points={trailRef.current.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none" stroke="#edd282" strokeWidth="0.13"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.7"
            />
            <polyline
              points={trailRef.current.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none" stroke="#fff6d5" strokeWidth="0.05"
              strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.16 0.2"
            />
          </svg>

          <div
            className="mz-car"
            style={{ left: `${(c.x / COLS) * 100}%`, top: `${(c.y / ROWS) * 100}%` }}
          >
            <DeliveryCar size={cellPx * 0.62} heading={heading} />
          </div>
        </div>

        {/* where the customer is, when they're off screen */}
        {!arrived && (
          <div className="drive-compass">
            <i style={{ transform: `rotate(${toHouse}deg)` }} />
            <b>{(dist * 0.04).toFixed(2)} MI</b>
          </div>
        )}

        {!moving && !arrived && (
          <div className="drive-cue">{MAZE.hint}</div>
        )}
      </div>

      <div className="slot-msg">
        {arrived ? MAZE.arrive : late ? MAZE.lateNote : MAZE.sub}
      </div>
    </div>
  );
}
