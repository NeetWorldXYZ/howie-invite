// ============================================================
// SOUND — small WebAudio synth. No audio assets needed.
// Everything routes through a master gain so mute is instant.
// ============================================================

let ctx = null;
let master = null;
let muted = false;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
}

function tone({ freq = 440, dur = 0.1, type = 'sine', vol = 0.3, at = 0, slide = 0 }) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.2, vol = 0.15, at = 0, low = 400, high = 4000 }) {
  const c = ensure();
  if (!c) return;
  const t0 = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = (low + high) / 2;
  bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp).connect(g).connect(master);
  src.start(t0);
}

export const sfx = {
  scrape() { noise({ dur: 0.09, vol: 0.09, low: 900, high: 5200 }); },
  hiss() { noise({ dur: 0.14, vol: 0.05, low: 2200, high: 7000 }); },
  pop() {
    noise({ dur: 0.05, vol: 0.5, low: 400, high: 8000 });
    tone({ freq: 180, dur: 0.22, type: 'sine', vol: 0.4, slide: -110 });
    for (let i = 0; i < 5; i++) noise({ dur: 0.1, vol: 0.06, at: 0.06 + i * 0.04, low: 1200, high: 6000 });
  },
  click() { tone({ freq: 1500, dur: 0.022, type: 'square', vol: 0.07 }); },
  // --- slot machine ---
  lever() {
    for (let i = 0; i < 7; i++) noise({ dur: 0.03, vol: 0.09, at: i * 0.035, low: 1500, high: 5000 });
    tone({ freq: 150, dur: 0.16, type: 'sawtooth', vol: 0.12, at: 0.24, slide: -60 });
  },
  reelStop() {
    noise({ dur: 0.05, vol: 0.2, low: 200, high: 1400 });
    tone({ freq: 210, dur: 0.11, type: 'square', vol: 0.13, slide: -80 });
  },
  jackpot() {
    // siren sweep + a cascade of coins
    for (let i = 0; i < 6; i++) {
      tone({ freq: 660, dur: 0.26, type: 'square', vol: 0.09, at: i * 0.28, slide: 520 });
    }
    for (let i = 0; i < 26; i++) {
      const at = 0.15 + i * 0.075;
      tone({ freq: 1600 + Math.random() * 900, dur: 0.09, type: 'triangle', vol: 0.09, at });
      noise({ dur: 0.05, vol: 0.06, at, low: 3000, high: 8000 });
    }
  },
  // --- pizza ---
  spread() { noise({ dur: 0.1, vol: 0.07, low: 200, high: 1100 }); },
  sprinkle() { noise({ dur: 0.06, vol: 0.05, low: 2500, high: 7500 }); },
  slap() {
    noise({ dur: 0.07, vol: 0.16, low: 250, high: 1600 });
    tone({ freq: 130, dur: 0.08, type: 'sine', vol: 0.12, slide: -50 });
  },
  // --- darts ---
  whoosh() { noise({ dur: 0.16, vol: 0.1, low: 700, high: 3600 }); },
  thunk() {
    tone({ freq: 160, dur: 0.1, type: 'sine', vol: 0.22, slide: -70 });
    noise({ dur: 0.05, vol: 0.12, low: 300, high: 1600 });
  },
  balloonPop() {
    noise({ dur: 0.045, vol: 0.5, low: 500, high: 9000 });
    tone({ freq: 240, dur: 0.14, type: 'sine', vol: 0.3, slide: -150 });
  },
  // --- maze ---
  engine() { tone({ freq: 88 + Math.random() * 14, dur: 0.14, type: 'sawtooth', vol: 0.045 }); },
  arrive() {
    tone({ freq: 520, dur: 0.14, vol: 0.12 });
    tone({ freq: 780, dur: 0.22, vol: 0.1, at: 0.12 });
  },
  // --- door ---
  knock() {
    noise({ dur: 0.06, vol: 0.34, low: 120, high: 900 });
    tone({ freq: 105, dur: 0.13, type: 'sine', vol: 0.26, slide: -40 });
  },
  latch() {
    noise({ dur: 0.04, vol: 0.16, low: 900, high: 4000 });
    tone({ freq: 300, dur: 0.07, type: 'square', vol: 0.09 });
  },
  doorOpen() {
    tone({ freq: 240, dur: 1.1, type: 'sawtooth', vol: 0.05, slide: 160 });
    noise({ dur: 0.9, vol: 0.05, low: 200, high: 1200 });
  },
  shimmer() {
    for (let i = 0; i < 9; i++) {
      tone({ freq: 1200 + i * 260, dur: 0.5, type: 'sine', vol: 0.05, at: i * 0.055 });
    }
  },
  fanfare() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      tone({ freq: f, dur: 0.7, type: 'triangle', vol: 0.13, at: i * 0.11 });
      tone({ freq: f * 2, dur: 0.5, type: 'sine', vol: 0.05, at: i * 0.11 });
    });
    for (let i = 0; i < 18; i++) {
      noise({ dur: 0.07, vol: 0.05, at: 0.5 + i * 0.09, low: 3000, high: 9000 });
    }
  },
  tap() { tone({ freq: 1800, dur: 0.03, type: 'square', vol: 0.06 }); },
  paper() { noise({ dur: 0.18, vol: 0.08, low: 1500, high: 6000 }); },
  chime() {
    tone({ freq: 880, dur: 0.5, vol: 0.12 });
    tone({ freq: 1320, dur: 0.7, vol: 0.1, at: 0.09 });
    tone({ freq: 1760, dur: 0.9, vol: 0.07, at: 0.18 });
  },
  seal() {
    noise({ dur: 0.12, vol: 0.2, low: 100, high: 500 });
    tone({ freq: 90, dur: 0.25, type: 'sine', vol: 0.35, slide: -40 });
    tone({ freq: 660, dur: 0.9, vol: 0.08, at: 0.15 });
    tone({ freq: 990, dur: 1.1, vol: 0.06, at: 0.25 });
  },
  beep() { tone({ freq: 1040, dur: 0.09, type: 'square', vol: 0.1 }); },
  deny() { tone({ freq: 140, dur: 0.3, type: 'sawtooth', vol: 0.1, slide: -50 }); },
  printer() {
    // dot-matrix order printer
    for (let i = 0; i < 9; i++) {
      noise({ dur: 0.05, vol: 0.12, at: i * 0.09, low: 2000, high: 6500 });
      tone({ freq: 120, dur: 0.05, type: 'sawtooth', vol: 0.05, at: i * 0.09 });
    }
  },
  scale() { tone({ freq: 2400, dur: 0.05, type: 'sine', vol: 0.07 }); },
  punch() {
    noise({ dur: 0.06, vol: 0.25, low: 300, high: 1200 });
    tone({ freq: 70, dur: 0.15, type: 'sine', vol: 0.3 });
  },
};
