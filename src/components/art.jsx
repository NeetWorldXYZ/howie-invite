import React from 'react';
import logoUrl from '../assets/howies-logo.png';

// Official Hungry Howie's logo, background knocked out.
export function Logo({ width = 150, className = '', style }) {
  return (
    <img
      src={logoUrl}
      alt="Hungry Howie's"
      className={'hh-logo ' + className}
      width={width}
      style={{ width, height: 'auto', ...style }}
      draggable={false}
    />
  );
}

// The jackpot symbol. Drawn, not an emoji, so it looks the same everywhere.
export function MiddleFinger({ size = 46 }) {
  return (
    <svg viewBox="0 0 64 100" width={size} height={size * 1.56} aria-label="jackpot">
      <g stroke="#3a2412" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">
        <rect x="24" y="4" width="17" height="50" rx="8.5" fill="#f2cba6" />
        <rect x="4" y="56" width="17" height="26" rx="8.5" fill="#e8bb92" transform="rotate(-16 12 69)" />
        <rect x="11" y="46" width="44" height="46" rx="15" fill="#f2cba6" />
        <rect x="15" y="52" width="14" height="13" rx="6.5" fill="#e0b087" />
        <rect x="31" y="51" width="14" height="13" rx="6.5" fill="#e0b087" />
        <rect x="45" y="54" width="13" height="13" rx="6.5" fill="#e0b087" />
        <rect x="16" y="66" width="14" height="12" rx="6" fill="#e0b087" />
      </g>
    </svg>
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
  // DOUGH
  return (
    <svg viewBox="0 0 48 48" style={s}>
      <circle cx="24" cy="26" r="14" fill="#eeddb4" stroke="#a8894a" strokeWidth="2.5" />
      <ellipse cx="19" cy="21" rx="4" ry="2.6" fill="#fbf3dd" />
    </svg>
  );
}

// The delivery car, seen from above, with a lit car-topper.
export function DeliveryCar({ size = 30 }) {
  return (
    <svg viewBox="0 0 40 60" width={size} height={size * 1.5}>
      <rect x="4" y="6" width="32" height="50" rx="9" fill="#c0281c" stroke="#5e120c" strokeWidth="2.5" />
      <rect x="9" y="12" width="22" height="12" rx="4" fill="#2b3a48" />
      <rect x="9" y="36" width="22" height="11" rx="4" fill="#2b3a48" />
      <rect x="7" y="26" width="26" height="9" rx="3" fill="#edd282" stroke="#8a6d14" strokeWidth="1.6" />
      <circle cx="12" cy="9" r="2.4" fill="#fff6d5" />
      <circle cx="28" cy="9" r="2.4" fill="#fff6d5" />
    </svg>
  );
}
