import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../../GameContext.jsx';
import { DARTS } from '../../data/trials.js';
import { Dart } from '../art.jsx';
import { sfx } from '../../sound.js';

const COLORS = ['#d0342a', '#1f6ea8', '#3f8a46', '#e0b021', '#8a3fa8', '#d9631e', '#c72d6a'];

function makeBalloons(n) {
  const cols = 5;
  const arr = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    arr.push({
      id: i,
      x: 6 + c * 18 + (r % 2 ? 4 : 0),
      y: 10 + r * 26,
      color: COLORS[(i * 3) % COLORS.length],
      tilt: -8 + ((i * 37) % 16),
      pitch: 0.82 + ((i * 13) % 9) * 0.06,
      popped: false,
    });
  }
  return arr;
}

export default function T3Darts() {
  const { advance, stat } = useGame();
  const wallRef = useRef(null);
  const aim = useRef(null);
  const thrown = useRef(0);

  const [balloons, setBalloons] = useState(() => makeBalloons(DARTS.balloonCount));
  const [prizeId] = useState(() => Math.floor(Math.random() * DARTS.balloonCount));
  const [flying, setFlying] = useState(null);
  const [stuck, setStuck] = useState([]);
  const [shreds, setShreds] = useState([]);
  const [msg, setMsg] = useState('');
  const [phase, setPhase] = useState('throw'); // throw | paper | note
  const [paperPos, setPaperPos] = useState({ x: 50, y: 55 });

  useEffect(() => { sfx.midway(); }, []);

  useEffect(() => {
    if (phase !== 'paper') return;
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      setPaperPos({ x: 50 + Math.sin(t / 9) * 24, y: 50 + Math.cos(t / 6.5) * 18 });
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  const throwDart = (vx, vy) => {
    const wall = wallRef.current.getBoundingClientRect();
    const len = Math.hypot(vx, vy) || 1;
    const dx = vx / len, dy = vy / len;
    const originX = 50, originY = 112;
    let hit = null, hitT = Infinity;
    for (const b of balloons) {
      if (b.popped) continue;
      const bx = b.x + 6.5, by = b.y + 9;
      const px = bx - originX, py = (by - originY) * (wall.height / wall.width);
      const t = px * dx + py * dy;
      if (t <= 0) continue;
      const perp = Math.abs(px * dy - py * dx);
      if (perp < 8 && t < hitT) { hitT = t; hit = b; }
    }

    const target = hit ? { x: hit.x + 6.5, y: hit.y + 9 } : { x: originX + dx * 95, y: originY + dy * 95 };
    setFlying({ ...target, rot: Math.atan2(dy, dx) * (180 / Math.PI) + 90 });
    sfx.dartThrow();

    setTimeout(() => {
      setFlying(null);
      thrown.current += 1;
      stat('darts', thrown.current);
      if (hit) {
        sfx.balloonPop(hit.pitch);
        setBalloons((bs) => bs.map((b) => (b.id === hit.id ? { ...b, popped: true } : b)));
        setShreds((s) => [...s, { id: hit.id, x: hit.x + 6.5, y: hit.y + 9, color: hit.color }]);
        setTimeout(() => setShreds((s) => s.filter((x) => x.id !== hit.id)), 700);
        if (hit.id === prizeId) {
          setMsg(DARTS.noteFound);
          sfx.prizeBell();
          setTimeout(() => { sfx.flutter(); setPhase('paper'); }, 750);
        } else {
          setMsg(DARTS.popText[thrown.current % DARTS.popText.length]);
        }
      } else {
        sfx.boardThunk();
        setStuck((s) => [...s, { ...target, rot: Math.atan2(dy, dx) * (180 / Math.PI) + 90 }]);
        setMsg(DARTS.missText[thrown.current % DARTS.missText.length]);
      }
    }, 300);
  };

  const down = (e) => {
    if (phase !== 'throw' || flying) return;
    aim.current = { x: e.clientX, y: e.clientY };
    sfx.dartReady();
  };
  const up = (e) => {
    if (!aim.current || phase !== 'throw' || flying) return;
    const dx = e.clientX - aim.current.x;
    const dy = e.clientY - aim.current.y;
    aim.current = null;
    if (Math.hypot(dx, dy) < 22) return;
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
        <button className="btn primary block" onClick={() => { sfx.chime(); advance(); }}>{n.ack}</button>
      </div>
    );
  }

  return (
    <div className="trial">
      <header className="trial-head">
        <div className="trial-kicker">{DARTS.title}</div>
        <h2 className="trial-title">{phase === 'paper' ? DARTS.paperHint : DARTS.sub}</h2>
      </header>

      <div className="dart-scene" onPointerDown={down} onPointerUp={up} onPointerCancel={() => { aim.current = null; }}>
        <div className="booth">
          <div className="booth-awning">
            <span className="booth-banner">{DARTS.banner}</span>
          </div>
          <div className="booth-lights">
            {Array.from({ length: 11 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
          </div>

          <div className={'balloon-wall' + (phase === 'paper' ? ' receded' : '')} ref={wallRef}>
            {balloons.map((b) => (
              <span
                key={b.id}
                className={'balloon' + (b.popped ? ' popped' : '')}
                style={{
                  left: `${b.x}%`, top: `${b.y}%`,
                  '--c': b.color, '--tilt': `${b.tilt}deg`,
                }}
              >
                <i className="bl-shine" />
                <i className="bl-knot" />
              </span>
            ))}

            {shreds.map((s) => (
              <span key={'s' + s.id} className="shreds" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                {Array.from({ length: 8 }, (_, i) => (
                  <i key={i} style={{ '--a': `${i * 45}deg`, background: s.color }} />
                ))}
              </span>
            ))}

            {stuck.map((s, i) => (
              <span key={i} className="dart-stuck" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `translate(-50%,-88%) rotate(${s.rot}deg)` }}>
                <Dart length={38} />
              </span>
            ))}
            {flying && (
              <span className="dart-flying" style={{ left: `${flying.x}%`, top: `${flying.y}%`, transform: `translate(-50%,-88%) rotate(${flying.rot}deg)` }}>
                <Dart length={38} />
              </span>
            )}
          </div>

          <div className="booth-rail" />
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

        {phase === 'throw' && (
          <div className="dart-ready"><Dart length={46} /></div>
        )}
      </div>

      <div className="slot-msg">{phase === 'paper' ? '' : msg || DARTS.hint}</div>
    </div>
  );
}
