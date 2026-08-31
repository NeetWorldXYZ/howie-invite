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
  error() {
    tone({ freq: 220, dur: 0.16, type: 'square', vol: 0.12 });
    tone({ freq: 185, dur: 0.22, type: 'square', vol: 0.12, at: 0.14 });
  },
  deny() { tone({ freq: 140, dur: 0.3, type: 'sawtooth', vol: 0.1, slide: -50 }); },
  register() {
    tone({ freq: 1567, dur: 0.07, type: 'square', vol: 0.1 });
    tone({ freq: 2093, dur: 0.12, type: 'square', vol: 0.08, at: 0.07 });
    noise({ dur: 0.25, vol: 0.1, at: 0.16, low: 200, high: 900 });
  },
  printer() {
    // dot-matrix order printer
    for (let i = 0; i < 9; i++) {
      noise({ dur: 0.05, vol: 0.12, at: i * 0.09, low: 2000, high: 6500 });
      tone({ freq: 120, dur: 0.05, type: 'sawtooth', vol: 0.05, at: i * 0.09 });
    }
  },
  scale() { tone({ freq: 2400, dur: 0.05, type: 'sine', vol: 0.07 }); },
  splat() {
    noise({ dur: 0.12, vol: 0.18, low: 150, high: 700 });
  },
  punch() {
    noise({ dur: 0.06, vol: 0.25, low: 300, high: 1200 });
    tone({ freq: 70, dur: 0.15, type: 'sine', vol: 0.3 });
  },
  phone() {
    tone({ freq: 440, dur: 0.35, vol: 0.08 });
    tone({ freq: 480, dur: 0.35, vol: 0.08 });
  },
  send() {
    tone({ freq: 700, dur: 0.08, vol: 0.09 });
    tone({ freq: 1050, dur: 0.12, vol: 0.09, at: 0.08 });
  },
  alarm() {
    tone({ freq: 2800, dur: 0.1, type: 'square', vol: 0.06 });
    tone({ freq: 2800, dur: 0.1, type: 'square', vol: 0.06, at: 0.2 });
  },
};
