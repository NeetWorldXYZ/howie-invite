// ============================================================
// SOUND — small WebAudio synth. No audio assets needed.
// Everything routes through a master gain so mute is instant.
//
// iOS is the whole reason this file has an unlock dance:
//   1. an AudioContext starts suspended until resumed inside a real
//      user gesture, and
//   2. Safari gates WebAudio behind the hardware ringer switch unless
//      a media element is playing, so we keep a silent looping <audio>
//      running to put the page in media-playback mode.
// Both are handled by unlockAudio(), called on the first touch.
// ============================================================

const SILENT_WAV = 'data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

let ctx = null;
let master = null;
let muted = false;
let unlocked = false;
let silentEl = null;

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

// Call from the first user gesture. Safe to call repeatedly.
export function unlockAudio() {
  if (unlocked) return;
  unlocked = true;

  try {
    silentEl = document.createElement('audio');
    silentEl.src = SILENT_WAV;
    silentEl.loop = true;
    silentEl.volume = 0.02;
    silentEl.setAttribute('playsinline', '');
    silentEl.setAttribute('webkit-playsinline', '');
    silentEl.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none';
    document.body.appendChild(silentEl);
    const play = silentEl.play();
    if (play && play.catch) play.catch(() => {});
  } catch { /* no media element available */ }

  const c = ensure();
  if (!c) return;
  c.resume().catch(() => {});
  // Prime with a one-sample source: the very first scheduled sound after
  // a resume is otherwise often swallowed.
  try {
    const buf = c.createBuffer(1, 1, c.sampleRate);
    const src = c.createBufferSource();
    src.buffer = buf;
    src.connect(c.destination);
    src.start(0);
  } catch { /* ignore */ }
}

// iOS suspends the context when the tab is backgrounded.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
  });
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
  if (silentEl) { try { m ? silentEl.pause() : silentEl.play().catch(() => {}); } catch { /* ignore */ } }
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


