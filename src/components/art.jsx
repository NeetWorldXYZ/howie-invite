import React from 'react';
import logoUrl from '../assets/howies-logo.png';
import fingerUrl from '../assets/middle-finger.png';
import headUrl from '../assets/howies-head.png';

// Official Hungry Howie's logo, background knocked out.
export function Logo({ width = 150, className = '', style }) {
  return (
    <img
      src={logoUrl}
      alt="Hungry Howie's"
      className={'hh-logo ' + className}
      style={{ width, height: 'auto', ...style }}
      draggable={false}
    />
  );
}

// The jackpot symbol — the real photo, cut out.
export function MiddleFinger({ height = 78 }) {
  return (
    <img
      src={fingerUrl}
      alt="jackpot"
      className="mf-img"
      style={{ height, width: 'auto' }}
      draggable={false}
    />
  );
}

// Reel symbols other than the jackpot — all losers.
export function SlotSymbol({ kind, size = 44 }) {
  const s = { width: size, height: size };
  if (kind === 'CHERRY') {
    return (
      <svg viewBox="0 0 48 48" style={s}>
        <path d="M24 6 C30 14 34 18 36 24" stroke="#4e7a3f" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M24 6 C18 14 15 20 14 28" stroke="#4e7a3f" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="13" cy="34" r="9" fill="#c0281c" stroke="#7a1610" strokeWidth="2.5" />
        <circle cx="35" cy="32" r="9" fill="#c0281c" stroke="#7a1610" strokeWidth="2.5" />
      </svg>
    );
  }
  if (kind === 'SEVEN') {
    return (
      <svg viewBox="0 0 48 48" style={s}>
        <path d="M13 12 H36 L23 40" stroke="#c0281c" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'BAR') {
    return (
      <svg viewBox="0 0 48 48" style={s}>
        <rect x="6" y="17" width="36" height="15" rx="3" fill="#1b1b1f" stroke="#c9a227" strokeWidth="2.5" />
        <text x="24" y="28.5" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fontWeight="700" fill="#edd282">BAR</text>
      </svg>
    );
  }
  if (kind === 'BELL') {
    return (
      <svg viewBox="0 0 48 48" style={s}>
        <path d="M24 8 C33 8 34 18 34 25 C34 30 37 33 37 33 H11 C11 33 14 30 14 25 C14 18 15 8 24 8 Z" fill="#e8bd3a" stroke="#8a6d14" strokeWidth="2.5" />
        <circle cx="24" cy="38" r="4" fill="#e8bd3a" stroke="#8a6d14" strokeWidth="2.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" style={s}>
      <circle cx="24" cy="26" r="14" fill="#eeddb4" stroke="#a8894a" strokeWidth="2.5" />
      <ellipse cx="19" cy="21" rx="4" ry="2.6" fill="#fbf3dd" />
    </svg>
  );
}

// Delivery car from above, with a lit Hungry Howie's roof topper.
export function DeliveryCar({ size = 34, heading = 0 }) {
  return (
    <svg viewBox="0 0 46 74" width={size} height={size * 1.61} style={{ transform: `rotate(${heading}deg)`, transition: 'transform 0.14s ease' }}>
      {/* body */}
      <rect x="3" y="4" width="40" height="66" rx="12" fill="#b8241a" stroke="#590f09" strokeWidth="2.5" />
      <rect x="6" y="8" width="34" height="58" rx="10" fill="none" stroke="rgba(255,180,160,0.35)" strokeWidth="1.4" />
      {/* windshields */}
      <path d="M10 15 h26 l-3 10 h-20 z" fill="#243444" />
      <path d="M7 52 h32 l-3 -9 h-26 z" fill="#243444" />
      {/* roof topper — the branded sign */}
      <g>
        <rect x="6" y="27" width="34" height="15" rx="3.5" fill="#f2c73c" stroke="#7d5c08" strokeWidth="1.6" />
        <rect x="6" y="27" width="34" height="6" rx="3" fill="#c0281c" />
        <text x="23" y="40" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7.5" fontWeight="800" fill="#7d1a10">HOWIE'S</text>
      </g>
      {/* headlights + mirrors */}
      <circle cx="11" cy="7" r="2.4" fill="#fff6d5" />
      <circle cx="35" cy="7" r="2.4" fill="#fff6d5" />
      <rect x="0" y="24" width="4" height="7" rx="2" fill="#8e1a12" />
      <rect x="42" y="24" width="4" height="7" rx="2" fill="#8e1a12" />
    </svg>
  );
}

// A carnival dart: steel tip, barrel, and flights.
export function Dart({ length = 42 }) {
  const w = length * 0.38;
  return (
    <svg viewBox="0 0 22 60" width={w} height={length}>
      <path d="M11 0 L14 12 H8 Z" fill="#cfd4dc" stroke="#767c88" strokeWidth="1" />
      <rect x="7.5" y="11" width="7" height="22" rx="3" fill="#b8241a" stroke="#6d130c" strokeWidth="1.2" />
      <rect x="8.5" y="15" width="5" height="2" fill="rgba(255,255,255,0.4)" />
      <rect x="8.5" y="20" width="5" height="2" fill="rgba(255,255,255,0.4)" />
      <path d="M11 32 L2 48 L11 44 Z" fill="#f2c73c" stroke="#8a6d14" strokeWidth="1.1" />
      <path d="M11 32 L20 48 L11 44 Z" fill="#e8bd3a" stroke="#8a6d14" strokeWidth="1.1" />
      <rect x="10" y="31" width="2" height="20" rx="1" fill="#8a8f99" />
    </svg>
  );
}

// Howie at the gates.
//
// Drawn here rather than shipped as a photo. To use real artwork instead:
// drop it at src/assets/howie-jesus.png, import it, and replace the whole
// <figure> body with <img className="hj-real" src={jesusUrl} alt="" />.
export function HowieJesus({ width = 300 }) {
  return (
    <figure className="hj" style={{ width }}>
      <svg viewBox="0 0 400 560" className="hj-svg" aria-label="Howie at the gates">
        <defs>
          <radialGradient id="hjGlow" cx="50%" cy="30%" r="62%">
            <stop offset="0%" stopColor="#fff8e2" />
            <stop offset="45%" stopColor="#ffeab4" />
            <stop offset="100%" stopColor="#f0d894" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hjRobe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="55%" stopColor="#f6ecd2" />
            <stop offset="100%" stopColor="#e6d5ab" />
          </linearGradient>
          <linearGradient id="hjSash" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4392c" />
            <stop offset="100%" stopColor="#8e1a12" />
          </linearGradient>
          <linearGradient id="hjGate" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2e2ab" />
            <stop offset="100%" stopColor="#c9a227" />
          </linearGradient>
        </defs>

        {/* light behind everything */}
        <circle cx="200" cy="185" r="215" fill="url(#hjGlow)" />

        {/* pearly gates */}
        {[0, 1].map((side) => {
          const x = side ? 262 : 32;
          return (
            <g key={side} opacity="0.85">
              <path
                d={`M${x} 470 L${x} 150 Q${x + 53} 78 ${x + 106} 150 L${x + 106} 470 Z`}
                fill="rgba(255,252,240,0.5)" stroke="url(#hjGate)" strokeWidth="4"
              />
              {[0, 1, 2, 3].map((i) => (
                <line key={i}
                  x1={x + 18 + i * 24} y1={470} x2={x + 18 + i * 24} y2={168}
                  stroke="url(#hjGate)" strokeWidth="2.4" opacity="0.75" />
              ))}
              <circle cx={x + 53} cy={200} r="15" fill="none" stroke="url(#hjGate)" strokeWidth="2.4" opacity="0.8" />
            </g>
          );
        })}

        {/* steps up the middle */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={150 - i * 16} y={392 + i * 20} width={100 + i * 32} height="14"
            rx="3" fill="#fffdf6" opacity={0.5 + i * 0.1} />
        ))}

        {/* robe */}
        <path d="M200 176 L246 196 Q286 300 292 468 L108 468 Q114 300 154 196 Z" fill="url(#hjRobe)" />
        {[168, 186, 204, 222].map((x, i) => (
          <path key={i} d={`M${x + 8} 214 Q${x + 2} 340 ${x - 6} 466`}
            stroke="rgba(180,152,86,0.35)" strokeWidth="2" fill="none" />
        ))}
        {/* sash */}
        <path d="M232 190 L258 202 L176 468 L136 468 Z" fill="url(#hjSash)" />
        {/* rope belt */}
        <path d="M132 372 Q200 392 268 372" stroke="#c9a227" strokeWidth="6" fill="none" strokeLinecap="round" />

        {/* arms, open */}
        <path d="M154 208 Q96 236 58 292 L86 314 Q126 262 168 240 Z" fill="url(#hjRobe)" />
        <path d="M246 208 Q304 236 342 292 L314 314 Q274 262 232 240 Z" fill="url(#hjRobe)" />
        <ellipse cx="66" cy="312" rx="21" ry="17" fill="#f2cba6" transform="rotate(-24 66 312)" />
        <ellipse cx="334" cy="312" rx="21" ry="17" fill="#f2cba6" transform="rotate(24 334 312)" />

        {/* sandals */}
        <ellipse cx="168" cy="474" rx="24" ry="9" fill="#8a5a2a" />
        <ellipse cx="232" cy="474" rx="24" ry="9" fill="#8a5a2a" />

        {/* clouds along the floor */}
        <g fill="#ffffff" opacity="0.96">
          <circle cx="46" cy="486" r="42" /><circle cx="112" cy="500" r="50" />
          <circle cx="196" cy="492" r="44" /><circle cx="286" cy="502" r="52" />
          <circle cx="358" cy="488" r="44" />
          <rect x="0" y="496" width="400" height="64" />
        </g>
      </svg>

      <span className="hj-halo" />
      <img className="hj-head" src={headUrl} alt="" draggable={false} />
    </figure>
  );
}

// The reaction shot. A grainy, pushed-in black and white close-up with
// the caption burned in, the way the gif it stands in for looks.
// The "Get out." reaction shot, built as old film rather than shipping a
// clip. To use the real gif instead: add it at src/assets/get-out.gif,
// import it (  import getOutUrl from '../assets/get-out.gif';  ) and
// render <img className="hdy-real" src={getOutUrl} alt="Get out." /> in
// place of the frame below.
export function HowDareYou() {
  return (
    <div className="hdy">
      <div className="hdy-frame">
        <img className="hdy-face" src={headUrl} alt="" draggable={false} />
        <span className="hdy-grain" />
        <span className="hdy-bar top" />
        <span className="hdy-bar bottom" />
        <span className="hdy-caption">GET OUT.</span>
      </div>
    </div>
  );
}
