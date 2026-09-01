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
// STAND-IN. To use the real artwork instead: drop the file at
// src/assets/howie-jesus.png, import it here, and replace this whole
// <figure> body with a single <img className="hj-real" src={...} />.
export function HowieJesus({ width = 260 }) {
  return (
    <figure className="hj" style={{ width }}>
      <span className="hj-rays" />
      <span className="hj-gate l" />
      <span className="hj-gate r" />
      <span className="hj-halo" />
      <img className="hj-head" src={headUrl} alt="" draggable={false} />
    </figure>
  );
}