// A sustained source you can start and stop — used for the reel whir
// and the delivery engine, which need to run for an unknown duration.
function loopNoise({ vol = 0.06, low = 300, high = 2200, wobble = 0 }) {
  const c = ensure();
  if (!c) return { stop() {} };
  const len = Math.floor(c.sampleRate * 0.5);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = (low + high) / 2;
  bp.Q.value = 1.1;
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.05);
  let lfo, lfoGain;
  if (wobble) {
    lfo = c.createOscillator();
    lfo.frequency.value = wobble;
    lfoGain = c.createGain();
    lfoGain.gain.value = (high - low) / 3;
    lfo.connect(lfoGain).connect(bp.frequency);
    lfo.start();
  }
  src.connect(bp).connect(g).connect(master);
  src.start();
  return {
    stop() {
      const t = c.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.07);
      try { src.stop(t + 0.12); lfo && lfo.stop(t + 0.12); } catch { /* already stopped */ }
    },
  };
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
  error() {
    tone({ freq: 220, dur: 0.16, type: 'square', vol: 0.13 });
    tone({ freq: 175, dur: 0.26, type: 'square', vol: 0.13, at: 0.14 });
    noise({ dur: 0.2, vol: 0.06, at: 0.1, low: 150, high: 900 });
  },
  // --- slot machine ---
  reelWhir() { return loopNoise({ vol: 0.05, low: 700, high: 2600, wobble: 26 }); },
  nearMiss() {
    // the two-matching tease: rising ding-ding that resolves nowhere
    tone({ freq: 880, dur: 0.14, type: 'triangle', vol: 0.12 });
    tone({ freq: 1174, dur: 0.16, type: 'triangle', vol: 0.11, at: 0.15 });
    tone({ freq: 740, dur: 0.4, type: 'sine', vol: 0.07, at: 0.34, slide: -180 });
  },
  betMax() {
    tone({ freq: 660, dur: 0.09, type: 'square', vol: 0.1 });
    tone({ freq: 990, dur: 0.13, type: 'square', vol: 0.09, at: 0.08 });
    tone({ freq: 1320, dur: 0.2, type: 'square', vol: 0.08, at: 0.17 });
  },
  jackpotBell() {
    for (let i = 0; i < 9; i++) {
      tone({ freq: 2200, dur: 0.13, type: 'triangle', vol: 0.1, at: i * 0.34 });
      tone({ freq: 3000, dur: 0.1, type: 'sine', vol: 0.06, at: i * 0.34 + 0.02 });
    }
  },
  // --- carnival ---
  midway() {
    // three notes of a calliope, just enough to place you at a fair
    const n = [523, 659, 784, 659, 523];
    n.forEach((f, i) => tone({ freq: f, dur: 0.26, type: 'triangle', vol: 0.05, at: i * 0.17 }));
  },
  curtain() {
    // heavy fabric sweeping open, then a little ta-da underneath
    noise({ dur: 0.9, vol: 0.12, low: 120, high: 900 });
    noise({ dur: 0.7, vol: 0.07, at: 0.15, low: 400, high: 2400 });
    [392, 523, 659, 784].forEach((f, i) => tone({ freq: f, dur: 0.3, type: 'triangle', vol: 0.06, at: 0.5 + i * 0.11 }));
  },
  dartReady() { tone({ freq: 1500, dur: 0.04, type: 'sine', vol: 0.06 }); },
  dartThrow() {
    noise({ dur: 0.22, vol: 0.13, low: 500, high: 4200 });
    tone({ freq: 900, dur: 0.2, type: 'sine', vol: 0.05, slide: 700 });
  },
  boardThunk() {
    tone({ freq: 190, dur: 0.13, type: 'sine', vol: 0.26, slide: -90 });
    noise({ dur: 0.07, vol: 0.16, low: 250, high: 1800 });
    tone({ freq: 1400, dur: 0.05, type: 'sine', vol: 0.05 });
  },
  balloonPop(pitch = 1) {
    noise({ dur: 0.04, vol: 0.55, low: 600 * pitch, high: 9000 });
    tone({ freq: 260 * pitch, dur: 0.13, type: 'sine', vol: 0.3, slide: -170 });
    noise({ dur: 0.16, vol: 0.06, at: 0.03, low: 200, high: 900 });
  },
  prizeBell() {
    tone({ freq: 1568, dur: 0.5, type: 'triangle', vol: 0.13 });
    tone({ freq: 2093, dur: 0.7, type: 'triangle', vol: 0.1, at: 0.1 });
    tone({ freq: 2637, dur: 0.9, type: 'sine', vol: 0.07, at: 0.2 });
  },
  flutter() {
    for (let i = 0; i < 6; i++) {
      noise({ dur: 0.09, vol: 0.06, at: i * 0.11, low: 1400, high: 5200 });
    }
  },
  // --- delivery ---
  engineLoop() { return loopNoise({ vol: 0.045, low: 70, high: 320, wobble: 7 }); },
  turnTick() { tone({ freq: 1100, dur: 0.025, type: 'square', vol: 0.05 }); },
  wallBump() {
    tone({ freq: 120, dur: 0.09, type: 'sine', vol: 0.12, slide: -50 });
    noise({ dur: 0.05, vol: 0.07, low: 150, high: 900 });
  },
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
  // --- maze ---
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
  // --- the reveal ---
  waxCrack() {
    noise({ dur: 0.05, vol: 0.34, low: 700, high: 5200 });
    tone({ freq: 240, dur: 0.16, type: 'square', vol: 0.16, slide: -150 });
    for (let i = 0; i < 5; i++) {
      noise({ dur: 0.05, vol: 0.07, at: 0.06 + i * 0.05, low: 900, high: 4200 });
    }
  },
  flapOpen() {
    noise({ dur: 0.42, vol: 0.1, low: 900, high: 4600 });
    tone({ freq: 180, dur: 0.3, type: 'sine', vol: 0.05, slide: 60 });
  },
  cardSlide() {
    noise({ dur: 0.62, vol: 0.11, low: 1300, high: 5600 });
    tone({ freq: 320, dur: 0.5, type: 'sine', vol: 0.04, slide: 220 });
  },
  // --- the key ---
  swap() { noise({ dur: 0.07, vol: 0.09, low: 400, high: 2200 }); },
  keyJingle() {
    tone({ freq: 2100, dur: 0.09, type: 'triangle', vol: 0.11 });
    tone({ freq: 2800, dur: 0.12, type: 'triangle', vol: 0.09, at: 0.07 });
    tone({ freq: 2400, dur: 0.2, type: 'sine', vol: 0.07, at: 0.15 });
  },
  chestOpen() {
    tone({ freq: 130, dur: 0.7, type: 'sawtooth', vol: 0.06, slide: 90 });
    noise({ dur: 0.6, vol: 0.07, low: 250, high: 1400 });
    for (let i = 0; i < 5; i++) tone({ freq: 1400 + i * 320, dur: 0.5, type: 'sine', vol: 0.05, at: 0.4 + i * 0.07 });
  },
  // --- clock out and the call ---
  punchClock() {
    noise({ dur: 0.05, vol: 0.3, low: 200, high: 1600 });
    tone({ freq: 150, dur: 0.14, type: 'square', vol: 0.2, slide: -70 });
    tone({ freq: 900, dur: 0.1, type: 'sine', vol: 0.08, at: 0.1 });
  },
  countBeep() { tone({ freq: 700, dur: 0.13, type: 'square', vol: 0.11 }); },
  phoneRing() {
    // classic two-tone bell, on a repeating cadence, until picked up
    const c = ensure();
    if (!c) return { stop() {} };
    let live = true;
    const burst = () => {
      if (!live) return;
      for (let r = 0; r < 2; r++) {
        for (let i = 0; i < 12; i++) {
          const at = r * 0.42 + i * 0.03;
          tone({ freq: i % 2 ? 1050 : 800, dur: 0.03, type: 'square', vol: 0.09, at });
        }
      }
      setTimeout(burst, 2400);
    };
    burst();
    return { stop() { live = false; } };
  },
  pickUp() {
    noise({ dur: 0.06, vol: 0.16, low: 300, high: 2000 });
    tone({ freq: 420, dur: 0.08, type: 'square', vol: 0.08 });
  },
  dial() {
    const n = [941, 1336, 697, 1209, 852, 1477];
    n.forEach((f, i) => tone({ freq: f, dur: 0.09, type: 'sine', vol: 0.08, at: i * 0.13 }));
  },
  heaven() {
    const chord = [523, 659, 784, 1047, 1319];
    chord.forEach((f, i) => {
      tone({ freq: f, dur: 2.6, type: 'sine', vol: 0.09, at: i * 0.14 });
      tone({ freq: f * 2, dur: 2, type: 'sine', vol: 0.035, at: i * 0.14 });
    });
    for (let i = 0; i < 14; i++) noise({ dur: 0.09, vol: 0.03, at: 0.7 + i * 0.11, low: 4000, high: 9000 });
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
