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
  const sceneRef = useRef(null);
  const wallRef = useRef(null);
  const readyRef = useRef(null);
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
      // gentle drift — it should feel like paper on air, not a target
      // that dodges your thumb
      setPaperPos({ x: 50 + Math.sin(t / 16) * 17, y: 50 + Math.cos(t / 12) * 13 });
    }, 120);
    return () => clearInterval(id);
  }, [phase]);

  // The dart used to mount already at its target, so it teleported.
  // Fly it frame by frame instead: an arc, a little depth, nose forward.
  const flightRaf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(flightRaf.current), []);

  const throwDart = (vx, vy) => {
    const scene = sceneRef.current.getBoundingClientRect();
    const wall = wallRef.current.getBoundingClientRect();
    const ready = readyRef.current.getBoundingClientRect();

    // where the dart leaves from, in scene pixels
    const from = {
      x: ready.left - scene.left + ready.width / 2,
      y: ready.top - scene.top + ready.height / 2,
    };

    // pick the first un-popped balloon along the flick direction
    const len = Math.hypot(vx, vy) || 1;
    const dx = vx / len, dy = vy / len;
    let hit = null, hitT = Infinity;
    for (const b of balloons) {
      if (b.popped) continue;
      const bx = wall.left - scene.left + ((b.x + 6.5) / 100) * wall.width;
      const by = wall.top - scene.top + ((b.y + 9) / 100) * wall.height;
      const px = bx - from.x, py = by - from.y;
      const t = px * dx + py * dy;
      if (t <= 0) continue;
      const perp = Math.abs(px * dy - py * dx);
      if (perp < 46 && t < hitT) { hitT = t; hit = { b, x: bx, y: by }; }
    }

    const to = hit
      ? { x: hit.x, y: hit.y }
      : { x: from.x + dx * 460, y: from.y + dy * 460 };

    sfx.dartThrow();
    const DUR = 400;
    const t0 = performance.now();
    const arc = Math.min(46, Math.hypot(to.x - from.x, to.y - from.y) * 0.16);
    let prev = { ...from };

    const step = (now) => {
      const raw = Math.min(1, (now - t0) / DUR);
      const t = 1 - Math.pow(1 - raw, 2); // ease out — fast off the hand
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t - Math.sin(Math.PI * t) * arc;
      const ang = Math.atan2(y - prev.y, x - prev.x) * (180 / Math.PI) + 90;
      prev = { x, y };
      setFlying({ x, y, rot: ang, scale: 1 - t * 0.3 });
      if (raw < 1) { flightRaf.current = requestAnimationFrame(step); return; }
      land(hit, to, ang);
    };
    flightRaf.current = requestAnimationFrame(step);
  };

  const land = (hit, to, rot) => {
    setFlying(null);
    thrown.current += 1;
    stat('darts', thrown.current);
    if (hit) {
      sfx.balloonPop(hit.b.pitch);
      setBalloons((bs) => bs.map((b) => (b.id === hit.b.id ? { ...b, popped: true } : b)));
      setShreds((s) => [...s, { id: hit.b.id, x: hit.b.x + 6.5, y: hit.b.y + 9, color: hit.b.color }]);
      setTimeout(() => setShreds((s) => s.filter((x) => x.id !== hit.b.id)), 700);
      if (hit.b.id === prizeId) {
        setMsg(DARTS.noteFound);
        sfx.prizeBell();
        setTimeout(() => { sfx.flutter(); setPhase('paper'); }, 750);
      } else {
        setMsg(DARTS.popText[thrown.current % DARTS.popText.length]);
      }
    } else {
      sfx.boardThunk();
      const wall = wallRef.current.getBoundingClientRect();
      const scene = sceneRef.current.getBoundingClientRect();
      setStuck((s) => [...s, {
        x: ((to.x - (wall.left - scene.left)) / wall.width) * 100,
        y: ((to.y - (wall.top - scene.top)) / wall.height) * 100,
        rot,
      }]);
      setMsg(DARTS.missText[thrown.current % DARTS.missText.length]);
    }
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

      <div className="dart-scene" ref={sceneRef} onPointerDown={down} onPointerUp={up} onPointerCancel={() => { aim.current = null; }}>
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

        {flying && (
          <span
            className="dart-flying"
            style={{
              left: flying.x, top: flying.y,
              transform: `translate(-50%,-72%) rotate(${flying.rot}deg) scale(${flying.scale})`,
            }}
          >
            <Dart length={46} />
          </span>
        )}

        <div className="dart-ready" ref={readyRef} style={{ opacity: phase === 'throw' && !flying ? 1 : 0 }}>
          <Dart length={46} />
        </div>
      </div>

      <div className="slot-msg">{phase === 'paper' ? '' : msg || DARTS.hint}</div>
    </div>
  );
}
