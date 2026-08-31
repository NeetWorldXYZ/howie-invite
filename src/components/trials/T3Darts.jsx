import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { DARTS } from '../../data/trials.js';
import { sfx } from '../../sound.js';

const COLORS = ['#c0281c', '#1f6ea8', '#4e7a3f', '#c9a227', '#8a3fa8', '#c85a1e'];

function makeBalloons(n) {
  const cols = 4;
  const arr = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    arr.push({
      id: i,
      x: 3.5 + c * 25.2 + (r % 2 ? 2 : 0),
      y: 13 + r * 25,
      color: COLORS[i % COLORS.length],
      popped: false,
    });
  }
  return arr;
}

export default function T3Darts() {
  const { advance, stat } = useGame();
  const wallRef = useRef(null);
  const aim = useRef(null);
  const throwCount = useRef(0);

  const [balloons, setBalloons] = useState(() => makeBalloons(DARTS.balloonCount));
  const [prizeId] = useState(() => Math.floor(Math.random() * DARTS.balloonCount));
  const [dart, setDart] = useState(null);       // in-flight dart
  const [stuck, setStuck] = useState([]);       // darts stuck in the board
  const [msg, setMsg] = useState('');
  const [phase, setPhase] = useState('throw');  // throw | paper | note
  const [paperPos, setPaperPos] = useState({ x: 50, y: 60 });

  // paper drifts until touched
  useEffect(() => {
    if (phase !== 'paper') return;
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setPaperPos({ x: 50 + Math.sin(t / 9) * 22, y: 52 + Math.cos(t / 7) * 16 });
    }, 90);
    return () => clearInterval(id);
  }, [phase]);

  const throwDart = (vx, vy) => {
    const wall = wallRef.current.getBoundingClientRect();
    // normalize the flick into a direction, then find the first balloon near that ray
    const len = Math.hypot(vx, vy) || 1;
    const dx = vx / len, dy = vy / len;
    const originX = 50, originY = 104; // % coords, dart starts below the wall
    let hit = null, hitT = Infinity;
    for (const b of balloons) {
      if (b.popped) continue;
      // ray/point distance in percentage space (wall aspect corrected)
      const bx = b.x + 7.5, by = b.y + 9;
      const px = bx - originX, py = (by - originY) * (wall.height / wall.width);
      const t = px * dx + py * dy;
      if (t <= 0) continue;
      const perp = Math.abs(px * dy - py * dx);
      if (perp < 9 && t < hitT) { hitT = t; hit = b; }
    }

    const target = hit ? { x: hit.x + 7.5, y: hit.y + 9 } : { x: originX + dx * 90, y: originY + dy * 90 };
    setDart({ ...target, flying: true });
    sfx.whoosh();

    setTimeout(() => {
      setDart(null);
      throwCount.current += 1;
      stat('darts', throwCount.current);
      if (hit) {
        sfx.balloonPop();
        setBalloons((bs) => bs.map((b) => (b.id === hit.id ? { ...b, popped: true } : b)));
        if (hit.id === prizeId) {
          setMsg(DARTS.noteFound);
          setTimeout(() => setPhase('paper'), 700);
        } else {
          setMsg('');
        }
      } else {
        sfx.thunk();
        setStuck((s) => [...s, target]);
        setMsg(DARTS.missText[throwCount.current % DARTS.missText.length]);
      }
    }, 320);
  };

  const down = (e) => {
    if (phase !== 'throw' || dart) return;
    aim.current = { x: e.clientX, y: e.clientY };
  };
  const up = (e) => {
    if (!aim.current || phase !== 'throw' || dart) return;
    const dx = e.clientX - aim.current.x;
    const dy = e.clientY - aim.current.y;
    aim.current = null;
    if (Math.hypot(dx, dy) < 24) return; // not a throw
    throwDart(dx, dy);
  };

  if (phase === 'note') {
    const n = DARTS.note;
    return (
      <div className="trial">
        <header className="trial-head">
          <div className="trial-kicker">{DARTS.title}</div>
        </header>
        <div className="record-note">
          <div className="rn-head">{n.heading}</div>
          <div className="rn-rule" />
          <div className="rn-names">{n.names}</div>
          <div className="rn-title">{n.title}</div>
          <div className="rn-rule" />
          <p className="rn-detail">{n.detail}</p>
        </div>
        <button className="btn primary block" onClick={() => { sfx.chime(); advance(); }}>
          {n.ack}
        </button>
      </div>
    );
  }

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{DARTS.title}</div>
        <h2 className="trial-title">{phase === 'paper' ? DARTS.paperHint : DARTS.sub}</h2>
      </header>

      <div
        className="dart-scene"
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => { aim.current = null; }}
      >
        <div className={'balloon-wall' + (phase === 'paper' ? ' receded' : '')} ref={wallRef}>
          {balloons.map((b) => (
            <span
              key={b.id}
              className={'balloon' + (b.popped ? ' popped' : '')}
              style={{ left: `${b.x}%`, top: `${b.y}%`, background: b.color, '--c': b.color }}
            />
          ))}
          {stuck.map((s, i) => (
            <span key={i} className="dart stuck" style={{ left: `${s.x}%`, top: `${s.y}%` }} />
          ))}
          {dart && <span className="dart flying" style={{ left: `${dart.x}%`, top: `${dart.y}%` }} />}
        </div>

        {phase === 'paper' && (
          <button
            className="prize-paper"
            style={{ left: `${paperPos.x}%`, top: `${paperPos.y}%` }}
            onClick={(e) => { e.stopPropagation(); sfx.paper(); setPhase('note'); }}
          >
            <span />
          </button>
        )}

        {phase === 'throw' && <div className="dart-ready"><span className="dart" /></div>}
      </div>

      <div className="slot-msg">{phase === 'paper' ? '' : msg || DARTS.hint}</div>
    </div>
  );
}
